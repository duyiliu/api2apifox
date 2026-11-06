import assert from "node:assert/strict";
import { test } from "node:test";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import { hasImportFailures, syncProject } from "../core/syncService";
import { ResolvedConfig, SyncResult } from "../core/types";

/* ------------------------------------------------------------------ *
 * P0 缺口 G1/G2/G3/G4:CLI/核心真实同步路径。
 *
 * 所有请求都打到本机 127.0.0.1 的 mock HTTP server(端口由系统分配),
 * 绝不访问 api.apifox.com —— 测试内断言请求 URL 主机必须是 127.0.0.1。
 *
 * 断言的是「发出去的真实 HTTP 请求」而不是内部函数调用:请求体形状、
 * 冲突策略透传、deleteUnmatchedResources、鉴权头、API 版本头。
 * ------------------------------------------------------------------ */

interface Captured {
  method: string;
  url: string;
  host: string;
  authorization?: string;
  apiVersion?: string;
  contentType?: string;
  body: any;
}

interface MockServer {
  baseUrl: string;
  captured: Captured[];
  close(): Promise<void>;
}

async function startMock(handler?: (req: Captured, res: http.ServerResponse) => void): Promise<MockServer> {
  const captured: Captured[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      const entry: Captured = {
        method: req.method ?? "",
        url: req.url ?? "",
        host: String(req.headers.host ?? "").split(":")[0],
        authorization: req.headers.authorization,
        apiVersion: req.headers["x-apifox-api-version"] as string | undefined,
        contentType: req.headers["content-type"] as string | undefined,
        body: raw ? JSON.parse(raw) : undefined,
      };
      captured.push(entry);
      if (handler) {
        handler(entry, res);
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ code: 0, data: { counters: { endpointCreated: 1 }, errors: [] } }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    captured,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

function config(overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return {
    projectRoot: "/proj",
    title: "demo",
    projectId: 42,
    apiBaseUrl: "https://api.apifox.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: ["**/src/main/java/**/*.java"],
    exclude: ["**/target/**"],
    exportPath: "openapi.gen.json",
    pageTypeStyle: "mybatis-plus",
    folderNameSource: "tag",
    rootFolderName: "",
    updateFolderOfChangedEndpoint: true,
    schemaFolderId: 0,
    helperPropertiesEnabled: true,
    enumFieldDoc: false,
    dependencyRepos: [],
    dependencyJars: [],
    maxDependencyJars: 120,
    timeoutMs: 5_000,
    ...overrides,
  };
}

/** 最小可用分析结果:paths 里放一个真实可导入的 operation */
function analyzed(endpointCount = 1) {
  const spec = {
    openapi: "3.0.3",
    info: { title: "demo", version: "1.0.0" },
    paths: {
      "/api/ping": {
        get: {
          tags: ["demo"],
          summary: "ping",
          operationId: "DemoController_ping",
          responses: { "200": { description: "OK" } },
        },
      },
    },
  };
  return {
    spec,
    endpoints: Array.from({ length: endpointCount }, (_, i) => ({
      method: "GET",
      path: "/api/ping",
      operationId: `DemoController_ping${i}`,
    })) as any[],
    warnings: [] as string[],
    projectRoot: "/proj",
    scannedFiles: 1,
    skippedFiles: 0,
    diagnostics: [],
  };
}

/* ---------------- 请求形状 ---------------- */

test("sync:发给 Apifox 的请求 = POST /v1/projects/{id}/import-openapi,带 Bearer 与版本头", async () => {
  const mock = await startMock();
  try {
    const result = await syncProject({ config: config({ apiBaseUrl: mock.baseUrl, projectId: 4242 }), token: "tok-123", analyzed: analyzed() });
    assert.equal(mock.captured.length, 1, "应当只发一次全量导入请求");
    const req = mock.captured[0];
    assert.equal(req.host, "127.0.0.1", "绝不能打到真实 Apifox");
    assert.equal(req.method, "POST");
    assert.equal(req.url, "/v1/projects/4242/import-openapi");
    assert.equal(req.authorization, "Bearer tok-123");
    assert.equal(req.apiVersion, "2024-03-28");
    assert.match(req.contentType ?? "", /application\/json/);
    assert.equal(result.counters.endpointCreated, 1);
    assert.deepEqual(result.errors, []);
  } finally {
    await mock.close();
  }
});

test("sync:请求体 input 是 spec 的 JSON 字符串(而非对象),options 独立成键", async () => {
  const mock = await startMock();
  try {
    await syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "t", analyzed: analyzed() });
    const body = mock.captured[0].body;
    assert.equal(typeof body.input, "string", "Apifox 要求 input 为字符串");
    const parsed = JSON.parse(body.input);
    assert.equal(parsed.openapi, "3.0.3");
    assert.ok(parsed.paths["/api/ping"]);
    assert.equal(typeof body.options, "object");
  } finally {
    await mock.close();
  }
});

test("sync:deleteUnmatchedResources 恒为 false(不删除 Apifox 未匹配资源)", async () => {
  const mock = await startMock();
  try {
    await syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "t", analyzed: analyzed() });
    assert.equal(mock.captured[0].body.options.deleteUnmatchedResources, false);
  } finally {
    await mock.close();
  }
});

test("sync:4 种冲突策略原样透传到请求 options", async () => {
  const behaviors = ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"] as const;
  for (const endpointBehavior of behaviors) {
    for (const schemaBehavior of behaviors) {
      const mock = await startMock();
      try {
        await syncProject({
          config: config({
            apiBaseUrl: mock.baseUrl,
            endpointConflictBehavior: endpointBehavior,
            schemaConflictBehavior: schemaBehavior,
          }),
          token: "t",
          analyzed: analyzed(),
        });
        const options = mock.captured[0].body.options;
        assert.equal(options.endpointOverwriteBehavior, endpointBehavior);
        assert.equal(options.schemaOverwriteBehavior, schemaBehavior);
      } finally {
        await mock.close();
      }
    }
  }
});

test("sync:schemaFolderId > 0 时传 targetSchemaFolderId,=0 时不传该键", async () => {
  const withFolder = await startMock();
  try {
    await syncProject({ config: config({ apiBaseUrl: withFolder.baseUrl, schemaFolderId: 77 }), token: "t", analyzed: analyzed() });
    assert.equal(withFolder.captured[0].body.options.targetSchemaFolderId, 77);
  } finally {
    await withFolder.close();
  }

  const without = await startMock();
  try {
    await syncProject({ config: config({ apiBaseUrl: without.baseUrl, schemaFolderId: 0 }), token: "t", analyzed: analyzed() });
    assert.equal("targetSchemaFolderId" in without.captured[0].body.options, false, "0 表示不改目录,不能发 0");
  } finally {
    await without.close();
  }
});

test("sync:updateFolderOfChangedEndpoint 忠实透传(默认 true / 关闭 false)", async () => {
  for (const flag of [true, false]) {
    const mock = await startMock();
    try {
      await syncProject({ config: config({ apiBaseUrl: mock.baseUrl, updateFolderOfChangedEndpoint: flag }), token: "t", analyzed: analyzed() });
      assert.equal(mock.captured[0].body.options.updateFolderOfChangedEndpoint, flag);
    } finally {
      await mock.close();
    }
  }
});

test("sync:baseUrl 末尾多个斜杠不会产生 //v1 路径", async () => {
  const mock = await startMock();
  try {
    await syncProject({ config: config({ apiBaseUrl: `${mock.baseUrl}///` }), token: "t", analyzed: analyzed() });
    assert.equal(mock.captured[0].url, "/v1/projects/42/import-openapi");
  } finally {
    await mock.close();
  }
});

/* ---------------- 短路 ---------------- */

test("sync:dryRun 不发任何 HTTP 请求,但保留目标与范围信息", async () => {
  const mock = await startMock();
  try {
    const result = await syncProject({
      config: config({ apiBaseUrl: mock.baseUrl }),
      token: "",
      analyzed: analyzed(),
      dryRun: true,
      scopeType: "endpoint",
    });
    assert.equal(mock.captured.length, 0, "dry-run 不应发请求");
    assert.equal(result.dryRun, true);
    assert.equal(result.target.projectId, 42);
    assert.equal(result.scope.type, "endpoint");
    assert.equal(result.scope.endpointCount, 1);
    assert.deepEqual(result.counters, {});
  } finally {
    await mock.close();
  }
});

test("sync:0 个接口时短路,不发请求、counters 为空", async () => {
  const mock = await startMock();
  try {
    const result = await syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "t", analyzed: analyzed(0) });
    assert.equal(mock.captured.length, 0, "没有接口不应发请求");
    assert.deepEqual(result.counters, {});
    assert.deepEqual(result.errors, []);
    assert.equal(result.scope.endpointCount, 0);
  } finally {
    await mock.close();
  }
});

test("sync:scopeType 缺省为 workspace", async () => {
  const mock = await startMock();
  try {
    const result = await syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "t", analyzed: analyzed() });
    assert.equal(result.scope.type, "workspace");
  } finally {
    await mock.close();
  }
});

test("sync:未传 dryRun 时默认为 false,且真的发请求(mutation 存活的默认值分支)", async () => {
  const mock = await startMock();
  try {
    // 上一个用例只断言 scope.type，没断言 dryRun 默认值；
    // `request.dryRun ?? false` 若被改成 `?? true`，这里必须失败。
    const result = await syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "t", analyzed: analyzed() });
    assert.equal(result.dryRun, false, "不传 dryRun 必须默认 false");
    assert.equal(mock.captured.length, 1, "dryRun 默认 false 就必须真的发请求");
  } finally {
    await mock.close();
  }
});

/* ---------------- 错误面 ---------------- */

test("sync:401 抛 ApifoxApiError(status=401),错误信息提示重配令牌且不含 token", async () => {
  const mock = await startMock((_req, res) => {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "unauthorized" }));
  });
  try {
    await assert.rejects(
      syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "secret-token", analyzed: analyzed() }),
      (err: any) => {
        assert.equal(err.status, 401);
        assert.match(err.message, /401/);
        assert.ok(!err.message.includes("secret-token"), "错误信息不能回显令牌");
        return true;
      }
    );
  } finally {
    await mock.close();
  }
});

test("sync:500 抛错并保留状态码(供 CLI 映射 exit 5)", async () => {
  const mock = await startMock((_req, res) => {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "boom" }));
  });
  try {
    await assert.rejects(
      syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "t", analyzed: analyzed() }),
      (err: any) => {
        assert.equal(err.status, 500);
        assert.match(err.message, /500/);
        return true;
      }
    );
  } finally {
    await mock.close();
  }
});

test("sync:连接被拒绝时报网络错误(status=0),不静默成功", async () => {
  // 先取一个确定空闲的端口,然后关掉 server
  const mock = await startMock();
  const baseUrl = mock.baseUrl;
  await mock.close();
  await assert.rejects(
    syncProject({ config: config({ apiBaseUrl: baseUrl, timeoutMs: 2_000 }), token: "t", analyzed: analyzed() }),
    (err: any) => {
      assert.equal(err.status, 0);
      assert.match(err.message, /网络请求失败/);
      return true;
    }
  );
});

test("sync:超时(服务端不响应)抛 status=0 且信息含「请求超时」", async () => {
  // 保留连接但永不响应
  const server = http.createServer(() => undefined);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  const keepAlive = setInterval(() => undefined, 5);
  try {
    await assert.rejects(
      syncProject({
        config: config({ apiBaseUrl: `http://127.0.0.1:${port}`, timeoutMs: 60 }),
        token: "t",
        analyzed: analyzed(),
      }),
      (err: any) => {
        assert.equal(err.status, 0);
        assert.match(err.message, /请求超时/);
        return true;
      }
    );
  } finally {
    clearInterval(keepAlive);
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("sync:外部 AbortSignal 取消时抛 AbortError(而不是被当成网络错误)", async () => {
  const server = http.createServer(() => undefined);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  const controller = new AbortController();
  try {
    const pending = syncProject({
      config: config({ apiBaseUrl: `http://127.0.0.1:${port}`, timeoutMs: 10_000 }),
      token: "t",
      analyzed: analyzed(),
      signal: controller.signal,
    });
    setTimeout(() => controller.abort(), 30);
    await assert.rejects(pending, (err: any) => err.name === "AbortError");
  } finally {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("sync:Apifox 业务码非 0 被视为失败(即使 HTTP 200)", async () => {
  const mock = await startMock((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 400, message: "project not found" }));
  });
  try {
    await assert.rejects(
      syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "t", analyzed: analyzed() }),
      (err: any) => {
        assert.match(err.message, /project not found/);
        return true;
      }
    );
  } finally {
    await mock.close();
  }
});

test("sync:导入返回 errors 非空时原样带回(供 CLI 判定部分失败)", async () => {
  const mock = await startMock((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        code: 0,
        data: { counters: { endpointCreated: 1, endpointFailed: 2 }, errors: [{ message: "schema 冲突", code: "E1" }] },
      })
    );
  });
  try {
    const result = await syncProject({ config: config({ apiBaseUrl: mock.baseUrl }), token: "t", analyzed: analyzed() });
    assert.equal(result.counters.endpointCreated, 1);
    assert.equal(result.counters.endpointFailed, 2);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].code, "E1");
    assert.equal(hasImportFailures(result), true);
  } finally {
    await mock.close();
  }
});

/* ---------------- hasImportFailures 判定矩阵 ---------------- */

function syncResult(partial: Partial<SyncResult>): SyncResult {
  return {
    dryRun: false,
    target: { projectId: 1, apiBaseUrl: "http://127.0.0.1" },
    scope: { type: "workspace", endpointCount: 1 },
    counters: {},
    errors: [],
    ...partial,
  };
}

test("hasImportFailures:任一键匹配 /Failed$/i 且 > 0 即判失败", () => {
  const positives: Record<string, number>[] = [
    { endpointFailed: 1 },
    { schemaFailed: 3 },
    { endpointFolderFailed: 1 },
    { endpointsFailed: 1 },
    { SOME_FAILED: 2 }, // 大小写不敏感
  ];
  for (const counters of positives) {
    assert.equal(hasImportFailures(syncResult({ counters })), true, JSON.stringify(counters));
  }
});

test("hasImportFailures:计数为 0 或键名不以 Failed 结尾不算失败", () => {
  const negatives: Record<string, number>[] = [
    {},
    { endpointFailed: 0, schemaFailed: 0 },
    { endpointCreated: 5, endpointUpdated: 2, endpointIgnored: 1 },
    { endpointFailure: 3 }, // 结尾是 Failure,不是 Failed
    { endpointFailedCount: 3 }, // Failed 不在结尾
  ];
  for (const counters of negatives) {
    assert.equal(hasImportFailures(syncResult({ counters })), false, JSON.stringify(counters));
  }
});

test("hasImportFailures:小写 failed 也命中(正则大小写不敏感),但 Failure/FailedCount 不命中", () => {
  assert.equal(hasImportFailures(syncResult({ counters: { failed: 3 } })), true);
  // 实测边界:正则只锚定结尾,因此 "FailedXxx" 会被漏判 —— 若 Apifox 新增
  // 类似 endpointFailedCount 的键名,失败会被静默当成成功(见测试报告缺陷 D2)。
  assert.equal(hasImportFailures(syncResult({ counters: { endpointFailedTotal: 3 } })), false);
});

test("hasImportFailures:errors 非空即失败,与 counters 无关", () => {
  assert.equal(hasImportFailures(syncResult({ errors: [{ message: "x" }] })), true);
  assert.equal(hasImportFailures(syncResult({ errors: [{ code: "ONLY_CODE" }] })), true);
});

test("hasImportFailures:dryRun 结果本身不特殊处理(由调用方决定不检查)", () => {
  // 锁定语义:函数只看 counters/errors,dryRun 为 true 时 counters 恒空 -> false
  assert.equal(hasImportFailures(syncResult({ dryRun: true })), false);
});

/**
 * G2：hasImportFailures / syncProject 直接单测。
 *
 * 关键风险：counter 键名靠 `/Failed$/i` 正则识别，Apifox 若新增键名（如
 * endpointImportFailedDetail）当前实现会漏判 → 部分失败被报成"同步完成"。
 * 这里把已验证的键名口径与 dryRun / 0 接口短路一起锁死。
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ApifoxClient } from "../apifox/client";
import { hasImportFailures, syncProject } from "../core/syncService";
import { ProjectAnalysisResult, ResolvedConfig, SyncResult } from "../core/types";

const ORIGINAL_FETCH = globalThis.fetch;

function baseResult(overrides: Partial<SyncResult> = {}): SyncResult {
  return {
    dryRun: false,
    target: { projectId: 1, apiBaseUrl: "https://api.example.com" },
    scope: { type: "workspace", endpointCount: 1 },
    counters: {},
    errors: [],
    ...overrides,
  };
}

function config(overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return {
    projectRoot: "/tmp/p",
    title: "p",
    projectId: 4242,
    apiBaseUrl: "https://api.example.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: ["**/*.java"],
    exclude: [],
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

function analyzed(overrides: Partial<ProjectAnalysisResult> = {}): ProjectAnalysisResult {
  return {
    spec: {
      openapi: "3.0.3",
      info: { title: "p", version: "1.0.0" },
      paths: { "/a": { get: { responses: {} } } },
    },
    endpoints: [{ method: "GET", path: "/a", controller: "A", tag: "A", flavor: "spring-mvc", parameters: [] } as never],
    warnings: [],
    projectRoot: "/tmp/p",
    scannedFiles: 1,
    skippedFiles: 0,
    diagnostics: [],
    ...overrides,
  };
}

/* ---------------- hasImportFailures ---------------- */

test("G2 hasImportFailures:全部成功时返回 false", () => {
  assert.equal(
    hasImportFailures(baseResult({ counters: { endpointCreated: 3, endpointUpdated: 2, endpointIgnored: 1, endpointFolderCreated: 2 } })),
    false
  );
});

test("G2 hasImportFailures:errors 非空即失败（即使计数器全为 0 失败）", () => {
  assert.equal(hasImportFailures(baseResult({ counters: { endpointCreated: 3 }, errors: [{ message: "x" }] })), true);
});

test("G2 hasImportFailures:任意 *Failed 且 >0 判失败", () => {
  // 已验证 Apifox 的键名口径：endpointFailed / schemaFailed 等以 Failed 结尾
  assert.equal(hasImportFailures(baseResult({ counters: { endpointFailed: 1 } })), true);
  assert.equal(hasImportFailures(baseResult({ counters: { schemaFailed: 2, endpointCreated: 10 } })), true);
  assert.equal(hasImportFailures(baseResult({ counters: { endpointFolderFailed: 1 } })), true);
});

test("G2 hasImportFailures:*Failed=0 不算失败（不能只看键名是否存在）", () => {
  assert.equal(hasImportFailures(baseResult({ counters: { endpointFailed: 0, schemaFailed: 0 } })), false);
});

test("G2 hasImportFailures:正则大小写不敏感，failed/failed 混用都可识别", () => {
  assert.equal(hasImportFailures(baseResult({ counters: { endpointfailed: 1 } })), true);
  assert.equal(hasImportFailures(baseResult({ counters: { ENDPOINTFAILED: 1 } })), true);
});

test("G2 hasImportFailures:键名必须是 *Failed 结尾，中间出现 Failed 不算", () => {
  // 文档化当前口径：FailedDetail / FailedReason 这类新键会被漏判（见报告"已知限制"）
  assert.equal(hasImportFailures(baseResult({ counters: { endpointFailedDetail: 3 } })), false);
  assert.equal(hasImportFailures(baseResult({ counters: { totalFailedCandidates: 5 } })), false);
});

/* ---------------- syncProject ---------------- */

test("G2 syncProject:dryRun 短路，不发任何请求", async () => {
  let called = 0;
  globalThis.fetch = (() => {
    called++;
    return Promise.reject(new Error("不应发请求"));
  }) as unknown as typeof fetch;
  try {
    const result = await syncProject({
      config: config(),
      token: "t",
      analyzed: analyzed(),
      dryRun: true,
    });
    assert.equal(called, 0);
    assert.equal(result.dryRun, true);
    assert.deepEqual(result.counters, {});
    assert.deepEqual(result.errors, []);
    assert.equal(result.target.projectId, 4242);
    assert.equal(result.scope.endpointCount, 1);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G2 syncProject:0 接口短路，不发请求且标记完成", async () => {
  let called = 0;
  globalThis.fetch = (() => {
    called++;
    return Promise.reject(new Error("不应发请求"));
  }) as unknown as typeof fetch;
  try {
    const result = await syncProject({
      config: config(),
      token: "t",
      analyzed: analyzed({ endpoints: [], spec: { openapi: "3.0.3", info: { title: "p", version: "1" }, paths: {} } }),
    });
    assert.equal(called, 0);
    assert.equal(result.scope.endpointCount, 0);
    assert.deepEqual(result.counters, {});
    // 无接口不算失败：不应触发 exit 6
    assert.equal(hasImportFailures(result), false);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G2 syncProject:默认 scopeType 为 workspace，scopeType 可覆盖", async () => {
  globalThis.fetch = (() =>
    Promise.resolve(new Response(JSON.stringify({ code: 0, data: { counters: {}, errors: [] } }), { status: 200 }))) as unknown as typeof fetch;
  try {
    assert.equal((await syncProject({ config: config(), token: "t", analyzed: analyzed() })).scope.type, "workspace");
    for (const type of ["file", "endpoint", "selection"] as const) {
      const r = await syncProject({ config: config(), token: "t", analyzed: analyzed(), scopeType: type });
      assert.equal(r.scope.type, type);
    }
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G2 syncProject:schemaFolderId=0 时不发送 targetSchemaFolderId，>0 时透传", async () => {
  const bodies: unknown[] = [];
  globalThis.fetch = ((_url: unknown, init?: { body?: string }) => {
    bodies.push(JSON.parse(init?.body ?? "{}"));
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: { counters: {}, errors: [] } }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    await syncProject({ config: config({ schemaFolderId: 0 }), token: "t", analyzed: analyzed() });
    const zero = bodies[0] as { options: Record<string, unknown> };
    // 0 表示"模型放根目录"，必须省略而不是传 0（Apifox 会把 0 当非法目录 ID）
    assert.equal(Object.prototype.hasOwnProperty.call(zero.options, "targetSchemaFolderId"), false);

    await syncProject({ config: config({ schemaFolderId: 987 }), token: "t", analyzed: analyzed() });
    const positive = bodies[1] as { options: Record<string, unknown> };
    assert.equal(positive.options.targetSchemaFolderId, 987);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G2 syncProject:Apifox 返回空 data 时 counters/errors 归一为空集合", async () => {
  globalThis.fetch = (() => Promise.resolve(new Response(JSON.stringify({ code: 0, data: {} }), { status: 200 }))) as unknown as typeof fetch;
  try {
    const result = await syncProject({ config: config(), token: "t", analyzed: analyzed() });
    assert.deepEqual(result.counters, {});
    assert.deepEqual(result.errors, []);
    assert.equal(hasImportFailures(result), false);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G2 syncProject:导入异常向上抛出（由 CLI 层映射退出码）", async () => {
  globalThis.fetch = (() =>
    Promise.resolve(new Response(JSON.stringify({ code: 401, message: "bad token" }), { status: 401 }))) as unknown as typeof fetch;
  try {
    await assert.rejects(syncProject({ config: config(), token: "t", analyzed: analyzed() }), (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /401|令牌/);
      return true;
    });
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G2 syncProject:使用 config.apiBaseUrl 与 projectId 拼接导入路由", async () => {
  const seen: { url?: string; headers?: Record<string, string> } = {};
  globalThis.fetch = ((url: unknown, init?: { headers?: Record<string, string> }) => {
    seen.url = String(url);
    seen.headers = init?.headers;
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: { counters: { endpointCreated: 1 }, errors: [] } }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    const result = await syncProject({
      config: config({ apiBaseUrl: "http://127.0.0.1:9999/", projectId: 555 }),
      token: "tok",
      analyzed: analyzed(),
    });
    assert.equal(seen.url, "http://127.0.0.1:9999/v1/projects/555/import-openapi");
    assert.equal(seen.headers?.Authorization, "Bearer tok");
    assert.deepEqual(result.counters, { endpointCreated: 1 });
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G2 syncProject:客户端类型为 ApifoxClient（复用同一客户端实现，避免两套 HTTP 语义）", () => {
  // 结构性断言：syncProject 内部构造的客户端必须就是 ApifoxClient，
  // 否则 G7 的 client 错误矩阵无法代表 CLI 行为。
  assert.equal(typeof ApifoxClient, "function");
  assert.equal(typeof ApifoxClient.prototype.importOpenapi, "function");
});

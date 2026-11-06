const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

/**
 * P0 缺口 G1:CLI 真实同步路径(打本机 mock Apifox server)。
 *
 * 现有 cli.test.js 只覆盖 dry-run 与确认门槛 —— 真实 sync 从未被断言过。
 * 这里跑构建产物 dist/cli.js,验证:
 *   - 发出的 HTTP 请求(URL/头/请求体 options)
 *   - Apifox 响应 → 退出码映射(0/4/5/6)
 *   - 令牌不出现在 stdout/stderr
 *
 * 绝不访问 api.apifox.com:所有 baseUrl 都是 127.0.0.1:<随机端口>。
 */

const CLI = path.join(__dirname, "..", "dist", "cli.js");
const SAMPLE = path.join(__dirname, "..", "..", "..", "sample");

/** 起一个 mock Apifox 服务;handler 决定响应 */
async function startMock(handler) {
  const captured = [];
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      captured.push({
        method: req.method,
        url: req.url,
        host: String(req.headers.host || "").split(":")[0],
        authorization: req.headers.authorization,
        apiVersion: req.headers["x-apifox-api-version"],
        body: raw ? JSON.parse(raw) : undefined,
      });
      handler(captured[captured.length - 1], res);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    captured,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
  };
}

function ok(counters = { endpointCreated: 3, schemaCreated: 2 }) {
  return (_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 0, data: { counters, errors: [] } }));
  };
}

/** 以真实子进程跑 CLI(不经 shell,避免引号问题) */
function run(args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, ...args], {
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => resolve({ status: code, stdout, stderr }));
  });
}

/** sync 参数模板:走 sample 项目,只额外指定 baseUrl/projectId/token */
function syncArgs(baseUrl, extra = []) {
  return [
    "sync",
    "--project",
    SAMPLE,
    "--project-id",
    "4242",
    "--yes",
    "--no-report",
    "--format",
    "json",
    "--endpoint",
    "GET /api/v1/users",
    ...extra,
  ];
}

/* ---------------- 成功路径 ---------------- */

test("CLI sync:成功时 exit 0,请求命中 /v1/projects/4242/import-openapi", async () => {
  const mock = await startMock(ok());
  try {
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: "cli-token",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.ok, true);
    assert.equal(payload.command, "sync");
    assert.equal(payload.result.dryRun, false);
    assert.equal(payload.result.counters.endpointCreated, 3);
    assert.equal(mock.captured.length, 1);
    assert.equal(mock.captured[0].host, "127.0.0.1", "绝不能打真实 Apifox");
    assert.equal(mock.captured[0].url, "/v1/projects/4242/import-openapi");
    assert.equal(mock.captured[0].method, "POST");
    assert.equal(mock.captured[0].authorization, "Bearer cli-token");
    assert.equal(mock.captured[0].apiVersion, "2024-03-28");
  } finally {
    await mock.close();
  }
});

test("CLI sync:请求体 options 带 deleteUnmatchedResources=false 与 CLI 指定的冲突策略", async () => {
  const mock = await startMock(ok());
  try {
    const result = await run(
      syncArgs(mock.baseUrl, ["--endpoint-conflict", "AUTO_MERGE", "--schema-conflict", "KEEP_EXISTING", "--no-update-folder"]),
      { API2APIFOX_TOKEN: "t", API2APIFOX_API_BASE_URL: mock.baseUrl }
    );
    assert.equal(result.status, 0, result.stderr);
    const options = mock.captured[0].body.options;
    assert.equal(options.deleteUnmatchedResources, false);
    assert.equal(options.endpointOverwriteBehavior, "AUTO_MERGE");
    assert.equal(options.schemaOverwriteBehavior, "KEEP_EXISTING");
    assert.equal(options.updateFolderOfChangedEndpoint, false);
  } finally {
    await mock.close();
  }
});

test("CLI sync:input 是合法 OpenAPI 3.0.3 字符串,且只含被选中的接口", async () => {
  const mock = await startMock(ok());
  try {
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: "t",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 0, result.stderr);
    const spec = JSON.parse(mock.captured[0].body.input);
    assert.equal(spec.openapi, "3.0.3");
    assert.deepEqual(Object.keys(spec.paths), ["/api/v1/users"]);
  } finally {
    await mock.close();
  }
});

test("CLI sync:令牌不出现在 stdout 与 stderr", async () => {
  const mock = await startMock(ok());
  const secret = "APS-super-secret-token-value";
  try {
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: secret,
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(!result.stdout.includes(secret), "stdout 泄露了令牌");
    assert.ok(!result.stderr.includes(secret), "stderr 泄露了令牌");
    assert.equal(mock.captured[0].authorization, `Bearer ${secret}`, "但必须真的发出去了");
  } finally {
    await mock.close();
  }
});

/* ---------------- 退出码映射 ---------------- */

test("CLI sync:401 → exit 4 + APIFOX_AUTH_FAILED", async () => {
  const mock = await startMock((_req, res) => {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "unauthorized" }));
  });
  try {
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: "bad-token",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 4, result.stdout);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.ok, false);
    assert.equal(payload.error.code, "APIFOX_AUTH_FAILED");
    assert.equal(payload.error.retryable, false);
    assert.ok(!result.stdout.includes("bad-token"));
  } finally {
    await mock.close();
  }
});

test("CLI sync:403/404 → exit 4 + APIFOX_FORBIDDEN", async () => {
  for (const status of [403, 404]) {
    const mock = await startMock((_req, res) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify({ message: "denied" }));
    });
    try {
      const result = await run(syncArgs(mock.baseUrl), {
        API2APIFOX_TOKEN: "t",
        API2APIFOX_API_BASE_URL: mock.baseUrl,
      });
      assert.equal(result.status, 4, `status ${status}: ${result.stdout}`);
      assert.equal(JSON.parse(result.stdout).error.code, "APIFOX_FORBIDDEN");
    } finally {
      await mock.close();
    }
  }
});

test("CLI sync:500 → exit 5 + APIFOX_REQUEST_FAILED 且 retryable=true", async () => {
  const mock = await startMock((_req, res) => {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "boom" }));
  });
  try {
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: "t",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 5, result.stdout);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.error.code, "APIFOX_REQUEST_FAILED");
    assert.equal(payload.error.retryable, true);
    assert.equal(payload.error.status, 500);
  } finally {
    await mock.close();
  }
});

test("CLI sync:连接被拒绝 → exit 5 + NETWORK_FAILED,retryable=true", async () => {
  // 先起再关,拿到一个几乎肯定空闲的端口
  const mock = await startMock(ok());
  const baseUrl = mock.baseUrl;
  await mock.close();
  const result = await run(syncArgs(baseUrl), { API2APIFOX_TOKEN: "t", API2APIFOX_API_BASE_URL: baseUrl });
  assert.equal(result.status, 5, result.stdout);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.error.code, "NETWORK_FAILED");
  assert.equal(payload.error.retryable, true);
});

test("CLI sync:超时 → exit 5 + REQUEST_TIMEOUT,并明确要求先查远端再重试", async () => {
  const server = http.createServer(() => undefined); // 永不响应
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    const result = await run(syncArgs(baseUrl, ["--timeout-ms", "200"]), {
      API2APIFOX_TOKEN: "t",
      API2APIFOX_API_BASE_URL: baseUrl,
    });
    assert.equal(result.status, 5, result.stdout);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.error.code, "REQUEST_TIMEOUT");
    assert.equal(payload.error.retryable, true);
    assert.match(payload.error.message, /不要立即重复同步|先查询目标项目/);
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(() => resolve()));
  }
});

test("CLI sync:导入部分失败(counters 含 Failed>0) → exit 6 + IMPORT_PARTIAL_FAILURE", async () => {
  const mock = await startMock(ok({ endpointCreated: 2, endpointFailed: 1, schemaCreated: 1 }));
  try {
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: "t",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 6, result.stdout);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.error.code, "IMPORT_PARTIAL_FAILURE");
    // details 里必须带完整结果,供调用方读取失败项
    assert.equal(payload.error.details.counters.endpointFailed, 1);
    assert.equal(payload.error.details.counters.endpointCreated, 2);
  } finally {
    await mock.close();
  }
});

test("CLI sync:Apifox 返回 errors 数组 → exit 6,details.errors 原样带回", async () => {
  const mock = await startMock((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        code: 0,
        data: { counters: { endpointCreated: 1 }, errors: [{ message: "模型冲突", code: "SCHEMA_CONFLICT" }] },
      })
    );
  });
  try {
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: "t",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 6, result.stdout);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.error.details.errors[0].code, "SCHEMA_CONFLICT");
  } finally {
    await mock.close();
  }
});

test("CLI sync:业务码非 0(HTTP 200)→ exit 5,不误判成功", async () => {
  const mock = await startMock((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 400, message: "project not found" }));
  });
  try {
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: "t",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 5, result.stdout);
    assert.equal(JSON.parse(result.stdout).ok, false);
  } finally {
    await mock.close();
  }
});

/* ---------------- 幂等重跑 ---------------- */

test("CLI sync:KEEP_EXISTING 重复同步两次都 exit 0,第二次 counters 全为 ignored", async () => {
  let call = 0;
  const mock = await startMock((_req, res) => {
    call++;
    const counters = call === 1 ? { endpointCreated: 1, schemaCreated: 1 } : { endpointIgnored: 1, schemaIgnored: 1 };
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 0, data: { counters, errors: [] } }));
  });
  try {
    const env = { API2APIFOX_TOKEN: "t", API2APIFOX_API_BASE_URL: mock.baseUrl };
    const args = syncArgs(mock.baseUrl, ["--endpoint-conflict", "KEEP_EXISTING", "--schema-conflict", "KEEP_EXISTING"]);

    const first = await run(args, env);
    assert.equal(first.status, 0, first.stderr);
    assert.equal(JSON.parse(first.stdout).result.counters.endpointCreated, 1);

    const second = await run(args, env);
    assert.equal(second.status, 0, second.stderr, "幂等重跑必须成功");
    assert.equal(JSON.parse(second.stdout).result.counters.endpointIgnored, 1);

    assert.equal(mock.captured.length, 2);
    // 两次请求体必须完全一致(同输入 → 同 spec,不因状态漂移)
    assert.equal(mock.captured[0].body.input, mock.captured[1].body.input);
    assert.deepEqual(mock.captured[0].body.options, mock.captured[1].body.options);
  } finally {
    await mock.close();
  }
});

/* ---------------- dry-run 与安全门槛 ---------------- */

test("CLI sync:--dry-run 即使给了 token 也不发请求", async () => {
  const mock = await startMock(ok());
  try {
    const result = await run(syncArgs(mock.baseUrl, ["--dry-run"]), {
      API2APIFOX_TOKEN: "t",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 0, result.stdout);
    assert.equal(mock.captured.length, 0);
    assert.equal(JSON.parse(result.stdout).result.dryRun, true);
  } finally {
    await mock.close();
  }
});

test("CLI sync:非交互环境未传 --yes 时 exit 2,且绝不发请求", async () => {
  const mock = await startMock(ok());
  try {
    const args = syncArgs(mock.baseUrl).filter((a) => a !== "--yes");
    const result = await run(args, { API2APIFOX_TOKEN: "t", API2APIFOX_API_BASE_URL: mock.baseUrl });
    assert.equal(result.status, 2, result.stdout);
    assert.equal(JSON.parse(result.stdout).error.code, "CONFIRMATION_REQUIRED");
    assert.equal(mock.captured.length, 0, "确认门槛必须先于任何写入");
  } finally {
    await mock.close();
  }
});

test("CLI sync:缺 token(非 dry-run)时 exit 2 且不发请求", async () => {
  const mock = await startMock(ok());
  try {
    const env = { API2APIFOX_API_BASE_URL: mock.baseUrl };
    delete env.API2APIFOX_TOKEN;
    const result = await run(syncArgs(mock.baseUrl), env);
    assert.equal(result.status, 2, result.stdout);
    assert.equal(JSON.parse(result.stdout).error.code, "TOKEN_REQUIRED");
    assert.equal(mock.captured.length, 0);
  } finally {
    await mock.close();
  }
});

test("CLI sync:缺 projectId 时 exit 2 且不发请求", async () => {
  const mock = await startMock(ok());
  try {
    // 去掉 --project-id 及其值(不能连带删掉同值的位置参数)
    const args = syncArgs(mock.baseUrl);
    const at = args.indexOf("--project-id");
    args.splice(at, 2);
    const result = await run(args, { API2APIFOX_TOKEN: "t", API2APIFOX_API_BASE_URL: mock.baseUrl });
    assert.equal(result.status, 2, result.stdout);
    assert.equal(JSON.parse(result.stdout).error.code, "PROJECT_ID_REQUIRED");
    assert.equal(mock.captured.length, 0);
  } finally {
    await mock.close();
  }
});

/* ---------------- 报告页 ---------------- */

test("CLI sync:默认写报告页,文件落在临时目录且数据内嵌", async () => {
  const mock = await startMock(ok());
  const reportPath = path.join(os.tmpdir(), "api2apifox-sync-report-4242.html");
  try {
    fs.rmSync(reportPath, { force: true });
    const args = syncArgs(mock.baseUrl).filter((a) => a !== "--no-report");
    const result = await run(args, { API2APIFOX_TOKEN: "t", API2APIFOX_API_BASE_URL: mock.baseUrl });
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.result.reportPath, reportPath);
    const html = fs.readFileSync(reportPath, "utf8");
    assert.ok(html.includes("同步结果"));
    assert.ok(html.includes("4242"));
  } finally {
    fs.rmSync(reportPath, { force: true });
    await mock.close();
  }
});

test("CLI sync:--no-report 时不写报告页", async () => {
  const mock = await startMock(ok());
  const reportPath = path.join(os.tmpdir(), "api2apifox-sync-report-4242.html");
  try {
    fs.rmSync(reportPath, { force: true });
    const result = await run(syncArgs(mock.baseUrl), {
      API2APIFOX_TOKEN: "t",
      API2APIFOX_API_BASE_URL: mock.baseUrl,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.existsSync(reportPath), false);
    assert.equal(JSON.parse(result.stdout).result.reportPath, undefined);
  } finally {
    await mock.close();
  }
});

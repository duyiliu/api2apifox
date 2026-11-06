/**
 * G1：CLI 真实同步路径集成测试（mock Apifox server，不触真实 api.apifox.com）。
 *
 * 覆盖矩阵 G1 的五种结局：成功 / 401 鉴权 / 网络拒绝 / 部分失败 / 超时，
 * 并锁定请求体里的同步参数（deleteUnmatchedResources 恒 false、冲突策略透传）。
 *
 * 为什么用异步 spawn 而非 spawnSync：mock server 与 CLI 在同一进程内，
 * spawnSync 会阻塞事件循环，server 永远无法响应。
 */

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const CLI = path.join(__dirname, "..", "dist", "cli.js");
const SAMPLE = path.join(__dirname, "..", "..", "..", "sample");

/** 启动一个只处理 import-openapi 的 mock server，返回 { url, requests, close } */
async function startMock({ respond }) {
  const requests = [];
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        body = undefined;
      }
      requests.push({ method: req.method, url: req.url, headers: req.headers, body });
      respond(req, res, body);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

/** 异步跑 CLI，收集 stdout/stderr/退出码 */
function runAsync(args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, ...args], {
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => resolve({ status: code, stdout, stderr }));
  });
}

/** 真实同步的公共参数：--yes 跳过确认、--no-report 避免打开浏览器 */
function syncArgs(projectId = 4242) {
  return ["sync", "--project", SAMPLE, "--project-id", String(projectId), "--yes", "--no-report", "--format", "json"];
}

function jsonOf(result) {
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`stdout 不是合法 JSON（退出码 ${result.status}）:\n${result.stdout}\n${result.stderr}`);
  }
}

test("G1-1 sync --yes 成功后 exit 0，返回 Apifox counters", async () => {
  const mock = await startMock({
    respond: (_req, res) =>
      writeJson(res, 200, {
        code: 0,
        data: { counters: { endpointCreated: 25, endpointFolderCreated: 3, schemaCreated: 12 }, errors: [] },
      }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    const payload = jsonOf(result);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(payload.ok, true);
    assert.equal(payload.command, "sync");
    assert.equal(payload.result.dryRun, false);
    assert.equal(payload.result.target.projectId, 4242);
    assert.equal(payload.result.scope.type, "workspace");
    assert.equal(payload.result.scope.endpointCount, 25);
    assert.deepEqual(payload.result.counters, {
      endpointCreated: 25,
      endpointFolderCreated: 3,
      schemaCreated: 12,
    });
    assert.deepEqual(payload.result.errors, []);
    // 只发一次导入请求，路由正确
    assert.equal(mock.requests.length, 1);
    assert.equal(mock.requests[0].method, "POST");
    assert.equal(mock.requests[0].url, "/v1/projects/4242/import-openapi");
  } finally {
    await mock.close();
  }
});

test("G1-1 sync 请求体携带 deleteUnmatchedResources=false 与冲突策略", async () => {
  const mock = await startMock({
    respond: (_req, res) => writeJson(res, 200, { code: 0, data: { counters: { endpointCreated: 1 }, errors: [] } }),
  });
  try {
    const result = await runAsync(
      [
        ...syncArgs(),
        "--endpoint-conflict",
        "KEEP_EXISTING",
        "--schema-conflict",
        "CREATE_NEW",
        "--no-update-folder",
      ],
      { API2APIFOX_API_BASE_URL: mock.url, API2APIFOX_TOKEN: "mock-token" }
    );
    assert.equal(result.status, 0, result.stderr);
    const { body } = mock.requests[0];
    // 删除未匹配资源会把 Apifox 里手工维护的接口一起删掉，必须恒为 false
    assert.equal(body.options.deleteUnmatchedResources, false);
    assert.equal(body.options.endpointOverwriteBehavior, "KEEP_EXISTING");
    assert.equal(body.options.schemaOverwriteBehavior, "CREATE_NEW");
    assert.equal(body.options.updateFolderOfChangedEndpoint, false);
    // input 必须是可解析的 OpenAPI 3.0.3 文档
    const spec = JSON.parse(body.input);
    assert.equal(spec.openapi, "3.0.3");
    assert.equal(Object.keys(spec.paths).length, 18); // sample 中 25 个接口去重后 18 个 method+path
  } finally {
    await mock.close();
  }
});

test("G1-2 401 鉴权失败 → exit 4 + APIFOX_AUTH_FAILED", async () => {
  const mock = await startMock({
    respond: (_req, res) => writeJson(res, 401, { code: 401, message: "invalid token" }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "revoked-token",
    });
    assert.equal(result.status, 4, result.stderr);
    const payload = jsonOf(result);
    assert.equal(payload.ok, false);
    assert.equal(payload.error.code, "APIFOX_AUTH_FAILED");
    assert.equal(payload.error.status, 401);
    assert.equal(payload.error.retryable, false);
    // token 不得出现在任何输出里
    assert.ok(!result.stdout.includes("revoked-token"));
    assert.ok(!result.stderr.includes("revoked-token"));
  } finally {
    await mock.close();
  }
});

test("G1-3 网络连接被拒绝 → exit 5 + NETWORK_FAILED", async () => {
  // 先占一个端口再立刻释放，得到一个"几乎肯定无人监听"的端口
  const probe = await startMock({ respond: (_req, res) => res.end() });
  const closedPort = new URL(probe.url).port;
  await probe.close();

  const result = await runAsync(syncArgs(), {
    API2APIFOX_API_BASE_URL: `http://127.0.0.1:${closedPort}`,
    API2APIFOX_TOKEN: "mock-token",
  });
  assert.equal(result.status, 5, result.stderr);
  const payload = jsonOf(result);
  assert.equal(payload.error.code, "NETWORK_FAILED");
  assert.equal(payload.error.retryable, true);
  assert.match(payload.error.message, /ECONNREFUSED|fetch failed|网络请求失败/);
});

test("G1-4 导入含 endpointFailed>0 → exit 6 + error.details 失败清单", async () => {
  const mock = await startMock({
    respond: (_req, res) =>
      writeJson(res, 200, {
        code: 0,
        data: {
          counters: { endpointCreated: 20, endpointFailed: 5, schemaCreated: 12 },
          errors: [{ message: "路径冲突:/api/v1/users", code: "ENDPOINT_CONFLICT" }],
        },
      }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    // 部分失败不能报成功：AI Agent 会据此认为已全部写入
    assert.equal(result.status, 6, result.stderr);
    const payload = jsonOf(result);
    assert.equal(payload.ok, false);
    assert.equal(payload.error.code, "IMPORT_PARTIAL_FAILURE");
    const details = payload.error.details;
    assert.ok(details, "失败详情必须回传，否则调用方无法定位失败接口");
    assert.equal(details.counters.endpointFailed, 5);
    assert.equal(details.counters.endpointCreated, 20);
    assert.deepEqual(details.errors, [{ message: "路径冲突:/api/v1/users", code: "ENDPOINT_CONFLICT" }]);
    assert.equal(details.dryRun, false);
    assert.equal(details.target.projectId, 4242);
  } finally {
    await mock.close();
  }
});

test("G1-4 endpointFailed=0 但 errors 非空同样按部分失败处理", async () => {
  const mock = await startMock({
    respond: (_req, res) =>
      writeJson(res, 200, {
        code: 0,
        data: { counters: { endpointCreated: 25 }, errors: [{ message: "模型 X 未导入" }] },
      }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    assert.equal(result.status, 6, result.stderr);
    assert.equal(jsonOf(result).error.code, "IMPORT_PARTIAL_FAILURE");
  } finally {
    await mock.close();
  }
});

test("G1-5 超时 → exit 5 + REQUEST_TIMEOUT，并提示先核对远端", async () => {
  const mock = await startMock({
    // 收下请求但永不响应：模拟服务端导入已开始、本地等待超时
    respond: () => undefined,
  });
  try {
    const result = await runAsync([...syncArgs(), "--timeout-ms", "300"], {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    assert.equal(result.status, 5, result.stderr);
    const payload = jsonOf(result);
    assert.equal(payload.error.code, "REQUEST_TIMEOUT");
    assert.equal(payload.error.retryable, true);
    // 超时只代表本地停止等待；文案必须阻止盲目重试造成重复写入
    assert.match(payload.error.message, /请求超时/);
    assert.match(payload.error.message, /不要立即重复同步|请先查询目标项目/);
  } finally {
    await mock.close();
  }
});

test("G1-6 5xx 服务错误 → exit 5 + APIFOX_REQUEST_FAILED(status=500)", async () => {
  const mock = await startMock({
    respond: (_req, res) => writeJson(res, 500, { code: 500, message: "internal" }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    assert.equal(result.status, 5, result.stderr);
    const payload = jsonOf(result);
    assert.equal(payload.error.code, "APIFOX_REQUEST_FAILED");
    assert.equal(payload.error.status, 500);
    assert.equal(payload.error.retryable, true);
  } finally {
    await mock.close();
  }
});

function writeJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(text) });
  res.end(text);
}

/* ---------------- G10：Windows 平台差异 ---------------- */

test("G10 中文路径 + CRLF 项目可正常同步，报告使用正斜杠相对路径", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-中文项目-"));
  const pkgDir = path.join(root, "src", "main", "java", "示例", "接口");
  fs.mkdirSync(pkgDir, { recursive: true });
  // CRLF 行尾 + 中文路径 + 中文注释
  const source = [
    "package 示例.接口;",
    "import org.springframework.web.bind.annotation.*;",
    "/** 用户接口，中文注释用于验证编码链路 */",
    '@RestController @RequestMapping("/api/用户")',
    "public class UserController {",
    '  /** 列表 */',
    '  @GetMapping("/list")',
    "  public String list() { return null; }",
    "}",
    "",
  ].join("\r\n");
  fs.writeFileSync(path.join(pkgDir, "UserController.java"), source, "utf8");

  const mock = await startMock({
    respond: (_req, res) => writeJson(res, 200, { code: 0, data: { counters: { endpointCreated: 1 }, errors: [] } }),
  });
  try {
    const result = await runAsync(
      ["sync", "--project", root, "--project-id", "77", "--yes", "--no-report", "--format", "json"],
      { API2APIFOX_API_BASE_URL: mock.url, API2APIFOX_TOKEN: "mock-token" }
    );
    assert.equal(result.status, 0, result.stderr);
    const payload = jsonOf(result);
    assert.equal(payload.result.scope.endpointCount, 1);
    const spec = JSON.parse(mock.requests[0].body.input);
    assert.ok(spec.paths["/api/用户/list"], `接口路径缺失:${Object.keys(spec.paths).join(",")}`);

    // scan 输出的文件路径必须是正斜杠（报告与 JSON 消费方都按此口径处理）
    const scanned = await runAsync(
      ["scan", "--project", root, "--include", "**/*.java", "--format", "json"],
      { API2APIFOX_API_BASE_URL: mock.url, API2APIFOX_TOKEN: "mock-token" }
    );
    assert.equal(scanned.status, 0, scanned.stderr);
    const file = jsonOf(scanned).result.endpoints[0].file;
    assert.ok(!file.includes("\\"), `路径应已归一化为正斜杠:${file}`);
    assert.match(file, /src\/main\/java\/示例\/接口\/UserController\.java$/);
  } finally {
    await mock.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("G10 --include 反向斜杠 glob 在 Windows 上仍能匹配", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-glob-"));
  const dir = path.join(root, "src", "main", "java", "demo");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "A.java"),
    'import org.springframework.web.bind.annotation.*;\n@RestController public class A { @GetMapping("/a") public String a() { return null; } }\n',
    "utf8"
  );
  try {
    // fast-glob 的 cwd 归一化：反斜杠 glob 不应被当成"无匹配"
    const result = await runAsync(["scan", "--project", root, "--include", "**\\*.java", "--format", "json"]);
    const payload = jsonOf(result);
    assert.equal(payload.result.scannedFiles, 1, `反斜杠 glob 未匹配到文件:${result.stdout}`);
    assert.equal(payload.result.endpointCount, 1);
    // F1：归一化诊断必须经 warnings 通道到达用户（此前 diagnostics 无任何消费者，告警不可达）
    assert.ok(
      payload.warnings.some((w) => w.includes("GLOB_BACKSLASH_NORMALIZED")),
      `反斜杠归一告警未出现在 warnings:${JSON.stringify(payload.warnings)}`
    );
    // 正斜杠写法不应触发该告警（只在反斜杠原写法零匹配时重试才报）
    const posix = await runAsync(["scan", "--project", root, "--include", "**/*.java", "--format", "json"]);
    assert.equal(posix.status, 0, posix.stderr);
    assert.ok(
      !jsonOf(posix).warnings.some((w) => w.includes("GLOB_BACKSLASH_NORMALIZED")),
      `正斜杠写法不应报归一化告警:${JSON.stringify(jsonOf(posix).warnings)}`
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

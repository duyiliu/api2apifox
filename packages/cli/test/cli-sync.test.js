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
    // 逐接口索引进入 JSON 信封(即使 Apifox 只回聚合计数,也要给出清单与降级原因)
    assert.equal(payload.result.endpointLinks.mode, "project");
    assert.ok(payload.result.endpointLinks.reason, "降级必须给出原因");
    assert.equal(payload.result.endpoints.length, payload.result.scope.endpointCount);
    for (const endpoint of payload.result.endpoints) {
      // 本机 mock 地址推导不出 app.apifox.com,也拿不到接口 ID:绝不能凭空拼链接
      assert.equal(endpoint.apifoxUrl, undefined, JSON.stringify(endpoint));
      assert.equal(endpoint.mockUrl, undefined, JSON.stringify(endpoint));
    }
    // 只发一次导入请求，路由正确
    assert.equal(mock.requests.length, 1);
    assert.equal(mock.requests[0].method, "POST");
    assert.equal(mock.requests[0].url, "/v1/projects/4242/import-openapi");
  } finally {
    await mock.close();
  }
});

test("G1-1b sync JSON 信封带逐接口索引：Apifox 不回接口 ID 时显式降级并给出原因", async () => {
  const mock = await startMock({
    respond: (_req, res) => writeJson(res, 200, { code: 0, data: { counters: { endpointCreated: 25 }, errors: [] } }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    assert.equal(result.status, 0, result.stderr);
    const payload = jsonOf(result);
    assert.equal(payload.result.endpointLinks.mode, "project");
    assert.ok(payload.result.endpointLinks.reason, "降级必须给出原因");
    assert.equal(payload.result.endpoints.length, payload.result.scope.endpointCount);
    for (const endpoint of payload.result.endpoints) {
      // 本机 mock 地址推导不出 app.apifox.com,也拿不到接口 ID:绝不能凭空拼链接
      assert.equal(endpoint.apifoxUrl, undefined, JSON.stringify(endpoint));
      assert.equal(endpoint.apifoxEndpointId, undefined, JSON.stringify(endpoint));
      assert.equal(endpoint.mockUrl, undefined, JSON.stringify(endpoint));
    }
  } finally {
    await mock.close();
  }
});

test("G1-1c sync JSON 信封：Apifox 回传接口 ID 与 Mock 时逐接口带出来", async () => {
  const mock = await startMock({
    respond: (_req, res) =>
      writeJson(res, 200, {
        code: 0,
        data: {
          counters: { endpointCreated: 1 },
          errors: [],
          endpoints: [
            { id: 9001, method: "GET", path: "/api/v1/users", mockUrl: "https://mock.apifox.cn/m2/4242-0-0/9001" },
          ],
        },
      }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    assert.equal(result.status, 0, result.stderr);
    const payload = jsonOf(result);
    const linked = payload.result.endpoints.find((item) => item.apifoxEndpointId === 9001);
    assert.ok(linked, `未找到接口 ID 映射:${JSON.stringify(payload.result.endpoints)}`);
    assert.equal(linked.method, "GET");
    assert.equal(linked.path, "/api/v1/users");
    assert.equal(linked.mockUrl, "https://mock.apifox.cn/m2/4242-0-0/9001");
    // 私有化/mock 域名推导不出 Web 文档页,但必须如实说明原因,而不是静默成功
    assert.equal(payload.result.endpointLinks.mode, "project");
    assert.match(payload.result.endpointLinks.reason, /私有化部署/);
    assert.equal(linked.apifoxUrl, undefined);
  } finally {
    await mock.close();
  }
});

test("G1-1e sync JSON 信封：私有化部署下 Apifox 直传接口文档页仍算逐接口可定位", async () => {
  const mock = await startMock({
    respond: (_req, res) =>
      writeJson(res, 200, {
        code: 0,
        data: {
          counters: { endpointCreated: 25, schemaCreated: 12 },
          errors: [],
          // 路由只覆盖其中一个接口，其余接口必须逐行保持降级，不能整批谎报
          endpoints: [
            {
              method: "GET",
              path: "/api/v1/users",
              id: 7001,
              url: "https://apifox.internal.example/project/4242/apis/api-7001",
              mockUrl: "https://apifox.internal.example/mock/4242/api-7001",
            },
          ],
        },
      }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    assert.equal(result.status, 0, result.stderr);
    const payload = jsonOf(result);
    const linked = payload.result.endpoints.find((item) => item.method === "GET" && item.path === "/api/v1/users");
    assert.ok(linked, "未找到被映射的接口");
    // Apifox 直传的地址优先于按 ID 推导：私有化部署也能给出接口级链接
    assert.equal(linked.apifoxUrl, "https://apifox.internal.example/project/4242/apis/api-7001");
    assert.equal(linked.mockUrl, "https://apifox.internal.example/mock/4242/api-7001");
    assert.equal(linked.apifoxEndpointId, 7001);
    assert.equal(linked.degraded, undefined);
    // 只有 1/25 拿到接口级地址 => partial，且其余行显式降级并给出原因
    assert.equal(payload.result.endpointLinks.mode, "partial");
    assert.ok(payload.result.endpointLinks.reason, "部分降级必须给出原因");
    // 已有接口拿到直传地址时，原因不能声称"不提供任何链接"
    assert.doesNotMatch(payload.result.endpointLinks.reason, /不提供任何/);
    assert.match(payload.result.endpointLinks.reason, /这些接口|其余/);
    const others = payload.result.endpoints.filter((item) => !(item.method === "GET" && item.path === "/api/v1/users"));
    assert.ok(others.length > 0);
    for (const item of others) {
      assert.equal(item.apifoxUrl, undefined, JSON.stringify(item));
      assert.equal(item.mockUrl, undefined, JSON.stringify(item));
    }
  } finally {
    await mock.close();
  }
});

test("G1-1f sync --dry-run JSON 信封：给出清单但不给任何链接，原因写明未写入", async () => {
  const result = await runAsync([
    "sync",
    "--project",
    SAMPLE,
    "--project-id",
    "4242",
    "--dry-run",
    "--format",
    "json",
  ]);
  assert.equal(result.status, 0, result.stderr);
  const payload = jsonOf(result);
  assert.equal(payload.result.dryRun, true);
  assert.equal(payload.result.endpointLinks.mode, "project");
  assert.match(payload.result.endpointLinks.reason, /dry-run/);
  assert.equal(payload.result.endpoints.length, payload.result.scope.endpointCount);
  for (const endpoint of payload.result.endpoints) {
    assert.equal(endpoint.apifoxUrl, undefined, "dry-run 不得指向未写入的接口");
    assert.equal(endpoint.mockUrl, undefined);
    assert.equal(endpoint.apifoxEndpointId, undefined);
  }
});

test("G1-1g sync JSON 信封：逐接口映射在外层 endpoints 时同样被读取", async () => {
  const mock = await startMock({
    // Apifox 部分网关把逐接口映射放在 data 同级，而不是 data.endpoints 里
    respond: (_req, res) =>
      writeJson(res, 200, {
        code: 0,
        data: { counters: { endpointCreated: 25 }, errors: [] },
        endpoints: [
          { method: "GET", path: "/api/v1/users", id: 8001, url: "https://apifox.corp.example/p/4242/apis/api-8001" },
        ],
      }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    assert.equal(result.status, 0, result.stderr);
    const payload = jsonOf(result);
    const linked = payload.result.endpoints.find((e) => e.method === "GET" && e.path === "/api/v1/users");
    assert.ok(linked, "未找到被映射的接口");
    assert.equal(linked.apifoxUrl, "https://apifox.corp.example/p/4242/apis/api-8001");
    assert.equal(linked.apifoxEndpointId, 8001);
    assert.equal(payload.result.endpointLinks.mode, "partial");
  } finally {
    await mock.close();
  }
});

test("G1-1d sync JSON 信封：部分导入失败时 error.details 仍带逐接口索引", async () => {
  const mock = await startMock({
    respond: (_req, res) =>
      writeJson(res, 200, {
        code: 0,
        data: { counters: { endpointCreated: 24, endpointFailed: 1 }, errors: [{ message: "路径冲突:/api/v1/users" }] },
      }),
  });
  try {
    const result = await runAsync(syncArgs(), {
      API2APIFOX_API_BASE_URL: mock.url,
      API2APIFOX_TOKEN: "mock-token",
    });
    assert.equal(result.status, 6, result.stderr);
    const payload = jsonOf(result);
    assert.equal(payload.error.code, "IMPORT_PARTIAL_FAILURE");
    assert.equal(payload.error.details.endpoints.length, payload.error.details.scope.endpointCount);
    assert.ok(payload.error.details.endpointLinks.reason, "失败详情里同样要能判断链接口径");
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

/* ---------------- 报告页逐接口链接(Issue #40) ---------------- */

test("报告页:逐接口链接与降级原因进入自包含 HTML 的数据载荷", () => {
  const { buildCliSyncReport, renderReportHtml } = require("../dist/cli.js");
  const analyzed = {
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/res/0",
        operationId: "DemoController_get",
        summary: "接口",
        tag: "Demo",
        parameters: [],
        fsPath: "D:/demo/src/main/java/demo/DemoController.java",
        controller: "DemoController",
        flavor: "spring-mvc",
      },
    ],
    warnings: [],
  };
  const resolved = {
    config: {
      projectRoot: "D:/demo",
      folderNameSource: "controller",
      rootFolderName: "",
      endpointConflictBehavior: "OVERWRITE_EXISTING",
      schemaConflictBehavior: "OVERWRITE_EXISTING",
    },
  };
  const synced = (endpoints, endpointLinks) => ({
    dryRun: false,
    target: { projectId: 4242, apiBaseUrl: "https://api.apifox.com" },
    scope: { type: "workspace", endpointCount: 1 },
    counters: { endpointCreated: 1 },
    errors: [],
    endpoints,
    endpointLinks,
  });

  // 接口级:apifoxUrl + mockUrl 原样进入数据载荷
  const linked = renderReportHtml(
    buildCliSyncReport({
      synced: synced(
        [
          {
            name: "接口",
            method: "GET",
            path: "/api/v1/res/0",
            apifoxUrl: "https://app.apifox.com/project/4242/apis/api-9001",
            apifoxEndpointId: 9001,
            mockUrl: "https://mock.apifox.cn/m2/4242-0-0/9001",
          },
        ],
        { mode: "per-endpoint" }
      ),
      analyzed,
      resolved,
    })
  );
  assert.ok(linked.includes('"apifoxUrl":"https://app.apifox.com/project/4242/apis/api-9001"'));
  assert.ok(linked.includes('"mockUrl":"https://mock.apifox.cn/m2/4242-0-0/9001"'));
  // 链接仍只走 JSON 载荷,不拼成标签属性
  assert.equal(linked.includes('href="https://app.apifox.com'), false);

  // 降级:逐行标记 + 页面上的原因容器
  const degraded = renderReportHtml(
    buildCliSyncReport({
      synced: synced(
        [{ name: "接口", method: "GET", path: "/api/v1/res/0", apifoxUrl: "https://app.apifox.com/project/4242", degraded: true }],
        { mode: "project", reason: "Apifox 未返回接口 ID" }
      ),
      analyzed,
      resolved,
    })
  );
  assert.ok(degraded.includes('"degraded":true'));
  assert.ok(degraded.includes('"reason":"Apifox 未返回接口 ID"'));
  assert.ok(degraded.includes('id="endpointLinkNote"'), "报告页必须有展示降级原因的容器");
});

/**
 * 真正执行页面脚本：只查 payload 子串不足以证明“链接被画出来/被复制出去”，
 * 这里用一个最小 DOM 桩跑通 render()，并从点击复制按钮时发出的文本断言内容。
 */
function runReportScript(html) {
  const vm = require("node:vm");
  const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const nodes = new Map();
  const made = [];
  const makeEl = (tag) => {
    const node = {
      tagName: tag,
      children: [],
      textContent: "",
      className: "",
      title: "",
      href: "",
      type: "",
      style: {},
      dataset: {},
      listeners: {},
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {},
      getAttribute() {
        return "";
      },
      appendChild(child) {
        this.children.push(child);
        return child;
      },
      remove() {},
      select() {},
      addEventListener(type, cb) {
        this.listeners[type] = cb;
      },
      querySelector(sel) {
        this.sub = this.sub || {};
        if (!this.sub[sel]) {
          this.sub[sel] = makeEl("div");
        }
        return this.sub[sel];
      },
      querySelectorAll() {
        return [];
      },
      closest() {
        return undefined;
      },
      textOf() {
        const sub = Object.values(this.sub || {}).map((c) => c.textOf()).join("");
        return (this.textContent || "") + this.children.map((c) => c.textOf()).join("") + sub;
      },
    };
    made.push(node);
    return node;
  };
  const document = {
    title: "",
    createElement: makeEl,
    createTextNode: (text) => ({ textOf: () => text, children: [] }),
    getElementById(id) {
      if (!nodes.has(id)) {
        nodes.set(id, makeEl("div"));
      }
      return nodes.get(id);
    },
    querySelector: () => makeEl("div"),
    querySelectorAll: () => [],
    body: makeEl("body"),
    execCommand: () => true,
  };
  const copied = [];
  const posted = [];
  const window = { open() {}, addEventListener() {} };
  const context = {
    document,
    window,
    navigator: { clipboard: { writeText: (text) => (copied.push(text), Promise.resolve()) } },
    setTimeout: () => 0,
    // 面板脚本首行即取宿主 API；CLI 报告页不使用，存在也无副作用
    acquireVsCodeApi: () => ({ postMessage: (message) => posted.push(message) }),
  };
  context.globalThis = context;
  // 用同一个 context 执行脚本，面板场景才能在脚本执行后注入 report 并调用它自己的 render()
  vm.createContext(context);
  vm.runInContext(script, context);
  const setReport = (value) => {
    context.__inject = value;
    vm.runInContext("report = __inject; render();", context);
  };
  return {
    nodes,
    copied,
    posted,
    setReport,
    ids: (id) => nodes.get(id),
    tableText: () => {
      const tbody = nodes.get("endpointTable");
      return tbody ? tbody.textOf() : "";
    },
  };
}

test("报告页脚本:逐接口链接真的画进表格，降级原因可见，复制内容带链接", async () => {
  const { buildCliSyncReport, renderReportHtml } = require("../dist/cli.js");
  const analyzed = {
    endpoints: [
      { method: "GET", path: "/api/v1/a", operationId: "a", summary: "甲", tag: "Demo", parameters: [], fsPath: "D:/d/A.java", controller: "A", flavor: "spring-mvc" },
      { method: "GET", path: "/api/v1/b", operationId: "b", summary: "乙", tag: "Demo", parameters: [], fsPath: "D:/d/A.java", controller: "A", flavor: "spring-mvc" },
    ],
    warnings: [],
  };
  const resolved = {
    config: { projectRoot: "D:/d", folderNameSource: "controller", rootFolderName: "", endpointConflictBehavior: "OVERWRITE_EXISTING", schemaConflictBehavior: "OVERWRITE_EXISTING" },
  };
  const html = renderReportHtml(
    buildCliSyncReport({
      synced: {
        dryRun: false,
        target: { projectId: 4242, apiBaseUrl: "https://api.apifox.com" },
        scope: { type: "workspace", endpointCount: 2 },
        counters: { endpointCreated: 2 },
        errors: [],
        endpoints: [
          {
            name: "甲",
            method: "GET",
            path: "/api/v1/a",
            apifoxUrl: "https://app.apifox.com/project/4242/apis/api-11",
            apifoxEndpointId: 11,
            mockUrl: "https://mock.apifox.cn/m2/4242-0-0/11",
          },
          { name: "乙", method: "GET", path: "/api/v1/b", apifoxUrl: "https://app.apifox.com/project/4242", degraded: true },
        ],
        endpointLinks: { mode: "partial", reason: "无法把接口对应到 Apifox 接口 ID 与文档地址" },
      },
      analyzed,
      resolved,
    })
  );
  const page = runReportScript(html);
  const table = page.ids("endpointTable").textOf();
  assert.match(table, /接口文档/, "接口级链接必须有可点入口");
  assert.match(table, /Mock 地址/, "Mock 地址命中时必须展示");
  assert.match(table, /项目页（降级）/, "降级行必须显式标注");
  assert.equal(page.ids("endpointLinkNote").textContent, "无法把接口对应到 Apifox 接口 ID 与文档地址");

  // 复制按钮:降级行要带上说明,否则粘贴出去的项目页会被误当接口文档页
  page.ids("btnCopyEndpoints").listeners.click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(page.copied.length, 1);
  assert.match(page.copied[0], /https:\/\/app\.apifox\.com\/project\/4242\/apis\/api-11/);
  assert.match(page.copied[0], /https:\/\/mock\.apifox\.cn\/m2\/4242-0-0\/11/);
  assert.match(page.copied[0], /项目页，降级/, "TSV 复制内容必须保留降级标记");

  // Markdown 复制同样要带链接、Mock 与全局降级原因
  page.ids("btnCopyMarkdown").listeners.click();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(page.copied.length, 2);
  assert.match(page.copied[1], /链接说明：/, "Markdown 必须带降级原因");
  assert.match(page.copied[1], /https:\/\/app\.apifox\.com\/project\/4242\/apis\/api-11/);
  assert.match(page.copied[1], /项目页，降级/);
});

/* ---------------- 扩展侧链路（Issue #40） ---------------- */

/**
 * 扩展侧代码不在 CLI 的构建产物里，这里用 esbuild 现场打包源码（vscode 作为 external
 * 由 Module._load 拦截），从而在不新增测试文件的前提下覆盖 uploader 与 webview 脚本。
 */
function bundle(file, Module) {
  const esbuild = require("esbuild");
  const result = esbuild.buildSync({
    entryPoints: [path.join(__dirname, "..", "..", "..", file)],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    external: ["vscode"],
    write: false,
    logLevel: "silent",
  });
  return result.outputFiles[0].text;
}

function loadWithVscode(code, vscodeMock, Module) {
  const original = Module._load;
  Module._load = function (request, ...rest) {
    return request === "vscode" ? vscodeMock : original.call(this, request, ...rest);
  };
  try {
    const mod = new Module(`/bundle-${Math.random()}.js`);
    mod.filename = mod.id;
    mod._compile(code, mod.filename);
    return mod.exports;
  } finally {
    Module._load = original;
  }
}

test("扩展:syncToApifox 透出逐接口映射，结果面板渲染并复制链接与降级说明", async () => {
  const Module = require("node:module");
  const vscodeMock = {
    window: {
      withProgress: async (_opts, cb) => cb({ report() {} }),
      createWebviewPanel: () => ({ webview: { onDidReceiveMessage() {}, html: "" }, onDidDispose() {}, reveal() {}, dispose() {} }),
    },
    ProgressLocation: { Notification: 1 },
    env: { openExternal: async () => true, clipboard: { writeText: async () => undefined } },
    Uri: { parse: (s) => s, file: (s) => s },
    ViewColumn: { Beside: 2 },
    workspace: { workspaceFolders: [{ uri: { fsPath: "/w" } }], getWorkspaceFolder: () => ({}) },
  };

  // 1) 生产入口：回传映射必须原样到达报告层（此前用类型断言读取，映射被静默丢弃）
  const uploader = loadWithVscode(
    bundle("src/apifox/uploader.ts", Module),
    vscodeMock,
    Module
  );
  const mapped = [{ id: 9001, method: "GET", path: "/a", mockUrl: "https://mock.apifox.cn/m2/1-0-0/9001" }];
  const outcome = await uploader.syncToApifox(
    { importOpenapi: async () => ({ counters: { endpointCreated: 1 }, errors: [], endpoints: mapped }) },
    { projectId: 1, schemaFolderId: 0, schemaFolderName: "", endpointConflictBehavior: "OVERWRITE_EXISTING", schemaConflictBehavior: "OVERWRITE_EXISTING", updateFolderOfChangedEndpoint: true },
    { spec: {}, endpoints: [{}], warnings: [] }
  );
  assert.deepEqual(outcome.endpoints, mapped);

  const empty = await uploader.syncToApifox(
    { importOpenapi: async () => ({ counters: {}, errors: [] }) },
    { projectId: 1, schemaFolderId: 0, schemaFolderName: "", endpointConflictBehavior: "OVERWRITE_EXISTING", schemaConflictBehavior: "OVERWRITE_EXISTING", updateFolderOfChangedEndpoint: true },
    { spec: {}, endpoints: [{}], warnings: [] }
  );
  assert.deepEqual(empty.endpoints, []);

  // 2) Webview 脚本：链接、Mock、降级标注与复制内容
  const { SyncResultPanel } = loadWithVscode(bundle("src/views/SyncResultPanel.ts", Module), vscodeMock, Module);
  const html = SyncResultPanel.prototype._getHtmlForWebview({ cspSource: "vscode-webview://t" });
  const script = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    .map((m) => m[1])
    .find((code) => code.includes("renderEndpoints"));
  assert.ok(script, "未找到结果面板脚本");
  const page = runReportScript(`<script>${script}</script>`);
  page.setReport({
    projectId: 42,
    projectUrl: "https://app.apifox.com/project/42",
    target: "t",
    scope: "s",
    finishedAt: "2026-11-24 10:00:00",
    conflict: "c",
    summary: [{ category: "接口", created: 2, updated: 0, ignored: 0, failed: 0, total: 2 }],
    endpointLinks: { mode: "partial", reason: "无法把接口对应到 Apifox 接口 ID 与文档地址" },
    endpoints: [
      { name: "甲", method: "GET", path: "/a", folder: "D", controller: "A", file: "A.java", fsPath: "/w/A.java", apifoxUrl: "https://app.apifox.com/project/42/apis/api-11", apifoxEndpointId: 11, mockUrl: "https://mock.apifox.cn/m2/42-0-0/11" },
      { name: "乙", method: "GET", path: "/b", folder: "D", controller: "A", file: "A.java", fsPath: "/w/A.java", apifoxUrl: "https://app.apifox.com/project/42", degraded: true },
    ],
    errors: [],
    warnings: [],
  });
  const table = page.ids("endpointTable").textOf();
  assert.match(table, /接口文档/);
  assert.match(table, /Mock 地址/);
  assert.match(table, /项目页（降级）/);
  assert.equal(page.ids("endpointLinkNote").textContent, "无法把接口对应到 Apifox 接口 ID 与文档地址");
  page.ids("btnCopyEndpoints").listeners.click();
  await new Promise((resolve) => setImmediate(resolve));
  // 面板用 vscode.postMessage 交回宿主复制，不是浏览器 clipboard
  const copyText = page.posted.find((m) => m.command === "copy").text;
  assert.match(copyText, /项目页，降级/, "TSV 必须保留降级标记");
  assert.match(copyText, /https:\/\/mock\.apifox\.cn\/m2\/42-0-0\/11/);

  // Markdown 走面板自己的 markdown()，与 CLI 报告页是两套实现，必须单独验证
  page.ids("btnCopyMarkdown").listeners.click();
  const md = page.posted.filter((m) => m.command === "copy").map((m) => String(m.text));
  assert.equal(md.length, 2);
  assert.match(md[1], /链接说明：无法把接口对应到 Apifox 接口 ID 与文档地址/);
  assert.match(md[1], /https:\/\/app\.apifox\.com\/project\/42\/apis\/api-11/);
  assert.match(md[1], /https:\/\/mock\.apifox\.cn\/m2\/42-0-0\/11/);
  assert.match(md[1], /项目页，降级/);
});

test("client:带外层 endpoints 的数组响应保持数组形状（listTeams 不回归）", async () => {
  const http = require("node:http");
  const Module = require("node:module");
  const { ApifoxClient } = loadWithVscode(bundle("src/apifox/client.ts", Module), {}, Module);
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ code: 0, data: [{ id: 7, name: "team" }], endpoints: [] }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const client = new ApifoxClient(`http://127.0.0.1:${server.address().port}`, "t");
    assert.deepEqual(await client.listTeams(), [{ id: 7, name: "team" }]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

/**
 * G1：Issue #40 的逐接口映射与可寻址索引。
 * 官方 import-openapi 目前只回传 counters/errors，这里的契约是：没有该字段时形状与
 * 旧响应完全一致；一旦 Apifox 补上该字段，按 method/path 命中接口 ID 即可推导文档页；
 * 拿不到依据的行逐条降级并显式归因，不猜测拼装。
 */
function clientApi() {
  const Module = require("node:module");
  return loadWithVscode(bundle("src/apifox/client.ts", Module), {}, Module);
}

/** 只填链接推导真正会读的字段，避免每个用例重复无关的解析元数据 */
function endpointStub(overrides) {
  return {
    tag: "DemoController",
    parameters: [],
    fsPath: "/proj/src/DemoController.java",
    controller: "DemoController",
    flavor: "spring-mvc",
    ...overrides,
  };
}

test("client:导入响应无 endpoints 时结果不含该键（保持旧口径）", async () => {
  const { ApifoxClient } = clientApi();
  const original = globalThis.fetch;
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(JSON.stringify({ code: 0, data: { counters: { endpointCreated: 1 }, errors: [] } }), { status: 200 })
    ));
  try {
    const result = await new ApifoxClient("https://api.example.com", "t").importOpenapi(1, "{}");
    assert.deepEqual(result, { counters: { endpointCreated: 1 }, errors: [] });
    // 消费方靠"键不出现"判断没有逐接口映射，多一个空数组会被误认成已映射
    assert.equal(Object.prototype.hasOwnProperty.call(result, "endpoints"), false);
  } finally {
    globalThis.fetch = original;
  }
});

test("client:导入响应回传 endpoints 时解析出接口 ID、方法、路径与 Mock 地址", async () => {
  const { ApifoxClient } = clientApi();
  const original = globalThis.fetch;
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          code: 0,
          data: {
            counters: { endpointCreated: 1 },
            errors: [],
            endpoints: [{ endpointId: 9001, method: "get", path: "/api/ping", mockUrl: "https://mock.apifox.cn/m2/42-0-0/9001" }],
          },
        }),
        { status: 200 }
      )
    ));
  try {
    const result = await new ApifoxClient("https://api.example.com", "t").importOpenapi(1, "{}");
    assert.deepEqual(result.endpoints, [
      {
        id: 9001,
        method: "GET",
        path: "/api/ping",
        operationId: undefined,
        url: undefined,
        mockUrl: "https://mock.apifox.cn/m2/42-0-0/9001",
      },
    ]);
  } finally {
    globalThis.fetch = original;
  }
});

test("client:外层 endpoints 合并进对象响应", async () => {
  const { ApifoxClient } = clientApi();
  const original = globalThis.fetch;
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          code: 0,
          endpoints: [{ id: 7, method: "post", path: "/api/orders" }],
          data: { counters: { endpointCreated: 1 }, errors: [] },
        }),
        { status: 200 }
      )
    ));
  try {
    const imported = await new ApifoxClient("https://api.example.com", "t").importOpenapi(1, "{}");
    assert.deepEqual(imported.endpoints, [
      { id: 7, method: "POST", path: "/api/orders", operationId: undefined, url: undefined, mockUrl: undefined },
    ]);
  } finally {
    globalThis.fetch = original;
  }
});

test("client:extractImportEndpoints 兼容 items 包装、字段别名并丢弃无信息条目", () => {
  const { extractImportEndpoints } = clientApi();
  assert.deepEqual(
    extractImportEndpoints({
      items: [
        { endpointId: 12, method: "post", path: " /api/orders/ ", apifoxUrl: "https://app.apifox.com/project/1/apis/api-12" },
        { id: 13, operationId: "OrderController_list", mockURL: "https://mock.apifox.cn/m2/1-0-0/13" },
        { id: 0 },
        { message: "no identifying fields" },
        "not-an-object",
      ],
    }),
    [
      {
        id: 12,
        method: "POST",
        path: "/api/orders/",
        operationId: undefined,
        url: "https://app.apifox.com/project/1/apis/api-12",
        mockUrl: undefined,
      },
      {
        id: 13,
        method: undefined,
        path: undefined,
        operationId: "OrderController_list",
        url: undefined,
        mockUrl: "https://mock.apifox.cn/m2/1-0-0/13",
      },
    ]
  );
  assert.deepEqual(extractImportEndpoints(undefined), []);
  assert.deepEqual(extractImportEndpoints({}), []);
  assert.deepEqual(extractImportEndpoints("endpoints"), []);
  assert.deepEqual(extractImportEndpoints([{ id: -1, method: "  ", path: "" }]), []);
  // 只有 URL 的条目没有 ID 也没有路由，但仍能直传地址，不能当无效条目丢掉
  assert.deepEqual(extractImportEndpoints([{ url: " https://app.apifox.com/project/1/apis/api-9 " }]), [
    {
      id: undefined,
      method: undefined,
      path: undefined,
      operationId: undefined,
      url: "https://app.apifox.com/project/1/apis/api-9",
      mockUrl: undefined,
    },
  ]);
});

test("client:projectWebUrl 只对公网 Apifox 域名推导项目页", () => {
  const { projectWebUrl } = clientApi();
  assert.equal(projectWebUrl("https://api.apifox.com", 42), "https://app.apifox.com/project/42");
  assert.equal(projectWebUrl("https://API.Apifox.com/", 42), "https://app.apifox.com/project/42");
  assert.equal(projectWebUrl("https://www.apifox.com", 7), "https://app.apifox.com/project/7");
  assert.equal(projectWebUrl("https://apifox.example.com", 42), undefined);
  assert.equal(projectWebUrl("https://127.0.0.1:8080", 42), undefined);
  assert.equal(projectWebUrl("not a url", 42), undefined);
  assert.equal(projectWebUrl("https://api.apifox.com", 0), undefined);
});

test("client:buildEndpointLinks 按路由命中接口 ID 推导接口文档页，直传 url 优先", () => {
  const { buildEndpointLinks } = clientApi();
  const derived = buildEndpointLinks({
    endpoints: [endpointStub({ method: "GET", path: "/api/ping", operationId: "DemoController_ping", summary: "探活" })],
    imported: [{ id: 42, method: "get", path: "/api/ping/", mockUrl: "https://mock.apifox.cn/m2/1-0-0/42" }],
    apiBaseUrl: "https://api.apifox.com",
    projectId: 1,
  });
  assert.equal(derived.mode, "per-endpoint");
  assert.equal(derived.reason, undefined);
  assert.deepEqual(derived.links, [
    {
      name: "探活",
      method: "GET",
      path: "/api/ping",
      apifoxUrl: "https://app.apifox.com/project/1/apis/api-42",
      apifoxEndpointId: 42,
      mockUrl: "https://mock.apifox.cn/m2/1-0-0/42",
    },
  ]);

  const direct = buildEndpointLinks({
    endpoints: [endpointStub({ method: "GET", path: "/api/ping", operationId: "DemoController_ping" })],
    imported: [{ id: 42, method: "GET", path: "/api/ping", url: "https://app.apifox.com/project/1/apis/api-42?x=1" }],
    apiBaseUrl: "https://api.apifox.com",
    projectId: 1,
  });
  assert.equal(direct.links[0].apifoxUrl, "https://app.apifox.com/project/1/apis/api-42?x=1");
  assert.equal(direct.links[0].degraded, undefined);
});

test("client:buildEndpointLinks 无映射时退回项目页并逐行标注降级", () => {
  const { buildEndpointLinks, ENDPOINT_LINK_NO_MAPPING_REASON } = clientApi();
  const links = buildEndpointLinks({
    endpoints: [endpointStub({ method: "GET", path: "/api/ping", operationId: "DemoController_ping" })],
    imported: [],
    apiBaseUrl: "https://api.apifox.com",
    projectId: 1,
  });
  assert.equal(links.mode, "project");
  assert.equal(links.reason, ENDPOINT_LINK_NO_MAPPING_REASON);
  assert.deepEqual(links.links[0], {
    name: "DemoController_ping",
    method: "GET",
    path: "/api/ping",
    apifoxUrl: "https://app.apifox.com/project/1",
    degraded: true,
  });
});

test("client:buildEndpointLinks 在私有化部署不拼接口页，并按有无 ID 分别归因", () => {
  const {
    buildEndpointLinks,
    ENDPOINT_LINK_NO_PROJECT_REASON,
    ENDPOINT_LINK_PRIVATE_DEPLOY_REASON,
  } = clientApi();
  const withId = buildEndpointLinks({
    endpoints: [endpointStub({ method: "GET", path: "/api/ping", operationId: "DemoController_ping" })],
    imported: [{ id: 42, method: "GET", path: "/api/ping", mockUrl: "https://mock.internal/42" }],
    apiBaseUrl: "https://apifox.internal:8080",
    projectId: 1,
  });
  assert.equal(withId.mode, "project");
  assert.equal(withId.reason, ENDPOINT_LINK_PRIVATE_DEPLOY_REASON);
  assert.equal(withId.links[0].apifoxUrl, undefined);
  assert.equal(withId.links[0].apifoxEndpointId, 42);
  assert.equal(withId.links[0].mockUrl, "https://mock.internal/42");

  const withoutId = buildEndpointLinks({
    endpoints: [endpointStub({ method: "GET", path: "/api/ping", operationId: "DemoController_ping" })],
    imported: [],
    apiBaseUrl: "https://apifox.internal:8080",
    projectId: 1,
  });
  assert.equal(withoutId.mode, "project");
  assert.equal(withoutId.reason, ENDPOINT_LINK_NO_PROJECT_REASON);
  assert.deepEqual(withoutId.links[0], { name: "DemoController_ping", method: "GET", path: "/api/ping" });
});

test("client:buildEndpointLinks 对重复路由判歧义，不猜接口 ID", () => {
  const { buildEndpointLinks, ENDPOINT_LINK_AMBIGUOUS_REASON } = clientApi();
  const links = buildEndpointLinks({
    endpoints: [endpointStub({ method: "GET", path: "/api/ping", operationId: "DemoController_ping" })],
    imported: [
      { id: 1, method: "GET", path: "/api/ping" },
      { id: 2, method: "GET", path: "/api/ping" },
    ],
    apiBaseUrl: "https://api.apifox.com",
    projectId: 1,
  });
  assert.equal(links.mode, "project");
  assert.equal(links.reason, ENDPOINT_LINK_AMBIGUOUS_REASON);
  assert.deepEqual(links.links[0], {
    name: "DemoController_ping",
    method: "GET",
    path: "/api/ping",
    apifoxUrl: "https://app.apifox.com/project/1",
    degraded: true,
  });
});

test("client:buildEndpointLinks 的 operationId 兜底仅限条目无路由且本次唯一", () => {
  const { buildEndpointLinks, ENDPOINT_LINK_NO_MAPPING_REASON } = clientApi();
  const unique = buildEndpointLinks({
    endpoints: [endpointStub({ method: "POST", path: "/api/orders", operationId: "OrderController_create" })],
    imported: [{ id: 9, operationId: "OrderController_create" }],
    apiBaseUrl: "https://api.apifox.com",
    projectId: 1,
  });
  assert.equal(unique.mode, "per-endpoint");
  assert.equal(unique.links[0].apifoxUrl, "https://app.apifox.com/project/1/apis/api-9");

  // 接口侧 operationId 重复：无法判断链接该归给哪一行，宁可不给也不能串错
  const duplicate = buildEndpointLinks({
    endpoints: [
      endpointStub({ method: "GET", path: "/api/a", operationId: "Same_id" }),
      endpointStub({ method: "GET", path: "/api/b", operationId: "Same_id" }),
    ],
    imported: [{ id: 9, operationId: "Same_id" }],
    apiBaseUrl: "https://api.apifox.com",
    projectId: 1,
  });
  assert.equal(duplicate.mode, "project");
  assert.equal(duplicate.reason, ENDPOINT_LINK_NO_MAPPING_REASON);
  assert.deepEqual(
    duplicate.links.map((l) => [l.apifoxUrl, l.degraded, l.apifoxEndpointId]),
    [
      ["https://app.apifox.com/project/1", true, undefined],
      ["https://app.apifox.com/project/1", true, undefined],
    ]
  );

  // 条目自带路由时路由主键优先，operationId 不同也应命中
  const byRoute = buildEndpointLinks({
    endpoints: [endpointStub({ method: "GET", path: "/api/c", operationId: "X_c" })],
    imported: [{ id: 11, method: "GET", path: "/api/c", operationId: "renamed" }],
    apiBaseUrl: "https://api.apifox.com",
    projectId: 1,
  });
  assert.equal(byRoute.links[0].apifoxUrl, "https://app.apifox.com/project/1/apis/api-11");
});

test("client:buildEndpointLinks 部分可定位时为 partial 并合并降级原因", () => {
  const { buildEndpointLinks, ENDPOINT_LINK_NO_MAPPING_REASON } = clientApi();
  const links = buildEndpointLinks({
    endpoints: [
      endpointStub({ method: "GET", path: "/api/a", operationId: "A_a" }),
      endpointStub({ method: "GET", path: "/api/b", operationId: "B_b" }),
    ],
    imported: [{ id: 3, method: "GET", path: "/api/a" }],
    apiBaseUrl: "https://api.apifox.com",
    projectId: 1,
  });
  assert.equal(links.mode, "partial");
  assert.equal(links.reason, ENDPOINT_LINK_NO_MAPPING_REASON);
  assert.deepEqual(
    links.links.map((l) => [l.apifoxUrl, l.degraded]),
    [
      ["https://app.apifox.com/project/1/apis/api-3", undefined],
      ["https://app.apifox.com/project/1", true],
    ]
  );
});

test("client:buildEndpointLinks 空接口清单给空索引", () => {
  const { buildEndpointLinks } = clientApi();
  assert.deepEqual(
    buildEndpointLinks({
      endpoints: [],
      imported: [{ id: 1, method: "GET", path: "/api/ping" }],
      apiBaseUrl: "https://api.apifox.com",
      projectId: 1,
    }),
    { mode: "project", links: [] }
  );
});

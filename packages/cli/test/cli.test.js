const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const CLI = path.join(__dirname, "..", "dist", "cli.js");
const SAMPLE = path.join(__dirname, "..", "..", "..", "sample");

function run(args, env = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    input: "",
  });
}

test("运行版本与发布清单一致", () => {
  const version = require("../package.json").version;
  const result = run(["--version"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), version);
  const config = run(["config", "--project", SAMPLE, "--format", "json"]);
  assert.equal(config.status, 0, config.stderr);
  assert.equal(JSON.parse(config.stdout).version, version);
});

test("--file 按具体 Controller 选中继承端点且不包含其他子类", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-inherited-"));
  const files = {
    "Base.java": 'import org.springframework.web.bind.annotation.*; public abstract class Base { @GetMapping("/items") public String list() {return null;} }',
    "Child.java": 'import org.springframework.web.bind.annotation.*; @RestController @RequestMapping("/child") public class Child extends Base {}',
    "Other.java": 'import org.springframework.web.bind.annotation.*; @RestController @RequestMapping("/other") public class Other extends Base {}',
  };
  try {
    for (const [name, source] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), source);
    const args = ["scan", "--project", dir, "--include", "**/*.java", "--format", "json"];
    const full = run(args);
    assert.equal(full.status, 0, full.stderr);
    assert.equal(JSON.parse(full.stdout).result.endpointCount, 2);
    const selected = run([...args, "--file", "Child.java"]);
    assert.equal(selected.status, 0, selected.stderr);
    const endpoints = JSON.parse(selected.stdout).result.endpoints;
    assert.deepEqual(endpoints.map((endpoint) => endpoint.path), ["/child/items"]);
    const declared = run([...args, "--file", "Base.java"]);
    assert.equal(declared.status, 0, declared.stderr);
    assert.equal(JSON.parse(declared.stdout).result.endpointCount, 2);
  } finally {
    for (const name of Object.keys(files)) fs.unlinkSync(path.join(dir, name));
    fs.rmdirSync(dir);
  }
});

test("scan JSON 输出单一成功信封", () => {
  const result = run(["scan", "--project", SAMPLE, "--format", "json"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, true);
  assert.equal(payload.command, "scan");
  assert.equal(payload.result.scannedFiles, 19);
  assert.equal(payload.result.endpointCount, 25);
});

test("endpoint 筛选只返回目标接口", () => {
  const result = run(["scan", "--project", SAMPLE, "--endpoint", "GET /api/v1/users", "--format", "json"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.result.endpointCount, 1);
  assert.equal(payload.result.endpoints[0].path, "/api/v1/users");
});

test("export 原子写入 OpenAPI 文件", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-export-"));
  const output = path.join(dir, "openapi.json");
  const result = run(["export", "--project", SAMPLE, "--output", output, "--format", "json"]);
  assert.equal(result.status, 0, result.stderr);
  const spec = JSON.parse(fs.readFileSync(output, "utf8"));
  assert.equal(spec.openapi, "3.0.3");
  assert.ok(spec.paths["/api/v1/users"]);
});

test("sync dry-run 不需要 token 且不发请求", () => {
  const result = run(["sync", "--project", SAMPLE, "--project-id", "42", "--dry-run", "--format", "json"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.result.dryRun, true);
  assert.equal(payload.result.target.projectId, 42);
});

test("非 TTY 实际同步未传 --yes 时快速失败", () => {
  const result = run(
    ["sync", "--project", SAMPLE, "--project-id", "42", "--format", "json"],
    { API2APIFOX_TOKEN: "not-a-real-token" }
  );
  assert.equal(result.status, 2);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.error.code, "CONFIRMATION_REQUIRED");
  assert.ok(!result.stdout.includes("not-a-real-token"));
});

test("config 不输出 token 值", () => {
  const result = run(["config", "--project", SAMPLE, "--format", "json"], { API2APIFOX_TOKEN: "very-secret" });
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.result.fields.token.configured, true);
  assert.ok(!result.stdout.includes("very-secret"));
});

test("--timeout-ms 覆盖同步等待上限；非法值被拒绝", () => {
  const ok = run(["config", "--project", SAMPLE, "--timeout-ms", "600000", "--format", "json"]);
  assert.equal(ok.status, 0, ok.stderr);
  const payload = JSON.parse(ok.stdout);
  assert.equal(payload.result.fields.timeoutMs.value, 600000);
  assert.equal(payload.result.fields.timeoutMs.source, "cli");

  const bad = run(["config", "--project", SAMPLE, "--timeout-ms", "0", "--format", "json"]);
  assert.equal(bad.status, 2);
  assert.equal(JSON.parse(bad.stdout).error.code, "INVALID_ARGUMENT");
});

test("默认等待上限允许首次导入较慢的建目录与建模型", () => {
  const result = run(["config", "--project", SAMPLE, "--format", "json"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.result.fields.timeoutMs.value, 300000);
  assert.equal(payload.result.fields.timeoutMs.source, "default");
});

function sampleReport() {
  return {
    projectId: 4242,
    projectUrl: "https://app.apifox.com/project/4242",
    target: "Apifox 项目（ID: 4242）",
    scope: "整个项目",
    finishedAt: "2025-01-01 12:00:00",
    conflict: "接口=自动合并；数据模型=自动合并",
    summary: [
      { category: "接口", created: 2, updated: 1, ignored: 0, failed: 0, total: 3 },
      { category: "数据模型", created: 4, updated: 0, ignored: 0, failed: 0, total: 4 },
    ],
    endpoints: [
      {
        name: "</script><script>alert(1)</script>",
        method: "GET",
        path: "/api/v1/users",
        folder: "系统/UserController",
        controller: "UserController",
        file: "src/main/java/demo/UserController.java",
        fsPath: "D:/demo/src/main/java/demo/UserController.java",
        startOffset: 120,
      },
    ],
    errors: [],
    warnings: ["示例警告"],
  };
}

test("同步报告 HTML 内嵌数据并转义脚本注入", () => {
  const { renderReportHtml } = require("../dist/cli.js");
  const html = renderReportHtml(sampleReport());
  assert.ok(html.includes("同步结果"));
  assert.ok(html.includes("Apifox 项目（ID: 4242）"));
  assert.ok(html.includes("https://app.apifox.com/project/4242"));
  // 接口名里的 </script> 被转义,不会提前闭合脚本标签
  assert.ok(!html.includes("<script>alert(1)"));
  assert.ok(html.includes("\u003c/script>"));
  // 汇总行与警告进入数据载荷
  assert.ok(html.includes("示例警告"));
  assert.ok(html.includes("\"category\":\"接口\""));
});

test("buildCliSyncReport 汇总 Apifox 计数并推导项目链接", () => {
  const { buildCliSyncReport } = require("../dist/cli.js");
  const report = buildCliSyncReport({
    synced: {
      dryRun: false,
      target: { projectId: 4242, apiBaseUrl: "https://api.apifox.com" },
      scope: { type: "workspace", endpointCount: 1 },
      counters: { endpointCreated: 1, endpointUpdated: 2, endpointIgnored: 3, schemaCreated: 1 },
      errors: [{ message: "导入失败示例" }],
    },
    analyzed: {
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/users",
          tag: "UserController",
          operationId: "UserController_list",
          parameters: [],
          fsPath: "D:/demo/src/main/java/demo/UserController.java",
          controller: "UserController",
          flavor: "spring-mvc",
          summary: "用户列表",
        },
      ],
      warnings: [],
    },
    resolved: {
      config: {
        projectRoot: "D:/demo",
        folderNameSource: "controller",
        rootFolderName: "系统",
        endpointConflictBehavior: "AUTO_MERGE",
        schemaConflictBehavior: "AUTO_MERGE",
      },
    },
  });
  assert.equal(report.projectId, 4242);
  assert.equal(report.projectUrl, "https://app.apifox.com/project/4242");
  assert.equal(report.scope, "整个项目");
  assert.deepEqual(
    report.summary.filter((row) => row.category === "接口"),
    [{ category: "接口", created: 1, updated: 2, ignored: 3, failed: 0, total: 6 }]
  );
  assert.equal(report.endpoints[0].folder, "系统/UserController");
  assert.equal(report.endpoints[0].file, "src/main/java/demo/UserController.java");
  assert.deepEqual(report.errors, ["导入失败示例"]);
});

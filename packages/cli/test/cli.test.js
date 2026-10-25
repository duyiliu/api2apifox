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

test("deleteUnmatchedResources 默认关闭并出现在 config 输出中", () => {
  const result = run(["config", "--project", SAMPLE, "--format", "json"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.result.fields.deleteUnmatchedResources.value, false);
  assert.equal(payload.result.fields.deleteUnmatchedResources.source, "default");
});

test("镜像删除 dry-run 需要 token 才能拉取远端清单", () => {
  const result = run([
    "sync",
    "--project",
    SAMPLE,
    "--project-id",
    "42",
    "--dry-run",
    "--delete-unmatched-resources",
    "--format",
    "json",
  ]);
  assert.equal(result.status, 2);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.error.code, "TOKEN_REQUIRED");
  assert.match(payload.error.message, /远端清单/);
});

test("镜像删除拒绝局部接口筛选,避免误删其他来源资源", () => {
  const result = run(
    [
      "sync",
      "--project",
      SAMPLE,
      "--project-id",
      "42",
      "--dry-run",
      "--delete-unmatched-resources",
      "--endpoint",
      "GET /api/v1/users",
      "--format",
      "json",
    ],
    { API2APIFOX_TOKEN: "not-a-real-token" }
  );
  assert.equal(result.status, 2);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.error.code, "DELETE_REQUIRES_WORKSPACE");
  assert.ok(!result.stdout.includes("not-a-real-token"));
});

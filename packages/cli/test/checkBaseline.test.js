/**
 * Issue #39：export --check 基线比对模式。
 *
 * 用 sample 项目真实导出的 OpenAPI 作基线，再人为制造「删端点 / 删必填字段 /
 * 新增可选字段」三种差异，锁定 CLI 层的退出码、JSON 信封和错误码。
 */

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const CLI = path.join(__dirname, "..", "dist", "cli.js");
const SAMPLE = path.join(__dirname, "..", "..", "..", "sample");
const BREAKING_EXIT = 6;

/**
 * 可控夹具：基线由「改动前」源码导出，当前状态由「改动后」源码分析。
 * 只用 sample 做基线无法构造「端点被真正删除」的场景，因为当前分析总会产出它。
 */
function project(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-check-proj-"));
  for (const [relative, content] of Object.entries(files)) {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return {
    root,
    write: (relative, content) => {
      const full = path.join(root, relative);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    },
    remove: (relative) => fs.rmSync(path.join(root, relative), { force: true }),
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

const USER_CONTROLLER = `package demo;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/users")
public class UserController {
  @GetMapping public UserVO get() { return null; }
  @PostMapping public UserVO create(@RequestBody UserCreateRequest body) { return null; }
}
`;
const USER_VO = (fields) => `package demo;
public class UserVO {
${fields.map((field) => `  private ${field};`).join("\n")}
}
`;
const USER_CREATE_REQUEST = `package demo;
import jakarta.validation.constraints.NotBlank;
public class UserCreateRequest {
  @NotBlank private String name;
  private String email;
}
`;

function baselineOf(root) {
  const result = run(["export", "--project", root, "--stdout"]);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function run(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8", input: "" });
}

function json(result) {
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`stdout 不是合法 JSON（退出码 ${result.status}）:\n${result.stdout}\n${result.stderr}`);
  }
}

function exportSpec() {
  const result = run(["export", "--project", SAMPLE, "--stdout"]);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function tempDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-check-"));
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function writeBaseline(root, spec, name = "openapi.old.json") {
  const file = path.join(root, name);
  fs.writeFileSync(file, JSON.stringify(spec, null, 2));
  return file;
}

test("export --check：与自身基线一致时 exit 0，zero changes", () => {
  const fx = tempDir();
  try {
    const baseline = writeBaseline(fx.root, exportSpec());
    const result = run(["export", "--project", SAMPLE, "--baseline", baseline, "--check", "--format", "json"]);
    assert.equal(result.status, 0, result.stderr);
    const payload = json(result);
    assert.equal(payload.ok, true);
    assert.equal(payload.command, "export");
    assert.deepEqual(payload.result.summary, { breaking: 0, compatible: 0, total: 0 });
    assert.deepEqual(payload.result.changes, []);
    assert.equal(payload.result.baseline, baseline);
  } finally {
    fx.cleanup();
  }
});

test("export --check：删除端点 → exit 6 + BREAKING_CHANGES_DETECTED，清单含删除操作", () => {
  const fx = project({
    "src/main/java/demo/UserController.java": USER_CONTROLLER,
    "src/main/java/demo/UserVO.java": USER_VO(["Long id", "String name"]),
    "src/main/java/demo/UserCreateRequest.java": USER_CREATE_REQUEST,
  });
  try {
    const baseline = writeBaseline(fx.root, baselineOf(fx.root));
    fx.write(
      "src/main/java/demo/UserController.java",
      USER_CONTROLLER.replace("  @GetMapping public UserVO get() { return null; }\n", "")
    );
    const result = run([
      "export",
      "--project",
      fx.root,
      "--baseline",
      baseline,
      "--check",
      "--format",
      "json",
    ]);
    const payload = json(result);
    assert.equal(result.status, BREAKING_EXIT, result.stdout);
    assert.equal(payload.ok, false);
    assert.equal(payload.error.code, "BREAKING_CHANGES_DETECTED");
    assert.equal(payload.error.retryable, false);
    assert.ok(payload.error.details.summary.breaking > 0);
    const change = payload.error.details.changes.find((item) => item.kind === "removed-operation");
    assert.ok(change, `应报出删除操作: ${JSON.stringify(payload.error.details.changes)}`);
    assert.equal(change.location, "GET /api/users");
    assert.equal(change.severity, "breaking");
  } finally {
    fx.cleanup();
  }
});

test("export --check：删除端点后仍以同一 --endpoint 比对 → exit 6（CI 常见用法）", () => {
  const fx = project({
    "src/main/java/demo/UserController.java": USER_CONTROLLER,
    "src/main/java/demo/UserVO.java": USER_VO(["Long id", "String name"]),
    "src/main/java/demo/UserCreateRequest.java": USER_CREATE_REQUEST,
  });
  try {
    const baseline = writeBaseline(fx.root, baselineOf(fx.root));
    fx.write(
      "src/main/java/demo/UserController.java",
      USER_CONTROLLER.replace("  @GetMapping public UserVO get() { return null; }\n", "").replace(
        "  @PostMapping public UserVO create(@RequestBody UserCreateRequest body) { return null; }",
        "  @PostMapping public UserVO create(@RequestBody UserCreateRequest body) { return null; }\n  @DeleteMapping public void remove() {}"
      )
    );
    const result = run([
      "export",
      "--project",
      fx.root,
      "--endpoint",
      "GET /api/users",
      "--endpoint",
      "POST /api/users",
      "--baseline",
      baseline,
      "--check",
      "--format",
      "json",
    ]);
    assert.equal(result.status, BREAKING_EXIT, result.stdout.slice(0, 400));
    const changes = json(result).error.details.changes;
    assert.ok(
      changes.some((change) => change.location === "GET /api/users" && change.kind === "removed-operation"),
      JSON.stringify(changes)
    );
  } finally {
    fx.cleanup();
  }
});

test("export --check：删除必填响应字段 → exit 6，字段路径可定位", () => {
  const fx = project({
    "src/main/java/demo/UserController.java": USER_CONTROLLER,
    "src/main/java/demo/UserVO.java": USER_VO(["Long id", "String name"]),
    "src/main/java/demo/UserCreateRequest.java": USER_CREATE_REQUEST,
  });
  try {
    const baseline = writeBaseline(fx.root, baselineOf(fx.root));
    fx.write("src/main/java/demo/UserVO.java", USER_VO(["Long id"]));
    const result = run(["export", "--project", fx.root, "--baseline", baseline, "--check", "--format", "json"]);
    assert.equal(result.status, BREAKING_EXIT, result.stdout);
    const details = json(result).error.details;
    const change = details.changes.find(
      (item) => item.kind === "removed-response-field" && item.field.endsWith("name")
    );
    assert.ok(change, `应定位到 name 字段: ${JSON.stringify(details.changes)}`);
    assert.equal(change.severity, "breaking");
    assert.equal(change.schema, "UserVO");
  } finally {
    fx.cleanup();
  }
});

test("export --check：新增可选字段 → exit 0，归类为 compatible", () => {
  const fx = project({
    "src/main/java/demo/UserController.java": USER_CONTROLLER,
    "src/main/java/demo/UserVO.java": USER_VO(["Long id", "String name"]),
    "src/main/java/demo/UserCreateRequest.java": USER_CREATE_REQUEST,
  });
  try {
    const baseline = writeBaseline(fx.root, baselineOf(fx.root));
    fx.write("src/main/java/demo/UserVO.java", USER_VO(["Long id", "String name", "String nickname"]));
    const result = run(["export", "--project", fx.root, "--baseline", baseline, "--check", "--format", "json"]);
    assert.equal(result.status, 0, result.stdout);
    const payload = json(result);
    assert.equal(payload.ok, true);
    assert.equal(payload.result.summary.breaking, 0);
    assert.ok(payload.result.summary.compatible > 0);
    assert.ok(
      payload.result.changes.some((change) => change.kind === "added-optional-field" && change.field.endsWith("nickname")),
      JSON.stringify(payload.result.changes)
    );
  } finally {
    fx.cleanup();
  }
});

test("export --check：新增必填请求字段 → exit 6", () => {
  const fx = project({
    "src/main/java/demo/UserController.java": USER_CONTROLLER,
    "src/main/java/demo/UserVO.java": USER_VO(["Long id", "String name"]),
    "src/main/java/demo/UserCreateRequest.java": USER_CREATE_REQUEST,
  });
  try {
    const baseline = writeBaseline(fx.root, baselineOf(fx.root));
    fx.write(
      "src/main/java/demo/UserCreateRequest.java",
      USER_CREATE_REQUEST.replace("  private String email;", "  @NotBlank private String email;")
    );
    const result = run(["export", "--project", fx.root, "--baseline", baseline, "--check", "--format", "json"]);
    assert.equal(result.status, BREAKING_EXIT, result.stdout);
    const change = json(result).error.details.changes.find(
      (item) => item.kind === "field-became-required" && item.field.endsWith("email")
    );
    assert.ok(change, JSON.stringify(json(result).error.details.changes));
  } finally {
    fx.cleanup();
  }
});

test("export --check：基线缺失 → exit 2 + BASELINE_NOT_FOUND，不静默通过", () => {
  const fx = tempDir();
  try {
    const result = run([
      "export",
      "--project",
      SAMPLE,
      "--baseline",
      path.join(fx.root, "missing.json"),
      "--check",
      "--format",
      "json",
    ]);
    assert.equal(result.status, 2, result.stdout);
    const payload = json(result);
    assert.equal(payload.ok, false);
    assert.equal(payload.error.code, "BASELINE_NOT_FOUND");
    assert.match(payload.error.message, /基线文件/);
  } finally {
    fx.cleanup();
  }
});

test("export --check：基线不是合法 JSON → exit 2 + BASELINE_INVALID", () => {
  const fx = tempDir();
  try {
    const file = path.join(fx.root, "broken.json");
    fs.writeFileSync(file, "{ not json");
    const result = run(["export", "--project", SAMPLE, "--baseline", file, "--check", "--format", "json"]);
    assert.equal(result.status, 2, result.stdout);
    assert.equal(json(result).error.code, "BASELINE_INVALID");
  } finally {
    fx.cleanup();
  }
});

test("export --check：合法 JSON 但不是 OpenAPI 文档 → BASELINE_INVALID", () => {
  const fx = tempDir();
  try {
    const file = path.join(fx.root, "not-openapi.json");
    fs.writeFileSync(file, JSON.stringify({ hello: "world" }));
    const result = run(["export", "--project", SAMPLE, "--baseline", file, "--check", "--format", "json"]);
    assert.equal(result.status, 2, result.stdout);
    assert.equal(json(result).error.code, "BASELINE_INVALID");
    assert.match(json(result).error.message, /OpenAPI/);
  } finally {
    fx.cleanup();
  }
});

test("export --check：缺少 --baseline → exit 2 + BASELINE_REQUIRED", () => {
  const result = run(["export", "--project", SAMPLE, "--check", "--format", "json"]);
  assert.equal(result.status, 2, result.stdout);
  assert.equal(json(result).error.code, "BASELINE_REQUIRED");
  assert.match(json(result).error.message, /--baseline/);
});

test("export --baseline 不带 --check → exit 2，避免静默忽略", () => {
  const fx = tempDir();
  try {
    const baseline = writeBaseline(fx.root, exportSpec());
    const result = run(["export", "--project", SAMPLE, "--baseline", baseline, "--format", "json"]);
    assert.equal(result.status, 2, result.stdout);
    assert.equal(json(result).error.code, "INVALID_ARGUMENT");
    assert.match(json(result).error.message, /--check/);
  } finally {
    fx.cleanup();
  }
});

test("export --check 与 --stdout / --output 互斥，且不写文件", () => {
  const fx = tempDir();
  try {
    const baseline = writeBaseline(fx.root, exportSpec());
    for (const extra of [["--stdout"], ["--output", path.join(fx.root, "openapi.gen.json")]]) {
      const result = run(["export", "--project", SAMPLE, "--baseline", baseline, "--check", "--format", "json", ...extra]);
      assert.equal(result.status, 2, `${extra.join(" ")}: ${result.stdout}`);
      assert.equal(json(result).error.code, "INVALID_ARGUMENT");
    }
    assert.equal(fs.existsSync(path.join(fx.root, "openapi.gen.json")), false);
  } finally {
    fx.cleanup();
  }
});

test("--check / --baseline 只属于 export：其他命令 exit 2", () => {
  const fx = tempDir();
  try {
    const baseline = writeBaseline(fx.root, exportSpec());
    for (const command of ["scan", "sync", "config"]) {
      for (const extra of [["--check"], ["--check", "--baseline", baseline]]) {
        const result = run([command, "--project", SAMPLE, ...extra, "--format", "json"]);
        assert.equal(result.status, 2, `${command} ${extra.join(" ")}: ${result.stdout}`);
        assert.equal(json(result).error.code, "INVALID_ARGUMENT");
      }
    }
  } finally {
    fx.cleanup();
  }
});

test("export --check text 模式给出人类可读的破坏性/兼容分组", () => {
  const fx = project({
    "src/main/java/demo/UserController.java": USER_CONTROLLER,
    "src/main/java/demo/UserVO.java": USER_VO(["Long id", "String name"]),
    "src/main/java/demo/UserCreateRequest.java": USER_CREATE_REQUEST,
  });
  try {
    const baseline = writeBaseline(fx.root, baselineOf(fx.root));
    fx.write("src/main/java/demo/UserVO.java", USER_VO(["Long id"]));
    const result = run(["export", "--project", fx.root, "--baseline", baseline, "--check"]);
    assert.equal(result.status, BREAKING_EXIT, result.stdout);
    assert.match(result.stdout, /基线比对完成:破坏性 \d+/);
    assert.match(result.stdout, /破坏性变更:/);
    assert.match(result.stdout, /removed-response-field|removed-operation/);
  } finally {
    fx.cleanup();
  }
});

test("export --check 支持相对项目根的基线路径", () => {
  const fx = tempDir();
  try {
    fs.mkdirSync(path.join(SAMPLE, "base"), { recursive: true });
    const spec = exportSpec();
    fs.writeFileSync(path.join(SAMPLE, "base", "openapi.json"), JSON.stringify(spec));
    const result = run(["export", "--project", SAMPLE, "--baseline", "base/openapi.json", "--check", "--format", "json"]);
    assert.equal(result.status, 0, result.stdout);
    assert.equal(json(result).result.baseline, path.join(SAMPLE, "base", "openapi.json"));
  } finally {
    fs.rmSync(path.join(SAMPLE, "base"), { recursive: true, force: true });
    fx.cleanup();
  }
});

const assert = require("node:assert/strict");
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

/**
 * M19/M21:CLI 参数、退出码与配置优先级矩阵。
 *
 * 现有 cli.test.js 有 14 例,但退出码 3(no files/endpoints)没有专门用例,
 * --include/--exclude 替换语义、重复 --file/--endpoint、非法参数形态也未覆盖。
 */

const CLI = path.join(__dirname, "..", "dist", "cli.js");
const SAMPLE = path.join(__dirname, "..", "..", "..", "sample");

function run(args, env = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    input: "",
  });
}

function json(result) {
  return JSON.parse(result.stdout);
}

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-cli-"));
  for (const [relative, content] of Object.entries(files)) {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

const CTRL = (name, prefix) => `package demo;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/${prefix}")
public class ${name} { @GetMapping("/x") public String x(){ return null; } }
`;

/* ---------------- 退出码 0 ---------------- */

test("exit 0:--help 与 -h 输出帮助文本", () => {
  for (const flag of ["--help", "-h"]) {
    const result = run([flag]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /api2apifox/);
    assert.match(result.stdout, /scan|export|sync|config/);
  }
});

test("exit 0:--version 输出纯版本号", () => {
  const version = require("../package.json").version;
  const result = run(["--version"]);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), version);
});

test("exit 0:无子命令时输出总帮助而不是报错", () => {
  const result = run([]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /用法|usage|api2apifox/i);
});

test("exit 0:子命令 --help 输出该命令专属帮助", () => {
  for (const command of ["scan", "export", "sync", "config"]) {
    const result = run([command, "--help"]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.length > 20, `${command} 帮助文本过短`);
    assert.match(result.stdout, new RegExp(command));
  }
});

/* ---------------- 退出码 2:参数错误 ---------------- */

test("exit 2:未知命令与未知参数都是 INVALID_ARGUMENT", () => {
  const unknownCommand = run(["frobnicate", "--format", "json"]);
  assert.equal(unknownCommand.status, 2);
  assert.equal(json(unknownCommand).error.code, "INVALID_ARGUMENT");
  assert.match(json(unknownCommand).error.message, /未知命令/);

  const unknownFlag = run(["scan", "--nope", "--format", "json"]);
  assert.equal(unknownFlag.status, 2);
  assert.equal(json(unknownFlag).error.code, "INVALID_ARGUMENT");
});

test("exit 2:--format 非 text/json 被拒绝(此时无法识别请求格式,回落到 stderr 文本)", () => {
  const result = run(["scan", "--project", SAMPLE, "--format", "yaml"]);
  assert.equal(result.status, 2);
  // 注意:--format 本身非法时 detectRequestedFormat 认不出 json,
  // 因此错误走 stderr 文本而不是 JSON 信封。锁定该行为。
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /--format 只支持 text 或 json/);
  assert.equal(result.stderr.includes("INVALID_ARGUMENT"), false, "文本模式不暴露内部码");
});

test("exit 2:非法数值参数(--project-id 0/-1/abc、--timeout-ms 0、--dependency-max-jars -1)", () => {
  const cases = [
    ["--project-id", "0"],
    ["--project-id", "-1"],
    ["--project-id", "abc"],
    ["--timeout-ms", "0"],
    ["--timeout-ms", "-5"],
    ["--dependency-max-jars", "-1"],
    ["--dependency-max-jars", "1.5"],
  ];
  for (const extra of cases) {
    const result = run(["config", "--project", SAMPLE, "--format", "json", ...extra]);
    assert.equal(result.status, 2, `${extra.join(" ")}: ${result.stdout}`);
    assert.equal(json(result).error.code, "INVALID_ARGUMENT", extra.join(" "));
  }
});

test("exit 2:非法冲突策略被拒绝,错误信息指出具体选项", () => {
  for (const flag of ["--endpoint-conflict", "--schema-conflict"]) {
    const result = run(["config", "--project", SAMPLE, "--format", "json", flag, "OVERWRITE"]);
    assert.equal(result.status, 2);
    const payload = json(result);
    assert.equal(payload.error.code, "INVALID_ARGUMENT");
    assert.match(payload.error.message, new RegExp(flag));
    assert.match(payload.error.message, /OVERWRITE/);
  }
});

test("exit 2:--stdout 与 --format json 互斥", () => {
  const result = run(["export", "--project", SAMPLE, "--stdout", "--format", "json"]);
  assert.equal(result.status, 2);
  assert.equal(json(result).error.code, "INVALID_ARGUMENT");
});

test("exit 2:export 目标已存在且未传 --force 时拒绝覆盖", () => {
  const fx = fixture({});
  try {
    const output = path.join(fx.root, "openapi.gen.json");
    fs.writeFileSync(output, "{}");
    const result = run(["export", "--project", SAMPLE, "--output", output, "--format", "json"]);
    assert.equal(result.status, 2);
    assert.equal(json(result).error.code, "OUTPUT_EXISTS");
    assert.match(json(result).error.message, /--force/);
    // 原文件内容不能被破坏
    assert.equal(fs.readFileSync(output, "utf8"), "{}");
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 退出码 3:没有可同步的内容 ---------------- */

test("exit 3:没有任何 Java 文件 → NO_JAVA_FILES", () => {
  const fx = fixture({ "README.md": "no java" });
  try {
    for (const command of ["scan", "export"]) {
      const result = run([command, "--project", fx.root, "--format", "json"]);
      assert.equal(result.status, 3, `${command}: ${result.stdout}`);
      assert.equal(json(result).error.code, "NO_JAVA_FILES");
      assert.match(json(result).error.message, /include|exclude/);
    }
  } finally {
    fx.cleanup();
  }
});

test("exit 3:有 Java 但没有 REST 接口 → NO_ENDPOINTS_FOUND", () => {
  const fx = fixture({ "src/main/java/demo/Plain.java": "package demo; public class Plain {}" });
  try {
    const result = run(["scan", "--project", fx.root, "--format", "json"]);
    assert.equal(result.status, 3, result.stdout);
    assert.equal(json(result).error.code, "NO_ENDPOINTS_FOUND");
  } finally {
    fx.cleanup();
  }
});

test("exit 3:--file 指定的文件不存在 → NO_ENDPOINT_MATCHED(与 NO_ENDPOINTS_FOUND 区分)", () => {
  const fx = fixture({ "src/main/java/demo/A.java": CTRL("A", "a") });
  try {
    const byFile = run(["scan", "--project", fx.root, "--file", "src/main/java/demo/Missing.java", "--format", "json"]);
    assert.equal(byFile.status, 3, byFile.stdout);
    assert.equal(json(byFile).error.code, "NO_ENDPOINT_MATCHED");

    const byEndpoint = run(["scan", "--project", fx.root, "--endpoint", "GET /nope", "--format", "json"]);
    assert.equal(byEndpoint.status, 3);
    assert.equal(json(byEndpoint).error.code, "NO_ENDPOINT_MATCHED");
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 退出码 4/5:鉴权与网络(不打真实服务) ---------------- */

test("exit 4:真实同步遇 401 是 APIFOX_AUTH_FAILED(在 syncIntegration 中有完整用例)", () => {
  // 这里只锁定「错误码 → 退出码」映射表本身,不打网络:
  // 用不可解析的 baseUrl 制造网络错误,确认是 5 而非 4。
  const result = run(["sync", "--project", SAMPLE, "--project-id", "1", "--yes", "--no-report", "--format", "json"], {
    API2APIFOX_TOKEN: "t",
    API2APIFOX_API_BASE_URL: "http://127.0.0.1:1",
  });
  assert.equal(result.status, 5, result.stdout);
  assert.match(json(result).error.code, /NETWORK_FAILED|REQUEST_TIMEOUT/);
});

/* ---------------- 退出码 7:内部错误 ---------------- */

test("畸形 Java 源码不再中断整次扫描:exit 0,坏文件可诊断,有效文件照常输出", () => {
  // 缺陷 C-D1 修复后的契约(原断言锁定的是"任一文件解析失败 → 整次命令 exit 7/INTERNAL_ERROR")。
  // 现在坏文件被隔离为文件级解析告警:其余文件继续扫描,坏文件出现在 warnings 里可定位。
  const fx = fixture({
    "src/main/java/demo/Good.java": CTRL("Good", "good"),
    "src/main/java/demo/Broken.java": '@RestController @RequestMapping("/b") public class Broken { @GetMapping("/x") public String x() { return "unterminated\n',
  });
  try {
    const result = run(["scan", "--project", fx.root, "--format", "json"]);
    assert.equal(result.status, 0, result.stdout.slice(0, 500) + result.stderr.slice(0, 500));
    const payload = json(result);
    assert.equal(payload.ok, true);
    // 有效文件照常产出接口
    assert.ok(
      payload.result.endpoints.some((item) => item.path === "/good/x"),
      `有效文件接口应存在: ${JSON.stringify(payload.result.endpoints)}`
    );
    // 坏文件可诊断:路径 + 解析器原因都在告警里
    const warnings = payload.warnings.join("\n");
    assert.match(warnings, /Broken\.java/);
    assert.match(warnings, /Java 语法解析失败/);
    assert.match(warnings, /parsing errors|lexing errors/i);
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 配置优先级(CLI 实跑) ---------------- */

test("config 优先级:CLI > 环境变量 > 文件 > 默认值,逐层可观测", () => {
  const fx = fixture({
    ".api2apifox.json": JSON.stringify({
      endpointConflictBehavior: "KEEP_EXISTING",
      projectId: 11,
      timeoutMs: 1234,
      include: ["**/from-file/**/*.java"],
    }),
  });
  try {
    const fileOnly = run(["config", "--project", fx.root, "--format", "json"]);
    assert.equal(fileOnly.status, 0, fileOnly.stderr);
    const f = json(fileOnly).result.fields;
    assert.equal(f.endpointConflictBehavior.value, "KEEP_EXISTING");
    assert.equal(f.endpointConflictBehavior.source, "file:.api2apifox.json");
    assert.equal(f.projectId.value, 11);
    assert.equal(f.timeoutMs.source, "file:.api2apifox.json");
    assert.equal(f.schemaConflictBehavior.source, "default");

    const withEnv = run(["config", "--project", fx.root, "--format", "json"], {
      API2APIFOX_ENDPOINT_CONFLICT: "AUTO_MERGE",
      API2APIFOX_PROJECT_ID: "22",
    });
    const e = json(withEnv).result.fields;
    assert.equal(e.endpointConflictBehavior.value, "AUTO_MERGE");
    assert.equal(e.endpointConflictBehavior.source, "env:API2APIFOX_ENDPOINT_CONFLICT");
    assert.equal(e.projectId.value, 22);
    assert.equal(e.projectId.source, "env:API2APIFOX_PROJECT_ID");

    const withCli = run(
      ["config", "--project", fx.root, "--format", "json", "--endpoint-conflict", "CREATE_NEW", "--project-id", "33"],
      { API2APIFOX_ENDPOINT_CONFLICT: "AUTO_MERGE", API2APIFOX_PROJECT_ID: "22" }
    );
    const c = json(withCli).result.fields;
    assert.equal(c.endpointConflictBehavior.value, "CREATE_NEW");
    assert.equal(c.endpointConflictBehavior.source, "cli");
    assert.equal(c.projectId.value, 33);
    assert.equal(c.projectId.source, "cli");
  } finally {
    fx.cleanup();
  }
});

test("config:--config 指向不存在的文件时 exit 2 + CONFIG_NOT_FOUND", () => {
  const fx = fixture({});
  try {
    const result = run(["config", "--project", fx.root, "--config", "nope.json", "--format", "json"]);
    assert.equal(result.status, 2, result.stdout);
    assert.equal(json(result).error.code, "CONFIG_INVALID");
    assert.match(json(result).error.message, /配置文件不存在/);
  } finally {
    fx.cleanup();
  }
});

/* ---------------- --include / --exclude 替换语义 ---------------- */

test("--include 是整体替换而非追加(默认 src/main/java 范围被丢弃)", () => {
  const fx = fixture({
    "src/main/java/demo/A.java": CTRL("A", "a"),
    "other/demo/B.java": CTRL("B", "b"),
  });
  try {
    const defaults = run(["scan", "--project", fx.root, "--format", "json"]);
    assert.equal(defaults.status, 0, defaults.stderr);
    assert.equal(json(defaults).result.endpointCount, 1, "默认只扫 src/main/java");

    const replaced = run(["scan", "--project", fx.root, "--include", "**/other/**/*.java", "--format", "json"]);
    assert.equal(replaced.status, 0, replaced.stderr);
    assert.equal(json(replaced).result.endpointCount, 1);
    assert.equal(json(replaced).result.endpoints[0].path, "/b/x", "只剩 other 下的接口");
  } finally {
    fx.cleanup();
  }
});

test("--exclude 是整体替换:显式传空范围时默认排除项不再生效", () => {
  const fx = fixture({
    "src/main/java/demo/A.java": CTRL("A", "a"),
    "src/test/java/demo/T.java": CTRL("T", "t"),
  });
  try {
    const withDefaultExclude = run(["scan", "--project", fx.root, "--include", "**/*.java", "--format", "json"]);
    assert.equal(withDefaultExclude.status, 0, withDefaultExclude.stderr);
    assert.deepEqual(json(withDefaultExclude).result.endpoints.map((e) => e.path), ["/a/x"], "默认排除 src/test");

    // 只覆盖 exclude 为「不排除任何东西」的写法:传一个不匹配任何文件的 glob
    const noExclude = run([
      "scan",
      "--project",
      fx.root,
      "--include",
      "**/*.java",
      "--exclude",
      "**/never-matches/**",
      "--format",
      "json",
    ]);
    assert.equal(noExclude.status, 0, noExclude.stderr);
    assert.deepEqual(
      json(noExclude).result.endpoints.map((e) => e.path).sort(),
      ["/a/x", "/t/x"],
      "排除项被整体替换后 src/test 不再被排除"
    );
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 重复 --file / --endpoint ---------------- */

test("重复 --file 取并集;重复 --endpoint 取并集", () => {
  const fx = fixture({
    "src/main/java/demo/A.java": CTRL("A", "a"),
    "src/main/java/demo/B.java": CTRL("B", "b"),
    "src/main/java/demo/C.java": CTRL("C", "c"),
  });
  try {
    const files = run([
      "scan",
      "--project",
      fx.root,
      "--file",
      "src/main/java/demo/A.java",
      "--file",
      "src/main/java/demo/B.java",
      "--format",
      "json",
    ]);
    assert.equal(files.status, 0, files.stderr);
    assert.deepEqual(json(files).result.endpoints.map((e) => e.path).sort(), ["/a/x", "/b/x"]);

    const endpoints = run([
      "scan",
      "--project",
      fx.root,
      "--endpoint",
      "GET /a/x",
      "--endpoint",
      "GET /c/x",
      "--format",
      "json",
    ]);
    assert.equal(endpoints.status, 0, endpoints.stderr);
    assert.deepEqual(json(endpoints).result.endpoints.map((e) => e.path).sort(), ["/a/x", "/c/x"]);
  } finally {
    fx.cleanup();
  }
});

test("重复传入完全相同的 --file 不产生重复接口", () => {
  const fx = fixture({ "src/main/java/demo/A.java": CTRL("A", "a") });
  try {
    const result = run([
      "scan",
      "--project",
      fx.root,
      "--file",
      "src/main/java/demo/A.java",
      "--file",
      "src/main/java/demo/A.java",
      "--format",
      "json",
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(json(result).result.endpointCount, 1);
  } finally {
    fx.cleanup();
  }
});

/* ---------------- scan 输出契约 ---------------- */

test("scan:JSON 信封字段完整且 endpoint 摘要含 folder/controller/file/line", () => {
  const result = run(["scan", "--project", SAMPLE, "--endpoint", "GET /api/v1/users", "--format", "json"]);
  assert.equal(result.status, 0, result.stderr);
  const payload = json(result);
  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.ok, true);
  assert.equal(payload.command, "scan");
  assert.equal(typeof payload.durationMs, "number");
  assert.ok(Array.isArray(payload.warnings));

  const endpoint = payload.result.endpoints[0];
  assert.equal(endpoint.method, "GET");
  assert.equal(endpoint.path, "/api/v1/users");
  assert.equal(endpoint.controller, "UserController");
  assert.ok(endpoint.folder, "必须给出目录(供 x-apifox-folder 对照)");
  assert.match(endpoint.file, /^[^/\\]+.*\.java$/, "file 必须是相对项目根且用 / 分隔");
  assert.ok(!endpoint.file.includes("\\"), "相对路径不能带 Windows 反斜杠");
  assert.equal(typeof endpoint.line, "number");
  assert.equal(endpoint.flavor, "spring-mvc");
});

test("scan:text 格式给出计数摘要;--quiet 隐藏警告", () => {
  const fx = fixture({
    "src/main/java/demo/A.java": `package demo;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/a")
public class A {
  @GetMapping("/x") public String x(Unknown arg) { return null; }
}
`,
  });
  try {
    const verbose = run(["scan", "--project", fx.root]);
    assert.equal(verbose.status, 0, verbose.stderr);
    assert.match(verbose.stdout, /扫描完成/);
    assert.match(verbose.stdout, /1 个接口/);

    const quiet = run(["scan", "--project", fx.root, "--quiet"]);
    assert.equal(quiet.status, 0, quiet.stderr);
    assert.match(quiet.stdout, /扫描完成/);
    assert.ok(quiet.stdout.length <= verbose.stdout.length, "--quiet 不应比普通模式更长");
  } finally {
    fx.cleanup();
  }
});

test("export --stdout 只输出 OpenAPI JSON,不带信封", () => {
  const result = run(["export", "--project", SAMPLE, "--stdout"]);
  assert.equal(result.status, 0, result.stderr);
  const spec = JSON.parse(result.stdout);
  assert.equal(spec.openapi, "3.0.3");
  assert.equal(spec.ok, undefined, "--stdout 不应带 CLI 信封");
  assert.ok(Object.keys(spec.paths).length > 0);
});

test("export --force 覆盖已存在文件,且写入的是完整 JSON(原子写)", () => {
  const fx = fixture({});
  try {
    const output = path.join(fx.root, "out", "openapi.json");
    const first = run(["export", "--project", SAMPLE, "--output", output, "--force", "--format", "json"]);
    assert.equal(first.status, 0, first.stderr);
    const spec = JSON.parse(fs.readFileSync(output, "utf8"));
    assert.equal(spec.openapi, "3.0.3");

    const second = run(["export", "--project", SAMPLE, "--output", output, "--force", "--format", "json"]);
    assert.equal(second.status, 0, second.stderr);
    // 不留临时文件
    assert.deepEqual(fs.readdirSync(path.dirname(output)), ["openapi.json"]);
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 退出码 130:取消(CANCELLED) ---------------- */

// Windows 的 Node 子进程收到 OS 级 SIGINT/SIGTERM 是无条件终止,收不到 JS 事件
// (本机实测 close(code=null, signal=SIGINT)),故 130 无法用子进程信号复现。
// 这里改用导出的 runCli 在进程内 emit SIGINT 事件,完整走一遍
// SIGINT → AbortController → client AbortError → CANCELLED → 130 的真实代码路径;
// POSIX 上 OS 信号触发的也是同一路径(见本文件末尾平台注记用例)。
const { runCli } = require("../dist/cli.js");

function waitFor(cond, message, timeoutMs = 5000) {
  const start = Date.now();
  return (async () => {
    while (!(await cond())) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(message);
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  })();
}

/** 恢复环境变量:直接赋 undefined 会写成字符串 "undefined",必须 delete */
function restoreEnv(key, value) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

/** 挂起响应的 mock server:请求到达后不响应,等待被测进程取消 */
function hangingMockServer() {
  const captured = [];
  const server = http.createServer((req, res) => {
    void res;
    req.resume();
    captured.push({ method: req.method, url: req.url });
  });
  return {
    captured,
    listen: () => new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
    port: () => server.address().port,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections?.();
        server.close(() => resolve());
      }),
  };
}

/** 进程内运行会写 stdout;node --test 的二进制协议帧也会写进同一 stdout,
 * 因此不能整段 JSON.parse —— 用锚点正则提取 CLI 的 JSON 信封 */
function captureStdout() {
  const chunks = [];
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, ...rest) => {
    chunks.push(String(chunk));
    return original(chunk, ...rest);
  };
  return {
    envelope: () => {
      const text = chunks.join("");
      const match = text.match(/\{\s*"schemaVersion"[\s\S]*?\n\}/);
      assert.ok(match, `未捕获到 CLI JSON 信封,捕获内容长度:${text.length}`);
      return JSON.parse(match[0]);
    },
    restore: () => {
      process.stdout.write = original;
    },
  };
}

test("exit 130:sync 请求进行中触发 SIGINT → CANCELLED 信封 + 130", async () => {
  const mock = hangingMockServer();
  await mock.listen();
  const cap = captureStdout();
  const prevToken = process.env.API2APIFOX_TOKEN;
  const prevBase = process.env.API2APIFOX_API_BASE_URL;
  process.env.API2APIFOX_TOKEN = "t-130";
  process.env.API2APIFOX_API_BASE_URL = `http://127.0.0.1:${mock.port()}`;
  try {
    const pending = runCli([
      "sync",
      "--project",
      SAMPLE,
      "--project-id",
      "4242",
      "--yes",
      "--no-report",
      "--format",
      "json",
      "--timeout-ms",
      "60000",
      "--endpoint",
      "GET /api/v1/users",
    ]);
    await waitFor(() => mock.captured.length > 0, "sync 请求未到达 mock server");
    assert.match(mock.captured[0].url, /\/v1\/projects\/4242\/import-openapi/);
    process.emit("SIGINT");
    const code = await pending;
    assert.equal(code, 130, `退出码应为 130,实际 ${code}`);
    const payload = cap.envelope();
    assert.equal(payload.ok, false);
    assert.equal(payload.command, "sync");
    assert.equal(payload.error.code, "CANCELLED");
    assert.match(payload.error.message, /已取消/);
    assert.equal(payload.error.retryable, false, "取消不可重试:同步可能在服务端继续执行");
  } finally {
    cap.restore();
    restoreEnv("API2APIFOX_TOKEN", prevToken);
    restoreEnv("API2APIFOX_API_BASE_URL", prevBase);
    await mock.close();
  }
});

test("exit 130:export 在分析阶段收到 SIGINT → 不写输出文件 + 130", async () => {
  const fx = fixture({});
  const cap = captureStdout();
  const output = path.join(fx.root, "openapi.gen.json");
  try {
    const pending = runCli(["export", "--project", SAMPLE, "--output", output, "--format", "json"]);
    // runCli 注册 SIGINT 监听后立即发信号:analyze 不消费信号,
    // 由 exportResult 的 signal.aborted 检查兜底抛 CANCELLED(写文件之前)。
    process.emit("SIGINT");
    const code = await pending;
    const payload = cap.envelope();
    assert.equal(code, 130, `退出码应为 130,实际 ${code}`);
    assert.equal(payload.ok, false);
    assert.equal(payload.error.code, "CANCELLED");
    assert.equal(fs.existsSync(output), false, "取消后不能留下输出文件");
  } finally {
    cap.restore();
    fx.cleanup();
  }
});

test(
  "exit 130 平台注记:Windows 下 OS 级 SIGINT 直接终止 CLI,不产生 CANCELLED 信封",
  { skip: process.platform !== "win32" },
  async () => {
    const mock = hangingMockServer();
    await mock.listen();
    const child = spawn(
      process.execPath,
      [CLI, "sync", "--project", SAMPLE, "--project-id", "4242", "--yes", "--no-report", "--format", "json", "--endpoint", "GET /api/v1/users"],
      {
        env: { ...process.env, API2APIFOX_TOKEN: "t-130", API2APIFOX_API_BASE_URL: `http://127.0.0.1:${mock.port()}` },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    let stdout = "";
    child.stdout.on("data", (d) => (stdout += d));
    const closed = new Promise((resolve) => child.on("close", (code, signal) => resolve({ code, signal })));
    try {
      await waitFor(() => mock.captured.length > 0, "sync 请求未到达 mock server");
      child.kill("SIGINT");
      const { code, signal } = await closed;
      assert.equal(code, null, "Windows 上被杀进程没有退出码");
      assert.equal(signal, "SIGINT");
      assert.equal(stdout.trim(), "", "Windows 平台差异:OS 级 SIGINT 没有优雅取消信封");
    } finally {
      child.kill("SIGKILL");
      await mock.close();
    }
  }
);

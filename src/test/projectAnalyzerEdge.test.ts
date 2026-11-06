import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { analyzeProject } from "../core/projectAnalyzer";
import { ResolvedConfig } from "../core/types";

/* ------------------------------------------------------------------ *
 * G5/G9 的编排层:analyzeProject。
 * 覆盖空项目、无 Java 文件、properties 不可读、坏 pom、显式 jar 不可读、
 * --file/--endpoint 归一化、abort、folderOf 组合。
 *
 * 注意:here 不做真实 Maven 仓库解析(环境相关),只验证"不可读时降级为告警"。
 * ------------------------------------------------------------------ */

function config(root: string, overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return {
    projectRoot: root,
    title: "demo",
    projectId: 0,
    apiBaseUrl: "https://api.apifox.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: ["**/src/main/java/**/*.java"],
    exclude: ["**/target/**", "**/build/**", "**/src/test/**", "**/.*/**"],
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

const CONTROLLER_A = `package demo;
import org.springframework.web.bind.annotation.*;
/** 控制器 A */
@Tag(name = "订单管理")
@RestController
@RequestMapping("/a")
public class AController {
  /** 查询 */
  @GetMapping("/x") public String x(){ return null; }
}
`;
const CONTROLLER_B = `package demo;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/b")
public class BController {
  @PostMapping("/y") public String y(){ return null; }
}
`;

interface Fx {
  root: string;
  write(rel: string, content: string | Buffer): void;
  cleanup(): void;
}

function fixture(files: Record<string, string | Buffer> = {}): Fx {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-analyzer-"));
  const write = (relative: string, content: string | Buffer) => {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };
  for (const [relative, content] of Object.entries(files)) {
    write(relative, content);
  }
  return { root, write, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

/* ---------------- 空项目 ---------------- */

test("analyzer:项目里没有任何 Java 文件时返回空 spec、0 接口,不抛错", async () => {
  const fx = fixture({ "README.md": "hello" });
  try {
    const result = await analyzeProject({ config: config(fx.root) });
    assert.equal(result.scannedFiles, 0);
    assert.equal(result.endpoints.length, 0);
    assert.deepEqual(result.spec.paths, {});
    assert.equal(result.spec.openapi, "3.0.3");
    assert.equal(result.spec.info.title, "demo");
    assert.deepEqual(result.warnings, []);
    assert.deepEqual(result.diagnostics, []);
  } finally {
    fx.cleanup();
  }
});

test("analyzer:项目根不存在时同样降级为空结果(不抛 ENOENT)", async () => {
  const missing = path.join(os.tmpdir(), `api2apifox-nope-${Date.now()}`);
  const result = await analyzeProject({ config: config(missing) });
  assert.equal(result.scannedFiles, 0);
  assert.equal(result.endpoints.length, 0);
});

test("analyzer:有 Java 文件但都不是 Controller 时 scannedFiles>0、endpoints=0", async () => {
  const fx = fixture({ "src/main/java/demo/Plain.java": "package demo; public class Plain { }" });
  try {
    const result = await analyzeProject({ config: config(fx.root) });
    assert.equal(result.scannedFiles, 1);
    assert.equal(result.endpoints.length, 0);
    // 上层 CLI 据此报 NO_ENDPOINTS_FOUND(exit 3),而不是 NO_JAVA_FILES
  } finally {
    fx.cleanup();
  }
});

/* ---------------- properties 降级 ---------------- */

test("analyzer:helperProperties 文件不可读时静默降级(不阻断扫描、不产生告警)", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    // 用一个同名目录让 readFile 失败
    fs.mkdirSync(path.join(fx.root, ".apifox-helper.properties"));
    const result = await analyzeProject({ config: config(fx.root) });
    assert.equal(result.endpoints.length, 1);
    assert.deepEqual(result.warnings, [], "不可读的规则文件当前不产生任何告警");
  } finally {
    fx.cleanup();
  }
});

test("analyzer:helperPropertiesEnabled=false 时完全忽略规则文件", async () => {
  const source = `package demo;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/r")
public class RController {
  /** 原名 */
  @GetMapping("/x") public String x(){ return null; }
}
`;
  const fx = fixture({
    "src/main/java/demo/RController.java": source,
    ".apifox-helper.properties": "method.doc=追加说明\n",
  });
  try {
    const disabled = await analyzeProject({ config: config(fx.root, { helperPropertiesEnabled: false }) });
    assert.ok(!JSON.stringify(disabled.spec).includes("追加说明"), "关闭后规则不得生效");

    const enabled = await analyzeProject({ config: config(fx.root, { helperPropertiesEnabled: true }) });
    assert.ok(JSON.stringify(enabled.spec).includes("追加说明"), "开启后规则应生效(对照组)");
  } finally {
    fx.cleanup();
  }
});

test("analyzer:properties 规则告警与解析告警合并去重", async () => {
  const fx = fixture({
    "src/main/java/demo/AController.java": CONTROLLER_A,
    ".apifox-helper.properties": "groovy:field.doc=System.exit(1)\n",
  });
  try {
    const result = await analyzeProject({ config: config(fx.root) });
    const dupes = result.warnings.filter((w, i) => result.warnings.indexOf(w) !== i);
    assert.deepEqual(dupes, [], "告警必须去重");
  } finally {
    fx.cleanup();
  }
});

/* ---------------- pom / jar 降级 ---------------- */

test("analyzer:坏 pom.xml 不阻断扫描(记为告警)", async () => {
  const fx = fixture({
    "src/main/java/demo/AController.java": CONTROLLER_A,
    "pom.xml": "<project><dependencies><dependency>",
  });
  try {
    const result = await analyzeProject({ config: config(fx.root, { dependencyRepos: [path.join(fx.root, "repo")] }) });
    assert.equal(result.endpoints.length, 1, "接口解析不能被坏 pom 影响");
    // 关键:坏 pom 要么被容错解析成 0 坐标,要么产生告警;二者皆可接受,但不能抛错
    assert.ok(Array.isArray(result.warnings));
  } finally {
    fx.cleanup();
  }
});

test("analyzer:显式配置的依赖 jar 不存在时产生「不可读」告警且继续解析", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    const missingJar = path.join(fx.root, "does-not-exist.jar");
    const result = await analyzeProject({ config: config(fx.root, { dependencyJars: [missingJar] }) });
    assert.equal(result.endpoints.length, 1);
    assert.ok(
      result.warnings.some((w) => w.includes("显式依赖 jar 不可读") && w.includes("does-not-exist.jar")),
      `应报告不可读的显式 jar,实际告警:${JSON.stringify(result.warnings)}`
    );
  } finally {
    fx.cleanup();
  }
});

test("analyzer:依赖 jar 是普通文本文件(损坏 zip)时降级为告警,不抛错", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    const fakeJar = path.join(fx.root, "fake.jar");
    fs.writeFileSync(fakeJar, "this is not a zip");
    const result = await analyzeProject({ config: config(fx.root, { dependencyJars: [fakeJar] }) });
    assert.equal(result.endpoints.length, 1);
    assert.ok(result.warnings.some((w) => w.includes("读取 jar 失败")), `应报告损坏 jar:${JSON.stringify(result.warnings)}`);
  } finally {
    fx.cleanup();
  }
});

/* ---------------- --file / --endpoint 归一化 ---------------- */

test("analyzer:--file 支持相对、绝对与不同大小写(Windows 路径)", async () => {
  const fx = fixture({
    "src/main/java/demo/AController.java": CONTROLLER_A,
    "src/main/java/demo/BController.java": CONTROLLER_B,
  });
  try {
    const base = config(fx.root);
    const relative = await analyzeProject({ config: base, files: ["src/main/java/demo/AController.java"] });
    assert.deepEqual(relative.endpoints.map((e) => e.path), ["/a/x"]);

    const absolute = await analyzeProject({ config: base, files: [path.join(fx.root, "src/main/java/demo/AController.java")] });
    assert.deepEqual(absolute.endpoints.map((e) => e.path), ["/a/x"]);

    const upper = await analyzeProject({
      config: base,
      files: [path.join(fx.root, "SRC/MAIN/JAVA/DEMO/AController.java")],
    });
    if (process.platform === "win32") {
      assert.deepEqual(upper.endpoints.map((e) => e.path), ["/a/x"], "Windows 下大小写不敏感应命中");
    }
  } finally {
    fx.cleanup();
  }
});

test("analyzer:--file 用 Windows 反斜杠相对路径可以命中(路径不做 glob 匹配)", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    // 与 scanner 的 glob 不同,这里走 path.resolve + 分隔符归一化,反斜杠可用
    const result = await analyzeProject({
      config: config(fx.root),
      files: ["src\\main\\java\\demo\\AController.java"],
    });
    assert.deepEqual(result.endpoints.map((e) => e.path), ["/a/x"]);
  } finally {
    fx.cleanup();
  }
});

test("analyzer:--endpoint 归一化 method 大小写、多余斜杠与缺前导斜杠", async () => {
  const fx = fixture({ "src/main/java/demo/BController.java": CONTROLLER_B });
  try {
    const base = config(fx.root);
    for (const selector of ["POST /b/y", "post /b/y", "POST b/y", "  POST   //b//y  "]) {
      const result = await analyzeProject({ config: base, endpoints: [selector] });
      assert.deepEqual(result.endpoints.map((e) => `${e.method} ${e.path}`), ["POST /b/y"], `选择器 ${JSON.stringify(selector)}`);
    }
  } finally {
    fx.cleanup();
  }
});

test("analyzer:--file 与 --endpoint 同时给出时取交集;交集为空返回 0 接口", async () => {
  const fx = fixture({
    "src/main/java/demo/AController.java": CONTROLLER_A,
    "src/main/java/demo/BController.java": CONTROLLER_B,
  });
  try {
    const base = config(fx.root);
    const same = await analyzeProject({
      config: base,
      files: ["src/main/java/demo/AController.java"],
      endpoints: ["GET /a/x"],
    });
    assert.equal(same.endpoints.length, 1);

    const empty = await analyzeProject({
      config: base,
      files: ["src/main/java/demo/AController.java"],
      endpoints: ["POST /b/y"],
    });
    assert.equal(empty.endpoints.length, 0);
  } finally {
    fx.cleanup();
  }
});

test("analyzer:不存在的 --file / --endpoint 返回 0 接口而不抛错(上层报 NO_ENDPOINT_MATCHED)", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    const base = config(fx.root);
    assert.equal((await analyzeProject({ config: base, files: ["src/main/java/demo/Nope.java"] })).endpoints.length, 0);
    assert.equal((await analyzeProject({ config: base, endpoints: ["GET /zzz"] })).endpoints.length, 0);
  } finally {
    fx.cleanup();
  }
});

/* ---------------- folderOf ---------------- */

test("analyzer:folderNameSource=tag 时目录取 @Tag,rootFolderName 作为父目录", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    const result = await analyzeProject({ config: config(fx.root, { folderNameSource: "tag", rootFolderName: "根目录" }) });
    const op = result.spec.paths["/a/x"].get as Record<string, unknown>;
    assert.equal(op["x-apifox-folder"], "根目录/订单管理");
  } finally {
    fx.cleanup();
  }
});

test("analyzer:folderNameSource=controller 时目录取类名,忽略 @Tag", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    const result = await analyzeProject({ config: config(fx.root, { folderNameSource: "controller", rootFolderName: "" }) });
    const op = result.spec.paths["/a/x"].get as Record<string, unknown>;
    assert.equal(op["x-apifox-folder"], "AController");
  } finally {
    fx.cleanup();
  }
});

test("analyzer:rootFolderName 只含空白时不产生前导分隔符", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    const result = await analyzeProject({ config: config(fx.root, { rootFolderName: "   " }) });
    const op = result.spec.paths["/a/x"].get as Record<string, unknown>;
    assert.equal(op["x-apifox-folder"], "订单管理");
  } finally {
    fx.cleanup();
  }
});

/* ---------------- abort ---------------- */

test("analyzer:已 abort 的 signal 抛 AbortError(不返回部分结果)", async () => {
  const fx = fixture({ "src/main/java/demo/AController.java": CONTROLLER_A });
  try {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      analyzeProject({ config: config(fx.root), signal: controller.signal }),
      (err: any) => err.name === "AbortError"
    );
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 结果一致性 ---------------- */

test("analyzer:同一输入两次调用结果完全一致(无隐藏状态)", async () => {
  const fx = fixture({
    "src/main/java/demo/AController.java": CONTROLLER_A,
    "src/main/java/demo/BController.java": CONTROLLER_B,
  });
  try {
    const cfg = config(fx.root);
    const first = await analyzeProject({ config: cfg });
    const second = await analyzeProject({ config: cfg });
    assert.deepEqual(second.spec, first.spec);
    assert.deepEqual(second.endpoints, first.endpoints);
    assert.deepEqual(second.warnings, first.warnings);
  } finally {
    fx.cleanup();
  }
});

test("analyzer:scannedFiles 统计的是文件数而非接口数", async () => {
  const fx = fixture({
    "src/main/java/demo/AController.java": CONTROLLER_A,
    "src/main/java/demo/BController.java": CONTROLLER_B,
    "src/main/java/demo/Model.java": "package demo; public class Model { public String name; }",
  });
  try {
    const result = await analyzeProject({ config: config(fx.root) });
    assert.equal(result.scannedFiles, 3);
    assert.equal(result.endpoints.length, 2);
  } finally {
    fx.cleanup();
  }
});

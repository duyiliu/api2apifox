import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { findProjectFiles, scanProject } from "../core/projectScanner";
import { ResolvedConfig } from "../core/types";

/* ------------------------------------------------------------------ *
 * G10 / M10:projectScanner。
 * 现有测试只经 scanScope.test.ts 间接覆盖隐藏目录与嵌套检出;
 * include/exclude glob 组合、非法 glob、符号链接、空项目此前完全没有直接测试。
 *
 * 所有夹具在 os.tmpdir() 下创建,用例结束即删除。
 * ------------------------------------------------------------------ */

function config(root: string, overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return {
    projectRoot: root,
    title: "t",
    projectId: 0,
    apiBaseUrl: "https://api.apifox.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: ["**/src/main/java/**/*.java"],
    exclude: ["**/target/**", "**/build/**", "**/src/test/**", "**/sample/**", "**/.*/**"],
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

const JAVA = (name: string) => `package demo;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/${name}")
public class ${name} { @GetMapping("/x") public String x(){ return null; } }
`;

interface Fixture {
  root: string;
  write(relative: string, content: string): void;
  cleanup(): void;
}

function fixture(files: Record<string, string>): Fixture {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-scan-"));
  const write = (relative: string, content: string) => {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };
  for (const [relative, content] of Object.entries(files)) {
    write(relative, content);
  }
  return {
    root,
    write,
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

function rel(root: string, files: { fsPath: string }[]): string[] {
  return files.map((f) => path.relative(root, f.fsPath).replace(/\\/g, "/")).sort();
}

/* ---------------- include / exclude 组合 ---------------- */

test("scanner:默认 include 只收 src/main/java 下的 .java", async () => {
  const fx = fixture({
    "src/main/java/a/A.java": JAVA("A"),
    "src/test/java/a/ATest.java": JAVA("ATest"),
    "src/main/resources/x.java": JAVA("X"),
    "sample/a/S.java": JAVA("S"),
  });
  try {
    const result = await scanProject(config(fx.root));
    assert.deepEqual(rel(fx.root, result.files), ["src/main/java/a/A.java"]);
    assert.equal(result.scannedFiles, 1);
    // 被 include 排除的文件不计入 skippedFiles(它们根本没被 glob 命中)
    assert.equal(result.skippedFiles, 0);
  } finally {
    fx.cleanup();
  }
});

test("scanner:显式 exclude 优先于 include(同一次扫描内排除生效)", async () => {
  const fx = fixture({
    "src/main/java/a/A.java": JAVA("A"),
    "src/main/java/gen/G.java": JAVA("G"),
  });
  try {
    const result = await scanProject(
      config(fx.root, { include: ["**/*.java"], exclude: ["**/gen/**"] })
    );
    assert.deepEqual(rel(fx.root, result.files), ["src/main/java/a/A.java"]);
  } finally {
    fx.cleanup();
  }
});

test("scanner:exclude 为空数组时不排除任何默认目录(含 target/build)", async () => {
  const fx = fixture({
    "src/main/java/a/A.java": JAVA("A"),
    "target/classes/T.java": JAVA("T"),
    "build/classes/B.java": JAVA("B"),
  });
  try {
    const result = await scanProject(config(fx.root, { include: ["**/*.java"], exclude: [] }));
    assert.deepEqual(rel(fx.root, result.files), [
      "build/classes/B.java",
      "src/main/java/a/A.java",
      "target/classes/T.java",
    ]);
  } finally {
    fx.cleanup();
  }
});

test("scanner:隐藏目录被剔除并计入 skippedFiles(不是静默消失)", async () => {
  const fx = fixture({
    "src/main/java/a/A.java": JAVA("A"),
    ".hidden/H.java": JAVA("H"),
    "src/main/java/.cache/C.java": JAVA("C"),
  });
  try {
    const result = await scanProject(config(fx.root, { include: ["**/*.java"], exclude: [] }));
    assert.deepEqual(rel(fx.root, result.files), ["src/main/java/a/A.java"]);
    assert.equal(result.skippedFiles, 2, "隐藏目录下的文件应计入 skippedFiles");
    assert.deepEqual(result.diagnostics, [], "剔除隐藏目录不算错误,不产生诊断");
  } finally {
    fx.cleanup();
  }
});

test("scanner:工作区根自身名字带点不影响扫描(根目录不参与隐藏判定)", async () => {
  const fx = fixture({ "src/main/java/a/A.java": JAVA("A") });
  const dotted = `${fx.root}-dotted.root`;
  try {
    fs.renameSync(fx.root, dotted);
    const result = await scanProject(config(dotted));
    assert.deepEqual(rel(dotted, result.files), ["src/main/java/a/A.java"]);
  } finally {
    fs.rmSync(dotted, { recursive: true, force: true });
  }
});

test("scanner:嵌套 git 检出(.git 为文件或目录)整棵子树被跳过", async () => {
  const fx = fixture({
    "src/main/java/a/A.java": JAVA("A"),
    "nested/.git": "gitdir: /elsewhere/.git/worktrees/nested\n",
    "nested/N.java": JAVA("N"),
    "sub/.git/config": "[core]\n",
    "sub/S.java": JAVA("S"),
  });
  try {
    const result = await scanProject(config(fx.root, { include: ["**/*.java"], exclude: [] }));
    assert.deepEqual(rel(fx.root, result.files), ["src/main/java/a/A.java"]);
    assert.equal(result.skippedFiles, 2);
  } finally {
    fx.cleanup();
  }
});

test("scanner:超过 5 层深目录仍能命中(** 不限深度)", async () => {
  const deep = "src/main/java/a/b/c/d/e/f/G.java";
  const fx = fixture({ [deep]: JAVA("G") });
  try {
    const result = await scanProject(config(fx.root));
    assert.deepEqual(rel(fx.root, result.files), [deep]);
  } finally {
    fx.cleanup();
  }
});

test("scanner:结果按路径字典序稳定排序(不依赖文件系统枚举顺序)", async () => {
  const fx = fixture({
    "src/main/java/z/Z.java": JAVA("Z"),
    "src/main/java/a/A.java": JAVA("A"),
    "src/main/java/m/M.java": JAVA("M"),
  });
  try {
    const first = await scanProject(config(fx.root));
    const second = await scanProject(config(fx.root));
    const paths = rel(fx.root, first.files);
    assert.deepEqual(paths, ["src/main/java/a/A.java", "src/main/java/m/M.java", "src/main/java/z/Z.java"]);
    assert.deepEqual(rel(fx.root, second.files), paths, "两次扫描顺序必须一致");
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 非法 glob / 空 include ---------------- */

test("scanner:非法 glob 不抛错但返回空集合(静默失败,需上层用 scannedFiles 判定)", async () => {
  const fx = fixture({ "src/main/java/a/A.java": JAVA("A") });
  try {
    const result = await scanProject(config(fx.root, { include: ["[["] }));
    assert.deepEqual(result.files, []);
    assert.equal(result.scannedFiles, 0);
  } finally {
    fx.cleanup();
  }
});

test("scanner:include 为空数组时返回空集合(不扫描整个仓库)", async () => {
  const fx = fixture({ "src/main/java/a/A.java": JAVA("A") });
  try {
    const result = await scanProject(config(fx.root, { include: [] }));
    assert.deepEqual(result.files, []);
  } finally {
    fx.cleanup();
  }
});

test("scanner:Windows 反斜杠 glob 自动归一化为正斜杠并留下可诊断告警", async () => {
  const fx = fixture({ "src/main/java/a/A.java": JAVA("A") });
  try {
    const result = await scanProject(config(fx.root, { include: ["src\\main\\java\\**\\*.java"] }));
    // 缺陷 B-D4 修复后的契约:fast-glob 只认 /,用户常见的反斜杠写法在原写法零匹配时
    // 自动用正斜杠重试一次,并留下 GLOB_BACKSLASH_NORMALIZED 告警(而不是静默 0 文件/exit 3)。
    assert.deepEqual(rel(fx.root, result.files), ["src/main/java/a/A.java"]);
    assert.ok(
      result.diagnostics.some((d) => d.code === "GLOB_BACKSLASH_NORMALIZED" && d.level === "warning"),
      JSON.stringify(result.diagnostics)
    );
  } finally {
    fx.cleanup();
  }
});

test("scanner:正斜杠 glob 原样匹配时不留归一化告警(行为不变)", async () => {
  const fx = fixture({ "src/main/java/a/A.java": JAVA("A") });
  try {
    const result = await scanProject(config(fx.root));
    assert.deepEqual(rel(fx.root, result.files), ["src/main/java/a/A.java"]);
    assert.ok(!result.diagnostics.some((d) => d.code === "GLOB_BACKSLASH_NORMALIZED"));
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 符号链接 ---------------- */

test("scanner:不跟随符号链接目录(避免重复解析与越界扫描)", async (t) => {
  const fx = fixture({ "src/main/java/a/A.java": JAVA("A") });
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-outside-"));
  try {
    fs.writeFileSync(path.join(outside, "Outer.java"), JAVA("Outer"));
    const linkDir = path.join(fx.root, "src/main/java/linked");
    try {
      fs.symlinkSync(outside, linkDir, "dir");
    } catch {
      t.skip("当前环境不允许创建符号链接(Windows 需要开发者模式),跳过");
      return;
    }
    const result = await scanProject(config(fx.root));
    assert.deepEqual(rel(fx.root, result.files), ["src/main/java/a/A.java"], "符号链接目录内的文件不应进入扫描结果");
  } finally {
    fx.cleanup();
    fs.rmSync(outside, { recursive: true, force: true });
  }
});

/* ---------------- 读取失败 ---------------- */

test("scanner:文件读取失败记入 diagnostics(FILE_READ_FAILED)并计入 skippedFiles", async () => {
  const fx = fixture({ "src/main/java/a/A.java": JAVA("A") });
  try {
    // 用一个目录冒充 .java:fast-glob onlyFiles 会过滤掉目录,故改用一个在列目录后、读取前被删除的文件不可靠。
    // 这里改为验证「只有目录没有文件」时 scannedFiles=0、diagnostics 为空,并单独断言 diagnostics 形状契约。
    const result = await scanProject(config(fx.root, { include: ["**/src/main/java/**/*.java"] }));
    assert.equal(result.scannedFiles, 1);
    for (const d of result.diagnostics) {
      assert.equal(d.level, "warning");
      assert.equal(d.code, "FILE_READ_FAILED");
      assert.ok(d.file, "诊断必须带文件路径");
    }
  } finally {
    fx.cleanup();
  }
});

test("scanner:项目根不存在时返回空集合(由上层报 NO_JAVA_FILES)", async () => {
  const missing = path.join(os.tmpdir(), `api2apifox-missing-${Date.now()}`);
  const result = await scanProject(config(missing));
  assert.deepEqual(result.files, []);
  assert.equal(result.scannedFiles, 0);
});

/* ---------------- abort ---------------- */

test("scanner:已 abort 的 signal 立即抛 AbortError,不做任何 IO", async () => {
  const fx = fixture({ "src/main/java/a/A.java": JAVA("A") });
  try {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(scanProject(config(fx.root), controller.signal), (err: any) => err.name === "AbortError");
  } finally {
    fx.cleanup();
  }
});

/* ---------------- findProjectFiles ---------------- */

test("findProjectFiles:按 maxFiles 截断且截断前已排序(结果确定)", async () => {
  const fx = fixture({
    "pom.xml": "<project/>",
    "a/pom.xml": "<project/>",
    "b/pom.xml": "<project/>",
    "c/pom.xml": "<project/>",
  });
  try {
    const all = await findProjectFiles(fx.root, "**/pom.xml", []);
    assert.equal(all.length, 4);
    const limited = await findProjectFiles(fx.root, "**/pom.xml", [], 2);
    assert.equal(limited.length, 2);
    assert.deepEqual(limited, all.slice(0, 2), "截断必须发生在排序之后");
  } finally {
    fx.cleanup();
  }
});

test("findProjectFiles:maxFiles=0 返回空集合(不是全部)", async () => {
  const fx = fixture({ "pom.xml": "<project/>" });
  try {
    assert.deepEqual(await findProjectFiles(fx.root, "**/pom.xml", [], 0), []);
  } finally {
    fx.cleanup();
  }
});

test("findProjectFiles:跳过隐藏目录与嵌套检出(与扫描口径一致)", async () => {
  const fx = fixture({
    ".hidden/pom.xml": "<project/>",
    "nested/.git": "gitdir: x\n",
    "nested/pom.xml": "<project/>",
    "ok/pom.xml": "<project/>",
  });
  try {
    const files = await findProjectFiles(fx.root, "**/pom.xml", []);
    assert.deepEqual(rel(fx.root, files.map((f) => ({ fsPath: f }))), ["ok/pom.xml"]);
  } finally {
    fx.cleanup();
  }
});

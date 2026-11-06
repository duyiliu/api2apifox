/**
 * G5：畸形 / 边界 Java 源的健壮性。
 *
 * 验收口径（矩阵 G5）：**不崩溃、有告警或明确跳过**。
 * 修复前的实测行为：任何语法错误文件都会让 analyze() 抛
 * "Sad sad panda, parsing errors detected…"，整次 scan/sync 以 exit 7 失败，
 * 用户无法只同步其余健康接口。本次在 parseJava 做了文件级隔离，
 * 这些用例即该修复的回归防线。
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { SourceFile } from "../java/model";
import { analyze } from "../pipeline";

function file(content: string, fsPath = "/p/A.java"): SourceFile {
  return { fsPath, content };
}

function pathsOf(output: ReturnType<typeof analyze>): string[] {
  return output.endpoints.map((e) => `${e.method} ${e.path}`).sort();
}

const HEALTHY = `import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/ok")
public class OkController {
  @GetMapping("/a")
  public String a() { return null; }
}`;

/* ---------------- 语法损坏：必须隔离为告警，不拖垮其余文件 ---------------- */

test("G5 截断的 Java 文件：跳过该文件并告警，其余文件正常提取", () => {
  const truncated = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/bad")
public class BadController {
  @GetMapping("/b")
  public String b() { ret`;
  const out = analyze([file(HEALTHY, "/p/Ok.java"), file(truncated, "/p/Bad.java")], { title: "t" });

  // 健康文件不受影响
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
  // 必须给出可定位的告警（含文件路径），而不是静默丢文件
  assert.equal(out.warnings.length, 1);
  assert.match(out.warnings[0], /Bad\.java/);
  assert.match(out.warnings[0], /解析失败|已跳过/);
});

test("G5 注解值未闭合：跳过并告警，不抛异常", () => {
  const broken = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping(value="/x")
public class X { @GetMapping("/y" public String y() { return null; } }`;
  const out = analyze([file(broken)], { title: "t" });
  assert.deepEqual(out.endpoints, []);
  assert.equal(out.warnings.length, 1);
  assert.match(out.warnings[0], /解析失败/);
});

test("G5 完全非 Java 内容：跳过并告警", () => {
  const out = analyze([file("\u0000\u0001 not java at all {{{")], { title: "t" });
  assert.deepEqual(out.endpoints, []);
  assert.equal(out.warnings.length, 1);
});

test("G5 空文件：不崩溃、无接口、无告警（空 compilation unit 是合法的）", () => {
  const out = analyze([file("")], { title: "t" });
  assert.deepEqual(out.endpoints, []);
  assert.deepEqual(out.warnings, []);
});

test("G5 多个损坏文件：每个文件一条告警，互不影响", () => {
  const out = analyze(
    [file("class {", "/p/A.java"), file("class {", "/p/B.java"), file(HEALTHY, "/p/Ok.java")],
    { title: "t" }
  );
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
  assert.equal(out.warnings.length, 2);
  assert.ok(out.warnings.some((w) => w.includes("A.java")));
  assert.ok(out.warnings.some((w) => w.includes("B.java")));
});

test("G5 告警去重：同一文件只报一次", () => {
  const out = analyze([file("class {", "/p/A.java")], { title: "t" });
  assert.equal(out.warnings.length, 1);
});

/* ---------------- 编码与行尾 ---------------- */

test("G5 非 UTF-8 字节（已按 utf8 解码）：不崩溃且仍能提取接口", () => {
  // 真实链路里 projectScanner 用 readFile(..., "utf8")，非法字节会变成 U+FFFD
  const withReplacement = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/u")
public class U {
  /** 说明\uFFFD\uFFFD */
  @GetMapping("/a")
  public String a() { return "\uFFFD"; }
}`;
  const out = analyze([file(withReplacement)], { title: "t" });
  assert.deepEqual(pathsOf(out), ["GET /u/a"]);
});

test("G5 CRLF 行尾：路径与接口提取结果与 LF 完全一致", () => {
  const lf = analyze([file(HEALTHY, "/p/A.java")], { title: "t" });
  const crlf = analyze([file(HEALTHY.replace(/\n/g, "\r\n"), "/p/A.java")], { title: "t" });
  assert.deepEqual(pathsOf(crlf), pathsOf(lf));
  assert.equal(crlf.endpoints[0].summary, lf.endpoints[0].summary);
  // jar/schema 名称不应因行尾差异而不同
  assert.deepEqual(Object.keys(crlf.spec.components?.schemas ?? {}), Object.keys(lf.spec.components?.schemas ?? {}));
});

test("G5 CRLF 混合行尾（部分行 CRLF、部分 LF）：仍可解析", () => {
  const mixed = HEALTHY.split("\n").map((line, i) => (i % 2 ? `${line}\r` : line)).join("\n");
  const out = analyze([file(mixed)], { title: "t" });
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
});

/* ---------------- 结构边界 ---------------- */

test("G5 空 Controller（无方法）：0 接口、不崩溃、不产告警", () => {
  const out = analyze(
    [file(`import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/e")
public class E {}`)],
    { title: "t" }
  );
  assert.deepEqual(out.endpoints, []);
  assert.deepEqual(out.warnings, []);
  // 空接口集的 spec 仍应是合法 OpenAPI 文档
  assert.equal((out.spec as { openapi: string }).openapi, "3.0.3");
  assert.deepEqual((out.spec as { paths: Record<string, unknown> }).paths, {});
});

test("G5 自引用泛型 class A<T extends A<T>>：不崩溃，接口可提取", () => {
  const out = analyze(
    [file(`import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/s")
public class A<T extends A<T>> {
  @GetMapping("/self")
  public A<T> self() { return null; }
}`)],
    { title: "t" }
  );
  assert.deepEqual(pathsOf(out), ["GET /s/self"]);
});

test("G5 200 层嵌套内部类：不崩溃（超深嵌套无法解析时降级为告警）", () => {
  let nested = "";
  for (let i = 0; i < 200; i++) nested += `public static class C${i} { `;
  nested += "public String f;";
  for (let i = 0; i < 200; i++) nested += " }";
  const source = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/n")
public class N { @GetMapping("/a") public C0 a() { return null; } }
class C0 { ${nested} }`;

  // 断言的是"不抛异常且给出结构化结果"，而非特定接口数：
  // java-parser 对超深嵌套的处理属黑盒行为，产品此处只承诺不崩。
  const out = analyze([file(source)], { title: "t" });
  assert.ok(Array.isArray(out.endpoints));
  assert.ok(Array.isArray(out.warnings));
});

test("G5 深层泛型链不影响同批健康文件解析", () => {
  let generics = "String";
  for (let i = 0; i < 30; i++) generics = `List<${generics}>`;
  const deep = `import java.util.List;
import org.springframework.web.bind.annotation.*;
public class Deep { public ${generics} f; }`;
  const out = analyze([file(deep, "/p/Deep.java"), file(HEALTHY, "/p/Ok.java")], { title: "t" });
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
});

test("G5 极端方法数（500 个接口）：全部提取且不超时", () => {
  const methods = Array.from({ length: 500 }, (_, i) => `  @GetMapping("/m${i}") public String m${i}() { return null; }`).join("\n");
  const source = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/many")
public class Many {
${methods}
}`;
  const started = Date.now();
  const out = analyze([file(source)], { title: "t" });
  assert.equal(out.endpoints.length, 500);
  assert.ok(Date.now() - started < 10_000, "500 接口解析耗时异常");
});

test("G5 超长路径与超长类名：不崩溃", () => {
  const longPath = `/${"a".repeat(1000)}/${"b".repeat(1000)}`;
  const longName = `Very${"Long".repeat(80)}Controller`;
  const out = analyze(
    [file(`import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("${longPath}")
public class ${longName} {
  @GetMapping("/x") public String x() { return null; }
}`)],
    { title: "t" }
  );
  assert.equal(out.endpoints.length, 1);
  assert.ok(out.endpoints[0].path.length > 2000);
});

/* ---------------- analyzeSubset 路径同样隔离 ---------------- */

test("G5 analyzeSubset：损坏文件不阻断子集过滤", () => {
  // pipeline 的 run() 与 runCached() 是两份相似实现，必须同时有隔离
  const { analyzeSubset } = require("../pipeline") as typeof import("../pipeline");
  const out = analyzeSubset(
    [file(HEALTHY, "/p/Ok.java"), file("class {", "/p/Bad.java")],
    { title: "t" },
    (ep) => ep.path === "/ok/a"
  );
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
  // 子集过滤会过滤掉未选中控制器的告警，但损坏文件的告警不含控制器名，应保留
  assert.ok(out.warnings.some((w) => w.includes("Bad.java")));
});

/* ---------------- 解析失败告警是项目级事实：子集模式也必须保留 ---------------- */

const BROKEN = "class {";

function hasParseErrorWarning(warnings: string[], name: string): boolean {
  return warnings.some((w) => w.includes(`${name}:`) && /解析失败/.test(w));
}

/**
 * 坏文件名为 *Controller.java 且 fsPath 是裸文件名时，告警文本
 * `UserController.java: Java 语法解析失败...` 会命中 filterWarningsForEndpoints
 * 的形式 1 正则（^Controller.method:），被当成 UserController 的方法级归属告警，
 * 在子集模式下误删——用户看不到坏文件的存在。解析失败告警必须按全局事实保留。
 */
test("G5 子集模式保留解析失败告警：坏文件名为 *Controller.java（裸文件名，形式 1 误删形态）", () => {
  const { analyzeSubset } = require("../pipeline") as typeof import("../pipeline");
  const out = analyzeSubset(
    [file(HEALTHY, "OkController.java"), file(BROKEN, "UserController.java")],
    { title: "t" },
    (ep) => ep.path === "/ok/a"
  );
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
  assert.ok(
    hasParseErrorWarning(out.warnings, "UserController.java"),
    `Controller 命名坏文件的解析告警被误删:${JSON.stringify(out.warnings)}`
  );
});

test("G5 全量模式保留解析失败告警：坏文件名为 *Controller.java（裸文件名）", () => {
  const out = analyze([file(HEALTHY, "OkController.java"), file(BROKEN, "UserController.java")], { title: "t" });
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
  assert.ok(hasParseErrorWarning(out.warnings, "UserController.java"), JSON.stringify(out.warnings));
});

test("G5 子集模式保留解析失败告警：普通名坏文件", () => {
  const { analyzeSubset } = require("../pipeline") as typeof import("../pipeline");
  const out = analyzeSubset(
    [file(HEALTHY, "/p/Ok.java"), file(BROKEN, "/p/Utils.java")],
    { title: "t" },
    (ep) => ep.path === "/ok/a"
  );
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
  assert.ok(hasParseErrorWarning(out.warnings, "/p/Utils.java"), JSON.stringify(out.warnings));
});

test("G5 全量模式保留解析失败告警：普通名坏文件", () => {
  const out = analyze([file(HEALTHY, "/p/Ok.java"), file(BROKEN, "/p/Utils.java")], { title: "t" });
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
  assert.ok(hasParseErrorWarning(out.warnings, "/p/Utils.java"), JSON.stringify(out.warnings));
});

/** 扩展/CLI 的真实 fsPath 是绝对路径：子集模式下同样必须保留 */
test("G5 子集模式保留解析失败告警：绝对路径下的 *Controller.java 坏文件（扩展/CLI 真实形态）", () => {
  const { analyzeSubset } = require("../pipeline") as typeof import("../pipeline");
  const out = analyzeSubset(
    [file(HEALTHY, "/p/GoodController.java"), file(BROKEN, "/p/UserController.java")],
    { title: "t" },
    (ep) => ep.path === "/ok/a"
  );
  assert.deepEqual(pathsOf(out), ["GET /ok/a"]);
  assert.ok(hasParseErrorWarning(out.warnings, "/p/UserController.java"), JSON.stringify(out.warnings));
});

/** runCached（AnalyzeCache）与 run 是两份实现，缓存路径同样锁定 */
test("G5 AnalyzeCache.analyzeSubset 保留解析失败告警（缓存路径同口径）", async () => {
  const { AnalyzeCache } = await import("../pipeline");
  const cache = new AnalyzeCache();
  const out = cache.analyzeSubset(
    [file(HEALTHY, "OkController.java"), file(BROKEN, "UserController.java")],
    { title: "t" },
    (ep) => ep.path === "/ok/a"
  );
  assert.ok(hasParseErrorWarning(out.warnings, "UserController.java"), JSON.stringify(out.warnings));
  // 缓存命中（第二次同 key 调用）不丢告警
  const again = cache.analyzeSubset(
    [file(HEALTHY, "OkController.java"), file(BROKEN, "UserController.java")],
    { title: "t" },
    (ep) => ep.path === "/ok/a"
  );
  assert.ok(hasParseErrorWarning(again.warnings, "UserController.java"), JSON.stringify(again.warnings));
});

/** 回归护栏：修好后，误删形态（裸文件名 Controller 坏文件 + 子集）必须留有告警 */
test("G5 误删形态回归：即使 kept 为空，解析失败告警也不因过滤而消失", () => {
  const { analyzeSubset } = require("../pipeline") as typeof import("../pipeline");
  // 过滤条件一个都不命中 → kept 为空；此时所有方法级告警都会被过滤，但解析失败告警必须保留
  const out = analyzeSubset(
    [file(HEALTHY, "/p/Ok.java"), file(BROKEN, "UserController.java")],
    { title: "t" },
    () => false
  );
  assert.deepEqual(out.endpoints, []);
  assert.ok(hasParseErrorWarning(out.warnings, "UserController.java"), JSON.stringify(out.warnings));
});

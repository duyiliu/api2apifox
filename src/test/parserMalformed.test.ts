import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze, analyzeSubset } from "../pipeline";
import { parseJava } from "../java/typeIndex";
import { SourceFile } from "../java/model";

/* ------------------------------------------------------------------ *
 * 反例与边界:畸形 / 非主流 Java 源码。
 *
 * 目的不是"证明解析器完美",而是把**当前真实行为**钉住:
 *  - 单个文件解析失败时,坏文件被隔离为文件级告警(warnings 含路径与解析器原因),
 *    其余文件照常产出接口(scan/analyze 不再整批失败);
 *  - 哪些畸形会被静默跳过;
 *  - 哪些"看起来畸形"其实被正确接受。
 *
 * 断言的依据全部来自实测(见 work/测试报告)。旧契约"单文件解析失败 → 整次扫描
 * exit 7/INTERNAL_ERROR"是缺陷 C-D1;修复后改为本文件的断言。若产品回退到此行为,
 * 这些用例会失败 —— 那正是需要显式复核的契约变更信号。
 * ------------------------------------------------------------------ */

function src(name: string, content: string): SourceFile {
  return { fsPath: `/proj/src/main/java/demo/${name}`, content };
}

const PARSE_ERROR_HINT = /lexing errors|parsing errors/i;

/** 断言 analyze 对单个畸形文件不抛错:0 接口 + 一条可定位的文件级解析告警 */
function assertIsolatedFailure(name: string, content: string, hint: RegExp): void {
  const out = analyze([src(name, content)], "t");
  assert.equal(out.endpoints.length, 0, `${name} 不应产出接口`);
  assert.equal(out.warnings.length, 1, `${name} 应恰好一条告警: ${JSON.stringify(out.warnings)}`);
  const warning = out.warnings[0];
  assert.ok(warning.includes(name), `告警应包含文件名: ${warning}`);
  assert.match(warning, /Java 语法解析失败/);
  assert.match(warning, hint);
}

/* ---------------- 坏文件被隔离(不再整批失败) ---------------- */

test("畸形源码:未闭合字符串字面量被隔离为文件级告警", () => {
  // java-parser 抛 "lexing errors detected";parseJava 捕获后返回空 CST + parseError,
  // analyze 继续处理其余文件,把坏文件写进 warnings(含解析器原始原因)。
  assertIsolatedFailure(
    "Broken.java",
    `import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/t")
public class Broken { @GetMapping("/a") public String a() { return "x
`,
    PARSE_ERROR_HINT
  );
});

test("畸形源码:未闭合注解括号被隔离为文件级告警", () => {
  assertIsolatedFailure("BadAnno.java", `@RestController @RequestMapping("/t" public class BadAnno { }`, /parsing errors/i);
});

test("畸形源码:未闭合类体被隔离为文件级告警", () => {
  assertIsolatedFailure(
    "Unclosed.java",
    `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/u") public class Unclosed { @GetMapping("/x") public String x(){return null;}
`,
    /parsing errors/i
  );
});

test("畸形源码:缺分号的 return 被隔离为文件级告警", () => {
  assertIsolatedFailure(
    "NoSemi.java",
    `@RestController public class NoSemi { @GetMapping("/n") public String n() { return null } }`,
    /parsing errors/i
  );
});

test("畸形源码:非法泛型边界(extends 后为空)被隔离为文件级告警", () => {
  assertIsolatedFailure("BadGeneric.java", `@RestController public class BadGeneric<T extends> { }`, /parsing errors/i);
});

test("畸形源码:BOM 开头文件被隔离,同批有效文件照常解析(Windows 编辑器常见)", () => {
  // 实测:BOM 未被剥离,解析器在第 1 行第 1 列报错,错误信息里不含文件名 ——
  // 因此告警必须带上文件路径,否则用户无从定位。
  const out = analyze(
    [
      src("Bom.java", `\uFEFFimport org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/b") public class Bom { @GetMapping("/x") public String x(){return null;} }
`),
      src("BomOk.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/ok") public class BomOk { @GetMapping("/y") public String y(){return null;} }
`),
    ],
    "t"
  );
  assert.deepEqual(out.endpoints.map((e) => e.path), ["/ok/y"]);
  assert.equal(out.warnings.length, 1, JSON.stringify(out.warnings));
  assert.match(out.warnings[0], /Bom\.java/);
  assert.match(out.warnings[0], PARSE_ERROR_HINT);
});

test("畸形源码:非 UTF-8 字节落在代码位置时坏文件被隔离(注释里的损坏仍静默接受)", () => {
  // 关键发现:GBK 注释被按 UTF-8 读入后变成 U+FFFD 替换字符,落在注释里**不会报错**
  // (编码错误被静默接受,告警里看不到任何痕迹);
  // 同样的坏字节落在代码位置则成为词法错误 —— 现在只隔离该文件,不再拖垮整次分析。
  const gbkComment = Buffer.from([0x2f, 0x2f, 0xd6, 0xd0, 0xce, 0xc4, 0x0a]).toString("utf8");
  const silent = analyze(
    [src("Gbk.java", `${gbkComment}import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/g") public class Gbk { @GetMapping("/x") public String x(){return null;} }
`)],
    "t"
  );
  assert.equal(silent.endpoints.length, 1, "注释里的编码损坏被静默接受(无告警)");
  assert.ok(silent.warnings.every((w) => !/编码|UTF-8|encoding/i.test(w)), "当前不会报告编码问题");

  assertIsolatedFailure(
    "GbkCode.java",
    `@RestController\uFFFD\n@RequestMapping("/g") public class GbkCode { }`,
    PARSE_ERROR_HINT
  );
});

test("坏文件 + 有效文件混合:有效接口照常产出,坏文件在子集模式下也不被过滤", () => {
  const files = [
    src("Ok.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/ok") public class Ok { @GetMapping("/x") public String x(){return null;} }
`),
    src("Broken.java", `@RestController @RequestMapping("/b") public class Broken { @GetMapping("/x") public String x() { return "unterminated
`),
  ];
  const all = analyze(files, "t");
  assert.deepEqual(all.endpoints.map((e) => e.path), ["/ok/x"]);
  assert.ok(all.warnings.some((w) => w.includes("Broken.java")));

  const subset = analyzeSubset(files, { title: "t" }, (ep) => ep.controller === "Ok");
  assert.deepEqual(subset.endpoints.map((e) => e.path), ["/ok/x"]);
  assert.ok(subset.warnings.some((w) => w.includes("Broken.java")), "子集模式也必须保留解析失败告警");
});

/* ---------------- 被正确接受 / 被静默跳过的边界 ---------------- */

test("边界:空文件与纯注释文件不产生接口,也不抛错", () => {
  for (const [name, content] of [
    ["Empty.java", ""],
    ["OnlyComment.java", "// nothing here\n/* block */\n"],
    ["Whitespace.java", "   \n\t\n"],
  ] as [string, string][]) {
    const out = analyze([src(name, content)], "t");
    assert.equal(out.endpoints.length, 0, `${name} 不应产生接口`);
    assert.deepEqual(out.warnings, [], `${name} 不应产生告警`);
  }
});

test("边界:非 Controller 的普通类被静默忽略(不报错、不告警)", () => {
  const out = analyze([src("Plain.java", "public class Plain { public void x(){} }")], "t");
  assert.equal(out.endpoints.length, 0);
  assert.deepEqual(out.warnings, []);
});

test("边界:Controller 类没有任何映射方法时不产生接口、不告警", () => {
  const out = analyze([src("EmptyController.java", `import org.springframework.web.bind.annotation.*;@RestController public class EmptyController { public void helper(){} }`)], "t");
  assert.equal(out.endpoints.length, 0);
  assert.deepEqual(out.warnings, []);
});

test("边界:CRLF 换行与 LF 结果一致(Windows 源码)", () => {
  const lf = `import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/c")
public class C {
  @GetMapping("/x") public String x(){return null;}
}
`;
  const crlf = lf.replace(/\n/g, "\r\n");
  const a = analyze([src("C.java", lf)], "t");
  const b = analyze([src("C.java", crlf)], "t");
  assert.deepEqual(b.endpoints.map((e) => `${e.method} ${e.path}`), a.endpoints.map((e) => `${e.method} ${e.path}`));
  assert.equal(b.endpoints.length, 1);
});

test("边界:数组形态的注解值展开为多条路径(笛卡尔积)", () => {
  const out = analyze(
    [
      src("Multi.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping(path = {"/a", "/b"}) public class Multi {
  @GetMapping(value = {"/x", "/y"}, produces = {"application/json"}) public String x(){return null;}
}
`),
    ],
    "t"
  );
  assert.deepEqual(
    out.endpoints.map((e) => e.path).sort(),
    ["/a/x", "/a/y", "/b/x", "/b/y"]
  );
  assert.ok(out.endpoints.every((e) => e.produces?.includes("application/json")));
});

test("边界:类级映射缺 value 时路径退化为空前缀(不报错)", () => {
  const out = analyze(
    [src("NoPath.java", `import org.springframework.web.bind.annotation.*;@RestController @RequestMapping("/p") public class NoPath { @GetMapping public String x(){return null;} }`)],
    "t"
  );
  assert.deepEqual(out.endpoints.map((e) => `${e.method} ${e.path}`), ["GET /p"]);
});

test("边界:中文路径与中文接口名原样保留,不被转义或丢弃", () => {
  const out = analyze(
    [src("Zh.java", `import org.springframework.web.bind.annotation.*;@RestController @RequestMapping("/中文/路径") public class Zh { @GetMapping("/接口") public String x(){return null;} }`)],
    "t"
  );
  assert.deepEqual(out.endpoints.map((e) => e.path), ["/中文/路径/接口"]);
  assert.ok(out.spec.paths["/中文/路径/接口"], "spec.paths 必须使用原始中文键");
});

test("边界:40 层嵌套内部类不会栈溢出或超时", () => {
  let open = "";
  let close = "";
  for (let i = 0; i < 40; i++) {
    open += ` public static class L${i} { public String v${i};`;
    close += "}";
  }
  const source = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/d") public class Deep { @GetMapping("/x") public Deep get(){return null;} }
public class DeepBody {${open}${close}}
`;
  const started = Date.now();
  const out = analyze([src("Deep.java", source)], "t");
  assert.equal(out.endpoints.length, 1);
  assert.ok(Date.now() - started < 5_000, "深层嵌套不应拖垮解析");
});

test("边界:自引用泛型 class A<T extends A<T>> 能完成解析且不无限递归", () => {
  const out = analyze(
    [
      src("SelfGeneric.java", `
import org.springframework.web.bind.annotation.*;
class A<T extends A<T>> { public T self; public String name; }
@RestController @RequestMapping("/g") class SelfGeneric { @GetMapping("/x") public A<SelfGeneric> x(){return null;} }
`),
    ],
    "t"
  );
  assert.equal(out.endpoints.length, 1);
  const schemas = out.spec.components?.schemas ?? {};
  assert.ok(Object.keys(schemas).length > 0, "至少应生成一个模型");
  // 模型里必须出现被展开的字段,且没有因递归而丢失
  const json = JSON.stringify(schemas);
  assert.ok(json.includes('"name"'), "name 字段应被展开");
});

test("边界:同名类型在不同文件重复声明时,后者覆盖索引但不抛错", () => {
  const files = [
    src("a/Dup.java", `import org.springframework.web.bind.annotation.*;@RestController @RequestMapping("/one") public class Dup { @GetMapping("/x") public String x(){return null;} }`),
    src("b/Dup.java", `import org.springframework.web.bind.annotation.*;@RestController @RequestMapping("/two") public class Dup { @GetMapping("/y") public String y(){return null;} }`),
  ];
  const out = analyze(files, "t");
  // 类型索引按简单名以"后扫到的覆盖"登记;两处端点仍都会被解析出来
  assert.deepEqual(out.endpoints.map((e) => e.path).sort(), ["/one/x", "/two/y"]);
});

test("边界:解析同一份源码两次得到完全一致的 spec(解析无隐蔽状态)", () => {
  const file = src("Stable.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/s") public class Stable {
  @GetMapping("/a") public String a(){return null;}
  @PostMapping("/b") public String b(){return null;}
}
`);
  assert.deepEqual(analyze([file], "t").spec, analyze([file], "t").spec);
});

test("边界:parseJava 对空字符串不抛错(底层契约,供上层降级使用)", () => {
  const parsed = parseJava("/p/Empty.java", "");
  assert.equal(parsed.source, "");
  assert.ok(parsed.cst, "应返回 CST 结构而不是 undefined");
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { loadPropertiesFiles, parseProperties, unescapeProp } from "../config/helperProperties";
import { evalCondition, evalRuleValue, trySafeGroovy } from "../java/ruleEval";
import { AnnotationInfo } from "../java/model";

const NOOP = () => {};

/* ---------- properties 语法 ---------- */

test("properties:key=value 与 key:value", () => {
  const r = parseProperties("a=1\nb: 2");
  assert.equal(r.entries.length, 2);
  assert.deepEqual(
    r.entries.map((e) => [e.key, e.value]),
    [
      ["a", "1"],
      ["b", "2"],
    ]
  );
});

test("properties:条件后缀 key[cond]=value", () => {
  const r = parseProperties('field.doc[@ext.plus.common.core.annotation.DataDic]=groovy: "（框架字典：" + it.ann("X","value") + "）"');
  assert.equal(r.entries[0].key, "field.doc");
  assert.equal(r.entries[0].cond, "@ext.plus.common.core.annotation.DataDic");
  assert.ok(r.entries[0].value.startsWith("groovy:"));
});

test("properties:反斜杠续行与多行 ```", () => {
  const cont = parseProperties("a=1\\\n  2");
  assert.equal(cont.entries[0].value, "12");
  const multi = parseProperties('b=groovy:```\nlogger.info("hi")\n```');
  assert.equal(multi.entries[0].key, "b");
  assert.ok(multi.entries[0].value.includes('logger.info("hi")'));
  assert.ok(multi.entries[0].value.startsWith("groovy:"));
});

test("properties:注释与空行", () => {
  const r = parseProperties("# 注释\n\n! 另一注释\na=1");
  assert.equal(r.entries.length, 1);
  assert.equal(r.entries[0].key, "a");
});

test("properties:value 中保留中文", () => {
  const r = parseProperties('a="（枚举类：" + x + "）"');
  assert.ok(r.entries[0].value.includes("（枚举类："));
});

test("unescapeProp \\uXXXX 与 \\n", () => {
  assert.equal(unescapeProp("\\u4e2d\\u6587"), "中文");
  assert.equal(unescapeProp("a\\nb"), "a\nb");
});

/* ---------- 规则求值 ---------- */

const DIC_ANN: AnnotationInfo = { name: "DataDic", raw: '@DataDic(value = "FMJG")', args: { value: "FMJG" } };
const FQCN_ANN: AnnotationInfo = { name: "DataDic", raw: '@ext.plus.common.core.annotation.DataDic(value = "EXT_SEX")', args: { value: "EXT_SEX" } };

test("值语法:#tag 读 javadoc", () => {
  const r = evalRuleValue("#folder", { annotations: [], javadocRaw: "/**\n * @folder 用户相关/一级\n */", subject: "m" }, "folder.name", NOOP);
  assert.equal(r.value, "用户相关/一级");
});

test("值语法:@注解#属性 读注解值", () => {
  const r = evalRuleValue("@ext.plus.common.core.annotation.DataDic#value", { annotations: [FQCN_ANN], subject: "f" }, "field.doc", NOOP);
  assert.equal(r.value, "EXT_SEX");
});

test("值语法:字面量", () => {
  const r = evalRuleValue("用户管理", { annotations: [], subject: "c" }, "folder.name", NOOP);
  assert.equal(r.value, "用户管理");
});

test("条件:@注解 存在/取反/不存在", () => {
  const ctx = { annotations: [DIC_ANN], subject: "f" };
  assert.equal(evalCondition("@ext.plus.common.core.annotation.DataDic", ctx, "k", NOOP).hit, true);
  assert.equal(evalCondition("!@ext.plus.common.core.annotation.DataDic", ctx, "k", NOOP).hit, false);
  assert.equal(evalCondition("@com.other.Ann", ctx, "k", NOOP).hit, false);
  assert.equal(evalCondition("!@com.other.Ann", ctx, "k", NOOP).hit, true);
  assert.equal(evalCondition("@DataDic", ctx, "k", NOOP).hit, true);
});

test("条件:groovy 条件不可安全求值→ supported=false", () => {
  const r = evalCondition("groovy:it.hasAnn('x')", { annotations: [], subject: "c" }, "k", NOOP);
  assert.equal(r.supported, false);
});

test("safe groovy:三元小驼峰枚举名已支持安全求值", () => {
  const script = `(it.name()?.length() > 0 && Character.isLowerCase(it.name().charAt(0)) && helper.findClass(it.type()?.name())?.isEnum()) ? "（枚举类：" + it.type()?.name()?.substring(it.type()?.name()?.lastIndexOf('.') + 1) + "）" : null`;
  // 1. 非枚举字段:matched=false,但已可安全识别(非 unsupported)
  const rNonEnum = trySafeGroovy(script, { annotations: [], subject: "f", fieldName: "genderCode", isEnum: false });
  assert.equal(rNonEnum.matched, false);
  assert.equal(rNonEnum.unsupported, undefined);

  // 2. 枚举字段:matched=true,产出枚举名
  const rEnum = trySafeGroovy(script, { annotations: [], subject: "f", fieldName: "genderCode", isEnum: true, enumSimpleName: "GenderEnum" });
  assert.equal(rEnum.matched, true);
  assert.equal(rEnum.value, "（枚举类：GenderEnum）");
});

test("safe groovy:字符串拼接 it.ann(带空白)", () => {
  const script = '"（框架字典：" + it.ann("ext.plus.common.core.annotation.DataDic", "value") + "）"';
  const r = trySafeGroovy(script, { annotations: [DIC_ANN], subject: "f" });
  assert.equal(r.matched, true);
  assert.equal(r.value, "（框架字典：FMJG）");
});

test("safe groovy:三元条件为假→ matched false 且非 unsupported", () => {
  const script = 'it.hasAnn("com.x.Public") ? "需要" : null';
  const r = trySafeGroovy(script, { annotations: [DIC_ANN], subject: "f" });
  assert.equal(r.matched, false);
  assert.equal(r.unsupported, undefined);
});

test("evalRuleValue:不可翻译的 groovy 返回 skipped", () => {
  const r = evalRuleValue('groovy: helper.resolveLink(it.doc("x"))', { annotations: [], javadocRaw: "/** @x y */", subject: "m" }, "method.return", NOOP);
  assert.equal(r.skipped, true);
});

/* ---------- properties.additional 链式加载(集成层此前断链) ---------- */

test("loadPropertiesFiles:additional 引用的文件经 readFile 回填并生效", () => {
  const files = [
    { path: "D:/proj/.apifox-helper.properties", content: "properties.additional=api-doc.properties\nfield.ignore=ignoreLog" },
  ];
  const store = new Map<string, string>([
    ["D:/proj/api-doc.properties", "field.doc=groovy: \"（框架字典：\" + it.ann(\"X\",\"value\") + \"）\""],
  ]);
  const r = loadPropertiesFiles(files, (p) => store.get(p));
  const keys = r.entries.map((e) => e.key);
  assert.ok(keys.includes("properties.additional"), keys.join(","));
  assert.ok(keys.includes("field.ignore"), keys.join(","));
  // 回填文件中的规则被解析出来,而不是 content="" 静默为空
  assert.ok(keys.includes("field.doc"), "additional 引用文件的规则应生效: " + keys.join(","));
});

test("loadPropertiesFiles:additional 指向不存在文件时告警且不炸", () => {
  const files = [{ path: "D:/proj/.apifox-helper.properties", content: "properties.additional=missing.properties" }];
  const r = loadPropertiesFiles(files, () => undefined);
  assert.ok(r.warnings.some((w) => w.includes("missing.properties")));
  assert.equal(r.entries.length, 1); // 仅 properties.additional 自身
});

test("loadPropertiesFiles:循环引用不挂死", () => {
  const store = new Map<string, string>([
    ["D:/proj/a.properties", "properties.additional=b.properties"],
    ["D:/proj/b.properties", "properties.additional=a.properties"],
  ]);
  const r = loadPropertiesFiles([{ path: "D:/proj/a.properties", content: store.get("D:/proj/a.properties")! }], (p) => store.get(p));
  assert.deepEqual(r.files.sort(), ["D:/proj/a.properties", "D:/proj/b.properties"]);
});

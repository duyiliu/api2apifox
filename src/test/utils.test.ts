import assert from "node:assert/strict";
import { test } from "node:test";
import { parseArgsText, splitTopLevel } from "../java/annotation";
import { parseJavadoc } from "../java/javadoc";
import { parseTypeText, typeToKeyText } from "../java/typeText";
import { classDescription } from "../java/schemaResolver";
import { AnnotationInfo } from "../java/annotation";

const ann = (name: string, value: string): AnnotationInfo => ({ name, raw: `@${name}("${value}")`, args: { value } });

test("classDescription:@ApiModel 值成为模型描述(此前缺口)", () => {
  assert.equal(classDescription([ann("ApiModel", "患者历史体检记录响应模型")], undefined), "患者历史体检记录响应模型");
});

test("classDescription:@Schema description 优先于 @ApiModel", () => {
  const annotations = [
    { name: "Schema", raw: "@Schema(description = \"openapi 描述\")", args: { description: "openapi 描述" } } as AnnotationInfo,
    ann("ApiModel", "swagger 描述"),
  ];
  assert.equal(classDescription(annotations, undefined), "openapi 描述");
});

test("classDescription:单行 javadoc 首行兜底为模型描述", () => {
  const javadoc = parseJavadoc("/** 患者历史体检记录响应模型。 */");
  assert.ok(javadoc);
  assert.equal(classDescription([], javadoc), "患者历史体检记录响应模型。");
});

test("classDescription:无任何来源返回 undefined", () => {
  assert.equal(classDescription([], parseJavadoc("/** */")), undefined);
  assert.equal(classDescription([], undefined), undefined);
});


test("splitTopLevel 忽略括号/字符串内逗号", () => {
  assert.deepEqual(splitTopLevel('a, {b, c}, "x,y"'), ["a", " {b, c}", ' "x,y"']);
});

test("parseArgsText 解析键值/数组/枚举/字符串", () => {
  const args = parseArgsText('value = {"/{id}", "/item/{id}"}, method = {RequestMethod.DELETE}, name = "张三", required = false');
  assert.deepEqual(args.value, ["/{id}", "/item/{id}"]);
  assert.deepEqual(args.method, ["RequestMethod.DELETE"]);
  assert.equal(args.name, "张三");
  assert.equal(args.required, false);
});

test("parseArgsText 单值注解", () => {
  const args = parseArgsText('"hello"');
  assert.equal(args.value, "hello");
  const enumArgs = parseArgsText("RequestMethod.GET");
  assert.equal(enumArgs.value, "RequestMethod.GET");
});

test("parseTypeText 泛型/数组/通配", () => {
  const t = parseTypeText("ApiResult<List<UserVO>>");
  assert.equal(t.name, "ApiResult");
  assert.equal(t.args.length, 1);
  assert.equal(t.args[0].name, "List");
  assert.equal(t.args[0].args[0].name, "UserVO");
  assert.equal(typeToKeyText(t), "ApiResult«List«UserVO»»");

  const arr = parseTypeText("String[]");
  assert.equal(arr.name, "String");
  assert.equal(arr.dims, 1);

  const map = parseTypeText("Map<String, List<User>>");
  assert.equal(map.name, "Map");
  assert.equal(map.args.length, 2);
  assert.equal(map.args[1].args[0].name, "User");

  const wild = parseTypeText("List<? extends Number>");
  assert.equal(wild.args[0].name, "Number");
  assert.equal(wild.args[0].wildcard, "extends");
});

test("parseJavadoc 提取首行/正文/@param/@return", () => {
  const jd = parseJavadoc(
    ["/**", " * 分页查询用户列表", " *", " * @param keyword 搜索关键字", " * @param page 页码", " * @return 用户分页数据", " */"].join("\n")
  );
  assert.equal(jd?.firstLine, "分页查询用户列表");
  assert.equal(jd?.params.keyword, "搜索关键字");
  assert.equal(jd?.params.page, "页码");
  assert.equal(jd?.returns, "用户分页数据");
  assert.ok(jd?.description.includes("分页查询用户列表"));
  assert.ok(!jd?.description.includes("@param"));
});

test("parseJavadoc:@param 多行续文归入参数描述(对齐 IDEA/easy-yapi)", () => {
  const jd = parseJavadoc(
    ["/**", " * 分页查询用户列表", " *", " * @param keyword 搜索关键字,", " * 支持模糊匹配", " * @return 用户分页数据", " */"].join("\n")
  );
  assert.equal(jd?.params.keyword, "搜索关键字,\n支持模糊匹配");
  // 续文不属于接口正文描述
  assert.ok(!jd?.description.includes("支持模糊匹配"), jd?.description);
  assert.ok(jd?.description.includes("分页查询用户列表"));
});

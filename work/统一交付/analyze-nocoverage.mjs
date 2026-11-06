#!/usr/bin/env node
/**
 * NoCoverage 变异说明生成器（work/统一交付/nocoverage-notes.json/.md）
 *
 * 输入：survivors-raw.json 中 status=NoCoverage 的条目
 * 输出：按文件+代码簇归组的说明——每条簇给「可测性结论」：
 *   NOT_TESTABLE  编译器样板/平台相关，补测无意义
 *   TESTABLE_TODO 可测但当前测试未覆盖（给出最小补测建议）
 * 说明文本人工撰写并键控到（文件, 行区间），未命中说明表的簇会报错退出。
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname);
const rows = JSON.parse(fs.readFileSync(path.join(OUT, "survivors-raw.json"), "utf8")).filter((r) => r.status === "NoCoverage");

/** 说明表：键 = 文件名片段 + 起止行（干净构建行号，闭区间） */
const NOTES = [
  // ---- 通用：tsc CJS 样板（各文件头部）----
  ["out/core/config.js", 9, 22, "NOT_TESTABLE", "tsc __createBinding/__setModuleDefault/__importStar 辅助函数：编译产物，无业务语义"],
  ["out/java/jarIndex.js", 20, 33, "NOT_TESTABLE", "tsc 互操作辅助函数样板：编译产物，无业务语义"],

  // ---- jarIndex ----
  ["out/java/jarIndex.js", 80, 80, "TESTABLE_TODO", "EOCD 后 central directory 签名校验（CDE_SIG）分支：补「中央目录签名损坏」zip 用例"],
  ["out/java/jarIndex.js", 111, 113, "TESTABLE_TODO", "parseClassFile 的 catch 分支：补「常量池损坏/截断的 .class」用例"],
  ["out/java/jarIndex.js", 191, 204, "TESTABLE_TODO", "toArgValue 的数组/嵌套注解/非标量分支：补「注解值为数组」「嵌套注解」的 .class 字节级用例（Demo.class 目前只覆盖字符串值）"],
  ["out/java/jarIndex.js", 215, 215, "TESTABLE_TODO", "toClassInfo 的 kind 三元（enum/interface）：补 access_flags 带 ACC_ENUM/ACC_INTERFACE 的 .class 用例"],
  ["out/java/jarIndex.js", 305, 306, "TESTABLE_TODO", "lookup 的 !jar||!entry 分支：jar.test.ts 已有 lookup(不存在)，但按需解析路径未走到该组合，补「索引内简单名但条目缺失」用例"],
  ["out/java/jarIndex.js", 448, 449, "TESTABLE_TODO", "versionCompare 的 pa[i]??\"\"（段数不同）：补「1.0.0 vs 1.0.0.1」版本目录用例"],
  ["out/java/jarIndex.js", 459, 459, "TESTABLE_TODO", "versionCompare 的 localeCompare 非数字段分支：补「2.10.0-RC1 vs 2.10.0」用例"],
  ["out/java/jarIndex.js", 486, 486, "TESTABLE_TODO", "readEmbeddedPomXml 的 !pom（jar 无 META-INF/maven 条目）：补「合法 zip 但无内嵌 pom」用例"],
  ["out/java/jarIndex.js", 494, 496, "TESTABLE_TODO", "内嵌 pom 的 DEFLATE（method=8）解压分支：补 deflate:true 的内嵌 pom zip 用例"],
  ["out/java/jarIndex.js", 561, 561, "TESTABLE_TODO", "maxJars 丢弃提示的尾部文案（dropped>10）：补「超过 10 个 jar 被丢弃」用例"],

  // ---- controllerParser ----
  ["out/java/controllerParser.js", 105, 105, "TESTABLE_TODO", "sites.byFile.get(pf) ?? []：跨文件站点索引缺失分支，补多文件继承场景"],
  ["out/java/controllerParser.js", 145, 153, "TESTABLE_TODO", "类级规则「条件无法求值」告警：补不支持语法的 Groovy 条件用例"],
  ["out/java/controllerParser.js", 168, 177, "TESTABLE_TODO", "类级规则求值主链：补类级 rule（class.ignore/class.name）命中与未命中用例"],
  ["out/java/controllerParser.js", 208, 209, "TESTABLE_TODO", "declarator Identifier 缺失回退：补无标识符声明器的畸形方法"],
  ["out/java/controllerParser.js", 232, 240, "TESTABLE_TODO", "类级规则「条件无法求值」告警（第二条规则类型）"],
  ["out/java/controllerParser.js", 254, 263, "TESTABLE_TODO", "类级规则求值主链（参数级）"],
  ["out/java/controllerParser.js", 276, 285, "TESTABLE_TODO", "类级规则求值主链（另一规则类型）"],
  ["out/java/controllerParser.js", 299, 308, "TESTABLE_TODO", "类级规则求值主链（另一规则类型）"],
  ["out/java/controllerParser.js", 390, 390, "TESTABLE_TODO", "typeName 缺失分支：补无类型名的声明"],
  ["out/java/controllerParser.js", 437, 437, "TESTABLE_TODO", "classType 缺失回退：补无 classType 的成员"],
  ["out/java/controllerParser.js", 469, 473, "TESTABLE_TODO", "继承链 visited 去重：补循环继承 fixture"],
  ["out/java/controllerParser.js", 508, 508, "TESTABLE_TODO", "inherited === spring-mvc 分支：补继承父 Controller 的场景"],
  ["out/java/controllerParser.js", 535, 535, "TESTABLE_TODO", "Actuator 端点 id 注解分支：补 @Endpoint(id=...) 用例"],
  ["out/java/controllerParser.js", 544, 544, "TESTABLE_TODO", "hierarchy 为空返回 [\"\"]：补空层级 fixture"],
  ["out/java/controllerParser.js", 575, 575, "TESTABLE_TODO", "classMemberDeclaration 回退 memberDeclaration：补两种成员声明形态"],
  ["out/java/controllerParser.js", 629, 632, "TESTABLE_TODO", "variableArityParameter 回退链：补可变参数方法"],
  ["out/java/controllerParser.js", 643, 661, "TESTABLE_TODO", "构造器签名文本：补构造器参数解析用例"],
  ["out/java/controllerParser.js", 745, 745, "TESTABLE_TODO", "ruleDescAppend 追加：补字段级 description 追加规则"],
  ["out/java/controllerParser.js", 756, 774, "TESTABLE_TODO", "参数级规则求值主链：补 parameter.* 规则用例"],
  ["out/java/controllerParser.js", 794, 794, "TESTABLE_TODO", "@RequestParam defaultValue：补 defaultValue 用例"],
  ["out/java/controllerParser.js", 870, 870, "TESTABLE_TODO", "form 字段去重：补 form 提交同名字段"],
  ["out/java/controllerParser.js", 879, 903, "TESTABLE_TODO", "else 主链（33 变异）：RequestResponseBody/consumes/produces 全分支，补 @RequestMapping consumes/produces 与 @RequestPart 用例"],
  ["out/java/controllerParser.js", 957, 957, "TESTABLE_TODO", "位置注解缺失分支：补无位置注解的方法"],
  ["out/java/controllerParser.js", 973, 992, "TESTABLE_TODO", "@ModelAttribute 直接绑定分支：补 @ModelAttribute 用例"],
  ["out/java/controllerParser.js", 1005, 1006, "TESTABLE_TODO", "注解解析失败回退：补畸形注解文本"],
  ["out/java/controllerParser.js", 1025, 1037, "TESTABLE_TODO", "@ApiResponse 处理链：补 Swagger @ApiResponse 用例"],
  ["out/java/controllerParser.js", 1055, 1059, "TESTABLE_TODO", "hidden 参数过滤：补 @Parameter(hidden=true)/@ApiParam(hidden) 用例"],
  ["out/java/controllerParser.js", 1102, 1102, "TESTABLE_TODO", "seen 去重：补重复类名场景"],
  ["out/java/controllerParser.js", 1138, 1138, "TESTABLE_TODO", "父类型为 class/record：补父类为 record 的继承"],
  ["out/java/controllerParser.js", 1164, 1164, "TESTABLE_TODO", "连续斜杠归一化：补 //a//b 路径"],

  // ---- schemaResolver ----
  ["out/java/schemaResolver.js", 20, 20, "TESTABLE_TODO", "stableStringify undefined 回退：补 undefined 值场景"],
  ["out/java/schemaResolver.js", 130, 131, "TESTABLE_TODO", "clone.type 缺失：补无 type 的 schema 克隆"],
  ["out/java/schemaResolver.js", 300, 303, "TESTABLE_TODO", "@JsonIgnore 字段：补 @JsonIgnore 用例"],
  ["out/java/schemaResolver.js", 318, 319, "TESTABLE_TODO", "@JsonProperty 改名：补 @JsonProperty 用例"],
  ["out/java/schemaResolver.js", 329, 330, "TESTABLE_TODO", "nullable schema：补 @Nullable 用例"],
  ["out/java/schemaResolver.js", 356, 356, "TESTABLE_TODO", "rule.required 覆盖：补 required 规则"],
  ["out/java/schemaResolver.js", 419, 419, "TESTABLE_TODO", "数组元素缺参回退：补无泛型参数集合"],
  ["out/java/schemaResolver.js", 427, 427, "TESTABLE_TODO", "PageInfo«T» 标题：补 mybatis-plus PageInfo 用例"],
  ["out/java/schemaResolver.js", 445, 455, "TESTABLE_TODO", "IPage 分页信封（18 变异集中区）：补 mybatis-plus IPage 返回类型用例（当前只测 spring-data/mybatis-plus Page）"],
  ["out/java/schemaResolver.js", 462, 462, "TESTABLE_TODO", "pageStyle spring-data 分支：补 pageStyle 配置用例"],
  ["out/java/schemaResolver.js", 469, 469, "TESTABLE_TODO", "Page«T» 标题（spring-data）：补 spring-data Page 用例"],
  ["out/java/schemaResolver.js", 486, 486, "TESTABLE_TODO", "Page«T» 标题（mybatis-plus）：补 mybatis-plus Page 用例"],
  ["out/java/schemaResolver.js", 508, 508, "TESTABLE_TODO", "ref 前缀校验：补 components/schemas 前缀外引用"],
  ["out/java/schemaResolver.js", 519, 532, "TESTABLE_TODO", "数组 items 解析：补 List<List<T>> 嵌套集合"],
  ["out/java/schemaResolver.js", 539, 539, "TESTABLE_TODO", "nullable $ref 包裹：补可空引用类型"],
  ["out/java/schemaResolver.js", 560, 561, "TESTABLE_TODO", "@Schema(hidden)：补 @Schema(hidden=true) 用例"],
  ["out/java/schemaResolver.js", 582, 585, "TESTABLE_TODO", "$ref 提前返回：补已解析引用"],
  ["out/java/schemaResolver.js", 593, 597, "TESTABLE_TODO", "注解 example 的数组形态：补 example 数组"],
  ["out/java/schemaResolver.js", 617, 617, "TESTABLE_TODO", "默认值数字解析：补 @JsonDefaultValue 数字"],
  ["out/java/schemaResolver.js", 627, 628, "TESTABLE_TODO", "布尔默认值 else：补布尔默认值"],
  ["out/java/schemaResolver.js", 637, 647, "TESTABLE_TODO", "正数约束分支：补 @Positive/@Min 用例"],
  ["out/java/schemaResolver.js", 659, 660, "TESTABLE_TODO", "数组约束：补集合元素约束"],
  ["out/java/schemaResolver.js", 673, 673, "TESTABLE_TODO", "日期字面量解析：补日期默认值"],
  ["out/java/schemaResolver.js", 684, 684, "TESTABLE_TODO", "字符串默认值 trim：补带空白默认值"],
  ["out/java/schemaResolver.js", 727, 727, "TESTABLE_TODO", "数字字面量回退：补十六进制/科学计数默认值"],
  ["out/java/schemaResolver.js", 763, 763, "TESTABLE_TODO", "enumFieldDoc 描述追加：pipelineCacheOverloads 已补 DTO 字段枚举；此处为集合元素枚举分支，补 List<Enum> 用例"],
  ["out/java/schemaResolver.js", 782, 786, "TESTABLE_TODO", "字段规则「条件无法求值」告警：补不支持语法"],
  ["out/java/schemaResolver.js", 794, 800, "TESTABLE_TODO", "字段规则主链 else（21 变异集中区）：补 json.rule.field.* 各规则类型用例"],
  ["out/java/schemaResolver.js", 829, 834, "TESTABLE_TODO", "规则值求值链：补表达式型规则值"],
  ["out/java/schemaResolver.js", 844, 845, "TESTABLE_TODO", "规则无法求值告警：补无法求值的规则值"],
  ["out/java/schemaResolver.js", 852, 853, "TESTABLE_TODO", "v.skipped 告警：补被跳过的规则"],
  ["out/java/schemaResolver.js", 873, 874, "TESTABLE_TODO", "类级规则求值：补 class 级规则"],
  ["out/java/schemaResolver.js", 922, 922, "TESTABLE_TODO", "参数注解缺省回退：补无注解参数"],
  ["out/java/schemaResolver.js", 931, 932, "TESTABLE_TODO", "字段规则告警出口：补字段规则告警路径"],
  ["out/java/schemaResolver.js", 940, 944, "TESTABLE_TODO", "规则类型分发链：补其他规则类型"],
  ["out/java/schemaResolver.js", 952, 958, "TESTABLE_TODO", "字段规则主链 else（21 变异集中区）：补 json.rule.field.name/type 用例"],
  ["out/java/schemaResolver.js", 973, 973, "TESTABLE_TODO", "规则命中组合：补多规则同时命中"],
  ["out/java/schemaResolver.js", 987, 996, "TESTABLE_TODO", "字段类型覆盖规则：补 field.type 规则"],
  ["out/java/schemaResolver.js", 1003, 1004, "TESTABLE_TODO", "override 缺省回退：补无 override 的规则"],
  ["out/java/schemaResolver.js", 1015, 1024, "TESTABLE_TODO", "规则求值链尾部：补规则值表达式"],
  ["out/java/schemaResolver.js", 1034, 1034, "TESTABLE_TODO", "truncate 边界：补超长文案截断"],

  // ---- client ----
  ["out/apifox/client.js", 71, 71, "TESTABLE_TODO", "团队项目列表全失败文案：补多团队全失败 mock"],
  ["out/apifox/client.js", 144, 167, "TESTABLE_TODO", "手动 AbortSignal 组合实现（22 变异集中区）：Node>=20 有 AbortSignal.any 时走不到；补特性探测强制关闭的用例（monkey-patch）或拆分函数"],
  ["out/apifox/client.js", 208, 208, "TESTABLE_TODO", "错误 message+code 拼接 else 分支：补无 message 的错误响应"],
  ["out/apifox/client.js", 230, 232, "TESTABLE_TODO", "errors 数组遍历：补带 errors 数组的错误响应"],
  ["out/apifox/client.js", 269, 269, "TESTABLE_TODO", "catch 兜底：补抛错型响应"],

  // ---- config ----
  ["out/core/config.js", 72, 72, "TESTABLE_TODO", "title 默认取 basename(root)：补「未配置 title」用例"],
  ["out/core/config.js", 120, 121, "TESTABLE_TODO", "title 字符串校验：补空白 title 用例"],
  ["out/core/config.js", 138, 140, "TESTABLE_TODO", "overrides.title：补 CLI 覆盖 title 用例"],
  ["out/core/config.js", 207, 208, "TESTABLE_TODO", "配置文件非对象校验：补「配置文件是数组/标量」用例"],
  ["out/core/config.js", 250, 251, "TESTABLE_TODO", "projectId 校验：补负数/非整数 projectId 用例"],
  ["out/core/config.js", 282, 283, "TESTABLE_TODO", "stringValue 校验：补数字型字符串字段"],
  ["out/core/config.js", 312, 313, "TESTABLE_TODO", "stringArrayValue 校验：补「数组含非字符串」用例"],

  // ---- builder ----
  ["out/openapi/builder.js", 91, 91, "TESTABLE_TODO", "typeOverride.format：补带 format 的字段类型覆盖规则"],
  ["out/openapi/builder.js", 125, 133, "TESTABLE_TODO", "rule.ignored 字段跳过：补 field.ignore 规则在 builder 层的用例"],
  ["out/openapi/builder.js", 174, 175, "TESTABLE_TODO", "extraResponses 带 schemaText：补 @ApiResponse 带 schema 的附加响应"],

  // ---- pipeline ----
  ["out/pipeline.js", 120, 123, "TESTABLE_TODO", "optionsCacheKey 的 rules 段（5 变异集中区）：补「AnalyzeCache 携带 rules 的两次分析」用例"],
];

// 按 (文件, 行区间) 聚簇
function cluster(rows) {
  const byFile = {};
  for (const r of rows) {
    (byFile[r.file] = byFile[r.file] ?? []).push(r);
  }
  const clusters = [];
  for (const [file, rs] of Object.entries(byFile)) {
    rs.sort((a, b) => a.lineInCleanBuild - b.lineInCleanBuild);
    let cur = [rs[0]];
    for (let i = 1; i < rs.length; i++) {
      if (rs[i].lineInCleanBuild - cur[cur.length - 1].lineInCleanBuild <= 4) cur.push(rs[i]);
      else { clusters.push({ file, rows: cur }); cur = [rs[i]]; }
    }
    clusters.push({ file, rows: cur });
  }
  return clusters;
}

const out = [];
const unmatched = [];
for (const c of cluster(rows)) {
  const from = c.rows[0].lineInCleanBuild;
  const to = c.rows[c.rows.length - 1].lineInCleanBuild;
  const note = NOTES.find((n) => n[0] === c.file && from >= n[1] && to <= n[2]);
  if (!note) { unmatched.push({ file: c.file, from, to, count: c.rows.length, sample: c.rows[0].source }); continue; }
  out.push({
    file: c.file,
    lines: `${from}-${to}`,
    mutants: c.rows.length,
    testability: note[3],
    note: note[4],
    ids: c.rows.map((r) => r.id),
  });
}

if (unmatched.length) {
  console.error("未匹配说明表的 no-coverage 簇：");
  for (const u of unmatched) console.error(JSON.stringify(u));
  process.exit(1);
}

const totalNotTestable = out.filter((o) => o.testability === "NOT_TESTABLE").reduce((a, o) => a + o.mutants, 0);
const totalTodo = out.filter((o) => o.testability === "TESTABLE_TODO").reduce((a, o) => a + o.mutants, 0);
const md = [
  "# NoCoverage 变异说明（自动生成 + 人工说明表）",
  "",
  `生成时间：${new Date().toISOString()}`,
  `no-coverage 合计：${out.reduce((a, o) => a + o.mutants, 0)} 条；其中 NOT_TESTABLE（编译样板，补测无意义）${totalNotTestable} 条；TESTABLE_TODO（可测未测）${totalTodo} 条。`,
  "",
  "| 文件 | 行区间 | 变异数 | 可测性结论 | 说明 |",
  "|---|---|---|---|---|",
  ...out.map((o) => `| ${o.file} | ${o.lines} | ${o.mutants} | ${o.testability} | ${o.note} |`),
  "",
  "逐条 id 见 `nocoverage-notes.json`。",
  "",
].join("\n");

fs.writeFileSync(path.join(OUT, "nocoverage-notes.json"), JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(OUT, "nocoverage-notes.md"), md);
console.log(md);

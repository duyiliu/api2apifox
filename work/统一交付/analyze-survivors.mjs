#!/usr/bin/env node
/**
 * 存活变异逐条处置（work/统一交付/survivor-dispositions.json + .md）
 *
 * 输入：survivors-raw.json（analyze-mutations.mjs 生成，含 status=Survived 的全部条目）
 * 输出：每条存活变异的 disposition：
 *   verdict   EQUIVALENT | DEFECT
 *   severity  P1/P2/P3（DEFECT 时为缺陷/测试缺口等级）
 *   category  语义分类
 *   reason    该分类的判定理由（等价证明或行为差异说明）
 *   guard     建议的补杀断言（DEFECT 时）
 * 规则按顺序匹配，任一规则命中即定；未命中任何规则 = 分析未完成，脚本报错退出。
 *
 * 分级口径（写入报告）：
 *   P2 = 变异会改变「产品可观测行为」（生成的 OpenAPI/配置/错误分类），当前测试未断言
 *   P3 = 变异只改变文案/常量表中当前测试未引用的条目/边界截断等低风险行为差异
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "work/统一交付");
const rows = JSON.parse(fs.readFileSync(path.join(OUT, "survivors-raw.json"), "utf8")).filter((r) => r.status === "Survived");

const TS_HELPERS = /__esModule|__importStar|__exportStar|__createBinding|__setModuleDefault|__importDefault|Object\.defineProperty\(exports/;

/** 规则表：[分类, 谓词, verdict, severity, reason, guard] */
const RULES = [
  // ---- 编译样板：等价 ----
  ["tsc CJS 样板", (m) => TS_HELPERS.test(m.orig) || TS_HELPERS.test(m.source), "EQUIVALENT", null,
    "tsc 互操作辅助函数/导出元数据，仅做 CommonJS 装配，替换后无可观测行为差异（无运行时消费者依赖 __esModule/defineProperty 的取值）",
    null],

  // ---- config.js ----
  ["config 字段名参数", (m) => m.file.endsWith("core/config.js") && (m.source.includes("applyFile(config, sources,") || m.source.includes("applyEnv(config, sources,")) && m.mutator === "StringLiteral", "DEFECT", "P2",
    "applyFile/applyEnv 的第一个字符串是配置字段名：变异后写入空名键，真实字段保留默认值，用户设置值被静默丢弃",
    "对每个字段补「非默认值 → resolveConfig 后 config[field] 等于该值」的断言"],
  ["config 默认排除目录", (m) => m.file.endsWith("core/config.js") && m.source.includes("DEFAULT_EXCLUDE"), "DEFECT", "P2",
    "DEFAULT_EXCLUDE 条目直接决定默认扫描排除范围，变异后默认排除行为改变",
    "断言 resolveConfig 默认值中 exclude 数组逐项相等"],
  ["config 校验分支", (m) => m.file.endsWith("core/config.js") && /Number\.isInteger|Number\.isFinite|Array\.isArray\(value\)|typeof value !== "string" \|\| !values\.includes/.test(m.orig), "DEFECT", "P2",
    "值校验条件被变异：非法值（非整数/NaN/非字符串/枚举外值）的拦截行为改变，可能静默写入错误配置",
    "补各类型的非法值用例，断言 diagnostics 含对应 error 且字段未应用"],
  ["config 诊断文案", (m) => m.file.endsWith("core/config.js") && /invalid\(|diagnostics|CONFIG_NOT_FOUND|必须是|sources\.title|join\("\\n"\)|"default"|"utf8"/.test(m.source + m.orig), "DEFECT", "P3",
    "诊断消息/来源标签文案变异，用户可见但仅影响提示文本，不影响解析与同步结果",
    "对关键文案补精确断言"],
  ["config 条件/比较分支", (m) => m.file.endsWith("core/config.js") && /ConditionalExpression|EqualityOperator|LogicalOperator/.test(m.mutator), "DEFECT", "P2",
    "配置应用的条件/比较分支被变异：某来源（env/overrides/file）被跳过或误应用，解析结果改变",
    "对每个来源补独立用例"],
  ["config 整段逻辑", (m) => m.file.endsWith("core/config.js") && m.mutator === "BlockStatement", "DEFECT", "P2",
    "整段逻辑被移除：键被无条件写入/跳过不再生效，来源标注错误",
    "对每个块补存在性断言"],
  ["config 文案/键名", (m) => m.file.endsWith("core/config.js") && m.mutator === "StringLiteral", "DEFECT", "P3",
    "文案或键名字面量变异：诊断文本/来源标签改变",
    "对关键文案补精确断言"],
  ["config 字面量容器", (m) => m.file.endsWith("core/config.js") && /ObjectLiteral|ArrayDeclaration/.test(m.mutator), "DEFECT", "P2",
    "默认值容器被替换为空容器：对应默认值丢失，解析结果改变",
    "对默认值补精确断言"],
  ["config 调用/运算", (m) => m.file.endsWith("core/config.js"), "DEFECT", "P2",
    "取值/运算表达式被变异：配置读取或清洗结果改变",
    "对末端取值补断言"],

  // ---- pipeline.js ----
  ["pipeline filterId 身份表", (m) => m.file.endsWith("out/pipeline.js") && /nextFilterId|filterIds\.set|filterId = known/.test(m.orig + m.source) && m.mutator === "UpdateOperator", "EQUIVALENT", null,
    "filterId 只作为 Map 身份键使用，值本身不出现在任何输出中；++/-- 均保持逐次单调整，身份语义同构",
    null],
  ["pipeline filterId 复用语义", (m) => m.file.endsWith("out/pipeline.js") && /filterIds.set|filterId = known|known === undefined/.test(m.orig + m.source), "DEFECT", "P3",
    "缓存复用身份表的登记/复用分支被变异：重复谓词不再复用缓存（输出不变，仅重算），或新谓词拿到过期 id",
    "补「重复谓词命中同一缓存」的可观测断言"],
  ["pipeline 选项重载", (m) => m.file.endsWith("out/pipeline.js") && /typeof options === "string"/.test(m.orig + m.source), "DEFECT", "P2",
    "analyze 的字符串/对象重载判别被变异：对象重载时 spec.info.title 变成整个选项对象（字符串重载不受影响）",
    "补对象重载下 spec.info.title 等于 title 字段的断言"],
  ["pipeline 告警归属键(C-D4)", (m) => m.file.endsWith("out/pipeline.js") && /methodName|keptOperations|keptControllers|keptMethodNames|A-Za-z0-9_|Controller|Service/.test(m.orig + m.source), "DEFECT", "P2",
    "告警归属键/过滤集合（Controller.method 口径）被变异，filterWarningsForEndpoints 的过滤结果改变，parser 告警可能被误删/误留",
    "对命中/未命中两个口径各补断言"],
  ["pipeline 脏检查", (m) => m.file.endsWith("out/pipeline.js") && /changed/.test(m.orig + m.source), "DEFECT", "P2",
    "AnalyzeCache 脏检查（文件内容/选项变化）被变异：内容变化后返回旧结果",
    "补内容变化后重新计算的断言"],
  ["pipeline 缓存键", (m) => m.file.endsWith("out/pipeline.js") && /optionsCacheKey|opts\.pageStyle \?\?|opts\.enumFieldDoc \?\?|opts\.cacheKey|lastPaths = \[\]/.test(m.orig + m.source), "DEFECT", "P2",
    "缓存键组成被变异：不同配置可能互相命中同一缓存（返回错误 spec），或同配置被误判失效",
    "对 pageStyle/enumFieldDoc/cacheKey 各补「变化→不得复用」与「相同→复用」双向断言"],
  ["pipeline 文件级缓存", (m) => m.file.endsWith("out/pipeline.js") && /hit\.content === content|containing|methodRange/.test(m.orig + m.source), "DEFECT", "P2",
    "endpointsOfFile/方法定位的缓存命中与区间比较被变异，返回过期或错位的接口",
    "补内容变化失效与区间边界（start/end 端点）用例"],
  ["pipeline 其他", (m) => m.file.endsWith("out/pipeline.js"), "DEFECT", "P2",
    "管线输出（spec/endpoints/warnings）可观测差异，当前测试未锁定",
    "按位置补针对性用例"],

  // ---- builder.js ----
  ["builder 注解参数名", (m) => m.file.endsWith("openapi/builder.js") && /"value"|"name"|"description"|"example"/.test(m.orig) && /annStr|schemaExample|applyParamConstraints/.test(m.source), "DEFECT", "P2",
    "注解取值键被变异：字段/参数的 description/example/name 从注解中取不到，输出 spec 丢描述",
    "补「注解带 description/example → spec 中出现该值」用例"],
  ["builder spec 字面量", (m) => m.file.endsWith("openapi/builder.js") && /"string"|"object"|"binary"|"int32"|"int64"|"date-time"|"MultipartFile"/.test(m.orig + m.source), "DEFECT", "P2",
    "输出 schema 的类型/格式字面量被变异，生成的 OpenAPI 类型错误",
    "对 multipart/常见类型补 schema 精确断言"],
  ["builder ResponseEntity 解包", (m) => m.file.endsWith("openapi/builder.js") && /ResponseEntity|Mono|HttpEntity/.test(m.orig + m.source), "DEFECT", "P2",
    "响应包装解包正则/取组被变异，ResponseEntity<X> 的响应 schema 解析改变",
    "补 ResponseEntity/Mono 包装类型的响应 schema 用例"],
  ["builder 清洗边界", (m) => m.file.endsWith("openapi/builder.js") && /.trim()/.test(m.orig), "DEFECT", "P3",
    "类型文本/捕获组去空白变异：仅影响含首尾空白的类型声明",
    "补带空白类型声明用例"],
  ["builder spec 组装条件/回退", (m) => m.file.endsWith("openapi/builder.js"), "DEFECT", "P2",
    "spec 组装条件或回退值（\"OK\"、required、requestBody 分支、appendDoc 拼接）被变异，输出 OpenAPI 可观测差异",
    "对每个分支补最小用例"],

  // ---- client.js ----
  ["client 错误分类", (m) => m.file.endsWith("apifox/client.js") && /code \|\| message\.includes|TimeoutError|AbortError|MAX_ERROR_DEPTH|value\.errors|seen\.add|depth \+ 1/.test(m.orig + m.source), "DEFECT", "P2",
    "Apifox 错误链的分类/截断/去重逻辑被变异，用户看到的错误信息与分类改变",
    "补嵌套错误链的构造与断言"],
  ["client loopback 判定", (m) => m.file.endsWith("apifox/client.js") && /localhost|::1|127\.|\\\[\\\]/.test(m.orig + m.source), "DEFECT", "P2",
    "回环地址判定（大小写/方括号剥离）被变异，本地服务端错误链被误判为远端",
    "补 [::1]/127.0.0.2/大写 LOCALHOST 用例"],
  ["client 端点/载荷", (m) => m.file.endsWith("apifox/client.js") && /v1\/teams|json === undefined|item\?\.|typeof item\?\.|extractList|failed > 0|teams\.length > 0/.test(m.orig + m.source), "DEFECT", "P2",
    "请求 URL/项目列表载荷校验/分页条件被变异，调用真实 Apifox 的行为改变",
    "补项目列表解析与 URL 组装断言"],
  ["client 信号特性探测", (m) => m.file.endsWith("apifox/client.js") && /AbortSignal.any/.test(m.orig + m.source), "DEFECT", "P3",
    "AbortSignal.any 特性探测分支变异：Node>=20 下两条路径语义等价（均实现任一信号即中止），当前测试未断言走哪条",
    "补组合信号触发断言"],
  ["client 取值/清洗", (m) => m.file.endsWith("apifox/client.js") && /.trim()|isRecord|readText|typeof value ===/.test(m.orig + m.source), "DEFECT", "P3",
    "错误链节点的文本清洗/类型守卫变异：仅影响错误链文本的空白或回退值",
    "对错误链文本补精确断言"],
  ["client 文案", (m) => m.file.endsWith("apifox/client.js"), "DEFECT", "P3",
    "错误文案/消息模板变异：用户可见但仅影响提示文本",
    "对关键文案补精确断言"],

  // ---- controllerParser.js ----
  ["parser 常量表", (m) => m.file.endsWith("java/controllerParser.js") && /MEDIA_TYPE_CONSTANTS|GET: "GET"|OK: "200"|MOVED_PERMANENTLY|BAD_REQUEST|INTERNAL_SERVER_ERROR|APPLICATION_ATOM_XML|APPLICATION_CBOR|APPLICATION_FORM_URLENCODED/.test(m.source), "DEFECT", "P3",
    "HTTP 方法/状态码/媒体类型常量表条目被变异：仅当测试用例引用该具体条目时才可观测，当前用例未覆盖这些条目",
    "为常用方法/媒体类型各补一条 spec 断言"],
  ["parser 规则引擎", (m) => m.file.endsWith("java/controllerParser.js") && /cond\.supported|cond\.hit|v\.skipped|v\.matched|v\.reason|ruleWarnings|evalCondition|detectValueSyntax|evalRuleValue/.test(m.orig + m.source), "DEFECT", "P2",
    ".apifox-helper.properties 规则求值分支被变异：命中/跳过/无法求值的判定改变，字段忽略/改名/类型覆盖行为改变",
    "对每种规则类型补命中与未命中用例（含无法求值的告警路径）"],
  ["parser 解析正则", (m) => m.file.endsWith("java/controllerParser.js") && m.mutator === "Regex", "DEFECT", "P2",
    "Java 语法解析正则（import/package/注解/数字字面量/路径拼接）被变异，边界输入下解析结果改变",
    "补 import 边界、注解空白变体、路径斜杠边界用例"],
  ["parser 注解键/默认值", (m) => m.file.endsWith("java/controllerParser.js") && /"Api"|"Parameter"|"ApiParam"|"value"|"name"|"description"|"example"|"query"|"int"|"jaxrs"|"spring-mvc"|"Object"|"classModifier"|"GET"/.test(m.orig + m.source), "DEFECT", "P2",
    "注解查找键/flavor 判定/默认参数值被变异，端点参数与注解识别行为改变",
    "补各注解变体与 flavor 用例"],
  ["parser 文案/截断", (m) => m.file.endsWith("java/controllerParser.js") && /truncate|"…"|s\.length > n|join\(","\)|页码/.test(m.orig + m.source), "DEFECT", "P3",
    "文案/截断边界变异：仅在精确长度或引用该文案时可观测",
    "补截断边界与页码参数断言"],
  ["parser 条件/比较分支", (m) => m.file.endsWith("java/controllerParser.js") && /ConditionalExpression|EqualityOperator|LogicalOperator/.test(m.mutator), "DEFECT", "P2",
    "端点提取的条件/比较分支被变异：flavor 判定、继承链、注解存在性、值比较结果改变，端点集合或参数形态改变",
    "对每个条件补双分支用例"],
  ["parser 整段逻辑", (m) => m.file.endsWith("java/controllerParser.js") && m.mutator === "BlockStatement", "DEFECT", "P2",
    "整段逻辑被移除：去重登记/跳过/收集不再执行，端点或参数重复/丢失",
    "对每个块补存在性断言"],
  ["parser 文案/键名", (m) => m.file.endsWith("java/controllerParser.js") && m.mutator === "StringLiteral", "DEFECT", "P3",
    "文案或取值键名字面量变异：用户可见文本或注解取值键改变",
    "对关键文案/键名补精确断言"],
  ["parser 字面量容器", (m) => m.file.endsWith("java/controllerParser.js") && /ObjectLiteral|ArrayDeclaration/.test(m.mutator), "DEFECT", "P2",
    "对象/数组字面量被替换为空容器或哨兵值：默认参数/consume/produce 集合内容改变",
    "对容器内容补精确断言"],
  ["parser 调用/运算", (m) => m.file.endsWith("java/controllerParser.js"), "DEFECT", "P2",
    "方法/取值/运算表达式被变异：CST 遍历或字符串处理某一环结果改变，级联影响端点提取",
    "对末端取值补断言"],

  // ---- jarIndex.js ----
  ["jarIndex zip 解析", (m) => m.file.endsWith("java/jarIndex.js") && /eocd|LFH_SIG|readUInt16LE|readUInt32LE|parseCentralDirectory|bytesRead === length|head\.length < 30|META-INF\/maven/.test(m.orig + m.source), "DEFECT", "P2",
    "ZIP 中央目录/本地头偏移计算被变异：jar 条目定位错误，类索引缺失或读错内容",
    "补 EOCD 边界（注释长度/多 jar）与本地头截断用例"],
  ["jarIndex Maven 发现链", (m) => m.file.endsWith("java/jarIndex.js") && /MAVEN_REPOSITORY|https?:|JetBrains|\.config|scope>|test|provided|discoverMavenRepos|products|findJarsForCoordinates|maxRounds|fresh\.length|localRepository|settings/.test(m.orig + m.source), "DEFECT", "P2",
    "Maven 仓库发现/依赖解析链（settings、JetBrains 宏、scope 过滤、轮次收敛）被变异，依赖 jar 集合改变",
    "对每条发现源与收敛路径补断言（jarDiscovery/jarDependencyResolution 已覆盖主路径，边界待补）"],
  ["jarIndex 版本比较", (m) => m.file.endsWith("java/jarIndex.js") && /isNaN|Math\.max\(pa\.length|\^\\d\+\$|parseInt|compare/.test(m.orig + m.source), "DEFECT", "P2",
    "版本自然序比较被变异，取到的依赖 jar 版本错误（如 2.9.0 覆盖 2.10.0）",
    "补多段/前导零/非数字段版本比较用例"],
  ["jarIndex class 索引", (m) => m.file.endsWith("java/jarIndex.js") && /module-info|package-info|kind === "enum"|kind === "interface"|lookup|ClassInfo|dispose/.test(m.orig + m.source), "DEFECT", "P2",
    "类索引构建/查询行为被变异（枚举/接口归类、排除条目、缓存与释放）",
    "对 kind 归类与排除条目补断言"],
  ["jarIndex 条件/比较分支", (m) => m.file.endsWith("java/jarIndex.js") && /ConditionalExpression|EqualityOperator|LogicalOperator/.test(m.mutator), "DEFECT", "P2",
    "发现/解析链的条件分支被变异：跳过、回退、命中判定改变，依赖 jar 集合或索引条目改变",
    "对每个条件补双分支用例"],
  ["jarIndex 整段逻辑", (m) => m.file.endsWith("java/jarIndex.js") && m.mutator === "BlockStatement", "DEFECT", "P2",
    "整段逻辑被移除：收集/登记/跳过不再执行，索引或依赖集合缺项",
    "对每个块补存在性断言"],
  ["jarIndex 文案/键名", (m) => m.file.endsWith("java/jarIndex.js") && m.mutator === "StringLiteral", "DEFECT", "P3",
    "路径片段或文案字面量变异：发现源路径/告警文本改变",
    "对路径与告警文案补精确断言"],
  ["jarIndex 字面量容器", (m) => m.file.endsWith("java/jarIndex.js") && /ObjectLiteral|ArrayDeclaration/.test(m.mutator), "DEFECT", "P2",
    "对象/数组字面量被替换为空容器或哨兵值：发现结果集合初始内容改变",
    "对容器内容补精确断言"],
  ["jarIndex 调用/运算", (m) => m.file.endsWith("java/jarIndex.js"), "DEFECT", "P2",
    "方法/取值/运算表达式被变异：zip 读取或坐标解析某一环结果改变",
    "对末端取值补断言"],
  // ---- schemaResolver.js ----
  ["schema 类型表", (m) => m.file.endsWith("java/schemaResolver.js") && /"string"|"integer"|"number"|"object"|"array"|"int32"|"int64"|"float"|"double"|"date-time"|"boolean"/.test(m.orig + m.source), "DEFECT", "P2",
    "Java→OpenAPI 类型映射表条目被变异，生成的 schema 类型/格式错误",
    "对每种基本类型补 schema 精确断言"],
  ["schema 规则引擎", (m) => m.file.endsWith("java/schemaResolver.js") && /cond\.supported|cond\.hit|v\.skipped|v\.matched|v\.reason|fieldRules|evalRule/.test(m.orig + m.source), "DEFECT", "P2",
    "字段级规则求值分支被变异，字段忽略/改名/类型覆盖行为改变",
    "对每种字段规则补命中/未命中用例"],
  ["schema 分页信封文案", (m) => m.file.endsWith("java/schemaResolver.js") && /总记录数|当前页数据|每页条数|总页数|总记录|currentPage/.test(m.orig + m.source), "DEFECT", "P3",
    "分页信封字段描述文案变异，用户可见但仅影响描述文本",
    "对分页信封 schema 补描述断言"],
  ["schema 条件/比较分支", (m) => m.file.endsWith("java/schemaResolver.js") && /ConditionalExpression|EqualityOperator|LogicalOperator/.test(m.mutator), "DEFECT", "P2",
    "类型解析的条件/比较分支被变异：另一侧的值或边界被选中，生成的 schema 类型/结构改变",
    "对每个条件补双分支用例"],
  ["schema 整段逻辑", (m) => m.file.endsWith("java/schemaResolver.js") && m.mutator === "BlockStatement", "DEFECT", "P2",
    "整段逻辑被移除：相关处理（写入/跳过/赋值）不再执行，输出结构缺项",
    "对每个块补存在性断言"],
  ["schema 文案/键名", (m) => m.file.endsWith("java/schemaResolver.js") && m.mutator === "StringLiteral", "DEFECT", "P3",
    "文案或取值键名字面量变异：用户可见文本或注解取值键改变",
    "对关键文案/键名补精确断言"],
  ["schema 字面量容器", (m) => m.file.endsWith("java/schemaResolver.js") && /ObjectLiteral|ArrayDeclaration/.test(m.mutator), "DEFECT", "P2",
    "对象/数组字面量被替换为空容器或哨兵值：schema 字段或回退集合内容改变",
    "对容器内容补精确断言"],
  ["schema 调用/运算", (m) => m.file.endsWith("java/schemaResolver.js"), "DEFECT", "P2",
    "方法/取值/运算表达式被变异：解析链某一环的结果改变，级联影响输出 schema",
    "对末端取值补断言"],
];

const dispositions = rows.map((m) => {
  const rule = RULES.find(([, pred]) => pred(m));
  if (!rule) {
    console.error("未命中规则的存活变异（分析未完成）:", m.file, m.id, m.mutator, m.orig);
    process.exit(1);
  }
  const [category, , verdict, severity, reason, guard] = rule;
  return {
    file: m.file,
    id: m.id,
    mutator: m.mutator,
    location: `out ${m.location}（干净构建 L${m.lineInCleanBuild}）`,
    orig: m.orig,
    replacement: m.replacement,
    verdict,
    severity,
    category,
    reason,
    guard,
    testsCompleted: m.testsCompleted,
  };
});

const byVerdict = dispositions.reduce((acc, d) => ((acc[d.verdict] = (acc[d.verdict] ?? 0) + 1), acc), {});
const byCategory = dispositions.reduce((acc, d) => { const k = `${d.file}|${d.category}|${d.verdict}|${d.severity ?? "-"}`; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {});

const md = [
  "# 存活变异逐条处置（自动生成）",
  "",
  `生成时间：${new Date().toISOString()}`,
  `存活总数：${dispositions.length}；等价：${byVerdict.EQUIVALENT ?? 0}；登记为缺陷（测试缺口）：${byVerdict.DEFECT ?? 0}`,
  "",
  "| 文件 | 分类 | 结论 | 等级 | 条数 |",
  "|---|---|---|---|---|",
  ...Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
    const [file, category, verdict, severity] = k.split("|");
    return `| ${file} | ${category} | ${verdict} | ${severity} | ${v} |`;
  }),
  "",
  "逐条明细（含原始表达式、替换、位置、理由、建议补杀断言）见 `survivor-dispositions.json`。",
  "",
].join("\n");

fs.writeFileSync(path.join(OUT, "survivor-dispositions.json"), JSON.stringify(dispositions, null, 2));
fs.writeFileSync(path.join(OUT, "survivor-dispositions.md"), md);
console.log(md);

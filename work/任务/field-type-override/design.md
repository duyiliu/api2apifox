# `field.type` 字段级 schema 类型覆盖规则 + `idAsString` 内置默认

> 状态:已实现(176 核心测试全绿),2026-10-28
> 背景:真实项目 child-adolescent-health-backend(Ext Plus 框架)的只读接口实测中,
> `projectId`/`patientId` 等雪花 ID 在原始 JSON 里是**字符串**,分页数量是数字;
> 而 api2apifox 按 Java `Long` 一律生成 `integer/int64`,文档与实际响应不一致,
> 前端按 number 处理会丢精度(JS 安全整数上限 2^53−1)。

## 1. 运行时机制(实测+反编译确认)

`extreme-web-core-2.2.0.jar` 中 `ext.plus.web.core.config.WebServletConfigurer#extendMessageConverters`:
复制主 `ObjectMapper` 并注册 `CustomizedLongSerializer`(`Long.class`/`long`/`BigInteger`),
再替换掉列表中全部 `MappingJackson2HttpMessageConverter`。该序列化器:

- 值在 `[−9007199254740991, +9007199254740991]`(JS 安全整数)内 → JSON **number**
- 超出范围(雪花 ID 必然)或非 Number → JSON **string**

即同一字段"小值为数字、大值为字符串",文档无法按值区分;同时
`JacksonAutoConfiguration` 注册的 `CustomizedNumberLongSerializer`(恒 number)被副本机制覆盖,
对 HTTP 响应不生效。

结论:文档契约应是"可能承载大数的字段 → string"。哪些字段可能承载大数由项目语义
(字段名/注解)决定,工具按**字段规则**生成,不能把所有 `Long` 一律改字符串
(分页 `total` 等实测就是数字,且 `IPage` 的分页字段是内置展开、不受字段规则影响,天然保持 integer)。

## 2. 改动

| 文件 | 改动 |
| --- | --- |
| `src/java/ruleEval.ts` | `RuleContext` 增加 `fieldType`(声明类型去空白文本,如 `Long`/`java.util.List<Long>`/`Long[]`)与 `fieldTypeSimple`(根简单名);`evalSafeCondition` 新增访问器原子:`it.name()` / `it.type()?.name()` / `it.type()?.simpleName()` 的 `==`/`!=`(字符串字面量或 `null`)与 `equals/equalsIgnoreCase/startsWith/endsWith/contains/matches` 方法调用 |
| `src/java/schemaResolver.ts` | `fieldRuleContext` 回填 `fieldType`/`fieldTypeSimple`;`fieldRuleEngine` 新增 `field.type`/`json.rule.field.type` 键(命中且值为合法 `type` 或 `type:format` 时覆盖,多条命中后者生效,非法值告警);`classSchema` 在 `resolveTypeText` 后整体替换 `{type,format}`(保留 `nullable`,描述/示例/约束照常叠加) |
| `src/test/rules.test.ts` | 5 个 e2e 用例(*Id+Long→string、type:format、非法值告警、@注解条件、groovy 未命中不覆盖) |
| `README.md` | 规则表新增 `field.type`;「差异/边界」补访问器原子说明与雪花 ID 示例 |

## 3. 关键决策

- **D1 复用字段规则引擎而非新增配置面**:`.apifox-helper.properties` 本来就是"按项目配置"的
  既定机制(根目录+模块级多文件合并),`field.type` 与 IDEA easyyapi 同名键语义一致。
- **D2 用 groovy 安全形态做"字段名×类型"匹配**,不扩展 `[cond]` 条件语法:
  条件后缀目前只有 `#tag`/`@注解`/`!@注解`,引入字段名正则 DSL 是更大的语法面;
  而团队既有配置已经写 `field.doc=groovy: <三元>` 形态,补访问器原子即可表达
  `it.name().endsWith("Id") && it.type()?.name()?.endsWith("Long")`。
- **D3 覆盖语义是"整体替换"**:命中后字段 schema 直接为 `{type,format?}`(保留 `nullable`),
  `$ref`/数组/对象形态一并丢弃——规则作者意图就是改写该字段的 JSON 形态;
  `description`/`example`/Bean Validation 约束在新类型上照常叠加。
- **D4 作用域限模型字段**:path/query/header 参数与 multipart 表单不经过 `fieldRuleEngine`,
  传输层本来就是字符串绑定,不存在 JSON 精度问题,故不纳入 `field.type`。
- **D5 `id`/`*Id`+Long 内置默认开,AND 语义关闭**:用户决定把 ID 文档化设为默认行为
  ("改为默认的可选项")。误报代价不对称——无此类序列化器的项目被误标 `string` 只是
  前端类型声明不精确(编译期即可发现);有此类序列化器的项目被误标 `integer` 则前端
  静默丢精度(运行期数据损坏),故默认开。关闭语义用「任一渠道显式 `false` 即关」,
  避免 `ResolvedConfig` 把默认值解析成确定布尔后 properties 永远失效的优先级陷阱。
- **D6 内置默认=预置规则注入,非硬编码判定**:回应"`idAsString` 太特例"的质疑——
  特例的是谓词内容(命名约定),不是机制;把默认实现为「向 `field.type` 流注入一条
  预置 groovy entry」后,特例降级为默认配置内容,与用户规则走同一条求值管线、
  被顺序语义天然覆盖,也顺带证明安全 groovy 子集足以表达该谓词。

## 4. 用法

### 内置默认:`idAsString`(推荐,零配置)

`id`/`*Id` 且声明类型为 `Long`/`long`/`BigInteger` 的字段**默认**输出 `string`——
常规项目无需任何配置。关闭渠道(任一显式 `false` 即关,AND 语义不做反向覆盖):

- `.apifox-helper.properties`:`idAsString=false`
- `.api2apifox.json`:`helperProperties.idAsString: false`
- CLI:`--id-as-string=false`
- API:`analyze(files, { idAsString: false })`

显式 `field.type` 规则命中的字段以规则为准(内置默认只在无显式覆盖时兜底)。

### 手写规则(非常规命名/自定义条件时用 `field.type`)

```properties
# 例:非 *Id 命名的长整型字段(如 xxxPk)也按 string
field.type=groovy: (it.name().endsWith("Pk") && it.type()?.name()?.endsWith("Long")) ? "string" : null
```

类型级全量转换也可表达:`field.type=groovy: it.type()?.name()?.endsWith("Long") ? "string" : null`。

### 内置默认的实现口径

- **实现为预置规则注入而非独立判定代码**:`BUILTIN_ID_AS_STRING_ENTRY` 是一条合成的
  `field.type` groovy entry,排在项目规则之前进入同一条求值流——"多条命中后者生效"
  的顺序语义使项目 `field.type` 规则天然覆盖它;`idAsString=false` 时跳过注入。
  谓词即用法示例中的那条 groovy(`List<Long>`/`Long[]` 以 `>`/`]` 结尾天然不命中)。
- 作用域仍是模型字段(`fieldRuleEngine`),path/query/header 参数不受影响。
- `ResolvedConfig.idAsString` 默认 `true`,经 `analyze→buildOpenApi→ResolveOptions`
  透传;`idAsStringEnabled` 检查 `options===false` 或 properties `idAsString=false`。

## 5. 已知边界

- `it.type()?.name()` 取源码声明文本(未解析 import 的限定名),`Long`/`java.lang.Long` 需靠
  `endsWith`/`simpleName` 覆盖两种写法;`List<Long>`/`Long[]` 输出为 `List<Long>`/`Long[]`,
  不会被 `endsWith("Long")` 误命中。
- 值级语义(小 ID 输出数字、大 ID 输出字符串)在 OpenAPI 3.0 里最忠实的表达是
  `oneOf:[integer,string]`,但对前端 DX 更差;按 ID 字段统一 string 是取舍后的口径,
  JS 侧 `String(v)`/模板插值对两种到达形态都安全。
- `evalSafeStringExpr` 中 `it.type()...name` 既有的「枚举名」快捷分支未改动(向后兼容),
  访问器原子只新增在三元条件侧。

# 支持 .apifox-helper.properties(对齐 IDEA 版 Apifox Helper / easyyapi 声明式子集)

> 状态:已实现(52 测试全绿),2026-09-07
> 背景:用户在真实项目(child-adolescent-health-backend,Ext Plus 框架)中使用本扩展,
> 发现 IDEA 版 Apifox Helper 的 `.apifox-helper.properties` 未被本扩展识别,
> 期望本扩展支持该配置文件以兼容团队既有文档规则。

## 1. 现状与目标

### 现状
- 本扩展(VS Code)纯静态解析 Java,生成 OpenAPI 3.0,无 Groovy/classpath 运行时。
- 完全不读取 `.apifox-helper.properties`(该文件是 IDEA 版 Apifox Helper/easyyapi 的配置)。
- 字段描述只认 Swagger/OpenAPI 注解 + Javadoc;`@DataDic`(Ext Plus 框架字典注解)等
  第三方注解不在白名单,字典字段不带「(框架字典:xxx)」说明。
- 无注解 Bean 参数(如 `PatientQuery query`)被忽略并告警,不展开字段。

### 目标(最小可用子集,不跑 Groovy)
1. 扫描工作区 `.apifox-helper.properties`(项目根/模块级),解析声明式规则。
2. 应用规则到解析管线对应阶段,优先支持团队现有写法,包括:
   - `field.doc`(字段额外注释,支持无条件与 `[@注解]` 条件,值可为 `#tag`/`@注解#属性`/字面量)
   - `folder.name`(接口目录,`#tag` 或 `@注解#value`)
   - `ignore`(忽略类/方法)
   - `field.ignore` / `field.name` / `field.required`(字段级常用)
   - `api.name` / `method.description`(方法级常用)
   - 注解属性读取(如 `@注解` 存在、`@注解#value`)
   - 取反条件 `!@注解`
3. 不支持的 `groovy:` / `js:` 复杂脚本:不执行,给出 warning 说明该行被跳过(不静默)。

### 明确不做(与 IDEA 的差距,记入 README)
- 不嵌入 Groovy/JS 引擎执行任意脚本(安全与体积考虑)。
- 不解析 classpath/反射,无法在 JS 里做 `helper.findClass` 全工程任意类型查找;
  但对「字段类型是否为枚举」这种可由本扩展自有 TypeIndex 判断的能力,提供近似支持。
- 不读取 `application.{yml|properties}` 解析 spring 配置(不做 `${server.servlet.context-path}` 前缀推断)。
- 不支持 `module`(多项目拆分)、`export.after` 等 export/http 回调、`json.*` 解析钩子。

## 2. IDEA 版机制回顾(参考实现)

规则引擎(easyyapi 风格)核心三点:
- **key 可带条件后缀**:`key[条件]=值`,条件可以是 `#javadocTag`、`@全限定注解`、`@注解#属性`、
  `groovy:表达式`、取反 `!@...`。命中才应用该规则。
- **值取值语法**:`#tag` 读 javadoc `@tag`;`@全限定注解#属性` 读注解属性;字面量直接使用;
   `groovy:`/`js:` 执行脚本。
- **作用域分层**:类级(class)/方法级(method)/参数级(arg)/字段级(field),不同 key 在解析不同阶段生效,
  每级有 context `it`。

配置加载:项目根 + 模块根多个文件合并;模块级优先于项目根;支持 `properties.additional=` 链式加载。
(官方文档:可配置规则 `docs.apifox.com/5801721m0`、项目内配置 `docs.apifox.com/5801720m0`。)

## 3. 本扩展实现设计

### 3.1 新模块(src/config/properties.ts)
- 解析 Java `.properties` 语法(兼容 UTF-8 中文):
  - `key=value`、`key: value`、`key value`;`\` 续行;`` ``` `` 包裹多行值(去除首尾换行)。
  - `#`/`!` 注释(行首)。
  - 行内 `key[condition]=value` → 拆出 condition。
  - `properties.additional=...` → 收集为链式加载(按相对 module 根解析)。
- 数据结构:
  ```ts
  interface PropEntry { key: string; cond?: string; value: string }
  interface HelperProperties {
    entries: PropEntry[];
    warnings: string[];   // 语法问题/不支持的 groovy 等
  }
  function loadHelperProperties(fsPaths: string[]): HelperProperties | undefined
  ```
- 扫描:工作区 findFiles `**/.apifox-helper.properties`(上限若干),按目录深度决定优先级
  (更深=更具体模块=优先),同级按 lexicographic。
  单文件/单方法同步时:只读取该文件同目录及以上的配置文件,避免全量扫描拖慢。

### 3.2 条件与值求值(src/java/ruleEval.ts 或并入 annotation 读取)
对给定「注解列表 + javadoc 文本」求值:
- **条件语法**(`key[...]` 中括号内容):
  - `#name` → javadoc 是否有 `@name`
  - `@fqcn` → 注解(简单名或全限定)是否存在
  - `@fqcn#attr` → 注解存在(attr 暂只作存在性)
  - `!@fqcn` → 取反
  - 裸字面量(如 `done`)/`groovy:`/`js:` → 不支持,记 warning 并跳过该规则
- **值语法**:
  - `#name` → javadoc `@name` 的正文(取该 tag 行内文本)
  - `@fqcn#attr` → 注解 attr 值(字符串;支持默认 value)
  - 其余(字面量、`groovy:` 等)→ 字面量原样返回;`groovy:`/`js:` 给 warning
- **注解匹配**:宽松匹配(简单名或全限定都行),与现有 `collectAnnotations` 一致。
- **Groovy 无法静态翻译的场景**,给出可读 warning:`field.doc[#x]=groovy:...` 里出现的
  `isEnum()`/`helper.findClass` 等,不在通用 JS 中模拟,仅在“字段类型是枚举”这一自有能力上做特例
  (见 3.3,不承诺通用 groovy 等价)。

### 3.3 规则应用(注入点)

#### A. 类级 → 用于 folder.name / ignore(controllerParser.ts 解析到 Controller 后)
- Controller 级上下文(该类的 javadoc、类注解)。
- 支持 `folder.name`:决定该 Controller 全部接口的目录(默认仍是 tag/类名,规则命中则覆盖;
  支持 `#folder` 从 javadoc `@folder` 取,也支持字面量)。
- 支持 `ignore`:命中则整类跳过(不产 endpoint,不告警——与官方 ignore 语义一致)。

#### B. 方法级 → api.name / method.description / ignore(controllerParser.ts 解析每个方法时)
- 方法级上下文(方法 javadoc + 方法注解)。
- `api.name` 覆盖 summary;`method.description[#deprecated]` 等条件追加 description;
  `ignore` 命中则该方法不产 endpoint。
- 现有「method 的 summary 默认取 javadoc 首行 / @Operation.summary」逻辑优先级:
  `@Operation/@ApiOperation` > 配置规则 > javadoc。配置规则不应高于 swagger 注解(避免破坏现行为),
  具体优先级在实现时以测试固化。

#### C. 参数级(param.*)(controllerParser.ts 参数解析处)
- 最小子集先不做 param.*(团队无此需求),预留扩展点;若配置文件出现 param.* 且未实现,
  统一 warning 提示。

#### D. 字段级 → field.doc / field.description / field.ignore / field.name / field.required(schemaResolver.ts classSchema 循环)
- 字段级上下文:字段的 javadoc、字段注解、字段类型文本、字段所属类(必要时 TypeIndex 查类型)。
- **`field.doc` / `field.description`**:对命中条件/无条件的规则,将求值结果追加到字段 schema.description:
  - 若字段已无描述且规则返回纯文本 → 设为描述
  - 若字段已有描述 → 追加 `\n` + 规则文本(对齐 IDEA “额外注释”语义)
- **`field.ignore`**:命中 true/非空 → 跳过该字段(等价于现有 JsonIgnore 分支,放在同一位置)。
- **`field.name`**:覆盖输出的 propName(在 `@JsonProperty` 等重命名之后、规则优先)。
- **`field.required`**:覆盖 required 计算(命中才进 required 数组)。
- **`json.rule.field.ignore/name/description`**:IDEA 已废弃用 field.*,仅当用户文件出现时映射到 field.* 并 warning。

#### E. 特殊:字段类型是枚举时的 field.doc(兼容团队现有第一条规则)
- 用户现有规则:`field.doc=groovy: (小驼峰字段名 && 类型是枚举) ? "（枚举类：X）" : null`
- 我们不执行 groovy,但这条规则语义可静态翻译:当“无条件 field.doc”的规则值是
  `groovy:` 且文本结构为「条件 ? 字符串 : null」(或该文件存在该经典形态)时,
  我们不做危险解析。改为:提供内置开关(见 3.4)「枚举字段自动追加（枚举类：类名）」,
  默认按官方语义开启? —— 不,默认不开启,避免改变现有导出;通过 VS Code 配置项显式开启,
  开启后对「字段类型是枚举」自动追加说明,同时把该 groovy 行标记为“已由内置规则替代”,不报错。

#### F. 特殊:带 @DataDic 注解字段的字典说明(兼容团队现有第二条规则)
- 现有规则:`field.doc[@ext.plus.common.core.annotation.DataDic]=groovy: "（框架字典：…value…）"`
- 我们支持「条件 `@全限定注解` + 值 `@注解#value`」的通用形态,即可静态表达:
  若用户在配置里写
  `field.doc[@ext.plus.common.core.annotation.DataDic]=@ext.plus.common.core.annotation.DataDic#value`
  → 我们能在字段带 @DataDic 时追加「字典编码」。但团队现有值是 groovy 字符串拼接,
  无法 1:1 通用执行。**折中方案**:对值前缀为 `groovy:` 且整值形如
  `"（框架字典：" + it.ann("X","value") + "）"` 的**单形模板**,内置一个安全替换器:
  识别 `it.ann("fqcn","attr")` 与字符串拼接,替换成注解 attr 值。
  仅限“纯字符串拼接 + it.ann()”的安全子集;其他 groovy 一律 warning。
- 这样团队现有的第二条规则不改文件即可生效(字段描述追加「（框架字典：FMJG）」)。

### 3.4 配置开关(VS Code settings,与文件并存)
- 新增配置项:
  - `apifoxHelper.helperProperties.enabled`(默认 true):是否启用 .apifox-helper.properties
  - `apifoxHelper.helperProperties.enumFieldDoc`(默认 false):枚举字段是否自动追加「（枚举类：类名）」
    (对应团队第一条 groovy 的意图,不开默认行为不变)
- 配置来源以「文件优先」,VS Code 设置只做开关/兜底(用户已选 file_only)。

## 4. 文件/职责划分

| 文件 | 改动 |
| --- | --- |
| `src/config/properties.ts`(新) | Java properties 解析 + 链式加载 + 扫描 |
| `src/java/ruleEval.ts`(新) | 条件/值求值、注解与 javadoc 上下文、groovy 安全子集翻译 |
| `src/java/controllerParser.ts` | 接入类级/方法级规则(folder.name/ignore/api.name/method.description) |
| `src/java/schemaResolver.ts` | 接入字段级规则(field.doc/ignore/name/required) |
| `src/config/settings.ts` + package.json | 新增 2 个开关配置 |
| `src/pipeline.ts` | 把 properties 解析结果随分析上下文传入各阶段 |
| `src/test/*.test.ts`(新增 properties/rule 测试) | 解析器单测 + 端到端字段规则断言 |
| `README.md` | 记录支持范围与「与 IDEA 差距」 |

## 5. 关键决策(待确认)
- D1:字段描述追加格式:`\n` 换行追加?还是空格/括号?对齐 IDEA「额外注释追加」语义,建议 `\n`。
- D2:无条件 `field.doc` 且无描述的字段:直接设为描述,还是也追加换行?建议直接设为描述。
- D3:swagger 注解与配置规则冲突时,注解优先(现有行为不动)。
- D4:配置规则中出现未实现的 key(如 param.*、enum.*):warning 提示,不影响其他规则。
- D5:properties 文件编码:仅 UTF-8(不处理 ISO-8859-1 \uXXXX 转义以外场景)?建议 UTF-8 并处理 `\uXXXX`。
- D6:安全性:绝不 eval 任意脚本;所有 groovy 翻译仅在「白名单安全形态」内,其余 warning。

## 6. 测试计划
- properties 解析:续行、多行 ```、key[cond]、注释、= 与 : 分隔、properties.additional。
- 规则求值:field.doc 无条件/条件、@注解#value、#tag、取反。
- schemaResolver:字段带 @DataDic + 配置 → description 追加「（框架字典：FMJG）」;
  枚举字段 + 开关 → 追加「（枚举类：X）」;field.ignore/name/required 生效。
- controllerParser:folder.name=#folder 决定目录;ignore 跳类/方法;api.name 覆盖 summary。
- pipeline:properties 加载合并优先级、warning 聚合。
- sample 里新增 .apifox-helper.properties 样例(含这两条规则)跑端到端导出断言。
- 回归:现有 28 个测试全绿(默认配置不含规则时行为不变)。

## 7. 里程碑
- M1:properties 解析 + 单测
- M2:规则求值(注解/javadoc 上下文 + groovy 安全子集)+ 单测
- M3:schemaResolver 字段级接入 + 端到端断言
- M4:controllerParser 类/方法级接入 + 端到端断言
- M5:开关、扫描/优先级、warning、README、全量回归

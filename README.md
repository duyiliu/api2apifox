# ApiGen for Apifox

[![Version](https://img.shields.io/visual-studio-marketplace/v/duyiliu.api2apifox)](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/duyiliu.api2apifox)](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/duyiliu.api2apifox)](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/duyiliu.api2apifox)](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)
[![npm: @duyiliu/api2apifox](https://img.shields.io/npm/v/%40duyiliu%2Fapi2apifox?label=CLI%20npm)](https://www.npmjs.com/package/@duyiliu/api2apifox)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**解析本地 Spring Boot 源码 → 生成 OpenAPI 3.0 → 一键同步到 Apifox 项目。** 对标 IDEA 版 Apifox Helper，提供两种形态：

| 形态 | 适用场景 | 安装 |
| --- | --- | --- |
| **独立 CLI `api2apifox`** | AI Agent、CI、脚本化调用，不依赖 VS Code | `npm install -g @duyiliu/api2apifox` |
| **VS Code / Cursor 扩展** | 编辑器内浏览接口、勾选/单接口/单文件/整项目同步 | Marketplace 搜 `duyiliu.api2apifox` |

> **命名说明**：项目曾用名 Apifox Helper（故仓库名与部分配置项仍为 `apifox-helper` / `apifoxHelper.*`），现产品名为 **ApiGen for Apifox**，Marketplace 扩展 ID 为 `duyiliu.api2apifox`，CLI 包名为 `@duyiliu/api2apifox`。

## ✨ 特性亮点

- **零配置**:打开 Java 工程即可解析,不需要 JDK、不需要 LSP、不需要启动应用
- **源码不出本机**:纯静态解析(基于 [java-parser](https://github.com/jhipster/prettier-java)),源码不会上传到任何服务器,只有生成的文档数据会发送到 Apifox 开放 API
- **依赖 jar 类型还原**:自动发现本地 Maven 仓库,按需解析 `.class` 字节码,把源码之外的类型(如自定义 `ResponseDto<T>`、MyBatis-Plus 的 `Page`)还原为完整模型——字段、泛型、`@ApiModelProperty` 描述均可带出,与 IDEA 插件的 classpath 能力等效
- **规则引擎兼容**:识别 `.apifox-helper.properties` 声明式规则(与 IDEA 版 Apifox Helper / easyyapi 兼容的子集),团队既有规则可直接复用
- **细粒度同步**:整个项目 / 单个文件 / 单个接口,随取随传
- **CLI 一等公民**:与扩展共用同一套解析与同步管线,`--format json` 输出稳定信封 + 语义化退出码,AI Agent / CI 开箱即用

## 📟 独立 CLI（AI Agent / CI / 脚本）

不依赖 VS Code，直接扫描 Java 项目、生成 OpenAPI 3.0 并同步到 Apifox。与扩展共用同一套解析与同步管线，能力完全等价。要求 Node.js ≥ 20。

```bash
npm install -g @duyiliu/api2apifox        # 或免安装:npx @duyiliu/api2apifox ...
```

### 常用命令

```bash
api2apifox scan --project . --format json                    # 扫描并输出接口清单
api2apifox export --project . --output openapi.gen.json      # 导出 OpenAPI 3.0 文件
api2apifox export --project . --stdout                       # OpenAPI 直接输出到 stdout
api2apifox sync --project . --dry-run --format json          # 同步预演(不写入)
API2APIFOX_TOKEN=APS_xxx api2apifox sync --project . --project-id 123456 --yes --format json
api2apifox config --project . --format json                  # 查看生效配置
```

`sync` 真正写入后会在浏览器自动弹出同步结果报告页（汇总计数、错误警告、接口清单，同 VS Code 结果面板）；`--no-report` 可关闭。

### 范围与筛选

```bash
api2apifox scan --file path/to/UserController.java
api2apifox scan --endpoint "GET /api/users" --format json
api2apifox scan --include "**/src/main/java/**/*.java" --exclude "**/target/**"
```

- `--file` / `--endpoint` 可重复，为**解析后过滤**；要减少扫描量请用 `--include` / `--exclude`（注意二者是整体替换默认列表，不是追加）。
- `--dependency-repo <dir>` / `--dependency-jar <path>` 可补充 Maven 仓库与依赖 jar。

### 配置文件与 AI 调用约定

项目根目录可创建 `.api2apifox.json`（`projectId`、`apiBaseUrl`、`include`/`exclude`、冲突策略、`pageTypeStyle` 等）；配置优先级：**CLI 参数 > `API2APIFOX_*` 环境变量 > `.api2apifox.json` > 默认值**。

- Token **不允许**写入配置文件，请用 `API2APIFOX_TOKEN`（及 `API2APIFOX_PROJECT_ID`）环境变量。
- `--format json` 时 stdout 只输出一个 JSON 信封，按 `ok` / `error.code` 分支；`--quiet` 隐藏非致命告警。
- 稳定退出码：`0` 成功 / `2` 参数或确认错误 / `3` 无 Java 文件或目标接口 / `4` 鉴权错误 / `5` 网络或服务错误。
- 真正同步必须在交互终端确认或显式传 `--yes`；首次导入可能较慢，超时上限默认 300s，可用 `--timeout-ms` 调整。返回 `REQUEST_TIMEOUT` 时请先查询目标项目再重试。

> CLI 与 VS Code 扩展的配置**相互独立**：CLI 读取 `.api2apifox.json`、`API2APIFOX_*` 环境变量与命令行参数；扩展只读取 VS Code 设置 `apifoxHelper.*`，令牌保存在 VS Code SecretStorage。两边需分别配置，改一边不会影响另一边。

完整参数表见 [`packages/cli/README.md`](packages/cli/README.md)。

## 📦 安装扩展（VS Code / Cursor）

- **扩展市场**:在 VS Code / Cursor 扩展面板搜索 **ApiGen for Apifox**,或直接访问 [Marketplace 页面](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)安装(要求 VS Code ≥ 1.85)
- **离线安装**:从 [GitHub Releases](https://github.com/duyiliu/apifox-helper-vscode/releases) 下载最新 `api2apifox-<版本>.vsix`,执行命令 `Extensions: Install from VSIX...` 安装

## 🚀 快速上手（扩展）

1. 用 VS Code / Cursor 打开一个 Spring Boot 工程
2. 点击活动栏的 **ApiGen for Apifox** 图标,打开顶部**设置中心**,填入并验证 Apifox 访问令牌,再选择目标项目(也可执行命令 `ApiGen for Apifox: 选择 Apifox 项目`)
3. 刷新**接口列表**,浏览解析出的全部接口(按模块/控制器分组)
4. 选择一种方式同步:整个项目 / 勾选的接口 / 当前文件 / 光标处单个接口;批量同步前会确认目标项目、接口数量与冲突策略
5. 可选:执行 `导出 OpenAPI 预览文件`,生成 `openapi.gen.json` 本地验证

## 🧩 功能总览

| 能力 | 说明 |
| --- | --- |
| **接口识别** | Spring MVC、Spring Cloud OpenFeign、JAX-RS、Actuator 自定义端点 |
| **参数解析** | 常用 Spring MVC 注解、`MultipartFile`、`Pageable`;无注解简单类型按 Spring 默认规则 |
| **模型展开** | DTO 递归展开(含静态内部类)、泛型实例化、`ResponseEntity`/`Mono`/`Flux` 解包、枚举、继承合并、循环引用 |
| **分页包装** | `PageInfo`、MyBatis-Plus `IPage`、Spring Data `Page`/`PageImpl`/`Slice` 自动展开 |
| **注解支持** | OpenAPI 3 / Swagger 2 / Javadoc 文档注解、Bean Validation、Jackson / FASTJSON / GSON、响应声明 |
| **同步控制** | 目录命名、根目录、冲突策略可配;项目 / 文件 / 单接口(CodeLens)三种粒度;同步串行化(并发入口自动合并);同步后出「同步结果」面板(计数表 + 接口清单,可排序 / 过滤 / 复制) |
| **依赖 jar 识别** | 自动发现本地 Maven 仓库,按需解析 `.class` 字节码,零配置还原框架类型 |

<details>
<summary><b>接口识别 — 支持的框架与冲突规则</b></summary>

- **Spring MVC**:`@RestController`/`@Controller` + `@GetMapping/@PostMapping/@PutMapping/@DeleteMapping/@PatchMapping/@RequestMapping`(方法级 `@RequestMapping` 未声明 `method` 时按 GET/POST/PUT/PATCH/DELETE 输出,与 Spring 匹配所有方法保持一致)
- **Spring Cloud OpenFeign**:`@FeignClient` 接口
- **JAX-RS**:`@Path/@GET/@POST/@QueryParam/@PathParam/@HeaderParam/@DefaultValue/@Consumes/@Produces`
- **Actuator 自定义端点**:`@Endpoint` + `@ReadOperation/@WriteOperation/@DeleteOperation` + `@Selector`
- **继承接口**:方法声明在抽象父类/接口上时按具体 Controller 展开(子类覆写优先;覆写未重声明映射时回退父类声明);类级路径前缀取继承链上最近的一处(Spring `findMergedAnnotation` 口径,不叠加)

> 冲突规则:同 method+path 冲突时 Spring MVC Controller 优先于 Feign/JAX-RS 声明;同方法多路径时 operationId 自动加序号。

</details>

<details>
<summary><b>参数解析 / 模型展开 / 分页包装 / 注解支持 — 解析细节</b></summary>

### 参数解析

- `@PathVariable` / `@RequestParam(defaultValue)` / `@RequestHeader` / `@RequestBody`
- 无注解简单类型按 Spring 默认作为 query 参数
- 无注解查询 Bean 展开为逐字段 query 参数;嵌套对象按 Spring 的 `父字段.子字段` 绑定形态命名(层级上限 5 层),集合保持数组形态
- `MultipartFile` → `multipart/form-data`
- Spring Data `Pageable` → `page/size/sort`
- `@Parameter`/`@ApiParam(hidden=true)` 参数隐藏

### 模型展开

- DTO 递归展开,泛型实例化(`ApiResult<List<UserVO>>` → `ApiResult«List«UserVO»»`)
- 静态内部类展开为独立数据模型(如 `PatientSaveRequest.HealthProfileRequest`)
- `ResponseEntity`/`Mono`/`Flux` 解包
- 枚举、继承字段合并、循环引用(`$ref`)

### 分页包装内置识别

- `PageHelper.PageInfo`(list/total/pageNum...)
- MyBatis-Plus `IPage`
- `Page`/`PageImpl`/`Slice`(按 `pageTypeStyle` 配置展开为 mybatis-plus 或 spring-data 形态)

### 注解支持

- **文档注解**:OpenAPI 3(`@Operation/@Tag/@Parameter/@Schema`,支持 hidden)、Swagger 2(`@Api/@ApiOperation/@ApiModel/@ApiModelProperty/@ApiParam` 与 `@ApiImplicitParams/@ApiImplicitParam`)、Javadoc(`@param/@return`)
- **Bean Validation**:`@NotNull/@NotBlank/@NotEmpty` → required,`@Size` → minLength/maxLength/minItems/maxItems,`@Min/@Max/@DecimalMin/@DecimalMax`(含 inclusive=false)→ minimum/maximum,`@Pattern` → pattern,`@Email` → format,`@Positive/@Negative` 等
- **序列化注解**:Jackson `@JsonProperty/@JsonIgnore`、FASTJSON `@JSONField(name/serialize)`、GSON `@SerializedName`
- **响应声明**:`@ApiResponses/@ApiResponse`(含 `@Schema(implementation=X.class)` 响应体)、`@ResponseStatus` → 额外状态码;`@Deprecated` → deprecated

</details>

<details>
<summary><b>同步控制 / 依赖 jar 识别 — 细节</b></summary>

### 同步到 Apifox

- 目录命名来源可配(`@Tag` 注解值或 Controller 类名),可选根目录与数据模型目录(自动创建)
- 冲突策略可配:覆盖 / 自动合并 / 保留现有 / 新建
- 同步完成后打开「同步结果」面板:导入计数按「接口 / 数据模型 / 目录 × 新增 / 更新 / 忽略 / 失败」成表,并列出本次同步的接口清单(名称 / 方法 / 路径 / 目录 / 源文件),支持排序、过滤与一键复制(TSV / Markdown);通知栏保留一行摘要,可点「查看结果表」重新打开面板(命令 `查看上次同步结果`)

### 依赖 jar 类型识别(零配置)

自动发现本地 Maven 仓库(发现链:JetBrains `MAVEN_REPOSITORY` 路径变量 → IDEA Maven 索引 → `~/.m2/settings.xml` → 默认 `~/.m2/repository`;均未命中可用 `dependencyRepos` 兜底),结合工作区 `pom.xml` 依赖坐标定位 jar,**按需解析 .class 字节码**(zip + 常量池 + 泛型签名 + RUNTIME 注解),还原源码之外的类型——字段、泛型、`@ApiModelProperty` 描述均可带出。

</details>

## 🖥 接口列表视图（扩展）

- **浏览**:侧边栏「接口列表」按接口目录分组展示工作区解析出的所有接口,目录 key 含 `/` 时逐级嵌套(如 `测评工作站/测评量表-CARS`);目录默认收起,手动展开/收起后刷新保持;保存 Java 文件后自动刷新(侧边栏不可见时延迟到下次可见)
- **快速过滤**:点击标题栏漏斗图标输入关键词(支持 URL 路径、中文描述、HTTP 方法、Controller 类名等),支持多词组合(空格分隔),实时保留匹配项并高亮关键字;过滤激活时常驻一行 `🔍 "关键字" · 命中数/总数`,一键清除
- **搜索并跳转**:放大镜图标弹出 QuickPick,模糊匹配接口,回车直接跳转到源码定义
- **批量勾选**:过滤状态下「全选」仅勾选当前命中接口;若存在过滤隐藏的已选项,同步时会明确选择“仅当前过滤”或“全部已选”;勾选按 Apifox 项目隔离并跨会话保持

### 同步命令（VS Code 命令）

| 命令 | 说明 |
| --- | --- |
| `同步整个项目到 Apifox` | 扫描全部源码并同步 |
| `同步勾选的接口到 Apifox` | 只同步列表中勾选的接口 |
| `同步当前文件到 Apifox` | 右键 Java 文件(资源管理器/编辑器)或命令面板 |
| `同步光标处接口到 Apifox` | 光标停在接口方法内执行,或点方法上方 CodeLens「▲ 同步此接口」 |
| `查看上次同步结果` | 重新打开「同步结果」面板(导入计数表 + 接口清单) |
| `导出 OpenAPI 预览文件` | 生成 `openapi.gen.json` 本地验证 |

## ⚙️ 扩展设置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `apifoxHelper.projectId` | `0` | Apifox 项目 ID(推荐用「选择项目」命令自动写入) |
| `apifoxHelper.apiBaseUrl` | `https://api.apifox.com` | 开放 API 地址,私有化部署可改 |
| `apifoxHelper.endpointConflictBehavior` | `OVERWRITE_EXISTING` | 接口冲突:`OVERWRITE_EXISTING` / `AUTO_MERGE` / `KEEP_EXISTING` / `CREATE_NEW` |
| `apifoxHelper.schemaConflictBehavior` | `OVERWRITE_EXISTING` | 数据模型冲突策略,取值同上 |
| `apifoxHelper.include` | `["**/src/main/java/**/*.java"]` | 扫描 glob |
| `apifoxHelper.exclude` | `["**/target/**", "**/build/**", "**/src/test/**", "**/sample/**", "**/.*/**"]` | 排除 glob；工作区根下隐藏目录还会被强制过滤 |
| `apifoxHelper.exportPath` | `openapi.gen.json` | 预览导出路径 |
| `apifoxHelper.pageTypeStyle` | `mybatis-plus` | 简单名 `Page` 的展开形态:`mybatis-plus`(records/total/current)或 `spring-data`(content/totalElements/number) |
| `apifoxHelper.folderNameSource` | `tag` | 接口目录命名来源:`tag`(@Tag 注解,缺省类名)或 `controller`(类名) |
| `apifoxHelper.helperProperties.enabled` | `true` | 是否识别工作区 `.apifox-helper.properties` 规则 |
| `apifoxHelper.helperProperties.enumFieldDoc` | `false` | 枚举字段自动在描述后追加「(枚举类:类名)」 |
| `apifoxHelper.dependencyRepos` | `[]` | 可选兜底:额外本地 Maven 仓库目录(默认已自动发现 JetBrains MAVEN_REPOSITORY/IDEA 索引/`~/.m2`) |
| `apifoxHelper.enableCodeLens` | `true` | 是否在 Java Controller 方法上方显示「同步此接口」快捷按钮 |
| `apifoxHelper.dependencyJars` | `[]` | 显式依赖 jar 绝对路径(优先于仓库发现) |
| `apifoxHelper.maxDependencyJars` | `120` | 依赖 jar 解析总数上限(直接 + 传递依赖);超出按依赖距离丢弃并提示,`0` 表示不做依赖解析 |
| `apifoxHelper.rootFolderName` | 空 | 可选,所有接口目录放到该父目录下(自动创建) |
| `apifoxHelper.schemaFolderId` | `0` | 可选,数据模型导入到该目录(填 Apifox 目录的数字 ID;目录查询接口已被 Apifox 下线,无法按名查找) |

> 设置中心保存的项目绑定(`projectId`/`projectName`/`teamName`/`apiBaseUrl` 等)写入**工作区** `.vscode/settings.json`,会随仓库提交共享给团队(便于成员共用同一目标项目);访问令牌始终存在系统 SecretStorage,不落任何文件。

## 📄 .apifox-helper.properties 支持

支持 IDEA 版 Apifox Helper(easyyapi 规则引擎)的**声明式规则子集**,文件放工作区/模块根目录即可,无需额外配置:

| 规则 | 目标 | 值写法示例 | 说明 |
| --- | --- | --- | --- |
| `folder.name` | 类/方法 | `#folder`(javadoc `@folder 目录/子目录`)、字面量 | 覆盖接口所在 Apifox 目录 |
| `ignore` | 类/方法 | `#ignore`(javadoc `@ignore`) | 跳过该类/方法的全部接口 |
| `api.name` | 方法 | `#api.name`、`@注解#value`、字面量 | 覆盖接口名(swagger 注解仍优先) |
| `method.description` | 方法 | `#desc` 等 | 追加到接口描述 |
| `field.description` / `field.doc` | 字段 | `@注解#value`、字面量、`groovy:` 安全拼接 | 追加到字段描述 |
| `field.ignore` | 字段 | 字面量(字段名)、`#tag` | 忽略字段 |
| `field.name` | 字段 | `#fieldName` 等 | 覆盖输出字段名 |
| `field.required` | 字段 | `#fieldRequire` 等 | 覆盖必填 |
| `field.type` | 字段 | `string`、`integer:int64` 等字面量、`#tag`、`@注解#attr`、`groovy:` 安全形态 | 覆盖输出 schema 类型(`type` 或 `type:format`;`type` ∈ `string|integer|number|boolean|object|array`) |

条件后缀:`key[#tag]=...`、`key[@全限定注解]=...`、`key[!@注解]=...`(取反)。

**与 IDEA 版的差异/边界**:

- 不嵌入 Groovy/JS 运行时。`groovy:`/`js:` 值仅支持「纯字符串拼接 + `it.ann("注解","属性")`」的安全形态(典型如 `field.doc[@ext.plus.common.core.annotation.DataDic]=groovy: "（框架字典：" + it.ann("ext.plus.common.core.annotation.DataDic", "value") + "）"` 可直接使用);其余脚本不执行,并以告警提示跳过(不会静默)
- 三元条件的条件侧额外支持字段访问器:`it.name()`(字段名)、`it.type()?.name()`(声明类型原文)、`it.type()?.simpleName()`(根简单名),可接 `==`/`!=`/`null` 比较或 `equals/equalsIgnoreCase/startsWith/endsWith/contains/matches` 字符串方法。典型用法——把雪花 ID 字段按 `string` 文档化(对齐「大整型序列化为字符串」的框架契约):`field.type=groovy: ((it.name() == "id" || it.name().endsWith("Id")) && (it.type()?.name()?.endsWith("Long") || it.type()?.name() == "long" || it.type()?.name()?.endsWith("BigInteger"))) ? "string" : null`
- 类/方法/字段规则的 `#tag`、注解、字面量写法与官方一致
- 不读取 `application.{yml|properties}` 做 spring 配置属性解析,不支持 `module`/`export.*`/`api.class.parse.*` 等回调类规则
- 无法安全执行的规则会出现在同步/导出的告警里,格式:`<key> 的 groovy/js 规则无法在无脚本运行时下安全执行,已跳过:...`

## ❓ FAQ

**需要安装 JDK 或启动应用吗?** 不需要。纯静态解析源码与依赖 jar 字节码,全程不启动进程。

**源码会被上传吗?** 不会。源码只在本地解析,发送到 Apifox 开放 API 的仅有生成的 OpenAPI 文档数据。

**Apifox 是私有化部署能用吗?** 能。将 `apifoxHelper.apiBaseUrl` 改为私有化部署的开放 API 地址即可。

**支持 Kotlin / Gradle 吗?** Kotlin 源码暂不支持(仅 Java)。Gradle 项目的依赖 jar 可通过 `apifoxHelper.dependencyJars` 显式指定。

## ⚠️ 已知边界

- **Kotlin 不支持**:需要第二套解析器(Kotlin 语法树),当前版本仅支持 Java 源码
- **依赖 jar 类型识别的边界**:解析工作区 `pom.xml` 声明的直接依赖,并读取各 jar 内嵌 pom 再推断 2 轮传递依赖(jar 总数上限默认 120,可用 `maxDependencyJars` 调整;超出部分按依赖距离丢弃,告警会列出被丢弃的 jar 名);仍未覆盖的类型可通过 `dependencyJars` 显式补充;Gradle 项目请用 `dependencyJars` 显式指定;仓库中的同名类以先注册的 jar 为准
- 同项目内不同包下的**顶层**重名类型以简单名索引,后扫描到的覆盖先扫描到的(源码类型优先于 jar 类型;插件不做 import 解析,无法区分同名顶层类型)
- 类体/接口体内的**嵌套类型按 Java 作用域解析**:支持完整的多层成员路径及泛型包装中的嵌套实参,字段类型里的简单名优先命中本类成员,再由内向外回退到顶层类型。不同类型同名时追加 `_2`、`_3` … 并告警;已完成的非递归同结构模型可复用,递归模型保留独立名称以保证引用准确
- **隐藏目录与工作区内另一处 git 检出不参与扫描**:工作区根下任一 `.xxx` 目录的内容均跳过,因此 `.kilo/worktrees`、`.claude/worktrees` 和其他 AI 工具的隐藏工作目录不会产生重复接口；嵌套 git 检出同样按 `.git` 标记跳过。要扫描某个工作树,请将该工作树根目录作为独立工作区或多根工作区文件夹打开
- 查询 Bean 的集合字段以数组形态描述(如 `deptCodes: array`);IDEA 版会写成 `deptCodes[0]`,只体现首个元素,故此处有意不一致
- 继承接口的**泛型形参不做实例化绑定**:`abstract class Base<T>` 的方法签名里引用 `T` 时按未绑定类型处理(如 `T` 直接落在 `$ref`/类型名上);抽象基类声明为具体类型的场景不受影响
- `@ApiResponse` 的 `headers`/`links`、`@Digits`、`@Past/@Future` 等未映射

## 🛠 开发与发布

> 仓库根目录的 `work/` 存放内部设计文档与任务笔记（如 `.apifox-helper.properties` 支持的设计稿），不参与扩展/CLI 发布。

```bash
npm install
npm run compile     # esbuild 打包到 dist/
npm test            # 解析器单测 + sample 项目端到端断言
npm run test:host   # VS Code 1.85 Extension Host smoke(激活/命令/single-flight/成功与失败恢复)
npm run package     # 打包 vsix(产物名 api2apifox-<版本>.vsix)
```

在 VS Code 中调试:打开本目录后 F5(Extension Development Host),用 `sample/` 目录作为测试工作区。

CLI 的 `npm pack` 会通过 `prepack` 自动构建并校验运行版本。维护者应使用
`node packages/cli/verify-package.js <tarball.tgz>` 校验最终包,再发布同一份 tarball。
CLI 工作流只认 `cli-v*` 标签,需要仓库 secret `NPM_TOKEN`;缺失时会在构建前明确报错。

**发版流程(维护者)**:仓库配置了 GitHub Actions 工作流 `.github/workflows/release.yml`,推送 `v*` tag 后自动完成:类型检查 → 单测 → 打包 vsix → 发布到 VS Code Marketplace → 创建 GitHub Release(附带 vsix)。首次需在仓库 Settings → Secrets and variables → Actions 添加 `VSCE_PAT`(Azure DevOps PAT,scope 勾选 Marketplace → Manage)。日常发版:

```powershell
git add .
git commit -m "chore: xxx"
npm run release:patch   # 自动 bump 版本号并生成 vX.Y.Z 的 commit + tag,release:minor/release:major 同理
git push origin main
git push origin --tags  # 触发自动发版
```

## 📄 License

[MIT](LICENSE)

# api2apifox

[![Version](https://img.shields.io/visual-studio-marketplace/v/duyiliu.api2apifox)](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/duyiliu.api2apifox)](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/duyiliu.api2apifox)](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/duyiliu.api2apifox)](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)
[![CI](https://github.com/duyiliu/api2apifox/actions/workflows/ci.yml/badge.svg)](https://github.com/duyiliu/api2apifox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**解析本地 Spring Boot 源码 → 生成 OpenAPI 3.0 → 一键同步到 Apifox 项目。** Java 接口解析与 Apifox 同步工具，对标 IDEA 版 Apifox Helper，提供两种形态：

| 形态 | 适用场景 | 安装 |
| --- | --- | --- |
| **Agent Skill `api2apifox`**（内置 CLI） | AI Agent、CI、脚本化调用，不依赖 VS Code | `npx skills add duyiliu/api2apifox --skill api2apifox -g` |
| **VS Code / Cursor 扩展** | 编辑器内浏览接口、勾选/单接口/单文件/整项目同步 | VS Code Marketplace 搜 `duyiliu.api2apifox`；Cursor 用 vsix 安装 |

> **命名说明**：项目名称、Marketplace 扩展 ID（`duyiliu.api2apifox`）与内部 CLI 包名（`@duyiliu/api2apifox`）已统一为 **api2apifox**；早期曾用名 Apifox Helper / ApiGen for Apifox 只保留在下列兼容标识里，均不可更改，改了会破坏既有团队规则、用户配置、快捷键与既有命令调用：
> - 工作区规则文件名 `.apifox-helper.properties`（与 IDEA 版 Apifox Helper / easyyapi 共用）；
> - 扩展设置前缀 `apifoxHelper.*`（含 `apifoxHelper.helperProperties.*` 等全部配置键）；
> - 扩展命令 ID 前缀 `apifoxHelper.*`（`package.json` 中 `contributes.commands` 的 `command` 字段）、视图容器 ID `apifoxHelper` 与视图 ID `apifoxHelper.apiTree`（含 `viewsWelcome`、`menus` 的 `when`/`command` 引用）。

## ✨ 特性亮点

- **零配置**:打开 Java 工程即可解析,不需要 JDK、不需要 LSP、不需要启动应用
- **源码不出本机**:纯静态解析(基于 [java-parser](https://github.com/jhipster/prettier-java)),源码不会上传到任何服务器,只有生成的文档数据会发送到 Apifox 开放 API
- **依赖 jar 类型还原**:自动发现本地 Maven 仓库,按需解析 `.class` 字节码,把源码之外的类型(如自定义 `ResponseDto<T>`、MyBatis-Plus 的 `Page`)还原为完整模型——字段、泛型、`@ApiModelProperty` 描述均可带出,与 IDEA 插件的 classpath 能力等效
- **规则引擎兼容**:识别 `.apifox-helper.properties` 声明式规则(与 IDEA 版 Apifox Helper / easyyapi 兼容的子集),团队既有规则可直接复用
- **细粒度同步**:整个项目 / 单个文件 / 单个接口,随取随传
- **Agent Skill 一等公民**:自带 CLI 运行时,装 Skill 即用,无需 npm 全局安装;与扩展共用同一套解析与同步管线,`--format json` 输出稳定信封 + 语义化退出码,AI Agent / CI 开箱即用

## 📟 Agent Skill（AI Agent / CI / 脚本）

不依赖 VS Code，直接扫描 Java 项目、生成 OpenAPI 3.0 并同步到 Apifox。Skill **自带完整 CLI 运行时**，安装 Skill 即完成安装，不再需要 `npm install -g`；与扩展共用同一套解析与同步管线，能力完全等价。要求 Node.js ≥ 20。

### 安装

```bash
npx skills add duyiliu/api2apifox --skill api2apifox -g
```

- `-g` 安装到用户级 Skill 目录（通常 `~/.agents/skills/api2apifox`），其他 Agent 客户端按各自规则同步/链接。
- 固定版本：`npx skills add duyiliu/api2apifox#v0.4.2 --skill api2apifox -g`（扩展与 Skill 共用同一个 `vX.Y.Z` tag）。
- 国内网络：`npx skills-cn@latest add duyiliu/api2apifox --skill api2apifox -g -y`。
- 安装后自检：`node "<skill-dir>/scripts/check-runtime.mjs"`；校验失败说明 Skill 副本损坏，应重新安装，不要改用其它工具顶替。
- 升级：`npx skills update api2apifox -g`（装指定版本重新执行带 `#vX.Y.Z` 的 add 命令）；卸载：`npx skills remove api2apifox -g`。
- 离线/内网：从 [GitHub Releases](https://github.com/duyiliu/api2apifox/releases) 下载 `api2apifox-skill-<版本>.zip`，解压为 `~/.agents/skills/api2apifox/`（目录内含 `SKILL.md`、`scripts/`、`runtime/`），再执行自检命令。

### 常用命令

Skill 的 CLI 入口是 `<skill-dir>/scripts/api2apifox.mjs`；下文的 `api2apifox` 均指该入口。手工调用时展开为真实路径，例如：

```bash
# macOS / Linux
node "$HOME/.agents/skills/api2apifox/scripts/api2apifox.mjs" scan --project . --format json
```

```powershell
# Windows PowerShell
node "$env:USERPROFILE\.agents\skills\api2apifox\scripts\api2apifox.mjs" scan --project . --format json
```

```bash
api2apifox scan --project . --format json                    # 扫描并输出接口清单
api2apifox export --project . --output openapi.gen.json      # 导出 OpenAPI 3.0 文件
api2apifox export --project . --stdout                       # OpenAPI 直接输出到 stdout
api2apifox sync --project . --project-id 123456 --dry-run --format json  # 同步预演(不写入)
API2APIFOX_TOKEN=APS_xxx api2apifox sync --project . --project-id 123456 --yes --format json
api2apifox config --project . --format json                  # 查看生效配置
```

> `VAR=xxx cmd` 是 bash 写法；PowerShell 需先 `$env:API2APIFOX_TOKEN = "APS_xxx"` 再执行命令，cmd 用 `set API2APIFOX_TOKEN=APS_xxx`。

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
- 稳定退出码：`0` 成功 / `2` 参数或确认错误 / `3` 无 Java 文件或目标接口 / `4` 鉴权错误 / `5` 网络或服务错误 / `6` 导入部分失败 / `7` 本地错误；完整表见 SKILL.md。
- 真正同步必须在交互终端确认或显式传 `--yes`；首次导入可能较慢，超时上限默认 300s，可用 `--timeout-ms` 调整。返回 `REQUEST_TIMEOUT` 时请先查询目标项目再重试。

> Skill/CLI 与 VS Code 扩展的配置**相互独立**：Skill/CLI 读取 `.api2apifox.json`、`API2APIFOX_*` 环境变量与命令行参数；扩展只读取 VS Code 设置 `apifoxHelper.*`，令牌保存在 VS Code SecretStorage。两边需分别配置，改一边不会影响另一边。

完整参数表见 [`skills/api2apifox/references/cli.md`](skills/api2apifox/references/cli.md)；`packages/cli/README.md` 保留为 CLI 内部构建源的参数参考。

## 📦 安装扩展（VS Code / Cursor）

- **扩展市场（VS Code）**:在扩展面板搜索 **api2apifox**,或直接访问 [Marketplace 页面](https://marketplace.visualstudio.com/items?itemName=duyiliu.api2apifox)安装(要求 VS Code ≥ 1.85)
- **Cursor / 离线安装**:扩展未上架 Open VSX(Cursor 默认市场),请从 [GitHub Releases](https://github.com/duyiliu/api2apifox/releases) 下载最新 `api2apifox-<版本>.vsix`,执行命令 `Extensions: Install from VSIX...` 安装

## 🚀 快速上手（扩展）

1. 用 VS Code / Cursor 打开一个 Spring Boot 工程
2. 点击活动栏的 **api2apifox** 图标,打开顶部**设置中心**,填入并验证 Apifox 访问令牌,再选择目标项目(也可执行命令 `api2apifox: 选择 Apifox 项目`)
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

- 目录命名来源可配(`@Tag` 注解值或 Controller 类名),可选根目录与数据模型目录(自动创建);目录值含 `/` 时按多级目录导入(`x-apifox-folder` 官方语义)
- 默认会把已存在接口的目录同步成最新 `x-apifox-folder`(对应 Apifox 导入选项 `updateFolderOfChangedEndpoint`);关掉该开关则只更新接口内容,不迁移目录
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
| `apifoxHelper.rootFolderName` | 空 | 可选,所有接口目录放到该父目录下(自动创建);目录名可含 `/` 表示多级 |
| `apifoxHelper.updateFolderOfChangedEndpoint` | `true` | 覆盖已存在接口时同步更新其目录(对应 Apifox 导入的「更新接口所在目录」);关闭后改 `@Tag`/`rootFolderName` 不会迁移已同步接口 |
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
| `param.ignore` | 参数 | 字面量(参数名)、`#tag`、`groovy:` 安全形态 | 忽略 path/query/header 参数与 multipart 表单字段 |
| `param.required` | 参数 | `true`/`false` | 覆盖参数必填(path 参数按规范恒 required,不受影响) |
| `param.type` | 参数 | 同 `field.type` | 覆盖参数 schema 类型;按名/按型谓词(如 `*Id` 的 Long 参数 → `string`)与 `field.type` 写法相同 |
| `param.doc` / `param.description` | 参数 | 字面量、`#tag`、`@注解#attr`、`groovy:` 安全形态 | 追加到参数描述 |

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

> 仓库根目录的 `work/` 存放内部设计文档与任务笔记（如 `.apifox-helper.properties` 支持的设计稿）；`skills/` 是 Agent Skill 分发目录。二者都不参与 VSIX 发布。

```bash
# 要求 Node.js >= 20
npm install
npm run compile     # esbuild 打包到 dist/
npm test            # 解析器单测 + sample 项目端到端断言
npm run test:host   # VS Code 1.85 Extension Host smoke(激活/命令/single-flight/成功与失败恢复)
npm run test:vsix   # 已打包 vsix 的隔离 profile 安装+激活验证(默认用本机 VS Code,无则下载 1.85)
npm run package     # 打包 vsix(产物名 api2apifox-<版本>.vsix)
npm run build:skill # 重建 Skill 自带 CLI 运行时(skills/api2apifox/runtime)
npm run check:skill # 校验 Skill 运行时哈希与版本(发版/CI 使用)
npm run release -- X.Y.Z  # 统一版本:更新两个 package.json、重建 runtime、校验
```

在 VS Code 中调试:打开本目录后 F5(Extension Development Host),用 `sample/` 目录作为测试工作区。

Skill 运行时由 `packages/cli` 的同一份 bundle 生成；改动 CLI 源码或运行 `npm run release` 后，必须提交
`skills/api2apifox/runtime/`，否则 CI 与发版工作流会因运行时过期而失败。
`packages/cli` 是内部构建源（`private: true`），不再单独发布 npm；VS Code 扩展的 Marketplace 发布保持不变。

### 统一发版（`v*`）

扩展与 Skill 使用同一个版本号：根 `package.json` 与 `packages/cli/package.json` 必须一致，tag 为 `vX.Y.Z`。推送 tag 后 `.github/workflows/release.yml` 自动完成：类型检查 → 扩展/CLI 测试 → 校验 Skill runtime → 打包 vsix 与 Skill zip → 发布 VS Code Marketplace（配置了 `OVSX_PAT` 时同时发布 Open VSX）→ 创建 GitHub Release（附带 vsix + Skill zip）。

首次需在仓库 Settings → Secrets and variables → Actions 添加：

- `VSCE_PAT`（Azure DevOps PAT，scope 勾选 Marketplace → Manage）——发布 VS Code Marketplace 必需。
- `OVSX_PAT`（可选）——发布 Open VSX，供 Cursor / Windsurf / VSCodium 用户从各自市场安装。获取方式：用 GitHub 账号登录 [open-vsx.org](https://open-vsx.org) → 在 Settings → Access Tokens 生成；首次还需在 open-vsx.org 创建与 `publisher` 同名的 namespace（`duyiliu`）。未配置时该步骤自动跳过。

日常发版：

```powershell
npm run release -- X.Y.Z   # 或 npm run release:patch / release:minor / release:major
git add package.json packages/cli/package.json package-lock.json skills/api2apifox README.md
git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags  # 触发 release.yml
```

`npm run release -- X.Y.Z` 会：

- 校验根包与 CLI 版本一致
- 更新两个 `package.json` 与 `package-lock.json`
- 重建 `skills/api2apifox/runtime`
- 同步 README/SKILL.md/references 的版本示例
- 执行 `check:skill`

`release:patch` / `release:minor` / `release:major` 等价于传对应的版本增量。脚本只准备文件和校验，不自动 commit/tag/push。

## 📄 License

[MIT](LICENSE)

# Apifox Helper (Community) for VS Code

对标 IDEA 版 Apifox Helper 的 VS Code 扩展:**解析本地 Spring Boot 源码 → 生成 OpenAPI 3.0 → 一键同步到 Apifox 项目**。纯静态解析(基于 [java-parser](https://github.com/jhipster/prettier-java)),不需要 JDK/LSP,源码不会上传到任何服务器,只有生成的文档数据会发送到 Apifox 开放 API。

## 功能

- **接口识别**:Spring MVC(`@RestController`/`@Controller` + `@GetMapping/@PostMapping/@PutMapping/@DeleteMapping/@PatchMapping/@RequestMapping`)、**Spring Cloud OpenFeign**(`@FeignClient` 接口)、**JAX-RS**(`@Path/@GET/@POST/@QueryParam/@PathParam/@HeaderParam/@DefaultValue/@Consumes/@Produces`)、**Actuator 自定义端点**(`@Endpoint` + `@ReadOperation/@WriteOperation/@DeleteOperation` + `@Selector`)
- **参数解析**:`@PathVariable/@RequestParam(defaultValue)/@RequestHeader/@RequestBody`;无注解简单类型按 Spring 默认作为 query 参数;`MultipartFile` → `multipart/form-data`;Spring Data `Pageable` → `page/size/sort`;`@Parameter/@ApiParam(hidden=true)` 参数隐藏
- **模型展开**:DTO 递归展开,泛型实例化(`ApiResult<List<UserVO>>` → `ApiResult«List«UserVO»»`)、`ResponseEntity/Mono/Flux` 解包、枚举、继承字段合并、循环引用($ref)
- **分页包装内置识别**:`PageHelper.PageInfo`(list/total/pageNum...)、MyBatis-Plus `IPage`、`Page`/`PageImpl`/`Slice`(按 `pageTypeStyle` 配置展开为 mybatis-plus 或 spring-data 形态)
- **文档注解**:OpenAPI 3(`@Operation/@Tag/@Parameter/@Schema`,支持 hidden)、Swagger 2(`@Api/@ApiOperation/@ApiModel/@ApiModelProperty/@ApiParam` 与 `@ApiImplicitParams/@ApiImplicitParam`)、Javadoc(`@param/@return`)
- **Bean Validation**:`@NotNull/@NotBlank/@NotEmpty` → required,`@Size` → minLength/maxLength/minItems/maxItems,`@Min/@Max/@DecimalMin/@DecimalMax`(含 inclusive=false)→ minimum/maximum,`@Pattern` → pattern,`@Email` → format,`@Positive/@Negative...`
- **序列化注解**:Jackson `@JsonProperty/@JsonIgnore`、FASTJSON `@JSONField(name/serialize)`、GSON `@SerializedName`
- **响应声明**:`@ApiResponses/@ApiResponse`(含 `@Schema(implementation=X.class)` 响应体)、`@ResponseStatus` → 额外状态码;`@Deprecated` → deprecated
- **同步到 Apifox**:目录命名来源可配(`@Tag` 或类名)、可选根目录与数据模型目录(自动创建)、冲突策略可配(覆盖/合并/保留/新建)、同步计数报告
- **上传粒度**:整个项目 / 单个文件 / **单个接口**(接口方法上方 CodeLens「▲ 同步此接口」,或光标停在方法内执行「同步光标处接口」)
- **本地预览**:`导出 OpenAPI 预览文件` 生成 `openapi.gen.json`
- **`.apifox-helper.properties` 支持(与 IDEA 版 Apifox Helper 兼容的声明式子集)**:自动识别项目/模块根目录下的 `.apifox-helper.properties`,支持 `folder.name`、`ignore`、`api.name`、`method.description`、`field.doc/description`、`field.ignore`、`field.name`、`field.required` 等常用规则,值语法支持 javadoc `#tag`、注解 `@注解#属性`、字面量及一种安全形态 groovy(纯字符串拼接 + `it.ann(...)`,如 `field.doc[DataDic]=groovy:"（框架字典："+it.ann("X","value")+"）"`),详见下方「.apifox-helper.properties 支持」
- **依赖 jar 类型识别(框架类无需源码)**:自动发现本地 Maven 仓库(发现链:JetBrains `MAVEN_REPOSITORY` 路径变量 → IDEA Maven 索引 → `~/.m2/settings.xml` → 默认 `~/.m2/repository`;均未命中可用 `dependencyRepos` 兜底),结合工作区 `pom.xml` 依赖坐标定位 jar,**按需解析 .class 字节码**(zip + 常量池 + 泛型签名 + RUNTIME 注解),把源码之外的类型(如 Ext Plus 的 `ResponseDto<T>`、MyBatis-Plus 的 `Page`)还原为完整模型——字段、泛型、`@ApiModelProperty` 描述均可带出,与 IDEA 插件的 classpath 能力等效,**零配置**

> 冲突规则:同 method+path 冲突时 Spring MVC Controller 优先于 Feign/JAX-RS 声明;同方法多路径时 operationId 自动加序号。

## .apifox-helper.properties 支持

VS Code 版支持 IDEA 版 Apifox Helper(easyyapi 规则引擎)的**声明式规则子集**,文件放工作区/模块根目录即可,无需额外配置:

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

条件后缀:`key[#tag]=...`、`key[@全限定注解]=...`、`key[!@注解]=...`(取反)。

**与 IDEA 版的差异/边界**:
- 不嵌入 Groovy/JS 运行时。`groovy:`/`js:` 值仅支持「纯字符串拼接 + `it.ann("注解","属性")`」的安全形态(典型如 `field.doc[@ext.plus.common.core.annotation.DataDic]=groovy: "（框架字典：" + it.ann("ext.plus.common.core.annotation.DataDic", "value") + "）"` 可直接使用);其余脚本不执行,并以告警提示跳过(不会静默)。
- 类/方法/字段规则的 `#tag`、注解、字面量写法与官方一致。
- 不读取 `application.{yml|properties}` 做 spring 配置属性解析,不支持 `module`/`export.*`/`api.class.parse.*` 等回调类规则。
- 无法安全执行的规则会出现在同步/导出的告警里,格式:`<key> 的 groovy/js 规则无法在无脚本运行时下安全执行,已跳过:...`。

## 使用

1. **安装**:VS Code 命令 `Extensions: Install from VSIX...` 选择本仓库打包出的 `apifox-helper-vscode.vsix`
2. **侧边栏「项目与账号」视图**:
   - 点击活动栏中的 Apifox Helper 图标，在**「项目与账号」**视图中可一目了然看到当前绑定的项目、所属团队、Token 状态及 API 地址。
   - **选择/修改项目**: 点击视图中的项目行，或点击标题栏的 `$(project)` 图标，即可弹出分步向导（先选团队，再选项目）。
   - **设置/修改 Token**: 点击视图中的访问令牌行，或点击标题栏的 `$(key)` 图标，随时修改或清除 Token。
3. **选择项目(命令方式)**: 也可在命令面板执行 `Apifox Helper: 选择 Apifox 项目`
4. **同步**:
   - `Apifox Helper: 同步整个项目到 Apifox` — 扫描全部源码并同步
   - `Apifox Helper: 同步当前文件到 Apifox` — 右键 Java 文件(资源管理器/编辑器)或命令面板
   - `Apifox Helper: 同步光标处接口到 Apifox` — 光标停在接口方法内执行,或直接点方法上方的 CodeLens「▲ 同步此接口到 Apifox」
   - `Apifox Helper: 导出 OpenAPI 预览文件` — 本地验证

## 扩展设置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `apifoxHelper.projectId` | `0` | Apifox 项目 ID(推荐用「选择项目」命令自动写入) |
| `apifoxHelper.apiBaseUrl` | `https://api.apifox.com` | 开放 API 地址,私有化部署可改 |
| `apifoxHelper.endpointConflictBehavior` | `OVERWRITE_EXISTING` | 接口冲突:`OVERWRITE_EXISTING` / `AUTO_MERGE` / `KEEP_EXISTING` / `CREATE_NEW` |
| `apifoxHelper.schemaConflictBehavior` | `OVERWRITE_EXISTING` | 数据模型冲突策略,取值同上 |
| `apifoxHelper.include` | `["**/src/main/java/**/*.java"]` | 扫描 glob |
| `apifoxHelper.exclude` | `["**/target/**", "**/build/**", "**/src/test/**"]` | 排除 glob |
| `apifoxHelper.exportPath` | `openapi.gen.json` | 预览导出路径 |
| `apifoxHelper.pageTypeStyle` | `mybatis-plus` | 简单名 `Page` 的展开形态:`mybatis-plus`(records/total/current)或 `spring-data`(content/totalElements/number) |
| `apifoxHelper.folderNameSource` | `tag` | 接口目录命名来源:`tag`(@Tag 注解,缺省类名)或 `controller`(类名) |
| `apifoxHelper.helperProperties.enabled` | `true` | 是否识别工作区 `.apifox-helper.properties` 规则 |
| `apifoxHelper.helperProperties.enumFieldDoc` | `false` | 枚举字段自动在描述后追加「(枚举类:类名)」(对应团队 groovy 规则意图) |
| `apifoxHelper.dependencyRepos` | `[]` | 可选兜底:额外本地 Maven 仓库目录(默认已自动发现 JetBrains MAVEN_REPOSITORY/IDEA 索引/`~/.m2`) |
| `apifoxHelper.dependencyJars` | `[]` | 显式依赖 jar 绝对路径(优先于仓库发现) |
| `apifoxHelper.rootFolderName` | 空 | 可选,所有接口目录放到该父目录下(自动创建) |
| `apifoxHelper.schemaFolderId` | `0` | 可选,数据模型导入到该目录(填 Apifox 目录的数字 ID;目录查询接口已被 Apifox 下线,无法按名查找) |

## 开发

```bash
npm install
npm run compile     # esbuild 打包到 dist/
npm test            # 解析器单测 + sample 项目端到端断言
npm run package     # 打包 vsix
```

在 VS Code 中调试:打开本目录后 F5(Extension Development Host),用 `sample/` 目录作为测试工作区。

## 已知边界

- **Kotlin 不支持**:需要第二套解析器(Kotlin 语法树),当前版本仅支持 Java 源码
- **依赖 jar 类型识别的边界**:仅解析工作区 `pom.xml` 声明的直接依赖(不含传递依赖的坐标推断;传递依赖类型可通过 `dependencyJars` 显式补充);Gradle 项目请用 `dependencyJars` 显式指定;仓库中的同名类以先注册的 jar 为准
- 同项目内不同包下的重名类型以简单名索引,后扫描到的覆盖先扫描到的(源码类型优先于 jar 类型)
- `@ApiResponse` 的 `headers`/`links`、`@Digits`、`@Past/@Future` 等未映射

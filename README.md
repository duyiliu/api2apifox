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

> 冲突规则:同 method+path 冲突时 Spring MVC Controller 优先于 Feign/JAX-RS 声明;同方法多路径时 operationId 自动加序号。

## 使用

1. **安装**:VS Code 命令 `Extensions: Install from VSIX...` 选择本仓库打包出的 `apifox-helper-vscode.vsix`
2. **设置访问令牌**:命令面板执行 `Apifox Helper: 设置访问令牌`,粘贴在 Apifox 客户端「头像 → 账号设置 → API 访问令牌」生成的 token(加密存储于 VS Code SecretStorage)
3. **选择项目**:执行 `Apifox Helper: 选择 Apifox 项目`,在线拉取项目列表选择目标项目(项目 ID 写入工作区配置)
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
| `apifoxHelper.rootFolderName` | 空 | 可选,所有接口目录放到该父目录下(自动创建) |
| `apifoxHelper.schemaFolderName` | 空 | 可选,数据模型导入到该目录(自动创建) |

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
- **第三方 jar 中的类型**:类路径上的类型(非本工作区源码)无法展开字段;常见分页/响应包装已内置,其余退化为 object 并在导出时标注「未识别的类型」
- 同项目内不同包下的重名类型以简单名索引,后扫描到的覆盖先扫描到的
- `@ApiResponse` 的 `headers`/`links`、`@Digits`、`@Past/@Future` 等未映射

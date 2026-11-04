# api2apifox CLI 完整参考

本 Skill 自带 CLI 运行时，入口固定为：

```bash
node "<本 Skill 目录>/scripts/api2apifox.mjs" <command> [options]
```

下文用 `api2apifox` 代指该入口。要求 Node.js ≥ 20。

## 命令总览

| 命令 | 作用 | 联网 |
|---|---|---|
| `scan` | 扫描 Java 项目并输出接口摘要（接口数、接口、目录、源文件） | 否 |
| `export` | 生成 OpenAPI 3.0 JSON 文件；`--stdout` 直接输出到标准输出 | 否 |
| `sync` | `--dry-run` 预检；否则真正同步到 Apifox | dry-run 否 |
| `config` | 输出最终配置及每个字段的来源 | 否 |

`api2apifox <command> --help` 查看该命令的完整参数。

## 公共参数

| 参数 | 说明 |
|---|---|
| `--project <dir>` | 项目根目录，默认当前目录 |
| `--config <file>` | 配置文件，默认 `<project>/.api2apifox.json` |
| `--format text\|json` | 输出格式，默认 `text`；`json` 时 stdout 只输出一个 JSON 信封 |
| `--quiet` | text 模式隐藏非致命警告；JSON 信封内容不变 |
| `--file <path>` | 只保留该源文件（相对项目根或绝对路径）里的接口，可重复；解析后过滤 |
| `--endpoint <METHOD PATH>` | 只保留该接口，如 `"GET /api/users"`，可重复；解析后过滤 |
| `--include <glob>` | 扫描包含的 glob，可重复；传入即整体替换默认值 `**/src/main/java/**/*.java` |
| `--exclude <glob>` | 扫描排除的 glob，可重复；传入即整体替换默认 5 项 |
| `--dependency-repo <dir>` | 额外的本地 Maven 仓库目录，可重复（传入即替换配置值） |
| `--dependency-jar <path>` | 显式依赖 jar 的绝对路径，可重复（传入即替换配置值） |
| `--dependency-max-jars <n>` | 依赖 jar 解析总数上限，默认 120；`0` 表示不做依赖解析 |
| `--timeout-ms <ms>` | Apifox 请求等待上限，默认 300000 |
| `-h, --help` | 显示帮助 |
| `-v, --version` | 显示版本 |

`scan` / `export` / `sync` 都支持 `--file` / `--endpoint` 过滤；`config` 只读配置。

## 各命令专有参数

### scan

无专有参数。输出接口摘要，适合先摸清范围。

```bash
api2apifox scan --project . --format json
api2apifox scan --project . --endpoint "GET /api/users" --format json
```

### export

| 参数 | 说明 |
|---|---|
| `-o, --output <file>` | 输出文件路径，默认 `openapi.gen.json` |
| `--stdout` | 直接输出 OpenAPI JSON 本体（无信封，不能与 `--format json` 同用） |
| `--force` | 目标文件已存在时覆盖 |

```bash
api2apifox export --project . --output openapi.gen.json --force --format json
api2apifox export --project . --stdout > openapi.json
```

### sync

| 参数 | 说明 |
|---|---|
| `--project-id <id>` | 目标 Apifox 项目 ID（也可用 `API2APIFOX_PROJECT_ID`） |
| `--token <token>` | 一次性令牌；优先用环境变量 `API2APIFOX_TOKEN`，避免进 shell 历史 |
| `--dry-run` | 只预检，不联网写入 |
| `-y, --yes` | 非交互环境必须显式确认 |
| `--no-report` | 不生成/打开同步结果报告页 |
| `--endpoint-conflict <策略>` | 接口冲突策略：`OVERWRITE_EXISTING` / `AUTO_MERGE` / `KEEP_EXISTING` / `CREATE_NEW` |
| `--schema-conflict <策略>` | 数据模型冲突策略，取值同上 |

```bash
api2apifox sync --project . --project-id 123456 --dry-run --format json
API2APIFOX_TOKEN=APS_xxx api2apifox sync --project . --project-id 123456 --yes --format json
```

真实写入后默认生成一份自包含 HTML 报告并用系统默认浏览器打开，路径在 `result.reportPath`；`--no-report` 可关闭。报告写入系统临时目录 `api2apifox-sync-report-<projectId>.html`，重复同步原地覆盖。

### config

无专有参数。输出每个配置字段的最终值与来源（`default` / `file:...` / `env:...` / `cli`）。

```bash
api2apifox config --project . --format json
```

## 配置文件 `.api2apifox.json`

```json
{
  "projectId": 123456,
  "apiBaseUrl": "https://api.apifox.com",
  "include": ["**/src/main/java/**/*.java"],
  "exclude": ["**/target/**", "**/build/**", "**/src/test/**", "**/.*/**"],
  "endpointConflictBehavior": "OVERWRITE_EXISTING",
  "schemaConflictBehavior": "OVERWRITE_EXISTING",
  "pageTypeStyle": "mybatis-plus",
  "folderNameSource": "tag",
  "helperProperties": {
    "enabled": true,
    "enumFieldDoc": false
  },
  "timeoutMs": 300000
}
```

- 优先级：**CLI 参数 > `API2APIFOX_*` 环境变量 > `.api2apifox.json` > 默认值**。
- Token **不允许**写入配置文件；出现 `token` 字段直接报错 `CONFIG_TOKEN_FORBIDDEN`。
- 本配置只作用于 CLI/Skill，与 VS Code 扩展的 `apifoxHelper.*` 设置（及扩展 SecretStorage 中的令牌）相互独立。

## 环境变量

| 变量 | 含义 |
|---|---|
| `API2APIFOX_TOKEN` | Apifox 访问令牌 |
| `API2APIFOX_PROJECT_ID` | 目标项目 ID |
| `API2APIFOX_API_BASE_URL` | 开放 API 地址（私有化部署时替换） |
| `API2APIFOX_ENDPOINT_CONFLICT` | 接口冲突策略 |
| `API2APIFOX_SCHEMA_CONFLICT` | 数据模型冲突策略 |

Windows PowerShell：

```powershell
$env:API2APIFOX_TOKEN = "APS_xxx"
$env:API2APIFOX_PROJECT_ID = "123456"
```

## 范围与筛选

```bash
api2apifox scan --project . --file path/to/UserController.java --format json
api2apifox scan --project . --endpoint "GET /api/users" --format json
api2apifox scan --project . --include "**/src/main/java/**/*.java" --exclude "**/target/**"
```

- `--file` / `--endpoint` 是**解析后过滤**，不会减少扫描量；文件多、想加速请用 `--include` / `--exclude` 收敛扫描范围。
- `--include` / `--exclude` **不是追加，而是整体替换**默认列表。只想额外加一条时要把默认值写全：
  - 默认 include：`**/src/main/java/**/*.java`
  - 默认 exclude：`**/target/**`、`**/build/**`、`**/src/test/**`、`**/sample/**`、`**/.*/**`
- `--endpoint` 的方法大写、路径与 OpenAPI 一致（带 `/` 前缀），可重复；命不中任何接口时退出码 3、`NO_ENDPOINT_MATCHED`。

## 同步语义与安全

- sync 发送的是**当前筛选范围的 OpenAPI 导入包**，由 Apifox 执行首次全量导入；不是逐接口上传。
- 单接口 / 单文件同步只包含对应范围的接口与类型引用，不触碰同项目其他接口。
- 全量同步按 `endpointConflictBehavior` / `schemaConflictBehavior` 处理同名资源，默认覆盖。
- `deleteUnmatchedResources` 固定为 `false`：代码里删掉的接口/模型不会从 Apifox 删除，这是有意设计。
- 非交互环境必须显式 `--yes`；没有 `--yes` 会快速失败（`CONFIRMATION_REQUIRED`），不会挂起等待输入。
- Token 只走环境变量或一次性参数，不写入配置文件、不写入日志。
- `REQUEST_TIMEOUT` 只代表本地停止等待，Apifox 服务端可能仍在导入；**不要立即重试**，先查询目标项目确认结果。首次全量导入可能超过 1 分钟，可用 `--timeout-ms` 调大。

## JSON 信封

`--format json` 时 stdout 只包含一个 JSON 信封：

```json
{
  "schemaVersion": 1,
  "ok": true,
  "command": "scan",
  "version": "0.4.1",
  "durationMs": 1234,
  "result": { "...": "命令特定的字段" },
  "warnings": []
}
```

失败时：

```json
{
  "ok": false,
  "command": "sync",
  "error": { "code": "TOKEN_REQUIRED", "message": "sync 需要 API2APIFOX_TOKEN 环境变量或 --token", "retryable": false },
  "warnings": []
}
```

判断顺序：退出码 → `ok` → `error.code`。`warnings` 非空表示有降级项（如规则文件不可读），通常不改变命令成败，但应转述给用户。

`export --stdout` 是特例：直接输出 OpenAPI 本体，没有信封，不能与 `--format json` 同用。

## 退出码

| 码 | 含义 |
|---|---|
| 0 | 成功 |
| 2 | 参数、配置或确认错误 |
| 3 | 没有 Java 文件或目标接口 |
| 4 | Apifox 鉴权或权限错误 |
| 5 | 网络、超时或服务错误 |
| 6 | 导入完成但包含失败项 |
| 7 | 本地 I/O 或内部错误 |
| 130 | 取消（SIGINT）或用户拒绝确认 |

## 依赖 jar 与解析边界

- 自动发现本地 Maven 仓库（JetBrains `MAVEN_REPOSITORY` → IDEA 索引 → `~/.m2/settings.xml` → `~/.m2/repository`），按需解析 `.class` 字节码还原源码之外的类型。
- `--dependency-repo` / `--dependency-jar` 可补充仓库与显式 jar；`--dependency-max-jars` 控制总数上限（默认 120，0 表示不做依赖解析）。
- 不支持 Kotlin 源码；Gradle 依赖图不解析，请用 `--dependency-jar` 显式指定。
- `.apifox-helper.properties` 规则子集可用；`groovy:` / `js:` 只支持安全的字符串拼接与 `it.ann()` 形态，其余规则告警跳过。

## 故障排查

| 症状 | error.code | 排查 |
|---|---|---|
| 接口数为 0 | `NO_JAVA_FILES` / `NO_ENDPOINTS_FOUND` | 项目根指错，或 include glob 没覆盖源码 |
| 筛选没命中 | `NO_ENDPOINT_MATCHED` | `--endpoint` 路径要与 OpenAPI 展示一致（带 `/`、方法大写） |
| sync 要求确认 | `CONFIRMATION_REQUIRED` | 非交互环境没有 `--yes` |
| 缺 token/项目 ID | `TOKEN_REQUIRED` / `PROJECT_ID_REQUIRED` | 配环境变量或 `--project-id` |
| Apifox 拒绝 | `APIFOX_AUTH_FAILED`（401）/ `APIFOX_FORBIDDEN`（403/404） | token 失效或无项目权限 |
| 覆盖已存在文件 | `OUTPUT_EXISTS` | 用 `--force` 显式覆盖 |
| 同步超时 | `REQUEST_TIMEOUT` | 先查询目标项目，确认后再决定是否重试 |
| 运行时校验失败 | — | 重新安装 Skill；不要改用其它工具顶替 |

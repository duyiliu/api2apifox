---
name: api2apifox
description: 使用 api2apifox 扫描 Java 项目 REST 接口、导出 OpenAPI、同步到 Apifox。当用户要求安装/配置/使用 api2apifox、扫描/盘点接口、生成接口文档或 OpenAPI 文件、把接口同步/推送/导入到 Apifox，或提到 api2apifox、api2apifox-cli、接口文档工具时使用 —— 包括没点名工具的裸说法如"看看这个项目有哪些接口""把接口传到 Apifox"。适用于 Java 后端项目（AI Agent、CI、本地脚本），不依赖 VS Code。
---

# api2apifox

本 Skill 自带完整 CLI 运行时，**安装本 Skill 即完成安装，不需要 `npm install -g`**。源码只在本地解析，只有生成的 OpenAPI 文档数据会发送到 Apifox 开放 API。

## 入口与前提

所有命令都通过 Skill 自带入口运行：

```bash
node "<本 Skill 目录>/scripts/api2apifox.mjs" <command> [options]
```

- 要求 Node.js ≥ 20，先 `node --version` 确认。
- 本 Skill 目录通常是 `~/.agents/skills/api2apifox`（Windows：`%USERPROFILE%\.agents\skills\api2apifox`）。以 Agent 实际加载的 Skill 路径为准，不要假设固定路径。
- 首次使用或怀疑安装不完整时，先运行 `node "<本 Skill 目录>/scripts/check-runtime.mjs"` 校验运行时；校验失败说明 Skill 副本损坏，应重新安装 Skill，不要改用其它工具顶替同步动作。
- 下文用 `<skill-dir>` 表示本 Skill 的实际安装目录；命令示例都写成可执行的完整形式，不要直接照抄 `api2apifox` 这类不存在的全局命令。

## 命令

| 命令 | 作用 | 联网 |
|---|---|---|
| `scan` | 输出接口摘要列表（接口数、接口、目录、源文件） | 否 |
| `export` | 生成 OpenAPI 3.0 JSON 文件（或写到 stdout） | 否 |
| `sync` | 同步到 Apifox；`--dry-run` 只预检 | dry-run 否 |
| `config` | 输出每个配置字段的最终值与来源 | 否 |

## 标准工作流

按"先只读、后写入"推进，每步都加 `--format json` 解析结果：

1. **摸清范围**：`node "<skill-dir>/scripts/api2apifox.mjs" scan --project <dir> --format json`，拿到接口数、接口列表、所属目录和源文件位置。接口数为 0 时先查扫描范围（见"范围与筛选"），不要急着换工具。
2. **核对产物（可选）**：`node "<skill-dir>/scripts/api2apifox.mjs" export --project <dir> --output openapi.gen.json --force --format json`，需要人工核对 OpenAPI 本身时使用。
3. **预检同步**：`node "<skill-dir>/scripts/api2apifox.mjs" sync --project <dir> --project-id <id> --dry-run --format json`（不需要 token，不联网写入；projectId 必须提供，否则报 `PROJECT_ID_REQUIRED`）。确认 `result.scope.endpointCount` 与第 1 步一致——这个数字就是即将写入 Apifox 的接口总数，偏差说明筛选内容不对。
4. **真正同步**：非交互环境（AI Agent、CI、脚本）必须显式 `--yes`，否则会以退出码 2（`CONFIRMATION_REQUIRED`）快速失败而不是等待输入。token 用环境变量 `API2APIFOX_TOKEN` 传入，不要用 `--token` 写进命令行（会进 shell 历史）。无头/CI 环境可加 `--no-report` 关闭浏览器报告页。

```bash
node "<skill-dir>/scripts/api2apifox.mjs" sync --project . --project-id 123456 --yes --format json
```

## 同步影响面（写 Apifox 前必读）

sync 发给 Apifox 的是**当前筛选范围的 OpenAPI 导入包**（Apifox 首次全量导入模式），不是逐接口上传：

- **单接口同步**：`--endpoint "GET /api/users"` 后，导入包只含这一个接口及其类型引用，只影响它自己。
- **单文件同步**：`--file <path>` 后，导入包含该文件里全部接口；同文件的其他无关接口不在包内。
- **全量同步**（不带筛选）：导入包含当前代码的全部接口和数据模型；Apifox 里同名接口按 `endpointConflictBehavior` 处理（默认 `OVERWRITE_EXISTING` 覆盖），同名模型按 `schemaConflictBehavior`。
- **只增改、不删除**：`deleteUnmatchedResources` 固定为 false——代码里已删掉、但 Apifox 还存在的接口/模型**不会**被同步删除。想让"删接口"在 Apifox 生效必须手动去删，这是有意设计，不要当作 bug。

数量对账：写入量就是 dry-run 信封里的 `result.scope.endpointCount`，与 `scan` 看到的预期接口数一致才动手；导入完成后 `result.counters` 里是 Apifox 侧实际 created/updated/failed 计数，退出码 6 表示存在失败项（失败清单在失败信封 `error.details`）。

## 接口目录（多级）

目录由 OpenAPI 的 `x-apifox-folder` 决定，来源是 `@Tag/@Api(tags)` 或 Controller 类名。`/` 是 Apifox 的默认层级分隔符，**不需要任何开关**：

| 写法 | 结果 |
|---|---|
| `@Api(tags = "专案工作站/营养性疾病专案")` | 两级目录（推荐） |
| `rootFolderName: "专案工作站"` + tag `营养性疾病专案` | 两级 |
| 不加注解 | 一级，目录名 = Controller 类名 |

- 推荐把层级直接写进 tag：代码自解释，不依赖配置文件，克隆即生效。
- `folderNameSource` 可选 `tag`（默认，缺省回退类名）或 `controller`。
- 目录值里要用**字面** `/` 时写成 `\/`，字面 `\` 写成 `\\`。
- `updateFolderOfChangedEndpoint` 默认 `true`：覆盖已存在接口时同步更新其目录（对应 `--update-folder` / `--no-update-folder`）。设为 `false` 后，改 tag 只更新接口内容，不迁移目录。
- Apifox 不会删除目录：接口迁走后留下的空目录需要手工清理。
- 想先确认每个接口的实际落点：`export` 后检查 OpenAPI 里的 `x-apifox-folder`，再执行 `sync`。

## 范围与筛选

```bash
node "<skill-dir>/scripts/api2apifox.mjs" scan --project . --file path/to/UserController.java
node "<skill-dir>/scripts/api2apifox.mjs" scan --project . --endpoint "GET /api/users" --format json
node "<skill-dir>/scripts/api2apifox.mjs" scan --project . --include "**/src/main/java/**/*.java" --exclude "**/target/**"
```

- `--file` / `--endpoint` 可重复，为**解析后过滤**，不减少扫描量；要减少扫描量用 `--include` / `--exclude`。
- `--include` / `--exclude` 是**整体替换**默认列表，不是追加。传一条就丢掉全部默认值：
  - 默认 include：`**/src/main/java/**/*.java`
  - 默认 exclude：`**/target/**`、`**/build/**`、`**/src/test/**`、`**/sample/**`、`**/.*/**`
- `--endpoint` 的方法大写、路径与 OpenAPI 一致（带 `/` 前缀），可重复；命不中任何接口时退出码 3、`NO_ENDPOINT_MATCHED`。

## 配置与凭据

配置优先级：**CLI 参数 > `API2APIFOX_*` 环境变量 > `.api2apifox.json` > 内置默认值**。

项目根目录的 `.api2apifox.json` 固化常用口径：

```json
{
  "projectId": 123456,
  "include": ["**/src/main/java/**/*.java"],
  "exclude": ["**/target/**", "**/build/**", "**/src/test/**", "**/.*/**"],
  "endpointConflictBehavior": "OVERWRITE_EXISTING",
  "schemaConflictBehavior": "OVERWRITE_EXISTING",
  "rootFolderName": "",
  "updateFolderOfChangedEndpoint": true
}
```

- Token **不允许**写入配置文件（出现 `token` 字段直接报错 `CONFIG_TOKEN_FORBIDDEN`），只能用环境变量 `API2APIFOX_TOKEN` 或一次性 `--token`。
- 不确定最终生效值时跑 `node "<skill-dir>/scripts/api2apifox.mjs" config --project <dir> --format json`，它输出每个字段的值与来源（`default` / `file:...` / `env:...` / `cli`）。
- 该配置只作用于 CLI/Skill，与 VS Code 扩展的 `apifoxHelper.*` 设置相互独立，两边要分别配置。

## JSON 信封与退出码

`--format json` 时 stdout **只包含一个 JSON 信封**，按 `ok` / `error.code` 分支：

```json
{
  "schemaVersion": 1,
  "ok": true,
  "command": "scan",
  "version": "0.4.2",
  "durationMs": 1234,
  "result": { "...": "命令特定的字段" },
  "warnings": ["FILE_READ_FAILED: Java 文件读取失败:..."]
}
```

失败时 `ok: false`，错误体在 `error`：

```json
{
  "ok": false,
  "command": "sync",
  "error": { "code": "TOKEN_REQUIRED", "message": "sync 需要 API2APIFOX_TOKEN 环境变量或 --token", "retryable": false },
  "warnings": []
}
```

判断顺序：先看退出码，再看 `ok`，再看 `error.code` 定位。`warnings` 非空说明有降级项（如规则文件不可读），通常不改变命令成败但值得转述给用户。

**`export --stdout` 是特例**：直接输出 OpenAPI JSON 本体，没有信封，且不能与 `--format json` 同用（会报 `INVALID_ARGUMENT`）。

| 码 | 含义 | 处置 |
|---|---|---|
| 0 | 成功 | — |
| 2 | 参数/配置/确认错误 | 修参数或配置后重跑 |
| 3 | 没有 Java 文件或没有匹配接口 | 检查 include/exclude 与 --file/--endpoint |
| 4 | Apifox 鉴权/权限（`APIFOX_AUTH_FAILED`、`APIFOX_FORBIDDEN`） | 检查 token 与项目权限 |
| 5 | 网络/超时（`NETWORK_FAILED`、`REQUEST_TIMEOUT`） | 见下方超时规则 |
| 6 | 导入完成但有失败项（`IMPORT_PARTIAL_FAILURE`） | 读 `error.details` 里的失败清单 |
| 7 | 本地 I/O 或内部错误 | 收集 stderr 排查 |
| 130 | 取消（SIGINT）或用户拒绝确认 | 如预期取消则正常 |

## 依赖 jar 与解析边界

- 自动发现本地 Maven 仓库（JetBrains `MAVEN_REPOSITORY` → IDEA 索引 → `~/.m2/settings.xml` → `~/.m2/repository`），按需解析 `.class` 字节码，还原源码之外的类型。
- 可补充 `--dependency-repo <dir>` / `--dependency-jar <path>`；`--dependency-max-jars <n>` 控制依赖 jar 总数上限（默认 120，0 表示不做依赖解析）。
- 不支持 Kotlin 源码；Gradle 依赖图不解析，用 `--dependency-jar` 显式指定。

## 故障排查

| 症状 | error.code | 排查 |
|---|---|---|
| 接口数为 0 | `NO_JAVA_FILES` / `NO_ENDPOINTS_FOUND` | 项目根指错了，或 include glob 没覆盖源码路径 |
| 筛选没命中 | `NO_ENDPOINT_MATCHED` | `--endpoint` 路径要与 OpenAPI 展示一致（带 `/` 前缀、方法大写） |
| sync 要求确认 | `CONFIRMATION_REQUIRED` | 非交互环境没有 `--yes` |
| 缺 token/项目 ID | `TOKEN_REQUIRED` / `PROJECT_ID_REQUIRED` | 配环境变量或 `--project-id` |
| Apifox 拒绝 | `APIFOX_AUTH_FAILED`（401）/ `APIFOX_FORBIDDEN`（403/404） | token 失效或无该项目权限 |
| 覆盖已存在文件 | `OUTPUT_EXISTS` | 导出目标存在，用 `--force` 显式覆盖 |
| 同步超时 | `REQUEST_TIMEOUT` | **不要立即重试**：先查询目标 Apifox 项目确认结果，再决定是否重试；首次导入可用 `--timeout-ms` 调大（默认 300000） |

扫描慢时优先用 `--include` 收敛；遇到 jar 依赖里的枚举/注解读不全，用 `--dependency-repo` 或 `--dependency-jar` 补充类路径。

## 参考

- 完整参数、配置字段与更多示例见 [references/cli.md](references/cli.md)。
- 运行时校验：`node "<本 Skill 目录>/scripts/check-runtime.mjs"`。

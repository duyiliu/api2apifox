# api2apifox CLI（内部构建源）

本目录是 `api2apifox` Agent Skill 的 CLI 运行时构建源，**不单独发布到 npm**。不依赖 VS Code，直接扫描 Java 项目、生成 OpenAPI 3.0，并同步到 Apifox。适合 AI Agent、CI 和本地脚本。

要求 Node.js `>=20`。

## 安装

用户侧通过 Skill 安装（Skill 自带 CLI 运行时）：

```bash
npx skills add duyiliu/api2apifox --skill api2apifox -g
```

之后用 `node "<skill-dir>/scripts/api2apifox.mjs" <command>` 调用。本 README 保留为 CLI 参数与行为参考；开发、测试与发版见仓库根 README。

## 常用命令

下文的 `api2apifox` 指 Skill 入口：

```bash
api2apifox scan --project . --format json
api2apifox export --project . --output openapi.gen.json --force
api2apifox sync --project . --project-id 123456 --dry-run --format json
API2APIFOX_TOKEN=APS_xxx api2apifox sync --project . --project-id 123456 --yes --format json
api2apifox config --project . --format json
```

`sync` 真正写入 Apifox 时必须在交互终端确认，或显式传入 `--yes`。非交互环境不会等待输入。

首次导入需要创建目录、接口和数据模型，可能持续较长时间；请求等待上限默认 300000 毫秒，可用 `--timeout-ms` 覆盖：

```bash
api2apifox sync --project . --project-id 123456 --yes --timeout-ms 600000 --format json
```

如果同步返回 `REQUEST_TIMEOUT`，说明本地已停止等待，但 Apifox 服务端可能仍在继续导入。请先查询目标项目确认结果，不要立即重复同步。

## 同步结果报告页

`sync` 真正写入 Apifox 后（含部分失败），会自动生成一份自包含 HTML 报告并用系统默认浏览器打开，与 VS Code 扩展的同步结果面板同源：汇总计数（新增/更新/忽略/失败）、错误与警告、可排序可过滤的接口清单，支持一键复制 TSV / Markdown。

- 报告文件写入系统临时目录 `api2apifox-sync-report-<projectId>.html`，重复同步原地覆盖；路径也会出现在 text 输出与 JSON 信封的 `result.reportPath`（部分失败时在 `error.details.reportPath`）
- `--no-report` 可关闭弹出；无头/受限环境自动打开失败时仅在 stderr 提示路径，不影响退出码
- `--dry-run` 预检不生成报告

## 范围与筛选

```bash
api2apifox scan --file cah-childhealth/cah-childhealth-server/src/main/java/com/yzkj/cah/childhealth/server/modules/system/controller/SystemPingController.java
api2apifox scan --endpoint "GET /api/users" --format json
api2apifox scan --include "**/cli-smoke/**/*.java" --exclude "**/target/**"
```

- `--file <path>`：只保留该源文件里的接口，相对项目根或绝对路径均可，可重复
- `--endpoint "METHOD PATH"`：只保留该接口（方法大写，路径与 OpenAPI 一致），可重复
- `--include <glob>` / `--exclude <glob>`：扫描阶段的包含/排除 glob，可重复
- `--dependency-repo <dir>` / `--dependency-jar <path>`：补充本地 Maven 仓库目录或显式依赖 jar，可重复

两点容易踩坑：

1. `--include` / `--exclude` **不是追加，而是整体替换**默认列表。只想额外加一条时要把默认值写全：默认 include 为 `**/src/main/java/**/*.java`，默认 exclude 为 `**/target/**`、`**/build/**`、`**/src/test/**`、`**/sample/**`、`**/.*/**`。
2. `--file` / `--endpoint` 是**解析后过滤**，不会减少扫描量；文件多、想加快速度请用 `--include` / `--exclude` 收敛扫描范围。

## 配置文件

项目根目录可创建 `.api2apifox.json`：

```json
{
  "$schema": "https://raw.githubusercontent.com/duyiliu/api2apifox/main/packages/cli/schema/config.schema.json",
  "projectId": 123456,
  "apiBaseUrl": "https://api.apifox.com",
  "include": ["**/src/main/java/**/*.java"],
  "exclude": ["**/target/**", "**/build/**", "**/src/test/**", "**/.*/**"],
  "endpointConflictBehavior": "OVERWRITE_EXISTING",
  "schemaConflictBehavior": "OVERWRITE_EXISTING",
  "pageTypeStyle": "mybatis-plus",
  "folderNameSource": "tag",
  "rootFolderName": "",
  "updateFolderOfChangedEndpoint": true,
  "helperProperties": {
    "enabled": true,
    "enumFieldDoc": false
  }
}
```

> `rootFolderName` 与 tag 值都可以含 `/`，导入后按多级目录创建（如 `专案工作站/营养性疾病专案`）。
> `updateFolderOfChangedEndpoint` 默认 `true`：覆盖已存在接口时同步更新其目录；设为 `false` 则只更新接口内容、不迁移目录。

> `$schema` 只用于编辑器补全与校验，可删掉这一行，不影响 CLI 运行。

Token 不允许写入配置文件。推荐使用环境变量：

```bash
export API2APIFOX_TOKEN=APS_xxx
export API2APIFOX_PROJECT_ID=123456
```

Windows PowerShell：

```powershell
$env:API2APIFOX_TOKEN = "APS_xxx"
$env:API2APIFOX_PROJECT_ID = "123456"
```

如需把雪花 ID 字段按 `string` 文档化（对齐"大整型序列化为字符串"的框架契约，避免前端按 `integer` 处理丢精度），在 `.apifox-helper.properties` 写显式 `field.type` 规则，例如：

```properties
field.type=groovy: ((it.name() == "id" || it.name().endsWith("Id")) && (it.type()?.name()?.endsWith("Long") || it.type()?.name() == "long" || it.type()?.name()?.endsWith("BigInteger"))) ? "string" : null
```

配置优先级：CLI 参数 > 环境变量 > `.api2apifox.json` > 默认值。

本配置只作用于 CLI：它与 VS Code 扩展「api2apifox」的 `apifoxHelper.*` 设置（以及扩展 SecretStorage 中的令牌）**相互独立**，两边需分别配置，改一边不会影响另一边。反过来，扩展也不会读取本文件。

`timeoutMs` 可在配置文件中设置，用于慢速网络或大型项目：

```json
{
  "projectId": 123456,
  "timeoutMs": 600000
}
```

## AI 调用约定

使用 `--format json` 时，stdout 只包含一个 JSON 信封；根据 `ok`、`error.code` 和进程退出码进行分支。`export --stdout` 会直接输出 OpenAPI 本体，因此不能与 `--format json` 一起使用。

`--quiet` 在 text 模式下隐藏非致命警告，但保留主要结果；JSON 模式仍在信封的 `warnings` 中返回完整警告。

稳定退出码：

- `0`：成功
- `2`：参数、配置或确认错误
- `3`：没有 Java 文件或目标接口
- `4`：Apifox 鉴权或权限错误
- `5`：网络、超时或服务错误
- `6`：导入完成但包含失败项
- `7`：本地 I/O 或内部错误
- `130`：取消

# @duyiliu/api2apifox

不依赖 VS Code，直接扫描 Java 项目、生成 OpenAPI 3.0，并同步到 Apifox。适合 AI Agent、CI 和本地脚本。

要求 Node.js `>=20`。

## 安装

```bash
npm install -g @duyiliu/api2apifox
```

也可以直接运行：

```bash
npx @duyiliu/api2apifox scan --project . --format json
```

## 常用命令

```bash
api2apifox scan --project . --format json
api2apifox export --project . --output openapi.gen.json --force
api2apifox sync --project . --dry-run --format json
api2apifox sync --project . --project-id 123456 --changed-only --yes --format json
API2APIFOX_TOKEN=APS_xxx api2apifox sync --project . --project-id 123456 --yes --format json
api2apifox config --project . --format json
```

`sync` 真正写入 Apifox 时必须在交互终端确认，或显式传入 `--yes`。非交互环境不会等待输入。

## 增量同步与差异预览

成功同步后，CLI 会在项目根写入 `.api2apifox-sync-baseline.json`（默认已加入仓库 `.gitignore`），以 `projectId + method + path` 记录上次成功同步的 operation 摘要。基线按同步 scope 隔离：`--file` / `--endpoint` 指定的不同来源不会互相覆盖；切换项目或接口改名会自然形成新的基线键。

```bash
# 输出新增 / 变更 / 未变化 / 源码已删除四类清单，不写入 Apifox
api2apifox sync --project . --project-id 123456 --dry-run --format json

# 只上传相对上次成功同步新增/变更的接口
API2APIFOX_TOKEN=APS_xxx api2apifox sync --project . --project-id 123456 --changed-only --yes

# 显式清理 Apifox 中源码已删除的接口（仅全量工作区同步生效；默认只告警）
API2APIFOX_TOKEN=APS_xxx api2apifox sync --project . --project-id 123456 --prune-unmatched --yes
```

JSON 模式下 `result.diff` 包含 `added` / `changed` / `unchanged` / `deleted` 四个数组及 `counts`；text 模式会逐项列出。导入存在失败项时不会更新基线；源码已删除的接口默认保留在基线中持续告警，只有显式 `--prune-unmatched` 才会从基线移除并让 Apifox 清理。局部同步（`--file` / `--endpoint`）即使传入 `--prune-unmatched` 也会被忽略，避免误删其他来源接口。

首次导入需要创建目录、接口和数据模型，可能持续较长时间；请求等待上限默认 300000 毫秒，可用 `--timeout-ms` 覆盖：

```bash
api2apifox sync --project . --project-id 123456 --yes --timeout-ms 600000 --format json
```

如果同步返回 `REQUEST_TIMEOUT`，说明本地已停止等待，但 Apifox 服务端可能仍在继续导入。请先查询目标项目确认结果，不要立即重复同步。

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
  "$schema": "./node_modules/@duyiliu/api2apifox/schema/config.schema.json",
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
  }
}
```

> `$schema` 只用于编辑器补全与校验，按实际安装位置填写。项目内安装（`npm i -D @duyiliu/api2apifox`）时上面的路径有效；全局安装（`npm i -g`）或 `npx` 调用时项目里没有该文件，可删掉这一行，不影响 CLI 运行。

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

配置优先级：CLI 参数 > 环境变量 > `.api2apifox.json` > 默认值。

本配置只作用于 CLI：它与 VS Code 扩展「ApiGen for Apifox」的 `apifoxHelper.*` 设置（以及扩展 SecretStorage 中的令牌）**相互独立**，两边需分别配置，改一边不会影响另一边。反过来，扩展也不会读取本文件。

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

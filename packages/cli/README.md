# @duyiliu/api2apifox

不依赖 VS Code，直接扫描 Java 项目、生成 OpenAPI 3.0，并同步到 Apifox。适合 AI Agent、CI 和本地脚本。

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
API2APIFOX_TOKEN=APS_xxx api2apifox sync --project . --project-id 123456 --yes --format json
api2apifox config --project . --format json
```

`sync` 真正写入 Apifox 时必须在交互终端确认，或显式传入 `--yes`。非交互环境不会等待输入。

首次导入需要创建目录、接口和数据模型，可能持续较长时间；请求等待上限默认 300000 毫秒，可用 `--timeout-ms` 覆盖：

```bash
api2apifox sync --project . --project-id 123456 --yes --timeout-ms 600000 --format json
```

如果同步返回 `REQUEST_TIMEOUT`，说明本地已停止等待，但 Apifox 服务端可能仍在继续导入。请先查询目标项目确认结果，不要立即重复同步。

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

`timeoutMs` 可在配置文件中设置，用于慢速网络或大型项目：

```json
{
  "projectId": 123456,
  "timeoutMs": 600000
}
```

## AI 调用约定

使用 `--format json` 时，stdout 只包含一个 JSON 信封；根据 `ok`、`error.code` 和进程退出码进行分支。`export --stdout` 会直接输出 OpenAPI 本体，因此不能与 `--format json` 一起使用。

稳定退出码：

- `0`：成功
- `2`：参数、配置或确认错误
- `3`：没有 Java 文件或目标接口
- `4`：Apifox 鉴权或权限错误
- `5`：网络、超时或服务错误
- `6`：导入完成但包含失败项
- `7`：本地 I/O 或内部错误
- `130`：取消

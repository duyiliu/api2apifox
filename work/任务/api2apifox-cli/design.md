# api2apifox 独立 CLI 设计

> 状态：进行中（CLI MVP 已实现并通过本地验证，待 VS Code 适配迁移与发布）
> 创建日期：2026-09-20
> 关联：VS Code 扩展 `duyiliu.api2apifox`，npm 包 `@duyiliu/api2apifox`
> 补充资料：[HTML 阅读版](./api2apifox-cli-design.html)

> 说明：本文件是独立 CLI 任务的主档案和后续跨会话入口。CLI 的实现、验收和发布进展应持续回填本文件，避免另起一套失步方案。

## 背景

### 需求背景

当前项目只能通过 VS Code/Cursor 扩展执行 Java 源码扫描、OpenAPI 生成和 Apifox 同步。用户希望提供不依赖编辑器的 CLI，主要供 AI Agent 调用，同时支持本地脚本和 CI。

CLI 的正式命名已经确定：

- npm 包：`@duyiliu/api2apifox`
- 可执行命令：`api2apifox`
- 项目配置文件：`.api2apifox.json`
- 环境变量前缀：`API2APIFOX_`
- VS Code 展示名继续使用 `ApiGen for Apifox`
- 现有 VS Code 配置 `apifoxHelper.*` 保持兼容，不做破坏性重命名

### 现状与问题

现有解析核心已经较完整，且大部分不依赖 VS Code：

- Java CST 与类型索引：`src/java/*`
- Controller/Feign/JAX-RS/Actuator 解析：`src/java/controllerParser.ts`
- Schema 解析：`src/java/schemaResolver.ts`
- OpenAPI 构建：`src/openapi/builder.ts`
- 纯分析流水线：`src/pipeline.ts`
- Apifox HTTP 客户端：`src/apifox/client.ts`

真正阻碍 CLI 复用的是编排逻辑集中在 `src/extension.ts`，直接依赖：

- `vscode.workspace.findFiles`
- `vscode.workspace.getConfiguration`
- `vscode.SecretStorage`
- `vscode.window.withProgress`
- VS Code 的通知、确认框和工作区模型

如果直接在 CLI 再实现一遍扫描、配置和同步逻辑，会形成两套行为，后续必然产生差异。

### 目标

1. 在没有 VS Code 的 Node.js 环境中完成扫描、OpenAPI 导出和 Apifox 同步。
2. VS Code 扩展与 CLI 共用同一套核心扫描、分析和同步服务。
3. 为 AI Agent 提供稳定、可解析、无交互依赖的 JSON 协议和退出码。
4. 默认保护远端数据和凭据，实际写入必须显式确认。
5. CLI 独立发布为 `@duyiliu/api2apifox`，不把 VS Code 扩展清单直接当 npm CLI 包发布。
6. Windows、macOS、Linux 使用同一套命令和配置语义。

### 非目标

- 首版不支持 Kotlin 源码。
- 首版不实现 Gradle 依赖图解析，继续通过 `dependencyJars` 兜底。
- 首版不提供 TUI、Web 页面或长期驻留服务。
- 首版不实现 Apifox 资源删除，`deleteUnmatchedResources` 固定为 `false`。
- 首版不迁移或重命名现有 VS Code 配置键。
- 首版不在项目配置文件中保存 Token。

## 范围

### 本次设计覆盖

- 共享核心的模块拆分
- CLI 命令与参数契约
- 配置与优先级
- JSON 输出、stderr 和退出码
- 同步安全控制
- 构建和 npm 发布结构
- VS Code 兼容策略
- 测试和验收方案
- 分阶段实施顺序

### 本次设计不覆盖

- 具体代码实现
- npm 发布凭据配置
- npm 组织 `@duyiliu` 的实际创建或权限授权
- Marketplace 扩展改名
- Kotlin/Gradle 新能力

## 当前阶段

- 当前阶段：CLI MVP 已实现并通过本地与真实项目验证，进入发布
- 最近进展：完成共享配置/扫描/分析/同步服务、`scan/export/sync/config` 四个命令、JSON 协议、退出码、安全确认、取消信号、npm workspace、README、Schema、`release-cli.yml` 与测试；实测同步 25 个接口到 Apifox 测试项目
- 下一步：修复 `--timeout-ms` 相关文档与发布收尾，随后让 VS Code 扩展改用共享 `ProjectAnalyzer` / `SyncService`
- 阻塞项：仓库 `NPM_TOKEN` secret 与本机 GitHub CLI 凭据需配置，否则只能本地手工发布

## 上下文交接

- 新会话继续前必须阅读：本文件、`src/extension.ts`、`src/pipeline.ts`、`src/apifox/client.ts`、`src/java/jarIndex.ts`
- 关键约束：核心层不得 import `vscode`；stdout JSON 模式不得混入日志；Token 不进入配置文件和日志
- 不要回退或覆盖：现有 VS Code 命令、配置键、SecretStorage 行为和 OpenAPI 解析能力
- 与当前代码不一致时，以当前代码、运行结果和验证记录为准，并回填本文件

## 设计

### D1：采用同仓库双产品、独立 npm 包

推荐结构为 npm workspaces：

```text
apifox-helper-vscode/
├── package.json                    # 仓库根与 VS Code 扩展清单，private: true
├── packages/
│   ├── core/
│   │   ├── package.json            # @duyiliu/api2apifox-core，private: true
│   │   └── src/                    # 共享扫描、分析、同步服务
│   └── cli/
│       ├── package.json            # @duyiliu/api2apifox，公开发布
│       └── src/
│           └── main.ts
├── src/                            # VS Code 适配层与现有核心，迁移期逐步收敛
└── esbuild.js
```

第一阶段不强制一次性搬迁所有 `src/java` 文件。可先建立 `src/core/` 共享服务，再在结构稳定后迁入 `packages/core`。最终目标是：

- 根包仅用于 Marketplace 扩展，设置 `private: true`，避免误发 npm。
- CLI 包独立包含 `name: "@duyiliu/api2apifox"`。
- CLI 的 `bin.api2apifox` 指向带 shebang 的 `dist/cli.js`。
- 核心包暂设 `private: true`，只作为 workspace 内部依赖，不扩大公共 API 承诺。

不选择“根 `package.json` 同时发布 VSIX 和 npm CLI”的原因：VS Code `engines.vscode`、`contributes`、图标和扩展入口会污染 npm 包，发布职责与版本节奏也无法独立控制。

### D2：共享核心分层

```text
┌──────────────────────────────────────────────┐
│                 展示与适配层                 │
│ VS Code Extension             CLI            │
│ 命令/Webview/SecretStorage    argv/stdout     │
└──────────────────────┬───────────────────────┘
                       │ 调用统一服务
┌──────────────────────▼───────────────────────┐
│                Application Core              │
│ ProjectScanner · ConfigResolver · Analyzer   │
│ SyncService · Result Model · Diagnostics     │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│                 Domain Core                  │
│ Java Parser · Type Index · Rules · OpenAPI   │
│ Jar/Class Parser · Apifox HTTP Client        │
└──────────────────────────────────────────────┘
```

#### Domain Core

保留现有纯逻辑，不 import `vscode`：

- `java/*`
- `openapi/*`
- `pipeline.ts`
- `apifox/client.ts`
- `config/helperProperties.ts`

#### Application Core

新增以下服务：

```ts
interface ProjectOptions {
  projectRoot: string;
  include: string[];
  exclude: string[];
  dependencyRepos: string[];
  dependencyJars: string[];
  helperPropertiesEnabled: boolean;
  pageTypeStyle: "mybatis-plus" | "spring-data";
  folderNameSource: "tag" | "controller";
  rootFolderName: string;
  enumFieldDoc: boolean;
}

interface AnalyzeProjectRequest {
  options: ProjectOptions;
  files?: string[];
  endpointSelectors?: string[];
}

interface AnalyzeProjectResult extends AnalyzeOutput {
  projectRoot: string;
  scannedFiles: number;
  skippedFiles: number;
  diagnostics: Diagnostic[];
}
```

核心服务：

- `ProjectScanner`：文件 glob、隐藏目录和嵌套 Git 检出过滤、读取源码。
- `MavenDependencyResolver`：发现仓库、读取 `pom.xml`、构造 `JarClassIndex`。
- `RuleLoader`：加载 `.apifox-helper.properties` 和 `properties.additional`。
- `ProjectAnalyzer`：组合扫描、依赖、规则和 `analyze/analyzeSubset`。
- `SyncService`：构造导入参数并调用 `ApifoxClient`，不依赖 VS Code 进度 UI。
- `Diagnostic`：统一 warning/error/code/file/line 数据模型。

VS Code 的 `extension.ts` 改为服务调用方，保留进度、确认、通知和面板展示。

### D3：CLI 命令模型

首版提供四个命令：

```text
api2apifox scan       扫描并输出接口摘要，不生成文件、不访问 Apifox
api2apifox export     生成 OpenAPI JSON 文件，不访问 Apifox
api2apifox sync       生成 OpenAPI 并导入 Apifox
api2apifox config     解析并输出最终配置，便于 AI 排错
```

另提供：

```text
api2apifox --version
api2apifox --help
api2apifox <command> --help
```

#### `scan`

```bash
api2apifox scan --project .
api2apifox scan --project . --format json
api2apifox scan --file src/main/java/com/example/UserController.java
api2apifox scan --endpoint "GET /api/users/{id}"
```

行为：

- 读取全量源码作为类型上下文。
- `--file` 只筛选输出该文件接口，不牺牲跨文件 DTO。
- `--endpoint` 按标准化后的 `METHOD PATH` 精确匹配，可重复传入。
- 找不到匹配项返回成功还是失败：首版定义为退出码 `3`，JSON 中 `NO_ENDPOINT_MATCHED`。

#### `export`

```bash
api2apifox export --project . --output openapi.gen.json
api2apifox export --project . --stdout --format json
```

约束：

- 默认输出为 `<project>/openapi.gen.json`。
- `--stdout` 输出 OpenAPI 本体时，不允许与 `--format json` 混用，避免两个 JSON 根对象竞争 stdout。
- 覆盖已有文件需显式 `--force`；交互终端可询问，非交互环境直接失败。

#### `sync`

```bash
api2apifox sync --project . --dry-run --format json
api2apifox sync --project . --yes --format json
api2apifox sync --file src/main/java/com/example/UserController.java --yes
api2apifox sync --endpoint "POST /api/users" --yes
```

行为：

1. 解析配置和凭据。
2. 扫描并分析。
3. 输出预检信息：目标项目、范围、接口数、冲突策略、warning 数。
4. `--dry-run` 到此结束，不调用 Apifox。
5. 真正同步必须满足以下任一条件：
   - 交互终端中用户明确确认；
   - 显式传入 `--yes`；
   - 配置文件不得永久设置 `yes: true`，避免仓库配置绕过保护。
6. 同步完成后输出计数、错误和 warning。

#### `config`

```bash
api2apifox config --project . --format json
```

输出最终生效配置及每个字段来源，但敏感值仅输出是否存在：

```json
{
  "token": { "configured": true, "source": "env:API2APIFOX_TOKEN" },
  "projectId": { "value": 123456, "source": "file:.api2apifox.json" }
}
```

### D4：参数与配置优先级

优先级从高到低：

1. CLI 参数
2. 环境变量
3. 项目配置 `<project>/.api2apifox.json`
4. 内置默认值

首版不读取 VS Code `settings.json`，原因是 CLI 应独立且行为可预测。可在后续提供显式迁移命令，而不是静默读取编辑器配置。

#### 配置文件示例

```json
{
  "$schema": "https://unpkg.com/@duyiliu/api2apifox/schema/config.schema.json",
  "projectId": 123456,
  "apiBaseUrl": "https://api.apifox.com",
  "include": ["**/src/main/java/**/*.java"],
  "exclude": [
    "**/target/**",
    "**/build/**",
    "**/src/test/**",
    "**/sample/**",
    "**/.*/**"
  ],
  "endpointConflictBehavior": "OVERWRITE_EXISTING",
  "schemaConflictBehavior": "OVERWRITE_EXISTING",
  "pageTypeStyle": "mybatis-plus",
  "folderNameSource": "tag",
  "rootFolderName": "",
  "schemaFolderId": 0,
  "helperProperties": {
    "enabled": true,
    "enumFieldDoc": false
  },
  "dependencyRepos": [],
  "dependencyJars": []
}
```

配置文件不接受 `token` 字段；即使出现也应报错，防止用户误提交凭据。

#### 环境变量

| 环境变量 | 含义 |
|---|---|
| `API2APIFOX_TOKEN` | Apifox Access Token |
| `API2APIFOX_PROJECT_ID` | 目标项目 ID |
| `API2APIFOX_API_BASE_URL` | API 地址，默认 `https://api.apifox.com` |
| `API2APIFOX_ENDPOINT_CONFLICT` | 接口冲突策略 |
| `API2APIFOX_SCHEMA_CONFLICT` | Schema 冲突策略 |
| `API2APIFOX_CONFIG` | 显式配置文件路径 |

数组类配置只通过文件或 CLI 重复参数传递，避免设计复杂的环境变量转义规则。

### D5：面向 AI 的输出协议

#### stdout / stderr 约定

- `--format text`：面向人类，进度和结果均可读。
- `--format json`：stdout 只输出一个最终 JSON 对象，禁止进度条、颜色和普通日志。
- JSON 模式下诊断日志写 stderr；默认 `--quiet` 时 stderr 只保留致命错误。
- `NO_COLOR` 或非 TTY 环境自动关闭 ANSI 颜色。
- 所有 JSON 字段使用稳定英文 key，message 可使用中文。

#### 公共 JSON 信封

成功：

```json
{
  "schemaVersion": 1,
  "ok": true,
  "command": "sync",
  "version": "0.1.0",
  "durationMs": 482,
  "result": {},
  "warnings": []
}
```

失败：

```json
{
  "schemaVersion": 1,
  "ok": false,
  "command": "sync",
  "version": "0.1.0",
  "durationMs": 91,
  "error": {
    "code": "APIFOX_AUTH_FAILED",
    "message": "访问令牌无效或已过期",
    "status": 401,
    "retryable": false
  },
  "warnings": []
}
```

`schemaVersion` 用于未来演进；新增可选字段不升版本，删除/改义/改类型才升版本。

#### `scan` result

```json
{
  "projectRoot": "/repo",
  "scannedFiles": 128,
  "endpointCount": 42,
  "schemaCount": 19,
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/users/{id}",
      "summary": "查询用户",
      "folder": "用户管理",
      "controller": "UserController",
      "file": "src/main/java/com/example/UserController.java",
      "line": 42
    }
  ]
}
```

#### `sync` result

```json
{
  "dryRun": false,
  "target": {
    "projectId": 123456,
    "apiBaseUrl": "https://api.apifox.com"
  },
  "scope": {
    "type": "workspace",
    "endpointCount": 42
  },
  "counters": {
    "endpointCreated": 2,
    "endpointUpdated": 40,
    "endpointIgnored": 0,
    "endpointFailed": 0,
    "schemaCreated": 3,
    "schemaUpdated": 16,
    "schemaIgnored": 0,
    "schemaFailed": 0
  },
  "errors": []
}
```

不虚构 Apifox 未返回的逐接口同步状态；CLI 与现有结果面板保持相同事实边界。

### D6：退出码

| 退出码 | 稳定含义 | 示例错误码 |
|---:|---|---|
| `0` | 成功；同步结果无失败项 | `OK` |
| `2` | 参数或配置错误 | `INVALID_ARGUMENT`、`CONFIG_INVALID` |
| `3` | 扫描或解析未得到目标接口 | `NO_JAVA_FILES`、`NO_ENDPOINT_MATCHED` |
| `4` | 鉴权或权限失败 | `APIFOX_AUTH_FAILED`、`APIFOX_FORBIDDEN` |
| `5` | 网络、超时或服务不可达 | `NETWORK_FAILED`、`REQUEST_TIMEOUT` |
| `6` | Apifox 导入完成但存在失败项 | `IMPORT_PARTIAL_FAILURE` |
| `7` | 本地 I/O 或内部执行失败 | `FILE_READ_FAILED`、`INTERNAL_ERROR` |
| `130` | SIGINT / 用户取消 | `CANCELLED` |

AI 应优先读取 JSON `error.code`，退出码用于外层流程快速分支。

### D7：同步安全

1. `scan`、`config` 和 `export` 默认只读。
2. `sync --dry-run` 不访问写接口，可用于 AI 预检。
3. 实际同步需要交互确认或 `--yes`。
4. 非 TTY 环境未传 `--yes` 时返回 `CONFIRMATION_REQUIRED`，不得挂起等待输入。
5. Token 不写入 `.api2apifox.json`、stdout、错误栈或调试日志。
6. 日志中的 Authorization 头必须整体屏蔽。
7. `apiBaseUrl` 只允许 `http:` 或 `https:`。
8. 默认 `deleteUnmatchedResources=false`，首版不提供对应开关。
9. 同步前输出明确目标项目 ID；如果未来支持项目名称解析，最终仍必须显示 ID。
10. `--token` 可以作为兼容参数，但帮助文档标记“不推荐，可能进入 shell history”；推荐环境变量。

### D8：依赖与参数解析

首版优先使用 Node.js 内置能力，减少依赖：

- Node.js 版本：`>=20`
- 参数解析：`node:util.parseArgs`
- 文件匹配：选择轻量 glob 包，如 `fast-glob`
- 交互确认：`node:readline/promises`
- HTTP：Node 20 原生 `fetch`
- JSON Schema 校验：首版可以手写严格校验；配置扩展后再考虑 Ajv

CLI 不依赖 `vscode` 包。核心包的任何生产代码 import `vscode` 均视为架构回归，增加测试或 lint 规则阻止。

### D9：信号与取消

CLI 创建顶层 `AbortController`：

- `SIGINT`、`SIGTERM` 触发 abort。
- 文件扫描循环、文件读取、分析阶段之间检查 signal。
- `ApifoxClient` 支持将外部 signal 与 timeout signal 合并。
- 取消时不输出 Node 堆栈，返回退出码 `130` 和 JSON `CANCELLED`。
- OpenAPI 文件使用临时文件写入后原子 rename，避免取消后留下半文件。

### D10：版本与发布

VS Code 扩展与 CLI 使用独立版本：

- Marketplace 扩展继续使用根包版本，如 `0.2.x`。
- CLI 首发使用 `@duyiliu/api2apifox@0.1.0`。
- 核心包内部版本与 CLI 同步，暂不公开发布。
- CLI 的 `--version` 返回 CLI 包版本，不返回 VS Code 扩展版本。

建议新增独立工作流 `.github/workflows/release-cli.yml`：

```text
触发：cli-v* tag 或 workflow_dispatch
校验：tag 与 packages/cli/package.json 版本一致
步骤：npm ci → typecheck → test → build:cli → npm pack --dry-run → npm publish --access public
```

发布标签示例：

```text
cli-v0.1.0
```

Marketplace 工作流仍由 `v*` 标签触发，两条发布链互不影响。

CLI 发布包只包含：

```text
dist/cli.js
README.md
LICENSE
schema/config.schema.json
package.json
```

### D11：VS Code 兼容与迁移

抽取核心期间保持以下兼容性：

- 命令 ID 不变。
- `apifoxHelper.*` 配置键不变。
- Token 继续存在 VS Code SecretStorage。
- 同步结果和预检语义不变。
- 默认扫描 include/exclude 不变。
- `.apifox-helper.properties` 行为不变。
- OpenAPI 文档结构不变。

为了防止两端行为漂移，VS Code 与 CLI 应通过同一组 contract tests，给定相同 fixture 和配置，输出 OpenAPI JSON 深度相等。

## 实现位置

建议最终文件布局：

```text
packages/core/src/
├── config.ts
├── diagnostics.ts
├── projectScanner.ts
├── mavenDependencyResolver.ts
├── ruleLoader.ts
├── projectAnalyzer.ts
├── syncService.ts
├── java/...
├── openapi/...
└── apifox/client.ts

packages/cli/src/
├── main.ts
├── commands/
│   ├── scan.ts
│   ├── export.ts
│   ├── sync.ts
│   └── config.ts
├── args.ts
├── output.ts
├── errors.ts
└── confirm.ts

src/vscode/
├── extension.ts
├── configAdapter.ts
├── secretAdapter.ts
├── workspaceAdapter.ts
└── progressAdapter.ts
```

迁移期间可以先保留 `src/java` 等原路径，通过 workspace alias 或相对引用复用，避免一次性大搬迁。

## 实施清单

### 阶段 1：抽取共享应用核心

- [x] 1.1 定义 `ResolvedConfig`、`Diagnostic`、`ProjectAnalysisResult` 和 `SyncResult`
- [x] 1.2 抽取文件扫描与隐藏目录/嵌套 Git 过滤
- [x] 1.3 抽取 Maven 依赖发现与 jar 索引构建
- [x] 1.4 抽取 `.apifox-helper.properties` 加载
- [x] 1.5 抽取 `ProjectAnalyzer` 和 `SyncService`
- [ ] 1.6 让 VS Code 扩展改用共享服务，确保现有行为不变

### 阶段 2：CLI MVP

- [x] 2.1 建立 npm workspace 和 `packages/cli`
- [x] 2.2 实现 `scan`、`export`、`sync`、`config`
- [x] 2.3 实现配置优先级和严格校验
- [x] 2.4 实现 text/json 输出与退出码
- [x] 2.5 实现 `--dry-run`、`--yes` 和非 TTY 保护
- [x] 2.6 实现 SIGINT/SIGTERM 取消
- [x] 2.7 增加 CLI README 和 shell 使用示例

### 阶段 3：测试和发布

- [x] 3.1 为 argv、配置和输出协议增加单元测试
- [x] 3.2 为四个命令增加子进程集成测试
- [x] 3.3 增加 VS Code/CLI OpenAPI 一致性测试（共享 `analyze()` 核心与 sample 回归）
- [ ] 3.4 增加 mock Apifox 同步测试
- [x] 3.5 增加 `npm pack --dry-run` 内容检查
- [x] 3.6 配置 npm trusted publishing 或 `NPM_TOKEN`（已加入 `release-cli.yml`；仓库侧仍需配置 `NPM_TOKEN` secret）
- [ ] 3.7 发布 `@duyiliu/api2apifox@0.1.0`

### 阶段 4：增强项

- [ ] 4.1 `init` 命令生成 `.api2apifox.json`
- [ ] 4.2 `projects` 命令列出团队和项目
- [ ] 4.3 SARIF 或更细粒度诊断输出
- [ ] 4.4 Gradle 依赖发现
- [ ] 4.5 增量缓存和大仓性能优化

## 数据库/配置

无数据库变更。

新增项目配置 `.api2apifox.json` 和对应 JSON Schema。Token 仅来自环境变量或一次性 CLI 参数，不进入项目配置。

## 接口/交互

### 公共参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `--project <dir>` | 当前目录 | 项目根目录 |
| `--config <file>` | `.api2apifox.json` | 配置文件 |
| `--format text|json` | TTY 为 text，非 TTY 仍默认 text | 输出格式，AI 应显式使用 json |
| `--quiet` | false | 抑制非必要 stderr 日志 |
| `--no-color` | 自动 | 禁用颜色 |
| `--file <path>` | 无 | 只输出/同步目标文件中的接口，可重复 |
| `--endpoint <METHOD PATH>` | 无 | 精确选择接口，可重复 |

### 同步参数

| 参数 | 说明 |
|---|---|
| `--project-id <id>` | 覆盖目标项目 ID |
| `--token <token>` | 临时 Token，不推荐，优先使用环境变量 |
| `--dry-run` | 只分析和预检，不写 Apifox |
| `--yes` | 非交互确认实际写入 |
| `--endpoint-conflict <mode>` | 覆盖接口冲突策略 |
| `--schema-conflict <mode>` | 覆盖 Schema 冲突策略 |
| `--timeout-ms <ms>` | Apifox 请求等待上限，默认 300000 |

> 超时语义：超时只代表本地停止等待，Apifox 可能仍在继续导入。首次导入需创建目录、接口和模型，实测样例项目在 60 秒等待上限下即出现「服务端已完成、客户端报超时」，因此默认值提高到 300000 毫秒，并在 `REQUEST_TIMEOUT` 消息中要求先核对远端状态再决定是否重试。

## 影响与风险

- 影响模块：扩展入口、配置加载、文件扫描、依赖 jar、同步编排、构建和发布
- 兼容性：设计要求 VS Code 用户无感；CLI 作为新增产品，不破坏既有行为
- 回滚方式：VS Code 在迁移期保留旧编排实现直到 contract tests 通过；CLI 包可独立撤回或废弃版本
- 风险点：
  1. 抽取核心时改变扫描顺序或路径语义，导致 OpenAPI diff。
  2. Windows 与 POSIX 路径/glob 差异。
  3. JSON 输出被日志污染，导致 AI 解析失败。
  4. 非 TTY 下误等待确认造成任务挂死。
  5. npm 包误包含 VS Code 文件或源码/fixture，导致体积膨胀。
  6. Apifox 返回聚合计数，不能声称逐接口成功状态。
  7. `@duyiliu` scope 发布权限未配置。

## 数据安全

- 是否涉及敏感个人信息：不涉及个人信息；涉及 Apifox Access Token
- 脱敏方式：不持久化 Token；错误和日志不输出 Token；Authorization 头整体屏蔽
- 备注：AI 调用示例统一使用占位值，CI 凭据使用 secret 管理

## 验收与验证

| 场景 | 验证命令或入口 | 验证数据 | 预期结果 | 实际结果 |
|---|---|---|---|---|
| CLI 帮助 | `node packages/cli/dist/cli.js --help` | 无 | 四个命令和公共参数完整 | 已通过 |
| 扫描 JSON | `node packages/cli/dist/cli.js scan --project sample --format json` | `sample/` | stdout 仅一个合法 JSON；19 个文件、25 个接口、17 个模型 | 已通过 |
| 导出一致性 | CLI export 与共享 `analyze()` | `sample/` | OpenAPI 3.0.3，路径和模型与现有核心一致 | 已通过 |
| 文件筛选 | `ProjectAnalyzer` / CLI `--file` | sample | 全量类型上下文，输出仅目标文件 8 个接口 | 已通过 |
| 接口筛选 | `scan --endpoint "GET /api/v1/users"` | sample | 仅返回目标接口 | 已通过 |
| dry-run | `sync --project-id 42 --dry-run --format json` | sample | 不要求 Token、不调用 Apifox 写接口 | 已通过 |
| 非 TTY 保护 | `sync` 无 `--yes` | 子进程 stdin pipe | 退出 2，`CONFIRMATION_REQUIRED`，不等待输入 | 已通过 |
| 同步成功 | mock Apifox server | 固定 counters | JSON counters 原样可信返回，退出 0 | 未验证 |
| 部分失败 | mock 返回 endpointFailed > 0 | 固定响应 | 退出 6，保留 counters/errors | 未验证 |
| 鉴权失败 | mock 401 | 无效 token | 退出 4，Token 不出现在输出 | 未验证 |
| 网络超时 | mock 挂起 | 低 timeout | 退出 5，错误码稳定 | 未验证 |
| 超时可配置 | `config --timeout-ms 600000 --format json` | sample | 覆盖生效且来源为 `cli`，默认值 300000 | 已通过 |
| 首次真实导入 | `sync --project sample --project-id 8865417 --yes` | Apifox 测试项目 | 25 接口 + 6 目录创建成功 | 已通过（服务端完成；客户端 60s 超时后实测确认） |
| 重复同步幂等 | 同参数再次 `KEEP_EXISTING` 同步 | Apifox 测试项目 | 25 接口与 17 模型全部忽略，失败 0 | 已通过（654 ms） |
| 跨平台路径 | Windows/Linux CI | sample | 扫描范围和相对路径一致 | 未验证 |
| npm 包检查 | `npm pack --dry-run --json --workspace @duyiliu/api2apifox` | CLI package | 仅 LICENSE、README、dist/cli.js、package.json、Schema 五个文件 | 已通过（185 KB） |
| VS Code 回归 | `npm run typecheck && npm test && npm run compile` | sample | 现有命令、配置、OpenAPI 不变 | 已通过静态/单测/构建；Extension Host 尚未手工验证 |

## 补充资料

- [HTML 阅读版](./api2apifox-cli-design.html)

## 关联资料

- `README.md`
- `src/extension.ts`
- `src/pipeline.ts`
- `src/apifox/client.ts`
- `src/apifox/uploader.ts`
- `src/java/jarIndex.ts`
- `src/java/scanScope.ts`
- `.github/workflows/release.yml`

## 遗留问题

1. `@duyiliu` npm scope 是否已存在且当前账号有 public publish 权限，需要发布前验证。
2. CLI 是否在首版提供 `projects` 命令用于列出团队/项目；当前建议推迟到增强阶段。
3. 核心包是否最终公开发布；当前建议保持 private，避免过早承诺公共 API。
4. CLI 初版是否与扩展版本联动发布；当前建议独立版本、独立标签。
5. 是否支持从现有 `.vscode/settings.json` 生成 `.api2apifox.json`；当前建议未来提供显式迁移命令，不静默读取。

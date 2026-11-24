# Issue #40 第三轮复审

**需回修。** 扩展映射、报告复制和改动规模已通过复核。私有化部分成功时降级文案仍与链接数据矛盾，带 `data` 的响应仍会丢掉外层 `endpoints`。
扩展侧同步透传和报告复制已有临时验证，提交内仍缺相应的自动化回归断言。

| 上一轮必须修改 | 复核证据 | 结论 |
| --- | --- | --- |
| 1. 扩展透传，面板和 CLI 报告复制，唯一且受限的 URL 打开分支 | `src/apifox/uploader.ts:253`、`:309` 从导入结果返回 `endpoints`，`src/extension.ts:429` 直接传给报告。`src/views/SyncResultPanel.ts:74` 只有一个 `openUrl` 分支，要求 URL 在报告中出现且以 `http://` 或 `https://` 开头。两处 `endpointTsv` 和 `markdown` 使用 `linkText` 标注降级行，见 `src/views/SyncResultPanel.ts:587`、`:606` 与 `packages/cli/src/report.ts:443`、`:464`。本地用 stub 走真实 `syncToApifox` 后，执行两套报告脚本，均渲染接口文档、Mock、项目页和说明，点击 TSV、Markdown 复制均得到两个地址和 `（项目页，降级）`，Markdown 亦保留原因。 | 通过 |
| 2. 根据实际结果区分回退项目页、无项目页和歧义，保留私有化直传与双因行为 | `src/apifox/client.ts:309`、`:395` 已区分原因，复现两种私有化原因同时出现、全量直传为 `per-endpoint` 且无 `reason`。此前 `/a` 和 `/b` 共用 `operationId` 的场景仍通过，`/b` 只得到项目页。私有化一行有直传、一行缺映射时，结果是 `partial` 且有 `apifoxUrl`，同一信封的 `reason` 却说「本次不提供任何 Apifox 链接」。公网歧义行实际回退项目页，「已跳过这些接口的链接」宜明确为接口级文档链接。 | 未通过 |
| 3. 扩展透传、私有化直传、dry-run 与报告渲染和复制均有自动化断言 | `packages/cli/test/cli-sync.test.js:182` 验证私有化直传的 `partial` 行为，`:231` 通过真实 CLI 验证 dry-run 的新字段，`:255` 验证部分失败信封。`:704` 执行 CLI HTML 脚本并点击 TSV，确实覆盖渲染与复制的行为，Markdown 点击仍未覆盖。`src/test/syncService.test.ts:238` 的直接测试仍只检查不发请求及旧字段，CLI 加直接旧测试已分别覆盖这两部分。`src/test/uploaderSync.test.ts` 和 `src/test/webview.test.ts` 未新增透传及面板行为断言。临时复核 `syncProject` 实测调用数为 0、两条清单无链接且带 dry-run 原因，也确认真实 uploader 和两套报告脚本已工作。 | 未通过 |
| 4. 手写生产代码增删合计不超过 500 行，重建 Skill 产物一致 | `git fetch origin` 后 `HEAD` 和 `origin/cez/a722c143` 都是 `1251dcb`，`origin/main` 为其父提交 `9ffa70e`。`git diff origin/main HEAD --numstat` 共 10 个文件，排除 1 个测试文件和 2 个生成文件，手写生产改动为 `441 + 55 = 496` 行。没有 `.github/`、`.ai/`、包清单或文档改动。隔离副本实际执行 `npm run build:skill`，两个生成文件均与提交逐字节相同，`npm run check:skill` 通过。 | 通过 |

## 仍需修改

1. **保留 API 响应外层映射。** `src/apifox/client.ts:130` 只解析解包后的 `body.endpoints`，`:191` 在 `data` 存在时会舍弃外层字段。用真实 `ApifoxClient.importOpenapi` 和 fetch stub 实测，无 `data` 的外层数组和 `data.endpoints` 均可读，`{ code: 0, data: { counters, errors }, endpoints: [...] }` 的映射结果为空。本轮 `extractImportEndpoints` 新增的是对传入对象的 `endpoints` 数组解析，未接通这个外层分支。补充带 `data` 与外层 `endpoints` 并存的生产入口断言。
2. **使原因准确描述受影响的行。** 私有化部分映射时，`ENDPOINT_LINK_NO_PROJECT_REASON` 应明确其余行缺项目页及可用接口 URL，保留已取得的接口及 Mock 地址。公网回退时可在原因中直接说明项目页回退。保留独立的歧义原因与私有化双因组合。
3. **补充扩展侧回归断言。** 10 文件上限可以约束测试放哪，无法让 CLI 入口覆盖 `syncToApifox` 和独立的 Webview 脚本。上一轮正是这两条链路发生回归后 CLI 测试仍然通过。验收应包含一次真实 uploader 的映射透传，以及执行 Webview 脚本后验证链接、降级说明和 TSV/Markdown 复制。测试可放在已改动的文件内，或调整测试文件的取舍以保持总数。

## 命令结果

- `npm test` 为 577 项通过、3 项既有环境条件跳过、0 项失败。`npm run test:cli` 为 83 项通过、0 项失败。两个 TypeScript `--noEmit` 检查与 `git diff --check origin/main HEAD` 通过。
- `npm run build:skill` 重建的 `api2apifox.cjs` SHA-256 为 `78663fb0d3db0faad52ac908e97ffa78a794ffb29c5c5e001d89880221fbd266`，`release.json` 哈希也与提交一致。文件和行数实测均在给定 gate 上限内。

CEZ:VERDICT changes

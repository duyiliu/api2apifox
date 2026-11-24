# Issue #40 第四轮复审

**需回修。** 外层导入映射、降级文案和 500 行上限均通过。扩展回归测试已覆盖 uploader、面板渲染和 TSV，仍缺上一轮明确要求的 Webview Markdown 复制断言。解包逻辑还会把附带外层 `endpoints` 元数据的列表数组改成对象，造成列表静默为空。

| 上一轮要求 | 复核证据 | 结论 |
| --- | --- | --- |
| 1. 保留 `{code: 0, data: {counters, errors}, endpoints: [...]}` 的外层映射 | `src/apifox/client.ts:192` 从解包结果与外层恢复映射。用真实 `ApifoxClient.importOpenapi` 和 fetch stub 复现，保留 `endpointCreated: 1` 和外层返回的 ID `9001`、文档 URL、Mock URL。`packages/cli/test/cli-sync.test.js:258` 的 `G1-1g` 走 CLI 生产入口并通过，断言 `apifoxUrl`、`apifoxEndpointId` 与 `partial`。 | 导入行为通过，共享解包仍有下述回归 |
| 2. 私有化部分成功时仅说明受影响的行，歧义仍保留项目级回退 | `src/apifox/client.ts:313`、`:317` 文案已修正。实测私有化部分映射仍为 `partial`，已有行保留文档与 Mock，缺映射行无 URL，原因不再声称整批无链接。全量直传仍为 `per-endpoint` 且无原因，双因同时具备时仍同时输出。公网重复映射时保留带 `degraded: true` 的项目 URL，原因明确写「已跳过这些接口的接口级文档链接」。集成用例 `G1-1e` 通过。 | 通过 |
| 3. 扩展生产代码回归断言涵盖 uploader、Webview 渲染、TSV 和 Markdown | `packages/cli/test/cli-sync.test.js:844` 现场打包真实扩展源码，`:870`、`:877` 断言映射透传和空数组，`:907` 验证降级说明，`:908` 点击 Webview TSV 并检查宿主消息。该测试没有点击 `btnCopyMarkdown`。`:800` 的 Markdown 测试执行的是 CLI HTML，Webview 在 `src/views/SyncResultPanel.ts:674` 有独立处理。复审另执行了真实 Webview Markdown 处理，确认消息文本包含文档 URL、Mock URL、降级标记和原因，提交内仍缺此断言。 | 未通过 |

## 规模与验证

- `git fetch origin` 后，`HEAD` 与 `origin/cez/a722c143` 均为 `c38b419`，父提交是 `origin/main` 的 `9ffa70e`。`git diff origin/main HEAD --numstat` 共 10 个文件。排除 1 个测试文件与 2 个运行时产物，7 个手写生产文件增 444 行、删 56 行，合计 **500 行**。**500 属于不超过 500**，恰好触及上限。提交没有修改 `.github/`、`.ai/`、包清单或文档。
- **测试放在 CLI 测试文件里覆盖扩展代码可以接受。** `.github/workflows/ci.yml:94` 执行 `npm test --workspace @duyiliu/api2apifox`，其 `test/*.test.js` 包含该文件，且扩展断言执行的是现场打包的源码。隔离副本执行同一工作区命令与 `npm run test:cli`，各 85 项通过、0 项失败。`npm test` 为 577 项通过、3 项既有环境条件跳过、0 项失败。两处 TypeScript `--noEmit` 和 `git diff --check` 通过。
- 在隔离副本执行 `npm run build:skill`，运行时与 `release.json` 均与提交逐字节一致，`npm run check:skill` 通过。运行时 SHA-256 为 `6c6134cb1bc7a475d0f2851576dda3b2e32e70bbc1e334312419c2b116cc6596`。

## 必须修改

1. 在现有扩展用例里点击 Webview 的 `btnCopyMarkdown`，对 `vscode.postMessage` 发出的 Markdown 验证文档 URL、Mock URL、降级标记和原因。现有测试位置和运行方式均可沿用。
2. 让外层 `endpoints` 合并保持其他 API 的既有响应形状。`src/apifox/client.ts:195` 对所有请求展开解包结果，数组会变成带数字键的对象。用同一 fetch stub `{code: 0, data: [{id: 7, name: "team"}], endpoints: []}` 实测，`1251dcb` 的 `listTeams()` 返回团队，`c38b419` 返回 `[]`。限定合并到导入响应，或保留列表数组的原形状。重建运行时并复核生产行数。

CEZ:VERDICT changes

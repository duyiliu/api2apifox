# Issue #40 第二轮复审

需回修。CLI HTML 已接通逐接口索引，上一轮的同名 `operationId` 串链已修复。VS Code 扩展仍丢弃导入映射，复制结果仍不包含链接与降级说明。
相对 `main` 共 10 个文件，手写生产代码 496 行新增、41 行删除，合计 537 行，超过 500 行上限。Skill 运行时重建与提交产物逐字节一致。

| 上一轮要求 | 第二轮核对 | 结论 |
| --- | --- | --- |
| 1. CLI HTML 和 VS Code 面板展示逐接口 `apifoxUrl`、有值的 `mockUrl` 与降级原因，并在复制内容保留信息 | CLI `packages/cli/src/report.ts:47` 将 `synced.endpoints` 和 `synced.endpointLinks` 原样传入 `resolvedLinks`，`src/ui/syncResult.ts:164` 优先使用，筛选只影响展示。用模拟 DOM 执行两个报告的实际脚本，确认传入已映射数据后都绘制接口、Mock 和降级项目页，`endpointLinkNote` 可见。CLI 的 TSV 含两个 URL 列，Markdown 另外带全局原因，TSV 缺降级标记或说明。VS Code 的 TSV 与 Markdown 都缺两个 URL 和原因。更重要的是，扩展生产入口在 `src/apifox/uploader.ts:294` 丢弃 `result.endpoints`，`src/extension.ts:430` 的类型断言无法补回数据。用带 ID、文档 URL 和 Mock 的导入响应实测，扩展报告仍只输出降级项目页。 | 需修改 |
| 2. 路由优先，重复匹配视为未映射，`operationId` 只对无路由且本次唯一的记录兜底 | `src/apifox/client.ts:370` 先按 `method + path` 匹配。导入响应里相同路由命中多条时不取首条。只有响应条目的 `method` 和 `path` 均为空，且本次的 `operationId` 唯一，才允许兜底。复现上一轮 `GET /a`、`GET /b` 共享 `C_find` 且响应只映射 `/a` 的案例，`/a` 得到 ID、文档和 Mock，`/b` 只有降级项目链接，整体为 `partial`。另外验证重复响应路由、唯一 ID 兜底和路径信息不全三条分支。 | 通过 |
| 3. 按真正取得接口 URL 的行确定模式，私有化直传 URL 无降级，双因均显式说明，Mock-only 文案准确 | 私有化直接返回接口 URL 时，真实 CLI `--format json` 实测为 `per-endpoint` 且无 `reason`。私有化的一个接口只有 ID、另一个无映射时，两条原因均保留；Mock-only 记录保留 Mock，理由不再声称缺 Mock。仍有事实不符的降级文案：没有 `projectUrl` 时，`src/apifox/client.ts:322` 可以宣称「已降级为项目级链接」，实际没有链接。重复响应路由时同一文案声称未返回 ID，实际是回传后因歧义被拒。 | 核心模式通过，需修正原因 |
| 4. 在生产入口有 JSON 成功、部分失败、私有化直传、dry-run，以及 `syncProject` dry-run 和报告渲染断言 | `packages/cli/test/cli-sync.test.js:92` 起的新集成断言验证成功和 `error.details`。成功映射用例验证 ID、Mock，并断言无接口 URL，没覆盖私有化直接提供 URL。现有 `packages/cli/test/cli.test.js:83` 与 `src/test/syncService.test.ts:238` 的 dry-run 测试仍只断言原字段，没有断言 `endpointLinks.reason`、清单和无链接。报告测试 `packages/cli/test/cli-sync.test.js:460` 只检查内嵌 JSON 子串和容器 ID，禁用实际渲染仍可通过。复审中的临时验证确认 CLI 私有化直传和两处 dry-run 的行为，但这些断言尚未纳入提交。 | 需修改 |

## 范围与验证

- `git fetch origin` 后，`HEAD` 和 `origin/cez/a722c143` 均为 `dacd8d2`。`main...HEAD` 恰有 10 个任务相关文件，没有提交 `.github/`、`.ai/`、包清单或 README、CHANGELOG、SKILL.md、references 等文档改动。复审前唯一未跟踪文件是上一轮的 `work/review-40.md`。
- 按 `git diff main...HEAD --numstat` 排除测试和生成产物，7 个生产文件新增 496 行、删除 41 行，合计 537 行。
- 在复制了依赖及 TypeScript 配置的隔离副本执行 `npm run build:skill`，`api2apifox.cjs` 和 `release.json` 的 SHA-256 与提交逐一相同，两份文件均无差异。仓库与隔离副本的 `npm run check:skill` 均通过。
- 根项目与 CLI 的 `tsc --noEmit` 和 `git diff --check` 通过。隔离副本 `npm test` 为 556 项通过、3 项既有环境条件跳过、0 项失败。`npm run test:cli` 为 80 项通过、0 项失败。

## 必须修改

1. 让 `SyncOutcome` 类型和 `syncToApifox` 真实传递 `result.endpoints`，由扩展以类型安全的字段传入报告。补齐面板 TSV/Markdown 的链接和降级信息，并确保 CLI 复制的降级项目链接可辨。`src/views/SyncResultPanel.ts:74` 和 `:85` 有两个相同的 `openUrl` 分支，应只保留一个，并像 CLI HTML 一样将可点击目标限制为 HTTP(S)。
2. 让降级原因按实际结果区分已回退到项目页、没有可用项目页，以及映射歧义。保留修好的私有化直传与双因行为。
3. 补齐上表缺失的自动化断言，尤其是扩展同步映射传递、私有化直传、两处 dry-run 新字段和执行报告脚本后的内容与复制输出。
4. 将相对 `main` 的手写生产代码增删合计降至 500 行以内，修改后重新生成并核对 Skill 运行时。

## 建议（不阻塞）

- 修正 `src/ui/syncResult.ts:155` 指向已不存在的 `core/endpointLinks` 的注释。该处实现现位于 `src/apifox/client.ts`，`partial` 也可带原因。

CEZ:VERDICT changes

需要回修。CLI JSON 已输出新字段，CLI HTML 和 VS Code 结果面板仍未展示逐接口链接、Mock 地址或降级原因。
部分映射可能串到其他接口，私有化部署已回传接口 URL 时仍被误报为降级。`npm test` 通过，570 项通过、3 项既有环境条件跳过、0 项失败。

| Issue 要求 | 实际 | 结论 |
| --- | --- | --- |
| 同步报告为每个成功同步的 endpoint 记录 Apifox 接口 ID 和 Web 文档页 URL | JSON 使用 `apifoxEndpointId` 和 `apifoxUrl`，两者可在真实 CLI 输出中确认。`packages/cli/src/report.ts:38` 未把同步结果中的逐接口字段交给 HTML 报告模型。`packages/cli/src/report.ts:320` 和 `src/views/SyncResultPanel.ts:463` 仍只渲染旧列。Issue 未指定接口 ID 的字段名。 | 需修改报告展示 |
| `--format json` 输出 `endpoints[].apifoxUrl` | 用 stub 回传 ID 运行 CLI，得到 `result.endpoints[0].apifoxUrl`，字段拼写一致，位于 `schemaVersion: 1` 的 `result` 内。 | 通过 |
| Apifox API 回传 Mock 地址时输出 `mockUrl` | CLI 实测得到 `result.endpoints[0].mockUrl`，未回传时省略。两个可视化报告均未展示该字段。 | JSON 通过，报告需修改 |
| 扩展同步完成通知提供字面量 `打开 Apifox 项目` | `src/extension.ts:1155` 字面量完全一致，点击从 `src/extension.ts:1201` 调用 `vscode.env.openExternal`。公网项目 URL 可推导时显示。 | 通过 |
| 无 ID 映射时降级为项目或目录级链接加接口清单 | 公网 CLI JSON 实测对每行输出项目级 `apifoxUrl` 和 `degraded: true`。CLI HTML 保留既有项目按钮和清单，逐接口数据未贯通。私有化且无可信项目地址时只保留接口清单。 | 公网 JSON 通过，报告需修改 |
| 降级时显式标注降级原因 | 公网 JSON 用 `endpointLinks.reason` 标注。CLI HTML 调用 `buildSyncReport` 时没传 `apiBaseUrl`，触发 `src/core/endpointLinks.ts:113` 的提前返回，浏览器报告模型没有原因。VS Code 面板拿到原因但未展示。私有化 API 已直接回传所有接口 URL 时仍收到 `mode: "project"` 和降级原因。仅回传 Mock URL 时，原因还会声称未回传 Mock。 | 需修改 |
| 报告字段纳入 `output.ts` 的稳定 JSON 信封口径 | `packages/cli/src/output.ts:9` 的 `SuccessEnvelope.result` 继续使用 `unknown`，CLI 通过现有输出入口序列化新的 `SyncResult`。实测成功响应在 `result` 下带新字段，部分导入失败沿既有结构在 `error.details` 保留同步结果，`schemaVersion` 均为 `1`。Issue 未点名其他文件路径、函数、类、导出、参数顺序、配置键或常量。 | 运行时通过，缺自动化契约断言 |
| `npm test` 全绿 | 在工作区外的隔离副本执行，573 项中 570 项通过、0 项失败、3 项跳过。跳过的是 `main` 已有的两项本机 JAR 测试和一项 Windows 符号链接测试。新增的 14 项均执行通过，diff 中无新增注释掉或跳过的测试。 | 通过 |

## 必须修改

1. 让 CLI HTML 复用同步结果中的逐接口映射和降级原因，在 CLI HTML 与 VS Code 结果面板渲染 `apifoxUrl`、有值的 `mockUrl` 和降级原因。Issue 要求同步报告输出这些信息，实际 CLI HTML 在建立模型时丢失这些字段，VS Code 面板也没有读取它们。为报告入口加断言，覆盖逐接口链接及降级提示。
2. 修正回退匹配。`src/core/endpointLinks.ts:94` 允许 `operationId` 覆盖导入条目已经给出的相反路由。已复现 `GET /a` 和 `GET /b` 共用原始 `operationId`，响应只给 `/a` 时，两行都被标上 `/a` 的 ID、文档 URL、Mock URL，整批还被标成 `per-endpoint`。原始 ID 由类名和方法名生成（`src/java/controllerParser.ts:1061`），实际发送的 OpenAPI 会给重复 ID 加后缀（`src/openapi/builder.ts:70`）。回退应使用实际发送的唯一 ID 或其他唯一且无冲突的证据。无法确认归属的行应降级。
3. 按真正取得接口 URL 的行确定 `per-endpoint`、`partial` 和降级原因。实际私有化响应即使给出了完整接口 URL，`src/core/endpointLinks.ts:163` 仍强制返回 `project`。部分或整批降级文案也应反映实际缺失的链接依据，避免和已输出的 `mockUrl` 矛盾。
4. 给生产入口补自动化断言。新测试覆盖了有 ID、无 ID、部分 ID、私有化无链接、无效 ID、重复路由、空清单以及报告模型，实际都直接传入预解析结果。现有 dry-run 测试断言旧行为，未验证新字段。至少通过 CLI `--format json` 断言真实响应解析、接口级链接与 Mock、部分映射和错误信封、私有化直传 URL 以及 dry-run 无链接且说明原因。

## 建议（不阻塞）

- 将 API 提供的地址渲染为可点击链接时，校验 `http:` 或 `https:`。当前公网接口 URL 仅在有 ID 时按文档格式生成，Mock URL 只取响应。Apifox 公共导入接口的官方成功示例仅包含聚合计数，支持公网无映射时降级。 [Apifox 导入 OpenAPI / Swagger 文档](https://apifox-openapi.apifox.cn/api-173409873)
- 审查前工作区干净。提交未修改 `.github/`、`.ai/`、`package.json` 版本或 README、CHANGELOG、SKILL.md、references，也未发现与任务无关的改动。根项目与 CLI 的 `tsc --noEmit`、`git diff --check`、`npm run check:skill` 均通过，已提交的运行时与使用 CLI 构建参数在内存中重建的 bundle 逐字节一致。

CEZ:VERDICT changes

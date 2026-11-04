# Changelog

## Unreleased

### Added
- 发版流程支持 Open VSX：配置 `OVSX_PAT` secret 后，`v*` tag 会同时发布到 Open VSX（Cursor / Windsurf / VSCodium 市场）；未配置时自动跳过
- `CHANGELOG.md`；Marketplace 侧栏补全 `homepage` / `bugs` 链接

### Changed
- CI 的 CLI 与 Skill 运行时任务在 Node.js 20 / 22 矩阵上验证
- CI 与发版工作流升级到 `actions/checkout@v5` / `actions/setup-node@v5`
- `engines.node` 与文档统一为 `>=20`；README 修正 Cursor 安装说明（扩展未上架 Open VSX 时用 vsix），补充 Skill 升级/卸载/离线安装与 Windows 示例

### Fixed
- `.gitattributes` 只将 `runtime/*.cjs` 标记为二进制，`release.json` 恢复文本以便 diff 可读

## 0.4.0 (2026-11-04)

### Added
- Agent Skill `api2apifox`：自带完整 CLI 运行时，`npx skills add duyiliu/api2apifox --skill api2apifox -g` 安装即用，不需要 npm 全局安装
- `scripts/build-skill.mjs` / `scripts/check-skill.mjs`：Skill 运行时构建与版本/哈希校验，CI 与发版流程强制执行
- `scripts/release.mjs`：统一版本发版准备（同步两个 `package.json`、重建 runtime、更新文档版本示例）
- CI 新增 Skill 运行时任务；CLI 集成测试纳入 CI 与发版流程

### Changed
- 扩展与 Skill 统一版本号：同一个 `vX.Y.Z` tag 同时发布 VSIX 与 Skill zip
- 项目名称统一为 api2apifox（仓库与 Marketplace ID `duyiliu.api2apifox`；`apifoxHelper.*` 配置/命令前缀与 `.apifox-helper.properties` 文件名保持兼容）
- 发版工作流同时发布 VS Code Marketplace 与 GitHub Release（附 `api2apifox-<版本>.vsix` 与 `api2apifox-skill-<版本>.zip`）

### Removed
- 停止单独发布 npm 包 `@duyiliu/api2apifox`（registry 上既有版本已标记 deprecated）；`packages/cli` 转为 Skill 的内部构建源

## 0.3.0 及更早

见 [GitHub Releases](https://github.com/duyiliu/api2apifox/releases)。

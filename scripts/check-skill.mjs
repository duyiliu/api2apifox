#!/usr/bin/env node
// 校验仓库内提交的 Skill 运行时与 CLI 源码版本、哈希一致（CI 与发版前使用）。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const runtimeDir = path.join(root, "skills", "api2apifox", "runtime");
const rootManifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const cliManifest = JSON.parse(fs.readFileSync(path.join(root, "packages", "cli", "package.json"), "utf8"));

try {
  if (rootManifest.version !== cliManifest.version) {
    throw new Error(`统一版本要求根 package.json (${rootManifest.version}) 与 packages/cli/package.json (${cliManifest.version}) 一致，请运行 npm run release`);
  }
  const release = JSON.parse(fs.readFileSync(path.join(runtimeDir, "release.json"), "utf8"));
  if (release.version !== cliManifest.version) {
    throw new Error(`Skill 运行时版本 ${release.version} 与 CLI ${cliManifest.version} 不一致，请运行 npm run build:skill`);
  }
  if (release.package !== cliManifest.name) {
    throw new Error(`Skill 运行时包名 ${release.package} 与 CLI ${cliManifest.name} 不一致`);
  }
  if (!Object.keys(release.sha256 ?? {}).length) {
    throw new Error("release.json 缺少 sha256");
  }
  // 运行时二进制不入库（按 release.json 内容寻址从 Releases 下载）；本地/CI 经 build:skill
  // 生成后才存在,存在即严格校验哈希,缺失仅提示——发版 zip 打包前 build:skill 必然重建
  for (const [name, expected] of Object.entries(release.sha256)) {
    const file = path.join(runtimeDir, name);
    if (!fs.existsSync(file)) {
      console.log(`提示：${name} 未构建（运行时二进制不入库，首次使用自动下载；本地可 npm run build:skill 生成）`);
      console.log(`Skill 运行时校验通过：${release.package}@${release.version}（仅 release.json 一致性）`);
      process.exit(0);
    }
    const actual = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    if (actual !== expected) throw new Error(`文件校验失败：${name}，请运行 npm run build:skill`);
  }
  const actual = execFileSync(process.execPath, [path.join(runtimeDir, "api2apifox.cjs"), "--version"], {
    encoding: "utf8",
    timeout: 15000,
  }).trim();
  if (actual !== cliManifest.version) {
    throw new Error(`运行时版本 ${actual} 与 CLI ${cliManifest.version} 不一致`);
  }
  console.log(`Skill 运行时校验通过：${release.package}@${release.version}`);
} catch (error) {
  console.error(`Skill 运行时检查失败：${error.message}`);
  process.exitCode = 1;
}

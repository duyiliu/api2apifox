#!/usr/bin/env node
// 重建 Skill 自带的 CLI 运行时：复用 packages/cli 的构建产物，保证与 npm 包同一份 bundle。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const cliDir = path.join(root, "packages", "cli");
const runtimeDir = path.join(root, "skills", "api2apifox", "runtime");
const manifestPath = path.join(cliDir, "package.json");

execFileSync(process.execPath, ["build.js"], { cwd: cliDir, stdio: "inherit" });

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const bundle = path.join(cliDir, "dist", "cli.js");
const target = path.join(runtimeDir, "api2apifox.cjs");
fs.mkdirSync(runtimeDir, { recursive: true });
fs.copyFileSync(bundle, target);

const sha256 = crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
const release = {
  version: manifest.version,
  package: manifest.name,
  sha256: { "api2apifox.cjs": sha256 },
};
fs.writeFileSync(path.join(runtimeDir, "release.json"), `${JSON.stringify(release, null, 2)}\n`);

const actual = execFileSync(process.execPath, [target, "--version"], { encoding: "utf8", timeout: 15000 }).trim();
if (actual !== manifest.version) {
  throw new Error(`运行时版本 ${actual} 与 packages/cli/package.json 的 ${manifest.version} 不一致`);
}
console.log(`Skill 运行时已更新：${manifest.name}@${manifest.version}（sha256 ${sha256}）`);

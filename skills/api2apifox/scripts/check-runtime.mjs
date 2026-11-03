#!/usr/bin/env node
// 校验 Skill 自带运行时完整性与版本；安装损坏时直接失败，避免静默使用旧副本。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const runtimeDir = fileURLToPath(new URL("../runtime/", import.meta.url));

try {
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 20) throw new Error(`需要 Node.js >= 20，当前为 ${process.versions.node}`);
  const release = JSON.parse(fs.readFileSync(path.join(runtimeDir, "release.json"), "utf8"));
  const hashes = release.sha256 ?? {};
  if (!Object.keys(hashes).length) throw new Error("release.json 缺少 sha256");
  for (const [name, expected] of Object.entries(hashes)) {
    const file = path.join(runtimeDir, name);
    if (!fs.existsSync(file)) throw new Error(`缺少运行时文件：${name}`);
    const actual = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    if (actual !== expected) throw new Error(`文件校验失败：${name}`);
  }
  const entry = path.join(runtimeDir, "api2apifox.cjs");
  const version = execFileSync(process.execPath, [entry, "--version"], { encoding: "utf8", timeout: 15000 }).trim();
  if (version !== release.version) {
    throw new Error(`运行版本 ${version} 与 release.json 的 ${release.version} 不一致`);
  }
  console.log(`Skill 运行时校验通过：${release.package}@${release.version}`);
} catch (error) {
  console.error(`Skill 运行时检查失败：${error.message}。请重新安装 api2apifox Skill。`);
  process.exitCode = 1;
}

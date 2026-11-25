#!/usr/bin/env node
// 校验 Skill 运行时完整性与版本；缺失时先按 release.json 内容寻址下载，避免静默使用旧副本。
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ensureRuntime, readReleasePin } from "./ensure-runtime.mjs";

try {
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 20) throw new Error(`需要 Node.js >= 20，当前为 ${process.versions.node}`);
  const entry = await ensureRuntime();
  const release = readReleasePin();
  const version = execFileSync(process.execPath, [entry, "--version"], { encoding: "utf8", timeout: 15000 }).trim();
  if (version !== release.version) {
    throw new Error(`运行版本 ${version} 与 release.json 的 ${release.version} 不一致`);
  }
  console.log(`Skill 运行时校验通过：api2apifox@${release.version}`);
} catch (error) {
  console.error(`Skill 运行时检查失败：${error.message}`);
  process.exitCode = 1;
}

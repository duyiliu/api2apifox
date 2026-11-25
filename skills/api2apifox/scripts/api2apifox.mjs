#!/usr/bin/env node
// Skill 入口：确保自带 CLI 运行时就绪（缺失时按 release.json 内容寻址下载），再把参数透传给它。
import { spawn } from "node:child_process";
import { ensureRuntime } from "./ensure-runtime.mjs";

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error(`api2apifox 需要 Node.js >= 20，当前为 ${process.versions.node}。`);
  process.exit(7);
}

let runtime;
try {
  runtime = await ensureRuntime();
} catch (error) {
  console.error(`api2apifox 运行时不可用：${error.message}`);
  process.exit(7);
}

const child = spawn(process.execPath, [runtime, ...process.argv.slice(2)], { stdio: "inherit" });
let failed = false;
child.on("error", (error) => {
  failed = true;
  console.error(`api2apifox 运行时启动失败：${error.message}`);
  process.exitCode = 7;
});
child.on("exit", (code, signal) => {
  if (failed) return;
  if (code !== null) {
    process.exitCode = code;
  } else {
    process.exitCode = signal === "SIGINT" ? 130 : 1;
  }
});

#!/usr/bin/env node
// Skill 入口：把参数透传给自带的 CLI 运行时，避免依赖 npm 全局安装。
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const runtime = fileURLToPath(new URL("../runtime/api2apifox.cjs", import.meta.url));
const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  console.error(`api2apifox 需要 Node.js >= 20，当前为 ${process.versions.node}。`);
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

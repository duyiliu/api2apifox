import * as fs from "fs";
import * as path from "path";
import { runTests } from "@vscode/test-electron";

/**
 * VS Code 1.85 Extension Host smoke:验证扩展激活、同步命令注册、
 * 多个同步入口共享 single-flight(成功/取消/任意拒绝值)及失败后恢复。
 * 工作区复制到 .vscode-test 下,配置写入不会污染源码 fixture。
 */
async function main(): Promise<void> {
  // Electron IDE 终端注入的 ELECTRON_RUN_AS_NODE 会让 Code.exe 以 Node 模式
  // 启动并把所有参数当 node flag 报 bad option;spawn 前必须清除。
  delete process.env.ELECTRON_RUN_AS_NODE;
  delete process.env.ELECTRON_NO_ATTACH_CONSOLE;

  const extensionDevelopmentPath = path.resolve(__dirname, "..", "..", "..");
  const extensionTestsPath = path.resolve(__dirname, "suite", "index");
  const fixturePath = path.resolve(extensionDevelopmentPath, "src", "test", "host", "fixture");
  const workspacePath = path.resolve(extensionDevelopmentPath, ".vscode-test", "host-workspace");
  fs.rmSync(workspacePath, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(workspacePath), { recursive: true });
  fs.cpSync(fixturePath, workspacePath, { recursive: true });

  let exitCode = 1;
  try {
    exitCode = await runTests({
      version: "1.85.0",
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workspacePath, "--disable-extensions", "--disable-gpu"],
    });
  } finally {
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

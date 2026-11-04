// 已打包 VSIX 的安装测试(发版门禁,不替代源码态 test:host):
//   1) 复用 test-electron 下载的 VS Code,经其官方 CLI 把 vsix 装进隔离的
//      --extensions-dir / --user-data-dir(不污染本机安装)
//   2) --list-extensions --show-versions 校验 publisher.name@version
//   3) 启动 Extension Host 跑 scripts/vsix-activation-test.cjs:
//      extensionDevelopmentPath 指向 vsix 装出的目录(<extensions-dir>/<id>-<version>),
//      VS Code 按 dev 扩展加载的正是安装产物本身,不会被仓库源码顶包
// 用法: node scripts/test-vsix-install.mjs [vsix 路径] [--vscode-version <ver>] [--vscode-exe <path>]
//       vsix 路径缺省取根目录 api2apifox-<版本>.vsix
//       VS Code 来源优先级:--vscode-exe > --vscode-version > 本机已装 VS Code > 下载 1.85
//       (CI 等无安装环境自动回退到下载 engines 下限版本)
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { downloadAndUnzipVSCode, resolveCliPathFromVSCodeExecutablePath, runTests } from "@vscode/test-electron";

const VSCODE_VERSION = "1.85.0"; // 与 engines.vscode 下限、test:host 保持一致

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const extensionId = `${pkg.publisher}.${pkg.name}`;
const expectedVersion = pkg.version;

const argv = process.argv.slice(2);
const valueFlags = ["--vscode-version", "--vscode-exe"];
function argValue(flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}
const positional = argv.filter(
  (arg, index) => !arg.startsWith("--") && !valueFlags.includes(argv[index - 1])
);
const vsixPath = path.resolve(positional[0] ?? path.join(repoRoot, `${pkg.name}-${pkg.version}.vsix`));
const vscodeExeOverride = argValue("--vscode-exe");
const vscodeVersion = argValue("--vscode-version");

// 探测本机已装的正式版 VS Code:先标准安装路径,再 PATH 里的 code(.cmd) 反推。
function detectInstalledVSCode() {
  const candidates = [];
  if (process.platform === "win32") {
    if (process.env.LOCALAPPDATA) {
      candidates.push(path.join(process.env.LOCALAPPDATA, "Programs", "Microsoft VS Code", "Code.exe"));
    }
    if (process.env.ProgramFiles) {
      candidates.push(path.join(process.env.ProgramFiles, "Microsoft VS Code", "Code.exe"));
    }
  } else if (process.platform === "darwin") {
    candidates.push("/Applications/Visual Studio Code.app/Contents/MacOS/Electron");
  } else {
    candidates.push("/usr/share/code/code", "/usr/lib/code/code");
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  const which = process.platform === "win32" ? "where.exe" : "which";
  const found = spawnSync(which, ["code"], { encoding: "utf8" });
  if (found.status === 0) {
    const binDir = path.dirname(found.stdout.split(/\r?\n/)[0].trim());
    for (const name of ["Code.exe", "code", "Electron"]) {
      const exe = path.resolve(binDir, "..", name);
      if (existsSync(exe)) return exe;
    }
  }
  return undefined;
}
if (!existsSync(vsixPath)) {
  console.error(`未找到 vsix:${vsixPath}\n先运行 npx @vscode/vsce package --no-dependencies`);
  process.exit(1);
}

const profileRoot = path.join(repoRoot, ".vscode-test", "vsix-install-profile");
const extensionsDir = path.join(profileRoot, "extensions");
const userDataDir = path.join(profileRoot, "user-data");
const installedDir = path.join(extensionsDir, `${extensionId}-${expectedVersion}`);
const testEntry = path.join(repoRoot, "scripts", "vsix-activation-test.cjs");

function runCodeCli(cli, args, label) {
  const shell = process.platform === "win32";
  const result = spawnSync(shell ? `"${cli}"` : cli, args, {
    shell,
    encoding: "utf8",
    timeout: 180_000,
    windowsHide: true,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.error || result.status !== 0) {
    throw new Error(`${label} 失败(exit=${result.status ?? result.error}):\n${output}`);
  }
  return output;
}

async function main() {
  // Electron IDE 终端会注入 ELECTRON_RUN_AS_NODE=1(Windsurf/Cursor/Devin),
  // 遗传给子进程后 Code.exe 以 Node 模式启动,所有 VS Code 参数被当成 node flag
  // 报 "bad option";必须在 spawn 前清掉(code.cmd 内部会自行重设,不受影响)。
  delete process.env.ELECTRON_RUN_AS_NODE;
  delete process.env.ELECTRON_NO_ATTACH_CONSOLE;

  let vscodeExecutablePath;
  if (vscodeExeOverride) {
    vscodeExecutablePath = path.resolve(vscodeExeOverride);
    if (!existsSync(vscodeExecutablePath)) {
      throw new Error(`--vscode-exe 不存在:${vscodeExecutablePath}`);
    }
    console.log(`[1/4] 使用 --vscode-exe:${vscodeExecutablePath}`);
  } else if (vscodeVersion) {
    console.log(`[1/4] 下载 VS Code ${vscodeVersion} ...`);
    vscodeExecutablePath = await downloadAndUnzipVSCode(vscodeVersion);
  } else {
    vscodeExecutablePath = detectInstalledVSCode();
    if (vscodeExecutablePath) {
      console.log(`[1/4] 使用本机已装 VS Code:${vscodeExecutablePath}`);
    } else {
      console.log(`[1/4] 未检测到本机 VS Code,下载 ${VSCODE_VERSION} ...`);
      vscodeExecutablePath = await downloadAndUnzipVSCode(VSCODE_VERSION);
    }
  }
  const cli = resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath);

  rmSync(profileRoot, { recursive: true, force: true });
  mkdirSync(extensionsDir, { recursive: true });
  mkdirSync(userDataDir, { recursive: true });
  try {
    const profileArgs = [`--extensions-dir=${extensionsDir}`, `--user-data-dir=${userDataDir}`];

    console.log(`[2/4] 安装 ${path.basename(vsixPath)} ...`);
    const installOut = runCodeCli(cli, [...profileArgs, "--install-extension", vsixPath], "安装 vsix");
    if (installOut) console.log(installOut);
    if (!existsSync(installedDir)) {
      throw new Error(`安装后未找到扩展目录:${installedDir}`);
    }

    console.log("[3/4] 校验已安装扩展 ...");
    const listOut = runCodeCli(cli, [...profileArgs, "--list-extensions", "--show-versions"], "列出扩展");
    console.log(listOut);
    const expectedEntry = `${extensionId}@${expectedVersion}`.toLowerCase();
    if (!listOut.split(/\r?\n/).map((line) => line.trim().toLowerCase()).includes(expectedEntry)) {
      throw new Error(`扩展列表中未找到 ${expectedEntry}`);
    }

    console.log("[4/4] Extension Host 激活断言 ...");
    const code = await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath: installedDir,
      extensionTestsPath: testEntry,
      launchArgs: [...profileArgs, "--disable-gpu"],
      extensionTestsEnv: {
        API2APIFOX_EXPECT_ID: extensionId,
        API2APIFOX_EXPECT_VERSION: expectedVersion,
        API2APIFOX_EXTENSIONS_DIR: extensionsDir,
      },
    });
    if (code !== 0) {
      throw new Error(`Extension Host 测试退出码 ${code}`);
    }
    console.log("VSIX_INSTALL_TEST_OK");
  } finally {
    rmSync(profileRoot, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

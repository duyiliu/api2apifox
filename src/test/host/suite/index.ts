import * as assert from "assert";
import * as http from "http";
import { AddressInfo } from "net";
import * as path from "path";
import * as vscode from "vscode";

const SYNC_COMMANDS = [
  "apifoxHelper.syncWorkspace",
  "apifoxHelper.syncFile",
  "apifoxHelper.syncMethod",
  "apifoxHelper.syncFolderApis",
  "apifoxHelper.syncCheckedApis",
  "apifoxHelper.syncEndpoint",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(predicate: () => boolean, timeoutMs: number, label: string): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) {
      return;
    }
    await sleep(50);
  }
  throw new Error(`等待超时:${label}`);
}

function startImportServer(): Promise<{
  baseUrl: string;
  requests: string[];
  failNextImport: () => void;
  failNextTeams: () => void;
  failNextProjects: () => void;
  close: () => Promise<void>;
}> {
  const requests: string[] = [];
  let failNext = false;
  let failTeams = false;
  let failProjects = false;
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const url = (req.url ?? "").split("?")[0];
      requests.push(`${req.method} ${url} (${body.length} bytes)`);
      if (url === "/v1/teams") {
        if (failTeams) {
          failTeams = false;
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({ code: 500, message: "模拟团队列表失败" }));
          return;
        }
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ data: [{ id: 1, name: "Host Team" }] }));
        return;
      }
      if (url === "/v1/teams/1/projects") {
        if (failProjects) {
          failProjects = false;
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({ code: 500, message: "模拟项目列表失败" }));
          return;
        }
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ data: [{ id: 10, name: "Host Project" }] }));
        return;
      }
      if (failNext) {
        failNext = false;
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ code: 500, message: "模拟上传失败" }));
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ counters: { endpointCreated: 1, schemaCreated: 1 }, errors: [] }));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        requests,
        failNextImport: () => {
          failNext = true;
        },
        failNextTeams: () => {
          failTeams = true;
        },
        failNextProjects: () => {
          failProjects = true;
        },
        close: () =>
          new Promise<void>((done) => {
            server.close(() => done());
          }),
      });
    });
  });
}

/** Extension Host 入口:跑完抛错即测试失败。 */
export async function run(): Promise<void> {
  const extension = vscode.extensions.getExtension("duyiliu.api2apifox");
  assert.ok(extension, "扩展 duyiliu.api2apifox 未注册");
  await extension.activate();

  const commands = await vscode.commands.getCommands(true);
  for (const command of SYNC_COMMANDS) {
    assert.ok(commands.includes(command), `同步命令未注册:${command}`);
  }

  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  assert.ok(root, "测试工作区未打开");
  const fixture = path.join(root, "src", "main", "java", "com", "example", "DemoController.java");
  const uri = vscode.Uri.file(fixture);
  const document = await vscode.workspace.openTextDocument(uri);
  const offset = document.getText().indexOf("public String ping");
  assert.ok(offset > 0, "fixture 中未找到 ping 方法");

  let server: Awaited<ReturnType<typeof startImportServer>> | undefined;

  const windowAny = vscode.window as unknown as {
    showInformationMessage: (...args: unknown[]) => Thenable<unknown>;
    showWarningMessage: (...args: unknown[]) => Thenable<unknown>;
    showErrorMessage: (...args: unknown[]) => Thenable<unknown>;
    showInputBox: (...args: unknown[]) => Thenable<unknown>;
    showQuickPick: (...args: unknown[]) => Thenable<unknown>;
    withProgress: (...args: unknown[]) => Thenable<unknown>;
    createWebviewPanel: (...args: unknown[]) => unknown;
  };
  const originals = {
    showInformationMessage: windowAny.showInformationMessage,
    showWarningMessage: windowAny.showWarningMessage,
    showErrorMessage: windowAny.showErrorMessage,
    showInputBox: windowAny.showInputBox,
    showQuickPick: windowAny.showQuickPick,
    withProgress: windowAny.withProgress,
  };
  const tokenGates: ((value: string | undefined) => void)[] = [];
  const busyMessages: string[] = [];
  const errorMessages: string[] = [];
  let tokenPrompts = 0;
  let tokenBehavior: "gate" | "throw" = "gate";

  windowAny.showInformationMessage = (message: unknown) => {
    const text = String(message);
    if (text.includes("尚未配置 Apifox 访问令牌")) {
      tokenPrompts += 1;
      if (tokenBehavior === "throw") {
        tokenBehavior = "gate";
        throw "host non-error rejection";
      }
      return new Promise<string | undefined>((resolve) => tokenGates.push(resolve));
    }
    if (text.includes("正在同步中")) {
      busyMessages.push(text);
    }
    return Promise.resolve(undefined);
  };
  windowAny.showWarningMessage = (message: unknown) => {
    const text = String(message);
    if (text.includes("确定要清除")) {
      return Promise.resolve("确定清除");
    }
    if (text.includes("确认批量同步到 Apifox")) {
      return Promise.resolve("开始同步");
    }
    return Promise.resolve(undefined);
  };
  windowAny.showErrorMessage = (message: unknown) => {
    errorMessages.push(String(message));
    return Promise.resolve(undefined);
  };
  windowAny.showInputBox = () => Promise.resolve("APS-host-smoke");

  const info = () => ({ prompt: tokenPrompts, busy: busyMessages.length, errors: [...errorMessages] });
  try {
    // 服务器创建后立即进入 try/finally:配置更新或断言失败也要关闭监听器
    server = await startImportServer();
    const config = vscode.workspace.getConfiguration("apifoxHelper");
    const target = vscode.ConfigurationTarget.Workspace;
    await config.update("apiBaseUrl", server.baseUrl, target);
    await config.update("projectId", 1, target);
    await config.update("projectName", "host-smoke", target);
    await config.update("teamName", "host-team", target);
    await sleep(200);
    const updated = vscode.workspace.getConfiguration("apifoxHelper");
    console.log("host-smoke config:", JSON.stringify({ projectId: updated.get("projectId"), apiBaseUrl: updated.get("apiBaseUrl") }));
    assert.equal(updated.get("projectId"), 1, "测试配置未生效(projectId)");
    assert.equal(updated.get("apiBaseUrl"), server.baseUrl, "测试配置未生效(apiBaseUrl)");

    // 先从干净状态开始,避免复用历史 secret 导致不再出现 token 提示
    await vscode.commands.executeCommand("apifoxHelper.clearToken");

    // 1) 取消:token 提示被取消后同步应正常结束,且没有发起导入
    const cancelled = vscode.commands.executeCommand("apifoxHelper.syncWorkspace");
    await waitFor(() => tokenGates.length === 1, 15000, "首次 token 提示");
    tokenGates.shift()!(undefined);
    await cancelled;
    assert.equal(server.requests.length, 0, "取消 token 不应发起导入");
    assert.deepEqual(errorMessages, [], `取消不应报错:${JSON.stringify(info())}`);

    // 2) 成功 + single-flight:六个入口并发,只允许一次导入;其余入口收到忙提示
    const endpoint = { method: "GET", path: "/demo/ping", fsPath: fixture };
    await vscode.commands.executeCommand("apifoxHelper.refreshApiTree");
    await vscode.commands.executeCommand("apifoxHelper.checkAllApis");
    const pending = [
      vscode.commands.executeCommand("apifoxHelper.syncWorkspace"),
      vscode.commands.executeCommand("apifoxHelper.syncFile", uri),
      vscode.commands.executeCommand("apifoxHelper.syncEndpoint", { kind: "endpoint", endpoint }),
      vscode.commands.executeCommand("apifoxHelper.syncMethod", uri, offset),
      vscode.commands.executeCommand("apifoxHelper.syncCheckedApis"),
      vscode.commands.executeCommand("apifoxHelper.syncFolderApis", { kind: "folder", key: "DemoController" }),
    ];
    await waitFor(
      () => tokenGates.length === 1 && busyMessages.filter((message) => message.includes("正在同步中")).length >= 5,
      20000,
      "六个同步入口进入 single-flight"
    );
    assert.equal(tokenPrompts, 2, "只允许一个入口真正开始同步");
    const busyBefore = busyMessages.filter((message) => message.includes("正在同步中")).length;
    assert.ok(busyBefore >= 5, `其余入口应收到忙提示,实际:${JSON.stringify(info())}`);

    // 同步期间状态栏快捷菜单必须隐藏同步选项,非同步操作仍可用
    const quickPickItems: vscode.QuickPickItem[] = [];
    windowAny.showQuickPick = async (...args: unknown[]) => {
      const pickedItems = args[0];
      if (Array.isArray(pickedItems)) {
        quickPickItems.push(...(pickedItems as vscode.QuickPickItem[]));
      }
      return undefined;
    };
    await vscode.commands.executeCommand("apifoxHelper.showStatusBarMenu");
    windowAny.showQuickPick = originals.showQuickPick;
    const menuLabels = quickPickItems.map((item) => item.label);
    assert.ok(menuLabels.some((label) => label.includes("搜索接口")), "非同步选项应保持可用");
    assert.ok(
      !menuLabels.some(
        (label) =>
          label.includes("同步当前文件接口") ||
          label.includes("同步工作区全部接口") ||
          label.includes("同步勾选的接口")
      ),
      `同步选项应隐藏:${JSON.stringify(menuLabels)}`
    );

    tokenGates.shift()!("设置令牌");
    await Promise.all(pending);
    console.log("host-smoke server requests:", JSON.stringify(server.requests));
    console.log("host-smoke info:", JSON.stringify(info()));
    assert.equal(
      server.requests.filter((request) => request.includes("/import-openapi")).length,
      1,
      `并发入口只允许一次 Apifox 导入,实际:${JSON.stringify(server.requests)} / ${JSON.stringify(info())}`
    );
    assert.deepEqual(errorMessages, [], `成功路径不应报错:${JSON.stringify(info())}`);

    // 3) 上传端失败:Apifox 返回 500 时应提示错误,且状态可恢复
    server.failNextImport();
    await vscode.commands.executeCommand("apifoxHelper.syncWorkspace");
    assert.ok(
      errorMessages.some((message) => message.includes("同步失败") && message.includes("模拟上传失败")),
      `上传失败应被捕获:${JSON.stringify(info())}`
    );

    // 4) 任意拒绝值:进度阶段的非 Error rejection 也要收尾并提示,且不留下未处理拒绝
    let rejectNextProgress = true;
    windowAny.withProgress = (...args: unknown[]) => {
      if (rejectNextProgress) {
        rejectNextProgress = false;
        throw "host non-error rejection";
      }
      return originals.withProgress.apply(vscode.window, args as never);
    };
    await vscode.commands.executeCommand("apifoxHelper.syncWorkspace");
    assert.ok(
      errorMessages.some((message) => message.includes("同步失败") && message.includes("host non-error rejection")),
      `非 Error 拒绝应被捕获:${JSON.stringify(info())}`
    );

    // 5) 失败后恢复:仍然可以发起新的同步(上下文已恢复为 false)
    const requestsBefore = server.requests.length;
    await vscode.commands.executeCommand("apifoxHelper.syncWorkspace");
    assert.ok(server.requests.length > requestsBefore, "拒绝后应能重新同步");

    // 6) 设置面板 Webview 消息流:ready/testConnection/fetchProjects/save 成功与失败
    const { SettingsPanel } = require("../../../views/SettingsPanel") as {
      SettingsPanel: {
        createOrShow(secrets: vscode.SecretStorage): {
          handleMessage(message: Record<string, any>): Promise<void>;
          dispose(): void;
          _panel: { webview: { postMessage(message: unknown): Thenable<boolean> } };
        };
      };
    };
    const secretStore = new Map<string, string>();
    const fakeSecrets = {
      get: async (key: string) => secretStore.get(key),
      store: async (key: string, value: string) => {
        secretStore.set(key, value);
      },
      delete: async (key: string) => {
        secretStore.delete(key);
      },
    } as unknown as vscode.SecretStorage;
    let messageHandler: ((message: unknown) => unknown) | undefined;
    const posted: Record<string, any>[] = [];
    const fakePanel = {
      webview: {
        cspSource: "vscode-webview://test",
        html: "",
        onDidReceiveMessage(handler: (message: unknown) => unknown) {
          messageHandler = handler;
          return { dispose() {} };
        },
        postMessage(message: unknown) {
          posted.push(message as Record<string, any>);
          return Promise.resolve(true);
        },
        asWebviewUri(uri: unknown) {
          return uri;
        },
      },
      onDidDispose() {
        return { dispose() {} };
      },
      reveal() {},
      dispose() {},
    };
    const originalCreateWebviewPanel = windowAny.createWebviewPanel;
    windowAny.createWebviewPanel = () => fakePanel;
    const settingsPanel = SettingsPanel.createOrShow(fakeSecrets);
    assert.ok(messageHandler, "SettingsPanel 应注册 Webview 消息接收回调");
    const sendMessage = async (message: Record<string, any>): Promise<void> => {
      await messageHandler!(message);
    };
    try {
      await sendMessage({ command: "ready" });
      assert.equal(posted.at(-1)?.command, "init");
      assert.equal(posted.at(-1)?.data.settings.projectId, 1);

      await sendMessage({
        command: "testConnection",
        token: "APS-host",
        apiBaseUrl: server.baseUrl,
        requestKey: "conn-ok",
      });
      const connOk = posted.at(-1)!;
      assert.equal(connOk.command, "testResult");
      assert.equal(connOk.ok, true);
      assert.equal(connOk.requestKey, "conn-ok");
      assert.equal(connOk.teams.length, 1);

      server.failNextTeams();
      await sendMessage({
        command: "testConnection",
        token: "APS-host",
        apiBaseUrl: server.baseUrl,
        requestKey: "conn-fail",
      });
      const connFail = posted.at(-1)!;
      assert.equal(connFail.command, "testResult");
      assert.equal(connFail.ok, false);
      assert.equal(connFail.requestKey, "conn-fail");

      await sendMessage({
        command: "fetchProjects",
        token: "APS-host",
        apiBaseUrl: server.baseUrl,
        teamId: 1,
      });
      const projOk = posted.at(-1)!;
      assert.equal(projOk.command, "projectsResult");
      assert.equal(projOk.ok, true);
      assert.equal(projOk.projects.length, 1);

      server.failNextProjects();
      await sendMessage({
        command: "fetchProjects",
        token: "APS-host",
        apiBaseUrl: server.baseUrl,
        teamId: 1,
      });
      const projFail = posted.at(-1)!;
      assert.equal(projFail.command, "projectsResult");
      assert.equal(projFail.ok, false);
      assert.equal(projFail.teamId, 1);

      const saveData = {
        token: "APS-settings",
        apiBaseUrl: server.baseUrl,
        teamName: "Host Team",
        projectId: 10,
        projectName: "Host Project Saved",
        endpointConflictBehavior: "OVERWRITE_EXISTING",
        schemaConflictBehavior: "OVERWRITE_EXISTING",
        folderNameSource: "tag",
        pageTypeStyle: "mybatis-plus",
        rootFolderName: "",
        schemaFolderId: 0,
        enumFieldDoc: false,
      };
      await sendMessage({ command: "save", data: saveData });
      const saveOk = posted.at(-1)!;
      assert.equal(saveOk.command, "saveResult");
      assert.equal(saveOk.ok, true);
      assert.equal(secretStore.get("apifoxHelper.token"), "APS-settings");
      assert.equal(vscode.workspace.getConfiguration("apifoxHelper").get("projectName"), "Host Project Saved");

      // 保存失败:缺少 token,应返回可见错误且不覆盖已保存的令牌
      await sendMessage({ command: "save", data: { ...saveData, token: "" } });
      const saveFail = posted.at(-1)!;
      assert.equal(saveFail.command, "saveResult");
      assert.equal(saveFail.ok, false);
      assert.ok(String(saveFail.message).includes("令牌"), `失败应说明原因:${JSON.stringify(saveFail)}`);
      assert.equal(secretStore.get("apifoxHelper.token"), "APS-settings");
    } finally {
      windowAny.createWebviewPanel = originalCreateWebviewPanel;
      settingsPanel.dispose();
    }
  } finally {
    windowAny.showInformationMessage = originals.showInformationMessage;
    windowAny.showWarningMessage = originals.showWarningMessage;
    windowAny.showErrorMessage = originals.showErrorMessage;
    windowAny.showInputBox = originals.showInputBox;
    windowAny.showQuickPick = originals.showQuickPick;
    windowAny.withProgress = originals.withProgress;
    await server?.close();
  }
}

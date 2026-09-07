import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ApifoxClient } from "./apifox/client";
import { errorMessage, ensureToken, selectProject, syncToApifox } from "./apifox/uploader";
import { setToken } from "./config/secret";
import { getSettings } from "./config/settings";
import { SourceFile } from "./java/model";
import { analyze, analyzeSubset, AnalyzeCache, endpointAt } from "./pipeline";

const cache = new AnalyzeCache();

export function activate(context: vscode.ExtensionContext): void {
  const secrets = context.secrets;

  const makeClient = async (): Promise<ApifoxClient | undefined> => {
    const settings = getSettings();
    const token = await ensureToken(secrets);
    if (!token) {
      return undefined;
    }
    if (!settings.projectId) {
      const ok = await selectProject(new ApifoxClient(settings.apiBaseUrl, token));
      if (!ok) {
        return undefined;
      }
    }
    return new ApifoxClient(settings.apiBaseUrl, token);
  };

  /** 收集要分析的 Java 文件;singleFile 限定为一个文件 */
  const collectFiles = async (singleFile?: vscode.Uri): Promise<SourceFile[] | undefined> => {
    const settings = getSettings();
    let uris: vscode.Uri[];
    if (singleFile) {
      uris = [singleFile];
    } else {
      uris = await vscode.workspace.findFiles(
        `{${settings.include.join(",")}}`,
        `{${settings.exclude.join(",")}}`,
        5000
      );
    }
    const files: SourceFile[] = [];
    for (const uri of uris) {
      try {
        files.push({ fsPath: uri.fsPath, content: await fs.promises.readFile(uri.fsPath, "utf8") });
      } catch {
        // 文件可能已被删除/占用,跳过
      }
    }
    return files.length ? files : undefined;
  };

  const analyzeOptions = () => ({ title: vscode.workspace.name ?? "API", pageStyle: getSettings().pageTypeStyle });

  const analyzeWorkspace = async (singleFile?: vscode.Uri) => {
    const files = await collectFiles(singleFile);
    if (!files) {
      vscode.window.showWarningMessage(singleFile ? "该文件不可读" : "没有扫描到任何 Java 源文件(检查 include/exclude 配置)");
      return undefined;
    }
    return cache.analyze(files, analyzeOptions());
  };

  /** 同步一组接口(整包/单文件/单接口共用) */
  const doSync = async (analyzed: Awaited<ReturnType<typeof analyzeWorkspace>>, emptyHint: string) => {
    if (!analyzed) {
      return;
    }
    if (!analyzed.endpoints.length) {
      vscode.window.showWarningMessage(emptyHint);
      return;
    }
    const client = await makeClient();
    if (!client) {
      return;
    }
    try {
      const outcome = await syncToApifox(client, getSettings(), analyzed);
      showResult(outcome.message);
    } catch (err) {
      vscode.window.showErrorMessage(`同步失败:${errorMessage(err)}`);
    }
  };

  // 命令:设置令牌
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.setToken", async () => {
      const current = await secrets.get("apifoxHelper.token");
      const token = await vscode.window.showInputBox({
        prompt: current ? "重新粘贴 Apifox API 访问令牌(留空取消)" : "粘贴 Apifox API 访问令牌(Apifox 客户端 → 头像 → 账号设置 → API 访问令牌)",
        password: true,
        ignoreFocusOut: true,
      });
      if (token === undefined) {
        return;
      }
      await setToken(secrets, token || undefined);
      vscode.window.showInformationMessage(token ? "访问令牌已保存(加密存储)" : "访问令牌已清除");
    })
  );

  // 命令:选择项目
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.selectProject", async () => {
      const settings = getSettings();
      const token = await ensureToken(secrets);
      if (!token) {
        return;
      }
      await selectProject(new ApifoxClient(settings.apiBaseUrl, token));
    })
  );

  // 命令:同步整个项目
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.syncWorkspace", async () => {
      const analyzed = await analyzeWorkspace();
      await doSync(analyzed, "没有扫描到任何 Java 源文件");
    })
  );

  // 命令:同步单个文件(命令面板取当前编辑器;右键菜单取所选文件)
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.syncFile", async (uri?: vscode.Uri) => {
      const target = uri ?? vscode.window.activeTextEditor?.document.uri;
      if (!target) {
        vscode.window.showWarningMessage("请先打开一个 Java 文件");
        return;
      }
      // 用全量源码做类型解析,只输出该文件的接口(单文件解析会丢失跨文件 DTO)
      const allFiles = await collectFiles();
      if (!allFiles) {
        return;
      }
      const analyzed = analyzeSubset(allFiles, analyzeOptions(), (ep) => ep.fsPath === target.fsPath);
      await doSync(analyzed, "该文件中未发现 REST 接口(@RestController/@Controller/@FeignClient/@Path)");
    })
  );

  // 命令:同步单个接口(CodeLens / 编辑器菜单)
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.syncMethod", async (uri?: vscode.Uri, offset?: number) => {
      const editor = vscode.window.activeTextEditor;
      const target = uri ?? editor?.document.uri;
      if (!target) {
        vscode.window.showWarningMessage("请先打开一个 Java 文件");
        return;
      }
      let pos = offset;
      if (pos === undefined && editor && editor.document.uri.toString() === target.toString()) {
        pos = editor.document.offsetAt(editor.selection.active);
      }
      if (pos === undefined) {
        vscode.window.showWarningMessage("无法定位接口位置");
        return;
      }
      const files = await collectFiles(target);
      if (!files?.length) {
        return;
      }
      const allEndpoints = cache.endpointsOfFile(files[0].fsPath, files[0].content);
      const endpoint = endpointAt(allEndpoints, files[0].fsPath, pos);
      if (!endpoint) {
        vscode.window.showWarningMessage("光标附近未发现 REST 接口方法");
        return;
      }
      // 用全量上下文解析类型,只输出该接口
      const allFiles = await collectFiles();
      const source = allFiles ?? files;
      const analyzed = analyzeSubset(source, analyzeOptions(), (ep) => ep.fsPath === endpoint.fsPath && ep.method === endpoint.method && ep.path === endpoint.path);
      await doSync(analyzed, "未发现可同步的接口");
    })
  );

  // 命令:导出 OpenAPI 预览
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.exportOpenapi", async () => {
      const files = await collectFiles();
      if (!files) {
        return;
      }
      const analyzed = analyze(files, analyzeOptions());
      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder) {
        return;
      }
      const settings = getSettings();
      const outPath = path.isAbsolute(settings.exportPath) ? settings.exportPath : path.join(folder.uri.fsPath, settings.exportPath);
      await fs.promises.writeFile(outPath, JSON.stringify(analyzed.spec, null, 2), "utf8");
      const action = await vscode.window.showInformationMessage(
        `已导出 ${analyzed.endpoints.length} 个接口到 ${path.basename(outPath)}(解析告警 ${analyzed.warnings.length} 条)`,
        "打开文件"
      );
      if (action === "打开文件") {
        const doc = await vscode.workspace.openTextDocument(outPath);
        await vscode.window.showTextDocument(doc);
      }
    })
  );

  // CodeLens:接口方法上方「同步此接口」
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: "java" }, {
      provideCodeLenses(document) {
        const settings = getSettings();
        const rel = document.uri.fsPath.replace(/\\/g, "/");
        // include/exclude 粗过滤,避免在无关文件上解析
        const inScope = settings.include.some((g) => matchGlobLoose(g, rel)) && !settings.exclude.some((g) => matchGlobLoose(g, rel));
        if (!inScope) {
          return [];
        }
        let endpoints;
        try {
          endpoints = cache.endpointsOfFile(document.uri.fsPath, document.getText());
        } catch {
          return [];
        }
        return endpoints
          .filter((e) => e.methodRange)
          .map((e) => {
            const line = Math.max(0, e.methodRange!.startLine - 1);
            return new vscode.CodeLens(
              new vscode.Range(line, 0, line, 0),
              {
                title: "▲ 同步此接口到 Apifox",
                command: "apifoxHelper.syncMethod",
                arguments: [document.uri, e.methodRange!.startOffset],
              }
            );
          });
      },
    })
  );
}

/** 简化版 glob 判断(仅用于 CodeLens 粗过滤,精度不够时宁可多解析) */
function matchGlobLoose(glob: string, relPath: string): boolean {
  const re = new RegExp(
    "^" +
      glob
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*\*/g, "\u0000")
        .replace(/\*/g, "[^/]*")
        .replace(/\u0000/g, ".*")
        .replace(/\?/g, ".") +
      "$"
  );
  return re.test(relPath);
}

function showResult(message: string): void {
  if (message.includes("\n")) {
    // 多行结果用输出通道展示
    const channel = vscode.window.createOutputChannel("Apifox Helper");
    channel.clear();
    channel.appendLine(message);
    channel.show(true);
    vscode.window.showInformationMessage("同步完成,详情见输出面板(Apifox Helper)");
  } else {
    vscode.window.showInformationMessage(message);
  }
}

export function deactivate(): void {}

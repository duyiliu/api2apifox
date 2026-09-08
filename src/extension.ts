import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ApifoxClient } from "./apifox/client";
import { errorMessage, ensureToken, selectProject, syncToApifox } from "./apifox/uploader";
import { setToken } from "./config/secret";
import { getSettings } from "./config/settings";
import { HelperProperties, loadPropertiesFiles } from "./config/helperProperties";
import { EndpointInfo, SourceFile } from "./java/model";
import { ApiTreeNode, ApiTreeProvider } from "./providers/ApiTreeProvider";
import { openQuickSetup } from "./config/quickSetup";
import { SettingsPanel } from "./views/SettingsPanel";
import { analyze, analyzeSubset, AnalyzeCache, endpointAt } from "./pipeline";
import { discoverMavenRepos, JarClassIndex, parsePomDependencies, resolveDependencyJars } from "./java/jarIndex";

const cache = new AnalyzeCache();

/** 构建依赖 jar 的类索引(源码之外的类型按需从 .class 解析,如框架的 ResponseDto) */
async function buildJarClassIndex(): Promise<JarClassIndex | undefined> {
  const settings = getSettings();
  const jars: string[] = [];
  // 1. 显式 jar 优先
  for (const j of settings.dependencyJars) {
    try {
      if (fs.existsSync(j) && fs.statSync(j).isFile()) {
        jars.push(j);
      }
    } catch {
      // 忽略无效路径
    }
  }
  // 2. 仓库 + 工作区 pom 坐标
  const repos = discoverMavenRepos(settings.dependencyRepos);
  if (repos.length) {
    const poms = await vscode.workspace.findFiles("**/pom.xml", "**/target/**", 200);
    const coords: { groupId: string; artifactId: string }[] = [];
    for (const p of poms) {
      try {
        coords.push(...parsePomDependencies(await fs.promises.readFile(p.fsPath, "utf8")));
      } catch {
        // 不可读跳过
      }
    }
    if (coords.length) {
      const { jars: resolved } = resolveDependencyJars(repos, coords);
      jars.push(...resolved);
    }
  }
  if (!jars.length) {
    return undefined;
  }
  const idx = JarClassIndex.build(jars);
  return idx.size ? idx : undefined;
}

/** 找到工作区内的 .apifox-helper.properties 并读取(整包同步/导出用) */
async function loadHelperProperties(): Promise<HelperProperties | undefined> {
  const settings = getSettings();
  if (!settings.helperProperties) {
    return undefined;
  }
  const uris = await vscode.workspace.findFiles("**/.apifox-helper.properties", "**/node_modules/**", 100);
  if (!uris.length) {
    return undefined;
  }
  const contents: { path: string; content: string }[] = [];
  for (const uri of uris) {
    try {
      contents.push({ path: uri.fsPath.replace(/\\/g, "/"), content: await fs.promises.readFile(uri.fsPath, "utf8") });
    } catch {
      // 忽略不可读文件
    }
  }
  if (!contents.length) {
    return undefined;
  }
  // 更深的路径视为更具体的模块,后加载(优先级高);同级按文件名
  contents.sort((a, b) => pathDepth(a.path) - pathDepth(b.path) || a.path.localeCompare(b.path));
  const props = loadPropertiesFiles(contents);
  // 收集 properties.additional 指向但未找到的后续文件会因 content="" 被跳过,这里不做二次读
  return props;
}

function pathDepth(p: string): number {
  return p.split("/").length;
}

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

  const analyzeOptions = async () => {
    const settings = getSettings();
    const rootFolder = settings.rootFolderName.trim();
    const jarIndex = await buildJarClassIndex();
    return {
      title: vscode.workspace.name ?? "API",
      pageStyle: settings.pageTypeStyle,
      rules: await loadHelperProperties(),
      enumFieldDoc: settings.enumFieldDoc,
      // 接口目录(x-apifox-folder):folderNameSource=controller 用类名,否则 tag;rootFolderName 作前缀
      folderOf: (ep: { tag: string; controller: string }) => {
        const key = settings.folderNameSource === "controller" ? ep.controller : ep.tag;
        return rootFolder ? `${rootFolder}/${key}` : key;
      },
      // 框架类识别:源码未覆盖的类型按需从依赖 jar 的 .class 解析
      jarLookup: jarIndex ? (name: string) => jarIndex.lookup(name) : undefined,
    };
  };

  const analyzeWorkspace = async (singleFile?: vscode.Uri) => {
    const files = await collectFiles(singleFile);
    if (!files) {
      vscode.window.showWarningMessage(singleFile ? "该文件不可读" : "没有扫描到任何 Java 源文件(检查 include/exclude 配置)");
      return undefined;
    }
    return cache.analyze(files, await analyzeOptions());
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

  /* ---------- 侧边栏「接口列表」树 ---------- */
  let saveRefreshTimer: ReturnType<typeof setTimeout> | undefined;
  const folderKeyForTree = (ep: { tag: string; controller: string }): string => {
    const settings = getSettings();
    const rootFolder = settings.rootFolderName.trim();
    const key = settings.folderNameSource === "controller" ? ep.controller : ep.tag;
    return rootFolder ? `${rootFolder}/${key}` : key;
  };

  const treeProvider = new ApiTreeProvider(analyzeWorkspace, folderKeyForTree);

  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.clearToken", async () => {
      const confirm = await vscode.window.showWarningMessage(
        "确定要清除当前保存的 Apifox 访问令牌吗？",
        "确定清除",
        "取消"
      );
      if (confirm === "确定清除") {
        await setToken(secrets, undefined);
        vscode.window.showInformationMessage("已清除访问令牌");
        treeProvider.refresh().catch(() => undefined);
      }
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("apifoxHelper")) {
        treeProvider.refresh().catch(() => undefined);
      }
    }),
    secrets.onDidChange((e) => {
      if (e.key === "apifoxHelper.token") {
        treeProvider.refresh().catch(() => undefined);
      }
    })
  );

  const treeView = vscode.window.createTreeView("apifoxHelper.apiTree", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
    canSelectMany: false,
  });
  context.subscriptions.push(
    treeView,
    treeView.onDidChangeCheckboxState((e) => {
      let changed = false;
      for (const [node, state] of e.items) {
        const isChecked = state === vscode.TreeItemCheckboxState.Checked;
        if (node.kind === "endpoint") {
          treeProvider.setChecked(node.endpoint, isChecked);
          changed = true;
        } else if (node.kind === "folder") {
          treeProvider.setFolderChecked(node, isChecked);
          changed = true;
        }
      }
      if (changed) {
        treeProvider.fireChanged();
      }
    }),
    // 保存 Java 文件后自动刷新(防抖 800ms)
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.languageId === "java") {
        clearTimeout(saveRefreshTimer);
        saveRefreshTimer = setTimeout(() => {
          treeProvider.refresh().catch(() => undefined);
        }, 800);
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.refreshApiTree", async () => {
      await vscode.window.withProgress({ location: { viewId: "apifoxHelper.apiTree" } }, () => treeProvider.refresh());
    }),
    vscode.commands.registerCommand("apifoxHelper.gotoEndpoint", async (ep: EndpointInfo) => {
      try {
        const doc = await vscode.workspace.openTextDocument(ep.fsPath);
        const editor = await vscode.window.showTextDocument(doc, { preview: true });
        if (ep.methodRange) {
          const pos = doc.positionAt(ep.methodRange.startOffset);
          editor.selection = new vscode.Selection(pos, pos);
          editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
        }
      } catch {
        vscode.window.showWarningMessage(`无法打开 ${ep.fsPath}`);
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.searchApi", async () => {
      const all = treeProvider.allEndpoints();
      if (!all.length) {
        vscode.window.showInformationMessage("接口列表为空,先执行「刷新接口列表」");
        return;
      }
      const picked = await vscode.window.showQuickPick(
        all.map((ep) => ({
          label: `${ep.method}  ${ep.path}`,
          description: ep.summary ?? "",
          detail: `${ep.controller}.${ep.operationId}`,
          ep,
        })),
        { placeHolder: "搜索接口(路径 / 方法 / 描述)", matchOnDescription: true, matchOnDetail: true }
      );
      if (picked) {
        vscode.commands.executeCommand("apifoxHelper.gotoEndpoint", picked.ep);
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.checkAllApis", () => {
      treeProvider.checkAll();
      vscode.window.showInformationMessage(`已勾选全部 ${treeProvider.checkedCount} 个接口`);
    }),
    vscode.commands.registerCommand("apifoxHelper.uncheckAllApis", () => {
      treeProvider.uncheckAll();
      vscode.window.showInformationMessage("已清空所有勾选的接口");
    }),
    vscode.commands.registerCommand("apifoxHelper.checkFolderApis", (node?: ApiTreeNode) => {
      if (node && node.kind === "folder") {
        treeProvider.setFolderChecked(node, true);
        treeProvider.fireChanged();
        vscode.window.showInformationMessage(`已勾选目录「${node.key}」下的全部接口`);
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.uncheckFolderApis", (node?: ApiTreeNode) => {
      if (node && node.kind === "folder") {
        treeProvider.setFolderChecked(node, false);
        treeProvider.fireChanged();
        vscode.window.showInformationMessage(`已取消勾选目录「${node.key}」下的接口`);
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.syncFolderApis", async (node?: ApiTreeNode) => {
      if (!node || node.kind !== "folder") {
        return;
      }
      const endpoints = node.endpoints;
      if (!endpoints.length) {
        vscode.window.showWarningMessage("该目录下没有可同步的接口");
        return;
      }
      const allFiles = await collectFiles();
      if (!allFiles) {
        return;
      }
      const wanted = new Set(endpoints.map((e) => `${e.method} ${e.path}`));
      const analyzed = analyzeSubset(allFiles, await analyzeOptions(), (ep) => wanted.has(`${ep.method} ${ep.path}`));
      await doSync(analyzed, `目录「${node.key}」下未发现可同步的接口`);
    }),
    vscode.commands.registerCommand("apifoxHelper.syncCheckedApis", async () => {
      const checked = treeProvider.getCheckedEndpoints();
      if (!checked.length) {
        vscode.window.showInformationMessage("先在接口列表中勾选要同步的接口(接口行前或目录前的复选框)");
        return;
      }
      // 全量上下文解析,只输出勾选接口(与单接口同步同机制)
      const allFiles = await collectFiles();
      if (!allFiles) {
        return;
      }
      const wanted = new Set(checked.map((e) => `${e.method} ${e.path}`));
      const analyzed = analyzeSubset(allFiles, await analyzeOptions(), (ep) => wanted.has(`${ep.method} ${ep.path}`));
      await doSync(analyzed, "勾选的接口未在当前解析结果中");
    })
  );
  // 初始加载(树视图首次可见时即有数据)
  treeProvider.refresh().catch(() => undefined);

  const openSettings = () => {
    SettingsPanel.createOrShow(context.extensionUri, secrets, () => {
      treeProvider.refresh().catch(() => undefined);
    });
  };

  // 命令:打开 Webview 设置中心表单面板
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.openSettingsPanel", openSettings),
    vscode.commands.registerCommand("apifoxHelper.quickSetup", openSettings)
  );

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
      treeProvider.refresh().catch(() => undefined);
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
      const ok = await selectProject(new ApifoxClient(settings.apiBaseUrl, token));
      if (ok) {
        treeProvider.refresh().catch(() => undefined);
      }
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
      const analyzed = analyzeSubset(allFiles, await analyzeOptions(), (ep) => ep.fsPath === target.fsPath);
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
      const analyzed = analyzeSubset(source, await analyzeOptions(), (ep) => ep.fsPath === endpoint.fsPath && ep.method === endpoint.method && ep.path === endpoint.path);
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
      const analyzed = analyze(files, await analyzeOptions());
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

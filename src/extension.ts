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
import { SettingsPanel } from "./views/SettingsPanel";
import { SyncResultPanel } from "./views/SyncResultPanel";
import { AnalyzeCache, endpointAt } from "./pipeline";
import { discoverMavenRepos, JarClassIndex, parsePomDependencies, resolveDependencyJars } from "./java/jarIndex";
import { createGitEntryProbe, findNestedCheckoutRoot, isInHiddenDirectory, isSkippedCheckout } from "./java/scanScope";
import { buildSyncPreflightDetail, syncTargetLabel } from "./ui/syncPreflight";
import { buildSyncReport, projectWebUrl } from "./ui/syncResult";

const cache = new AnalyzeCache();

/**
 * 依赖 jar 索引的会话级缓存:jar 文件集合与内容指纹未变时直接复用,
 * 避免每次保存 Java 文件刷新树都同步重读一遍 jar(大仓下保存后会卡一下)。
 * 显式 jar / 额外仓库目录配置变化、任一匹配 jar 的 mtime/size 变化即失效。
 */
let jarIndexCache: { key: string; index: JarClassIndex | undefined } | undefined;

function jarIndexCacheKey(configSignature: string, jars: string[]): string {
  const parts: string[] = [configSignature];
  for (const j of jars) {
    try {
      const st = fs.statSync(j);
      parts.push(`${j}|${st.size}|${st.mtimeMs}`);
    } catch {
      parts.push(`${j}|missing`);
    }
  }
  return parts.join("\n");
}

/** 构建依赖 jar 的类索引(源码之外的类型按需从 .class 解析,如框架的 ResponseDto) */
async function buildJarClassIndex(): Promise<JarClassIndex | undefined> {
  const settings = getSettings();
  const configSignature = [...settings.dependencyJars, ...settings.dependencyRepos].join("\n");
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
  const repos = await discoverMavenRepos(settings.dependencyRepos);
  if (repos.length) {
    const MAX_POMS = 200;
    const poms = await vscode.workspace.findFiles("**/pom.xml", "**/target/**", MAX_POMS);
    if (poms.length >= MAX_POMS) {
      vscode.window.showWarningMessage(`pom.xml 数量达到上限 ${MAX_POMS},部分模块的依赖 jar 未纳入识别(可用 dependencyJars 显式补充)`);
    }
    const coords: { groupId: string; artifactId: string }[] = [];
    for (const p of withoutIgnoredSources(poms)) {
      try {
        coords.push(...parsePomDependencies(await fs.promises.readFile(p.fsPath, "utf8")));
      } catch {
        // 不可读跳过
      }
    }
    if (coords.length) {
      const { jars: resolved } = await resolveDependencyJars(repos, coords);
      jars.push(...resolved);
    }
  }
  // jar 集合与文件指纹未变时复用会话缓存,大仓保存刷新不再同步重读
  const key = jarIndexCacheKey(configSignature, jars);
  if (jarIndexCache && jarIndexCache.key === key) {
    return jarIndexCache.index;
  }
  // 索引持有各 jar 的 fd,被替换前先释放
  jarIndexCache?.index?.dispose();
  if (!jars.length) {
    jarIndexCache = { key, index: undefined };
    return undefined;
  }
  const idx = JarClassIndex.build(jars);
  const result = idx.size ? idx : undefined;
  if (!result) {
    idx.dispose();
  }
  jarIndexCache = { key, index: result };
  return result;
}

/** 找到工作区内的 .apifox-helper.properties 并读取(整包同步/导出用) */
async function loadHelperProperties(): Promise<HelperProperties | undefined> {
  const settings = getSettings();
  if (!settings.helperProperties) {
    return undefined;
  }
  // 隐藏目录/副本内的同名 rules 会因路径更深而覆盖工作区根配置,先剔除
  const uris = withoutIgnoredSources(await vscode.workspace.findFiles("**/.apifox-helper.properties", "**/node_modules/**", 100));
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
  // properties.additional 引用的文件(常与 .apifox-helper.properties 不同名)在此回填内容
  const props = loadPropertiesFiles(contents, (p) => {
    try {
      return fs.readFileSync(p, "utf8");
    } catch {
      return undefined;
    }
  });
  return props;
}

function pathDepth(p: string): number {
  return p.split("/").length;
}

/** `.git` 探针:整包扫描跳过 Agent 工作树/嵌套仓库副本,每次收集前 reset 以感知新建的工作树 */
const gitEntryProbe = createGitEntryProbe((p) => fs.existsSync(p));

const hasGitEntry = (dir: string): boolean => gitEntryProbe.hasGitEntry(dir);

/**
 * 剔除工作区根下任意隐藏目录与另一个 git 检出下的文件,避免 AI 工具工作树等副本
 * 被解析成重复接口。keepCheckoutOf 指向的非隐藏副本保留,使显式同步仍可解析类型。
 */
function withoutIgnoredSources(uris: vscode.Uri[], keepCheckoutOf?: vscode.Uri): vscode.Uri[] {
  gitEntryProbe.reset();
  const allowed = new Map<string, string | undefined>();
  if (keepCheckoutOf) {
    const root = vscode.workspace.getWorkspaceFolder(keepCheckoutOf)?.uri.fsPath;
    if (root) {
      allowed.set(root, findNestedCheckoutRoot(path.dirname(keepCheckoutOf.fsPath), root, hasGitEntry));
    }
  }
  return uris.filter((uri) => {
    const root = vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath;
    if (!root) {
      return true;
    }
    const sourceDir = path.dirname(uri.fsPath);
    return !isInHiddenDirectory(sourceDir, root) && !isSkippedCheckout(sourceDir, root, hasGitEntry, allowed.get(root));
  });
}

export function activate(context: vscode.ExtensionContext): void {
  const secrets = context.secrets;
  // 扩展停用时释放 jar 索引持有的 fd
  context.subscriptions.push({
    dispose: () => {
      jarIndexCache?.index?.dispose();
      jarIndexCache = undefined;
    },
  });

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

  /** 收集要分析的 Java 文件;singleFile 限定为一个文件(token 取消即中断读文件循环) */
  const collectFiles = async (
    singleFile?: vscode.Uri,
    token?: vscode.CancellationToken,
    keepCheckoutOf?: vscode.Uri
  ): Promise<SourceFile[] | undefined> => {
    const settings = getSettings();
    let uris: vscode.Uri[];
    if (singleFile) {
      uris = [singleFile];
    } else {
      const MAX_FILES = 5000;
      uris = await vscode.workspace.findFiles(
        `{${settings.include.join(",")}}`,
        `{${settings.exclude.join(",")}}`,
        MAX_FILES
      );
      // findFiles 命中数达到上限即静默截断;大仓被截断会丢接口,明确提示
      if (uris.length >= MAX_FILES) {
        vscode.window.showWarningMessage(`Java 源文件数达到扫描上限 ${MAX_FILES},超出部分未纳入解析(可用 include/exclude 收敛范围)`);
      }
    }
    // 工作区根下的隐藏目录与 Agent 工作树等副本不参与源码扫描
    uris = withoutIgnoredSources(uris, keepCheckoutOf ?? singleFile);
    const files: SourceFile[] = [];
    for (const uri of uris) {
      if (token?.isCancellationRequested) {
        return undefined;
      }
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

  const analyzeWorkspace = async (singleFile?: vscode.Uri, token?: vscode.CancellationToken) => {
    const files = await collectFiles(singleFile, token);
    if (token?.isCancellationRequested) {
      return undefined;
    }
    if (!files) {
      vscode.window.showWarningMessage(singleFile ? "该文件不可读" : "没有扫描到任何 Java 源文件(检查 include/exclude 配置)");
      return undefined;
    }
    return cache.analyze(files, await analyzeOptions());
  };

  type SyncOptions = {
    scopeLabel: string;
    confirm?: boolean;
    selection?: { visible: number; hidden: number };
  };

  /** 同步一组接口(整包/单文件/单接口共用):先校验账号项目,再解析、确认并上传。 */
  const doSync = async (
    emptyHint: string,
    prepare: (token?: vscode.CancellationToken) => Promise<Awaited<ReturnType<typeof analyzeWorkspace>> | undefined>,
    options: SyncOptions
  ) => {
    // 配置不完整时先引导配置，避免用户等待全量扫描后才发现无法同步。
    const client = await makeClient();
    if (!client) {
      return;
    }
    const analyzed = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: "ApiGen for Apifox: 解析 Java 源码与依赖索引...", cancellable: true },
      (progress, token) => {
        progress.report({ message: "扫描 Java 文件..." });
        return prepare(token);
      }
    );
    if (!analyzed) {
      return;
    }
    if (!analyzed.endpoints.length) {
      vscode.window.showWarningMessage(emptyHint);
      return;
    }
    if (options.confirm) {
      const settings = getSettings();
      const picked = await vscode.window.showWarningMessage(
        "确认批量同步到 Apifox？",
        {
          modal: true,
          detail: buildSyncPreflightDetail({
            teamName: settings.teamName ?? "",
            projectName: settings.projectName ?? "",
            projectId: settings.projectId,
            scopeLabel: options.scopeLabel,
            endpointCount: analyzed.endpoints.length,
            endpointConflictBehavior: settings.endpointConflictBehavior,
            schemaConflictBehavior: settings.schemaConflictBehavior,
            visibleChecked: options.selection?.visible,
            hiddenChecked: options.selection?.hidden,
          }),
        },
        "开始同步"
      );
      if (picked !== "开始同步") {
        return;
      }
    }
    try {
      const settings = getSettings();
      const outcome = await syncToApifox(client, settings, analyzed);
      // 结果面板：汇总计数与本次同步的接口清单（Apifox 只返回聚合计数，不做逐接口状态推断）
      SyncResultPanel.createOrShow(
        buildSyncReport({
          counters: outcome.counters,
          errors: outcome.errors,
          warnings: analyzed.warnings,
          endpoints: analyzed.endpoints,
          target: syncTargetLabel(settings.teamName ?? "", settings.projectName ?? "", settings.projectId),
          projectId: settings.projectId,
          projectUrl: projectWebUrl(settings.apiBaseUrl, settings.projectId),
          scope: options.scopeLabel,
          endpointConflictBehavior: settings.endpointConflictBehavior,
          schemaConflictBehavior: settings.schemaConflictBehavior,
          folderOf: folderKeyForTree,
          workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
        })
      );
      showResult(outcome.message, () => SyncResultPanel.showLast());
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

  const treeProvider = new ApiTreeProvider(analyzeWorkspace, folderKeyForTree, context.workspaceState);

  // 设置中心一次保存会连续更新多个配置项；仅合并真正影响解析结果的变化。
  const treeAnalysisConfigKeys = [
    "apifoxHelper.include",
    "apifoxHelper.exclude",
    "apifoxHelper.pageTypeStyle",
    "apifoxHelper.folderNameSource",
    "apifoxHelper.rootFolderName",
    "apifoxHelper.helperProperties.enabled",
    "apifoxHelper.helperProperties.enumFieldDoc",
    "apifoxHelper.dependencyRepos",
    "apifoxHelper.dependencyJars",
  ];
  let configRefreshTimer: ReturnType<typeof setTimeout> | undefined;
  const scheduleConfigRefresh = () => {
    clearTimeout(configRefreshTimer);
    configRefreshTimer = setTimeout(() => {
      configRefreshTimer = undefined;
      treeProvider.refresh().catch(() => undefined);
    }, 500);
  };

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  const updateStatusBar = () => {
    const s = getSettings();
    const checked = treeProvider.checkedCount;
    if (s.projectId > 0) {
      statusBarItem.text = `$(project) ApiGen: ${s.projectName || s.projectId}${checked > 0 ? ` · $(check) ${checked}` : ""}`;
      statusBarItem.tooltip = `当前绑定项目: ${s.projectName || `ID: ${s.projectId}`}\n所属团队: ${s.teamName || "未记录"}\n点击打开 ApiGen 快捷操作盘`;
    } else {
      statusBarItem.text = `$(warning) ApiGen: 未绑定`;
      statusBarItem.tooltip = "尚未绑定 Apifox 项目，点击进行设置";
    }
    statusBarItem.command = "apifoxHelper.showStatusBarMenu";
    statusBarItem.show();
  };
  updateStatusBar();

  context.subscriptions.push(
    statusBarItem,
    vscode.commands.registerCommand("apifoxHelper.clearToken", async () => {
      const confirm = await vscode.window.showWarningMessage(
        "确定要清除当前保存的 Apifox 访问令牌吗？",
        "确定清除",
        "取消"
      );
      if (confirm === "确定清除") {
        await setToken(secrets, undefined);
        vscode.window.showInformationMessage("已清除访问令牌");
        updateStatusBar();
        treeProvider.fireChanged();
      }
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("apifoxHelper")) {
        treeProvider.setProjectScope(getSettings().projectId);
        updateStatusBar();
        treeProvider.fireChanged();
        if (treeAnalysisConfigKeys.some((key) => e.affectsConfiguration(key))) {
          scheduleConfigRefresh();
        }
      }
    }),
    secrets.onDidChange((e) => {
      if (e.key === "apifoxHelper.token") {
        updateStatusBar();
        treeProvider.fireChanged();
      }
    }),
    new vscode.Disposable(() => {
      clearTimeout(configRefreshTimer);
      clearTimeout(saveRefreshTimer);
    })
  );

  const treeView = vscode.window.createTreeView("apifoxHelper.apiTree", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
    canSelectMany: false,
  });
  const updateTreeStatus = () => {
    const isFiltered = treeProvider.isFiltered();
    void vscode.commands.executeCommand("setContext", "apifoxHelper.isFiltered", isFiltered);
    const selection = treeProvider.getSelectionStats();
    const checked = selection.total;
    const total = treeProvider.allEndpoints().length;
    if (isFiltered) {
      const stats = treeProvider.getFilterStats();
      treeView.description = checked > 0
        ? `"${treeProvider.getFilterKeyword()}" (${stats.count}/${stats.total}) · 可见已选 ${selection.visible}${selection.hidden > 0 ? ` · 隐藏 ${selection.hidden}` : ""}`
        : `"${treeProvider.getFilterKeyword()}" (${stats.count}/${stats.total})`;
    } else if (total > 0) {
      treeView.description = checked > 0 ? `${total} 个接口 · 已勾选 ${checked}` : `${total} 个接口`;
    } else {
      treeView.description = undefined;
    }
  };

  // 目录展开/收起状态记录(刷新后保持用户折叠习惯)
  const recordFolderExpand = (kind: "expand" | "collapse") => (e: vscode.TreeViewExpansionEvent<ApiTreeNode>) => {
    const el = e.element;
    if (el && el.kind === "folder") {
      treeProvider.setFolderUserExpanded(el.key, kind === "expand");
    }
  };

  let treeRefreshDirty = false;
  /** 立即刷新并清除脏标记 */
  const refreshApiTree = () => {
    treeRefreshDirty = false;
    treeProvider.refresh().catch(() => undefined);
  };
  /** 保存 Java 文件后延迟刷新:树不可见时只标记脏,避免大仓无谓解析 */
  const refreshApiTreeIfVisible = () => {
    if (treeView.visible) {
      refreshApiTree();
    } else {
      treeRefreshDirty = true;
    }
  };

  context.subscriptions.push(
    treeView,
    treeView.onDidExpandElement(recordFolderExpand("expand")),
    treeView.onDidCollapseElement(recordFolderExpand("collapse")),
    treeView.onDidChangeVisibility((e) => {
      if (e.visible && treeRefreshDirty) {
        refreshApiTree();
      }
    }),
    treeProvider.onDidChangeTreeData(() => {
      updateTreeStatus();
      updateStatusBar();
    }),
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
    // 保存 Java 文件后自动刷新(防抖 800ms;树不可见时延迟到下次可见再刷)
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.languageId === "java") {
        clearTimeout(saveRefreshTimer);
        saveRefreshTimer = setTimeout(() => {
          refreshApiTreeIfVisible();
        }, 800);
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.refreshApiTree", async () => {
      await vscode.window.withProgress({ location: { viewId: "apifoxHelper.apiTree" } }, () => treeProvider.refresh());
    }),
    vscode.commands.registerCommand("apifoxHelper.filterApi", async () => {
      const current = treeProvider.getFilterKeyword();
      const val = await vscode.window.showInputBox({
        prompt: "输入关键字过滤接口列表 (支持路径、描述、方法、控制器，留空清空)",
        placeHolder: "例如: patient, /list, GET, 导出",
        value: current,
        valueSelection: current ? [0, current.length] : undefined,
      });
      if (val === undefined) {
        return;
      }
      const trimmed = val.trim();
      treeProvider.setFilter(trimmed);
      if (!trimmed && current) {
        vscode.window.showInformationMessage("已清除接口过滤");
      }
      // 命中数已实时显示在树标题 description,不再弹窗打扰
    }),
    vscode.commands.registerCommand("apifoxHelper.clearFilter", () => {
      if (treeProvider.isFiltered()) {
        treeProvider.clearFilter();
        vscode.window.showInformationMessage("已清除接口过滤");
      }
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

      type SearchQuickPickItem = vscode.QuickPickItem & { ep?: EndpointInfo; isFilterAction?: boolean };

      const quickPick = vscode.window.createQuickPick<SearchQuickPickItem>();
      quickPick.placeholder = "搜索接口(路径 / 方法 / 描述 / 控制器)，回车跳转或过滤";
      quickPick.matchOnDescription = true;
      quickPick.matchOnDetail = true;

      const baseItems: SearchQuickPickItem[] = all.map((ep) => ({
        label: `${ep.method}  ${ep.path}`,
        description: ep.summary ?? "",
        detail: `${ep.controller}.${ep.operationId}`,
        ep,
      }));

      const updateItems = (filterText: string) => {
        const trimmed = filterText.trim();
        if (trimmed) {
          const filterActionItem: SearchQuickPickItem = {
            label: `$(filter) 在接口列表中过滤: "${trimmed}"`,
            description: "仅在侧边栏接口列表中保留匹配项",
            alwaysShow: true,
            isFilterAction: true,
          };
          quickPick.items = [filterActionItem, ...baseItems];
        } else {
          quickPick.items = baseItems;
        }
      };

      updateItems("");
      quickPick.onDidChangeValue((value) => {
        updateItems(value);
      });

      quickPick.onDidAccept(() => {
        const selection = quickPick.selectedItems[0];
        if (selection) {
          if (selection.isFilterAction) {
            treeProvider.setFilter(quickPick.value.trim());
            // 命中数已实时显示在树标题 description,不再弹窗打扰
          } else if (selection.ep) {
            vscode.commands.executeCommand("apifoxHelper.gotoEndpoint", selection.ep);
          }
        }
        quickPick.hide();
      });

      quickPick.onDidHide(() => {
        quickPick.dispose();
      });

      quickPick.show();
    }),
    vscode.commands.registerCommand("apifoxHelper.checkAllApis", () => {
      const count = treeProvider.checkAll();
      if (treeProvider.isFiltered()) {
        vscode.window.showInformationMessage(`已勾选当前过滤出的全部 ${count} 个接口`);
      } else {
        vscode.window.showInformationMessage(`已勾选全部 ${count} 个接口`);
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.uncheckAllApis", () => {
      const count = treeProvider.uncheckAll();
      if (treeProvider.isFiltered()) {
        vscode.window.showInformationMessage(`已取消勾选当前过滤出的 ${count} 个接口`);
      } else {
        vscode.window.showInformationMessage("已清空所有勾选的接口");
      }
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
      // 过滤状态下 folder 节点只包含可见接口；命令语义是“整个目录”，因此回到全量树取数。
      // 目录语义含子目录:`测评工作站` 应连带其下 `测评量表-*`
      const endpoints = treeProvider.allEndpoints().filter((ep) => {
        const key = folderKeyForTree(ep);
        return key === node.key || key.startsWith(`${node.key}/`);
      });
      if (!endpoints.length) {
        vscode.window.showWarningMessage("该目录下没有可同步的接口");
        return;
      }
      const wanted = new Set(endpoints.map((e) => `${e.method} ${e.path}`));
      await doSync(`目录「${node.key}」下未发现可同步的接口`, async (token) => {
        const allFiles = await collectFiles(undefined, token);
        if (!allFiles) {
          return undefined;
        }
        return cache.analyzeSubset(allFiles, await analyzeOptions(), (ep) => wanted.has(`${ep.method} ${ep.path}`));
      }, { scopeLabel: `目录「${node.key}」`, confirm: true });
    }),
    vscode.commands.registerCommand("apifoxHelper.syncCheckedApis", async () => {
      const stats = treeProvider.getSelectionStats();
      let checked = treeProvider.getCheckedEndpoints();
      let scopeLabel = "全部已选接口";
      let selection = { visible: stats.visible, hidden: stats.hidden };

      if (treeProvider.isFiltered() && stats.hidden > 0) {
        type CheckedScopeItem = vscode.QuickPickItem & { scope: "visible" | "all" };
        const items: CheckedScopeItem[] = [];
        if (stats.visible > 0) {
          items.push({
            label: `$(filter) 仅同步当前过滤中已选的 ${stats.visible} 个接口`,
            description: `不包含另外 ${stats.hidden} 个隐藏已选项（推荐）`,
            scope: "visible",
          });
        }
        items.push({
          label: `$(check-all) 同步全部已选的 ${stats.total} 个接口`,
          description: `包含当前过滤隐藏的 ${stats.hidden} 个接口`,
          scope: "all",
        });
        const picked = await vscode.window.showQuickPick(items, {
          title: "选择本次同步范围",
          placeHolder: "过滤不会自动取消此前的勾选，请确认本次同步范围",
        });
        if (!picked) {
          return;
        }
        if (picked.scope === "visible") {
          checked = treeProvider.getCheckedEndpoints("visible");
          scopeLabel = "当前过滤中已选接口";
          selection = { visible: checked.length, hidden: 0 };
        }
      }
      if (!checked.length) {
        vscode.window.showInformationMessage("先在接口列表中勾选要同步的接口(接口行前或目录前的复选框)");
        return;
      }
      // 全量上下文解析,只输出勾选接口(与单接口同步同机制)
      const wanted = new Set(checked.map((e) => `${e.method} ${e.path}`));
      await doSync("勾选的接口未在当前解析结果中", async (token) => {
        const allFiles = await collectFiles(undefined, token);
        if (!allFiles) {
          return undefined;
        }
        return cache.analyzeSubset(allFiles, await analyzeOptions(), (ep) => wanted.has(`${ep.method} ${ep.path}`));
      }, { scopeLabel, confirm: true, selection });
    }),
    vscode.commands.registerCommand("apifoxHelper.syncEndpoint", async (node?: ApiTreeNode) => {
      if (!node || node.kind !== "endpoint") {
        return;
      }
      const ep = node.endpoint;
      await doSync(`接口 [${ep.method} ${ep.path}] 未在当前解析结果中`, async (token) => {
        const allFiles = await collectFiles(undefined, token);
        if (!allFiles) {
          return undefined;
        }
        return cache.analyzeSubset(
          allFiles,
          await analyzeOptions(),
          (e) => e.fsPath === ep.fsPath && e.method === ep.method && e.path === ep.path
        );
      }, { scopeLabel: `${ep.method} ${ep.path}` });
    }),
    vscode.commands.registerCommand("apifoxHelper.copyEndpointPath", async (node?: ApiTreeNode) => {
      if (!node || node.kind !== "endpoint") {
        return;
      }
      await vscode.env.clipboard.writeText(node.endpoint.path);
      vscode.window.showInformationMessage(`已复制接口路径: ${node.endpoint.path}`);
    }),
    vscode.commands.registerCommand("apifoxHelper.copyEndpointFull", async (node?: ApiTreeNode) => {
      if (!node || node.kind !== "endpoint") {
        return;
      }
      const text = `${node.endpoint.method} ${node.endpoint.path}`;
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage(`已复制: ${text}`);
    }),
    vscode.commands.registerCommand("apifoxHelper.showStatusBarMenu", async () => {
      const settings = getSettings();
      const items: (vscode.QuickPickItem & { action: () => void })[] = [
        {
          label: "$(cloud-upload) 同步当前文件接口",
          description: "同步当前打开的 Java Controller 接口",
          action: () => vscode.commands.executeCommand("apifoxHelper.syncFile"),
        },
        {
          label: "$(repo-sync) 同步工作区全部接口",
          description: "全量扫描并同步到 Apifox",
          action: () => vscode.commands.executeCommand("apifoxHelper.syncWorkspace"),
        },
        {
          label: "$(check-all) 同步勾选的接口",
          description: "同步侧边栏已勾选的接口",
          action: () => vscode.commands.executeCommand("apifoxHelper.syncCheckedApis"),
        },
        {
          label: "$(search) 搜索接口",
          description: "全局搜索接口并快速跳转或过滤",
          action: () => vscode.commands.executeCommand("apifoxHelper.searchApi"),
        },
        {
          label: "$(project) 切换 Apifox 项目",
          description: `当前: ${settings.projectName || settings.projectId || "未绑定"}`,
          action: () => vscode.commands.executeCommand("apifoxHelper.selectProject"),
        },
        {
          label: "$(table) 查看上次同步结果",
          description: "同步计数与接口清单",
          action: () => vscode.commands.executeCommand("apifoxHelper.showLastSyncResult"),
        },
        {
          label: "$(file-code) 导出 OpenAPI 预览",
          description: "生成 openapi.gen.json 规范文件",
          action: () => vscode.commands.executeCommand("apifoxHelper.exportOpenapi"),
        },
        {
          label: "$(gear) 打开设置中心",
          description: "配置访问令牌、团队、目录规则等",
          action: () => vscode.commands.executeCommand("apifoxHelper.openSettingsPanel"),
        },
      ];

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: `ApiGen for Apifox: 当前项目 [${settings.projectName || settings.projectId || "未绑定"}]`,
      });
      if (picked) {
        picked.action();
      }
    })
  );
  // 初始加载(树视图首次可见时即有数据)
  treeProvider.refresh().catch(() => undefined);

  const openSettings = () => {
    SettingsPanel.createOrShow(secrets, () => {
      treeProvider.setProjectScope(getSettings().projectId);
      updateStatusBar();
      treeProvider.fireChanged();
    });
  };

  // 命令:打开 Webview 设置中心表单面板
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.openSettingsPanel", openSettings)
  );

  // 命令:查看上次同步结果(面板关掉后可重新打开)
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.showLastSyncResult", () => SyncResultPanel.showLast())
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
      treeProvider.fireChanged();
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
        treeProvider.setProjectScope(getSettings().projectId);
        updateStatusBar();
      }
    })
  );

  // 命令:同步整个项目
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.syncWorkspace", async () => {
      await doSync(
        "没有扫描到任何 Java 源文件",
        (token) => analyzeWorkspace(undefined, token),
        { scopeLabel: "整个工作区", confirm: true }
      );
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
      await doSync("该文件中未发现 REST 接口(@RestController/@Controller/@FeignClient/@Path)", async (token) => {
        const allFiles = await collectFiles(undefined, token, target);
        if (!allFiles) {
          return undefined;
        }
        return cache.analyzeSubset(allFiles, await analyzeOptions(), (ep) => ep.fsPath === target.fsPath || ep.ownerFsPath === target.fsPath);
      }, { scopeLabel: `当前文件 ${path.basename(target.fsPath)}` });
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
      await doSync("未发现可同步的接口", async (token) => {
        const allFiles = await collectFiles(undefined, token, target);
        const source = allFiles ?? files;
        return cache.analyzeSubset(source, await analyzeOptions(), (ep) => ep.fsPath === endpoint.fsPath && ep.method === endpoint.method && ep.path === endpoint.path);
      }, { scopeLabel: `${endpoint.method} ${endpoint.path}` });
    })
  );

  // 命令:导出 OpenAPI 预览
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.exportOpenapi", async () => {
      const files = await collectFiles();
      if (!files) {
        return;
      }
      const analyzed = cache.analyze(files, await analyzeOptions());
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
        if (!settings.enableCodeLens) {
          return [];
        }
        const root = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
        if (root && isInHiddenDirectory(path.dirname(document.uri.fsPath), root)) {
          return [];
        }
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
                title: "$(cloud-upload) 同步此接口到 Apifox",
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
  return expandBraces(glob).some((g) => {
    const re = new RegExp(
      "^" +
        g
          .replace(/[.+^${}()|[\]\\]/g, "\\$&")
          .replace(/\*\*/g, "\u0000")
          .replace(/\*/g, "[^/]*")
          .replace(/\u0000/g, ".*")
          .replace(/\?/g, ".") +
        "$"
    );
    return re.test(relPath);
  });
}

/** 展开 {a,b} 花括号(vscode 的 include/exclude glob 支持该语法,递归处理嵌套) */
function expandBraces(pattern: string): string[] {
  const m = /\{([^{}]+)\}/.exec(pattern);
  if (!m) {
    return [pattern];
  }
  const [full, body] = m;
  return body
    .split(",")
    .flatMap((alt) => expandBraces(pattern.slice(0, m.index) + alt + pattern.slice(m.index + full.length)));
}

let helperOutputChannel: vscode.OutputChannel | undefined;

function getHelperOutputChannel(): vscode.OutputChannel {
  if (!helperOutputChannel) {
    helperOutputChannel = vscode.window.createOutputChannel("ApiGen for Apifox");
  }
  return helperOutputChannel;
}

function showResult(message: string, onOpenReport?: () => void): void {
  const lines = message.split("\n").map((s) => s.trim()).filter(Boolean);
  const summary = lines[0] || "同步完成";
  const hasDetails = lines.length > 1;
  const hasWarningsOrErrors = lines.slice(1).some((l) => l.startsWith("⚠") || l.includes("失败") || l.includes("错误"));

  if (hasDetails) {
    const channel = getHelperOutputChannel();
    channel.clear();
    channel.appendLine(`[${new Date().toLocaleTimeString()}] Apifox 同步结果:`);
    for (const l of lines) {
      channel.appendLine(l);
    }
  }

  const buttons: string[] = [];
  if (onOpenReport) {
    buttons.push("查看结果表");
  }
  if (hasDetails) {
    buttons.push("查看日志");
  }

  const picked = hasWarningsOrErrors
    ? vscode.window.showWarningMessage(summary, ...buttons)
    : vscode.window.showInformationMessage(summary, ...buttons);

  void picked.then((action) => {
    if (action === "查看日志") {
      getHelperOutputChannel().show(true);
    } else if (action === "查看结果表") {
      onOpenReport?.();
    }
  });
}

export function deactivate(): void {}

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ApifoxClient } from "./apifox/client";
import { errorMessage, ensureToken, selectProject, syncToApifox } from "./apifox/uploader";
import { setToken } from "./config/secret";
import { getSettings, getProjectBinding, saveProjectId } from "./config/settings";
import type { ApifoxSettings } from "./config/settings";
import {
  apiFolderKey,
  detectProjectFolders,
  endpointSelectionKey,
  planProjectBindingMigration,
  resolveExportPath,
  treeFolderKey,
  workspaceFolderForPath,
} from "./config/workspaceScopes";
import { HelperProperties, loadPropertiesFiles } from "./config/helperProperties";
import { fileSetFingerprint } from "./config/fileFingerprint";
import { EndpointInfo, SourceFile } from "./java/model";
import { ApiTreeNode, ApiTreeProvider } from "./providers/ApiTreeProvider";
import { SettingsPanel } from "./views/SettingsPanel";
import { SyncResultPanel } from "./views/SyncResultPanel";
import { AnalyzeCache, AnalyzeOutput, endpointAt } from "./pipeline";
import { discoverMavenRepos, JarClassIndex, parsePomDependencies, resolveDependencyJars } from "./java/jarIndex";
import { createGitEntryProbe, findNestedCheckoutRoot, isInHiddenDirectory, isSkippedCheckout } from "./java/scanScope";
import { buildSyncPreflightDetail, syncTargetLabel } from "./ui/syncPreflight";
import { buildSyncReport, projectWebUrl } from "./ui/syncResult";

const cache = new AnalyzeCache();

/** 一个工作区文件夹对应的解析/同步作用域 */
interface ProjectScope {
  folder: vscode.WorkspaceFolder;
  key: string;
  label: string;
  index: number;
}

let projectScopesCache: { key: string; scopes: ProjectScope[] } | undefined;

/** 工作区文件夹增删/构建文件变化后失效 */
function invalidateProjectScopes(): void {
  projectScopesCache = undefined;
}

/** 识别含 pom.xml / build.gradle(.kts) 的工作区文件夹(都没有时退回全部) */
function currentProjectScopes(): ProjectScope[] {
  const folders = vscode.workspace.workspaceFolders ?? [];
  const cacheKey = folders.map((folder) => folder.uri.fsPath).join("\n");
  if (projectScopesCache?.key === cacheKey) {
    return projectScopesCache.scopes;
  }
  const scopes = detectProjectFolders(
    folders.map((folder, index) => ({ name: folder.name, fsPath: folder.uri.fsPath, index })),
    (candidate) => fs.existsSync(candidate)
  ).map((detected) => ({
    folder: folders[detected.index],
    key: detected.key,
    label: detected.label,
    index: detected.index,
  }));
  projectScopesCache = { key: cacheKey, scopes };
  return scopes;
}

function scopeForPath(fsPath: string): ProjectScope | undefined {
  return workspaceFolderForPath(fsPath, currentProjectScopes());
}

function scopeForUri(uri: vscode.Uri): ProjectScope | undefined {
  return scopeForPath(uri.fsPath);
}

function scopeKeyOfEndpoint(ep: EndpointInfo): string {
  return scopeForPath(ep.fsPath)?.key ?? currentProjectScopes()[0]?.key ?? "";
}

function endpointKeyOf(ep: EndpointInfo): string {
  return endpointSelectionKey(scopeKeyOfEndpoint(ep), ep);
}

/** 侧边栏多根分组用的目录 key;单根保持原目录路径(不含工作区名前缀) */
function treeFolderKeyOf(ep: { tag: string; controller: string; fsPath?: string }): string {
  const scope = ep.fsPath ? scopeForPath(ep.fsPath) : currentProjectScopes()[0];
  const settings = getSettings(scope?.folder.uri);
  const apiFolder = apiFolderKey(settings, ep);
  return treeFolderKey(scope?.label ?? "工作区", apiFolder, currentProjectScopes().length > 1);
}

/** 当前各文件夹的勾选作用域(文件夹 + 项目绑定) */
function bindingScopesForTree(): { folderKey: string; projectId: number; label: string; projectName: string; teamName: string }[] {
  const scopes = currentProjectScopes();
  if (!scopes.length) {
    const settings = getSettings();
    return [{ folderKey: "", projectId: settings.projectId, label: "工作区", projectName: settings.projectName ?? "", teamName: settings.teamName ?? "" }];
  }
  return scopes.map((scope) => {
    const settings = getSettings(scope.folder.uri);
    return {
      folderKey: scope.key,
      projectId: settings.projectId,
      label: scope.label,
      projectName: settings.projectName ?? "",
      teamName: settings.teamName ?? "",
    };
  });
}

/**
 * 依赖 jar 索引的会话级缓存:jar 文件集合与内容指纹未变时直接复用,
 * 避免每次保存 Java 文件刷新树都同步重读一遍 jar(大仓下保存后会卡一下)。
 * 显式 jar / 额外仓库目录配置变化、任一匹配 jar 的 mtime/size 变化即失效。
 */
let jarIndexCache = new Map<string, { key: string; index: JarClassIndex | undefined }>();
/** 最近一次 jar 索引指纹(按作用域),参与 AnalyzeCache 结果级缓存键;jar 变化时分析结果需重算 */
let activeJarIndexKeys = new Map<string, string>();

const MAX_POMS = 200;

/**
 * Maven 仓库发现结果与工作区 pom.xml 列表的会话缓存:
 * dependencyRepos / 工作区根未变时不再重复扫描 IDEA 配置、读取 ~/.m2 或 findFiles。
 * pom 路径由文件监听器在新增/删除/改名时失效;内容变化不影响路径列表,坐标仍每次重读。
 */
let mavenReposCache: { key: string; repos: string[] } | undefined;
let pomFilesCache = new Map<string, { key: string; files: vscode.Uri[] }>();

async function cachedMavenRepos(configured: string[]): Promise<string[]> {
  const key = configured.join("\n");
  if (mavenReposCache?.key === key) {
    return mavenReposCache.repos;
  }
  const repos = await discoverMavenRepos(configured);
  mavenReposCache = { key, repos };
  return repos;
}

async function cachedPomFiles(scope?: ProjectScope): Promise<vscode.Uri[]> {
  const scopeKey = scope?.key ?? "all";
  const key = (vscode.workspace.workspaceFolders ?? []).map((folder) => folder.uri.fsPath).join("\n");
  const cached = pomFilesCache.get(scopeKey);
  if (cached?.key === key) {
    return cached.files;
  }
  const files = scope
    ? await vscode.workspace.findFiles(new vscode.RelativePattern(scope.folder, "**/pom.xml"), "**/target/**", MAX_POMS)
    : await vscode.workspace.findFiles("**/pom.xml", "**/target/**", MAX_POMS);
  pomFilesCache.set(scopeKey, { key, files });
  return files;
}

/** pom.xml 新增/删除/改名后失效路径列表缓存;内容变化无需失效(坐标每次重读) */
function invalidatePomFilesCache(): void {
  pomFilesCache.clear();
}

/**
 * rules 文件的会话缓存:路径集合 + 各文件 size/mtime 未变时直接复用解析结果,
 * 避免每次保存 Java 文件刷新树都逐文件重读。properties.additional 已加载/已引用的
 * 文件一并纳入指纹,引用文件变化或缺失文件重新出现时同样失效。
 */
let helperPropertiesCache = new Map<string, { key: string; props: HelperProperties }>();

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
async function buildJarClassIndex(settings: ApifoxSettings, scope?: ProjectScope): Promise<JarClassIndex | undefined> {
  const cacheKeyScope = scope?.key ?? "all";
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
  const repos = await cachedMavenRepos(settings.dependencyRepos);
  if (repos.length) {
    const poms = await cachedPomFiles(scope);
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
      const { jars: resolved, warnings: depWarnings } = await resolveDependencyJars(repos, coords, {
        maxJars: settings.maxDependencyJars,
      });
      if (depWarnings.length) {
        vscode.window.showWarningMessage(`ApiGen for Apifox:${depWarnings.join(";")}`);
      }
      jars.push(...resolved);
    }
  }
  // jar 集合与文件指纹未变时复用会话缓存,大仓保存刷新不再同步重读
  const key = jarIndexCacheKey(configSignature, jars);
  activeJarIndexKeys.set(cacheKeyScope, key);
  const cached = jarIndexCache.get(cacheKeyScope);
  if (cached && cached.key === key) {
    return cached.index;
  }
  // 索引持有各 jar 的 fd,被替换前先释放
  cached?.index?.dispose();
  if (!jars.length) {
    jarIndexCache.set(cacheKeyScope, { key, index: undefined });
    return undefined;
  }
  const idx = JarClassIndex.build(jars);
  const result = idx.size ? idx : undefined;
  if (!result) {
    idx.dispose();
  }
  jarIndexCache.set(cacheKeyScope, { key, index: result });
  return result;
}

/** 找到工作区/指定文件夹内的 .apifox-helper.properties 并读取(整包同步/导出用) */
async function loadHelperProperties(settings: ApifoxSettings, scope?: ProjectScope): Promise<HelperProperties | undefined> {
  const cacheKeyScope = scope?.key ?? "all";
  if (!settings.helperProperties) {
    helperPropertiesCache.delete(cacheKeyScope);
    return undefined;
  }
  // 隐藏目录/副本内的同名 rules 会因路径更深而覆盖工作区根配置,先剔除
  const uris = withoutIgnoredSources(
    scope
      ? await vscode.workspace.findFiles(
          new vscode.RelativePattern(scope.folder, "**/.apifox-helper.properties"),
          "**/node_modules/**",
          100
        )
      : await vscode.workspace.findFiles("**/.apifox-helper.properties", "**/node_modules/**", 100)
  );
  const paths = uris.map((uri) => uri.fsPath.replace(/\\/g, "/"));
  if (!paths.length) {
    helperPropertiesCache.delete(cacheKeyScope);
    return undefined;
  }
  const cached = helperPropertiesCache.get(cacheKeyScope);
  // 指纹含上次 properties.additional 已加载/已引用的文件:引用文件新增或变化都会重新读取
  const watched = new Set(paths);
  for (const file of cached?.props.watchedFiles ?? cached?.props.files ?? []) {
    watched.add(file);
  }
  const cacheKey = fileSetFingerprint(watched);
  if (cached?.key === cacheKey) {
    return cached.props;
  }
  const contents: { path: string; content: string }[] = [];
  let readAll = true;
  for (const uri of uris) {
    try {
      contents.push({ path: uri.fsPath.replace(/\\/g, "/"), content: await fs.promises.readFile(uri.fsPath, "utf8") });
    } catch {
      // 忽略不可读文件;本次不写缓存,下次刷新重试
      readAll = false;
    }
  }
  if (!contents.length) {
    helperPropertiesCache.delete(cacheKeyScope);
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
  if (readAll) {
    helperPropertiesCache.set(cacheKeyScope, { key: fileSetFingerprint([...paths, ...(props.watchedFiles ?? props.files)]), props });
  } else {
    helperPropertiesCache.delete(cacheKeyScope);
  }
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
  // 扩展停用时释放 jar 索引持有的 fd 并清空会话缓存
  context.subscriptions.push({
    dispose: () => {
      for (const cached of jarIndexCache.values()) {
        cached.index?.dispose();
      }
      jarIndexCache.clear();
      activeJarIndexKeys.clear();
      mavenReposCache = undefined;
      pomFilesCache.clear();
      helperPropertiesCache.clear();
      invalidateProjectScopes();
    },
  });

  // pom.xml / Gradle 构建文件变化时失效路径列表与项目文件夹识别
  const pomWatcher = vscode.workspace.createFileSystemWatcher("**/{pom.xml,build.gradle,build.gradle.kts}");
  const invalidateBuildFiles = () => {
    invalidatePomFilesCache();
    invalidateProjectScopes();
  };
  context.subscriptions.push(
    pomWatcher,
    pomWatcher.onDidCreate(invalidateBuildFiles),
    pomWatcher.onDidDelete(invalidateBuildFiles)
  );

  const makeClient = async (scope?: ProjectScope): Promise<ApifoxClient | undefined> => {
    const settings = getSettings(scope?.folder.uri);
    const token = await ensureToken(secrets);
    if (!token) {
      return undefined;
    }
    if (!settings.projectId) {
      const ok = await selectProject(new ApifoxClient(settings.apiBaseUrl, token), scope?.folder);
      if (!ok) {
        return undefined;
      }
    }
    return new ApifoxClient(settings.apiBaseUrl, token);
  };

  /** 收集要分析的 Java 文件;scope 限定工作区文件夹,singleFile 限定为一个文件 */
  const collectFiles = async (
    singleFile?: vscode.Uri,
    token?: vscode.CancellationToken,
    keepCheckoutOf?: vscode.Uri,
    scope?: ProjectScope
  ): Promise<SourceFile[] | undefined> => {
    const settings = getSettings(scope?.folder.uri);
    let uris: vscode.Uri[];
    if (singleFile) {
      uris = [singleFile];
    } else {
      const MAX_FILES = 5000;
      const include = `{${settings.include.join(",")}}`;
      const exclude = `{${settings.exclude.join(",")}}`;
      uris = scope
        ? await vscode.workspace.findFiles(new vscode.RelativePattern(scope.folder, include), new vscode.RelativePattern(scope.folder, exclude), MAX_FILES)
        : await vscode.workspace.findFiles(include, exclude, MAX_FILES);
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

  const analyzeOptions = async (scope?: ProjectScope) => {
    const settings = getSettings(scope?.folder.uri);
    const rootFolder = settings.rootFolderName.trim();
    const jarIndex = await buildJarClassIndex(settings, scope);
    const cacheScope = scope?.key ?? "all";
    return {
      title: scope?.label ?? vscode.workspace.name ?? "API",
      pageStyle: settings.pageTypeStyle,
      rules: await loadHelperProperties(settings, scope),
      enumFieldDoc: settings.enumFieldDoc,
      // 目录命名与依赖 jar 索引无法从源码派生,纳入结果缓存键,避免设置变化后复用旧结果
      cacheKey: [cacheScope, settings.folderNameSource, rootFolder, settings.enumFieldDoc, activeJarIndexKeys.get(cacheScope) ?? ""].join("\u0000"),
      // 接口目录(x-apifox-folder):folderNameSource=controller 用类名,否则 tag;rootFolderName 作前缀
      folderOf: (ep: { tag: string; controller: string }) => apiFolderKey(settings, ep),
      // 框架类识别:源码未覆盖的类型按需从依赖 jar 的 .class 解析
      jarLookup: jarIndex ? (name: string) => jarIndex.lookup(name) : undefined,
    };
  };

  /** 解析单个工作区文件夹(同步/导出按文件夹执行) */
  const analyzeScope = async (
    scope: ProjectScope | undefined,
    token?: vscode.CancellationToken,
    endpointFilter?: (ep: EndpointInfo) => boolean
  ): Promise<AnalyzeOutput | undefined> => {
    const files = await collectFiles(undefined, token, undefined, scope);
    if (token?.isCancellationRequested || !files) {
      return undefined;
    }
    const options = await analyzeOptions(scope);
    return endpointFilter ? cache.analyzeSubset(files, options, endpointFilter) : cache.analyze(files, options);
  };

  /** 接口树用:逐个文件夹解析并合并接口(展示层保持按文件夹分组) */
  const analyzeWorkspace = async (): Promise<AnalyzeOutput | undefined> => {
    const scopes = currentProjectScopes();
    if (!scopes.length) {
      return undefined;
    }
    const outputs: AnalyzeOutput[] = [];
    for (const scope of scopes) {
      const output = await analyzeScope(scope);
      if (output?.endpoints.length) {
        outputs.push(output);
      }
    }
    if (!outputs.length) {
      vscode.window.showWarningMessage("没有扫描到任何 Java 源文件(检查工作区文件夹与 include/exclude 配置)");
      return undefined;
    }
    return {
      spec: outputs[0].spec,
      endpoints: outputs.flatMap((output) => output.endpoints),
      warnings: [...new Set(outputs.flatMap((output) => output.warnings))],
    };
  };

  type SyncOptions = {
    scopeLabel: string;
    confirm?: boolean;
    selection?: { visible: number; hidden: number };
    scope?: ProjectScope;
  };

  /** 同步一组接口(整包/单文件/单接口共用):先校验账号项目,再解析、确认并上传。 */
  const doSync = async (
    emptyHint: string,
    prepare: (token?: vscode.CancellationToken) => Promise<AnalyzeOutput | undefined>,
    options: SyncOptions
  ) => {
    const scope = options.scope ?? currentProjectScopes()[0];
    // 配置不完整时先引导配置，避免用户等待全量扫描后才发现无法同步。
    const client = await makeClient(scope);
    if (!client) {
      return;
    }
    const analyzed = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: "ApiGen for Apifox: 解析 Java 源码与依赖索引...", cancellable: true },
      (progress, token) => {
        progress.report({ message: scope ? `扫描 ${scope.label} 的 Java 文件...` : "扫描 Java 文件..." });
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
    const settings = getSettings(scope?.folder.uri);
    if (options.confirm) {
      const picked = await vscode.window.showWarningMessage(
        scope ? `确认把「${scope.label}」的接口同步到 Apifox？` : "确认批量同步到 Apifox？",
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
          scope: scope && currentProjectScopes().length > 1 ? `${scope.label} · ${options.scopeLabel}` : options.scopeLabel,
          endpointConflictBehavior: settings.endpointConflictBehavior,
          schemaConflictBehavior: settings.schemaConflictBehavior,
          folderOf: treeFolderKeyOf,
          workspaceRoot: scope?.folder.uri.fsPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
        })
      );
      showResult(outcome.message, () => SyncResultPanel.showLast());
    } catch (err) {
      vscode.window.showErrorMessage(`同步失败:${errorMessage(err)}`);
    }
  };

  /* ---------- 侧边栏「接口列表」树 ---------- */
  let saveRefreshTimer: ReturnType<typeof setTimeout> | undefined;

  const treeProvider = new ApiTreeProvider(
    analyzeWorkspace,
    treeFolderKeyOf,
    context.workspaceState,
    scopeKeyOfEndpoint,
    bindingScopesForTree
  );

  /** 多根工作区下让用户选择要操作的文件夹(单根时直接返回) */
  const pickProjectScope = async (title: string): Promise<ProjectScope | undefined> => {
    const scopes = currentProjectScopes();
    if (scopes.length <= 1) {
      return scopes[0];
    }
    const active = vscode.window.activeTextEditor ? scopeForUri(vscode.window.activeTextEditor.document.uri) : undefined;
    type ScopeItem = vscode.QuickPickItem & { scope: ProjectScope };
    const items: ScopeItem[] = scopes.map((scope) => {
      const settings = getSettings(scope.folder.uri);
      return {
        label: `$(folder) ${scope.label}`,
        description: settings.projectId > 0 ? `已绑定 ${settings.projectName || `项目 ${settings.projectId}`}` : "未绑定项目",
        detail: scope.folder.uri.fsPath,
        scope,
      };
    });
    const picked = await vscode.window.showQuickPick(items, {
      title,
      placeHolder: active ? `当前文件所在文件夹: ${active.label}` : "请选择工作区文件夹",
    });
    return picked?.scope;
  };

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
    const scopes = currentProjectScopes();
    const checked = treeProvider.checkedCount;
    if (scopes.length > 1) {
      const bindings = scopes.map((scope) => ({ scope, settings: getSettings(scope.folder.uri) }));
      const bound = bindings.filter((item) => item.settings.projectId > 0);
      statusBarItem.text = `$(project) ApiGen: ${bound.length}/${scopes.length} 个文件夹已绑定${checked > 0 ? ` · $(check) ${checked}` : ""}`;
      statusBarItem.tooltip = [
        "当前工作区按文件夹绑定 Apifox 项目:",
        ...bindings.map(({ scope: itemScope, settings }) =>
          `${itemScope.label}: ${settings.projectId > 0 ? settings.projectName || `ID: ${settings.projectId}` : "未绑定"}`
        ),
        "点击打开 ApiGen 快捷操作盘",
      ].join("\n");
    } else {
      const s = getSettings(scopes[0]?.folder.uri);
      if (s.projectId > 0) {
        statusBarItem.text = `$(project) ApiGen: ${s.projectName || s.projectId}${checked > 0 ? ` · $(check) ${checked}` : ""}`;
        statusBarItem.tooltip = `当前绑定项目: ${s.projectName || `ID: ${s.projectId}`}\n所属团队: ${s.teamName || "未记录"}\n点击打开 ApiGen 快捷操作盘`;
      } else {
        statusBarItem.text = `$(warning) ApiGen: 未绑定`;
        statusBarItem.tooltip = "尚未绑定 Apifox 项目，点击进行设置";
      }
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
        treeProvider.setProjectScopes(bindingScopesForTree());
        updateStatusBar();
        treeProvider.fireChanged();
        if (treeAnalysisConfigKeys.some((key) => e.affectsConfiguration(key))) {
          scheduleConfigRefresh();
        }
      }
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      pomFilesCache.clear();
      invalidateProjectScopes();
      treeProvider.setProjectScopes(bindingScopesForTree());
      updateStatusBar();
      treeProvider.refresh().catch(() => undefined);
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
        const key = treeFolderKeyOf(ep);
        return key === node.key || key.startsWith(`${node.key}/`);
      });
      if (!endpoints.length) {
        vscode.window.showWarningMessage("该目录下没有可同步的接口");
        return;
      }
      const scope = scopeForPath(endpoints[0].fsPath);
      const wanted = new Set(endpoints.map((ep) => endpointKeyOf(ep)));
      await doSync(`目录「${node.key}」下未发现可同步的接口`, async (token) =>
        analyzeScope(scope, token, (ep) => wanted.has(endpointKeyOf(ep))),
      { scope, scopeLabel: `目录「${node.key}」`, confirm: true });
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
      // 勾选项可能来自多个工作区文件夹:按文件夹分别解析、分别导入各自绑定的项目
      const scopes = currentProjectScopes();
      let anyGroup = false;
      for (const scope of scopes) {
        const group = checked.filter((ep) => scopeKeyOfEndpoint(ep) === scope.key);
        if (!group.length) {
          continue;
        }
        anyGroup = true;
        const wanted = new Set(group.map((ep) => endpointKeyOf(ep)));
        const groupSelection = scopes.length > 1 ? undefined : selection;
        await doSync("勾选的接口未在当前解析结果中", async (token) =>
          analyzeScope(scope, token, (ep) => wanted.has(endpointKeyOf(ep))),
        { scope, scopeLabel, confirm: true, selection: groupSelection });
      }
      if (!anyGroup) {
        vscode.window.showWarningMessage("勾选的接口未归属任何工作区文件夹,请刷新接口列表后重试");
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.syncEndpoint", async (node?: ApiTreeNode) => {
      if (!node || node.kind !== "endpoint") {
        return;
      }
      const ep = node.endpoint;
      const scope = scopeForPath(ep.fsPath);
      const wanted = endpointKeyOf(ep);
      await doSync(`接口 [${ep.method} ${ep.path}] 未在当前解析结果中`, async (token) =>
        analyzeScope(scope, token, (e) => endpointKeyOf(e) === wanted),
      { scope, scopeLabel: `${ep.method} ${ep.path}` });
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
      const activeUri = vscode.window.activeTextEditor?.document.uri;
      const settings = getSettings(activeUri ? scopeForUri(activeUri)?.folder.uri : currentProjectScopes()[0]?.folder.uri);
      const scopes = currentProjectScopes();
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
          description: scopes.length > 1
            ? `${scopes.length} 个文件夹按文件夹绑定`
            : `当前: ${settings.projectName || settings.projectId || "未绑定"}`,
          action: () => vscode.commands.executeCommand("apifoxHelper.selectProject"),
        },
        ...(scopes.length > 1
          ? [{
              label: "$(arrow-right) 迁移旧的工作区级项目绑定到各文件夹",
              description: "把单根工作区的项目配置复制到尚未单独绑定的文件夹",
              action: () => vscode.commands.executeCommand("apifoxHelper.migrateFolderProjectBindings"),
            }]
          : []),
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
        placeHolder: scopes.length > 1
          ? `ApiGen for Apifox: ${scopes.length} 个工作区文件夹(按文件夹绑定项目)`
          : `ApiGen for Apifox: 当前项目 [${settings.projectName || settings.projectId || "未绑定"}]`,
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
      treeProvider.setProjectScopes(bindingScopesForTree());
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

  // 命令:选择项目(多根工作区先选择要绑定的文件夹)
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.selectProject", async () => {
      const scope = await pickProjectScope("选择要绑定 Apifox 项目的工作区文件夹");
      if (!scope) {
        return;
      }
      const settings = getSettings(scope.folder.uri);
      const token = await ensureToken(secrets);
      if (!token) {
        return;
      }
      const ok = await selectProject(new ApifoxClient(settings.apiBaseUrl, token), scope.folder);
      if (ok) {
        treeProvider.setProjectScopes(bindingScopesForTree());
        updateStatusBar();
      }
    }),
    vscode.commands.registerCommand("apifoxHelper.migrateFolderProjectBindings", async () => {
      const scopes = currentProjectScopes();
      if (scopes.length < 2) {
        vscode.window.showInformationMessage("当前是单根工作区,项目绑定已直接作为工作区配置生效,无需迁移");
        return;
      }
      const legacy = getProjectBinding();
      const folderBindings = Object.fromEntries(scopes.map((scope) => [scope.key, getProjectBinding(scope.folder.uri)]));
      const plan = planProjectBindingMigration(
        scopes.map((scope) => ({ key: scope.key, label: scope.label })),
        folderBindings,
        legacy
      );
      if (!plan.length) {
        vscode.window.showInformationMessage("没有需要迁移的项目绑定(各文件夹已设置独立绑定,或旧绑定为空)");
        return;
      }
      const confirm = await vscode.window.showWarningMessage(
        `将旧的工作区级项目绑定复制到 ${plan.length} 个文件夹？`,
        { modal: true, detail: plan.map((item) => `${item.label} → ${item.binding.projectName || `项目 ${item.binding.projectId}`}`).join("\n") },
        "开始迁移"
      );
      if (confirm !== "开始迁移") {
        return;
      }
      for (const item of plan) {
        const scope = scopes.find((candidate) => candidate.key === item.folderKey);
        if (!scope) {
          continue;
        }
        await saveProjectId(item.binding.projectId, item.binding.projectName, item.binding.teamName, scope.folder);
      }
      treeProvider.setProjectScopes(bindingScopesForTree());
      updateStatusBar();
      treeProvider.fireChanged();
      vscode.window.showInformationMessage(`已将项目绑定迁移到 ${plan.length} 个文件夹`);
    })
  );

  // 命令:同步整个项目(多根工作区按文件夹分别导入各自项目)
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.syncWorkspace", async () => {
      const scopes = currentProjectScopes();
      if (!scopes.length) {
        vscode.window.showWarningMessage("没有扫描到任何 Java 源文件");
        return;
      }
      for (const scope of scopes) {
        await doSync(
          `文件夹「${scope.label}」没有扫描到任何 Java 源文件`,
          (token) => analyzeScope(scope, token),
          { scope, scopeLabel: "整个工作区", confirm: true }
        );
      }
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
      const scope = scopeForUri(target);
      // 用该文件夹的全量源码做类型解析,只输出该文件的接口(单文件解析会丢失跨文件 DTO)
      await doSync("该文件中未发现 REST 接口(@RestController/@Controller/@FeignClient/@Path)", async (token) =>
        analyzeScope(scope, token, (ep) => ep.fsPath === target.fsPath || ep.ownerFsPath === target.fsPath),
      { scope, scopeLabel: `当前文件 ${path.basename(target.fsPath)}` });
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
      const scope = scopeForUri(target);
      const files = await collectFiles(target, undefined, undefined, scope);
      if (!files?.length) {
        return;
      }
      const allEndpoints = cache.endpointsOfFile(files[0].fsPath, files[0].content);
      const endpoint = endpointAt(allEndpoints, files[0].fsPath, pos);
      if (!endpoint) {
        vscode.window.showWarningMessage("光标附近未发现 REST 接口方法");
        return;
      }
      // 用该文件夹的全量上下文解析类型,只输出该接口
      await doSync("未发现可同步的接口", async (token) => {
        const analyzed = await analyzeScope(scope, token, (ep) => endpointKeyOf(ep) === endpointKeyOf(endpoint));
        return analyzed ?? cache.analyzeSubset(files, await analyzeOptions(scope), (ep) => endpointKeyOf(ep) === endpointKeyOf(endpoint));
      }, { scope, scopeLabel: `${endpoint.method} ${endpoint.path}` });
    })
  );

  // 命令:导出 OpenAPI 预览(多根工作区按文件夹分别导出到各自目录)
  context.subscriptions.push(
    vscode.commands.registerCommand("apifoxHelper.exportOpenapi", async () => {
      const scopes = currentProjectScopes();
      const exported: { path: string; endpoints: number; warnings: number }[] = [];
      for (const scope of scopes) {
        const analyzed = await analyzeScope(scope);
        if (!analyzed) {
          continue;
        }
        const settings = getSettings(scope.folder.uri);
        const outPath = resolveExportPath(scope.folder.uri.fsPath, settings.exportPath);
        await fs.promises.writeFile(outPath, JSON.stringify(analyzed.spec, null, 2), "utf8");
        exported.push({ path: outPath, endpoints: analyzed.endpoints.length, warnings: analyzed.warnings.length });
      }
      if (!exported.length) {
        vscode.window.showWarningMessage("没有扫描到任何 Java 源文件,未导出 OpenAPI");
        return;
      }
      const first = exported[0];
      const summary = exported.length > 1
        ? `已按 ${exported.length} 个文件夹导出 OpenAPI:${exported.map((item) => `${path.basename(item.path)}(${item.endpoints} 个接口)`).join("、")}`
        : `已导出 ${first.endpoints} 个接口到 ${path.basename(first.path)}(解析告警 ${first.warnings} 条)`;
      const action = await vscode.window.showInformationMessage(summary, "打开文件");
      if (action === "打开文件") {
        const doc = await vscode.workspace.openTextDocument(first.path);
        await vscode.window.showTextDocument(doc);
      }
    })
  );

  // CodeLens:接口方法上方「同步此接口」
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: "java" }, {
      provideCodeLenses(document) {
        const settings = getSettings(vscode.workspace.getWorkspaceFolder(document.uri)?.uri ?? document.uri);
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

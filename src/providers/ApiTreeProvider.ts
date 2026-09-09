import * as vscode from "vscode";
import { EndpointInfo } from "../java/model";
import { getSettings } from "../config/settings";

/**
 * 侧边栏「接口列表」树:
 * - 顶部置顶项:当前绑定的项目与团队(点击直达设置中心)
 * - 目录(按 folderKey/tag 分组)→ 接口(方法+路径)
 * - 点击接口跳转到源码定义
 * - 勾选接口后可用标题栏「同步勾选的接口」批量同步
 * - 数据来自与同步一致的解析管线(含规则/jar 识别),保证所见即所同步
 */

export type ApiTreeNode =
  | { kind: "banner"; projectId: number; projectName: string; teamName: string }
  | { kind: "searchBar"; keyword: string; count: number; total: number }
  | { kind: "empty"; message: string }
  | { kind: "folder"; key: string; endpoints: EndpointInfo[] }
  | { kind: "endpoint"; endpoint: EndpointInfo };

const METHOD_ICON: Record<string, { id: string; color: string }> = {
  GET: { id: "arrow-small-right", color: "testing.iconPassed" },
  POST: { id: "plus", color: "charts.blue" },
  PUT: { id: "edit", color: "charts.orange" },
  PATCH: { id: "diff", color: "charts.purple" },
  DELETE: { id: "trash", color: "testing.iconFailed" },
};

/** 关键字匹配高亮区间计算(纯函数,可单测) */
export function computeHighlights(text: string, tokens: string[]): [number, number][] {
  if (!text || !tokens.length) {
    return [];
  }
  const lower = text.toLowerCase();
  const ranges: [number, number][] = [];
  for (const token of tokens) {
    if (!token) {
      continue;
    }
    let idx = 0;
    while ((idx = lower.indexOf(token, idx)) !== -1) {
      ranges.push([idx, idx + token.length]);
      idx += token.length;
    }
  }
  if (!ranges.length) {
    return [];
  }
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: [number, number][] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = ranges[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

/** 接口是否匹配全部过滤词(纯函数,可单测) */
export function matchEndpoint(ep: EndpointInfo, folderKey: string, tokens: string[]): boolean {
  if (!tokens.length) {
    return true;
  }
  const searchableText = [
    ep.path,
    ep.summary ?? "",
    ep.method,
    ep.controller,
    ep.operationId,
    folderKey,
  ]
    .join(" ")
    .toLowerCase();
  return tokens.every((token) => searchableText.includes(token));
}

export class ApiTreeProvider implements vscode.TreeDataProvider<ApiTreeNode> {
  private readonly _onDidChange = new vscode.EventEmitter<ApiTreeNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  private roots: ApiTreeNode[] = [];
  private checked: Set<string>; // `${method} ${path}`
  /** 用户主动展开(true)/收起(false)过的目录,未操作过的目录跟随默认状态 */
  private readonly folderUserExpanded = new Map<string, boolean>();
  private analysis: { endpoints: EndpointInfo[] } | undefined;
  private filterKeyword: string = "";
  private filteredEndpoints: EndpointInfo[] = [];

  constructor(
    /** 重新解析工作区(与同步命令共用 analyzeOptions/collectFiles) */
    private readonly analyzeAll: () => Promise<{ endpoints: EndpointInfo[] } | undefined>,
    /** 目录命名(与同步 folderOf 一致;返回目录 key) */
    private readonly folderKeyOf: (ep: EndpointInfo) => string,
    /** 工作区状态存储(勾选集合跨会话保持) */
    private readonly workspaceState: vscode.Memento
  ) {
    const saved = workspaceState.get<string[]>("checkedEndpoints");
    this.checked = new Set(Array.isArray(saved) ? saved : []);
  }

  /** 重新解析并刷新树 */
  async refresh(): Promise<void> {
    this.analysis = await this.analyzeAll();
    this.rebuild();
    this._onDidChange.fire();
  }

  /** 获取当前拆分后的过滤词 tokens */
  get filterTokens(): string[] {
    if (!this.filterKeyword) {
      return [];
    }
    return this.filterKeyword.toLowerCase().split(/\s+/).filter(Boolean);
  }

  /** 数据重建(纯逻辑,便于测试) */
  private rebuild(): void {
    const allEndpoints = this.analysis?.endpoints ?? [];
    const tokens = this.filterTokens;

    if (tokens.length > 0) {
      this.filteredEndpoints = allEndpoints.filter((ep) =>
        matchEndpoint(ep, this.folderKeyOf(ep) || "未分组", tokens)
      );
    } else {
      this.filteredEndpoints = [...allEndpoints];
    }

    const groups = new Map<string, EndpointInfo[]>();
    for (const ep of this.filteredEndpoints) {
      const key = this.folderKeyOf(ep) || "未分组";
      const arr = groups.get(key) ?? [];
      arr.push(ep);
      groups.set(key, arr);
    }
    this.roots = [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, list]) => ({
        kind: "folder" as const,
        key,
        endpoints: list.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method)),
      }));

    // 清掉已消失接口的勾选(跨会话保存)
    const alive = new Set(allEndpoints.map((e) => `${e.method} ${e.path}`));
    let pruned = false;
    for (const k of [...this.checked]) {
      if (!alive.has(k)) {
        this.checked.delete(k);
        pruned = true;
      }
    }
    if (pruned) {
      this.persistChecked();
    }
  }

  /** 用户显式展开/收起某目录(刷新后保持,直到用户再次切换) */
  setFolderUserExpanded(key: string, expanded: boolean): void {
    this.folderUserExpanded.set(key, expanded);
  }

  /** 将勾选集合写入工作区状态(重启后恢复) */
  private persistChecked(): void {
    void this.workspaceState.update("checkedEndpoints", [...this.checked]);
  }

  getTreeItem(element: ApiTreeNode): vscode.TreeItem {
    if (element.kind === "banner") {
      const configured = element.projectId > 0;
      const title = configured
        ? `项目: ${element.projectName || `项目 ${element.projectId}`}`
        : "未绑定 Apifox 项目 (点击设置)";
      const item = new vscode.TreeItem(title, vscode.TreeItemCollapsibleState.None);
      item.iconPath = new vscode.ThemeIcon(
        configured ? "project" : "warning",
        configured ? undefined : new vscode.ThemeColor("problemsWarningIcon.foreground")
      );
      item.description = configured
        ? `${element.teamName ? `团队: ${element.teamName}` : `ID: ${element.projectId}`} · 点击配置`
        : "点击打开设置中心";
      item.tooltip = configured
        ? `当前绑定项目: ${element.projectName || `ID: ${element.projectId}`}\n所属团队: ${element.teamName || "未记录"}\n项目 ID: ${element.projectId}\n点击打开设置中心修改`
        : "尚未绑定 Apifox 项目，点击打开设置中心进行配置";
      item.command = {
        command: "apifoxHelper.openSettingsPanel",
        title: "打开设置中心",
      };
      item.contextValue = "banner";
      return item;
    }
    if (element.kind === "searchBar") {
      const isFiltered = Boolean(element.keyword);
      const title = isFiltered
        ? `过滤: "${element.keyword}" (${element.count}/${element.total})`
        : "搜索/过滤接口 (点击输入)...";
      const item = new vscode.TreeItem(title, vscode.TreeItemCollapsibleState.None);
      if (isFiltered) {
        item.iconPath = new vscode.ThemeIcon("filter", new vscode.ThemeColor("charts.yellow"));
        item.description = "点击修改 · 右侧清空";
        item.tooltip = `当前已过滤关键字: "${element.keyword}"\n匹配到 ${element.count} 个接口 (共 ${element.total} 个)\n点击可重新修改关键字或清空过滤`;
        item.contextValue = "searchBarFiltered";
      } else {
        item.iconPath = new vscode.ThemeIcon("search");
        item.description = "路径 / 描述 / 方法";
        item.tooltip = "点击输入关键字过滤接口列表\n支持按接口路径、中文描述、HTTP 方法、Controller 类名模糊匹配\n支持空格分隔多个关键词";
        item.contextValue = "searchBar";
      }
      item.command = {
        command: "apifoxHelper.filterApi",
        title: "过滤接口",
      };
      return item;
    }
    if (element.kind === "empty") {
      const isFiltered = this.isFiltered();
      const item = new vscode.TreeItem(element.message, vscode.TreeItemCollapsibleState.None);
      item.iconPath = new vscode.ThemeIcon(isFiltered ? "info" : "search-stop");
      item.description = isFiltered ? "点击清除过滤" : "点击检查设置";
      item.tooltip = isFiltered
        ? "没有找到匹配的接口，点击清除过滤以恢复完整列表"
        : "未扫描到接口，请确保包含 Spring Boot Controller，或在设置中心检查扫描路径配置";
      item.command = isFiltered
        ? { command: "apifoxHelper.clearFilter", title: "清除过滤" }
        : { command: "apifoxHelper.openSettingsPanel", title: "打开设置中心" };
      item.contextValue = "empty";
      return item;
    }
    if (element.kind === "folder") {
      // 默认:过滤模式下展开,便于直接看到匹配结果;非过滤模式收起,保持树清爽。
      // 用户手动展开/收起过的目录以用户状态为准(刷新/重建后保持)。
      const userExpanded = this.folderUserExpanded.get(element.key);
      const expanded = userExpanded !== undefined ? userExpanded : this.isFiltered();
      const collapsible = expanded
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.Collapsed;
      const item = new vscode.TreeItem(element.key, collapsible);
      item.iconPath = new vscode.ThemeIcon("folder-library");
      const total = element.endpoints.length;
      let checkedInFolder = 0;
      for (const ep of element.endpoints) {
        if (this.checked.has(`${ep.method} ${ep.path}`)) {
          checkedInFolder++;
        }
      }
      if (total > 0 && checkedInFolder === total) {
        item.checkboxState = vscode.TreeItemCheckboxState.Checked;
        item.description = `已全选 · ${total} 个接口`;
      } else if (checkedInFolder > 0) {
        item.checkboxState = vscode.TreeItemCheckboxState.Unchecked;
        item.description = `${checkedInFolder}/${total} 已选 · 共 ${total} 个`;
      } else {
        item.checkboxState = vscode.TreeItemCheckboxState.Unchecked;
        item.description = `${total} 个接口`;
      }
      item.contextValue = "folder";
      item.tooltip = `目录: ${element.key}\n接口数: ${total}\n已勾选: ${checkedInFolder}`;
      return item;
    }
    const ep = element.endpoint;
    const labelText = `${ep.method}  ${ep.path}`;
    const item = new vscode.TreeItem(labelText, vscode.TreeItemCollapsibleState.None);

    // 关键字匹配高亮
    if (this.isFiltered()) {
      const highlights = computeHighlights(labelText, this.filterTokens);
      if (highlights.length > 0) {
        item.label = { label: labelText, highlights };
      }
    }

    const icon = METHOD_ICON[ep.method] ?? { id: "circle-filled", color: "charts.blue" };
    item.iconPath = new vscode.ThemeIcon(icon.id, new vscode.ThemeColor(icon.color));
    item.description = ep.summary ?? "";
    item.tooltip = new vscode.MarkdownString(
      `**${ep.summary ?? ep.path}**\n\n\`${ep.method} ${ep.path}\`\n\n${ep.controller}.${ep.operationId}` +
        (ep.deprecated ? "\n\n⚠ 已废弃(@Deprecated)" : "")
    );
    item.checkboxState = this.checked.has(`${ep.method} ${ep.path}`)
      ? vscode.TreeItemCheckboxState.Checked
      : vscode.TreeItemCheckboxState.Unchecked;
    if (ep.fsPath && ep.methodRange) {
      item.command = {
        command: "apifoxHelper.gotoEndpoint",
        title: "跳转到定义",
        arguments: [ep],
      };
    }
    item.contextValue = "endpoint";
    return item;
  }

  getChildren(element?: ApiTreeNode): ApiTreeNode[] {
    if (!element) {
      const s = getSettings();
      const bannerNode: ApiTreeNode = {
        kind: "banner",
        projectId: s.projectId,
        projectName: s.projectName || "",
        teamName: s.teamName || "",
      };

      const nodes: ApiTreeNode[] = [bannerNode];
      const stats = this.getFilterStats();
      if (stats.total > 0 || this.isFiltered()) {
        nodes.push({
          kind: "searchBar",
          keyword: this.filterKeyword,
          count: stats.count,
          total: stats.total,
        });
      }

      if (this.isFiltered() && stats.count === 0) {
        nodes.push({
          kind: "empty",
          message: `未找到与 "${this.filterKeyword}" 匹配的接口`,
        });
        return nodes;
      }

      if (!this.isFiltered() && this.analysis !== undefined && stats.total === 0) {
        nodes.push({
          kind: "empty",
          message: "未扫描到接口 (点击检查配置或刷新)",
        });
        return nodes;
      }
      return [...nodes, ...this.roots];
    }
    if (element.kind === "folder") {
      return element.endpoints.map((endpoint) => ({ kind: "endpoint" as const, endpoint }));
    }
    return [];
  }

  /** 设置过滤关键字 */
  setFilter(keyword: string): void {
    this.filterKeyword = keyword.trim();
    this.rebuild();
    this.fireChanged();
  }

  /** 清除过滤 */
  clearFilter(): void {
    if (this.filterKeyword) {
      this.filterKeyword = "";
      this.rebuild();
      this.fireChanged();
    }
  }

  getFilterKeyword(): string {
    return this.filterKeyword;
  }

  isFiltered(): boolean {
    return this.filterKeyword.length > 0;
  }

  getFilterStats(): { count: number; total: number } {
    const total = this.analysis?.endpoints.length ?? 0;
    const count = this.filteredEndpoints.length;
    return { count, total };
  }

  /** 单个接口勾选变化(TreeView checkbox) */
  setChecked(ep: EndpointInfo, checked: boolean): void {
    const key = `${ep.method} ${ep.path}`;
    if (checked) {
      this.checked.add(key);
    } else {
      this.checked.delete(key);
    }
    this.persistChecked();
  }

  /** 目录勾选变化(联动该目录下所有接口) */
  setFolderChecked(folder: { endpoints: EndpointInfo[] }, checked: boolean): void {
    for (const ep of folder.endpoints) {
      const key = `${ep.method} ${ep.path}`;
      if (checked) {
        this.checked.add(key);
      } else {
        this.checked.delete(key);
      }
    }
    this.persistChecked();
  }

  /** 全选接口(在过滤状态下只勾选当前过滤出来的接口) */
  checkAll(): number {
    const targets = this.isFiltered() ? this.filteredEndpoints : (this.analysis?.endpoints ?? []);
    for (const ep of targets) {
      this.checked.add(`${ep.method} ${ep.path}`);
    }
    this.persistChecked();
    this.fireChanged();
    return targets.length;
  }

  /** 清空勾选(在过滤状态下只取消当前过滤出来的接口) */
  uncheckAll(): number {
    const targets = this.isFiltered() ? this.filteredEndpoints : (this.analysis?.endpoints ?? []);
    for (const ep of targets) {
      this.checked.delete(`${ep.method} ${ep.path}`);
    }
    this.persistChecked();
    this.fireChanged();
    return targets.length;
  }

  /** 当前勾选的接口(全量上下文中匹配) */
  getCheckedEndpoints(): EndpointInfo[] {
    const all = this.analysis?.endpoints ?? [];
    return all.filter((e) => this.checked.has(`${e.method} ${e.path}`));
  }

  get checkedCount(): number {
    return this.checked.size;
  }

  /** 用于搜索的扁平列表 */
  allEndpoints(): EndpointInfo[] {
    return this.analysis?.endpoints ?? [];
  }

  fireChanged(): void {
    this._onDidChange.fire();
  }
}

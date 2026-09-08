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
  | { kind: "folder"; key: string; endpoints: EndpointInfo[] }
  | { kind: "endpoint"; endpoint: EndpointInfo };

const METHOD_ICON: Record<string, { id: string; color: string }> = {
  GET: { id: "arrow-small-right", color: "testing.iconPassed" },
  POST: { id: "plus", color: "charts.blue" },
  PUT: { id: "edit", color: "charts.orange" },
  PATCH: { id: "diff", color: "charts.purple" },
  DELETE: { id: "trash", color: "testing.iconFailed" },
};

export class ApiTreeProvider implements vscode.TreeDataProvider<ApiTreeNode> {
  private readonly _onDidChange = new vscode.EventEmitter<ApiTreeNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  private roots: ApiTreeNode[] = [];
  private checked = new Set<string>(); // `${method} ${path}`
  private analysis: { endpoints: EndpointInfo[] } | undefined;

  constructor(
    /** 重新解析工作区(与同步命令共用 analyzeOptions/collectFiles) */
    private readonly analyzeAll: () => Promise<{ endpoints: EndpointInfo[] } | undefined>,
    /** 目录命名(与同步 folderOf 一致;返回目录 key) */
    private readonly folderKeyOf: (ep: EndpointInfo) => string
  ) {}

  /** 重新解析并刷新树 */
  async refresh(): Promise<void> {
    this.analysis = await this.analyzeAll();
    this.rebuild();
    this._onDidChange.fire();
  }

  /** 数据重建(纯逻辑,便于测试) */
  private rebuild(): void {
    const endpoints = this.analysis?.endpoints ?? [];
    const groups = new Map<string, EndpointInfo[]>();
    for (const ep of endpoints) {
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
    // 清掉已消失接口的勾选
    const alive = new Set(endpoints.map((e) => `${e.method} ${e.path}`));
    for (const k of [...this.checked]) {
      if (!alive.has(k)) {
        this.checked.delete(k);
      }
    }
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
    if (element.kind === "folder") {
      const item = new vscode.TreeItem(element.key, vscode.TreeItemCollapsibleState.Expanded);
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
    const item = new vscode.TreeItem(`${ep.method}  ${ep.path}`, vscode.TreeItemCollapsibleState.None);
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
      return [bannerNode, ...this.roots];
    }
    if (element.kind === "folder") {
      return element.endpoints.map((endpoint) => ({ kind: "endpoint" as const, endpoint }));
    }
    return [];
  }

  /** 单个接口勾选变化(TreeView checkbox) */
  setChecked(ep: EndpointInfo, checked: boolean): void {
    const key = `${ep.method} ${ep.path}`;
    if (checked) {
      this.checked.add(key);
    } else {
      this.checked.delete(key);
    }
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
  }

  /** 全选所有接口 */
  checkAll(): void {
    const all = this.analysis?.endpoints ?? [];
    for (const ep of all) {
      this.checked.add(`${ep.method} ${ep.path}`);
    }
    this.fireChanged();
  }

  /** 清空所有勾选 */
  uncheckAll(): void {
    this.checked.clear();
    this.fireChanged();
  }

  /** 根据节点或 key 查找所属目录下的所有接口 */
  getEndpointsByFolderNode(node: ApiTreeNode): EndpointInfo[] {
    if (node.kind === "folder") {
      return node.endpoints;
    }
    return [];
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

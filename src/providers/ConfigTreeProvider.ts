import * as vscode from "vscode";
import { getSettings } from "../config/settings";
import { getToken } from "../config/secret";

export type ConfigNode =
  | { kind: "project-root"; projectId: number; projectName?: string; teamName?: string }
  | { kind: "project-info"; label: string; description?: string; icon: string; command?: vscode.Command }
  | { kind: "token-root"; hasToken: boolean; masked?: string }
  | { kind: "token-info"; label: string; icon: string; command?: vscode.Command }
  | { kind: "server-root"; url: string }
  | { kind: "action-item"; label: string; description?: string; icon: string; command: vscode.Command };

export class ConfigTreeProvider implements vscode.TreeDataProvider<ConfigNode> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<ConfigNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly secrets: vscode.SecretStorage) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ConfigNode): vscode.TreeItem {
    switch (element.kind) {
      case "project-root": {
        const configured = element.projectId > 0;
        const name = element.projectName || (configured ? `项目 ${element.projectId}` : "未选择 (点击选择)");
        const item = new vscode.TreeItem(
          `项目: ${name}`,
          configured ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
        );
        item.description = configured ? `ID: ${element.projectId}` : "";
        item.iconPath = new vscode.ThemeIcon("project");
        item.tooltip = configured
          ? `当前绑定项目: ${name} (ID: ${element.projectId})\n所属团队: ${element.teamName || "未记录"}\n点击更换项目`
          : "尚未选择 Apifox 项目,点击通过向导选择";
        item.command = {
          command: "apifoxHelper.selectProject",
          title: "选择项目",
        };
        item.contextValue = "apifoxProjectItem";
        return item;
      }

      case "project-info": {
        const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        item.description = element.description;
        item.iconPath = new vscode.ThemeIcon(element.icon);
        item.command = element.command;
        return item;
      }

      case "token-root": {
        const item = new vscode.TreeItem(
          `访问令牌: ${element.hasToken ? "已配置" : "未配置 (点击设置)"}`,
          element.hasToken ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        );
        item.description = element.masked ?? "";
        item.iconPath = new vscode.ThemeIcon(element.hasToken ? "key" : "warning");
        item.tooltip = element.hasToken
          ? `Apifox API 访问令牌已配置 (${element.masked})\n点击重新设置`
          : "尚未配置访问令牌,无法上传或拉取项目。点击设置。";
        item.command = {
          command: "apifoxHelper.setToken",
          title: "设置令牌",
        };
        item.contextValue = "apifoxTokenItem";
        return item;
      }

      case "token-info": {
        const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon(element.icon);
        item.command = element.command;
        return item;
      }

      case "server-root": {
        const item = new vscode.TreeItem(`服务地址: ${element.url}`, vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon("globe");
        item.tooltip = `Apifox API 服务地址: ${element.url}\n点击在设置中修改`;
        item.command = {
          command: "workbench.action.openSettings",
          title: "打开设置",
          arguments: ["apifoxHelper.apiBaseUrl"],
        };
        return item;
      }

      case "action-item": {
        const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        item.description = element.description;
        item.iconPath = new vscode.ThemeIcon(element.icon);
        item.command = element.command;
        return item;
      }
    }
  }

  async getChildren(element?: ConfigNode): Promise<ConfigNode[]> {
    if (!element) {
      // 根节点列表
      const settings = getSettings();
      const token = await getToken(this.secrets);
      const maskedToken = token
        ? `${token.slice(0, 5)}***${token.slice(-4)}`
        : undefined;

      const nodes: ConfigNode[] = [
        {
          kind: "action-item",
          label: "打开项目与账号配置中心...",
          description: "一站式弹窗",
          icon: "gear",
          command: {
            command: "apifoxHelper.quickSetup",
            title: "配置中心",
          },
        },
        {
          kind: "project-root",
          projectId: settings.projectId,
          projectName: settings.projectName,
          teamName: settings.teamName,
        },
        {
          kind: "token-root",
          hasToken: Boolean(token),
          masked: maskedToken,
        },
        {
          kind: "server-root",
          url: settings.apiBaseUrl,
        },
        {
          kind: "action-item",
          label: "同步所有接口到 Apifox",
          description: "全量同步",
          icon: "cloud-upload",
          command: {
            command: "apifoxHelper.syncWorkspace",
            title: "全量同步",
          },
        },
        {
          kind: "action-item",
          label: "打开插件详细设置...",
          description: "冲突策略/规则等",
          icon: "settings-gear",
          command: {
            command: "workbench.action.openSettings",
            title: "打开设置",
            arguments: ["apifoxHelper"],
          },
        },
      ];
      return nodes;
    }

    if (element.kind === "project-root" && element.projectId > 0) {
      const children: ConfigNode[] = [];
      if (element.teamName) {
        children.push({
          kind: "project-info",
          label: `所属团队: ${element.teamName}`,
          icon: "organization",
        });
      }
      children.push({
        kind: "project-info",
        label: `项目 ID: ${element.projectId}`,
        icon: "symbol-numeric",
      });
      children.push({
        kind: "project-info",
        label: "更换当前绑定的项目...",
        icon: "edit",
        command: {
          command: "apifoxHelper.selectProject",
          title: "更换项目",
        },
      });
      return children;
    }

    if (element.kind === "token-root" && element.hasToken) {
      return [
        {
          kind: "token-info",
          label: "重新设置访问令牌...",
          icon: "edit",
          command: {
            command: "apifoxHelper.setToken",
            title: "设置令牌",
          },
        },
        {
          kind: "token-info",
          label: "清除访问令牌",
          icon: "trash",
          command: {
            command: "apifoxHelper.clearToken",
            title: "清除令牌",
          },
        },
      ];
    }

    return [];
  }
}

import * as vscode from "vscode";
import { getToken, setToken } from "./secret";
import { getSettings } from "./settings";
import { ApifoxClient } from "../apifox/client";
import { selectProject, TOKEN_HELP_URL } from "../apifox/uploader";

interface QuickSetupItem extends vscode.QuickPickItem {
  action: () => Promise<void>;
}

/**
 * 打开「项目与账号设置中心」交互弹窗
 */
export async function openQuickSetup(
  secrets: vscode.SecretStorage,
  onConfigChanged?: () => void
): Promise<void> {
  const settings = getSettings();
  const token = await getToken(secrets);
  const hasToken = Boolean(token);
  const maskedToken = token ? `${token.slice(0, 5)}***${token.slice(-4)}` : "未配置 (点击设置)";

  const items: QuickSetupItem[] = [
    {
      label: `$(project) 绑定项目: ${settings.projectName || (settings.projectId ? `项目 ${settings.projectId}` : "未选择")}`,
      description: settings.projectId ? `ID: ${settings.projectId} · 团队: ${settings.teamName || "未记录"}` : "点击进入向导选择",
      detail: "在线拉取团队并选择要同步的 Apifox 项目",
      action: async () => {
        const currentToken = await getToken(secrets);
        if (!currentToken) {
          const setupToken = await vscode.window.showWarningMessage(
            "尚未配置访问令牌,请先设置访问令牌后再选择项目",
            "设置令牌",
            "取消"
          );
          if (setupToken === "设置令牌") {
            await configureToken(secrets);
          }
          return;
        }
        const client = new ApifoxClient(settings.apiBaseUrl, currentToken);
        const ok = await selectProject(client);
        if (ok) {
          onConfigChanged?.();
        }
      },
    },
    {
      label: `$(key) 访问令牌 (Access Token): ${hasToken ? "已配置" : "未配置"}`,
      description: maskedToken,
      detail: "可在 Apifox 客户端「头像 → 账号设置 → API 访问令牌」生成",
      action: async () => {
        await configureToken(secrets);
        onConfigChanged?.();
      },
    },
    {
      label: `$(globe) API 服务地址: ${settings.apiBaseUrl}`,
      description: settings.apiBaseUrl === "https://api.apifox.com" ? "官方公网" : "私有化部署",
      detail: "默认为 https://api.apifox.com，私有化部署时可替换",
      action: async () => {
        await configureApiBaseUrl();
        onConfigChanged?.();
      },
    },
    {
      label: "$(rocket) 一键完整配置向导",
      description: "依次引导: 设置令牌 → 选择团队 → 绑定项目",
      detail: "适用于首次配置或切换全新账号环境",
      action: async () => {
        await runFullWizard(secrets);
        onConfigChanged?.();
      },
    },
    {
      label: "$(settings-gear) 打开详细设置...",
      description: "冲突策略 / 字段规则 / 代码包含范围",
      detail: "在 VS Code 设置页中查看所有高级配置项",
      action: async () => {
        await vscode.commands.executeCommand("workbench.action.openSettings", "apifoxHelper");
      },
    },
  ];

  const picked = await vscode.window.showQuickPick(items, {
    title: "ApiGen for Apifox: 项目与账号设置中心",
    placeHolder: "请选择要查看或修改的配置项",
    ignoreFocusOut: true,
  });

  if (picked) {
    await picked.action();
  }
}

/** 配置访问令牌 */
async function configureToken(secrets: vscode.SecretStorage): Promise<void> {
  const current = await getToken(secrets);
  if (current) {
    const action = await vscode.window.showQuickPick(
      [
        { label: "$(edit) 重新输入访问令牌", action: "edit" },
        { label: "$(trash) 清除当前访问令牌", action: "clear" },
        { label: "$(question) 查看如何获取访问令牌", action: "help" },
      ],
      { title: "设置 API 访问令牌", placeHolder: "选择操作" }
    );
    if (!action) {
      return;
    }
    if (action.action === "help") {
      await vscode.env.openExternal(vscode.Uri.parse(TOKEN_HELP_URL));
      return;
    }
    if (action.action === "clear") {
      await setToken(secrets, undefined);
      vscode.window.showInformationMessage("已清除访问令牌");
      return;
    }
  }

  const token = await vscode.window.showInputBox({
    prompt: "粘贴 Apifox API 访问令牌(可在 Apifox「头像 → 账号设置 → API 访问令牌」生成)",
    password: true,
    ignoreFocusOut: true,
    placeHolder: "APS-xxxxxxxx",
    value: "",
  });

  if (token === undefined) {
    return;
  }
  const cleaned = token.trim();
  await setToken(secrets, cleaned || undefined);
  vscode.window.showInformationMessage(cleaned ? "访问令牌已保存(加密存储)" : "访问令牌已清除");
}

/** 配置服务地址 */
async function configureApiBaseUrl(): Promise<void> {
  const cfg = vscode.workspace.getConfiguration("apifoxHelper");
  const current = cfg.get<string>("apiBaseUrl", "https://api.apifox.com");
  const choice = await vscode.window.showQuickPick(
    [
      { label: "官方公网服务 (https://api.apifox.com)", value: "https://api.apifox.com" },
      { label: "自定义私有化部署地址...", value: "custom" },
    ],
    { title: "配置 Apifox API 服务地址", placeHolder: `当前: ${current}` }
  );

  if (!choice) {
    return;
  }

  const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;

  if (choice.value === "custom") {
    const customUrl = await vscode.window.showInputBox({
      prompt: "输入 Apifox 服务 Base URL",
      placeHolder: "https://apifox.your-company.com",
      value: current !== "https://api.apifox.com" ? current : "",
      ignoreFocusOut: true,
    });
    if (customUrl) {
      await cfg.update("apiBaseUrl", customUrl.trim().replace(/\/+$/, ""), target);
      vscode.window.showInformationMessage(`已将 API 服务地址设置为: ${customUrl.trim()}`);
    }
  } else {
    await cfg.update("apiBaseUrl", choice.value, target);
    vscode.window.showInformationMessage(`已恢复默认公网地址: ${choice.value}`);
  }
}

/** 完整引导向导 */
async function runFullWizard(secrets: vscode.SecretStorage): Promise<void> {
  let token = await getToken(secrets);
  if (!token) {
    token = await vscode.window.showInputBox({
      prompt: "【步骤 1/2】粘贴 Apifox API 访问令牌(Access Token)",
      password: true,
      ignoreFocusOut: true,
      placeHolder: "APS-xxxxxxxx",
    });
    if (!token?.trim()) {
      vscode.window.showInformationMessage("已取消配置");
      return;
    }
    await setToken(secrets, token.trim());
  }

  const settings = getSettings();
  const client = new ApifoxClient(settings.apiBaseUrl, token.trim());
  vscode.window.showInformationMessage("【步骤 2/2】正在获取团队和项目列表...");
  await selectProject(client);
}

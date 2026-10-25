import * as vscode from "vscode";
import { ApifoxApiError, ApifoxClient, ApifoxProject, ApifoxTeam, describeErrorChain, ImportResult } from "./client";
import { getToken, setToken } from "../config/secret";
import { saveProjectId, ApifoxSettings } from "../config/settings";
import { AnalyzeOutput } from "../pipeline";

export const TOKEN_HELP_URL = "https://apifox.com/help/settings/personal-access-token";

/** 确保拿到访问令牌,没有则引导输入 */
export async function ensureToken(secrets: vscode.SecretStorage): Promise<string | undefined> {
  let token = await getToken(secrets);
  if (token) {
    return token;
  }
  const picked = await vscode.window.showInformationMessage(
    "ApiGen for Apifox:尚未配置 Apifox 访问令牌。可在 Apifox 客户端「头像 → 账号设置 → API 访问令牌」生成。",
    "设置令牌",
    "查看帮助"
  );
  if (picked === "查看帮助") {
    await vscode.env.openExternal(vscode.Uri.parse(TOKEN_HELP_URL));
    return undefined;
  }
  if (picked !== "设置令牌") {
    return undefined;
  }
  token = await vscode.window.showInputBox({
    prompt: "粘贴 Apifox API 访问令牌(Access Token)",
    password: true,
    ignoreFocusOut: true,
    placeHolder: "APS-xxxxxxxx",
  });
  if (!token) {
    return undefined;
  }
  await setToken(secrets, token);
  return token.trim();
}

interface TeamQuickPickItem extends vscode.QuickPickItem {
  team?: ApifoxTeam;
}

interface ProjectQuickPickItem extends vscode.QuickPickItem {
  project?: ApifoxProject;
  isBackItem?: boolean;
}

/**
 * 分步向导在线选择 Apifox 项目并写入配置:
 *  - 步骤 1/2: 选择团队 (支持右上角刷新、输入搜索)
 *  - 步骤 2/2: 选择项目 (支持左上角返回上级重新选团队、右上角刷新)
 */
export async function selectProject(client: ApifoxClient, folder?: vscode.WorkspaceFolder): Promise<boolean> {
  const refreshButton: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon("refresh"),
    tooltip: "刷新列表",
  };

  let cachedTeams: ApifoxTeam[] | undefined;

  const pickTeam = (preselectedTeamId?: number): Promise<ApifoxTeam | undefined> => {
    return new Promise<ApifoxTeam | undefined>((resolve) => {
      const qp = vscode.window.createQuickPick<TeamQuickPickItem>();
      qp.title = "选择 Apifox 项目 (1/2: 选择团队)";
      qp.placeholder = "请选择所属团队 (支持输入过滤)";
      qp.step = 1;
      qp.totalSteps = 2;
      qp.ignoreFocusOut = true;
      qp.buttons = [refreshButton];

      let isResolved = false;
      const safeResolve = (val: ApifoxTeam | undefined) => {
        if (!isResolved) {
          isResolved = true;
          qp.dispose();
          resolve(val);
        }
      };

      const loadTeams = async (force = false) => {
        qp.busy = true;
        try {
          if (!cachedTeams || force) {
            cachedTeams = await client.listTeams();
          }
          if (!cachedTeams.length) {
            const version = vscode.extensions.getExtension("duyiliu.api2apifox")?.packageJSON.version ?? "?";
            vscode.window.showWarningMessage(`当前访问令牌下未获取到任何可用团队(插件版本 ${version})`);
            safeResolve(undefined);
            return;
          }
          qp.items = cachedTeams.map((t) => ({
            label: `$(organization) ${t.name}`,
            description: `团队 ID: ${t.id}`,
            team: t,
          }));
          if (preselectedTeamId) {
            const found = qp.items.find((it) => it.team?.id === preselectedTeamId);
            if (found) {
              qp.activeItems = [found];
            }
          }
        } catch (err) {
          vscode.window.showErrorMessage(`获取团队列表失败:${errorMessage(err)}`);
          safeResolve(undefined);
        } finally {
          qp.busy = false;
        }
      };

      qp.onDidTriggerButton((btn) => {
        if (btn === refreshButton) {
          loadTeams(true);
        }
      });

      qp.onDidAccept(() => {
        const selected = qp.selectedItems[0];
        if (selected?.team) {
          safeResolve(selected.team);
        }
      });

      qp.onDidHide(() => {
        safeResolve(undefined);
      });

      qp.show();
      loadTeams(false);
    });
  };

  const pickProject = (
    team: ApifoxTeam
  ): Promise<{ action: "selected" | "back" | "cancel"; project?: ApifoxProject }> => {
    return new Promise((resolve) => {
      const qp = vscode.window.createQuickPick<ProjectQuickPickItem>();
      qp.title = `选择 Apifox 项目 (2/2: ${team.name})`;
      qp.placeholder = `请选择「${team.name}」下的项目 (支持输入过滤)`;
      qp.step = 2;
      qp.totalSteps = 2;
      qp.ignoreFocusOut = true;
      qp.buttons = [vscode.QuickInputButtons.Back, refreshButton];

      let isResolved = false;
      const safeResolve = (val: { action: "selected" | "back" | "cancel"; project?: ApifoxProject }) => {
        if (!isResolved) {
          isResolved = true;
          qp.dispose();
          resolve(val);
        }
      };

      const loadProjects = async () => {
        qp.busy = true;
        qp.items = [];
        try {
          const projects = await client.listTeamProjects(team.id);
          if (!projects.length) {
            qp.items = [
              {
                label: `$(info) 该团队下暂无可用项目`,
                description: "点击返回重新选择团队",
                isBackItem: true,
              },
            ];
            return;
          }
          qp.items = projects.map((p) => ({
            label: `$(project) ${p.name}`,
            description: `项目 ID: ${p.id}`,
            detail: `所属团队: ${team.name}`,
            project: { ...p, teamName: team.name },
          }));
        } catch (err) {
          vscode.window.showErrorMessage(`获取团队「${team.name}」的项目列表失败:${errorMessage(err)}`);
          safeResolve({ action: "back" });
        } finally {
          qp.busy = false;
        }
      };

      qp.onDidTriggerButton((btn) => {
        if (btn === vscode.QuickInputButtons.Back) {
          safeResolve({ action: "back" });
        } else if (btn === refreshButton) {
          loadProjects();
        }
      });

      qp.onDidAccept(() => {
        const selected = qp.selectedItems[0];
        if (!selected) {
          return;
        }
        if (selected.isBackItem) {
          safeResolve({ action: "back" });
        } else if (selected.project) {
          safeResolve({ action: "selected", project: selected.project });
        }
      });

      qp.onDidHide(() => {
        safeResolve({ action: "cancel" });
      });

      qp.show();
      loadProjects();
    });
  };

  let currentTeam: ApifoxTeam | undefined;
  while (true) {
    currentTeam = await pickTeam(currentTeam?.id);
    if (!currentTeam) {
      return false; // 用户在第一步取消
    }

    const result = await pickProject(currentTeam);
    if (result.action === "back") {
      continue; // 返回重新选择团队
    }
    if (result.action === "cancel") {
      return false; // 用户在第二步取消
    }
    if (result.action === "selected" && result.project) {
      await saveProjectId(result.project.id, result.project.name, currentTeam.name, folder);
      const scopeHint = folder ? `「${folder.name}」` : "";
      vscode.window.showInformationMessage(
        `已选择 Apifox 项目${scopeHint}「${result.project.name}」(ID: ${result.project.id} · 所属团队: ${currentTeam.name})`
      );
      return true;
    }
  }
}

export interface SyncOutcome {
  ok: boolean;
  message: string;
  /** Apifox 导入接口返回的原始计数(键名与开放 API 一致,结果面板据此成表) */
  counters: Record<string, number>;
  /** Apifox 返回的导入错误 */
  errors: { message?: string; code?: string }[];
}

/**
 * 同步:依赖 Apifox 导入的官方目录机制。
 * 官方导入 OpenAPI 时,operation 上的 x-apifox-folder(优先)或 tags[0] 会作为接口目录,
 * 不存在时自动创建(计数 endpointFolderCreated)。目录值在生成 spec 时由 builder 按
 * folderNameSource/rootFolderName 写入 x-apifox-folder,因此这里做一次全量导入即可,
 * 不再调用 /endpoint-folders 等非开放 API 预建目录。
 * schema 目录:导入仅支持单个 targetSchemaFolderId(数字 ID,可从 Apifox 客户端目录右键复制),
 * 原「按名查找目录」接口 GET /v1/projects/{id}/schema-folders 已被 Apifox 下线。
 */
export async function syncToApifox(
  client: ApifoxClient,
  settings: ApifoxSettings,
  analyzed: AnalyzeOutput
): Promise<SyncOutcome> {
  const { spec, endpoints, warnings } = analyzed;
  if (!endpoints.length) {
    return { ok: true, message: "未发现任何 REST 接口,未同步任何内容", counters: {}, errors: [] };
  }

  const result = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "ApiGen for Apifox:同步中...",
      cancellable: false,
    },
    async (progress) => {
      // 可选的数据模型目录:仅支持数字 ID 直配(Apifox 已下线目录列表接口,无法按名查找)
      let schemaFolderId: number | undefined;
      if (settings.schemaFolderId > 0) {
        schemaFolderId = settings.schemaFolderId;
      } else if (settings.schemaFolderName.trim()) {
        warnings.push(
          `schemaFolderName 已不被支持(Apifox 下线了目录查询接口),请在设置中改用 schemaFolderId(数字 ID);本次模型将导入根目录`
        );
      }

      progress.report({ message: "导入全部接口..." });
      // x-apifox-folder 已在 spec 各 operation 中,Apifox 会自动建目录;此处只做一次全量导入
      return client.importOpenapi(settings.projectId, JSON.stringify(spec), {
        targetEndpointFolderId: undefined,
        targetSchemaFolderId: schemaFolderId,
        endpointOverwriteBehavior: settings.endpointConflictBehavior as never,
        schemaOverwriteBehavior: settings.schemaConflictBehavior as never,
      });
    }
  );

  return { ok: true, message: formatResult(result, warnings), counters: result.counters, errors: result.errors };
}

export function formatResult(result: ImportResult, warnings: string[]): string {
  const c = result.counters;
  const parts: string[] = [];
  const endpointPart = [
    c.endpointCreated ? `新增 ${c.endpointCreated}` : "",
    c.endpointUpdated ? `更新 ${c.endpointUpdated}` : "",
    c.endpointIgnored ? `忽略 ${c.endpointIgnored}` : "",
    c.endpointFailed ? `失败 ${c.endpointFailed}` : "",
  ].filter(Boolean);
  if (endpointPart.length) {
    parts.push(`接口(${endpointPart.join(", ")})`);
  }
  const schemaPart = [
    c.schemaCreated ? `新增 ${c.schemaCreated}` : "",
    c.schemaUpdated ? `更新 ${c.schemaUpdated}` : "",
    c.schemaIgnored ? `忽略 ${c.schemaIgnored}` : "",
    c.schemaFailed ? `失败 ${c.schemaFailed}` : "",
  ].filter(Boolean);
  if (schemaPart.length) {
    parts.push(`数据模型(${schemaPart.join(", ")})`);
  }
  // 目录由 Apifox 导入时按 x-apifox-folder/tags 自动创建/更新
  const folderPart = [
    c.endpointFolderCreated ? `新建目录 ${c.endpointFolderCreated}` : "",
    c.endpointFolderUpdated ? `更新目录 ${c.endpointFolderUpdated}` : "",
  ].filter(Boolean);
  if (folderPart.length) {
    parts.push(folderPart.join(", "));
  }
  let msg = parts.length ? `同步完成:${parts.join(";")}` : "同步完成";
  for (const e of result.errors) {
    msg += `\n⚠ ${e.message ?? e.code ?? "未知错误"}`;
  }
  for (const w of warnings) {
    msg += `\n⚠ ${w}`;
  }
  return msg;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApifoxApiError) {
    return err.message;
  }
  // 非开放 API 抛出的错误同样展开 cause 链,避免只剩一句 "fetch failed"
  return describeErrorChain(err);
}

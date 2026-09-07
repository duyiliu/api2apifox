import * as vscode from "vscode";
import { ApifoxApiError, ApifoxClient, ImportResult } from "./client";
import { getToken } from "../config/secret";
import { getSettings, saveProjectId, ApifoxSettings } from "../config/settings";
import { AnalyzeOutput } from "../pipeline";
import { EndpointInfo } from "../java/model";

export const TOKEN_HELP_URL = "https://apifox.com/help/settings/personal-access-token";

/** 确保拿到访问令牌,没有则引导输入 */
export async function ensureToken(secrets: vscode.SecretStorage): Promise<string | undefined> {
  let token = await getToken(secrets);
  if (token) {
    return token;
  }
  const picked = await vscode.window.showInformationMessage(
    "Apifox Helper:尚未配置 Apifox 访问令牌。可在 Apifox 客户端「头像 → 账号设置 → API 访问令牌」生成。",
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
  await secrets.store("apifoxHelper.token", token);
  return token;
}

/** QuickPick 在线选择 Apifox 项目并写入配置 */
export async function selectProject(client: ApifoxClient): Promise<boolean> {
  let projects: { id: number; name: string }[];
  try {
    projects = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: "Apifox Helper:获取项目列表..." },
      () => client.listProjects()
    );
  } catch (err) {
    vscode.window.showErrorMessage(`获取项目列表失败:${errorMessage(err)}`);
    return false;
  }
  if (!projects.length) {
    vscode.window.showWarningMessage("该令牌下没有可用项目");
    return false;
  }
  const picked = await vscode.window.showQuickPick(
    projects.map((p) => ({ label: p.name, description: `ID: ${p.id}`, id: p.id })),
    { placeHolder: "选择要同步到的 Apifox 项目", ignoreFocusOut: true }
  );
  if (!picked) {
    return false;
  }
  await saveProjectId(picked.id);
  vscode.window.showInformationMessage(`已选择项目「${picked.label}」(${picked.id})`);
  return true;
}

export interface SyncOutcome {
  ok: boolean;
  message: string;
}

/** 执行同步:按 tag/类名分目录导入;目录接口不可用时回退为根目录整体导入 */
export async function syncToApifox(
  client: ApifoxClient,
  settings: ApifoxSettings,
  analyzed: AnalyzeOutput
): Promise<SyncOutcome> {
  const { spec, endpoints, warnings } = analyzed;
  if (!endpoints.length) {
    return { ok: true, message: "未发现任何 REST 接口,未同步任何内容" };
  }

  const result = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Apifox Helper:同步中...",
      cancellable: false,
    },
    async (progress) => {
      // 目录命名来源
      const folderKeyOf = (e: EndpointInfo) => (settings.folderNameSource === "controller" ? e.controller : e.tag);
      const keys = [...new Set(endpoints.map(folderKeyOf).filter(Boolean))];
      const folderIds = new Map<string, number>();
      let folderMode = keys.length > 0;
      if (folderMode) {
        try {
          progress.report({ message: "准备接口目录..." });
          // 可选的根目录(所有分组挂在它下面)
          let rootId = 0;
          if (settings.rootFolderName.trim()) {
            rootId = await ensureFolder(client, settings.projectId, settings.rootFolderName.trim(), 0);
          }
          const folders = await client.listEndpointFolders(settings.projectId);
          for (const key of keys) {
            const candidates = folders.filter((f) => f.name === key);
            const matched = rootId ? candidates.find((f) => (f as { parentId?: number }).parentId === rootId) : candidates[0];
            folderIds.set(key, matched ? matched.id : await client.createEndpointFolder(settings.projectId, key, rootId).then((f) => f.id));
          }
          // 记录 rootId 供后续分组导入时使用
          (folderIds as Map<string, number> & { __rootId?: number }).__rootId = rootId;
        } catch (err) {
          folderMode = false;
          warnings.push(`按目录分组失败,已回退为导入到根目录:${errorMessage(err)}`);
        }
      }

      // 可选的数据模型目录
      let schemaFolderId: number | undefined;
      if (settings.schemaFolderName.trim()) {
        try {
          schemaFolderId = await ensureFolder(client, settings.projectId, settings.schemaFolderName.trim(), 0);
        } catch (err) {
          warnings.push(`准备数据模型目录失败,模型将导入到根目录:${errorMessage(err)}`);
        }
      }

      const total: ImportResult = { counters: {}, errors: [] };
      const groups: { key?: string; endpoints: EndpointInfo[] }[] = folderMode
        ? keys.map((key) => ({ key, endpoints: endpoints.filter((e) => folderKeyOf(e) === key) }))
        : [{ endpoints }];

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        progress.report({ message: `导入 ${group.key ?? "全部接口"}(${i + 1}/${groups.length})...`, increment: (100 / groups.length) * 0.9 });
        const subSpec = pickByEndpoints(spec, group.endpoints);
        const rootId = (folderIds as Map<string, number> & { __rootId?: number }).__rootId ?? 0;
        const res = await client.importOpenapi(settings.projectId, JSON.stringify(subSpec), {
          targetEndpointFolderId: folderMode && group.key ? folderIds.get(group.key) : rootId || undefined,
          targetSchemaFolderId: schemaFolderId,
          endpointOverwriteBehavior: settings.endpointConflictBehavior as never,
          schemaOverwriteBehavior: settings.schemaConflictBehavior as never,
        });
        mergeCounters(total.counters, res.counters);
        total.errors.push(...res.errors);
      }
      return total;
    }
  );

  return { ok: true, message: formatResult(result, warnings) };
}

/** 找同名目录,没有则创建 */
async function ensureFolder(client: ApifoxClient, projectId: number, name: string, parentId: number, kind: "endpoint" | "schema" = "endpoint"): Promise<number> {
  const folders = kind === "schema" ? await client.listSchemaFolders(projectId) : await client.listEndpointFolders(projectId);
  const existing = folders.find((f) => f.name === name);
  if (existing) {
    return existing.id;
  }
  const created = kind === "schema" ? await client.createSchemaFolder(projectId, name, parentId) : await client.createEndpointFolder(projectId, name, parentId);
  return created.id;
}

/** 从完整 spec 中摘取一组接口涉及的 paths(components 全量带上,Apifox 按名去重) */
function pickByEndpoints(spec: AnalyzeOutput["spec"], endpoints: EndpointInfo[]): AnalyzeOutput["spec"] {
  const wanted = new Set(endpoints.map((e) => `${e.method.toLowerCase()} ${e.path}`));
  const paths: Record<string, Record<string, unknown>> = {};
  for (const [path, item] of Object.entries(spec.paths)) {
    const methods = Object.entries(item as Record<string, unknown>).filter(
      ([verb, op]) => typeof op === "object" && op !== null && "operationId" in (op as object) && wanted.has(`${verb} ${path}`)
    );
    if (methods.length) {
      paths[path] = Object.fromEntries(methods);
    }
  }
  return { ...spec, paths, components: spec.components };
}

function mergeCounters(target: Record<string, number>, src: Record<string, number>): void {
  for (const [k, v] of Object.entries(src)) {
    target[k] = (target[k] ?? 0) + v;
  }
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
  return err instanceof Error ? err.message : String(err);
}

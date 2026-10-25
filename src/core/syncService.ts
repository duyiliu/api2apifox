import { ApifoxClient } from "../apifox/client";
import { diffOpenapiResources } from "./deletePreview";
import { ProjectAnalysisResult, ResolvedConfig, SyncResult } from "./types";

export interface SyncProjectRequest {
  config: ResolvedConfig;
  token: string;
  analyzed: ProjectAnalysisResult;
  dryRun?: boolean;
  scopeType?: SyncResult["scope"]["type"];
  /**
   * 删除 Apifox 中本次文档未出现的接口/数据模型。
   * 仅允许全量工作区 scope；调用方必须先展示 dry-run 预览并取得显式确认。
   */
  deleteUnmatchedResources?: boolean;
  signal?: AbortSignal;
}

export async function syncProject(request: SyncProjectRequest): Promise<SyncResult> {
  const { config, analyzed } = request;
  const scopeType = request.scopeType ?? "workspace";
  const deleteUnmatchedResources = request.deleteUnmatchedResources === true;
  if (deleteUnmatchedResources && scopeType !== "workspace") {
    throw new Error("删除传播仅支持整个工作区的全量同步，局部同步会误删其他来源的接口");
  }
  const base: SyncResult = {
    dryRun: request.dryRun ?? false,
    target: { projectId: config.projectId, apiBaseUrl: config.apiBaseUrl },
    scope: { type: scopeType, endpointCount: analyzed.endpoints.length },
    deleteUnmatchedResources,
    counters: {},
    errors: [],
  };
  if (request.dryRun) {
    // 删除预览必须读取远端真实清单；无接口时导入本身也不会发生，直接返回空预览。
    if (deleteUnmatchedResources && analyzed.endpoints.length) {
      const client = new ApifoxClient(config.apiBaseUrl, request.token, undefined, config.timeoutMs, request.signal);
      const remote = await client.exportOpenapi(config.projectId);
      return { ...base, deletionPreview: diffOpenapiResources(analyzed.spec, remote) };
    }
    return base;
  }
  if (!analyzed.endpoints.length) {
    return base;
  }
  const client = new ApifoxClient(config.apiBaseUrl, request.token, undefined, config.timeoutMs, request.signal);
  const imported = await client.importOpenapi(config.projectId, JSON.stringify(analyzed.spec), {
    targetSchemaFolderId: config.schemaFolderId > 0 ? config.schemaFolderId : undefined,
    endpointOverwriteBehavior: config.endpointConflictBehavior,
    schemaOverwriteBehavior: config.schemaConflictBehavior,
    deleteUnmatchedResources,
  });
  return { ...base, counters: imported.counters, errors: imported.errors };
}

export function hasImportFailures(result: SyncResult): boolean {
  if (result.errors.length > 0) {
    return true;
  }
  return Object.entries(result.counters).some(([key, value]) => /Failed$/i.test(key) && value > 0);
}

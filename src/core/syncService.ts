import { ApifoxClient } from "../apifox/client";
import { ProjectAnalysisResult, ResolvedConfig, SyncResult } from "./types";

export interface SyncProjectRequest {
  config: ResolvedConfig;
  token: string;
  analyzed: ProjectAnalysisResult;
  dryRun?: boolean;
  scopeType?: SyncResult["scope"]["type"];
  scopeKey?: string;
  /** 仅在调用方显式开启且为全量 scope 时删除 Apifox 中本次未出现的接口 */
  deleteUnmatchedResources?: boolean;
  signal?: AbortSignal;
}

export async function syncProject(request: SyncProjectRequest): Promise<SyncResult> {
  const { config, analyzed } = request;
  const base: SyncResult = {
    dryRun: request.dryRun ?? false,
    target: { projectId: config.projectId, apiBaseUrl: config.apiBaseUrl },
    scope: { type: request.scopeType ?? "workspace", key: request.scopeKey, endpointCount: analyzed.endpoints.length },
    counters: {},
    errors: [],
    imported: false,
  };
  if (request.dryRun || !analyzed.endpoints.length) {
    return base;
  }
  const client = new ApifoxClient(config.apiBaseUrl, request.token, undefined, config.timeoutMs, request.signal);
  const imported = await client.importOpenapi(config.projectId, JSON.stringify(analyzed.spec), {
    targetSchemaFolderId: config.schemaFolderId > 0 ? config.schemaFolderId : undefined,
    endpointOverwriteBehavior: config.endpointConflictBehavior,
    schemaOverwriteBehavior: config.schemaConflictBehavior,
    deleteUnmatchedResources: request.deleteUnmatchedResources === true,
  });
  return { ...base, imported: true, counters: imported.counters, errors: imported.errors };
}

export function hasImportFailures(result: SyncResult): boolean {
  if (result.errors.length > 0) {
    return true;
  }
  return Object.entries(result.counters).some(([key, value]) => /Failed$/i.test(key) && value > 0);
}

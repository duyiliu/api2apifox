import {
  ApifoxClient,
  buildEndpointLinks,
  ENDPOINT_LINK_DRY_RUN_REASON,
  SyncEndpointLink,
} from "../apifox/client";
import { ProjectAnalysisResult, ResolvedConfig, SyncResult } from "./types";

/** 同步结果里的逐接口索引与链接口径（JSON 信封消费者据此判断该不该逐条引用） */
export interface EndpointLinks {
  /** per-endpoint 全可定位 / partial 部分可定位 / project 至多项目页 */
  mode: "per-endpoint" | "partial" | "project";
  reason?: string;
}

/** syncProject 的结果：在通用 SyncResult 之上附带 Issue #40 要求的逐接口字段 */
export type SyncProjectResult = SyncResult & {
  endpoints: SyncEndpointLink[];
  endpointLinks: EndpointLinks;
};

export interface SyncProjectRequest {
  config: ResolvedConfig;
  token: string;
  analyzed: ProjectAnalysisResult;
  dryRun?: boolean;
  scopeType?: SyncResult["scope"]["type"];
  signal?: AbortSignal;
}

export async function syncProject(request: SyncProjectRequest): Promise<SyncProjectResult> {
  const { config, analyzed } = request;
  const base: SyncProjectResult = {
    dryRun: request.dryRun ?? false,
    target: { projectId: config.projectId, apiBaseUrl: config.apiBaseUrl },
    scope: { type: request.scopeType ?? "workspace", endpointCount: analyzed.endpoints.length },
    counters: {},
    errors: [],
    endpoints: [],
    endpointLinks: { mode: "project" },
  };
  if (request.dryRun || !analyzed.endpoints.length) {
    return { ...base, ...endpointIndex(config, analyzed, [], base.dryRun) };
  }
  const client = new ApifoxClient(config.apiBaseUrl, request.token, undefined, config.timeoutMs, request.signal);
  const imported = await client.importOpenapi(config.projectId, JSON.stringify(analyzed.spec), {
    targetSchemaFolderId: config.schemaFolderId > 0 ? config.schemaFolderId : undefined,
    endpointOverwriteBehavior: config.endpointConflictBehavior,
    schemaOverwriteBehavior: config.schemaConflictBehavior,
    deleteUnmatchedResources: false,
    updateFolderOfChangedEndpoint: config.updateFolderOfChangedEndpoint,
  });
  return {
    ...base,
    counters: imported.counters,
    errors: imported.errors,
    ...endpointIndex(config, analyzed, imported.endpoints ?? [], base.dryRun),
  };
}

/** 报告用的逐接口索引：dry-run 只给清单不给链接，真实同步按导入响应生成并归因降级。 */
function endpointIndex(
  config: ResolvedConfig,
  analyzed: ProjectAnalysisResult,
  imported: Parameters<typeof buildEndpointLinks>[0]["imported"],
  dryRun: boolean
): Pick<SyncProjectResult, "endpoints" | "endpointLinks"> {
  if (dryRun) {
    return {
      endpoints: analyzed.endpoints.map((endpoint) => ({
        name: endpoint.summary?.trim() || endpoint.operationId,
        method: endpoint.method,
        path: endpoint.path,
      })),
      endpointLinks: { mode: "project", reason: ENDPOINT_LINK_DRY_RUN_REASON },
    };
  }
  const links = buildEndpointLinks({
    endpoints: analyzed.endpoints,
    imported,
    apiBaseUrl: config.apiBaseUrl,
    projectId: config.projectId,
  });
  const { mode, reason } = links;
  return { endpoints: links.links, endpointLinks: reason ? { mode, reason } : { mode } };
}

export function hasImportFailures(result: SyncResult): boolean {
  if (result.errors.length > 0) {
    return true;
  }
  return Object.entries(result.counters).some(([key, value]) => /Failed$/i.test(key) && value > 0);
}

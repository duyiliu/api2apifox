/**
 * 删除传播预览：对比本地生成的 OpenAPI 与 Apifox 远端导出的 OpenAPI，
 * 列出 import-openapi 在 `deleteUnmatchedResources: true` 时会删除的资源。
 *
 * 远端状态来自官方导出接口(export-openapi)，因此预览与真实删除使用同一份远端事实，
 * 不依赖本地基线文件；导出失败时必须中止，不能盲目执行删除。
 */
export interface UnmatchedEndpoint {
  method: string;
  path: string;
}

export interface UnmatchedResources {
  /** 远端存在、本地本次文档中不存在的接口 */
  endpoints: UnmatchedEndpoint[];
  /** 远端存在、本地本次文档中不存在的数据模型 */
  schemas: string[];
}

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordOf(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

/**
 * 计算远端相对本地的「未匹配资源」。
 *
 * 远端文档缺少 paths 时直接抛错：静默返回空预览会让后续删除在无提示情况下执行。
 */
export function diffOpenapiResources(local: { paths?: Record<string, unknown>; components?: { schemas?: Record<string, unknown> } }, remote: unknown): UnmatchedResources {
  if (!isRecord(remote) || !isRecord(remote.paths)) {
    throw new Error("Apifox 导出的 OpenAPI 缺少 paths，无法计算待删除资源");
  }

  const localPaths = recordOf(local.paths);
  const localSchemas = recordOf(local.components?.schemas);
  const endpoints: UnmatchedEndpoint[] = [];

  for (const [apiPath, remotePathItem] of Object.entries(recordOf(remote.paths))) {
    if (!isRecord(remotePathItem)) {
      continue;
    }
    const localPathItem = recordOf(localPaths[apiPath]);
    for (const method of HTTP_METHODS) {
      if (!isRecord(remotePathItem[method])) {
        continue;
      }
      if (!isRecord(localPathItem[method])) {
        endpoints.push({ method: method.toUpperCase(), path: apiPath });
      }
    }
  }
  endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

  const remoteComponents = recordOf(remote.components);
  const remoteSchemas = recordOf(remoteComponents.schemas);
  const schemas = Object.keys(remoteSchemas)
    .filter((name) => !Object.prototype.hasOwnProperty.call(localSchemas, name))
    .sort();

  return { endpoints, schemas };
}

export function hasUnmatchedResources(resources: UnmatchedResources): boolean {
  return resources.endpoints.length > 0 || resources.schemas.length > 0;
}

export function unmatchedResourceSummary(resources: UnmatchedResources): string {
  return `接口 ${resources.endpoints.length} 个，数据模型 ${resources.schemas.length} 个`;
}

/** 供确认框/CLI 文本复用的清单行；超出 limit 时给出剩余数量而不是截断后静默。 */
export function unmatchedResourceLines(resources: UnmatchedResources, limit = 20): string[] {
  const lines: string[] = [];
  for (const endpoint of resources.endpoints.slice(0, limit)) {
    lines.push(`接口 ${endpoint.method} ${endpoint.path}`);
  }
  if (resources.endpoints.length > limit) {
    lines.push(`… 另有 ${resources.endpoints.length - limit} 个待删除接口`);
  }
  for (const schema of resources.schemas.slice(0, limit)) {
    lines.push(`数据模型 ${schema}`);
  }
  if (resources.schemas.length > limit) {
    lines.push(`… 另有 ${resources.schemas.length - limit} 个待删除数据模型`);
  }
  return lines;
}

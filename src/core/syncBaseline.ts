import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { EndpointInfo } from "../java/model";
import { OpenApiSpec } from "../openapi/builder";
import { AnalyzeOutput } from "../pipeline";

/**
 * 增量同步基线：只记录「上次成功同步」的 operation 摘要，供下一次同步前做差异预览。
 *
 * 键包含 projectId + 同步 scope + method + path：
 * - projectId 隔离不同 Apifox 项目；
 * - scope 隔离同一项目下的工作区/文件/目录/勾选等不同来源，避免互相覆盖；
 * - method + path 是 Apifox 接口的稳定身份，路径改名表现为「源码已删除 + 新增」。
 */
export type SyncChangeStatus = "added" | "changed" | "unchanged" | "deleted";

export interface BaselineOperation {
  method: string;
  path: string;
  /** operation 及其引用数据模型的规范化摘要 */
  digest: string;
  summary?: string;
  folder?: string;
  sourceFile?: string;
  /** 上次成功写入基线的时间（ISO） */
  syncedAt: string;
}

export interface BaselineScope {
  updatedAt: string;
  operations: Record<string, BaselineOperation>;
}

export interface SyncBaseline {
  schemaVersion: 1;
  projects: Record<string, { scopes: Record<string, BaselineScope> }>;
}

export interface SyncCandidate {
  method: string;
  path: string;
  digest: string;
  summary?: string;
  folder?: string;
  sourceFile?: string;
}

export interface SyncDiffEntry {
  method: string;
  path: string;
  status: SyncChangeStatus;
  summary?: string;
  folder?: string;
  sourceFile?: string;
}

export interface SyncDiff {
  projectId: number;
  scope: string;
  /** 该 scope 是否已有历史基线 */
  hasBaseline: boolean;
  added: SyncDiffEntry[];
  changed: SyncDiffEntry[];
  unchanged: SyncDiffEntry[];
  deleted: SyncDiffEntry[];
  counts: Record<SyncChangeStatus, number>;
}

export const BASELINE_FILE_NAME = ".api2apifox-sync-baseline.json";

export function syncOperationKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}

export function baselinePathForProject(projectRoot: string): string {
  return path.join(projectRoot, BASELINE_FILE_NAME);
}

export function emptySyncBaseline(): SyncBaseline {
  return { schemaVersion: 1, projects: {} };
}

/** 规范化 JSON：对象键排序、忽略 undefined，保证同一 operation 的摘要稳定。 */
function canonicalJson(value: unknown): string {
  if (value === undefined) {
    return "null";
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}

function collectSchemaRefs(value: unknown, refs: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectSchemaRefs(item, refs);
    }
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === "$ref" && typeof child === "string") {
      const prefix = "#/components/schemas/";
      if (child.startsWith(prefix)) {
        try {
          refs.add(decodeURIComponent(child.slice(prefix.length)).replace(/~1/g, "/").replace(/~0/g, "~"));
        } catch {
          refs.add(child.slice(prefix.length));
        }
      }
      continue;
    }
    collectSchemaRefs(child, refs);
  }
}

/** operation 摘要包含其直接/间接引用的数据模型，DTO 字段变化也会被识别为「已变更」。 */
export function operationDigest(spec: OpenApiSpec, operation: Record<string, unknown>): string {
  const schemas = spec.components?.schemas ?? {};
  const refs = new Set<string>();
  collectSchemaRefs(operation, refs);

  const seen = new Set<string>();
  const queue = [...refs];
  while (queue.length) {
    const name = queue.shift()!;
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    const schema = schemas[name];
    if (!schema) {
      continue;
    }
    const before = refs.size;
    collectSchemaRefs(schema, refs);
    if (refs.size > before) {
      for (const ref of refs) {
        if (!seen.has(ref) && !queue.includes(ref)) {
          queue.push(ref);
        }
      }
    }
  }

  const referencedSchemas: Record<string, unknown> = {};
  for (const name of [...refs].sort()) {
    if (schemas[name]) {
      referencedSchemas[name] = schemas[name];
    }
  }
  const content = `${canonicalJson(operation)}\n${canonicalJson(referencedSchemas)}`;
  return createHash("sha256").update(content).digest("hex");
}

function operationOf(spec: OpenApiSpec, method: string, endpointPath: string): Record<string, unknown> | undefined {
  const operation = spec.paths[endpointPath]?.[method.toLowerCase()];
  return operation && typeof operation === "object" ? (operation as Record<string, unknown>) : undefined;
}

/** 从分析结果生成当前 scope 的 operation 候选摘要。 */
export function syncCandidates(analysis: Pick<AnalyzeOutput, "spec" | "endpoints">): SyncCandidate[] {
  return analysis.endpoints.map((endpoint) => {
    const operation = operationOf(analysis.spec, endpoint.method, endpoint.path);
    const fallback = {
      method: endpoint.method,
      path: endpoint.path,
      summary: endpoint.summary,
      folder: endpoint.tag,
    };
    return {
      method: endpoint.method.toUpperCase(),
      path: endpoint.path,
      digest: operationDigest(analysis.spec, operation ?? fallback),
      summary: endpoint.summary,
      folder: typeof operation?.["x-apifox-folder"] === "string" ? (operation["x-apifox-folder"] as string) : endpoint.tag,
      sourceFile: endpoint.fsPath.replace(/\\/g, "/"),
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeOperation(value: unknown): BaselineOperation | undefined {
  if (!isRecord(value)) {
    return;
  }
  if (typeof value.method !== "string" || typeof value.path !== "string" || typeof value.digest !== "string") {
    return;
  }
  return {
    method: value.method.toUpperCase(),
    path: value.path,
    digest: value.digest,
    summary: typeof value.summary === "string" ? value.summary : undefined,
    folder: typeof value.folder === "string" ? value.folder : undefined,
    sourceFile: typeof value.sourceFile === "string" ? value.sourceFile : undefined,
    syncedAt: typeof value.syncedAt === "string" ? value.syncedAt : "",
  };
}

/** 解析基线文件；损坏或版本不符时按「无基线」处理，不阻断同步。 */
export function parseSyncBaseline(raw: string | undefined | null): SyncBaseline {
  if (!raw) {
    return emptySyncBaseline();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptySyncBaseline();
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !isRecord(parsed.projects)) {
    return emptySyncBaseline();
  }
  const result = emptySyncBaseline();
  for (const [projectId, project] of Object.entries(parsed.projects)) {
    if (!isRecord(project) || !isRecord(project.scopes)) {
      continue;
    }
    const scopes: Record<string, BaselineScope> = {};
    for (const [scope, bucket] of Object.entries(project.scopes)) {
      if (!isRecord(bucket) || !isRecord(bucket.operations)) {
        continue;
      }
      const operations: Record<string, BaselineOperation> = {};
      for (const operation of Object.values(bucket.operations)) {
        const sanitized = sanitizeOperation(operation);
        if (sanitized) {
          operations[syncOperationKey(sanitized.method, sanitized.path)] = sanitized;
        }
      }
      scopes[scope] = {
        updatedAt: typeof bucket.updatedAt === "string" ? bucket.updatedAt : "",
        operations,
      };
    }
    result.projects[projectId] = { scopes };
  }
  return result;
}

export function serializeSyncBaseline(baseline: SyncBaseline): string {
  return `${JSON.stringify(baseline, null, 2)}\n`;
}

export async function readSyncBaselineFile(file: string): Promise<SyncBaseline> {
  try {
    return parseSyncBaseline(await fs.promises.readFile(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptySyncBaseline();
    }
    throw error;
  }
}

/** 原子写入基线，避免进程中断留下半个 JSON。 */
export async function writeSyncBaselineFile(file: string, baseline: SyncBaseline): Promise<void> {
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.promises.writeFile(temporary, serializeSyncBaseline(baseline), "utf8");
    await fs.promises.rename(temporary, file);
  } catch (error) {
    await fs.promises.rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}

function scopeOf(baseline: SyncBaseline, projectId: number, scope: string): BaselineScope | undefined {
  return baseline.projects[String(projectId)]?.scopes[scope];
}

/** 计算当前 operation 集合与指定 project + scope 基线的差异。 */
export function diffSyncBaseline(
  baseline: SyncBaseline,
  projectId: number,
  scope: string,
  candidates: SyncCandidate[]
): SyncDiff {
  const bucket = scopeOf(baseline, projectId, scope);
  const current = new Map<string, SyncCandidate>();
  const added: SyncDiffEntry[] = [];
  const changed: SyncDiffEntry[] = [];
  const unchanged: SyncDiffEntry[] = [];

  for (const candidate of candidates) {
    const key = syncOperationKey(candidate.method, candidate.path);
    current.set(key, candidate);
    const previous = bucket?.operations[key];
    const entry: SyncDiffEntry = {
      method: candidate.method,
      path: candidate.path,
      status: previous ? (previous.digest === candidate.digest ? "unchanged" : "changed") : "added",
      summary: candidate.summary,
      folder: candidate.folder,
      sourceFile: candidate.sourceFile,
    };
    if (entry.status === "added") {
      added.push(entry);
    } else if (entry.status === "changed") {
      changed.push(entry);
    } else {
      unchanged.push(entry);
    }
  }

  const deleted: SyncDiffEntry[] = [];
  for (const [key, previous] of Object.entries(bucket?.operations ?? {})) {
    if (current.has(key)) {
      continue;
    }
    deleted.push({
      method: previous.method,
      path: previous.path,
      status: "deleted",
      summary: previous.summary,
      folder: previous.folder,
      sourceFile: previous.sourceFile,
    });
  }
  deleted.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

  return {
    projectId,
    scope,
    hasBaseline: Boolean(bucket && Object.keys(bucket.operations).length),
    added,
    changed,
    unchanged,
    deleted,
    counts: {
      added: added.length,
      changed: changed.length,
      unchanged: unchanged.length,
      deleted: deleted.length,
    },
  };
}

/**
 * 记录一次成功同步。默认保留历史中被删除的 operation（以便持续提示源码已删除），
 * 只有显式 prune 时才从该 scope 基线中移除。
 */
export function recordSyncBaseline(
  baseline: SyncBaseline,
  projectId: number,
  scope: string,
  candidates: SyncCandidate[],
  options: { prune?: boolean; at?: Date } = {}
): SyncBaseline {
  const at = (options.at ?? new Date()).toISOString();
  const existing = scopeOf(baseline, projectId, scope);
  const operations: Record<string, BaselineOperation> = options.prune ? {} : { ...(existing?.operations ?? {}) };
  for (const candidate of candidates) {
    operations[syncOperationKey(candidate.method, candidate.path)] = {
      method: candidate.method.toUpperCase(),
      path: candidate.path,
      digest: candidate.digest,
      summary: candidate.summary,
      folder: candidate.folder,
      sourceFile: candidate.sourceFile,
      syncedAt: at,
    };
  }

  const projects = { ...baseline.projects };
  const project = { ...(projects[String(projectId)] ?? { scopes: {} }) };
  project.scopes = { ...project.scopes, [scope]: { updatedAt: at, operations } };
  projects[String(projectId)] = project;
  return { schemaVersion: 1, projects };
}

export function changedOperationKeys(diff: SyncDiff): Set<string> {
  return new Set([...diff.added, ...diff.changed].map((entry) => syncOperationKey(entry.method, entry.path)));
}

/** 只保留指定 method+path 的 operation 及其引用到的数据模型，供「仅同步变更」上传。 */
export function subsetAnalysisForKeys<T extends AnalyzeOutput>(
  analysis: T,
  keys: Set<string>
): T {
  const endpoints = analysis.endpoints.filter((endpoint) => keys.has(syncOperationKey(endpoint.method, endpoint.path)));
  const paths: Record<string, Record<string, unknown>> = {};
  const refs = new Set<string>();
  for (const endpoint of endpoints) {
    const operation = operationOf(analysis.spec, endpoint.method, endpoint.path);
    if (!operation) {
      continue;
    }
    const verb = endpoint.method.toLowerCase();
    paths[endpoint.path] = { ...(paths[endpoint.path] ?? {}), [verb]: operation };
    collectSchemaRefs(operation, refs);
  }

  const schemas = analysis.spec.components?.schemas ?? {};
  const seen = new Set<string>();
  const queue = [...refs];
  while (queue.length) {
    const name = queue.shift()!;
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    const schema = schemas[name];
    if (!schema) {
      continue;
    }
    collectSchemaRefs(schema, refs);
    for (const ref of refs) {
      if (schemas[ref] && !seen.has(ref) && !queue.includes(ref)) {
        queue.push(ref);
      }
    }
  }

  const selectedSchemas: Record<string, typeof schemas[string]> = {};
  for (const name of [...refs].sort()) {
    if (schemas[name]) {
      selectedSchemas[name] = schemas[name];
    }
  }
  const tags = analysis.spec.tags?.filter((tag) => endpoints.some((endpoint) => endpoint.tag === tag.name));

  return {
    ...analysis,
    endpoints,
    spec: {
      ...analysis.spec,
      paths,
      ...(tags?.length ? { tags } : { tags: undefined }),
      ...(Object.keys(selectedSchemas).length
        ? { components: { ...analysis.spec.components, schemas: selectedSchemas } }
        : { components: undefined }),
    },
  };
}

/** 结果面板/接口树使用的状态索引；同 method+path 后写覆盖。 */
export function syncStatusMap(diff: SyncDiff): Map<string, SyncChangeStatus> {
  const map = new Map<string, SyncChangeStatus>();
  for (const entry of [...diff.added, ...diff.changed, ...diff.unchanged, ...diff.deleted]) {
    map.set(syncOperationKey(entry.method, entry.path), entry.status);
  }
  return map;
}

export function endpointChangeStatus(
  statuses: Map<string, SyncChangeStatus> | undefined,
  endpoint: Pick<EndpointInfo, "method" | "path">
): SyncChangeStatus | undefined {
  return statuses?.get(syncOperationKey(endpoint.method, endpoint.path));
}

import { EndpointInfo } from "../java/model";
import { conflictBehaviorLabel } from "./syncPreflight";
import { endpointChangeStatus, SyncChangeStatus, SyncDiff, syncStatusMap } from "../core/syncBaseline";

/** Apifox 导入接口返回的计数（键名与 Apifox 开放 API 一致） */
export type ImportCounters = Record<string, number>;

/** Apifox 返回的导入错误条目 */
export interface ImportErrorItem {
  message?: string;
  code?: string;
}

export interface SyncSummaryRow {
  /** 分类：接口 / 数据模型 / 接口目录 / 数据模型目录 */
  category: string;
  created: number;
  updated: number;
  ignored: number;
  failed: number;
  total: number;
}

export interface SyncEndpointRow {
  /** 接口名（summary 优先，其次 operationId） */
  name: string;
  method: string;
  path: string;
  /** 目标目录（与写入 spec 的 x-apifox-folder 一致） */
  folder: string;
  controller: string;
  /** 源文件（相对工作区根目录，取不到根目录时为绝对路径） */
  file: string;
  /** 源文件绝对路径，仅用于结果面板跳转，不进入复制内容。 */
  fsPath: string;
  /** 方法起始偏移，缺失时打开文件但不定位。 */
  startOffset?: number;
  /** 相对上次成功同步的状态：added/changed/unchanged/deleted */
  status?: SyncChangeStatus;
}

/** 一次同步的结果快照，用于结果面板/通知展示 */
export interface SyncReport {
  /** 目标项目 ID（0 表示未绑定，面板不提供跳转） */
  projectId: number;
  /** 项目 Web 跳转地址(仅公网可推导;私有化部署缺省,面板隐藏跳转按钮) */
  projectUrl?: string;
  /** 目标：团队 / 项目（ID: x） */
  target: string;
  /** 本次同步范围，如“整个工作区” */
  scope: string;
  /** 完成时间（本地时间文本） */
  finishedAt: string;
  /** 冲突策略说明，用于解释“忽略”计数从何而来 */
  conflict: string;
  summary: SyncSummaryRow[];
  endpoints: SyncEndpointRow[];
  /** 相对上次成功基线的差异计数（无基线时为空） */
  changes?: Record<SyncChangeStatus, number>;
  /** 本次是否成功更新本地基线 */
  baselineUpdated?: boolean;
  errors: string[];
  warnings: string[];
}

export interface BuildSyncReportInput {
  counters: ImportCounters;
  errors: ImportErrorItem[];
  warnings: string[];
  endpoints: EndpointInfo[];
  target: string;
  projectId: number;
  /** 项目 Web 跳转地址(由调用方按 apiBaseUrl 推导,见 projectWebUrl) */
  projectUrl?: string;
  scope: string;
  endpointConflictBehavior: string;
  schemaConflictBehavior: string;
  /** 目录命名（与同步时写入 x-apifox-folder 的规则一致） */
  folderOf: (ep: EndpointInfo) => string;
  /** 工作区根目录：把源文件路径显示为相对路径 */
  workspaceRoot?: string;
  /** 同步前计算的增量差异（有基线/成功读取时提供） */
  diff?: SyncDiff;
  baselineUpdated?: boolean;
  finishedAt?: Date;
}

/** 汇总行定义：报告分类 → Apifox counters 键前缀 */
const SUMMARY_CATEGORIES: { category: string; base: string }[] = [
  { category: "接口", base: "endpoint" },
  { category: "数据模型", base: "schema" },
  { category: "接口目录", base: "endpointFolder" },
  { category: "数据模型目录", base: "schemaFolder" },
];

function counterOf(counters: ImportCounters, key: string): number {
  const value = counters[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * 汇总计数 → 表格行。
 * 接口/数据模型始终保留（0 也是有效信息）；目录只在确有变化时展示，避免空行噪音。
 */
function toSummaryRows(counters: ImportCounters): SyncSummaryRow[] {
  const rows: SyncSummaryRow[] = [];
  for (const { category, base } of SUMMARY_CATEGORIES) {
    const created = counterOf(counters, `${base}Created`);
    const updated = counterOf(counters, `${base}Updated`);
    const ignored = counterOf(counters, `${base}Ignored`);
    const failed = counterOf(counters, `${base}Failed`);
    const total = created + updated + ignored + failed;
    if (total === 0 && base !== "endpoint" && base !== "schema") {
      continue;
    }
    rows.push({ category, created, updated, ignored, failed, total });
  }
  return rows;
}

/** 本地时间文本（yyyy-MM-dd HH:mm:ss） */
export function formatSyncTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function relativePath(file: string, root: string): string {
  const normalized = file.replace(/\\/g, "/");
  if (!root) {
    return normalized;
  }
  return normalized.startsWith(root + "/") ? normalized.slice(root.length + 1) : normalized;
}

/**
 * 公网 Apifox 的项目 Web 控制台地址。
 * 私有化部署(apiBaseUrl 非官方域名)无法推导,返回 undefined,面板据此隐藏跳转按钮。
 */
export function projectWebUrl(apiBaseUrl: string, projectId: number): string | undefined {
  if (!(projectId > 0)) {
    return undefined;
  }
  try {
    const host = new URL(apiBaseUrl).hostname.toLowerCase();
    if (host === "api.apifox.com" || host === "apifox.com" || host === "www.apifox.com") {
      return `https://app.apifox.com/project/${projectId}`;
    }
  } catch {
    // 非法 URL 由上游配置校验拦截,这里按无法推导处理
  }
  return undefined;
}

export function buildSyncReport(input: BuildSyncReportInput): SyncReport {
  const root = (input.workspaceRoot ?? "").replace(/\\/g, "/").replace(/\/+$/, "");
  const statuses = input.diff ? syncStatusMap(input.diff) : undefined;
  const endpoints: SyncEndpointRow[] = input.endpoints.map((ep) => {
    const status = endpointChangeStatus(statuses, ep);
    return {
      name: ep.summary?.trim() || ep.operationId,
      method: ep.method,
      path: ep.path,
      folder: input.folderOf(ep),
      controller: ep.controller,
      file: relativePath(ep.fsPath, root),
      fsPath: ep.fsPath,
      startOffset: ep.methodRange?.startOffset,
      ...(status ? { status } : {}),
    };
  });

  return {
    projectId: input.projectId,
    projectUrl: input.projectUrl,
    target: input.target,
    scope: input.scope,
    finishedAt: formatSyncTime(input.finishedAt ?? new Date()),
    conflict: `接口=${conflictBehaviorLabel(input.endpointConflictBehavior)}；数据模型=${conflictBehaviorLabel(
      input.schemaConflictBehavior
    )}`,
    summary: toSummaryRows(input.counters),
    endpoints,
    changes: input.diff?.counts,
    baselineUpdated: input.baselineUpdated,
    errors: input.errors.map((e) => e.message || e.code || "未知错误"),
    warnings: [...input.warnings],
  };
}

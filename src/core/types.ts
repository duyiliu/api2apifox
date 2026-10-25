import { AnalyzeOutput } from "../pipeline";
import { EndpointInfo } from "../java/model";
import { SyncDiff } from "./syncBaseline";

export type ConflictBehavior = "OVERWRITE_EXISTING" | "AUTO_MERGE" | "KEEP_EXISTING" | "CREATE_NEW";

export interface Diagnostic {
  level: "warning" | "error";
  code: string;
  message: string;
  file?: string;
  line?: number;
}

export interface ResolvedConfig {
  projectRoot: string;
  title: string;
  projectId: number;
  apiBaseUrl: string;
  endpointConflictBehavior: ConflictBehavior;
  schemaConflictBehavior: ConflictBehavior;
  include: string[];
  exclude: string[];
  exportPath: string;
  pageTypeStyle: "mybatis-plus" | "spring-data";
  folderNameSource: "tag" | "controller";
  rootFolderName: string;
  schemaFolderId: number;
  helperPropertiesEnabled: boolean;
  enumFieldDoc: boolean;
  dependencyRepos: string[];
  dependencyJars: string[];
  /** 依赖 jar 解析总数上限(直接 + 传递依赖);0 表示不做依赖解析 */
  maxDependencyJars: number;
  timeoutMs: number;
}

export type ConfigSource = "default" | `file:${string}` | `env:${string}` | "cli";

export interface ResolvedConfigResult {
  config: ResolvedConfig;
  sources: Record<keyof Omit<ResolvedConfig, "projectRoot">, ConfigSource>;
  configFile?: string;
  token?: string;
  tokenSource?: `env:${string}` | "cli";
  diagnostics: Diagnostic[];
}

export interface ProjectAnalysisResult extends AnalyzeOutput {
  projectRoot: string;
  scannedFiles: number;
  skippedFiles: number;
  diagnostics: Diagnostic[];
}

export interface EndpointSummary {
  method: string;
  path: string;
  summary?: string;
  folder: string;
  controller: string;
  file: string;
  line?: number;
  flavor: EndpointInfo["flavor"];
}

export interface SyncResult {
  dryRun: boolean;
  target: {
    projectId: number;
    apiBaseUrl: string;
  };
  scope: {
    type: "workspace" | "file" | "endpoint" | "selection";
    /** 基线隔离键：同一类型下不同文件/目录/勾选集合互不覆盖 */
    key?: string;
    endpointCount: number;
  };
  counters: Record<string, number>;
  errors: { message?: string; code?: string }[];
  /** 本次同步前相对上次成功基线的差异（dry-run 与真实同步都会返回） */
  diff?: SyncDiff;
  /** 是否真正发起了 Apifox 导入（仅同步变更且无变化时为 false） */
  imported?: boolean;
  /** 本次是否成功更新了本地基线 */
  baselineUpdated?: boolean;
}

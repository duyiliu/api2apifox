import { AnalyzeOutput } from "../pipeline";
import { EndpointInfo } from "../java/model";
import { UnmatchedResources } from "./deletePreview";

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
  /** 全量工作区同步时删除 Apifox 中本次文档未出现的接口/模型(默认 false) */
  deleteUnmatchedResources: boolean;
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
    endpointCount: number;
  };
  /** 本次是否请求了删除传播(仅全量工作区允许) */
  deleteUnmatchedResources: boolean;
  /** dry-run 预览：远端存在但本次文档中未出现的资源 */
  deletionPreview?: UnmatchedResources;
  counters: Record<string, number>;
  errors: { message?: string; code?: string }[];
}

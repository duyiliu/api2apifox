import { AnalyzeOutput } from "../pipeline";
import { EndpointInfo } from "../java/model";

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
  timeoutMs: number;
}

export type ConfigSource = "default" | `file:${string}` | `env:${string}` | "cli";

export interface ResolvedConfigResult {
  config: ResolvedConfig;
  sources: Record<keyof Omit<ResolvedConfig, "projectRoot" | "title">, ConfigSource>;
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
  counters: Record<string, number>;
  errors: { message?: string; code?: string }[];
}

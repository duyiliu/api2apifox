import * as fs from "node:fs";
import * as path from "node:path";
import { ConfigSource, ConflictBehavior, Diagnostic, ResolvedConfig, ResolvedConfigResult } from "./types";

const DEFAULT_INCLUDE = ["**/src/main/java/**/*.java"];
const DEFAULT_EXCLUDE = ["**/target/**", "**/build/**", "**/src/test/**", "**/sample/**", "**/.*/**"];
const CONFLICT_BEHAVIORS: ConflictBehavior[] = ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"];

interface FileConfig {
  token?: unknown;
  projectId?: unknown;
  apiBaseUrl?: unknown;
  endpointConflictBehavior?: unknown;
  schemaConflictBehavior?: unknown;
  include?: unknown;
  exclude?: unknown;
  exportPath?: unknown;
  pageTypeStyle?: unknown;
  folderNameSource?: unknown;
  rootFolderName?: unknown;
  schemaFolderId?: unknown;
  helperProperties?: unknown;
  dependencyRepos?: unknown;
  dependencyJars?: unknown;
  maxDependencyJars?: unknown;
  deleteUnmatchedResources?: unknown;
  timeoutMs?: unknown;
  title?: unknown;
  $schema?: unknown;
}

export interface ConfigOverrides {
  configFile?: string;
  token?: string;
  projectId?: number;
  apiBaseUrl?: string;
  endpointConflictBehavior?: ConflictBehavior;
  schemaConflictBehavior?: ConflictBehavior;
  include?: string[];
  exclude?: string[];
  exportPath?: string;
  pageTypeStyle?: "mybatis-plus" | "spring-data";
  folderNameSource?: "tag" | "controller";
  rootFolderName?: string;
  schemaFolderId?: number;
  helperPropertiesEnabled?: boolean;
  enumFieldDoc?: boolean;
  dependencyRepos?: string[];
  dependencyJars?: string[];
  maxDependencyJars?: number;
  deleteUnmatchedResources?: boolean;
  timeoutMs?: number;
  title?: string;
}

export class ConfigError extends Error {
  constructor(readonly diagnostics: Diagnostic[]) {
    super(diagnostics.map((item) => item.message).join("\n"));
  }
}

export function resolveConfig(
  projectRoot: string,
  overrides: ConfigOverrides = {},
  env: NodeJS.ProcessEnv = process.env
): ResolvedConfigResult {
  const root = path.resolve(projectRoot);
  const diagnostics: Diagnostic[] = [];
  const explicitConfig = overrides.configFile ?? env.API2APIFOX_CONFIG;
  const configPath = explicitConfig
    ? path.resolve(root, explicitConfig)
    : path.join(root, ".api2apifox.json");
  const requiredConfig = explicitConfig !== undefined;
  const fileConfig = readConfigFile(configPath, requiredConfig, diagnostics);
  const fileSource = `file:${toPosix(path.relative(root, configPath) || path.basename(configPath))}` as const;
  validateKnownKeys(fileConfig, configPath, diagnostics);

  if (Object.prototype.hasOwnProperty.call(fileConfig, "token")) {
    diagnostics.push({
      level: "error",
      code: "CONFIG_TOKEN_FORBIDDEN",
      message: `${configPath} 不允许包含 token，请使用 API2APIFOX_TOKEN 环境变量`,
      file: configPath,
    });
  }

  const defaults: ResolvedConfig = {
    projectRoot: root,
    title: path.basename(root) || "API",
    projectId: 0,
    apiBaseUrl: "https://api.apifox.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: [...DEFAULT_INCLUDE],
    exclude: [...DEFAULT_EXCLUDE],
    exportPath: "openapi.gen.json",
    pageTypeStyle: "mybatis-plus",
    folderNameSource: "tag",
    rootFolderName: "",
    schemaFolderId: 0,
    helperPropertiesEnabled: true,
    enumFieldDoc: false,
    dependencyRepos: [],
    dependencyJars: [],
    // 依赖解析的资源预算:默认 120 已覆盖常见项目;超出时告警列出被丢弃的 jar
    maxDependencyJars: 120,
    // 删除传播是破坏性操作:默认关闭,仅显式开启的全量工作区同步才允许
    deleteUnmatchedResources: false,
    // OpenAPI 导入首次创建目录、接口和模型可能超过一分钟；CLI 默认等待五分钟。
    timeoutMs: 300_000,
  };

  type SourceKey = keyof Omit<ResolvedConfig, "projectRoot" | "title">;
  const sources = Object.fromEntries(
    (Object.keys(defaults) as (keyof ResolvedConfig)[])
      .filter((key): key is SourceKey => key !== "projectRoot" && key !== "title")
      .map((key) => [key, "default"])
  ) as Record<string, ConfigSource>;
  sources.title = "default";
  const config: ResolvedConfig = { ...defaults };

  const helper = isRecord(fileConfig.helperProperties) ? fileConfig.helperProperties : {};
  applyFile(config, sources, "projectId", numberValue(fileConfig.projectId, "projectId", diagnostics), fileSource);
  applyFile(config, sources, "apiBaseUrl", stringValue(fileConfig.apiBaseUrl, "apiBaseUrl", diagnostics), fileSource);
  applyFile(config, sources, "endpointConflictBehavior", conflictValue(fileConfig.endpointConflictBehavior, "endpointConflictBehavior", diagnostics), fileSource);
  applyFile(config, sources, "schemaConflictBehavior", conflictValue(fileConfig.schemaConflictBehavior, "schemaConflictBehavior", diagnostics), fileSource);
  applyFile(config, sources, "include", stringArrayValue(fileConfig.include, "include", diagnostics), fileSource);
  applyFile(config, sources, "exclude", stringArrayValue(fileConfig.exclude, "exclude", diagnostics), fileSource);
  applyFile(config, sources, "exportPath", stringValue(fileConfig.exportPath, "exportPath", diagnostics), fileSource);
  applyFile(config, sources, "pageTypeStyle", enumValue(fileConfig.pageTypeStyle, "pageTypeStyle", ["mybatis-plus", "spring-data"], diagnostics), fileSource);
  applyFile(config, sources, "folderNameSource", enumValue(fileConfig.folderNameSource, "folderNameSource", ["tag", "controller"], diagnostics), fileSource);
  applyFile(config, sources, "rootFolderName", stringValue(fileConfig.rootFolderName, "rootFolderName", diagnostics), fileSource);
  applyFile(config, sources, "schemaFolderId", numberValue(fileConfig.schemaFolderId, "schemaFolderId", diagnostics), fileSource);
  applyFile(config, sources, "helperPropertiesEnabled", booleanValue(helper.enabled, "helperProperties.enabled", diagnostics), fileSource);
  applyFile(config, sources, "enumFieldDoc", booleanValue(helper.enumFieldDoc, "helperProperties.enumFieldDoc", diagnostics), fileSource);
  applyFile(config, sources, "dependencyRepos", stringArrayValue(fileConfig.dependencyRepos, "dependencyRepos", diagnostics), fileSource);
  applyFile(config, sources, "dependencyJars", stringArrayValue(fileConfig.dependencyJars, "dependencyJars", diagnostics), fileSource);
  applyFile(config, sources, "maxDependencyJars", numberValue(fileConfig.maxDependencyJars, "maxDependencyJars", diagnostics), fileSource);
  applyFile(config, sources, "deleteUnmatchedResources", booleanValue(fileConfig.deleteUnmatchedResources, "deleteUnmatchedResources", diagnostics), fileSource);
  applyFile(config, sources, "timeoutMs", numberValue(fileConfig.timeoutMs, "timeoutMs", diagnostics), fileSource);
  if (typeof fileConfig.title === "string" && fileConfig.title.trim()) {
    config.title = fileConfig.title.trim();
    sources.title = fileSource;
  } else if (fileConfig.title !== undefined) {
    invalid("title 必须是非空字符串", diagnostics);
  }

  applyEnv(config, sources, "projectId", env.API2APIFOX_PROJECT_ID, "API2APIFOX_PROJECT_ID", parseEnvNumber, diagnostics);
  applyEnv(config, sources, "apiBaseUrl", env.API2APIFOX_API_BASE_URL, "API2APIFOX_API_BASE_URL", parseEnvString, diagnostics);
  applyEnv(config, sources, "endpointConflictBehavior", env.API2APIFOX_ENDPOINT_CONFLICT, "API2APIFOX_ENDPOINT_CONFLICT", parseEnvConflict, diagnostics);
  applyEnv(config, sources, "schemaConflictBehavior", env.API2APIFOX_SCHEMA_CONFLICT, "API2APIFOX_SCHEMA_CONFLICT", parseEnvConflict, diagnostics);
  applyEnv(config, sources, "deleteUnmatchedResources", env.API2APIFOX_DELETE_UNMATCHED_RESOURCES, "API2APIFOX_DELETE_UNMATCHED_RESOURCES", parseEnvBoolean, diagnostics);

  for (const [key, value] of Object.entries(overrides) as [keyof ConfigOverrides, ConfigOverrides[keyof ConfigOverrides]][]) {
    if (key === "configFile" || key === "token" || value === undefined || key === "title") {
      continue;
    }
    (config as unknown as Record<string, unknown>)[key] = value;
    sources[key as SourceKey] = "cli";
  }
  if (overrides.title?.trim()) {
    config.title = overrides.title.trim();
    sources.title = "cli";
  }

  validateResolvedConfig(config, diagnostics);
  if (diagnostics.some((item) => item.level === "error")) {
    throw new ConfigError(diagnostics);
  }

  const token = overrides.token ?? env.API2APIFOX_TOKEN;
  const tokenSource = overrides.token ? "cli" : env.API2APIFOX_TOKEN ? "env:API2APIFOX_TOKEN" : undefined;
  return {
    config,
    sources: sources as ResolvedConfigResult["sources"],
    configFile: fs.existsSync(configPath) ? configPath : undefined,
    token,
    tokenSource,
    diagnostics,
  };
}

function validateKnownKeys(config: FileConfig, configPath: string, diagnostics: Diagnostic[]): void {
  const known = new Set([
    "$schema",
    "title",
    "projectId",
    "apiBaseUrl",
    "endpointConflictBehavior",
    "schemaConflictBehavior",
    "include",
    "exclude",
    "exportPath",
    "pageTypeStyle",
    "folderNameSource",
    "rootFolderName",
    "schemaFolderId",
    "helperProperties",
    "dependencyRepos",
    "dependencyJars",
    "maxDependencyJars",
    "deleteUnmatchedResources",
    "timeoutMs",
    "token",
  ]);
  for (const key of Object.keys(config)) {
    if (!known.has(key)) {
      invalid(`未知配置字段:${key}`, diagnostics, configPath);
    }
  }
  if (config.helperProperties !== undefined) {
    if (!isRecord(config.helperProperties) || Array.isArray(config.helperProperties)) {
      invalid("helperProperties 必须是对象", diagnostics, configPath);
    } else {
      for (const key of Object.keys(config.helperProperties)) {
        if (key !== "enabled" && key !== "enumFieldDoc") {
          invalid(`未知配置字段:helperProperties.${key}`, diagnostics, configPath);
        }
      }
    }
  }
}

function readConfigFile(configPath: string, required: boolean, diagnostics: Diagnostic[]): FileConfig {
  if (!fs.existsSync(configPath)) {
    if (required) {
      diagnostics.push({ level: "error", code: "CONFIG_NOT_FOUND", message: `配置文件不存在:${configPath}`, file: configPath });
    }
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (!isRecord(parsed) || Array.isArray(parsed)) {
      invalid("配置文件根节点必须是对象", diagnostics, configPath);
      return {};
    }
    return parsed as FileConfig;
  } catch (error) {
    diagnostics.push({
      level: "error",
      code: "CONFIG_INVALID_JSON",
      message: `配置文件解析失败:${error instanceof Error ? error.message : String(error)}`,
      file: configPath,
    });
    return {};
  }
}

function applyFile<K extends keyof ResolvedConfig>(
  config: ResolvedConfig,
  sources: Record<string, ConfigSource>,
  key: K,
  value: ResolvedConfig[K] | undefined,
  source: ConfigSource
): void {
  if (value !== undefined) {
    config[key] = value;
    sources[key] = source;
  }
}

function applyEnv<K extends keyof ResolvedConfig>(
  config: ResolvedConfig,
  sources: Record<string, ConfigSource>,
  key: K,
  raw: string | undefined,
  envName: string,
  parser: (raw: string) => ResolvedConfig[K] | undefined,
  diagnostics: Diagnostic[]
): void {
  if (raw === undefined) {
    return;
  }
  const value = parser(raw);
  if (value === undefined) {
    invalid(`${envName} 的值无效:${raw}`, diagnostics);
    return;
  }
  config[key] = value;
  sources[key] = `env:${envName}`;
}

function validateResolvedConfig(config: ResolvedConfig, diagnostics: Diagnostic[]): void {
  if (!Number.isInteger(config.projectId) || config.projectId < 0) {
    invalid("projectId 必须是大于等于 0 的整数", diagnostics);
  }
  if (!Number.isInteger(config.schemaFolderId) || config.schemaFolderId < 0) {
    invalid("schemaFolderId 必须是大于等于 0 的整数", diagnostics);
  }
  if (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0) {
    invalid("timeoutMs 必须是正数", diagnostics);
  }
  if (!Number.isInteger(config.maxDependencyJars) || config.maxDependencyJars < 0) {
    invalid("maxDependencyJars 必须是大于等于 0 的整数", diagnostics);
  }
  try {
    const protocol = new URL(config.apiBaseUrl).protocol;
    if (protocol !== "http:" && protocol !== "https:") {
      invalid("apiBaseUrl 只允许 http 或 https", diagnostics);
    }
  } catch {
    invalid("apiBaseUrl 不是合法 URL", diagnostics);
  }
  if (!config.include.length) {
    invalid("include 至少需要一个 glob", diagnostics);
  }
}

function invalid(message: string, diagnostics: Diagnostic[], file?: string): void {
  diagnostics.push({ level: "error", code: "CONFIG_INVALID", message, file });
}

function stringValue(value: unknown, name: string, diagnostics: Diagnostic[]): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    invalid(`${name} 必须是字符串`, diagnostics);
    return undefined;
  }
  return value;
}

function numberValue(value: unknown, name: string, diagnostics: Diagnostic[]): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    invalid(`${name} 必须是数字`, diagnostics);
    return undefined;
  }
  return value;
}

function booleanValue(value: unknown, name: string, diagnostics: Diagnostic[]): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    invalid(`${name} 必须是布尔值`, diagnostics);
    return undefined;
  }
  return value;
}

function stringArrayValue(value: unknown, name: string, diagnostics: Diagnostic[]): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    invalid(`${name} 必须是字符串数组`, diagnostics);
    return undefined;
  }
  return value;
}

function conflictValue(value: unknown, name: string, diagnostics: Diagnostic[]): ConflictBehavior | undefined {
  return enumValue(value, name, CONFLICT_BEHAVIORS, diagnostics);
}

function enumValue<T extends string>(value: unknown, name: string, values: readonly T[], diagnostics: Diagnostic[]): T | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string" || !values.includes(value as T)) {
    invalid(`${name} 必须是 ${values.join(" | ")}`, diagnostics);
    return undefined;
  }
  return value as T;
}

function parseEnvNumber(raw: string): number | undefined {
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function parseEnvString(raw: string): string | undefined {
  return raw;
}

function parseEnvConflict(raw: string): ConflictBehavior | undefined {
  return CONFLICT_BEHAVIORS.includes(raw as ConflictBehavior) ? (raw as ConflictBehavior) : undefined;
}

function parseEnvBoolean(raw: string): boolean | undefined {
  if (raw === "true" || raw === "1") {
    return true;
  }
  if (raw === "false" || raw === "0") {
    return false;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPosix(value: string): string {
  return value.replace(/\\/g, "/");
}

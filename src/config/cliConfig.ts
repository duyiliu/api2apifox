import { CLI_CONFIG_DEFAULTS } from "./defaults";

export const CLI_CONFIG_FILENAME = ".api2apifox.json";

/**
 * 从扩展设置中取出的、可与 CLI 配置一一对应的字段。
 * 刻意不包含 projectName/teamName/token/schemaFolderName/enableCodeLens：
 * 它们要么只属于扩展，要么是 CLI 明确禁止写入的凭据。
 */
export interface CliConfigSource {
  projectId: number;
  apiBaseUrl: string;
  endpointConflictBehavior: string;
  schemaConflictBehavior: string;
  include: string[];
  exclude: string[];
  exportPath: string;
  pageTypeStyle: "mybatis-plus" | "spring-data";
  folderNameSource: "tag" | "controller";
  rootFolderName: string;
  schemaFolderId: number;
  helperProperties: boolean;
  enumFieldDoc: boolean;
  dependencyRepos: string[];
  dependencyJars: string[];
  maxDependencyJars: number;
}

/** `.api2apifox.json` 中由扩展生成的字段（helperProperties 为 CLI 的嵌套形态）。 */
export interface CliConfigFile {
  projectId: number;
  apiBaseUrl: string;
  endpointConflictBehavior: string;
  schemaConflictBehavior: string;
  include: string[];
  exclude: string[];
  exportPath: string;
  pageTypeStyle: "mybatis-plus" | "spring-data";
  folderNameSource: "tag" | "controller";
  rootFolderName: string;
  schemaFolderId: number;
  helperProperties: {
    enabled: boolean;
    enumFieldDoc: boolean;
  };
  dependencyRepos: string[];
  dependencyJars: string[];
  maxDependencyJars: number;
}

type FlatCliConfig = Omit<CliConfigFile, "helperProperties"> & {
  helperPropertiesEnabled: boolean;
  enumFieldDoc: boolean;
};

export interface CliConfigDrift {
  field: string;
  /** 目标文件当前值（缺失时按 CLI 默认值补齐）；token 只标记存在，不输出明文 */
  current: unknown;
  /** 扩展有效设置对应的期望值 */
  expected: unknown;
}

export interface ParsedCliConfig {
  data?: Record<string, unknown>;
  error?: string;
}

const FLAT_FIELDS: (keyof FlatCliConfig)[] = [
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
  "helperPropertiesEnabled",
  "enumFieldDoc",
  "dependencyRepos",
  "dependencyJars",
  "maxDependencyJars",
];

const FLAT_DEFAULTS: FlatCliConfig = {
  projectId: CLI_CONFIG_DEFAULTS.projectId,
  apiBaseUrl: CLI_CONFIG_DEFAULTS.apiBaseUrl,
  endpointConflictBehavior: CLI_CONFIG_DEFAULTS.endpointConflictBehavior,
  schemaConflictBehavior: CLI_CONFIG_DEFAULTS.schemaConflictBehavior,
  include: [...CLI_CONFIG_DEFAULTS.include],
  exclude: [...CLI_CONFIG_DEFAULTS.exclude],
  exportPath: CLI_CONFIG_DEFAULTS.exportPath,
  pageTypeStyle: CLI_CONFIG_DEFAULTS.pageTypeStyle,
  folderNameSource: CLI_CONFIG_DEFAULTS.folderNameSource,
  rootFolderName: CLI_CONFIG_DEFAULTS.rootFolderName,
  schemaFolderId: CLI_CONFIG_DEFAULTS.schemaFolderId,
  helperPropertiesEnabled: CLI_CONFIG_DEFAULTS.helperPropertiesEnabled,
  enumFieldDoc: CLI_CONFIG_DEFAULTS.enumFieldDoc,
  dependencyRepos: [...CLI_CONFIG_DEFAULTS.dependencyRepos],
  dependencyJars: [...CLI_CONFIG_DEFAULTS.dependencyJars],
  maxDependencyJars: CLI_CONFIG_DEFAULTS.maxDependencyJars,
};

/** 把扩展的生效设置映射为 CLI 配置文件内容（单向生成，不包含 token）。 */
export function buildCliConfig(settings: CliConfigSource): CliConfigFile {
  return {
    projectId: settings.projectId,
    apiBaseUrl: settings.apiBaseUrl,
    endpointConflictBehavior: settings.endpointConflictBehavior,
    schemaConflictBehavior: settings.schemaConflictBehavior,
    include: [...settings.include],
    exclude: [...settings.exclude],
    exportPath: settings.exportPath,
    pageTypeStyle: settings.pageTypeStyle,
    folderNameSource: settings.folderNameSource,
    rootFolderName: settings.rootFolderName,
    schemaFolderId: settings.schemaFolderId,
    helperProperties: {
      enabled: settings.helperProperties,
      enumFieldDoc: settings.enumFieldDoc,
    },
    dependencyRepos: [...settings.dependencyRepos],
    dependencyJars: [...settings.dependencyJars],
    maxDependencyJars: settings.maxDependencyJars,
  };
}

/**
 * 比较现有 `.api2apifox.json` 与扩展有效值。
 * 缺失字段按 CLI 默认值参与比较，因此“文件里没写、但默认值相同”不算漂移；
 * 用户自行维护的 `$schema`/`title`/`timeoutMs` 不参与比较，更新时原样保留。
 */
export function compareCliConfig(desired: CliConfigFile, existing: Record<string, unknown>): CliConfigDrift[] {
  const drifts: CliConfigDrift[] = [];
  if (Object.prototype.hasOwnProperty.call(existing, "token")) {
    drifts.push({ field: "token", current: "已存在（CLI 禁止写入）", expected: "移除" });
  }

  const desiredFlat = flatten(desired);
  const helper = isRecord(existing.helperProperties) ? existing.helperProperties : undefined;
  const helperInvalid = existing.helperProperties !== undefined && helper === undefined;
  if (helperInvalid) {
    drifts.push({ field: "helperProperties", current: existing.helperProperties, expected: desired.helperProperties });
  }

  for (const field of FLAT_FIELDS) {
    if (helperInvalid && (field === "helperPropertiesEnabled" || field === "enumFieldDoc")) {
      continue;
    }
    const current = currentValue(field, existing, helper);
    if (!sameValue(current, desiredFlat[field])) {
      drifts.push({ field, current, expected: desiredFlat[field] });
    }
  }
  return drifts;
}

/**
 * 显式覆盖映射字段：保留 `$schema`/`title`/`timeoutMs` 等 CLI 自身字段，
 * 移除 CLI 禁止的 token，其余映射字段整体替换为扩展当前值。
 */
export function mergeCliConfig(
  existing: Record<string, unknown> | undefined,
  desired: CliConfigFile
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...(existing ?? {}) };
  delete merged.token;
  Object.assign(merged, desired);
  return merged;
}

/** 解析现有配置文件；根节点不是对象时按解析失败处理，允许用户显式覆盖。 */
export function parseCliConfig(text: string): ParsedCliConfig {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed) || Array.isArray(parsed)) {
      return { error: "配置文件根节点必须是对象" };
    }
    return { data: parsed };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/** 供“复制等效命令”使用：读取同一份配置后只扫描、不写 Apifox。 */
export function cliEquivalentCommand(projectRoot: string): string {
  return `api2apifox scan --project "${projectRoot.replace(/"/g, '\\"')}" --format json`;
}

/** 把漂移项格式化为可读的多行说明（token 永远只显示状态，不显示值）。 */
export function formatCliConfigDrift(drifts: CliConfigDrift[]): string {
  return drifts
    .map((drift) => `- ${drift.field}: 当前 ${formatValue(drift.current)} → 期望 ${formatValue(drift.expected)}`)
    .join("\n");
}

function flatten(config: CliConfigFile): FlatCliConfig {
  return {
    projectId: config.projectId,
    apiBaseUrl: config.apiBaseUrl,
    endpointConflictBehavior: config.endpointConflictBehavior,
    schemaConflictBehavior: config.schemaConflictBehavior,
    include: config.include,
    exclude: config.exclude,
    exportPath: config.exportPath,
    pageTypeStyle: config.pageTypeStyle,
    folderNameSource: config.folderNameSource,
    rootFolderName: config.rootFolderName,
    schemaFolderId: config.schemaFolderId,
    helperPropertiesEnabled: config.helperProperties.enabled,
    enumFieldDoc: config.helperProperties.enumFieldDoc,
    dependencyRepos: config.dependencyRepos,
    dependencyJars: config.dependencyJars,
    maxDependencyJars: config.maxDependencyJars,
  };
}

function currentValue(
  field: keyof FlatCliConfig,
  existing: Record<string, unknown>,
  helper: Record<string, unknown> | undefined
): unknown {
  if (field === "helperPropertiesEnabled") {
    return helper && helper.enabled !== undefined ? helper.enabled : FLAT_DEFAULTS.helperPropertiesEnabled;
  }
  if (field === "enumFieldDoc") {
    return helper && helper.enumFieldDoc !== undefined ? helper.enumFieldDoc : FLAT_DEFAULTS.enumFieldDoc;
  }
  return Object.prototype.hasOwnProperty.call(existing, field) ? existing[field] : FLAT_DEFAULTS[field];
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function formatValue(value: unknown): string {
  if (value === undefined) {
    return "未设置";
  }
  const text = typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value) ?? String(value);
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

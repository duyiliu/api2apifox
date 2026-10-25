/**
 * 扩展设置与 CLI 配置共享的默认值。
 *
 * 两端仍各自读取自己的配置（VS Code `apifoxHelper.*` / `.api2apifox.json`），
 * 但扫描范围等默认值必须只维护一份，否则 CLI 与编辑器会静默扫到不同文件集。
 * 导出 CLI 配置时的漂移比较也以这些默认值为基准（配置文件缺省字段按默认值处理）。
 */
export interface CliConfigDefaults {
  projectId: number;
  apiBaseUrl: string;
  endpointConflictBehavior: "OVERWRITE_EXISTING" | "AUTO_MERGE" | "KEEP_EXISTING" | "CREATE_NEW";
  schemaConflictBehavior: "OVERWRITE_EXISTING" | "AUTO_MERGE" | "KEEP_EXISTING" | "CREATE_NEW";
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
  maxDependencyJars: number;
}

export const CLI_CONFIG_DEFAULTS: CliConfigDefaults = {
  projectId: 0,
  apiBaseUrl: "https://api.apifox.com",
  endpointConflictBehavior: "OVERWRITE_EXISTING",
  schemaConflictBehavior: "OVERWRITE_EXISTING",
  include: ["**/src/main/java/**/*.java"],
  exclude: ["**/target/**", "**/build/**", "**/src/test/**", "**/sample/**", "**/.*/**"],
  exportPath: "openapi.gen.json",
  pageTypeStyle: "mybatis-plus",
  folderNameSource: "tag",
  rootFolderName: "",
  schemaFolderId: 0,
  helperPropertiesEnabled: true,
  enumFieldDoc: false,
  dependencyRepos: [],
  dependencyJars: [],
  maxDependencyJars: 120,
};

export const DEFAULT_INCLUDE = CLI_CONFIG_DEFAULTS.include;
export const DEFAULT_EXCLUDE = CLI_CONFIG_DEFAULTS.exclude;

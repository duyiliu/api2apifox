import * as vscode from "vscode";
import { CLI_CONFIG_DEFAULTS } from "./defaults";

export interface ApifoxSettings {
  projectId: number;
  projectName?: string;
  teamName?: string;
  apiBaseUrl: string;
  endpointConflictBehavior: string;
  schemaConflictBehavior: string;
  include: string[];
  exclude: string[];
  exportPath: string;
  /** 简单名为 Page 的分页包装按哪个库展开 */
  pageTypeStyle: "mybatis-plus" | "spring-data";
  /** 接口目录命名来源:@Tag 还是 Controller 类名 */
  folderNameSource: "tag" | "controller";
  /** 可选:所有目录放到该父目录下(不存在则创建) */
  rootFolderName: string;
  /** 可选:数据模型导入到该目录(数字 ID,Apifox 已不支持按名查找) */
  schemaFolderId: number;
  /** @deprecated 已废弃:Apifox 下线了目录查询接口,请改用 schemaFolderId */
  schemaFolderName: string;
  /** 是否启用 .apifox-helper.properties(默认 true) */
  helperProperties: boolean;
  /** 枚举字段自动追加「(枚举类:X)」(默认 false,对应团队 groovy 规则意图) */
  enumFieldDoc: boolean;
  /** 额外的本地 Maven 仓库目录(自动发现 ~/.m2 之外再补充,如 D:/repository) */
  dependencyRepos: string[];
  /** 显式依赖 jar 路径(优先于仓库发现) */
  dependencyJars: string[];
  /** 依赖 jar 解析总数上限(默认 120;0 表示不做依赖解析) */
  maxDependencyJars: number;
  /** 是否在 Java Controller 方法上方显示 CodeLens「同步此接口」(默认 true) */
  enableCodeLens: boolean;
}

/**
 * 读取扩展的生效设置。
 * 传入 resource（工作区文件夹）时会合并用户级、工作区级与文件夹级设置，
 * 导出 CLI 配置需按目标工作区取值，避免多根工作区误用其他文件夹的覆盖值。
 */
export function getSettings(resource?: vscode.Uri | vscode.WorkspaceFolder): ApifoxSettings {
  const cfg = vscode.workspace.getConfiguration("apifoxHelper", resource);
  return {
    projectId: cfg.get<number>("projectId", CLI_CONFIG_DEFAULTS.projectId),
    projectName: cfg.get<string>("projectName", ""),
    teamName: cfg.get<string>("teamName", ""),
    apiBaseUrl: cfg.get<string>("apiBaseUrl", CLI_CONFIG_DEFAULTS.apiBaseUrl),
    endpointConflictBehavior: cfg.get<string>("endpointConflictBehavior", CLI_CONFIG_DEFAULTS.endpointConflictBehavior),
    schemaConflictBehavior: cfg.get<string>("schemaConflictBehavior", CLI_CONFIG_DEFAULTS.schemaConflictBehavior),
    include: cfg.get<string[]>("include", [...CLI_CONFIG_DEFAULTS.include]),
    exclude: cfg.get<string[]>("exclude", [...CLI_CONFIG_DEFAULTS.exclude]),
    exportPath: cfg.get<string>("exportPath", CLI_CONFIG_DEFAULTS.exportPath),
    pageTypeStyle: cfg.get<"mybatis-plus" | "spring-data">("pageTypeStyle", CLI_CONFIG_DEFAULTS.pageTypeStyle),
    folderNameSource: cfg.get<"tag" | "controller">("folderNameSource", CLI_CONFIG_DEFAULTS.folderNameSource),
    rootFolderName: cfg.get<string>("rootFolderName", CLI_CONFIG_DEFAULTS.rootFolderName),
    schemaFolderId: cfg.get<number>("schemaFolderId", CLI_CONFIG_DEFAULTS.schemaFolderId),
    schemaFolderName: cfg.get<string>("schemaFolderName", ""),
    helperProperties: cfg.get<boolean>("helperProperties.enabled", CLI_CONFIG_DEFAULTS.helperPropertiesEnabled),
    enumFieldDoc: cfg.get<boolean>("helperProperties.enumFieldDoc", CLI_CONFIG_DEFAULTS.enumFieldDoc),
    dependencyRepos: cfg.get<string[]>("dependencyRepos", [...CLI_CONFIG_DEFAULTS.dependencyRepos]),
    dependencyJars: cfg.get<string[]>("dependencyJars", [...CLI_CONFIG_DEFAULTS.dependencyJars]),
    maxDependencyJars: cfg.get<number>("maxDependencyJars", CLI_CONFIG_DEFAULTS.maxDependencyJars),
    enableCodeLens: cfg.get<boolean>("enableCodeLens", true),
  };
}

export async function saveProjectId(projectId: number, projectName?: string, teamName?: string): Promise<void> {
  const cfg = vscode.workspace.getConfiguration("apifoxHelper");
  const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
  await cfg.update("projectId", projectId, target);
  if (projectName !== undefined) {
    await cfg.update("projectName", projectName, target);
  }
  if (teamName !== undefined) {
    await cfg.update("teamName", teamName, target);
  }
}

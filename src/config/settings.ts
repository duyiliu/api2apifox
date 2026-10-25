import * as vscode from "vscode";

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
  /** 全量工作区同步时删除 Apifox 中本次源码未出现的接口/模型(默认 false) */
  deleteUnmatchedResources: boolean;
  /** 是否在 Java Controller 方法上方显示 CodeLens「同步此接口」(默认 true) */
  enableCodeLens: boolean;
}

export function getSettings(): ApifoxSettings {
  const cfg = vscode.workspace.getConfiguration("apifoxHelper");
  return {
    projectId: cfg.get<number>("projectId", 0),
    projectName: cfg.get<string>("projectName", ""),
    teamName: cfg.get<string>("teamName", ""),
    apiBaseUrl: cfg.get<string>("apiBaseUrl", "https://api.apifox.com"),
    endpointConflictBehavior: cfg.get<string>("endpointConflictBehavior", "OVERWRITE_EXISTING"),
    schemaConflictBehavior: cfg.get<string>("schemaConflictBehavior", "OVERWRITE_EXISTING"),
    include: cfg.get<string[]>("include", ["**/src/main/java/**/*.java"]),
    exclude: cfg.get<string[]>("exclude", ["**/target/**", "**/build/**", "**/src/test/**", "**/sample/**", "**/.*/**"]),
    exportPath: cfg.get<string>("exportPath", "openapi.gen.json"),
    pageTypeStyle: cfg.get<"mybatis-plus" | "spring-data">("pageTypeStyle", "mybatis-plus"),
    folderNameSource: cfg.get<"tag" | "controller">("folderNameSource", "tag"),
    rootFolderName: cfg.get<string>("rootFolderName", ""),
    schemaFolderId: cfg.get<number>("schemaFolderId", 0),
    schemaFolderName: cfg.get<string>("schemaFolderName", ""),
    helperProperties: cfg.get<boolean>("helperProperties.enabled", true),
    enumFieldDoc: cfg.get<boolean>("helperProperties.enumFieldDoc", false),
    dependencyRepos: cfg.get<string[]>("dependencyRepos", []),
    dependencyJars: cfg.get<string[]>("dependencyJars", []),
    maxDependencyJars: cfg.get<number>("maxDependencyJars", 120),
    deleteUnmatchedResources: cfg.get<boolean>("deleteUnmatchedResources", false),
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

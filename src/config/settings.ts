import * as vscode from "vscode";
import { BindingSource, FolderBindingState } from "./workspaceScopes";

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

/** 读取指定工作区文件夹(scope)的配置;不传 scope 时保持原有工作区级行为 */
export function getSettings(scope?: vscode.Uri | vscode.WorkspaceFolder): ApifoxSettings {
  const uri = scope && "uri" in scope ? scope.uri : scope;
  const cfg = uri ? vscode.workspace.getConfiguration("apifoxHelper", uri) : vscode.workspace.getConfiguration("apifoxHelper");
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
    enableCodeLens: cfg.get<boolean>("enableCodeLens", true),
  };
}

/**
 * 写入配置的目标:
 * - 多根工作区且指定了 folder:WorkspaceFolder(各自独立的 .vscode/settings.json)
 * - 单根/无 folder:WorkSpace(单根没有独立的 folder 层级,兼容旧配置)
 * - 未打开文件夹:Global
 */
export function configurationTargetFor(folder?: vscode.WorkspaceFolder): vscode.ConfigurationTarget {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folder && folders.length > 1) {
    return vscode.ConfigurationTarget.WorkspaceFolder;
  }
  return folders.length ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
}

function configurationFor(folder?: vscode.WorkspaceFolder): vscode.WorkspaceConfiguration {
  return folder
    ? vscode.workspace.getConfiguration("apifoxHelper", folder.uri)
    : vscode.workspace.getConfiguration("apifoxHelper");
}

/**
 * 保存项目绑定。多根工作区写入 folder 级配置;单根继续写 Workspace,
 * 使旧配置仍可通过 getConfiguration(section, folder.uri) 读取(迁移路径见命令)。
 */
export async function saveProjectId(
  projectId: number,
  projectName?: string,
  teamName?: string,
  folder?: vscode.WorkspaceFolder
): Promise<void> {
  const cfg = configurationFor(folder);
  const target = configurationTargetFor(folder);
  await cfg.update("projectId", projectId, target);
  if (projectName !== undefined) {
    await cfg.update("projectName", projectName, target);
  }
  if (teamName !== undefined) {
    await cfg.update("teamName", teamName, target);
  }
}

/** 解析某个作用域下实际生效的项目绑定,并标记值来自 folder / workspace / global */
export function getProjectBinding(scope?: vscode.Uri | vscode.WorkspaceFolder): FolderBindingState {
  const uri = scope && "uri" in scope ? scope.uri : scope;
  const cfg = uri ? vscode.workspace.getConfiguration("apifoxHelper", uri) : vscode.workspace.getConfiguration("apifoxHelper");
  const projectId = cfg.get<number>("projectId", 0);
  const projectName = cfg.get<string>("projectName", "");
  const teamName = cfg.get<string>("teamName", "");
  const inspected = cfg.inspect<number>("projectId");
  let source: BindingSource = "none";
  if (inspected?.workspaceFolderValue !== undefined) {
    source = "folder";
  } else if (inspected?.workspaceValue !== undefined) {
    source = "workspace";
  } else if (inspected?.globalValue !== undefined) {
    source = "global";
  }
  return { projectId, projectName, teamName, source };
}

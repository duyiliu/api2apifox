import * as vscode from "vscode";

export interface ApifoxSettings {
  projectId: number;
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
  /** 可选:数据模型导入到该目录(不存在则创建) */
  schemaFolderName: string;
}

export function getSettings(): ApifoxSettings {
  const cfg = vscode.workspace.getConfiguration("apifoxHelper");
  return {
    projectId: cfg.get<number>("projectId", 0),
    apiBaseUrl: cfg.get<string>("apiBaseUrl", "https://api.apifox.com"),
    endpointConflictBehavior: cfg.get<string>("endpointConflictBehavior", "OVERWRITE_EXISTING"),
    schemaConflictBehavior: cfg.get<string>("schemaConflictBehavior", "OVERWRITE_EXISTING"),
    include: cfg.get<string[]>("include", ["**/src/main/java/**/*.java"]),
    exclude: cfg.get<string[]>("exclude", ["**/target/**", "**/build/**", "**/src/test/**"]),
    exportPath: cfg.get<string>("exportPath", "openapi.gen.json"),
    pageTypeStyle: cfg.get<"mybatis-plus" | "spring-data">("pageTypeStyle", "mybatis-plus"),
    folderNameSource: cfg.get<"tag" | "controller">("folderNameSource", "tag"),
    rootFolderName: cfg.get<string>("rootFolderName", ""),
    schemaFolderName: cfg.get<string>("schemaFolderName", ""),
  };
}

export async function saveProjectId(projectId: number): Promise<void> {
  const cfg = vscode.workspace.getConfiguration("apifoxHelper");
  const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
  await cfg.update("projectId", projectId, target);
}

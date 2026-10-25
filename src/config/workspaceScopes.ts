/**
 * 多根工作区的项目作用域纯逻辑(不依赖 vscode,便于单测)。
 *
 * 一个 workspace folder 只有在根目录存在 pom.xml / build.gradle(.kts) 时才视为
 * Apifox 项目根;找不到任何项目根时退回全部 workspace folder,保证普通单根工作区
 * 与不含构建文件的示例目录仍能扫描。
 */

import * as path from "node:path";

export const PROJECT_MARKER_FILES = ["pom.xml", "build.gradle", "build.gradle.kts"] as const;

export interface WorkspaceFolderInput {
  name: string;
  fsPath: string;
  /** 原始 workspaceFolders 下标;缺省按入参顺序 */
  index?: number;
}

export interface WorkspaceProjectFolder {
  name: string;
  label: string;
  fsPath: string;
  /** 归一化路径,作为跨模块的文件夹键 */
  key: string;
  /** 原始 workspaceFolders 下标 */
  index: number;
  /** 是否由 pom.xml / build.gradle(.kts) 识别为项目根 */
  detected: boolean;
}

/** 统一路径分隔符与大小写(Windows 下盘符/路径大小写不敏感) */
export function normalizePathKey(fsPath: string): string {
  const normalized = fsPath.replace(/\\/g, "/").replace(/\/+$/, "");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function joinPathKey(root: string, name: string): string {
  return `${root.replace(/[\\/]+$/, "")}/${name}`;
}

export function hasProjectMarker(fsPath: string, exists: (candidate: string) => boolean): boolean {
  return PROJECT_MARKER_FILES.some((marker) => {
    try {
      return exists(joinPathKey(fsPath, marker));
    } catch {
      return false;
    }
  });
}

/** 识别项目文件夹;一个都没有时退回全部文件夹(单根普通工作区兼容) */
export function detectProjectFolders(
  folders: WorkspaceFolderInput[],
  exists: (candidate: string) => boolean
): WorkspaceProjectFolder[] {
  const infos: WorkspaceProjectFolder[] = folders.map((folder, order) => ({
    name: folder.name,
    label: folder.name,
    fsPath: folder.fsPath,
    key: normalizePathKey(folder.fsPath),
    index: folder.index ?? order,
    detected: hasProjectMarker(folder.fsPath, exists),
  }));
  const detected = infos.filter((folder) => folder.detected);
  return detected.length ? detected : infos;
}

/** 找到包含给定路径的工作区文件夹(嵌套/重叠时取路径最长者) */
export function workspaceFolderForPath<T extends { key: string }>(fsPath: string, folders: T[]): T | undefined {
  const target = normalizePathKey(fsPath);
  return folders
    .filter((folder) => target === folder.key || target.startsWith(`${folder.key}/`))
    .sort((a, b) => b.key.length - a.key.length)[0];
}

export interface ApiFolderSettings {
  folderNameSource: "tag" | "controller";
  rootFolderName: string;
}

/** 与 x-apifox-folder 完全一致的接口目录(不包含工作区文件夹前缀) */
export function apiFolderKey(
  settings: ApiFolderSettings,
  endpoint: { tag: string; controller: string }
): string {
  const key = settings.folderNameSource === "controller" ? endpoint.controller : endpoint.tag;
  const root = settings.rootFolderName.trim();
  return root ? `${root}/${key}` : key;
}

/** 侧边栏树中的目录 key;多根工作区才加工作区文件夹前缀 */
export function treeFolderKey(workspaceLabel: string, apiFolder: string, includeWorkspace: boolean): string {
  return includeWorkspace ? `${workspaceLabel}/${apiFolder}` : apiFolder;
}

/** 勾选键:工作区文件夹 + 接口身份,避免不同文件夹同名接口互相影响 */
export function endpointSelectionKey(folderKey: string, endpoint: { method: string; path: string }): string {
  return `${folderKey}\u0000${endpoint.method} ${endpoint.path}`;
}

export interface FolderProjectBinding {
  projectId: number;
  projectName?: string;
  teamName?: string;
}

export type BindingSource = "folder" | "workspace" | "global" | "none";

export interface FolderBindingState extends FolderProjectBinding {
  source: BindingSource;
}

export interface BindingMigrationItem {
  folderKey: string;
  label: string;
  binding: FolderProjectBinding;
}

/**
 * 单根 -> 多根迁移计划:把旧的工作区级项目绑定复制到尚未设置文件夹级绑定的文件夹。
 * 已有文件夹级绑定保持不变;旧绑定未配置(projectId<=0)时不做任何迁移。
 */
export function planProjectBindingMigration(
  folders: { key: string; label: string }[],
  folderBindings: Record<string, FolderBindingState | undefined>,
  legacyBinding: FolderProjectBinding
): BindingMigrationItem[] {
  if (!(legacyBinding.projectId > 0)) {
    return [];
  }
  return folders
    .filter((folder) => {
      const state = folderBindings[folder.key];
      return !(state?.source === "folder" && state.projectId > 0);
    })
    .map((folder) => ({
      folderKey: folder.key,
      label: folder.label,
      binding: {
        projectId: legacyBinding.projectId,
        projectName: legacyBinding.projectName,
        teamName: legacyBinding.teamName,
      },
    }));
}

/** 供测试/展示使用:把相对导出路径解析到指定工作区文件夹 */
export function resolveExportPath(workspaceRoot: string, exportPath: string): string {
  return path.isAbsolute(exportPath) ? exportPath : path.join(workspaceRoot, exportPath);
}

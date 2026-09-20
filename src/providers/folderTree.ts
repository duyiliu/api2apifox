import { EndpointInfo } from "../java/model";

/**
 * 接口目录树(纯逻辑,便于单测)。
 *
 * 目录 key 与 x-apifox-folder 完全一致,可以是多级路径(如 `测评工作站/测评量表-CARS`)。
 * 树按 `/` 分层,父目录同时承载直属接口与子目录,便于在侧边栏还原真实目录层级。
 */

export interface FolderTree {
  /** 末段显示名 */
  label: string;
  /** 完整目录路径(与 x-apifox-folder 一致) */
  key: string;
  /** 直属本目录的接口 */
  endpoints: EndpointInfo[];
  children: FolderTree[];
}

/** 目录 key 缺失时的兜底目录名 */
export const UNGROUPED_FOLDER = "未分组";

/** 拆分目录路径:忽略空段(容忍 `a//b`、首尾斜杠),全空则归入「未分组」 */
export function splitFolderKey(key: string): string[] {
  const segments = key
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  return segments.length ? segments : [UNGROUPED_FOLDER];
}

/** 按目录路径构建目录树(目录名与接口均排序,便于稳定展示) */
export function buildFolderTree(
  endpoints: EndpointInfo[],
  folderKeyOf: (ep: EndpointInfo) => string
): FolderTree[] {
  const root: FolderTree = { label: "", key: "", endpoints: [], children: [] };
  const byPath = new Map<string, FolderTree>();
  for (const ep of endpoints) {
    let parent = root;
    let path = "";
    for (const segment of splitFolderKey(folderKeyOf(ep) || UNGROUPED_FOLDER)) {
      path = path ? `${path}/${segment}` : segment;
      let node = byPath.get(path);
      if (!node) {
        node = { label: segment, key: path, endpoints: [], children: [] };
        byPath.set(path, node);
        parent.children.push(node);
      }
      parent = node;
    }
    parent.endpoints.push(ep);
  }
  sortTree(root.children);
  return root.children;
}

function sortTree(nodes: FolderTree[]): void {
  nodes.sort((a, b) => a.label.localeCompare(b.label));
  for (const node of nodes) {
    node.endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
    sortTree(node.children);
  }
}

/** 目录自身与所有子目录下的接口(勾选/统计按整棵子树计算) */
export function flattenFolderEndpoints(node: FolderTree): EndpointInfo[] {
  const out: EndpointInfo[] = [...node.endpoints];
  for (const child of node.children) {
    out.push(...flattenFolderEndpoints(child));
  }
  return out;
}

/** 目录子树的接口总数 */
export function countFolderEndpoints(node: FolderTree): number {
  let total = node.endpoints.length;
  for (const child of node.children) {
    total += countFolderEndpoints(child);
  }
  return total;
}

/** 目录勾选状态:全部已选 / 部分已选 / 均未选 */
export function folderSelectionState(
  node: FolderTree,
  isChecked: (ep: EndpointInfo) => boolean
): "all" | "some" | "none" {
  const all = flattenFolderEndpoints(node);
  if (!all.length) {
    return "none";
  }
  const hit = all.filter(isChecked).length;
  return hit === 0 ? "none" : hit === all.length ? "all" : "some";
}

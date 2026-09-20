import * as path from "path";

/**
 * 扫描范围判定:隐藏目录与工作区内「另一个 git 检出」的副本。
 *
 * 工作区根下的任意 `.xxx` 目录一律不扫描。Agent 工作树(`.kilo/worktrees/<name>`、
 * `.claude/worktrees` 等)与嵌套仓库也都是完整检出:链接工作树根下是 `.git` 文件,
 * 普通嵌套仓库是 `.git` 目录。扫描这些副本会把同一个 Controller 解析成重复接口。
 */

/**
 * target 是否位于工作区根目录之下的隐藏目录中。
 * 工作区根自身的名称不参与判断,因此把一个工作树作为独立工作区打开时仍可正常扫描。
 */
export function isInHiddenDirectory(target: string, workspaceRoot: string): boolean {
  const rel = path.relative(path.resolve(workspaceRoot), path.resolve(target));
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    return false;
  }
  return rel.split(/[\\/]+/).some((segment) => segment.startsWith("."));
}

/**
 * 返回 target(文件或目录)所属副本的检出根;target 在工作区根内且其某个
 * 祖先目录存在 `.git` 时返回该祖先,否则返回 undefined。
 * 工作区根自身的 `.git` 不算副本(正常仓库根不会被跳过)。
 */
export function findNestedCheckoutRoot(
  target: string,
  workspaceRoot: string,
  hasGitEntry: (dir: string) => boolean
): string | undefined {
  const root = path.resolve(workspaceRoot);
  let dir = path.resolve(target);
  while (true) {
    const rel = path.relative(root, dir);
    if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
      // 工作区根自身或工作区之外:不参与副本判定
      return undefined;
    }
    if (hasGitEntry(dir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
}

/** target 是否位于工作区内另一个 git 检出之下;allowedCheckoutRoot 为显式保留的副本根 */
export function isSkippedCheckout(
  target: string,
  workspaceRoot: string,
  hasGitEntry: (dir: string) => boolean,
  allowedCheckoutRoot?: string
): boolean {
  const nested = findNestedCheckoutRoot(target, workspaceRoot, hasGitEntry);
  return nested !== undefined && nested !== allowedCheckoutRoot;
}

export interface GitEntryProbe {
  /** 目录下是否存在 `.git`(文件或目录);按目录缓存 */
  hasGitEntry(dir: string): boolean;
  /** 清空缓存,用于感知本次扫描前新建的工作树 */
  reset(): void;
}

/** 基于给定存在性判断构造 `.git` 探针(生产传 fs.existsSync,测试传内存判断) */
export function createGitEntryProbe(exists: (p: string) => boolean): GitEntryProbe {
  const cache = new Map<string, boolean>();
  return {
    hasGitEntry(dir: string): boolean {
      const cached = cache.get(dir);
      if (cached !== undefined) {
        return cached;
      }
      let found = false;
      try {
        found = exists(path.join(dir, ".git"));
      } catch {
        found = false;
      }
      cache.set(dir, found);
      return found;
    },
    reset(): void {
      cache.clear();
    },
  };
}

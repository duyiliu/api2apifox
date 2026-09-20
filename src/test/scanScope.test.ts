import assert from "node:assert/strict";
import { test } from "node:test";
import * as path from "node:path";
import { createGitEntryProbe, findNestedCheckoutRoot, isInHiddenDirectory, isSkippedCheckout } from "../java/scanScope";

// 用相对路径构造,避免固化盘符/分隔符
const ROOT = path.resolve("workspace");
const WORKTREE = path.join(ROOT, ".kilo", "worktrees", "w1");
const NESTED_REPO = path.join(ROOT, "vendor", "child");
const inCheckout = (base: string): string => path.join(base, "cah-childhealth", "src", "main", "java", "com", "yzkj", "A.java");

const checkouts = new Set([WORKTREE, NESTED_REPO]);
const hasGit = (dir: string): boolean => checkouts.has(dir);

test("工作区根下任意隐藏目录均不进入扫描范围", () => {
  assert.equal(isInHiddenDirectory(inCheckout(WORKTREE), ROOT), true);
  assert.equal(isInHiddenDirectory(path.join(ROOT, ".claude", "worktree", "src"), ROOT), true);
  assert.equal(isInHiddenDirectory(path.join(ROOT, "cah-childhealth", "src", "main", "java"), ROOT), false);
  // 工作区根自身即使名称以 . 开头也不应被排除。
  const hiddenRoot = path.join(ROOT, ".worktree");
  assert.equal(isInHiddenDirectory(path.join(hiddenRoot, "src", "main", "java"), hiddenRoot), false);
});

test("链接工作树内的源码目录识别为副本", () => {
  assert.equal(findNestedCheckoutRoot(path.dirname(inCheckout(WORKTREE)), ROOT, hasGit), WORKTREE);
  assert.equal(isSkippedCheckout(inCheckout(WORKTREE), ROOT, hasGit), true);
});

test("嵌套独立仓库同样识别为副本", () => {
  assert.equal(findNestedCheckoutRoot(path.dirname(inCheckout(NESTED_REPO)), ROOT, hasGit), NESTED_REPO);
  assert.equal(isSkippedCheckout(inCheckout(NESTED_REPO), ROOT, hasGit), true);
});

test("工作区根自身的 .git 不算副本(正常仓库不被跳过)", () => {
  const rootIsRepo = (dir: string): boolean => dir === ROOT || checkouts.has(dir);
  assert.equal(findNestedCheckoutRoot(path.dirname(inCheckout(ROOT)), ROOT, rootIsRepo), undefined);
  assert.equal(findNestedCheckoutRoot(ROOT, ROOT, rootIsRepo), undefined);
});

test("工作区之外与工作区根目录本身不参与判定", () => {
  assert.equal(findNestedCheckoutRoot(path.join(ROOT, "..", "outside", "src"), ROOT, hasGit), undefined);
  assert.equal(findNestedCheckoutRoot(ROOT, ROOT, hasGit), undefined);
});

test("显式指定的文件所在副本保留", () => {
  assert.equal(isSkippedCheckout(inCheckout(WORKTREE), ROOT, hasGit, WORKTREE), false);
  // 允许的副本不覆盖其它副本
  assert.equal(isSkippedCheckout(inCheckout(NESTED_REPO), ROOT, hasGit, WORKTREE), true);
  // 工作区根下的文件始终保留
  assert.equal(isSkippedCheckout(inCheckout(ROOT), ROOT, hasGit, WORKTREE), false);
});

test("探针按目录缓存,reset 后重新探测", () => {
  let calls = 0;
  const probe = createGitEntryProbe((p) => {
    calls++;
    return p === path.join(WORKTREE, ".git");
  });
  assert.equal(probe.hasGitEntry(WORKTREE), true);
  assert.equal(probe.hasGitEntry(WORKTREE), true);
  assert.equal(calls, 1);
  assert.equal(probe.hasGitEntry(ROOT), false);
  assert.equal(calls, 2);
  probe.reset();
  assert.equal(probe.hasGitEntry(WORKTREE), true);
  assert.equal(calls, 3);
});

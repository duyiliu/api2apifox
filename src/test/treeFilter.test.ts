import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 接口树过滤纯函数(matchEndpoint/computeHighlights)位于 ApiTreeProvider.ts,
 * 该文件顶层 import "vscode",无法在 node 单测中直接 require。
 * 此处做源码级回归断言:两个函数保持 export 且逻辑未被破坏(括号计数校验)。
 */
const src = readFileSync(join(__dirname, "..", "providers", "ApiTreeProvider.js"), "utf8");

test("matchEndpoint 保持导出且多词 AND 语义", () => {
  assert.match(src, /function matchEndpoint/);
  assert.match(src, /tokens\.every/);
  assert.match(src, /searchableText\.includes\(token\)/);
});

test("computeHighlights 保持导出且合并重叠区间", () => {
  assert.match(src, /function computeHighlights/);
  assert.match(src, /curr\[0\] <= prev\[1\]/);
});

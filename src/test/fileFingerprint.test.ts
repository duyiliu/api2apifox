import assert from "node:assert/strict";
import { test } from "node:test";
import { FileStamp, fileSetFingerprint } from "../config/fileFingerprint";

function statMap(entries: Record<string, FileStamp>): (filePath: string) => FileStamp | undefined {
  return (filePath) => entries[filePath];
}

test("fileSetFingerprint:结果与输入顺序无关", () => {
  const stat = statMap({
    "/a.properties": { size: 10, mtimeMs: 1 },
    "/b.properties": { size: 20, mtimeMs: 2 },
  });
  assert.equal(fileSetFingerprint(["/a.properties", "/b.properties"], stat), fileSetFingerprint(["/b.properties", "/a.properties"], stat));
});

test("fileSetFingerprint:路径集合或 mtime/size 变化即失效", () => {
  const base = { "/a.properties": { size: 10, mtimeMs: 1 }, "/b.properties": { size: 20, mtimeMs: 2 } };
  const before = fileSetFingerprint(Object.keys(base), statMap(base));

  assert.notEqual(before, fileSetFingerprint(["/a.properties"], statMap(base)), "移除文件应改变指纹");
  assert.notEqual(
    before,
    fileSetFingerprint(Object.keys(base), statMap({ ...base, "/a.properties": { size: 10, mtimeMs: 3 } })),
    "mtime 变化应改变指纹"
  );
  assert.notEqual(
    before,
    fileSetFingerprint(Object.keys(base), statMap({ ...base, "/a.properties": { size: 11, mtimeMs: 1 } })),
    "size 变化应改变指纹"
  );
});

test("fileSetFingerprint:不可读/不存在的文件记为 missing,重新出现会改变指纹", () => {
  const onlyA = fileSetFingerprint(["/a.properties", "/gone.properties"], statMap({ "/a.properties": { size: 10, mtimeMs: 1 } }));
  const withGone = fileSetFingerprint(
    ["/a.properties", "/gone.properties"],
    statMap({ "/a.properties": { size: 10, mtimeMs: 1 }, "/gone.properties": { size: 1, mtimeMs: 5 } })
  );
  assert.ok(onlyA.includes("/gone.properties|missing"));
  assert.notEqual(onlyA, withGone);
});

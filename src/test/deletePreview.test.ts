import assert from "node:assert/strict";
import { test } from "node:test";
import { diffOpenapiResources, hasUnmatchedResources, unmatchedResourceLines, unmatchedResourceSummary } from "../core/deletePreview";

test("删除预览:列出远端存在但本地文档没有的接口与数据模型", () => {
  const local = {
    paths: { "/users": { get: {} }, "/users/{id}": { delete: {} } },
    components: { schemas: { User: {}, Page: {} } },
  };
  const remote = {
    paths: {
      "/users": { get: {}, post: {} },
      "/users/{id}": { delete: {} },
      "/legacy": { get: {}, patch: {} },
    },
    components: { schemas: { User: {}, LegacyDto: {}, Orphan: {} } },
  };

  const preview = diffOpenapiResources(local, remote);
  assert.deepEqual(preview.endpoints, [
    { method: "GET", path: "/legacy" },
    { method: "PATCH", path: "/legacy" },
    { method: "POST", path: "/users" },
  ]);
  assert.deepEqual(preview.schemas, ["LegacyDto", "Orphan"]);
  assert.equal(hasUnmatchedResources(preview), true);
  assert.equal(unmatchedResourceSummary(preview), "接口 3 个，数据模型 2 个");
});

test("删除预览:远端与本地一致时为空,不影响同步", () => {
  const spec = { paths: { "/users": { get: {} } }, components: { schemas: { User: {} } } };
  const preview = diffOpenapiResources(spec, spec);
  assert.deepEqual(preview, { endpoints: [], schemas: [] });
  assert.equal(hasUnmatchedResources(preview), false);
  assert.equal(unmatchedResourceSummary(preview), "接口 0 个，数据模型 0 个");
});

test("删除预览:远端文档异常时抛错,避免空预览后继续删除", () => {
  assert.throws(() => diffOpenapiResources({ paths: {} }, undefined), /缺少 paths/);
  assert.throws(() => diffOpenapiResources({ paths: {} }, { openapi: "3.0.3" }), /缺少 paths/);
});

test("删除预览:清单超出上限时明确剩余数量", () => {
  const preview = {
    endpoints: Array.from({ length: 4 }, (_, i) => ({ method: "GET", path: `/e${i}` })),
    schemas: ["A", "B", "C"],
  };
  const lines = unmatchedResourceLines(preview, 2);
  assert.deepEqual(lines, [
    "接口 GET /e0",
    "接口 GET /e1",
    "… 另有 2 个待删除接口",
    "数据模型 A",
    "数据模型 B",
    "… 另有 1 个待删除数据模型",
  ]);
});

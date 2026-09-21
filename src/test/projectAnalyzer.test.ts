import assert from "node:assert/strict";
import * as path from "node:path";
import { test } from "node:test";
import { resolveConfig } from "../core/config";
import { analyzeProject } from "../core/projectAnalyzer";

const SAMPLE_ROOT = path.join(__dirname, "..", "..", "sample");

function sampleConfig() {
  return resolveConfig(SAMPLE_ROOT, { include: ["**/*.java"], exclude: [] }).config;
}

test("共享 ProjectAnalyzer 扫描 sample 并生成 OpenAPI", async () => {
  const result = await analyzeProject({ config: sampleConfig() });
  assert.equal(result.scannedFiles, 19);
  assert.ok(result.endpoints.length > 8);
  assert.equal(result.spec.openapi, "3.0.3");
  assert.ok(result.spec.paths["/api/v1/users"]);
});

test("--file 只筛选接口但保留全项目类型上下文", async () => {
  const result = await analyzeProject({
    config: sampleConfig(),
    files: ["src/main/java/com/example/controller/UserController.java"],
  });
  assert.equal(result.scannedFiles, 19);
  assert.equal(result.endpoints.length, 8);
  assert.ok(result.endpoints.every((endpoint) => endpoint.controller === "UserController"));
  assert.ok(result.spec.components?.schemas.UserVO);
});

test("--endpoint 精确匹配 METHOD PATH", async () => {
  const result = await analyzeProject({
    config: sampleConfig(),
    endpoints: ["get api/v1/users"],
  });
  assert.equal(result.endpoints.length, 1);
  assert.equal(result.endpoints[0].method, "GET");
  assert.equal(result.endpoints[0].path, "/api/v1/users");
});

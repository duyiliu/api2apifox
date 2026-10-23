import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
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

test("项目根位于点目录下时,子模块的 .apifox-helper.properties 仍然生效", async () => {
  // 回归:隐藏目录曾按绝对路径分段判断,根路径含 .xxx 段时误杀模块级规则文件
  const root = fs.mkdtempSync(path.join(os.tmpdir(), ".api2apifox-dotted-"));
  try {
    fs.mkdirSync(path.join(root, "mod"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "mod", "Api.java"),
      `import org.springframework.web.bind.annotation.*;
@RestController
public class Api { @GetMapping("/x") public String x() { return ""; } }
`
    );
    fs.writeFileSync(path.join(root, "mod", ".apifox-helper.properties"), "folder.name=子模块目录");
    const config = resolveConfig(root, { include: ["**/*.java"], exclude: [] }).config;
    const result = await analyzeProject({ config });
    assert.equal(result.endpoints.length, 1);
    assert.equal(result.endpoints[0].tag, "子模块目录");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
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

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

test("多模块仓库:模块规则按目录作用域生效,模块外回落到根规则", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-rule-scope-"));
  try {
    for (const [module, className, route] of [
      ["mod-a", "AApi", "/a"],
      ["mod-b", "BApi", "/b"],
    ] as const) {
      fs.mkdirSync(path.join(root, module), { recursive: true });
      fs.writeFileSync(
        path.join(root, module, `${className}.java`),
        `import org.springframework.web.bind.annotation.*;
@RestController
public class ${className} { @GetMapping("${route}") public String get() { return ""; } }
`
      );
    }
    fs.writeFileSync(
      path.join(root, "RootApi.java"),
      `import org.springframework.web.bind.annotation.*;
@RestController
public class RootApi { @GetMapping("/root") public String get() { return ""; } }
`
    );
    fs.writeFileSync(path.join(root, ".apifox-helper.properties"), "folder.name=全局");
    fs.writeFileSync(path.join(root, "mod-a", ".apifox-helper.properties"), "folder.name=A模块");
    fs.writeFileSync(path.join(root, "mod-b", ".apifox-helper.properties"), "folder.name=B模块");

    const config = resolveConfig(root, { include: ["**/*.java"], exclude: [] }).config;
    const result = await analyzeProject({ config });
    const tagOf = (controller: string) => result.endpoints.find((e) => e.controller === controller)?.tag;
    assert.equal(tagOf("RootApi"), "全局");
    assert.equal(tagOf("AApi"), "A模块");
    assert.equal(tagOf("BApi"), "B模块");
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

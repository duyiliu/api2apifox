import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { analyze, analyzeSubset } from "../pipeline";
import { SourceFile } from "../java/model";

const SAMPLE_ROOT = path.join(__dirname, "..", "..", "sample");

function loadSample(): SourceFile[] {
  const out: SourceFile[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".java")) {
        out.push({ fsPath: full, content: fs.readFileSync(full, "utf8") });
      }
    }
  };
  walk(SAMPLE_ROOT);
  return out;
}

const analyzed = analyze(loadSample(), "demo");
const spec = analyzed.spec;

test("识别全部接口", () => {
  // UserController 的 8 个接口(整体数量与新增风格在 features.test.ts 中覆盖)
  const userEndpoints = analyzed.endpoints.filter((e) => e.controller === "UserController");
  assert.equal(userEndpoints.length, 8);
  const keys = userEndpoints.map((e) => `${e.method} ${e.path}`).sort();
  assert.deepEqual(keys, [
    "DELETE /api/v1/users/{id}",
    "DELETE /api/v1/users/item/{id}",
    "GET /api/v1/users",
    "GET /api/v1/users/export",
    "PATCH /api/v1/users/{id}",
    "POST /api/v1/users",
    "POST /api/v1/users/import",
    "PUT /api/v1/users/{id}/status",
  ].sort());
});

test("tag 取自 @Tag 注解", () => {
  const userEndpoints = analyzed.endpoints.filter((e) => e.controller === "UserController");
  assert.ok(userEndpoints.every((e) => e.tag === "用户管理"));
  assert.ok(spec.tags?.some((t) => t.name === "用户管理"));
});

test("GET /api/v1/users:查询参数与返回类型", () => {
  const op = spec.paths["/api/v1/users"].get as Record<string, any>;
  assert.equal(op.summary, "查询用户列表");
  assert.equal(op.parameters.length, 2);
  const keyword = op.parameters.find((p: any) => p.name === "keyword");
  assert.equal(keyword.required, false);
  assert.deepEqual(keyword.schema, { type: "string" });
  const page = op.parameters.find((p: any) => p.name === "page");
  assert.equal(page.required, false);
  assert.equal(page.schema.type, "integer");
  assert.equal(page.schema.default, "1");
  const schema = op.responses["200"].content["*/*"].schema;
  assert.equal(schema.$ref, "#/components/schemas/ApiResult«List«UserVO»»");
});

test("POST /api/v1/users:请求体与必填字段", () => {
  const op = spec.paths["/api/v1/users"].post as Record<string, any>;
  const body = op.requestBody;
  assert.equal(body.required, true);
  const schema = body.content["application/json"].schema;
  assert.equal(schema.$ref, "#/components/schemas/UserCreateRequest");
  const userCreate = spec.components!.schemas["UserCreateRequest"];
  assert.ok(userCreate.required?.includes("username"));
  assert.equal(userCreate.properties!.username.type, "string");
  assert.equal(userCreate.properties!.age.type, "integer");
});

test("DELETE 两条路径:路径参数与 void 响应", () => {
  for (const p of ["/api/v1/users/{id}", "/api/v1/users/item/{id}"]) {
    const op = spec.paths[p].delete as Record<string, any>;
    const id = op.parameters[0];
    assert.equal(id.name, "id");
    assert.equal(id.in, "path");
    assert.equal(id.required, true);
    assert.equal(id.schema.format, "int64");
    assert.equal(op.responses["200"].content, undefined);
  }
});

test("PUT 状态接口:枚举 query 参数与 header 参数", () => {
  const op = spec.paths["/api/v1/users/{id}/status"].put as Record<string, any>;
  const status = op.parameters.find((p: any) => p.name === "status");
  assert.equal(status.schema.type, "string");
  assert.deepEqual(status.schema.enum, ["ACTIVE", "INACTIVE"]);
  const operator = op.parameters.find((p: any) => p.name === "X-Operator");
  assert.equal(operator.in, "header");
  assert.equal(operator.required, false);
});

test("import 接口:multipart 文件上传", () => {
  const op = spec.paths["/api/v1/users/import"].post as Record<string, any>;
  const schema = op.requestBody.content["multipart/form-data"].schema;
  assert.equal(schema.properties.file.format, "binary");
});

test("components 包含泛型实例化与枚举", () => {
  const names = Object.keys(spec.components!.schemas);
  assert.ok(names.includes("ApiResult«List«UserVO»»"), names.join(","));
  assert.ok(names.includes("ApiResult«UserVO»"));
  assert.ok(names.includes("UserVO"));
  assert.ok(names.includes("UserCreateRequest"));
  // ApiResult.data 的泛型绑定生效
  const wrapper = spec.components!.schemas["ApiResult«List«UserVO»»"];
  assert.equal(wrapper.properties!.data.type, "array");
  assert.equal(wrapper.properties!.data.items!.$ref, "#/components/schemas/UserVO");
  assert.equal(wrapper.properties!.code.type, "integer");
});

test("缺注解的 JavaBean 参数产生告警且未生成接口体", () => {
  assert.ok(analyzed.warnings.some((w) => w.includes("patchUser") && w.includes("patch")));
  const op = spec.paths["/api/v1/users/{id}"].patch as Record<string, any>;
  assert.equal(op.requestBody, undefined);
});

test("analyzeSubset 只保留与所选接口相关的告警,未选控制器告警不泄露", () => {
  const subset = analyzeSubset(loadSample(), { title: "demo" }, (ep) => ep.controller === "OrderController");
  assert.ok(subset.endpoints.every((e) => e.controller === "OrderController"));
  // UserController.patchUser 的 warning 不应出现在 OrderController 的子集同步结果中
  assert.ok(!subset.warnings.some((w) => w.includes("patchUser")));
});


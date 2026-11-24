import assert from "node:assert/strict";
import { test } from "node:test";
import { diffOpenApi, diffOpenApiScoped, formatDiffText } from "../openapi/diff";

type JsonObject = Record<string, unknown>;

function document(overrides: { paths?: JsonObject; schemas?: JsonObject } = {}): JsonObject {
  const schemas = overrides.schemas ?? {};
  const doc: JsonObject = {
    openapi: "3.0.3",
    info: { title: "test", version: "1.0.0" },
    paths: overrides.paths ?? {},
  };
  if (Object.keys(schemas).length) {
    doc.components = { schemas };
  }
  return doc;
}

function operation(overrides: JsonObject = {}): JsonObject {
  return {
    summary: "查询用户",
    responses: { "200": { description: "OK" } },
    ...overrides,
  };
}

function ref(name: string): JsonObject {
  return { $ref: `#/components/schemas/${name}` };
}

function diffOf(baseline: JsonObject, current: JsonObject) {
  return diffOpenApi(baseline, current, "/tmp/openapi.old.json");
}

test("diff:完全相同的文档没有变更", () => {
  const doc = document({ paths: { "/users": { get: operation() } } });
  const diff = diffOf(doc, structuredClone(doc));
  assert.deepEqual(diff.summary, { breaking: 0, compatible: 0, total: 0 });
  assert.deepEqual(diff.changes, []);
  assert.equal(diff.baseline, "/tmp/openapi.old.json");
  assert.match(formatDiffText(diff), /破坏性 0/);
});

test("diff:删除路径是破坏性变更", () => {
  const baseline = document({ paths: { "/users": { get: operation() }, "/orders": { get: operation() } } });
  const current = document({ paths: { "/users": { get: operation() } } });
  const diff = diffOf(baseline, current);
  assert.equal(diff.summary.breaking, 1);
  assert.equal(diff.changes[0].kind, "removed-operation");
  assert.equal(diff.changes[0].location, "GET /orders");
});

test("diff:路径存在但操作全被删除时仍能定位到具体操作", () => {
  const baseline = document({ paths: { "/orders": { get: operation(), post: operation() } } });
  const current = document({ paths: {} });
  const diff = diffOf(baseline, current);
  assert.deepEqual(
    diff.changes.map((change) => change.location),
    ["GET /orders", "POST /orders"]
  );
  assert.ok(diff.changes.every((change) => change.kind === "removed-operation"));
});

test("diff:按范围比对时，未选中路径的删除不报出", () => {
  const baseline = document({ paths: { "/a": { get: operation() }, "/b": { get: operation() } } });
  const current = document({ paths: { "/a": { get: operation() } } });
  const diff = diffOpenApiScoped(baseline, current, "/tmp/openapi.old.json", new Map([["/a", new Set(["GET"])]]));
  assert.deepEqual(diff.summary, { breaking: 0, compatible: 0, total: 0 });
});

test("diff:按范围比对时，选中的路径整体消失仍报出删除操作", () => {
  const baseline = document({ paths: { "/a": { get: operation() }, "/b": { get: operation() } } });
  const current = document({ paths: { "/b": { get: operation() } } });
  const diff = diffOpenApiScoped(baseline, current, "/tmp/openapi.old.json", new Map([["/a", new Set(["GET"])]]));
  assert.equal(diff.summary.breaking, 1);
  assert.equal(diff.changes[0].location, "GET /a");
});

test("diff:删除单个操作只影响该操作", () => {
  const baseline = document({ paths: { "/users": { get: operation(), post: operation() } } });
  const current = document({ paths: { "/users": { get: operation() } } });
  const diff = diffOf(baseline, current);
  assert.equal(diff.summary.breaking, 1);
  const change = diff.changes[0];
  assert.equal(change.kind, "removed-operation");
  assert.equal(change.location, "POST /users");
  assert.equal(change.method, "POST");
});

test("diff:新增路径与新增操作是兼容变更", () => {
  const baseline = document({ paths: { "/users": { get: operation() } } });
  const current = document({
    paths: { "/users": { get: operation(), post: operation() }, "/orders": { get: operation() } },
  });
  const diff = diffOf(baseline, current);
  assert.deepEqual(diff.summary, { breaking: 0, compatible: 2, total: 2 });
  assert.deepEqual(
    diff.changes.map((change) => [change.severity, change.kind]).sort(),
    [
      ["compatible", "added-operation"],
      ["compatible", "added-path"],
    ].sort()
  );
});

test("diff:删除必填响应字段是破坏性变更（$ref 展开后比较）", () => {
  const baseline = document({
    paths: { "/users": { get: operation({ responses: { "200": { content: { "application/json": { schema: ref("User") } } } } }) } },
    schemas: { User: { type: "object", required: ["id", "email"], properties: { id: { type: "integer" }, email: { type: "string" } } } },
  });
  const current = document({
    paths: { "/users": { get: operation({ responses: { "200": { content: { "application/json": { schema: ref("User") } } } } }) } },
    schemas: { User: { type: "object", required: ["id"], properties: { id: { type: "integer" } } } },
  });
  const diff = diffOf(baseline, current);
  assert.equal(diff.summary.breaking, 1);
  const change = diff.changes[0];
  assert.equal(change.kind, "removed-required-field");
  assert.equal(change.field, "responses.200.email");
  assert.equal(change.schema, "User");
});

test("diff:allOf 包装的 $ref 能被展开并比对", () => {
  const schema = (required: string[], properties: JsonObject) =>
    document({
      paths: {
        "/users": {
          get: operation({
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { type: "object", properties: { data: { allOf: [ref("User")] } } },
                  },
                },
              },
            },
          }),
        },
      },
      schemas: { User: { type: "object", required, properties } },
    });
  const baseline = schema(["id", "email"], { id: { type: "integer" }, email: { type: "string" } });
  const current = schema(["id"], { id: { type: "integer" } });
  const diff = diffOf(baseline, current);
  assert.equal(diff.summary.breaking, 1);
  assert.equal(diff.changes[0].field, "responses.200.data.email");
});

test("diff:新增必填请求字段是破坏性，新增可选字段是兼容", () => {
  const withSchema = (schema: JsonObject) =>
    document({
      paths: {
        "/users": {
          post: operation({
            requestBody: { required: true, content: { "application/json": { schema } } },
          }),
        },
      },
    });
  const baseline = withSchema({ type: "object", required: ["name"], properties: { name: { type: "string" } } });

  const addedRequired = withSchema({
    type: "object",
    required: ["name", "email"],
    properties: { name: { type: "string" }, email: { type: "string" } },
  });
  const requiredDiff = diffOf(baseline, addedRequired);
  assert.equal(requiredDiff.summary.breaking, 1);
  assert.equal(requiredDiff.changes[0].kind, "added-required-field");
  assert.equal(requiredDiff.changes[0].field, "requestBody.email");

  const addedOptional = withSchema({
    type: "object",
    required: ["name"],
    properties: { name: { type: "string" }, nickname: { type: "string" } },
  });
  const optionalDiff = diffOf(baseline, addedOptional);
  assert.deepEqual(optionalDiff.summary, { breaking: 0, compatible: 1, total: 1 });
  assert.equal(optionalDiff.changes[0].kind, "added-optional-field");

  const removedRequired = withSchema({ type: "object", properties: { nickname: { type: "string" }, city: { type: "string" } } });
  const removedDiff = diffOf(baseline, removedRequired);
  assert.deepEqual(removedDiff.summary, { breaking: 1, compatible: 2, total: 3 }, "删必填字段 + 新增两个可选字段");
  assert.deepEqual(
    removedDiff.changes.map((change) => change.kind),
    ["removed-required-field", "added-optional-field", "added-optional-field"]
  );
});

test("diff:新增必填 query 参数破坏兼容，可选参数不破坏", () => {
  const withParams = (params: JsonObject[]) =>
    document({ paths: { "/users": { get: operation({ parameters: params }) } } });
  const baseline = withParams([{ name: "page", in: "query", required: false, schema: { type: "integer" } }]);

  const requiredDiff = diffOf(
    baseline,
    withParams([
      { name: "page", in: "query", required: false, schema: { type: "integer" } },
      { name: "tenant", in: "query", required: true, schema: { type: "string" } },
    ])
  );
  assert.equal(requiredDiff.summary.breaking, 1);
  assert.equal(requiredDiff.changes[0].kind, "added-required-parameter");
  assert.equal(requiredDiff.changes[0].field, "parameters.tenant");

  const optionalDiff = diffOf(
    baseline,
    withParams([
      { name: "page", in: "query", required: false, schema: { type: "integer" } },
      { name: "keyword", in: "query", required: false, schema: { type: "string" } },
    ])
  );
  assert.deepEqual(optionalDiff.summary, { breaking: 0, compatible: 1, total: 1 });

  const requiredNow = diffOf(
    baseline,
    withParams([{ name: "page", in: "query", required: true, schema: { type: "integer" } }])
  );
  assert.equal(requiredNow.summary.breaking, 1);
  assert.equal(requiredNow.changes[0].kind, "parameter-became-required");
});

test("diff:字段类型收窄破坏兼容，integer→number 视为放宽", () => {
  const withProps = (schema: JsonObject) =>
    document({
      paths: {
        "/users": {
          get: operation({ responses: { "200": { content: { "application/json": { schema } } } } }),
        },
      },
    });
  const baseline = withProps({ type: "object", properties: { amount: { type: "number" } } });

  const narrowedAdd = diffOf(baseline, withProps({ type: "object", properties: { amount: { type: "integer" } } }));
  assert.equal(narrowedAdd.summary.breaking, 1);
  assert.equal(narrowedAdd.changes[0].kind, "type-narrowed");

  const widened = diffOf(baseline, withProps({ type: "object", properties: { amount: { type: "string" } } }));
  assert.equal(widened.summary.breaking, 1);
  assert.equal(widened.changes[0].kind, "type-changed");
});

test("diff:非空收窄为可空是破坏性，可空放宽为任意不破坏", () => {
  const withProps = (schema: JsonObject) =>
    document({ paths: { "/users": { get: operation({ responses: { "200": { content: { "application/json": { schema } } } } }) } } });
  const nonNullable = withProps({ type: "object", properties: { email: { type: "string" } } });
  const nullable = withProps({ type: "object", properties: { email: { type: "string", nullable: true } } });

  const narrowed = diffOf(nullable, nonNullable);
  assert.equal(narrowed.summary.breaking, 1);
  assert.equal(narrowed.changes[0].kind, "type-narrowed");

  const widened = diffOf(nonNullable, nullable);
  assert.deepEqual(widened.summary, { breaking: 0, compatible: 1, total: 1 });
  assert.equal(widened.changes[0].kind, "type-widened");
});

test("diff:删除响应体是破坏性，删除请求体是兼容", () => {
  const baseline = document({
    paths: {
      "/users": {
        get: operation({ responses: { "200": { content: { "application/json": { schema: { type: "object" } } } } } }),
        post: operation({ requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } } }),
      },
    },
  });
  const current = document({ paths: { "/users": { get: operation(), post: operation() } } });
  const diff = diffOf(baseline, current);
  assert.deepEqual(
    diff.changes.map((change) => [change.severity, change.kind]),
    [
      ["breaking", "removed-response-body"],
      ["compatible", "removed-request-body"],
    ]
  );
});

test("diff:响应数组元素类型收窄同样是破坏性", () => {
  const withSchema = (items: JsonObject) =>
    document({
      paths: {
        "/users": {
          get: operation({ responses: { "200": { content: { "application/json": { schema: { type: "array", items } } } } } }),
        },
      },
    });
  const diff = diffOf(withSchema({ type: "number" }), withSchema({ type: "integer" }));
  assert.equal(diff.summary.breaking, 1);
  assert.equal(diff.changes[0].kind, "type-narrowed");
  assert.equal(diff.changes[0].field, "responses.200.[]");
});

test("diff:$ref 指向的组件模型必须展开后比较（请求与响应两侧）", () => {
  const withSchemas = (body: JsonObject, resp: JsonObject) =>
    document({
      paths: {
        "/users": {
          post: operation({
            requestBody: { content: { "application/json": { schema: ref("Body") } } },
            responses: { "200": { content: { "application/json": { schema: ref("Resp") } } } },
          }),
        },
      },
      schemas: { Body: body, Resp: resp },
    });
  const baseline = withSchemas(
    { type: "object", required: ["name", "email"], properties: { name: { type: "string" }, email: { type: "string" } } },
    { type: "object", properties: { id: { type: "integer" }, nickname: { type: "string" } } }
  );
  const current = withSchemas(
    { type: "object", required: ["name"], properties: { name: { type: "string" } } },
    { type: "object", properties: { id: { type: "integer" } } }
  );
  const diff = diffOf(baseline, current);
  assert.deepEqual(diff.summary, { breaking: 2, compatible: 0, total: 2 });
  assert.deepEqual(
    diff.changes.map((change) => change.field),
    ["requestBody.email", "responses.200.nickname"]
  );
  assert.deepEqual(
    diff.changes.map((change) => change.schema),
    ["Body", "Resp"]
  );
});

test("diff:同名组件在基线与当前文档中结构不同也必须比较内容", () => {
  const doc = (properties: JsonObject) =>
    document({
      paths: { "/users": { get: operation({ responses: { "200": { content: { "application/json": { schema: ref("User") } } } } }) } },
      schemas: { User: { type: "object", properties } },
    });
  const diff = diffOf(doc({ a: { type: "string" }, b: { type: "string" } }), doc({ a: { type: "string" } }));
  assert.equal(diff.summary.breaking, 1);
  assert.equal(diff.changes[0].field, "responses.200.b");
});

test("diff:响应字段由必有变为可选为破坏性，请求字段由必填变为可选为兼容", () => {
  const response = (schema: JsonObject) =>
    document({
      paths: { "/users": { get: operation({ responses: { "200": { content: { "application/json": { schema } } } } }) } },
    });
  const responseDiff = diffOf(
    response({ type: "object", required: ["email"], properties: { email: { type: "string" } } }),
    response({ type: "object", properties: { email: { type: "string" } } })
  );
  assert.equal(responseDiff.summary.breaking, 1);
  assert.equal(responseDiff.changes[0].kind, "field-became-optional");

  const responseNowRequired = diffOf(
    response({ type: "object", properties: { email: { type: "string" } } }),
    response({ type: "object", required: ["email"], properties: { email: { type: "string" } } })
  );
  assert.deepEqual(responseNowRequired.summary, { breaking: 0, compatible: 1, total: 1 });
  assert.equal(responseNowRequired.changes[0].kind, "field-became-required");

  const request = (schema: JsonObject) =>
    document({
      paths: {
        "/users": { post: operation({ requestBody: { content: { "application/json": { schema } } } }) },
      },
    });
  const requestDiff = diffOf(
    request({ type: "object", required: ["email"], properties: { email: { type: "string" } } }),
    request({ type: "object", properties: { email: { type: "string" } } })
  );
  assert.deepEqual(requestDiff.summary, { breaking: 0, compatible: 1, total: 1 });
  assert.equal(requestDiff.changes[0].kind, "field-became-optional");
});

test("diff:描述变化是兼容变更", () => {
  const baseline = document({ paths: { "/users": { get: operation({ summary: "旧摘要" }) } } });
  const current = document({ paths: { "/users": { get: operation({ summary: "新摘要" }) } } });
  const diff = diffOf(baseline, current);
  assert.deepEqual(diff.summary, { breaking: 0, compatible: 1, total: 1 });
  assert.equal(diff.changes[0].kind, "description-changed");
  assert.equal(diff.changes[0].field, "summary");
});

test("diff:自递归 schema 不会无限展开", () => {
  const recursive = (title: string) =>
    document({
      paths: { "/nodes": { get: operation({ responses: { "200": { content: { "application/json": { schema: ref("Node") } } } } }) } },
      schemas: {
        Node: {
          type: "object",
          title,
          properties: { name: { type: "string" }, child: { allOf: [ref("Node")], nullable: true } },
        },
      },
    });
  const diff = diffOf(recursive("旧"), recursive("新"));
  assert.equal(diff.summary.breaking, 0, "循环引用只应结束递归，不应误报类型变更");
});

test("diff:变更按破坏性优先、位置稳定排序", () => {
  const baseline = document({ paths: { "/b": { get: operation() }, "/a": { get: operation() } } });
  const current = document({ paths: { "/a": { get: operation({ summary: "新" }) }, "/c": { get: operation() } } });
  const diff = diffOf(baseline, current);
  assert.deepEqual(
    diff.changes.map((change) => change.location),
    ["GET /b", "GET /a", "/c"]
  );
  assert.match(formatDiffText(diff), /破坏性变更:[\s\S]*兼容变更:/);
});

test("diff:同一变更被多路径引用时按位置分别报出", () => {
  const doc = (schema: JsonObject): JsonObject =>
    document({
      paths: {
        "/a": { get: operation({ responses: { "200": { content: { "application/json": { schema } } } } }) },
        "/b": { get: operation({ responses: { "200": { content: { "application/json": { schema } } } } }) },
      },
    });
  const baseline = doc({ type: "object", properties: { id: { type: "integer" } } });
  const current = doc({ type: "object", properties: {} });
  const diff = diffOf(baseline, current);
  assert.equal(diff.summary.breaking, 2);
  assert.deepEqual(
    diff.changes.map((change) => change.location).sort(),
    ["GET /a", "GET /b"]
  );
});

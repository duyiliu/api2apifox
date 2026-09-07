import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { analyze, analyzeSubset, endpointAt } from "../pipeline";
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

const files = loadSample();
const analyzed = analyze(files, { title: "demo", pageStyle: "mybatis-plus" });
const spec = analyzed.spec;

test("识别全部接口(含 Feign/JAX-RS/Actuator,hidden 除外)", () => {
  const keys = analyzed.endpoints.map((e) => `${e.method} ${e.path}`).sort();
  const expected = [
    // UserController
    "GET /api/v1/users",
    "GET /api/v1/users/export",
    "POST /api/v1/users",
    "DELETE /api/v1/users/{id}",
    "DELETE /api/v1/users/item/{id}",
    "PUT /api/v1/users/{id}/status",
    "POST /api/v1/users/import",
    "PATCH /api/v1/users/{id}",
    // OrderController(internal-migrate 被 @Operation(hidden=true) 排除)
    "GET /api/v1/orders",
    "GET /api/v1/orders/page",
    "GET /api/v1/orders/page-helper",
    "GET /api/v1/orders/{id}",
    "POST /api/v1/orders",
    "POST /api/v1/orders/v2",
    "DELETE /api/v1/orders/{id}",
    // UserClient (Feign;POST 与 Controller 冲突已被去重,只剩 GET)
    "GET /api/v1/users/{id}",
    // OrderResource (JAX-RS)
    "GET /api/jaxrs/orders",
    "GET /api/jaxrs/orders/{id}",
    "POST /api/jaxrs/orders",
    // FeatureFlagsEndpoint (Actuator)
    "GET /actuator/feature-flags",
    "GET /actuator/feature-flags/{name}",
    "DELETE /actuator/feature-flags/{name}",
  ].sort();
  assert.deepEqual(keys, expected);
});

test("OpenFeign:接口名作为 tag,类级 path 作为前缀;与 Controller 撞车的接口被去重", () => {
  const feign = analyzed.endpoints.filter((e) => e.flavor === "feign");
  // POST /api/v1/users 与 UserController 冲突,保留 Controller 版本;GET /{id} 仅 Feign 声明,保留
  assert.equal(feign.length, 1);
  assert.equal(feign[0].method, "GET");
  assert.ok(feign.every((e) => e.tag === "UserClient"));
  assert.equal(feign[0].returnType, "ApiResult<UserVO>");

  // endpoints 层面同 method+path 只有一份,且是 Controller 版本
  const postUsers = analyzed.endpoints.filter((e) => e.method === "POST" && e.path === "/api/v1/users");
  assert.equal(postUsers.length, 1);
  assert.equal(postUsers[0].controller, "UserController");
});

test("JAX-RS:@QueryParam/@DefaultValue/@PathParam/@Produces/@Consumes", () => {
  const jax = analyzed.endpoints.filter((e) => e.flavor === "jaxrs");
  assert.equal(jax.length, 3);
  const list = spec.paths["/api/jaxrs/orders"].get as Record<string, any>;
  const keyword = list.parameters[0];
  assert.equal(keyword.name, "keyword");
  assert.equal(keyword.required, false);
  assert.equal(keyword.schema.default, "");
  // 类级 @Produces(APPLICATION_JSON) → 响应媒体类型
  assert.equal(list.responses["200"].content["application/json"].schema.type, "array");
  const create = spec.paths["/api/jaxrs/orders"].post as Record<string, any>;
  // @Consumes(APPLICATION_JSON) → 请求体媒体类型
  assert.ok(create.requestBody.content["application/json"]);
  assert.equal(create.requestBody.content["application/json"].schema.$ref, "#/components/schemas/OrderVO");
});

test("Actuator:@Endpoint + @ReadOperation/@DeleteOperation + @Selector", () => {
  const flags = spec.paths["/actuator/feature-flags"];
  const list = flags.get as Record<string, any>;
  assert.equal(list.summary, "查看全部开关");
  assert.equal(list.responses["200"].content["*/*"].schema.additionalProperties.type, "boolean");
  const one = spec.paths["/actuator/feature-flags/{name}"].get as Record<string, any>;
  assert.equal(one.parameters[0].name, "name");
  assert.equal(one.parameters[0].in, "path");
});

test("Pageable 参数展开为 page/size/sort", () => {
  const op = spec.paths["/api/v1/orders"].get as Record<string, any>;
  const names = op.parameters.map((p: any) => p.name);
  assert.deepEqual(names, ["page", "size", "sort"]);
});

test("PageInfo 恒为 PageHelper 形态;Page 按配置风格展开", () => {
  const ph = (spec.paths["/api/v1/orders/page-helper"].get as Record<string, any>).responses["200"].content["*/*"].schema;
  // 分页包装内联展开,直接检查字段形态
  assert.ok(ph.properties.list, "PageInfo 应有 list");
  assert.ok(ph.properties.total, "PageInfo 应有 total");
  assert.equal(ph.properties.list.items.$ref, "#/components/schemas/OrderVO");

  // 默认 mybatis-plus 风格
  const mp = (spec.paths["/api/v1/orders/page"].get as Record<string, any>).responses["200"].content["*/*"].schema;
  assert.ok(mp.properties.records, "mybatis-plus 应有 records 字段: " + JSON.stringify(Object.keys(mp.properties ?? {})));

  // spring-data 风格
  const sdAnalyzed = analyze(files, { title: "demo", pageStyle: "spring-data" });
  const sd = (sdAnalyzed.spec.paths["/api/v1/orders/page"].get as Record<string, any>).responses["200"].content["*/*"].schema;
  assert.ok(sd.properties.content, "spring-data 应有 content 字段");
});

test("Bean Validation 约束映射到 schema", () => {
  const s = spec.components!.schemas["UserCreateRequest"].properties!;
  assert.equal(s.username.minLength, 2);
  assert.equal(s.username.maxLength, 20);
  assert.equal(s.age.minimum, 1);
  assert.equal(s.age.maximum, 120);
  assert.equal(s.email.format, "email");
  assert.equal(s.phone.pattern, "^1\\d{10}$");
  assert.ok(spec.components!.schemas["UserCreateRequest"].required!.includes("username"));

  // @DecimalMin(inclusive=false) → OpenAPI 3.0 形式: minimum + exclusiveMinimum=true
  const amount = spec.components!.schemas["OrderVO"].properties!.amount;
  assert.equal(amount.minimum, 0.01);
  assert.equal(amount.exclusiveMinimum, true);
});

test("无注解的日期参数按 query 处理且不产生告警", () => {
  const op = spec.paths["/api/v1/users/export"].get as Record<string, any>;
  assert.equal(op.parameters.length, 1);
  assert.equal(op.parameters[0].name, "from");
  assert.equal(op.parameters[0].in, "query");
  assert.equal(op.parameters[0].schema.format, "date");
  assert.equal(op.parameters[0].description, "开始日期");
  assert.ok(!analyzed.warnings.some((w) => w.includes("exportByDate")), analyzed.warnings.join("\n"));
});

test("FASTJSON 注解:重命名与 serialize=false", () => {
  const props = spec.components!.schemas["OrderVO"].properties!;
  assert.ok(props.order_no, "orderNo 应重命名为 order_no");
  assert.equal(props.internalMemo, undefined);
  assert.equal(props.amount.format, "double");
});

test("@ApiImplicitParams 补充 query/header 参数,显式参数不重复", () => {
  const op = spec.paths["/api/v1/orders"].post as Record<string, any>;
  const names = op.parameters.map((p: any) => `${p.in}:${p.name}`).sort();
  assert.deepEqual(names, ["header:X-Trace-Id", "query:channel", "query:count", "query:skuId"]);
  const channel = op.parameters.find((p: any) => p.name === "channel");
  assert.equal(channel.description, "下单渠道");
  assert.equal(channel.schema.default, "app");
  assert.equal(channel.required, false);
});

test("@ApiResponses/@ResponseStatus 额外响应", () => {
  const create = spec.paths["/api/v1/orders"].post as Record<string, any>;
  assert.equal(create.responses["400"].description, "参数错误");
  assert.equal(create.responses["409"].description, "库存不足");
  const del = spec.paths["/api/v1/orders/{id}"].delete as Record<string, any>;
  assert.equal(del.responses["403"].description, "订单不允许删除");
});

test("@Deprecated 与 operationId 去重", () => {
  const create = spec.paths["/api/v1/orders"].post as Record<string, any>;
  assert.equal(create.deprecated, true);
  // 两个 DELETE /users/{id} 与 /orders/{id} 无冲突;UserController 双路径的 deleteUser 应有序号
  const opIds = [
    (spec.paths["/api/v1/users/{id}"].delete as any).operationId,
    (spec.paths["/api/v1/users/item/{id}"].delete as any).operationId,
  ];
  assert.notEqual(opIds[0], opIds[1]);
});

test("analyzeSubset 只输出一个接口", () => {
  const sub = analyzeSubset(files, { title: "demo" }, (ep) => ep.path === "/api/v1/orders/v2");
  assert.equal(Object.keys(sub.spec.paths).length, 1);
  assert.equal(sub.endpoints.length, 1);
  assert.ok(spec.components!.schemas["ApiResult«OrderVO»"]);
});

test("endpointAt 按光标位置定位接口", () => {
  const single = files.find((f) => f.fsPath.includes("OrderController"))!;
  const endpoints = analyzed.endpoints;
  const createOrder = endpoints.find((e) => e.operationId === "OrderController_createOrder")!;
  const mid = Math.floor((createOrder.methodRange!.startOffset + createOrder.methodRange!.endOffset) / 2);
  assert.equal(endpointAt(endpoints, single.fsPath, mid)?.operationId, "OrderController_createOrder");
  // 光标在方法之后,取最近的上一个
  const before = createOrder.methodRange!.startOffset - 1;
  assert.ok(endpointAt(endpoints, single.fsPath, before));
});

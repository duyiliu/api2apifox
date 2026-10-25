import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { AnalyzeCache, analyze, analyzeSubset, endpointAt } from "../pipeline";
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
    // UserDetailController(继承 / 泛型基类 / 嵌套静态类 / record 夹具)
    "GET /api/v1/user-details",
    "GET /api/v1/user-details/{id}",
    "PUT /api/v1/user-details/{id}/contact",
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

test("继承字段合并:父类字段进入子类模型,泛型基类形参正确绑定", () => {
  // 回归:superClassOf 曾查找不存在的 "superclass" 节点,导致继承合并从未生效
  const detail = spec.components!.schemas["UserDetailVO"];
  assert.ok("username" in detail.properties!, "子类自有字段应存在");
  assert.ok("createdAt" in detail.properties!, "父类字段 createdAt 应合并");
  assert.ok("createdBy" in detail.properties!, "父类字段 createdBy 应合并");
  assert.equal(detail.properties!.createdAt.format, "date-time");
  assert.equal(detail.properties!.createdBy.description, "创建人 ID");

  // 泛型基类:BasePageResult<UserVO> 的 T 应绑定为 UserVO
  const page = spec.components!.schemas["UserPageResult"];
  assert.equal(page.properties!.records.type, "array");
  assert.equal(page.properties!.records.items!.$ref, "#/components/schemas/UserVO");
  assert.equal(page.properties!.total.format, "int64");
  // 未实例化的基类本身不应被登记为模型
  assert.equal(spec.components!.schemas["BaseAuditVO"], undefined);
});

test("嵌套静态类与非 record 复合字段展开为独立数据模型", () => {
  const detail = spec.components!.schemas["UserDetailVO"];
  // OpenAPI 3.0.3 会忽略 $ref 兄弟字段:带字段说明的引用类型改为 allOf 包装
  assert.deepEqual(detail.properties!.profile.allOf, [{ $ref: "#/components/schemas/Profile" }]);
  assert.equal(detail.properties!.profile.description, "档案信息");
  assert.deepEqual(detail.properties!.contact.allOf, [{ $ref: "#/components/schemas/UserContactRecord" }]);
  assert.equal(detail.properties!.contact.description, "联系方式");

  const profile = spec.components!.schemas["Profile"];
  assert.equal(profile.title, "Profile");
  assert.equal(profile.properties!.nickname.type, "string");
  assert.deepEqual(profile.properties!.status.enum, ["ACTIVE", "INACTIVE"]);
  assert.equal(detail.properties!.tags.type, "array");
});

test("record:首组件注释与后续组件注解都进入模型描述", () => {
  const contact = spec.components!.schemas["UserContactRecord"];
  // 首组件的 javadoc 挂在 recordComponentList 上,需回退读取
  assert.equal(contact.properties!.phone.description, "手机号");
  // 后续组件的 @Schema 注解挂在 recordComponentModifier 上
  assert.equal(contact.properties!.email.description, "电子邮箱");
});

test("查询 Bean(record)展开:嵌套对象按点号命名,集合保持数组形态", () => {
  const op = spec.paths["/api/v1/user-details"].get as Record<string, any>;
  const names = op.parameters.map((p: any) => p.name);
  assert.ok(names.includes("keyword"), "record 顶层组件应展开: " + names);
  assert.ok(names.includes("filter.pageNo"), "嵌套对象应按 父.子 命名: " + names);
  assert.ok(names.includes("filter.pageSize"), "嵌套对象应按 父.子 命名");
  const dept = op.parameters.find((p: any) => p.name === "deptCodes");
  assert.equal(dept.schema.type, "array");
  assert.equal(dept.schema.items.type, "string");
  // 描述来自 record 组件注释
  assert.equal(op.parameters.find((p: any) => p.name === "keyword").description, "关键字");
  assert.ok(
    !analyzed.warnings.some((w) => w.includes("UserQuery")),
    "record 查询 Bean 不应产生无法展开的告警: " + analyzed.warnings.join("|")
  );
});

test("@RequestHeader:无 required 声明默认必填(对齐 Spring),显式 required=false 保持可选", () => {
  const files: SourceFile[] = [
    {
      fsPath: "/mem/HeaderDefaultController.java",
      content: `
package com.example;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/headers")
public class HeaderDefaultController {
    @GetMapping("/a")
    public String a(@RequestHeader("X-Token") String token) { return token; }

    @GetMapping("/b")
    public String b(@RequestHeader(value = "X-Token", required = false) String token) { return token; }
}
`,
    },
  ];
  const out = analyze(files, { title: "demo" });
  const opA = out.spec.paths["/api/headers/a"].get as Record<string, any>;
  assert.equal(opA.parameters[0].required, true);
  const opB = out.spec.paths["/api/headers/b"].get as Record<string, any>;
  assert.equal(opB.parameters[0].required, false);
});

test("Spring 无注解简单参数:引用类型可选,原生类型缺失无法绑定按必填处理", () => {
  const files: SourceFile[] = [
    {
      fsPath: "/mem/SimpleParamController.java",
      content: `
package com.example;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simple")
public class SimpleParamController {
    @GetMapping("/a")
    public String a(String keyword) { return keyword; }

    @GetMapping("/b")
    public String b(int page) { return String.valueOf(page); }
}
`,
    },
  ];
  const out = analyze(files, { title: "demo" });
  const opA = out.spec.paths["/api/simple/a"].get as Record<string, any>;
  assert.equal(opA.parameters[0].in, "query");
  assert.equal(opA.parameters[0].required, false);
  const opB = out.spec.paths["/api/simple/b"].get as Record<string, any>;
  assert.equal(opB.parameters[0].required, true);
});

test("JAX-RS:@QueryParam 无 @DefaultValue 时同样可选(缺失仅取 null)", () => {
  const files: SourceFile[] = [
    {
      fsPath: "/mem/TaskResource.java",
      content: `
package com.example;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.HeaderParam;

@Path("/api/jaxrs-tasks")
public class TaskResource {
    @GET
    public String list(@QueryParam("status") String status, @HeaderParam("X-Auth") String auth) { return status + auth; }
}
`,
    },
  ];
  const out = analyze(files, { title: "demo" });
  const op = out.spec.paths["/api/jaxrs-tasks"].get as Record<string, any>;
  const status = op.parameters.find((p: any) => p.name === "status");
  assert.equal(status.required, false);
  // @HeaderParam 缺失会报错(JAX-RS 规范),无 @DefaultValue 保持必填
  const auth = op.parameters.find((p: any) => p.name === "X-Auth");
  assert.equal(auth.required, true);
});

function cacheFixture(): SourceFile[] {
  return [
    {
      fsPath: "/mem/CacheAlphaController.java",
      content: `package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/cache-alpha")
public class CacheAlphaController {
    @GetMapping("/one")
    public String one() { return "one"; }
}`,
    },
    {
      fsPath: "/mem/CacheBetaController.java",
      content: `package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/cache-beta")
public class CacheBetaController {
    @GetMapping("/one")
    public String one() { return "one"; }
}`,
    },
  ];
}

test("AnalyzeCache:相同文件与配置直接复用结果;文件内容变化即重算", () => {
  const cache = new AnalyzeCache();
  const files = cacheFixture();
  const opts = { title: "cache", cacheKey: "v1" };
  const first = cache.analyze(files, opts);
  const replay = cache.analyze(files, opts);
  assert.equal(replay.spec, first.spec, "同文件同配置应复用上一轮 spec");
  assert.equal(replay.endpoints, first.endpoints, "同文件同配置应复用上一轮 endpoints");
  assert.deepEqual(replay.warnings, first.warnings, "warnings 内容一致");
  assert.notEqual(replay.warnings, first.warnings, "warnings 返回副本防下游原地 push 污染缓存");

  const changed = files.map((f) => (f.fsPath.includes("Alpha") ? { ...f, content: f.content.replace("/one", "/changed") } : f));
  const afterContent = cache.analyze(changed, opts);
  assert.notEqual(afterContent, first, "文件内容变化应重算");
  assert.ok(afterContent.spec.paths["/cache-alpha/changed"]);
  assert.equal(first.spec.paths["/cache-alpha/changed"], undefined);
});

test("AnalyzeCache:cacheKey 变化即重算", () => {
  const cache = new AnalyzeCache();
  const files = cacheFixture();
  const first = cache.analyze(files, { title: "cache", cacheKey: "v1" });
  const second = cache.analyze(files, { title: "cache", cacheKey: "v2" });
  assert.notEqual(second, first);
});

test("AnalyzeCache:同内容不同顺序的 files 数组触发重算(顺序敏感)", () => {
  const cache = new AnalyzeCache();
  const files = cacheFixture();
  const opts = { title: "cache", cacheKey: "v1" };
  const first = cache.analyze(files, opts);
  const reordered = cache.analyze([files[1], files[0]], opts);
  assert.notEqual(reordered, first, "文件顺序变化应重算");
  assert.deepEqual(
    reordered.endpoints.map((e) => e.controller),
    ["CacheBetaController", "CacheAlphaController"]
  );
});

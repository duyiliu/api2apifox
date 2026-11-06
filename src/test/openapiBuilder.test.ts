import assert from "node:assert/strict";
import { test } from "node:test";
import { buildOpenApi } from "../openapi/builder";
import { buildIndex, parseJava } from "../java/typeIndex";
import { analyze } from "../pipeline";
import { EndpointInfo, SourceFile } from "../java/model";

/* ------------------------------------------------------------------ *
 * M8 / G5 的 OpenAPI 生成侧:空 endpoints 的 spec 形态、多级 x-apifox-folder、
 * 同 operationId 冲突、额外响应码、媒体类型回退。
 *
 * buildOpenApi 此前只经 e2e 间接断言;这里直接测它的输出契约。
 * ------------------------------------------------------------------ */

function emptyIndex() {
  return buildIndex([parseJava("/p/Empty.java", "class Empty {}")]);
}

function ep(overrides: Partial<EndpointInfo>): EndpointInfo {
  return {
    method: "GET",
    path: "/demo",
    tag: "demo",
    operationId: "DemoController_demo",
    parameters: [],
    fsPath: "/p/DemoController.java",
    controller: "DemoController",
    flavor: "spring-mvc",
    ...overrides,
  } as EndpointInfo;
}

test("builder:0 个接口时 spec 仍合法:openapi 3.0.3 + info + paths 为空对象", () => {
  const { spec, warnings } = buildOpenApi({ endpoints: [], warnings: [] }, emptyIndex(), { title: "空项目" });
  assert.equal(spec.openapi, "3.0.3");
  assert.equal(spec.info.title, "空项目");
  assert.equal(spec.info.version, "1.0.0");
  assert.deepEqual(spec.paths, {});
  assert.deepEqual(spec.tags, []);
  assert.equal(spec.components, undefined, "无模型时不应产生空 components");
  assert.deepEqual(warnings, []);
});

test("builder:只有告警没有接口时,告警原样带出且 spec 仍合法", () => {
  const { spec, warnings } = buildOpenApi({ endpoints: [], warnings: ["依赖解析失败"] }, emptyIndex(), { title: "t" });
  assert.deepEqual(warnings, ["依赖解析失败"]);
  assert.deepEqual(spec.paths, {});
});

test("builder:多级 x-apifox-folder 原样写入 operation", () => {
  const { spec } = buildOpenApi(
    { endpoints: [ep({ path: "/a/x", operationId: "A_x" })], warnings: [] },
    emptyIndex(),
    { title: "t", folderOf: () => "根/二级/三级" }
  );
  const op = spec.paths["/a/x"].get as Record<string, unknown>;
  assert.equal(op["x-apifox-folder"], "根/二级/三级");
});

test("builder:folderOf 返回空串时不写 x-apifox-folder(交回 tags[0] 决定)", () => {
  const { spec } = buildOpenApi(
    { endpoints: [ep({ path: "/a/x", operationId: "A_x", tag: "订单" })], warnings: [] },
    emptyIndex(),
    { title: "t", folderOf: () => "" }
  );
  const op = spec.paths["/a/x"].get as Record<string, unknown>;
  assert.equal("x-apifox-folder" in op, false);
  assert.deepEqual(op.tags, ["订单"]);
});

test("builder:未提供 folderOf 时不写 x-apifox-folder", () => {
  const { spec } = buildOpenApi({ endpoints: [ep({ path: "/a/x", operationId: "A_x" })], warnings: [] }, emptyIndex(), {
    title: "t",
  });
  assert.equal("x-apifox-folder" in (spec.paths["/a/x"].get as object), false);
});

test("builder:同名 operationId 依次加 _2/_3 后缀,保证全局唯一", () => {
  const { spec } = buildOpenApi(
    {
      endpoints: [ep({ path: "/a", operationId: "same" }), ep({ path: "/b", operationId: "same" }), ep({ path: "/c", operationId: "same" })],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  assert.equal((spec.paths["/a"].get as any).operationId, "same");
  assert.equal((spec.paths["/b"].get as any).operationId, "same_2");
  assert.equal((spec.paths["/c"].get as any).operationId, "same_3");
});

test("builder:同 method+path 重复时 Spring MVC 优先,非 Spring 在后者被跳过并告警", () => {
  const { spec, warnings } = buildOpenApi(
    {
      endpoints: [
        ep({ method: "GET", path: "/dup", operationId: "Feign_get", flavor: "feign", controller: "FeignApi" }),
        ep({ method: "GET", path: "/dup", operationId: "RealController_get", flavor: "spring-mvc", controller: "RealController" }),
      ],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  const op = spec.paths["/dup"].get as any;
  assert.equal(op.operationId, "RealController_get");
  assert.deepEqual(op.tags, ["demo"]);
  // 实测:先 Feign 后 Spring 的替换路径**不产生**告警(只有反向才告警),
  // 因此单接口同步时这条替换对用户完全静默。锁定现状。
  assert.deepEqual(warnings, []);
});

test("builder:同 method+path 且已存在 Spring MVC 时,后到的 Spring MVC 被跳过并告警", () => {
  const { spec, warnings } = buildOpenApi(
    {
      endpoints: [
        ep({ method: "GET", path: "/dup", operationId: "First_get", controller: "First" }),
        ep({ method: "GET", path: "/dup", operationId: "Second_get", controller: "Second" }),
      ],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  assert.equal((spec.paths["/dup"].get as any).operationId, "First_get");
  assert.ok(warnings.some((w) => w.includes("接口重复") && w.includes("Second_get")), JSON.stringify(warnings));
});

test("builder:同一路径不同 method 各自成 operation,不互相覆盖", () => {
  const { spec } = buildOpenApi(
    {
      endpoints: [ep({ method: "GET", path: "/p", operationId: "g" }), ep({ method: "POST", path: "/p", operationId: "p" })],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  assert.deepEqual(Object.keys(spec.paths["/p"]).sort(), ["get", "post"]);
});

test("builder:tags 按首次出现顺序去重", () => {
  const { spec } = buildOpenApi(
    {
      endpoints: [
        ep({ path: "/1", operationId: "a", tag: "乙" }),
        ep({ path: "/2", operationId: "b", tag: "甲" }),
        ep({ path: "/3", operationId: "c", tag: "乙" }),
      ],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  assert.deepEqual(spec.tags?.map((t) => t.name), ["乙", "甲"]);
});

test("builder:void 返回类型不产生 200 响应体;ResponseEntity<T> 剥离外壳", () => {
  const { spec } = buildOpenApi(
    {
      endpoints: [
        ep({ method: "DELETE", path: "/d", operationId: "del", returnType: "void" }),
        ep({ method: "GET", path: "/r", operationId: "resp", returnType: "ResponseEntity<String>" }),
      ],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  const del = spec.paths["/d"].delete as any;
  assert.equal(del.responses["200"].content, undefined);
  const resp = spec.paths["/r"].get as any;
  assert.deepEqual(resp.responses["200"].content["*/*"].schema, { type: "string" });
});

test("builder:未声明 produces/consumes 时回退到 */* 与 application/json", () => {
  const { spec } = buildOpenApi(
    {
      endpoints: [
        ep({
          method: "POST",
          path: "/json",
          operationId: "j",
          returnType: "String",
          requestBody: { typeText: "String", required: true },
        }),
      ],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  const op = spec.paths["/json"].post as any;
  assert.deepEqual(Object.keys(op.requestBody.content), ["application/json"]);
  assert.deepEqual(Object.keys(op.responses["200"].content), ["*/*"]);
});

test("builder:多个 produces 媒体类型各自生成一份 content", () => {
  const { spec } = buildOpenApi(
    {
      endpoints: [ep({ path: "/m", operationId: "m", returnType: "String", produces: ["application/json", "text/plain"] })],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  const op = spec.paths["/m"].get as any;
  assert.deepEqual(Object.keys(op.responses["200"].content).sort(), ["application/json", "text/plain"]);
});

test("builder:额外响应码(@ApiResponse)写进 responses 且不影响 200", () => {
  const { spec } = buildOpenApi(
    {
      endpoints: [
        ep({
          method: "GET",
          path: "/e",
          operationId: "e",
          returnType: "String",
          extraResponses: [{ code: "404", description: "未找到" }, { code: "500" }],
        }),
      ],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  const op = spec.paths["/e"].get as any;
  assert.deepEqual(Object.keys(op.responses).sort(), ["200", "404", "500"]);
  assert.equal(op.responses["404"].description, "未找到");
  assert.equal(op.responses["500"].description, "");
});

test("builder:path 参数恒为 required=true,即使调用方标了 false", () => {
  const { spec } = buildOpenApi(
    {
      endpoints: [
        ep({
          path: "/p/{id}",
          operationId: "p",
          parameters: [{ name: "id", in: "path", typeText: "Long", required: false }],
        }),
      ],
      warnings: [],
    },
    emptyIndex(),
    { title: "t" }
  );
  const param = (spec.paths["/p/{id}"].get as any).parameters[0];
  assert.equal(param.required, true);
  assert.equal(param.schema.format, "int64");
});

test("builder:deprecated 标记透传;非 deprecated 不写该键", () => {
  const { spec } = buildOpenApi(
    { endpoints: [ep({ path: "/old", operationId: "old", deprecated: true }), ep({ path: "/new", operationId: "new" })], warnings: [] },
    emptyIndex(),
    { title: "t" }
  );
  assert.equal((spec.paths["/old"].get as any).deprecated, true);
  assert.equal("deprecated" in (spec.paths["/new"].get as object), false);
});

/* ---------------- 与 analyze 的联动 ---------------- */

test("builder/analyze:真实源码生成的 spec 无 paths 占位、components 只在有模型时出现", () => {
  const simple: SourceFile = {
    fsPath: "/p/SimpleController.java",
    content: `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/s")
public class SimpleController { @GetMapping("/x") public String x(){ return null; } }
`,
  };
  const out = analyze([simple], "t");
  assert.deepEqual(Object.keys(out.spec.paths), ["/s/x"]);
  assert.equal(out.spec.components, undefined, "只有 String 返回时不应有 components");

  const withModel: SourceFile = {
    fsPath: "/p/ModelController.java",
    content: `import org.springframework.web.bind.annotation.*;
class UserVO { public String name; }
@RestController @RequestMapping("/m")
public class ModelController { @GetMapping("/u") public UserVO u(){ return null; } }
`,
  };
  const out2 = analyze([withModel], "t");
  assert.ok(out2.spec.components?.schemas.UserVO, "自定义返回类型必须进 components");
});

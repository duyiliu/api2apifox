import assert from "node:assert/strict";
import Ajv from "ajv";
import { test } from "node:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { analyze, analyzeSubset, AnalyzeCache } from "../pipeline";
import { SourceFile } from "../java/model";

const SAMPLE_ROOT = path.join(__dirname, "..", "..", "sample");

/** OAS 3.0 nullable -> JSON Schema type:[T,null],供 Ajv 做实例级语义校验 */
function oasToJsonSchema(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(oasToJsonSchema);
  }
  if (!node || typeof node !== "object") {
    return node;
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key !== "nullable") {
      out[key] = oasToJsonSchema(value);
    }
  }
  const record = node as Record<string, unknown>;
  if (record.nullable === true && typeof record.type === "string") {
    out.type = [record.type, "null"];
  }
  return out;
}

function compileOasSchema(schema: unknown, schemas: Record<string, unknown>) {
  const ajv = new Ajv({ strict: false, validateFormats: false });
  return ajv.compile({
    ...(oasToJsonSchema(schema) as Record<string, unknown>),
    components: {
      schemas: Object.fromEntries(Object.entries(schemas).map(([name, value]) => [name, oasToJsonSchema(value)])),
    },
  });
}

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

test("analyzeSubset 保留所选控制器自身的 Controller.method 告警", () => {
  // patchUser 的告警是 "UserController.patchUser: ..." 形态,过滤必须按 methodName 匹配回该接口
  const subset = analyzeSubset(loadSample(), { title: "demo" }, (ep) => ep.controller === "UserController");
  assert.ok(
    subset.warnings.some((w) => w.includes("patchUser")),
    "选中接口自身的告警应保留: " + subset.warnings.join("|")
  );
});

test("analyzeSubset 只保留与所选接口相关的告警,未选控制器告警不泄露", () => {
  const subset = analyzeSubset(loadSample(), { title: "demo" }, (ep) => ep.controller === "OrderController");
  assert.ok(subset.endpoints.every((e) => e.controller === "OrderController"));
  // UserController.patchUser 的 warning 不应出现在 OrderController 的子集同步结果中
  assert.ok(!subset.warnings.some((w) => w.includes("patchUser")));
});

test("嵌套静态类(DTO 内部类)纳入类型索引并展开为独立数据模型", () => {
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/PatientSaveRequest.java",
      content: `
package com.example;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.util.List;

@ApiModel("患者保存请求")
public class PatientSaveRequest {
  @ApiModelProperty("姓名")
  private String name;

  @ApiModelProperty("当前健康档案")
  private HealthProfileRequest healthProfile;

  @ApiModel("健康档案请求")
  public static class HealthProfileRequest {
    @ApiModelProperty("高危因素编码数组")
    private List<HighRiskFactorCode> gwys;
  }
}

enum HighRiskFactorCode { LOW_BIRTH_WEIGHT, PRETERM }
`,
    },
    {
      fsPath: "/mem/PatientController.java",
      content: `
package com.example;

import org.springframework.web.bind.annotation.*;

@RestController
public class PatientController {
  /** 新增患者 */
  @PostMapping("/patients")
  public Long save(@RequestBody PatientSaveRequest req) { return 1L; }
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const outer = res.spec.components!.schemas["PatientSaveRequest"];
  assert.deepEqual(outer.properties!.healthProfile.allOf, [{ $ref: "#/components/schemas/HealthProfileRequest" }]);
  assert.equal(outer.properties!.healthProfile.description, "当前健康档案");
  assert.equal(outer.properties!.healthProfile.$ref, undefined);
  // 嵌套类自带类级注解描述,不被外层字段描述覆盖
  const inner = res.spec.components!.schemas["HealthProfileRequest"];
  assert.equal(inner.title, "HealthProfileRequest");
  assert.equal(inner.description, "健康档案请求");
  assert.equal(inner.properties!.gwys.type, "array");
  assert.equal(inner.properties!.gwys.items!.title, "HighRiskFactorCode");
});

test("DTO 继承父类时合并父类字段(java-parser 的 classExtends 节点)", () => {
  // 回归:superClassOf 曾查找不存在的 "superclass" 节点,导致继承在任何路径下都未生效
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/Vo.java",
      content: `
package com.example;

import io.swagger.annotations.ApiModelProperty;

/** 基类 */
public class BaseVo {
  /** 创建时间 */
  private java.time.LocalDateTime createdAt;
  @ApiModelProperty("创建人")
  private Long createdBy;
}

/** 子类 */
public class PatientVo extends BaseVo {
  /** 姓名 */
  private String name;
}
`,
    },
    {
      fsPath: "/mem/Ctrl.java",
      content: `
package com.example;

import org.springframework.web.bind.annotation.*;

@RestController
public class Ctrl {
  /** 查询 */
  @GetMapping("/vo")
  public PatientVo get() { return null; }
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const schema = res.spec.components!.schemas["PatientVo"];
  assert.ok("name" in schema.properties!, "子类字段应存在");
  assert.ok("createdAt" in schema.properties!, "父类字段 createdAt 应合并");
  assert.ok("createdBy" in schema.properties!, "父类字段 createdBy 应合并");
  assert.equal(schema.properties!.createdAt.format, "date-time");
  // 父类字段的注解描述同样带出
  assert.equal(schema.properties!.createdBy.description, "创建人");
});

test("嵌套类与顶层实体同名时按 Java 作用域引用嵌套类型,同名不同结构追加 _2 后缀并告警", () => {
  // 回归:类型索引只按简单名索引导致请求体里的 ExamProject 被顶层实体覆盖(错引实体字段)
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/SpecialVisitExamProjectSaveRequest.java",
      content: `
package com.example.doctor;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@ApiModel("特殊就诊开立体检项目请求")
public class SpecialVisitExamProjectSaveRequest {
  @ApiModelProperty("本次开立的体检项目列表")
  private List<ExamProject> examProjects;

  @ApiModel("特殊就诊待开立体检项目")
  public static class ExamProject {
    @ApiModelProperty("本地体检项目编码")
    @NotBlank
    private String projectCode;
  }
}
`,
    },
    {
      fsPath: "/mem/ExamProject.java",
      content: `
package com.example.exam;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel("本地体检项目定义")
public class ExamProject {
  @ApiModelProperty("本地项目编码")
  private String projectCode;

  @ApiModelProperty("本地项目名称")
  private String projectName;
}
`,
    },
    {
      fsPath: "/mem/DoctorController.java",
      content: `
package com.example.doctor;

import com.example.exam.ExamProject;
import org.springframework.web.bind.annotation.*;

@RestController
public class DoctorController {
  /** 开立体检项目 */
  @PostMapping("/special/exam-projects")
  public void save(@RequestBody SpecialVisitExamProjectSaveRequest req) { }

  /** 查询体检项目定义 */
  @GetMapping("/exam-projects/{id}")
  public ExamProject get(@PathVariable Long id) { return null; }
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const schemas = res.spec.components!.schemas;
  const nameOf = (ref: string) => ref.split("/").pop()!;

  // 请求体字段引用的是嵌套 DTO(只有 projectCode),而不是同名实体的字段
  const post = res.spec.paths["/special/exam-projects"].post as Record<string, any>;
  const outer = schemas[nameOf(post.requestBody.content["application/json"].schema.$ref)];
  const reqRef = outer.properties!.examProjects.items!.$ref!;
  assert.deepEqual(Object.keys(schemas[nameOf(reqRef)].properties!), ["projectCode"]);

  // 实体响应引用另一份模型(含 projectName),两者不可混用
  const get = res.spec.paths["/exam-projects/{id}"].get as Record<string, any>;
  const entityRef: string = get.responses["200"].content["*/*"].schema.$ref;
  assert.notEqual(nameOf(entityRef), nameOf(reqRef));
  assert.ok("projectName" in schemas[nameOf(entityRef)].properties!);

  // 简单名冲突按 IDEA/easy-api 口径追加 _2 后缀并产生告警
  const clashNames = Object.keys(schemas).filter((k) => k === "ExamProject" || k.startsWith("ExamProject_"));
  assert.equal(clashNames.length, 2);
  assert.ok(res.warnings.some((w) => w.includes("同名类型冲突") && w.includes("ExamProject")));
});

test("抽象父类声明的接口方法被子类继承:路径/归属/覆盖与修饰符口径", () => {
  // 回归:父类方法与类级 @RequestMapping 此前完全不参与子类解析(真实工程 AbstractScaleController 案例)
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/BaseCrudController.java",
      content: `
package com.example.assessment;

import org.springframework.web.bind.annotation.*;

@RequestMapping("/base")
public abstract class BaseCrudController {
  /** 查询列表 */
  @GetMapping("items")
  public String list() { return null; }

  /** 私有方法不应被继承 */
  @GetMapping("secret")
  private void secret() { }

  /** 静态方法不应被继承 */
  @GetMapping("static-hit")
  public static void staticHit() { }

  /** 被覆写的映射(注解留在父类) */
  @DeleteMapping("items/{id}")
  protected void remove(@PathVariable("id") Long id) { }

  /** 被覆写并重声明映射 */
  @PutMapping("items/{id}")
  protected void update(@PathVariable("id") Long id) { }
}
`,
    },
    {
      fsPath: "/mem/ItemController.java",
      content: `
package com.example.assessment;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "条目管理")
@RestController
public class ItemController extends BaseCrudController {
  @Override
  protected void remove(Long id) { }

  /** 覆盖更新 */
  @Override
  @PutMapping("items/{id}")
  protected void update(@PathVariable("id") Long id) { }
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const keys = res.endpoints.map((e) => `${e.method} ${e.path}`).sort();
  assert.deepEqual(keys, ["DELETE /base/items/{id}", "GET /base/items", "PUT /base/items/{id}"]);
  // 继承接口归属具体 Controller,路径前缀与 tag 取具体类的声明
  const list = res.endpoints.find((e) => e.operationId === "ItemController_list")!;
  assert.equal(list.controller, "ItemController");
  assert.equal(list.tag, "条目管理");
  assert.equal(list.summary, "查询列表");
  // 声明位置指向父类文件,ownerFsPath 指向具体 Controller
  assert.ok(list.fsPath.endsWith("BaseCrudController.java"), list.fsPath);
  assert.ok(list.ownerFsPath!.endsWith("ItemController.java"), list.ownerFsPath);
  // 覆写但未重声明映射:父类注解生效(source of truth 仍是父类声明)
  const remove = res.endpoints.find((e) => `${e.method} ${e.path}` === "DELETE /base/items/{id}")!;
  assert.equal(remove.summary, "被覆写的映射(注解留在父类)");
  // 覆写并重声明映射:以子类声明为准,不产生重复接口
  const update = res.endpoints.find((e) => `${e.method} ${e.path}` === "PUT /base/items/{id}")!;
  assert.equal(update.summary, "覆盖更新");
  assert.equal(update.fsPath.endsWith("ItemController.java"), true);
  assert.equal(res.endpoints.filter((e) => `${e.method} ${e.path}` === "PUT /base/items/{id}").length, 1);
});

test("Controller implements 接口时接口上的映射注解生效(子类覆写优先)", () => {
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/OrderApi.java",
      content: `
package com.example.assessment;

import org.springframework.web.bind.annotation.*;

public interface OrderApi {
  /** 订单详情 */
  @GetMapping("{id}")
  String get(@PathVariable("id") Long id);

  /** 删除订单 */
  @DeleteMapping("{id}")
  void remove(@PathVariable("id") Long id);
}
`,
    },
    {
      fsPath: "/mem/OrderController.java",
      content: `
package com.example.assessment;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController implements OrderApi {
  /** 覆盖:订单详情 */
  @Override
  @GetMapping("{id}")
  public String get(@PathVariable("id") Long id) { return null; }

  @Override
  public void remove(@PathVariable("id") Long id) { }
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const keys = res.endpoints.map((e) => `${e.method} ${e.path}`).sort();
  assert.deepEqual(keys, ["DELETE /orders/{id}", "GET /orders/{id}"]);
  const get = res.endpoints.find((e) => e.method === "GET")!;
  assert.equal(get.summary, "覆盖:订单详情");
  assert.equal(get.controller, "OrderController");
  assert.equal(get.declaringType, undefined);
  // 子类未重声明映射时,接口声明兜底
  const remove = res.endpoints.find((e) => e.method === "DELETE")!;
  assert.equal(remove.summary, "删除订单");
  assert.ok(remove.fsPath.endsWith("OrderApi.java"), remove.fsPath);
  assert.equal(remove.declaringType, "OrderApi");
  assert.ok(remove.ownerFsPath!.endsWith("OrderController.java"), remove.ownerFsPath);
});

test("继承的同名重载按参数类型全限定名区分", () => {
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/a/AApi.java",
      content: `
package a;
import org.springframework.web.bind.annotation.*;
public interface AApi {
  @GetMapping("/a") void find(a.Payload payload);
}
`,
    },
    {
      fsPath: "/mem/b/BApi.java",
      content: `
package b;
import org.springframework.web.bind.annotation.*;
public interface BApi {
  @GetMapping("/b") void find(b.Payload payload);
}
`,
    },
    {
      fsPath: "/mem/a/Payload.java",
      content: `package a; public class Payload {}`,
    },
    {
      fsPath: "/mem/b/Payload.java",
      content: `package b; public class Payload {}`,
    },
    {
      fsPath: "/mem/CombinedController.java",
      content: `
import org.springframework.web.bind.annotation.RestController;
@RestController
public class CombinedController implements a.AApi, b.BApi {}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  assert.deepEqual(res.endpoints.map((e) => e.path).sort(), ["/a", "/b"]);
});

test("字段显式声明 Outer.Inner 时优先命中嵌套类型而非同名顶层类型", () => {
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/Holder.java",
      content: `
package com.example;

 /** 外层 */
public class Holder {
  public static class Item {
    private String nestedOnly;
  }
}
`,
    },
    {
      fsPath: "/mem/Item.java",
      content: `
package com.example;

public class Item {
  private String topLevelOnly;
}
`,
    },
    {
      fsPath: "/mem/User.java",
      content: `
package com.example;

public class User {
  private Holder.Item item;
}
`,
    },
    {
      fsPath: "/mem/Ctrl.java",
      content: `
package com.example;

import org.springframework.web.bind.annotation.*;

@RestController
public class Ctrl {
  /** 查询 */
  @PostMapping("/users")
  public void save(@RequestBody User user) { }
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const schemas = res.spec.components!.schemas;
  const bodyRef = (res.spec.paths["/users"].post as Record<string, any>).requestBody.content["application/json"].schema.$ref;
  const userSchema = schemas[bodyRef.split("/").pop()!];
  const itemRef = userSchema.properties!.item.$ref!;
  assert.ok("nestedOnly" in schemas[itemRef.split("/").pop()!].properties!);
});

function analyzeJavaSources(sources: Record<string, string>) {
  return analyze(Object.entries(sources).map(([name, content]) => ({ fsPath: `/mem/${name}.java`, content })), { title: "regression" });
}

test("多层嵌套类型保留完整作用域并优先于顶层同名类型", () => {
  const result = analyzeJavaSources({
    Item: "public class Item { private String topOnly; }",
    Outer: `public class Outer { private Inner.Item relative; public static class Inner {
      private Item item;
      public static class Item { private String nestedOnly; }
    } }`,
    Ctrl: `import org.springframework.web.bind.annotation.*;
      @RestController public class Ctrl {
        @GetMapping("/deep") public Outer.Inner get() { return null; }
        @GetMapping("/outer") public Outer outer() { return null; }
      }`,
  });
  const schemas = result.spec.components!.schemas;
  const operation = result.spec.paths["/deep"].get as any;
  const refName = (schema: any) => schema.$ref.split("/").pop();
  const inner = schemas[refName(operation.responses["200"].content["*/*"].schema)];
  assert.deepEqual(Object.keys(schemas[refName(inner.properties!.item)].properties!), ["nestedOnly"]);
  const outer = schemas[refName((result.spec.paths["/outer"].get as any).responses["200"].content["*/*"].schema)];
  assert.deepEqual(Object.keys(schemas[refName(outer.properties!.relative)].properties!), ["nestedOnly"]);
});

test("同名模型互相递归时双向引用保持各自类型身份", () => {
  for (const reverse of [false, true]) {
    const result = analyzeJavaSources({
      OuterA: "public class OuterA { public static class Node { private String aOnly; private java.util.Optional<OuterB.Node> next; } }",
      OuterB: "public class OuterB { public static class Node { private Integer bOnly; private OuterA.Node next; } }",
      Ctrl: `import org.springframework.web.bind.annotation.*;
        @RestController public class Ctrl {
          @GetMapping("/nodes") public ${reverse ? "OuterB" : "OuterA"}.Node get() { return null; }
        }`,
    });
    const schemas = result.spec.components!.schemas;
    const operation = result.spec.paths["/nodes"].get as any;
    const refName = (schema: any) => (schema.$ref ?? schema.allOf[0].$ref).split("/").pop();
    // Optional 字段引用的是 <Type>Nullable 变体,比较类型身份时去掉该后缀
    const baseName = (name: string) => name.replace(/Nullable$/, "");
    const start = baseName(refName(operation.responses["200"].content["*/*"].schema));
    const next = baseName(refName(schemas[start].properties!.next));
    assert.notEqual(start, next);
    assert.equal(baseName(refName(schemas[next].properties!.next)), start);
    assert.ok((reverse ? "bOnly" : "aOnly") in schemas[start].properties!);
    assert.ok((reverse ? "aOnly" : "bOnly") in schemas[next].properties!);
  }
});

test("自递归 DTO 的 Optional 字段/集合元素/响应使用可空变体并接受 null", () => {
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/NodeController.java",
      content: `package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
public class NodeController {
  @GetMapping("/node")
  public Node get() { return null; }

  @GetMapping("/node-optional")
  public java.util.Optional<Node> getOptional() { return null; }
}

class Node {
  private String name;
  private java.util.Optional<Node> parent;
  private java.util.List<java.util.Optional<Node>> children;
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const schemas = res.spec.components!.schemas;
  const node = schemas["Node"];
  assert.equal(node.nullable, undefined, "基础 DTO 不应变成可空");
  assert.equal(node.properties!.parent.$ref, "#/components/schemas/NodeNullable");
  assert.equal(node.properties!.children.items!.$ref, "#/components/schemas/NodeNullable");
  const optionalResponse = (res.spec.paths["/node-optional"].get as Record<string, any>)
    .responses["200"].content["*/*"].schema;
  assert.equal(optionalResponse.$ref, "#/components/schemas/NodeNullable");

  const nullable = schemas["NodeNullable"];
  assert.equal(nullable.type, "object");
  assert.equal(nullable.nullable, true);
  assert.equal(nullable.allOf, undefined);
  // 变体复制基础 DTO 的字段,递归字段继续指向可空变体
  assert.equal(nullable.properties!.parent.$ref, "#/components/schemas/NodeNullable");
  assert.equal(nullable.properties!.children.items!.$ref, "#/components/schemas/NodeNullable");

  const validateNullable = compileOasSchema(nullable, schemas);
  assert.equal(validateNullable(null), true, "自递归 Optional<DTO> 必须接受 null");
  assert.equal(validateNullable({ name: "n" }), true);
  assert.equal(validateNullable({ name: "n", parent: null, children: [null] }), true);
  assert.equal(validateNullable({ name: "n", parent: { name: "p" }, children: [{ name: "c" }] }), true);
  assert.equal(validateNullable({ name: "n", parent: 42 }), false);
  assert.equal(validateNullable(42), false);
  assert.equal(compileOasSchema(node, schemas)(null), false, "基础 DTO 不应接受 null");
});

test("互递归 DTO 的 Optional 集合元素与响应使用可空变体", () => {
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/MutualController.java",
      content: `package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
public class MutualController {
  @GetMapping("/a")
  public A getA() { return null; }

  @GetMapping("/a-optional")
  public java.util.Optional<A> getOptionalA() { return null; }
}

class A {
  private String aOnly;
  private java.util.Optional<B> next;
  private java.util.List<java.util.Optional<B>> links;
}

class B {
  private String bOnly;
  private A back;
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const schemas = res.spec.components!.schemas;
  const a = schemas["A"];
  assert.equal(a.nullable, undefined);
  assert.equal(a.properties!.next.$ref, "#/components/schemas/BNullable");
  assert.equal(a.properties!.links.items!.$ref, "#/components/schemas/BNullable");
  const optionalResponse = (res.spec.paths["/a-optional"].get as Record<string, any>)
    .responses["200"].content["*/*"].schema;
  assert.equal(optionalResponse.$ref, "#/components/schemas/ANullable");

  for (const name of ["ANullable", "BNullable"]) {
    const schema = schemas[name];
    assert.equal(schema.type, "object", name);
    assert.equal(schema.nullable, true, name);
    assert.equal(schema.allOf, undefined, name);
    const validate = compileOasSchema(schema, schemas);
    assert.equal(validate(null), true, `${name} 必须接受 null`);
    assert.equal(validate({ [name === "ANullable" ? "aOnly" : "bOnly"]: "x" }), true, `${name} 应接受有效 DTO`);
  }
  assert.equal(compileOasSchema(schemas["A"], schemas)(null), false);
  assert.equal(compileOasSchema(schemas["B"], schemas)(null), false);
});

test("泛型继承与自递归字段保留已绑定的嵌套类型身份", () => {
  const result = analyzeJavaSources({
    Item: "public class Item { private String wrong; }",
    Base: "public class Base<T> { private T inherited; }",
    Child: "public class Child<T> extends Base<T> { private Child<T> next; }",
    Ctrl: `import org.springframework.web.bind.annotation.*;
      @RestController public class Ctrl { public static class Item { private String actual; }
        @GetMapping("/generic-cycle") public Child<Item> get() { return null; } }`,
  });
  const schemas = result.spec.components!.schemas;
  const refName = (schema: any) => schema.$ref.split("/").pop();
  const root = (result.spec.paths["/generic-cycle"].get as any).responses["200"].content["*/*"].schema;
  const child = schemas[refName(root)];
  assert.equal(child.properties!.next.$ref, root.$ref);
  assert.deepEqual(Object.keys(schemas[refName(child.properties!.inherited)].properties!), ["actual"]);
});

test("泛型包装按调用处解析同名嵌套实参且保留集合与多层泛型绑定", () => {
  const result = analyzeJavaSources({
    Envelope: "public class Envelope<T> { private T data; private java.util.List<T> items; private Box<T> box; }",
    Box: "public class Box<V> { private V value; }",
    A: `import org.springframework.web.bind.annotation.*;
      @RestController public class A { public static class Item { private String aOnly; }
        @GetMapping("/a") public Envelope<Item> get() { return null; } }`,
    B: `import org.springframework.web.bind.annotation.*;
      @RestController public class B { public static class Item { private String bOnly; }
        @GetMapping("/b") public Envelope<Item> get() { return null; } }`,
  });
  const schemas = result.spec.components!.schemas;
  const deref = (schema: any): any => schemas[schema.$ref.split("/").pop()];
  const responses = ["/a", "/b"].map((url) => (result.spec.paths[url].get as any).responses["200"].content["*/*"].schema);
  assert.notEqual(responses[0].$ref, responses[1].$ref);
  for (const [i, response] of responses.entries()) {
    const envelope = deref(response);
    const expected = [i === 0 ? "aOnly" : "bOnly"];
    assert.deepEqual(Object.keys(deref(envelope.properties.data).properties), expected);
    assert.deepEqual(Object.keys(deref(envelope.properties.items.items).properties), expected);
    assert.deepEqual(Object.keys(deref(deref(envelope.properties.box).properties.value).properties), expected);
  }
});

test("同结构非递归嵌套模型仍复用一个 schema", () => {
  const result = analyzeJavaSources({
    A: `import org.springframework.web.bind.annotation.*;
      @RestController public class A { public static class Item { private String value; }
        @GetMapping("/a") public Item get() { return null; } }`,
    B: `import org.springframework.web.bind.annotation.*;
      @RestController public class B { public static class Item { private String value; }
        @GetMapping("/b") public Item get() { return null; } }`,
  });
  const a = (result.spec.paths["/a"].get as any).responses["200"].content["*/*"].schema.$ref;
  const b = (result.spec.paths["/b"].get as any).responses["200"].content["*/*"].schema.$ref;
  assert.equal(a, b);
  assert.equal(result.warnings.length, 0);
});

test("跨包覆写的基本类型参数不拼包名,只保留子类路由", () => {
  for (const type of ["boolean", "byte", "short", "int", "long", "char", "float", "double"]) {
    const result = analyzeJavaSources({
      Base: `package base;
        import org.springframework.web.bind.annotation.*;
        public abstract class Base { @GetMapping("/old") public String find(@RequestParam ${type} id) { return null; } }`,
      Child: `package api;
        import base.Base;
        import org.springframework.web.bind.annotation.*;
        @RestController public class Child extends Base {
          @Override @GetMapping("/new") public String find(@RequestParam ${type} id) { return null; }
        }`,
    });
    assert.deepEqual(result.endpoints.map((endpoint) => endpoint.path), ["/new"], type);
  }
});


test("endpointsOfFile 回写解析缓存:后续 analyze 复用同一 CST 且版本不变", () => {
  const file: SourceFile = {
    fsPath: "/mem/CacheProbeController.java",
    content: `package com.example;
      import org.springframework.web.bind.annotation.*;
      @RestController
      @RequestMapping("/probe")
      public class CacheProbeController {
        @GetMapping("/ping")
        public String ping() { return "pong"; }
      }`,
  };
  const cache = new AnalyzeCache();
  assert.equal(cache.endpointsOfFile(file.fsPath, file.content).length, 1);

  const entries = (cache as unknown as { cache: Map<string, { parsed: unknown; version: number }> }).cache;
  const afterLens = entries.get(file.fsPath);
  assert.ok(afterLens, "CodeLens 解析结果应回写缓存");

  cache.analyze([file], { title: "cache" });
  const afterAnalyze = entries.get(file.fsPath);
  assert.ok(afterAnalyze);
  assert.equal(afterAnalyze!.parsed, afterLens!.parsed, "后续 analyze 不应重新解析同内容文件");
  assert.equal(afterAnalyze!.version, afterLens!.version, "缓存命中不应分配新版本");
});

test("AnalyzeCache:文件集变化时清理不在新集合内的解析缓存", () => {
  const fileOf = (name: string) => ({
    fsPath: `/mem/${name}.java`,
    content: `package com.example;
      import org.springframework.web.bind.annotation.*;
      @RestController
      @RequestMapping("/${name.toLowerCase()}")
      public class ${name} {
        @GetMapping("/ping")
        public String ping() { return "pong"; }
      }`,
  });
  const a = fileOf("PruneA");
  const b = fileOf("PruneB");
  const cache = new AnalyzeCache();
  const entries = (cache as unknown as { cache: Map<string, unknown> }).cache;

  cache.analyze([a, b], { title: "cache" });
  assert.equal(entries.size, 2);

  cache.analyze([a], { title: "cache" });
  assert.equal(entries.size, 1, "已移出文件集的解析缓存应被清理");
  assert.ok(entries.has(a.fsPath));
  assert.ok(!entries.has(b.fsPath));

  cache.analyze([a, b], { title: "cache" });
  assert.equal(entries.size, 2, "文件回到集合后可正常重新解析");
});

test("$ref 字段的说明/示例/约束使用 allOf 包装(OpenAPI 3.0.3 忽略 $ref 兄弟字段)", () => {
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/RefController.java",
      content: `
package com.example;
import io.swagger.v3.oas.annotations.media.Schema;
import javax.validation.constraints.Min;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/refs")
public class RefController {
  @PostMapping
  public void save(@RequestBody Wrapper wrapper) { }

  @GetMapping("/optional")
  public java.util.Optional<Nested> optional() { return java.util.Optional.empty(); }
}

class Wrapper {
  @Schema(description = "嵌套对象", example = "sample")
  @Min(1)
  private Nested nested;

  private Nested plain;

  private java.util.Optional<Nested> optional;

  private java.util.List<java.util.Optional<Nested>> optionalList;
}

class Nested { private String x; }
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const schemas = res.spec.components!.schemas;
  const wrapper = schemas["Wrapper"];
  assert.deepEqual(wrapper.properties!.nested.allOf, [{ $ref: "#/components/schemas/Nested" }]);
  assert.equal(wrapper.properties!.nested.$ref, undefined);
  assert.equal(wrapper.properties!.nested.description, "嵌套对象");
  assert.equal(wrapper.properties!.nested.example, "sample");
  assert.equal(wrapper.properties!.nested.minimum, 1);
  // Optional<DTO> 不能仅用 allOf + nullable(allOf 仍强制非 null DTO):
  // 复制为非 nullable 约束的独立组件,并保留 $ref 类型身份
  const nullableRef = "#/components/schemas/NestedNullable";
  assert.equal(wrapper.properties!.optional.$ref, nullableRef);
  assert.equal(wrapper.properties!.optionalList.items!.$ref, nullableRef);
  const nullableSchema = schemas["NestedNullable"];
  assert.equal(nullableSchema.type, "object");
  assert.equal(nullableSchema.nullable, true);
  assert.equal(nullableSchema.allOf, undefined);
  assert.deepEqual(Object.keys(nullableSchema.properties!), ["x"]);
  // 响应类型同样覆盖 Optional<DTO>
  const optionalResponse = (res.spec.paths["/refs/optional"].get as Record<string, any>)
    .responses["200"].content["*/*"].schema;
  assert.equal(optionalResponse.$ref, nullableRef);

  // OpenAPI 3.0.3 语义:ref 需解引用;allOf 必须所有子 schema 接受 null;
  // nullable 仅与同层显式 type 一起生效。
  const acceptsNull = (schema: Record<string, any> | undefined): boolean => {
    if (!schema) {
      return false;
    }
    if (typeof schema.$ref === "string") {
      return acceptsNull(schemas[schema.$ref.split("/").pop()!] as Record<string, any>);
    }
    if (Array.isArray(schema.allOf) && !schema.allOf.every(acceptsNull)) {
      return false;
    }
    return schema.nullable === true && typeof schema.type === "string";
  };
  assert.equal(acceptsNull(wrapper.properties!.optional as Record<string, any>), true);
  assert.equal(acceptsNull(wrapper.properties!.optionalList.items as Record<string, any>), true);
  assert.equal(acceptsNull(optionalResponse as Record<string, any>), true);
  assert.equal(acceptsNull(schemas["Nested"] as Record<string, any>), false, "基础 DTO 不应因此变成可空");

  // 用 JSON Schema 校验器按 OAS 3.0 规则把 nullable+type 展开为 type:[T,null] 后验证实例:
  // 新表示接受 null;旧的 allOf + nullable 仍会被被引用的非 null DTO 拒绝。
  const validateOptional = compileOasSchema(nullableSchema, schemas);
  assert.equal(validateOptional(null), true, "Optional<DTO> 必须接受 null");
  assert.equal(validateOptional({ x: "ok" }), true);
  assert.equal(validateOptional("not-object"), false);
  const validateOldAllOf = compileOasSchema(
    {
      allOf: [{ $ref: "#/components/schemas/Nested" }],
      type: "object",
      nullable: true,
    },
    schemas
  );
  assert.equal(validateOldAllOf(null), false, "allOf 包装仍会拒绝 null,故不能使用该表示");
  // 无额外元数据时保持简洁 $ref,不扩大文档体积
  assert.equal(wrapper.properties!.plain.$ref, "#/components/schemas/Nested");

  // 全量结构校验:OpenAPI 3.0.3 的 Reference Object 不允许任何兄弟字段
  const assertNoRefSiblings = (node: unknown, path: string): void => {
    if (!node || typeof node !== "object") {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, index) => assertNoRefSiblings(item, `${path}[${index}]`));
      return;
    }
    const record = node as Record<string, unknown>;
    if (typeof record.$ref === "string") {
      assert.deepEqual(Object.keys(record), ["$ref"], `$ref 同级字段会失效: ${path}`);
      return;
    }
    if (record.nullable === true) {
      // OpenAPI 3.0.3:nullable 只有与显式 type 位于同一 Schema Object 时才生效
      assert.equal(typeof record.type, "string", `nullable 缺少显式 type: ${path}`);
    }
    for (const [key, value] of Object.entries(record)) {
      assertNoRefSiblings(value, `${path}.${key}`);
    }
  };
  assertNoRefSiblings(res.spec, "spec");
});

test("@RequestMapping 未声明 method 时输出常用 HTTP verb 集合,显式 method 不受影响", () => {
  const sources: SourceFile[] = [
    {
      fsPath: "/mem/FlexController.java",
      content: `
package com.example;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flex")
public class FlexController {
  @RequestMapping("/all")
  public String all() { return null; }

  @RequestMapping(value = "/only", method = RequestMethod.POST)
  public String only() { return null; }
}

@RestController
@RequestMapping(path = "/api/restricted", method = RequestMethod.POST)
public class RestrictedController {
  @RequestMapping("/path-only")
  public String pathOnly() { return null; }

  @GetMapping("/get-under-post")
  public String getUnderPost() { return null; }
}

@RestController
@RequestMapping(path = "/api/intersect", method = { RequestMethod.GET, RequestMethod.POST })
public class IntersectController {
  @PostMapping("/only-post")
  public String onlyPost() { return null; }

  @RequestMapping("/path-only")
  public String pathOnly() { return null; }
}
`,
    },
  ];
  const res = analyze(sources, { title: "t" });
  const methods = res.endpoints
    .filter((endpoint) => endpoint.path === "/api/flex/all")
    .map((endpoint) => endpoint.method)
    .sort();
  assert.deepEqual(methods, ["DELETE", "GET", "PATCH", "POST", "PUT"]);
  for (const method of methods) {
    assert.ok((res.spec.paths["/api/flex/all"] as Record<string, unknown>)[method.toLowerCase()]);
  }
  assert.ok(
    res.warnings.some((warning) => warning.includes("FlexController.all") && warning.includes("未声明 method")),
    "未声明 method 时应产生可定位的告警"
  );
  // 显式声明 method 时仍只生成声明的 verb
  const only = res.endpoints.filter((endpoint) => endpoint.path === "/api/flex/only");
  assert.deepEqual(only.map((endpoint) => endpoint.method), ["POST"]);

  // 类级 method 限制与方法级仅声明路径的 @RequestMapping 合并,不应补出错误 verb
  const restricted = res.endpoints.filter((endpoint) => endpoint.path === "/api/restricted/path-only");
  assert.deepEqual(restricted.map((endpoint) => endpoint.method), ["POST"]);
  assert.equal(res.warnings.some((warning) => warning.includes("RestrictedController.pathOnly")), false);

  // 类级 GET+POST 与方法级 @PostMapping 合并为 GET+POST(RequestMethodsRequestCondition.combine)
  const mergedPost = res.endpoints.filter((endpoint) => endpoint.path === "/api/intersect/only-post");
  assert.deepEqual(mergedPost.map((endpoint) => endpoint.method).sort(), ["GET", "POST"]);
  // 方法级未声明 method 时继承类级的 GET+POST
  const inherited = res.endpoints.filter((endpoint) => endpoint.path === "/api/intersect/path-only");
  assert.deepEqual(inherited.map((endpoint) => endpoint.method).sort(), ["GET", "POST"]);
  // 类级 POST 与方法级 @GetMapping 合并为 POST+GET
  const mergedGet = res.endpoints.filter((endpoint) => endpoint.path === "/api/restricted/get-under-post");
  assert.deepEqual(mergedGet.map((endpoint) => endpoint.method).sort(), ["GET", "POST"]);
});

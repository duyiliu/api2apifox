import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { analyze, analyzeSubset, AnalyzeCache } from "../pipeline";
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
  assert.equal(outer.properties!.healthProfile.$ref, "#/components/schemas/HealthProfileRequest");
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
    const refName = (schema: any) => schema.$ref.split("/").pop();
    const start = refName(operation.responses["200"].content["*/*"].schema);
    const next = refName(schemas[start].properties!.next);
    assert.notEqual(start, next);
    assert.equal(refName(schemas[next].properties!.next), start);
    assert.ok((reverse ? "bOnly" : "aOnly") in schemas[start].properties!);
    assert.ok((reverse ? "aOnly" : "bOnly") in schemas[next].properties!);
  }
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

test("泛型基类 Controller 的继承方法按具体类型实例化参数/返回值/请求体", () => {
  const result = analyzeJavaSources({
    User: "public class User { private String username; }",
    BaseController: `import org.springframework.web.bind.annotation.*;
      public abstract class BaseController<T> {
        @GetMapping("/{id}") public T get(@PathVariable("id") Long id) { return null; }
        @PostMapping public T create(@RequestBody T body) { return null; }
        @GetMapping("/list") public java.util.List<T> list(@RequestParam String keyword) { return null; }
      }`,
    UserController: `import org.springframework.web.bind.annotation.*;
      @RestController @RequestMapping("/users")
      public class UserController extends BaseController<User> { }`,
  });
  const schemas = result.spec.components?.schemas ?? {};
  const refName = (schema: any) => schema.$ref?.split("/").pop();
  assert.equal(refName((result.spec.paths["/users/{id}"].get as any).responses["200"].content["*/*"].schema), "User");
  assert.equal(refName((result.spec.paths["/users"].post as any).requestBody.content["application/json"].schema), "User");
  assert.equal(refName((result.spec.paths["/users"].post as any).responses["200"].content["*/*"].schema), "User");
  const listSchema = (result.spec.paths["/users/list"].get as any).responses["200"].content["*/*"].schema;
  assert.equal(listSchema.type, "array");
  assert.equal(refName(listSchema.items), "User");
  // 未绑定的裸 T 不应再出现在接口签名里
  assert.equal(schemas["T"], undefined);
  assert.ok(!result.warnings.some((w) => w.includes("未绑定")), result.warnings.join("|"));
});

test("多级继承与嵌套泛型实参逐级替换", () => {
  const result = analyzeJavaSources({
    User: "public class User { private String username; }",
    Base: `import org.springframework.web.bind.annotation.*;
      public abstract class Base<T> {
        @GetMapping("/one") public T one() { return null; }
        @GetMapping("/all") public java.util.List<T> all() { return null; }
      }`,
    Middle: `import org.springframework.web.bind.annotation.*;
      public abstract class Middle<T> extends Base<java.util.List<T>> {
        @PostMapping("/middle") public T middle(@RequestBody T body) { return null; }
      }`,
    UserController: `import org.springframework.web.bind.annotation.*;
      @RestController @RequestMapping("/users")
      public class UserController extends Middle<User> { }`,
    ListController: `import org.springframework.web.bind.annotation.*;
      @RestController @RequestMapping("/list-users")
      public class ListController extends Base<java.util.List<User>> { }`,
  });
  const refName = (schema: any) => schema.$ref?.split("/").pop();
  const responseOf = (url: string) => (result.spec.paths[url].get as any).responses["200"].content["*/*"].schema;
  // UserController → Middle<User> → Base<List<User>>:Base 的 T 是 List<User>
  const one = responseOf("/users/one");
  assert.equal(one.type, "array");
  assert.equal(refName(one.items), "User");
  const all = responseOf("/users/all");
  assert.equal(all.type, "array");
  assert.equal(all.items.type, "array");
  assert.equal(refName(all.items.items), "User");
  // Middle 的 T 仍是 User
  const middle = (result.spec.paths["/users/middle"].post as any);
  assert.equal(refName(middle.requestBody.content["application/json"].schema), "User");
  assert.equal(refName(middle.responses["200"].content["*/*"].schema), "User");
  // 直接继承 Base<List<User>> 的嵌套泛型实参
  const direct = responseOf("/list-users/one");
  assert.equal(direct.type, "array");
  assert.equal(refName(direct.items), "User");
  assert.ok(!result.warnings.some((w) => w.includes("未绑定")), result.warnings.join("|"));
});

test("无法绑定的继承泛型形参产生明确告警并保留原类型", () => {
  const result = analyzeJavaSources({
    Base: `import org.springframework.web.bind.annotation.*;
      public abstract class Base<T> {
        @GetMapping("/raw") public T raw(@RequestBody T body) { return null; }
      }`,
    RawController: `import org.springframework.web.bind.annotation.*;
      @RestController @RequestMapping("/raw")
      public class RawController extends Base { }`,
  });
  const warning = result.warnings.find((w) => w.includes("泛型形参 T 未绑定"));
  assert.ok(warning, result.warnings.join("|"));
  assert.ok(warning!.includes("RawController.raw"), warning);
  assert.ok(warning!.includes("Base"), warning);
  // 仍会产出接口(不静默丢弃),类型文本保留 T 并由告警提示
  const raw = result.endpoints.find((e) => e.operationId === "RawController_raw");
  assert.ok(raw);
  assert.equal(raw!.returnType, "T");
  assert.equal(raw!.requestBody?.typeText, "T");
});

test("经中间泛型类传递的未绑定形参仍告警且不引用同名具体模型", () => {
  const result = analyzeJavaSources({
    // 同名顶层类型存在时,未绑定的形参 X 不能被误解析成它
    X: "public class X { private String concreteOnly; }",
    Base: `import org.springframework.web.bind.annotation.*;
      public abstract class Base<T> {
        @GetMapping("/value") public T value(@RequestBody T body) { return null; }
      }`,
    UserController: `import org.springframework.web.bind.annotation.*;
      @RestController @RequestMapping("/users")
      public class UserController<X> extends Base<X> { }`,
  });
  const ep = result.endpoints.find((e) => e.operationId === "UserController_value");
  assert.ok(ep);
  assert.equal(ep!.returnType, "X");
  assert.equal(ep!.requestBody?.typeText, "X");
  assert.deepEqual(ep!.unboundTypeVars, ["X"]);
  const warning = result.warnings.find((w) => w.includes("泛型形参 X 未绑定"));
  assert.ok(warning, result.warnings.join("|"));
  assert.ok(warning!.includes("UserController.value"), warning);
  // 响应体按未识别对象输出,不能落到同名具体模型 X 的 $ref
  const response = (result.spec.paths["/users/value"].get as any).responses["200"].content["*/*"].schema;
  assert.equal(response.$ref, undefined);
  assert.equal(response.type, "object");
  assert.equal(result.spec.components?.schemas?.X, undefined);
});

test("泛型父类方法被具体类型覆写时按绑定后签名去重", () => {
  const result = analyzeJavaSources({
    User: "public class User { private String username; }",
    Base: `import org.springframework.web.bind.annotation.*;
      @RequestMapping("/base")
      public abstract class Base<T> {
        @GetMapping("/old") public T foo(@RequestBody T body) { return null; }
      }`,
    UserController: `import org.springframework.web.bind.annotation.*;
      @RestController @RequestMapping("/users")
      public class UserController extends Base<User> {
        @Override @GetMapping("/new") public User foo(@RequestBody User body) { return null; }
      }`,
  });
  assert.deepEqual(result.endpoints.map((e) => `${e.method} ${e.path}`).sort(), ["GET /users/new"]);
  const ep = result.endpoints[0];
  assert.equal(ep.returnType, "User");
  assert.equal(ep.requestBody?.typeText, "User");
  const response = (result.spec.paths["/users/new"].get as any).responses["200"].content["*/*"].schema;
  assert.equal(response.$ref, "#/components/schemas/User");
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

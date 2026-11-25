import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { analyze } from "../pipeline";
import { buildOpenApi } from "../openapi/builder";
import { buildIndex, parseJava } from "../java/typeIndex";
import { SourceFile } from "../java/model";

/* ------------------------------------------------------------------ *
 * Issue #49:接口鉴权注解(@PreAuthorize/@SaCheckPermission/@Secured 等)
 * 解析并写进接口文档。原文透传,不解析 SpEL/权限串语义;
 * 类级与方法级都列出;无鉴权注解的接口产物零差异。
 * ------------------------------------------------------------------ */

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

function controller(content: string, fsPath = "/p/SecController.java"): SourceFile {
  return { fsPath, content };
}

const SPRING_IMPORTS = "import org.springframework.web.bind.annotation.*;\n";

test("security:类级 + 方法级鉴权注解都收集,方法级不覆盖类级", () => {
  const file = controller(`${SPRING_IMPORTS}
@cn.dev33.satoken.annotation.SaCheckPermission("order:view")
@RestController @RequestMapping("/o")
public class SecController {
  @cn.dev33.satoken.annotation.SaCheckPermission("order:edit")
  @PostMapping("/x")
  public String x() { return null; }
}
`);
  const out = analyze([file], "t");
  const ep = out.endpoints[0];
  assert.ok(ep.security, "应有鉴权要求");
  const classLevel = ep.security!.filter((s) => s.source === "class");
  const methodLevel = ep.security!.filter((s) => s.source === "method");
  assert.deepEqual(classLevel.map((s) => [s.annotation, s.value]), [["SaCheckPermission", "order:view"]]);
  assert.deepEqual(methodLevel.map((s) => [s.annotation, s.value]), [["SaCheckPermission", "order:edit"]]);
});

test("security:全部七种注解均被识别且原文透传", () => {
  const file = controller(`${SPRING_IMPORTS}
@RestController @RequestMapping("/a")
public class SecController {
  @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('user:edit')")
  @org.springframework.security.access.prepost.PostAuthorize("returnObject.owner == authentication.name")
  @org.springframework.security.access.annotation.Secured({"ROLE_ADMIN", "ROLE_USER"})
  @cn.dev33.satoken.annotation.SaCheckPermission("user:view")
  @cn.dev33.satoken.annotation.SaCheckRole("admin")
  @org.apache.shiro.authz.annotation.RequiresPermissions({"user:create", "user:delete"})
  @org.apache.shiro.authz.annotation.RequiresRoles("operator")
  @GetMapping("/x")
  public String x() { return null; }
}
`);
  const out = analyze([file], "t");
  const values = out.endpoints[0].security!.map((s) => `${s.annotation}=${s.value}`);
  assert.deepEqual(values, [
    "PreAuthorize=hasAuthority('user:edit')",
    "PostAuthorize=returnObject.owner == authentication.name",
    "Secured=ROLE_ADMIN",
    "Secured=ROLE_USER",
    "SaCheckPermission=user:view",
    "SaCheckRole=admin",
    "RequiresPermissions=user:create",
    "RequiresPermissions=user:delete",
    "RequiresRoles=operator",
  ]);
});

test("security:复杂 SpEL 原样保留,不做语义解析", () => {
  const file = controller(`${SPRING_IMPORTS}
@RestController @RequestMapping("/a")
public class SecController {
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') and #user.id == authentication.principal.id")
  @GetMapping("/x/{user}")
  public String x(@PathVariable("user") Long user) { return null; }
}
`);
  const out = analyze([file], "t");
  assert.equal(
    out.endpoints[0].security![0].value,
    "hasRole('ADMIN') and #user.id == authentication.principal.id"
  );
});

test("security:继承链父类的类级鉴权注解同样收集", () => {
  const base = controller(`${SPRING_IMPORTS}
@cn.dev33.satoken.annotation.SaCheckPermission("base:perm")
public abstract class BaseController {
}
`, "/p/BaseController.java");
  const child = controller(`${SPRING_IMPORTS}
@RestController @RequestMapping("/c")
public class SecController extends BaseController {
  @GetMapping("/x")
  public String x() { return null; }
}
`);
  const out = analyze([base, child], "t");
  const ep = out.endpoints[0];
  assert.ok(ep.security!.some((s) => s.source === "class" && s.value === "base:perm"));
});

test("security:无鉴权注解时 endpoint.security 为 undefined", () => {
  const file = controller(`${SPRING_IMPORTS}
@RestController @RequestMapping("/plain")
public class PlainController {
  @GetMapping("/x")
  public String x() { return null; }
}
`);
  const out = analyze([file], "t");
  assert.equal(out.endpoints[0].security, undefined);
});

/* ---------------- builder 输出侧 ---------------- */

function analyzeSecurity(mode?: "description" | "extension") {
  const file = controller(`${SPRING_IMPORTS}
@cn.dev33.satoken.annotation.SaCheckPermission("order:view")
@RestController @RequestMapping("/o")
public class SecController {
  /**
   * 创建订单
   */
  @cn.dev33.satoken.annotation.SaCheckPermission("order:edit")
  @cn.dev33.satoken.annotation.SaCheckRole("admin")
  @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('order:edit')")
  @PostMapping("/x")
  public String x() { return null; }
}
`);
  return analyze([file], { title: "t", securityDocMode: mode });
}

test("security/builder:默认写入 description 尾部,类级与方法级都列出", () => {
  const out = analyzeSecurity();
  const op = out.spec.paths["/o/x"].post as Record<string, any>;
  assert.match(String(op.description), /\*\*鉴权要求\*\*/);
  assert.ok(String(op.description).includes("权限：`order:view`(类级 @SaCheckPermission)"), op.description);
  assert.ok(String(op.description).includes("权限：`order:edit`(方法级 @SaCheckPermission)"), op.description);
  assert.ok(String(op.description).includes("角色：`admin`(方法级 @SaCheckRole)"), op.description);
  assert.ok(String(op.description).includes("鉴权：`hasAuthority('order:edit')`(方法级 @PreAuthorize)"), op.description);
  // 不产出 OpenAPI security 全局声明
  assert.equal("security" in op, false);
  assert.equal((out.spec.components as Record<string, unknown> | undefined)?.["securitySchemes"], undefined);
  // 扩展字段不写入
  assert.equal("x-permission" in op, false);
  assert.equal("x-roles" in op, false);
});

test("security/builder:extension 模式写入 x-permission/x-roles,不写 description", () => {
  const out = analyzeSecurity("extension");
  const op = out.spec.paths["/o/x"].post as Record<string, any>;
  assert.deepEqual(op["x-permission"], ["order:view", "order:edit", "hasAuthority('order:edit')"]);
  assert.deepEqual(op["x-roles"], ["admin"]);
  // description 保持原文,不追加鉴权小节
  assert.ok(!String(op.description ?? "").includes("鉴权要求"), op.description);
  assert.equal("security" in op, false);
});

test("security/builder:无鉴权注解的接口产物与现状完全一致", () => {
  const file = controller(`${SPRING_IMPORTS}
@RestController @RequestMapping("/plain")
public class PlainController {
  /** 查询 */
  @GetMapping("/x")
  public String x() { return null; }
}
`);
  const index = buildIndex([parseJava(file.fsPath, file.content)]);
  const parse = { endpoints: analyze([file], "t").endpoints, warnings: [] as string[] };
  const { spec } = buildOpenApi(parse, index, { title: "t" });
  const op = spec.paths["/plain/x"].get as Record<string, any>;
  assert.equal("x-permission" in op, false);
  assert.equal("x-roles" in op, false);
  assert.equal("security" in op, false);
  assert.ok(!String(op.description ?? "").includes("鉴权要求"));
});

test("security/builder:无 description 的接口鉴权小节直接成为描述", () => {
  const file = controller(`${SPRING_IMPORTS}
@RestController @RequestMapping("/n")
public class NoDocController {
  @cn.dev33.satoken.annotation.SaCheckPermission("n:op")
  @GetMapping("/x")
  public String x() { return null; }
}
`);
  const out = analyze([file], { title: "t" });
  const op = out.spec.paths["/n/x"].get as Record<string, any>;
  assert.ok(String(op.description).startsWith("**鉴权要求**"), op.description);
});

/* ---------------- sample 夹具端到端 ---------------- */

test("security/sample:OrderController 类级与方法级鉴权信息出现在导出物中", () => {
  const out = analyze(loadSample(), "demo");
  // 类级注解传播到未加方法级注解的接口
  const list = out.spec.paths["/api/v1/orders"].get as Record<string, any>;
  assert.ok(String(list.description ?? "").includes("order:view"), "listOrders 应含类级权限");
  // 方法级 + 类级同时存在
  const create = out.spec.paths["/api/v1/orders"].post as Record<string, any>;
  assert.ok(String(create.description).includes("order:view"), "createOrder 应含类级权限");
  assert.ok(String(create.description).includes("order:edit"), "createOrder 应含方法级权限");
  assert.ok(String(create.description).includes("order:create"), "createOrder 数组权限逐条展开");
  assert.ok(String(create.description).includes("hasAuthority('order:edit')"), "createOrder 应含 SpEL 原文");
  // @Secured/@SaCheckRole
  const del = out.spec.paths["/api/v1/orders/{id}"].delete as Record<string, any>;
  assert.ok(String(del.description).includes("ROLE_ADMIN"), "deleteOrder 应含 Secured 角色");
  assert.ok(String(del.description).includes("ROLE_ORDER_MANAGER"), "Secured 数组逐条展开");
  assert.ok(String(del.description).includes("角色：`admin`"), "deleteOrder 应含 SaCheckRole");
  // 无鉴权注解的接口(UserController)不受影响
  const users = out.spec.paths["/api/v1/users"].get as Record<string, any>;
  assert.ok(!String(users.description ?? "").includes("鉴权要求"), "UserController 无鉴权注解,描述零差异");
});

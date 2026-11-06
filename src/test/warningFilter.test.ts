/**
 * G9：filterWarningsForEndpoints 正则脆弱点（src/pipeline.ts）。
 *
 * 这段逻辑用正则从告警**文本**反解出"这条告警属于哪个控制器/方法"，
 * 是纯粹的字符串耦合：告警文案一改、类名含特殊字符、或出现不属于任何
 * 控制器的 Service 类告警，就可能误删（用户看不到真实问题）或误留
 * （单接口同步时冒出无关控制器噪声）。
 *
 * 这里把当前口径逐条锁定，并把"已知会误删"的形态显式断言出来，
 * 便于 QA 复核与后续修正。
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { EndpointInfo } from "../java/model";
import { analyzeSubset, filterWarningsForEndpoints } from "../pipeline";

function ep(controller: string, methodName: string, path = "/x"): EndpointInfo {
  return {
    method: "GET",
    path,
    controller,
    operationId: `${controller}_${methodName}`,
    methodName,
    tag: controller,
    flavor: "spring-mvc",
    parameters: [],
  } as never;
}

const KEPT = [ep("UserController", "list"), ep("OrderController", "create", "/o")];

/* ---------------- 形式 1：Controller.method: ... ---------------- */

test("G9 命中已选方法的方法级告警被保留", () => {
  const w = ["UserController.list: 参数 id 缺少 @RequestParam 注解,已忽略"];
  assert.deepEqual(filterWarningsForEndpoints(w, KEPT), w);
});

test("G9 同一控制器但未选中方法的告警被过滤", () => {
  assert.deepEqual(filterWarningsForEndpoints(["UserController.remove: 参数 x 缺注解"], KEPT), []);
});

test("G9 未选中控制器的方法告警被过滤（单接口同步不应泄露他人告警）", () => {
  assert.deepEqual(filterWarningsForEndpoints(["BillingController.pay: 参数 y 缺注解"], KEPT), []);
});

test("G9 方法名大小写敏感：UserController.List 不等价于 list", () => {
  assert.deepEqual(filterWarningsForEndpoints(["UserController.List: 参数 a"], KEPT), []);
});

test("G9 中文冒号「：」同样被识别为分隔符", () => {
  const w = ["UserController.list：参数 a 缺少注解"];
  assert.deepEqual(filterWarningsForEndpoints(w, KEPT), w);
});

test("G9 冒号前后多余空白不影响识别", () => {
  const w = ["UserController.list   :   参数 a"];
  assert.deepEqual(filterWarningsForEndpoints(w, KEPT), w);
});

test("G9 类名含 $ 时可正确匹配（内部类/生成类名）", () => {
  const kept = [ep("Outer$InnerController", "run")];
  const w = ["Outer$InnerController.run: 参数 a"];
  assert.deepEqual(filterWarningsForEndpoints(w, kept), w);
  // 不同内部类不应互相命中
  assert.deepEqual(filterWarningsForEndpoints(["Outer$OtherController.run: 参数 a"], kept), []);
});

test("G9 operationId 口径兜底：告警写 Controller.operationId 也能保留", () => {
  // 有些告警按 operationId 书写（如 UserController_list），两种口径都要认
  const w = ["UserController.UserController_list: 参数 a"];
  assert.deepEqual(filterWarningsForEndpoints(w, KEPT), w);
});

/* ---------------- 形式 2：类级告警 ---------------- */

test("G9 「类 X 的字段」形态按控制器名匹配", () => {
  const keep = "类 UserController 的字段 age: 无法展开";
  assert.deepEqual(filterWarningsForEndpoints([keep], KEPT), [keep]);
  const drop = "类 BillingController 的字段 amount: 无法展开";
  assert.deepEqual(filterWarningsForEndpoints([drop], KEPT), []);
});

test("G9 裸 Controller: 前缀形态被识别（非方法级）", () => {
  const w = ["UserController: 该控制器未声明有效路由"];
  assert.deepEqual(filterWarningsForEndpoints(w, KEPT), w);
  assert.deepEqual(filterWarningsForEndpoints(["OtherController: 未声明有效路由"], KEPT), []);
});

test("G9 Service 后缀类告警：不属于已选控制器时被过滤", () => {
  // 正则把 XxxService 也当作"类级归属"，因此未选中控制器的 Service 告警会被丢掉
  assert.deepEqual(filterWarningsForEndpoints(["类 OrderService 的字段 x: 无法展开"], KEPT), []);
  assert.deepEqual(filterWarningsForEndpoints(["OrderService: 无法解析返回值"], KEPT), []);
});

/* ---------------- 全局告警必须保留 ---------------- */

test("G9 不含控制器信息的全局告警必须保留（否则用户看不到真实问题）", () => {
  const globals = [
    "maven 仓库不可达:/home/u/.m2/repository",
    "依赖 jar 数量达到上限 120,忽略 3 个已定位依赖 jar:dep-a.jar",
    ".apifox-helper.properties 第 3 行语法无法识别",
    "/p/Bad.java: Java 语法解析失败,已跳过该文件的接口提取",
    "PageHelper 分页展开失败",
  ];
  assert.deepEqual(filterWarningsForEndpoints(globals, KEPT), globals);
});

test("G9 空告警列表返回空列表", () => {
  assert.deepEqual(filterWarningsForEndpoints([], KEPT), []);
});

test("G9 未保留任何接口时：非全局告警全部过滤，全局告警保留", () => {
  const warnings = ["UserController.list: 参数 a", "全局: 仓库不可达"];
  assert.deepEqual(filterWarningsForEndpoints(warnings, []), ["全局: 仓库不可达"]);
});

/* ---------------- 已知正则脆弱点（显式记录，不是通过断言） ---------------- */

test("G9 已知误判：名字里含 Controller/Service 子串的非控制器类会被当成控制器", () => {
  // `([A-Za-z0-9_$]+Controller|...Service)\b` 只要求以 Controller/Service 结尾，
  // 因此 "MockControllerFactory" 这类正常类名不会被匹配（不以 Controller 结尾），
  // 但 "MyController" 这样的 DTO 名会被当成控制器而误过滤。
  const warning = "类 MyController 的字段 x: 无法展开";
  // 未选中 MyController（它不是真控制器也不在 kept 里）→ 告警被丢弃
  assert.deepEqual(filterWarningsForEndpoints([warning], KEPT), []);
  // 说明：这是正则口径的直接后果。若该 DTO 实际属于已选控制器，这条告警会静默消失。
});

test("G9 告警正文中段出现 Controller.method（不在行首）时无法归属，按全局告警保留", () => {
  // 形式 1 要求 `Controller.method:` 出现在**行首**，形式 2 要求行首或「类 X」。
  // 因此夹在正文中间的类名不被当作归属 → 整条保留。
  // 后果：单接口同步时这类告警会漏过过滤（噪声），但不会丢信息——属可接受的偏差方向。
  const warning = "无法解析 UserController.list 的返回类型";
  assert.deepEqual(filterWarningsForEndpoints([warning], KEPT), [warning]);
  // 未选中控制器也保留（同样无法归属）
  assert.deepEqual(filterWarningsForEndpoints(["无法解析 BillingController.pay 的返回类型"], KEPT), [
    "无法解析 BillingController.pay 的返回类型",
  ]);
});

test("G9 行首的 Controller.method: 则一定被归属（与上文对照，体现行首锚定的重要性）", () => {
  assert.deepEqual(filterWarningsForEndpoints(["BillingController.pay: 返回类型无法解析"], KEPT), []);
  assert.deepEqual(filterWarningsForEndpoints(["UserController.list: 返回类型无法解析"], KEPT), [
    "UserController.list: 返回类型无法解析",
  ]);
});

/* ---------------- C-D4：端点缺 methodName 时的兜底口径 ---------------- */

test("G9 C-D4：端点缺 methodName 时，parser 口径告警仍然保留（从 operationId 反推方法名）", () => {
  // QA 复现场景：下游重建/继承来的端点可能没有 methodName（该字段可选）。
  // 旧实现兜底键 = `Controller.Controller_method`，parser 写的 `Controller.method:` 告警被静默丢弃。
  const kept = [{ ...ep("UserController", "getUserById"), methodName: undefined } as EndpointInfo];
  const warning = "UserController.getUserById: 参数 id 缺少 @RequestParam 注解,已忽略";
  assert.deepEqual(filterWarningsForEndpoints([warning], kept), [warning]);
});

test("G9 C-D4：端点缺 methodName 时，未选中的方法仍被过滤（兜底不放宽口径）", () => {
  const kept = [{ ...ep("UserController", "getUserById"), methodName: undefined } as EndpointInfo];
  assert.deepEqual(filterWarningsForEndpoints(["UserController.delete: 参数 id"], kept), []);
});

test("G9 C-D4：operationId 不符合 Controller_method 形态时退回 operationId 键（不误伤）", () => {
  const kept = [
    {
      ...ep("UserController", "x", "/x"),
      methodName: undefined,
      operationId: "customOperationName",
    } as EndpointInfo,
  ];
  // 兜底键为 UserController.customOperationName
  assert.deepEqual(filterWarningsForEndpoints(["UserController.customOperationName: 参数 a"], kept), [
    "UserController.customOperationName: 参数 a",
  ]);
  assert.deepEqual(filterWarningsForEndpoints(["UserController.other: 参数 a"], kept), []);
});

/* ---------------- 与 analyzeSubset 的端到端联动 ---------------- */

test("G9 端到端：单接口同步只保留该接口所属控制器的告警", () => {
  const files = [
    {
      fsPath: "/p/UserController.java",
      content: `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/u")
public class UserController {
  @GetMapping("/a")
  public String a(@RequestParam String ok) { return null; }
  @GetMapping("/b")
  public String b(java.util.List<Foo> bars) { return null; }
}`,
    },
    {
      fsPath: "/p/OtherController.java",
      content: `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/o")
public class OtherController {
  @GetMapping("/c")
  public String c(java.util.List<Foo> bars) { return null; }
}`,
    },
  ];
  const out = analyzeSubset(files, { title: "t" }, (e) => e.path === "/u/a");
  assert.equal(out.endpoints.length, 1);
  // 只同步 /u/a：/u/b 与 /o/c 的"参数无法展开"告警都应被过滤
  assert.deepEqual(out.warnings, [], `不应泄露未选中方法的告警:${out.warnings.join(" | ")}`);
});

test("G9 端到端：全量分析（无过滤）保留所有告警", () => {
  const files = [
    {
      fsPath: "/p/A.java",
      content: `import org.springframework.web.bind.annotation.*;
@RestController
public class A {
  @GetMapping("/a")
  public String a(java.util.List<Foo> bars) { return null; }
}`,
    },
  ];
  // 恒真谓词等价全量，但会走过滤分支：已选方法的告警必须一条不少
  const filtered = analyzeSubset(files, { title: "t" }, () => true);
  assert.ok(filtered.warnings.some((w) => w.includes("bars")), filtered.warnings.join("|"));
  // 未过滤路径的告警集合应与之相同
  const { analyze } = require("../pipeline") as typeof import("../pipeline");
  assert.deepEqual(filtered.warnings, analyze(files, { title: "t" }).warnings);
});

/* ---------------- 缓存副本语义（PIPE-5 变异防线） ---------------- */

test("G9 缓存命中返回 warnings 副本：调用方 push 不污染缓存", async () => {
  const { AnalyzeCache } = await import("../pipeline");
  const files = [
    {
      fsPath: "/p/CacheController.java",
      content: `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/c")
public class CacheController {
  @GetMapping("/a")
  public String a(java.util.List<Foo> bars) { return null; }
}`,
    },
  ];
  const cache = new AnalyzeCache();
  const first = cache.analyze(files, { title: "t" });
  assert.equal(first.warnings.length, 1);

  // 模拟 uploader.syncToApifox 的原地 push：污染必须落在"缓存命中返回的那一份"上，
  // 否则变异体（直接返回缓存对象）不会暴露问题。
  const second = cache.analyze(files, { title: "t" });
  second.warnings.push("调用方追加的提示语");

  const third = cache.analyze(files, { title: "t" });
  assert.equal(third.warnings.length, 1, "缓存结果被调用方污染了");
  assert.ok(!third.warnings.includes("调用方追加的提示语"));
  // 命中返回的数组不能是缓存内部数组的同一引用
  assert.notEqual(third.warnings, second.warnings);
});

test("G9 缓存命中返回的 endpoints/spec 与首次一致（副本不改变内容）", async () => {
  const { AnalyzeCache } = await import("../pipeline");
  const files = [
    {
      fsPath: "/p/C2.java",
      content: `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/c2")
public class C2 {
  @GetMapping("/a")
  public String a() { return null; }
}`,
    },
  ];
  const cache = new AnalyzeCache();
  const first = cache.analyze(files, { title: "t" });
  const second = cache.analyze(files, { title: "t" });
  assert.equal(first.endpoints.length, second.endpoints.length);
  assert.deepEqual(
    first.spec.paths && Object.keys(first.spec.paths),
    second.spec.paths && Object.keys(second.spec.paths)
  );
});

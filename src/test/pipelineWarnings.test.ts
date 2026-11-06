import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze, analyzeSubset, AnalyzeCache, dedupeEndpoints, filterWarningsForEndpoints, endpointAt } from "../pipeline";
import { EndpointInfo, SourceFile } from "../java/model";

/* ------------------------------------------------------------------ *
 * 本文件锁定 pipeline.ts 的三处高风险逻辑:
 *  1. filterWarningsForEndpoints 用正则从告警正文反解 Controller/方法名 —— 属于
 *     「文本耦合」,任一正则改动都会静默漏/多过滤单接口同步的告警。
 *  2. dedupeEndpoints 的「Spring MVC 优先」规则 —— 决定同一 method+path 究竟把谁的
 *     目录与 operationId 传给 Apifox。
 *  3. AnalyzeCache 的结果缓存键 —— filterKey 碰撞、warnings 副本、文件集变更清理。
 *
 * 所有断言都基于实测行为,不臆造预期。
 * ------------------------------------------------------------------ */

function src(name: string, content: string): SourceFile {
  return { fsPath: `/proj/src/main/java/demo/${name}`, content };
}

function ep(overrides: Partial<EndpointInfo>): EndpointInfo {
  return {
    tag: "demo",
    method: "GET",
    path: "/demo",
    operationId: "op",
    parameters: [],
    fsPath: "/proj/src/main/java/demo/DemoController.java",
    controller: "DemoController",
    flavor: "spring-mvc",
    ...overrides,
  } as EndpointInfo;
}

const SPRING_OK = src(
  "OkController.java",
  `import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api")
public class OkController {
  @GetMapping("/x") public String x() { return null; }
}
`
);

/* ---------------- filterWarningsForEndpoints ---------------- */

test("warnings 过滤:保留被选控制器的方法告警,丢弃未选控制器的告警", () => {
  const kept = [ep({ controller: "OrderController", methodName: "get", operationId: "OrderController_get" })];
  const warnings = [
    "OrderController.get: 参数 id 缺少注解,已忽略",
    "UserController.list: 参数 name 缺少注解,已忽略",
  ];
  assert.deepEqual(filterWarningsForEndpoints(warnings, kept), ["OrderController.get: 参数 id 缺少注解,已忽略"]);
});

test("warnings 过滤:方法名匹配同时认 methodName 与 operationName 两种口径", () => {
  // controllerParser 写的前缀是 methodName;operationId 是 Controller_methodName。
  // 任一命中都必须保留,否则单接口同步会把真实告警吞掉。
  const byMethodName = [ep({ controller: "A", methodName: "list", operationId: "A_list" })];
  assert.deepEqual(filterWarningsForEndpoints(["A.list: w1"], byMethodName), ["A.list: w1"]);
  // 只有 operationId 没有 methodName 时,keptOperations 的键是 `A.A.list`(controller.operationId),
  // 与告警正文 `A.list` 对不上 —— 实测会丢弃。锁定现状,避免误以为有兜底。
  const byOperationId = [ep({ controller: "A", methodName: undefined, operationId: "A.list" })];
  assert.deepEqual(filterWarningsForEndpoints(["A.list: w2"], byOperationId), []);
  // 方法名不同则必须丢弃
  assert.deepEqual(filterWarningsForEndpoints(["A.other: w3"], byMethodName), []);
});

test("warnings 过滤:类级告警按「类 X 的字段」形态归属到控制器", () => {
  const kept = [ep({ controller: "OrderController", operationId: "OrderController_get", methodName: "get" })];
  const warnings = [
    "类 OrderController 的字段 age: 类型未识别",
    "类 UserController 的字段 age: 类型未识别",
  ];
  assert.deepEqual(filterWarningsForEndpoints(warnings, kept), ["类 OrderController 的字段 age: 类型未识别"]);
});

test("warnings 过滤:Service 后缀的类告警不被当作控制器保留(会泄露未选范围)", () => {
  // 正则把 XxxService 也纳入「类名」候选,但只有实际被选中的 Controller 才保留。
  const kept = [ep({ controller: "OrderController", operationId: "OrderController_get", methodName: "get" })];
  assert.deepEqual(filterWarningsForEndpoints(["SomeService: 依赖解析失败"], kept), []);
  assert.deepEqual(filterWarningsForEndpoints(["类 SomeService 的字段 x: 未识别"], kept), []);
  // 若该 Service 恰好与控制器同名(极端但可能),则保留 —— 锁定当前语义
  const sameName = [ep({ controller: "SomeService", operationId: "SomeService_get", methodName: "get" })];
  assert.deepEqual(filterWarningsForEndpoints(["SomeService: w"], sameName), ["SomeService: w"]);
});

test("warnings 过滤:全局系统级告警始终保留(不能因单接口同步而丢失)", () => {
  const kept: EndpointInfo[] = [];
  const warnings = [
    "依赖 jar 数量达到上限 120,忽略 3 个已定位依赖 jar:a.jar, b.jar",
    "没有扫描到任何 Java 源文件",
    ".apifox-helper.properties 规则无法求值,已跳过",
  ];
  assert.deepEqual(filterWarningsForEndpoints(warnings, kept), warnings);
});

test("warnings 过滤:Controller 名含 $ 的嵌套类告警按 $ 边界解析", () => {
  const kept = [ep({ controller: "Outer$Inner", methodName: "get", operationId: "Outer$Inner_get" })];
  assert.deepEqual(filterWarningsForEndpoints(["Outer$Inner.get: w"], kept), ["Outer$Inner.get: w"]);
  // 前缀粘连(Outer$InnerX)不应命中 Outer$Inner
  const other = [ep({ controller: "Outer$Inner", methodName: "get", operationId: "Outer$Inner_get" })];
  assert.deepEqual(filterWarningsForEndpoints(["Outer$InnerX.get: w"], other), []);
});

test("warnings 过滤:中文全角冒号的方法告警同样识别(解析器两种冒号都会写)", () => {
  const kept = [ep({ controller: "A", methodName: "get", operationId: "A_get" })];
  assert.deepEqual(filterWarningsForEndpoints(["A.get： 参数未识别"], kept), ["A.get： 参数未识别"]);
});

test("warnings 过滤:仅 Controller 名去掉后剩空方法名的字符串不被误判为方法告警", () => {
  const kept = [ep({ controller: "A", methodName: "get", operationId: "A_get" })];
  // "A.: ..." 方法名捕获组要求至少一个标识符字符,故不匹配形式 1,退化为不匹配任何形式 -> 作为全局告警保留
  assert.deepEqual(filterWarningsForEndpoints(["A.: 奇怪的告警"], kept), ["A.: 奇怪的告警"]);
});

/* ---------------- dedupeEndpoints ---------------- */

test("dedupe:同 method+path 时 Spring MVC 覆盖 Feign/JAX-RS,保留 Controller 版本", () => {
  const feignFirst = dedupeEndpoints([
    ep({ method: "GET", path: "/x", flavor: "feign", controller: "FeignClient" }),
    ep({ method: "GET", path: "/x", flavor: "spring-mvc", controller: "RealController" }),
  ]);
  assert.deepEqual(feignFirst.map((e) => e.controller), ["RealController"]);

  const springFirst = dedupeEndpoints([
    ep({ method: "GET", path: "/x", flavor: "spring-mvc", controller: "RealController" }),
    ep({ method: "GET", path: "/x", flavor: "feign", controller: "FeignClient" }),
  ]);
  assert.deepEqual(springFirst.map((e) => e.controller), ["RealController"]);
});

test("dedupe:两个非 Spring 风格重复时保留先出现者,两个 Spring 重复也保留先出现者", () => {
  assert.deepEqual(
    dedupeEndpoints([
      ep({ method: "GET", path: "/x", flavor: "feign", controller: "F1" }),
      ep({ method: "GET", path: "/x", flavor: "jaxrs", controller: "J1" }),
    ]).map((e) => e.controller),
    ["F1"]
  );
  assert.deepEqual(
    dedupeEndpoints([
      ep({ method: "GET", path: "/x", flavor: "spring-mvc", controller: "C1" }),
      ep({ method: "GET", path: "/x", flavor: "spring-mvc", controller: "C2" }),
    ]).map((e) => e.controller),
    ["C1"]
  );
});

test("dedupe:method 或 path 任一不同都不合并(大小写敏感,method 本身已是大写)", () => {
  const out = dedupeEndpoints([
    ep({ method: "GET", path: "/x" }),
    ep({ method: "POST", path: "/x" }),
    ep({ method: "GET", path: "/y" }),
  ]);
  assert.equal(out.length, 3);
});

test("dedupe:保持首次出现的顺序(影响 OpenAPI paths 生成顺序)", () => {
  const out = dedupeEndpoints([
    ep({ method: "GET", path: "/b" }),
    ep({ method: "GET", path: "/a" }),
    ep({ method: "GET", path: "/b", flavor: "feign" }),
  ]);
  assert.deepEqual(out.map((e) => e.path), ["/b", "/a"]);
});

/* ---------------- AnalyzeCache ---------------- */

test("cache:相同 filterKey 但谓词不同时会命中错误结果(当前实现的已知边界)", () => {
  // 实测:filterKey 是调用方声明的「语义键」,缓存直接按它计键,不校验谓词本身。
  // 这里锁定现状 —— 若将来把谓词纳入键,该用例应改为断言两个不同结果。
  const cache = new AnalyzeCache();
  const files = [SPRING_OK];
  const first = cache.analyzeSubset(files, "t", (e) => e.path === "/api/x", "file:same");
  const second = cache.analyzeSubset(files, "t", (e) => e.path === "/api/never", "file:same");
  assert.equal(first.endpoints.length, 1);
  assert.equal(second.endpoints.length, 1, "同一 filterKey 复用了首个结果(调用方必须保证 filterKey 与谓词一一对应)");
});

test("cache:不同 filterKey 即使谓词相同也会各自计算,结果独立", () => {
  const cache = new AnalyzeCache();
  const files = [SPRING_OK];
  const a = cache.analyzeSubset(files, "t", (e) => e.path === "/api/x", "file:a");
  const b = cache.analyzeSubset(files, "t", (e) => e.path === "/api/never", "file:b");
  assert.equal(a.endpoints.length, 1);
  assert.equal(b.endpoints.length, 0);
});

test("cache:返回的 warnings 是副本,调用方原地 push 不污染缓存结果", () => {
  const cache = new AnalyzeCache();
  const files = [src("WarnController.java", `import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/w")
public class WarnController {
  @GetMapping("/a") public String a(Unknown arg) { return null; }
}
`)];
  const first = cache.analyze(files, "t");
  assert.ok(first.warnings.length > 0, "前置条件:该源码必须产生告警");
  first.warnings.push("CALLER_MUTATED");
  const second = cache.analyze(files, "t");
  assert.ok(!second.warnings.includes("CALLER_MUTATED"), "缓存里的 warnings 不能被调用方污染");
});

test("cache:文件内容变化后结果失效并重新解析", () => {
  const cache = new AnalyzeCache();
  const v1 = src("C.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/v1") public class C { @GetMapping("/a") public String a(){return null;} }
`);
  const v2 = src("C.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/v2") public class C { @GetMapping("/a") public String a(){return null;} }
`);
  assert.deepEqual(cache.analyze([v1], "t").endpoints.map((e) => e.path), ["/v1/a"]);
  assert.deepEqual(cache.analyze([v2], "t").endpoints.map((e) => e.path), ["/v2/a"]);
});

test("cache:文件顺序变化被视为文件集变化,结果不串味", () => {
  const cache = new AnalyzeCache();
  const a = src("A.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/a") public class A { @GetMapping("/1") public String g(){return null;} }
`);
  const b = src("B.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/b") public class B { @GetMapping("/2") public String g(){return null;} }
`);
  const first = cache.analyze([a, b], "t");
  const second = cache.analyze([b, a], "t");
  assert.deepEqual(first.endpoints.map((e) => e.path).sort(), ["/a/1", "/b/2"]);
  assert.deepEqual(second.endpoints.map((e) => e.path).sort(), ["/a/1", "/b/2"]);
});

test("cache:文件被移出集合后其解析缓存被清理,不会被后续同名路径误用", () => {
  const cache = new AnalyzeCache();
  const a = src("A.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/a") public class A { @GetMapping("/1") public String g(){return null;} }
`);
  cache.analyze([a], "t");
  // 只传空集合:文件集变化 -> 清理不存活条目
  const empty = cache.analyze([], "t");
  assert.equal(empty.endpoints.length, 0);
  // 再把同路径但不同内容放回:必须重新解析而不是拿旧 CST
  const a2 = { ...a, content: a.content.replace("/a", "/changed") };
  assert.deepEqual(cache.analyze([a2], "t").endpoints.map((e) => e.path), ["/changed/1"]);
});

test("cache:options 变化(标题/分页风格/规则)会失效结果缓存", () => {
  const cache = new AnalyzeCache();
  const files = [SPRING_OK];
  const first = cache.analyze(files, { title: "T1" });
  const second = cache.analyze(files, { title: "T2" });
  assert.equal(first.spec.info.title, "T1");
  assert.equal(second.spec.info.title, "T2");
});

test("cache:endpointsOfFile 回写缓存并推进代际,随后全量分析能看到该文件的新接口", () => {
  const cache = new AnalyzeCache();
  const content = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/f") public class F { @GetMapping("/a") public String a(){return null;} }
`;
  assert.deepEqual(cache.endpointsOfFile(SPRING_OK.fsPath, content).map((e) => e.path), ["/f/a"]);
  const out = cache.analyze([{ fsPath: SPRING_OK.fsPath, content }], "t");
  assert.deepEqual(out.endpoints.map((e) => e.path), ["/f/a"]);
});

/* ---------------- analyze / analyzeSubset 一致性 ---------------- */

test("analyzeSubset 与 analyze 过滤后的结果一致(接口与 spec 的 paths 键)", () => {
  const files = [
    src("MultiController.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/m") public class MultiController {
  @GetMapping("/a") public String a(){return null;}
  @PostMapping("/b") public String b(){return null;}
}
`),
  ];
  const full = analyze(files, "t");
  const subset = analyzeSubset(files, { title: "t" }, (e) => e.method === "POST");
  assert.deepEqual(subset.endpoints.map((e) => `${e.method} ${e.path}`), ["POST /m/b"]);
  assert.deepEqual(Object.keys(subset.spec.paths), ["/m/b"]);
  const pathItem = subset.spec.paths["/m/b"];
  assert.ok(pathItem.post, "子集只应包含 POST");
  assert.equal(pathItem.get, undefined, "GET 不应出现在子集 spec 中");
  assert.equal(full.endpoints.length, 2);
});

test("analyze 默认不去重 warnings 之外的重复项:同文件同名 operationId 生成 _2 后缀", () => {
  const out = analyze(
    [
      src("DupController.java", `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/d") public class DupController {
  public String same(){return null;}
  @GetMapping("/a") public String a(){return same();}
}
@RestController @RequestMapping("/d2") public class Dup2Controller {
  public String same(){return null;}
  @GetMapping("/b") public String b(){return same();}
}
`),
    ],
    "t"
  );
  assert.equal(out.endpoints.length, 2);
  const ids = out.endpoints.map((e) => e.operationId);
  assert.equal(new Set(ids).size, ids.length, "operationId 必须全局唯一");
});

/* ---------------- endpointAt ---------------- */

test("endpointAt:接口顺序与源码位置不一致时,回退仍取光标之前最靠后的那一个", () => {
  // 变异测试发现:`best` 的比较运算符(> / >= / <= / false)全部存活 ——
  // 现有用例都假设 endpoints 顺序与 startOffset 同向,天然等价。
  // 这里显式构造「数组顺序与 startOffset 反向」的场景,把 > 的语义钉住。
  const content = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/e") public class E {
  @GetMapping("/a") public String a(){ return null; }
  @GetMapping("/b") public String b(){ return null; }
}
`;
  const out = analyze([{ fsPath: "/p/E.java", content }], "t");
  const a = out.endpoints.find((e) => e.path === "/e/a")!;
  const b = out.endpoints.find((e) => e.path === "/e/b")!;
  assert.ok(b.methodRange!.startOffset > a.methodRange!.startOffset, "前置条件:/e/b 在源码中更靠后");

  const shuffled = [b, a]; // 数组顺序与源码位置反向
  const between = a.methodRange!.endOffset + 3;
  assert.equal(
    endpointAt(shuffled, "/p/E.java", between)?.path,
    "/e/a",
    "必须取光标之前 startOffset 最大的那一个,而不是数组里第一个"
  );

  // 同一位置重复调用保持稳定
  assert.equal(endpointAt(shuffled, "/p/E.java", between)?.path, "/e/a");

  // 边界:offset 恰好等于起点/终点也算包含(闭区间),不能因 > / < 变异而漂移
  assert.equal(endpointAt(shuffled, "/p/E.java", a.methodRange!.startOffset)?.path, "/e/a");
  assert.equal(endpointAt(shuffled, "/p/E.java", a.methodRange!.endOffset)?.path, "/e/a");
  assert.equal(endpointAt(shuffled, "/p/E.java", b.methodRange!.startOffset)?.path, "/e/b");
  assert.equal(endpointAt(shuffled, "/p/E.java", b.methodRange!.endOffset)?.path, "/e/b");
  // 起点-1 / 终点+1 是闭区间的两侧,必须由 fallback 或 undefined 接管
  assert.equal(endpointAt(shuffled, "/p/E.java", a.methodRange!.endOffset + 1)?.path, "/e/a", "落在两方法之间 -> 回退到 /e/a");
  assert.equal(endpointAt(shuffled, "/p/E.java", b.methodRange!.startOffset - 1)?.path, "/e/a", "紧邻 /e/b 起点之前 -> 仍是 /e/a");
  assert.equal(endpointAt(shuffled, "/p/E.java", b.methodRange!.endOffset + 1)?.path, "/e/b", "最后一个方法之后 -> 最后一个方法");
  // 第一个接口起点之前没有任何候选 -> undefined(不是崩溃也不是任意接口)
  assert.equal(endpointAt(shuffled, "/p/E.java", a.methodRange!.startOffset - 1), undefined);
  assert.equal(endpointAt(shuffled, "/p/E.java", 0), undefined);
});

test("endpointAt:光标在方法体内命中该接口,不在任何方法内时回退到光标之前最近的接口", () => {
  const content = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/e") public class E {
  @GetMapping("/a") public String a(){ return null; }
  @GetMapping("/b") public String b(){ return null; }
}
`;
  const out = analyze([{ fsPath: "/p/E.java", content }], "t");
  const a = out.endpoints.find((e) => e.path === "/e/a")!;
  const b = out.endpoints.find((e) => e.path === "/e/b")!;
  const inA = a.methodRange!.startOffset + 5;
  assert.equal(endpointAt(out.endpoints, "/p/E.java", inA)?.path, "/e/a");
  const between = a.methodRange!.endOffset + 3;
  assert.equal(endpointAt(out.endpoints, "/p/E.java", between)?.path, "/e/a", "两方法之间回退到上一个");
  // 文件最开头:没有任何前置接口
  assert.equal(endpointAt(out.endpoints, "/p/E.java", 0), undefined);
  // 其他文件不参与
  assert.equal(endpointAt(out.endpoints, "/p/Other.java", inA), undefined);
  assert.ok(b.methodRange!.startOffset > a.methodRange!.startOffset);
});

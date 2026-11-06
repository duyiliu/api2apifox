/**
 * pipeline 缓存/重载口径补杀用例（回应 Stryker 存活清单）。
 *
 * 目的是把「只影响缓存键」和「真的会返回错结果」这两类存活变异区分开：
 *  - analyze/analyzeSubset/AnalyzeCache 的字符串重载（title）此前无断言，
 *    变异后 spec.title 变空/变成对象，用户可见；
 *  - pageStyle / enumFieldDoc 进入 optionsCacheKey：若键被变异抹平，
 *    同一缓存里不同配置会互相复用结果（返回错误的 spec），必须有区分用例；
 *  - filterIds 身份表：若所有谓词共用一个 id，不同 filter 的结果会串；
 *  - endpointsOfFile 的缓存命中分支（NoCoverage 变异集中区）：命中必须返回
 *    与内容一致的结果，内容变化必须重新解析。
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze, AnalyzeCache } from "../pipeline";
import { SourceFile } from "../java/model";

const TRICKY = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/t")
public class TrickyController {
  @GetMapping("/a") public String a(){ return null; }
  @GetMapping("/b") public String b(){ return null; }
}
`;

function file(name = "TrickyController.java", content = TRICKY): SourceFile {
  return { fsPath: `/proj/src/main/java/demo/${name}`, content };
}

/* ---------------- 字符串重载：title 必须进入 spec ---------------- */

test("analyze(files, \"标题\") 字符串重载:spec.info.title 取该字符串", () => {
  const out = analyze([file()], "我的接口文档");
  assert.equal(out.spec.info.title, "我的接口文档");
});

test("AnalyzeCache.analyze 字符串重载:title 生效且与对象重载等价", () => {
  const cache = new AnalyzeCache();
  const byString = cache.analyze([file()], "缓存标题");
  assert.equal(byString.spec.info.title, "缓存标题");
  const byObject = analyze([file()], { title: "缓存标题" });
  assert.deepEqual(byString.spec, byObject.spec);
});

test("AnalyzeCache.analyzeSubset 字符串重载:title 生效且接口子集正确", () => {
  const cache = new AnalyzeCache();
  const out = cache.analyzeSubset([file()], "子集标题", (e) => e.path === "/t/a");
  assert.equal(out.spec.info.title, "子集标题");
  assert.deepEqual(out.endpoints.map((e) => e.path), ["/t/a"]);
});

/* ---------------- optionsCacheKey:不同配置不能复用同一结果 ---------------- */

test("cache:pageStyle 不同的两次分析不能命中同一缓存(分页形态不同)", () => {
  const pageSource = `import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
@RestController @RequestMapping("/p")
public class PageController {
  @GetMapping("/x") public Page<String> x(){ return null; }
}`;
  const files: SourceFile[] = [{ fsPath: "/proj/src/main/java/demo/PageController.java", content: pageSource }];
  const cache = new AnalyzeCache();
  const spring = cache.analyze(files, { title: "t", pageStyle: "spring-data" });
  const mybatis = cache.analyze(files, { title: "t", pageStyle: "mybatis-plus" });
  // 两种分页形态展开的字段名不同：若缓存键被抹平，第二次会拿到第一次的结果
  assert.notDeepEqual(spring.spec, mybatis.spec, "pageStyle 变化必须重新计算 spec");
});

test("cache:enumFieldDoc 不同的两次分析不能命中同一缓存", () => {
  // enumFieldDoc 只影响「枚举类型字段」的描述（schemaResolver: 枚举类:xxx），
  // 所以夹具必须是「DTO 字段引用枚举」，方法参数/返回值上的枚举不触发。
  const enumSource = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/e")
public class EnumController {
  @PostMapping("/x") public String x(@RequestBody Body body){ return null; }
  static class Body { private Color color; }
  enum Color { RED, BLUE }
}`;
  const files: SourceFile[] = [{ fsPath: "/proj/src/main/java/demo/EnumController.java", content: enumSource }];
  const cache = new AnalyzeCache();
  const plain = cache.analyze(files, { title: "t", enumFieldDoc: false });
  const withEnum = cache.analyze(files, { title: "t", enumFieldDoc: true });
  assert.ok(!JSON.stringify(plain.spec).includes("枚举类"), "关闭开关时不应有枚举描述");
  assert.ok(JSON.stringify(withEnum.spec).includes("枚举类"), "打开开关时应追加枚举描述");
  assert.notDeepEqual(plain.spec, withEnum.spec, "enumFieldDoc 变化必须重新计算 spec");
});

/* ---------------- filterIds 身份表:不同谓词不能共用缓存键 ---------------- */

test("cache:两个不同的闭包谓词不能共用 filterId(否则返回对方的子集)", () => {
  const cache = new AnalyzeCache();
  const files = [file()];
  // 每次调用都新建闭包(真实调用方:勾选/单接口同步),不给 filterKey
  const onlyA = cache.analyzeSubset(files, { title: "t" }, (e) => e.path === "/t/a");
  const onlyB = cache.analyzeSubset(files, { title: "t" }, (e) => e.path === "/t/b");
  assert.deepEqual(onlyA.endpoints.map((e) => e.path), ["/t/a"]);
  assert.deepEqual(onlyB.endpoints.map((e) => e.path), ["/t/b"], "第二个谓词不能拿到第一个谓词缓存的结果");
});

test("cache:同一闭包重复调用仍复用结果(身份键不被破坏)", () => {
  const cache = new AnalyzeCache();
  const files = [file()];
  const filter = (e: { path: string }) => e.path === "/t/a";
  const first = cache.analyzeSubset(files, { title: "t" }, filter);
  const second = cache.analyzeSubset(files, { title: "t" }, filter);
  assert.deepEqual(first.endpoints.map((e) => e.path),["/t/a"]);
  assert.deepEqual(second.spec, first.spec);
});

/* ---------------- endpointsOfFile:缓存命中/失效 ---------------- */

test("cache:endpointsOfFile 命中缓存返回同一接口,内容变化后重新解析", () => {
  const cache = new AnalyzeCache();
  const path = "/proj/src/main/java/demo/HotController.java";
  const before = `import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/hot")
public class HotController {
  @GetMapping("/a") public String a(){ return null; }
}`;
  const after = before.replace('@GetMapping("/a")', '@GetMapping("/b")');
  assert.deepEqual(cache.endpointsOfFile(path, before).map((e) => e.path), ["/hot/a"]);
  // 命中分支:同一内容再取一次
  assert.deepEqual(cache.endpointsOfFile(path, before).map((e) => e.path), ["/hot/a"]);
  // 内容变化必须重新解析,而不是返回旧缓存
  assert.deepEqual(cache.endpointsOfFile(path, after).map((e) => e.path), ["/hot/b"]);
});

test("cache:endpointsOfFile 首次访问(未缓存路径)不抛错", () => {
  const cache = new AnalyzeCache();
  const out = cache.endpointsOfFile("/proj/src/main/java/demo/Fresh.java", TRICKY);
  assert.equal(out.length, 2);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { resolveConfig } from "../core/config";
import { analyzeProject } from "../core/projectAnalyzer";
import { discoverSpringPathPrefixes, parseSpringPathPrefixes } from "../core/springPathPrefix";
import { analyze, withPathPrefix } from "../pipeline";
import { SourceFile } from "../java/model";

/*
 * Issue #44:读取 server.servlet.context-path / spring.mvc.servlet.path / spring.webflux.base-path,
 * 把真实前缀拼到每个 endpoint path 前。
 *
 * 断言覆盖:
 *  - 三个配置键的取值与拼接顺序(WebFlux 与 Servlet 二选一)
 *  - profile 合并次序(后激活覆盖先激活)
 *  - 无配置文件 / 开关关闭时产物零差异
 *  - 解析失败(锚点、块标量、占位符、坏行)只出告警、不中断
 *  - 多模块各取各的前缀
 */

const SPRING_FIXTURE = path.join(__dirname, "..", "..", "sample", "src", "test", "spring-prefix", "app");

interface Fixture {
  root: string;
  write(relative: string, content: string): void;
  cleanup(): void;
}

function fixture(files: Record<string, string>): Fixture {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-spring-"));
  const write = (relative: string, content: string) => {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };
  for (const [relative, content] of Object.entries(files)) {
    write(relative, content);
  }
  return { root, write, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

const CONTROLLER = (name: string, base: string) => `package demo;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("${base}")
public class ${name} { @GetMapping("/list") public String list(){ return null; } }
`;

/** 单模块项目:Controller + 给定 resources 文件 */
function project(resources: Record<string, string>, extra: Record<string, string> = {}): Record<string, string> {
  const files: Record<string, string> = {
    "src/main/java/demo/UserController.java": CONTROLLER("UserController", "/user"),
  };
  for (const [name, content] of Object.entries(resources)) {
    files[`src/main/resources/${name}`] = content;
  }
  return { ...files, ...extra };
}

async function pathsOf(root: string, overrides: { applySpringPathPrefix?: boolean } = {}): Promise<string[]> {
  const config = resolveConfig(root, { include: ["**/*.java"], exclude: [], ...overrides }).config;
  const result = await analyzeProject({ config });
  return result.endpoints.map((endpoint) => endpoint.path).sort();
}

function parse(files: { name: string; content: string }[], root = "/proj"): ReturnType<typeof parseSpringPathPrefixes> {
  return parseSpringPathPrefixes(
    files.map((file) => ({ path: `${root}/src/main/resources/${file.name}`, content: file.content })),
    [root]
  );
}

/* ---------------- 三个配置键与拼接顺序 ---------------- */

test("spring 前缀:context-path 补到接口路径前(yml 嵌套写法)", async () => {
  const fx = fixture(project({ "application.yml": "server:\n  servlet:\n    context-path: /api-xxx\n" }));
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/api-xxx/user/list"]);
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:context-path 与 spring.mvc.servlet.path 同时存在时按 context-path + servlet.path 拼接", async () => {
  const fx = fixture(
    project({
      "application.properties": "server.servlet.context-path=/api-xxx\nspring.mvc.servlet.path=/dispatch\n",
    })
  );
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/api-xxx/dispatch/user/list"]);
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:只有 spring.mvc.servlet.path 时用 DispatcherServlet 前缀", async () => {
  const fx = fixture(project({ "application.yaml": "spring:\n  mvc:\n    servlet:\n      path: /dispatch\n" }));
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/dispatch/user/list"]);
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:WebFlux 栈取 spring.webflux.base-path,并忽略 servlet 的 context-path(明确告警)", () => {
  const parsed = parse([
    {
      name: "application.properties",
      content: "spring.webflux.base-path=/reactive\nserver.servlet.context-path=/ignored\n",
    },
  ]);
  assert.equal(parsed.modules.length, 1);
  assert.equal(parsed.modules[0].prefix, "/reactive");
  assert.deepEqual(
    parsed.modules[0].parts.map((part) => part.key),
    ["spring.webflux.base-path"]
  );
  assert.ok(
    parsed.warnings.some((warning) => warning.includes("spring.webflux.base-path") && warning.includes("已忽略")),
    parsed.warnings.join("|")
  );
});

test("spring 前缀:前缀值自动补前导斜杠、去尾随斜杠,`/` 视为无前缀", async () => {
  const fx = fixture(project({ "application.yml": "server:\n  servlet:\n    context-path: api-xxx/\n" }));
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/api-xxx/user/list"]);
    fx.write("src/main/resources/application.yml", 'server:\n  servlet:\n    context-path: "/"\n');
    assert.deepEqual(await pathsOf(fx.root), ["/user/list"]);
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:带引号的值与行内注释不影响取值", () => {
  const parsed = parse([
    { name: "application.yml", content: 'server:\n  servlet:\n    context-path: "/api-xxx" # 环境前缀\n' },
  ]);
  assert.equal(parsed.modules[0].prefix, "/api-xxx");
});

/* ---------------- profile 合并次序 ---------------- */

test("spring 前缀:spring.profiles.active 的 profile 变体覆盖基础层(后激活覆盖先激活)", async () => {
  const fx = fixture(
    project({
      "application.yml": "spring:\n  profiles:\n    active: prod,dev\nserver:\n  servlet:\n    context-path: /base\n",
      "application-dev.yml": "server:\n  servlet:\n    context-path: /dev\n",
      "application-prod.yml": "server:\n  servlet:\n    context-path: /prod\n",
    })
  );
  try {
    // active=prod,dev:dev 后激活 -> /dev
    assert.deepEqual(await pathsOf(fx.root), ["/dev/user/list"]);
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:未激活的 profile 文件不参与合并", async () => {
  const fx = fixture(
    project({
      "application.yml": "spring:\n  profiles:\n    active: dev\nserver:\n  servlet:\n    context-path: /base\n",
      "application-dev.yml": "server:\n  servlet:\n    context-path: /dev\n",
      "application-prod.yml": "server:\n  servlet:\n    context-path: /prod\n",
    })
  );
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/dev/user/list"]);
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:profile 只覆盖自己声明的键,其余键沿用基础层", () => {
  const parsed = parse([
    {
      name: "application.yml",
      content:
        "spring:\n  profiles:\n    active: dev\n  mvc:\n    servlet:\n      path: /dispatch\nserver:\n  servlet:\n    context-path: /base\n",
    },
    { name: "application-dev.yml", content: "server:\n  servlet:\n    context-path: /dev\n" },
  ]);
  assert.equal(parsed.modules[0].prefix, "/dev/dispatch");
});

test("spring 前缀:sample 夹具的 application.yml 导出带前缀,叠加 profile 变体后按覆盖次序生效", async () => {
  const parsed = await discoverSpringPathPrefixes([SPRING_FIXTURE]);
  // 夹具基础层:context-path=/api-xxx + servlet.path=/dispatch(spring.profiles.active=dev)
  assert.equal(parsed.modules[0].prefix, "/api-xxx/dispatch");
  assert.deepEqual(parsed.messages, [
    "已应用 context-path=/api-xxx（application.yml）",
    "已应用 servlet.path=/dispatch（application.yml）",
  ]);
  // 用夹具里的真实 resources 文件跑完整导出(夹具只放配置,Controller 由用例提供,避免影响 sample 的既有断言)
  const resources = path.join(SPRING_FIXTURE, "src", "main", "resources");
  const configFiles: (readonly [string, string])[] = fs
    .readdirSync(resources)
    .filter((name) => name.startsWith("application"))
    .map((name) => [name, fs.readFileSync(path.join(resources, name), "utf8")] as const);
  // 补上 profile 变体,锁定「后激活覆盖先激活」
  configFiles.push(["application-dev.yml", "server:\n  servlet:\n    context-path: /api-dev\n"]);
  const fx = fixture(project(Object.fromEntries(configFiles)));
  try {
    assert.deepEqual(fs.readdirSync(resources).filter((name) => name.includes("dev")), [], "夹具只保留基础层文件");
    const config = resolveConfig(fx.root, { include: ["**/*.java"], exclude: [] }).config;
    const result = await analyzeProject({ config });
    assert.deepEqual(
      Object.keys(result.spec.paths),
      ["/api-dev/dispatch/user/list"],
      "导出路径必须是真实前缀 + Controller 路径"
    );
    assert.ok(
      result.warnings.includes("已应用 context-path=/api-dev（application-dev.yml）"),
      result.warnings.join("|")
    );
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 零差异 / 开关 ---------------- */

test("spring 前缀:无 application 配置时产物与不读配置完全一致,且不产生前缀告警", async () => {
  const fx = fixture(project({}, { "src/main/resources/other.yml": "x: 1\n" }));
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/user/list"]);
    const config = resolveConfig(fx.root, { include: ["**/*.java"], exclude: [] }).config;
    const result = await analyzeProject({ config });
    assert.ok(!result.warnings.some((warning) => warning.includes("已应用")), result.warnings.join("|"));
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:applySpringPathPrefix=false 回到现状(路径无前缀、零差异)", async () => {
  const fx = fixture(project({ "application.yml": "server:\n  servlet:\n    context-path: /api-xxx\n" }));
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/api-xxx/user/list"]);
    assert.deepEqual(await pathsOf(fx.root, { applySpringPathPrefix: false }), ["/user/list"]);
    const disabled = resolveConfig(fx.root, { include: ["**/*.java"], exclude: [], applySpringPathPrefix: false });
    assert.equal(disabled.config.applySpringPathPrefix, false);
    assert.equal(disabled.sources.applySpringPathPrefix, "cli");
    const result = await analyzeProject({ config: disabled.config });
    assert.ok(!result.warnings.some((warning) => warning.includes("已应用")), result.warnings.join("|"));
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:配置键缺省时默认开启(true)", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-spring-cfg-"));
  try {
    const resolved = resolveConfig(root, {}, {});
    assert.equal(resolved.config.applySpringPathPrefix, true);
    assert.equal(resolved.sources.applySpringPathPrefix, "default");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("spring 前缀:配置文件里把开关设为 false 可关闭;非布尔值报配置错误", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-spring-cfg-"));
  try {
    fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ applySpringPathPrefix: false }));
    const resolved = resolveConfig(root, {}, {});
    assert.equal(resolved.config.applySpringPathPrefix, false);
    assert.equal(resolved.sources.applySpringPathPrefix, "file:.api2apifox.json");

    fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ applySpringPathPrefix: "no" }));
    assert.throws(() => resolveConfig(root, {}, {}), /applySpringPathPrefix 必须是布尔值/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("spring 前缀:环境变量 API2APIFOX_APPLY_SPRING_PATH_PREFIX 覆盖默认值", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-spring-cfg-"));
  try {
    const resolved = resolveConfig(root, {}, { API2APIFOX_APPLY_SPRING_PATH_PREFIX: "false" });
    assert.equal(resolved.config.applySpringPathPrefix, false);
    assert.equal(resolved.sources.applySpringPathPrefix, "env:API2APIFOX_APPLY_SPRING_PATH_PREFIX");
    assert.throws(
      () => resolveConfig(root, {}, { API2APIFOX_APPLY_SPRING_PATH_PREFIX: "maybe" }),
      /API2APIFOX_APPLY_SPRING_PATH_PREFIX 的值无效/
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

/* ---------------- 解析失败只告警 ---------------- */

test("spring 前缀:锚点/块标量只告警,坏键不影响同模块其它有效键", () => {
  const parsed = parse([
    {
      name: "application.yml",
      content: [
        "server:",
        "  servlet:",
        "    context-path: &ctx /api-xxx",
        "spring:",
        "  mvc:",
        "    servlet:",
        "      path: /dispatch",
        "logging:",
        "  pattern: |",
        "    %d %msg",
      ].join("\n"),
    },
  ]);
  assert.equal(parsed.modules[0].prefix, "/dispatch", "被跳过的键不应污染其它有效键");
  assert.ok(parsed.warnings.some((warning) => warning.includes("锚点")));
  assert.ok(parsed.warnings.some((warning) => warning.includes("块标量")));
});

test("spring 前缀:无法解析的 YAML 行与多文档只告警、不中断,同步照常产出", async () => {
  const fx = fixture(
    project({
      "application.yml": "not-a-mapping\nserver:\n  servlet:\n    context-path: /ok\n---\nsecond: doc\n",
    })
  );
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/ok/user/list"]);
    const config = resolveConfig(fx.root, { include: ["**/*.java"], exclude: [] }).config;
    const result = await analyzeProject({ config });
    assert.ok(result.warnings.some((warning) => warning.includes("多文档")), result.warnings.join("|"));
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:含占位符的值无法静态求值,告警后忽略(不拼接半成品前缀)", () => {
  const parsed = parse([{ name: "application.yml", content: "server:\n  servlet:\n    context-path: ${API_PREFIX}\n" }]);
  assert.deepEqual(parsed.modules, []);
  assert.ok(parsed.warnings.some((warning) => warning.includes("占位符")), parsed.warnings.join("|"));
});

test("spring 前缀:解析告警并入 analyzeProject.warnings(用户可见,不静默)", async () => {
  const fx = fixture(project({ "application.yml": "server:\n  servlet:\n    context-path: ${API_PREFIX}\n" }));
  try {
    const config = resolveConfig(fx.root, { include: ["**/*.java"], exclude: [] }).config;
    const result = await analyzeProject({ config });
    assert.deepEqual(result.endpoints.map((endpoint) => endpoint.path), ["/user/list"]);
    assert.ok(result.warnings.some((warning) => warning.includes("占位符")), result.warnings.join("|"));
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:前缀来源出现在诊断里(已应用 context-path=/api-xxx（application.yml）)", () => {
  const parsed = parse([{ name: "application.yml", content: "server:\n  servlet:\n    context-path: /api-xxx\n" }]);
  assert.deepEqual(parsed.messages, ["已应用 context-path=/api-xxx（application.yml）"]);
});

/* ---------------- 多模块 ---------------- */

test("spring 前缀:各模块取各自的 application 配置,互不影响", async () => {
  const fx = fixture({
    "mod-a/src/main/java/demo/AController.java": CONTROLLER("AController", "/a"),
    "mod-a/src/main/resources/application.yml": "server:\n  servlet:\n    context-path: /api-a\n",
    "mod-b/src/main/java/demo/BController.java": CONTROLLER("BController", "/b"),
    "mod-b/src/main/resources/application.yml": "server:\n  servlet:\n    context-path: /api-b\n",
    "mod-c/src/main/java/demo/CController.java": CONTROLLER("CController", "/c"),
  });
  try {
    assert.deepEqual(await pathsOf(fx.root), ["/api-a/a/list", "/api-b/b/list", "/c/list"]);
  } finally {
    fx.cleanup();
  }
});

test("spring 前缀:嵌套模块前缀按最长模块根匹配(父模块配置不串到子模块)", () => {
  const parsed = parseSpringPathPrefixes(
    [
      { path: "/p/src/main/resources/application.yml", content: "server:\n  servlet:\n    context-path: /parent\n" },
      {
        path: "/p/child/src/main/resources/application.yml",
        content: "server:\n  servlet:\n    context-path: /child\n",
      },
    ],
    ["/p"]
  );
  assert.equal(parsed.prefixFor("/p/src/main/java/A.java"), "/parent");
  assert.equal(parsed.prefixFor("/p/child/src/main/java/B.java"), "/child");
});

/* ---------------- 前缀拼接的纯函数边界 ---------------- */

test("withPathPrefix:空前缀/根前缀不改变路径(零差异),重复斜杠折叠", () => {
  assert.equal(withPathPrefix("/user/list", ""), "/user/list");
  assert.equal(withPathPrefix("/user/list", undefined), "/user/list");
  assert.equal(withPathPrefix("/user/list", "/"), "/user/list");
  assert.equal(withPathPrefix("/user/list", "  "), "/user/list");
  assert.equal(withPathPrefix("/user/list", "/api-xxx/"), "/api-xxx/user/list");
  assert.equal(withPathPrefix("/user/list", "api-xxx"), "/api-xxx/user/list");
  assert.equal(withPathPrefix("user/list", "/api"), "/api/user/list");
  assert.equal(withPathPrefix("/", "/api"), "/api/");
});

test("spring 前缀:analyze() 以内联前缀提供者也可拼接,且不改动原 endpoint 对象", () => {
  const files: SourceFile[] = [
    { fsPath: "/proj/src/main/java/demo/UserController.java", content: CONTROLLER("UserController", "/user") },
  ];
  const plain = analyze(files, { title: "t" });
  const prefixed = analyze(files, { title: "t", pathPrefixOf: () => "/api-xxx" });
  assert.deepEqual(plain.endpoints.map((endpoint) => endpoint.path), ["/user/list"]);
  assert.deepEqual(prefixed.endpoints.map((endpoint) => endpoint.path), ["/api-xxx/user/list"]);
  assert.deepEqual(Object.keys(prefixed.spec.paths), ["/api-xxx/user/list"]);
  assert.deepEqual(plain.endpoints.map((endpoint) => endpoint.path), ["/user/list"], "原结果不被就地修改");
});

test("spring 前缀:大小写不敏感扩展名与 application-{profile}.properties 变体", () => {
  const parsed = parse([
    {
      name: "application.YML",
      content: "spring:\n  profiles:\n    active: prod\nserver:\n  servlet:\n    context-path: /base\n",
    },
    { name: "application-prod.properties", content: "server.servlet.context-path=/prod\n" },
  ]);
  assert.equal(parsed.modules[0].prefix, "/prod");
});

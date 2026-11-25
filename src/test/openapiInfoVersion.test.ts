import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { parsePomProjectVersion } from "../config/projectVersion";
import { resolveConfig } from "../core/config";
import { analyzeProject } from "../core/projectAnalyzer";
import { buildOpenApi } from "../openapi/builder";
import { buildIndex, parseJava } from "../java/typeIndex";

/* ------------------------------------------------------------------ *
 * Issue #53:OpenAPI info.version 可配置化。
 * 读取顺序:显式配置 > 项目根 pom.xml <version>(剔除 -SNAPSHOT) > 兜底 1.0.0;
 * pom 缺失/畸形静默回退,不产生新的 warning。
 * ------------------------------------------------------------------ */

function temporaryProject(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-version-"));
}

const CONTROLLER = `package demo;
import org.springframework.web.bind.annotation.*;
@RestController
public class AController {
  @GetMapping("/x") public String x(){ return null; }
}
`;

function writeController(root: string): void {
  const file = path.join(root, "src/main/java/demo/AController.java");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, CONTROLLER);
}

/* ---------------- parsePomProjectVersion 纯函数 ---------------- */

test("pom 解析:顶层 <version> 原样返回", () => {
  assert.equal(parsePomProjectVersion("<project><groupId>g</groupId><artifactId>a</artifactId><version>2.1.0</version></project>"), "2.1.0");
});

test("pom 解析:-SNAPSHOT 后缀被剔除", () => {
  assert.equal(parsePomProjectVersion("<project><version>2.1.0-SNAPSHOT</version></project>"), "2.1.0");
});

test("pom 解析:剔除后为空(纯 -SNAPSHOT)按未取到处理", () => {
  assert.equal(parsePomProjectVersion("<project><version>-SNAPSHOT</version></project>"), undefined);
});

test("pom 解析:<parent> 里的版本不算项目自身版本", () => {
  const pom = "<project><parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.2.0</version></parent><artifactId>a</artifactId></project>";
  assert.equal(parsePomProjectVersion(pom), undefined);
});

test("pom 解析:parent 与自身版本并存时取自身版本", () => {
  const pom = "<project><parent><version>3.2.0</version></parent><artifactId>a</artifactId><version>1.5.0</version></project>";
  assert.equal(parsePomProjectVersion(pom), "1.5.0");
});

test("pom 解析:含 ${} 占位符的版本不采用", () => {
  assert.equal(parsePomProjectVersion("<project><version>${revision}</version></project>"), undefined);
});

test("pom 解析:注释里的 <version> 不干扰", () => {
  const pom = "<project><!-- <version>9.9.9</version> --><artifactId>a</artifactId></project>";
  assert.equal(parsePomProjectVersion(pom), undefined);
});

test("pom 解析:畸形文本(无 project 闭合/无 version)返回 undefined", () => {
  assert.equal(parsePomProjectVersion("not xml at all"), undefined);
  assert.equal(parsePomProjectVersion("<project><artifactId>a</artifactId>"), undefined);
  assert.equal(parsePomProjectVersion(""), undefined);
});

test("pom 解析:带命名空间属性的 project 元素可识别", () => {
  const pom = '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><version>1.2.3</version></project>';
  assert.equal(parsePomProjectVersion(pom), "1.2.3");
});

/* ---------------- buildOpenApi 直测 ---------------- */

test("builder:未传 openapiInfoVersion 时仍为 1.0.0(行为不变)", () => {
  const index = buildIndex([parseJava("/p/Empty.java", "class Empty {}")]);
  const { spec } = buildOpenApi({ endpoints: [], warnings: [] }, index, { title: "t" });
  assert.equal(spec.info.version, "1.0.0");
});

test("builder:传入 openapiInfoVersion 时输出指定值", () => {
  const index = buildIndex([parseJava("/p/Empty.java", "class Empty {}")]);
  const { spec } = buildOpenApi({ endpoints: [], warnings: [] }, index, { title: "t", openapiInfoVersion: "2.1.0" });
  assert.equal(spec.info.version, "2.1.0");
});

/* ---------------- resolveConfig 配置层 ---------------- */

test("config:默认 openapiInfoVersion 未显式配置(undefined),来源 default", () => {
  const resolved = resolveConfig(temporaryProject());
  assert.equal(resolved.config.openapiInfoVersion, undefined);
  assert.equal(resolved.sources.openapiInfoVersion, "default");
});

test("config:文件配置 openapiInfoVersion 生效并标注来源", () => {
  const root = temporaryProject();
  fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ openapiInfoVersion: "3.0.1" }));
  const resolved = resolveConfig(root);
  assert.equal(resolved.config.openapiInfoVersion, "3.0.1");
  assert.match(resolved.sources.openapiInfoVersion, /^file:/);
});

test("config:CLI 覆盖优先于文件配置", () => {
  const root = temporaryProject();
  fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ openapiInfoVersion: "3.0.1" }));
  const resolved = resolveConfig(root, { openapiInfoVersion: "4.0.0" });
  assert.equal(resolved.config.openapiInfoVersion, "4.0.0");
  assert.equal(resolved.sources.openapiInfoVersion, "cli");
});

test("config:文件里空串视为未配置(回退 pom/默认)", () => {
  const root = temporaryProject();
  fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ openapiInfoVersion: "  " }));
  assert.equal(resolveConfig(root).config.openapiInfoVersion, undefined);
});

test("config:非字符串值被拒绝", () => {
  const root = temporaryProject();
  fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ openapiInfoVersion: 123 }));
  assert.throws(() => resolveConfig(root), /openapiInfoVersion 必须是字符串/);
});

/* ---------------- analyzeProject 端到端回退链 ---------------- */

async function analyzeVersion(root: string, overrides: Record<string, unknown> = {}): Promise<{ version: string; warnings: string[] }> {
  const config = resolveConfig(root, { include: ["**/*.java"], exclude: [], ...overrides }).config;
  const result = await analyzeProject({ config });
  return { version: result.spec.info.version, warnings: result.warnings };
}

test("analyze:无任何配置且无 pom 时 version 为 1.0.0", async () => {
  const root = temporaryProject();
  try {
    writeController(root);
    const { version } = await analyzeVersion(root);
    assert.equal(version, "1.0.0");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("analyze:项目根 pom.xml 提供版本,-SNAPSHOT 被剔除", async () => {
  const root = temporaryProject();
  try {
    writeController(root);
    fs.writeFileSync(path.join(root, "pom.xml"), "<project><artifactId>a</artifactId><version>2.3.0-SNAPSHOT</version></project>");
    const { version } = await analyzeVersion(root);
    assert.equal(version, "2.3.0");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("analyze:显式配置优先于 pom.xml", async () => {
  const root = temporaryProject();
  try {
    writeController(root);
    fs.writeFileSync(path.join(root, "pom.xml"), "<project><version>2.3.0</version></project>");
    const { version } = await analyzeVersion(root, { openapiInfoVersion: "9.9.9" });
    assert.equal(version, "9.9.9");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("analyze:pom.xml 畸形时静默回退 1.0.0,不产生新 warning", async () => {
  const root = temporaryProject();
  try {
    writeController(root);
    fs.writeFileSync(path.join(root, "pom.xml"), "<project><version>${revision}</version></project>");
    const { version, warnings } = await analyzeVersion(root);
    assert.equal(version, "1.0.0");
    assert.ok(!warnings.some((w) => /pom\.xml/i.test(w) && /version/i.test(w)), `不应出现版本相关告警:${warnings.join(";")}`);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("analyze:空项目(无 Java 文件)也遵循同样的版本解析", async () => {
  const root = temporaryProject();
  try {
    fs.writeFileSync(path.join(root, "pom.xml"), "<project><version>5.5.5</version></project>");
    const { version } = await analyzeVersion(root);
    assert.equal(version, "5.5.5");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

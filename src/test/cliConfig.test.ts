import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { resolveConfig } from "../core/config";
import {
  buildCliConfig,
  cliEquivalentCommand,
  compareCliConfig,
  formatCliConfigDrift,
  mergeCliConfig,
  parseCliConfig,
  CliConfigSource,
} from "../config/cliConfig";
import { CLI_CONFIG_DEFAULTS } from "../config/defaults";

function settings(overrides: Partial<CliConfigSource> = {}): CliConfigSource {
  return {
    projectId: 123456,
    apiBaseUrl: "https://api.apifox.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: ["**/src/main/java/**/*.java"],
    exclude: ["**/target/**", "**/build/**", "**/src/test/**", "**/sample/**", "**/.*/**"],
    exportPath: "openapi.gen.json",
    pageTypeStyle: "mybatis-plus",
    folderNameSource: "tag",
    rootFolderName: "",
    schemaFolderId: 0,
    helperProperties: true,
    enumFieldDoc: false,
    dependencyRepos: [],
    dependencyJars: [],
    maxDependencyJars: 120,
    ...overrides,
  };
}

test("扩展设置映射为 CLI 配置：helperProperties 嵌套、数组复制、不包含 token", () => {
  const include = ["**/src/main/java/**/*.java", "**/api/**/*.java"];
  const dependencyJars = ["D:/repo/demo.jar"];
  const desired = buildCliConfig(
    settings({
      include,
      dependencyJars,
      folderNameSource: "controller",
      rootFolderName: "平台",
      schemaFolderId: 42,
      helperProperties: false,
      enumFieldDoc: true,
      maxDependencyJars: 0,
    })
  );

  assert.deepEqual(desired.include, include);
  assert.equal(desired.projectId, 123456);
  assert.equal(desired.folderNameSource, "controller");
  assert.equal(desired.rootFolderName, "平台");
  assert.equal(desired.schemaFolderId, 42);
  assert.deepEqual(desired.helperProperties, { enabled: false, enumFieldDoc: true });
  assert.deepEqual(desired.dependencyJars, dependencyJars);
  assert.equal(desired.maxDependencyJars, 0);
  assert.ok(!("token" in desired));
  assert.ok(!JSON.stringify(desired).includes("token"));

  // 生成结果与扩展设置解耦：后续修改设置不应反向污染配置内容
  include.push("**/later/**/*.java");
  dependencyJars.pop();
  assert.equal(desired.include.length, 2);
  assert.equal(desired.dependencyJars.length, 1);
});

test("漂移比较：缺省字段按 CLI 默认值处理，默认范围一致时不算漂移", () => {
  const desired = buildCliConfig(settings({ projectId: 0 }));
  assert.deepEqual(compareCliConfig(desired, {}), []);

  // 显式写出与默认值相同的字段也不算漂移
  assert.deepEqual(
    compareCliConfig(desired, {
      include: [...CLI_CONFIG_DEFAULTS.include],
      exclude: [...CLI_CONFIG_DEFAULTS.exclude],
      helperProperties: { enabled: true, enumFieldDoc: false },
    }),
    []
  );
});

test("漂移比较：include/exclude、helperProperties 与 projectId 变化均可定位", () => {
  const desired = buildCliConfig(settings({ include: ["**/src/main/java/**/*.java"], projectId: 7 }));
  const drifts = compareCliConfig(desired, {
    projectId: 8,
    include: ["**/only-this/**/*.java"],
    exclude: ["**/target/**"],
    helperProperties: { enabled: false, enumFieldDoc: true },
  });
  const fields = drifts.map((drift) => drift.field);
  assert.ok(fields.includes("projectId"));
  assert.ok(fields.includes("include"));
  assert.ok(fields.includes("exclude"));
  assert.ok(fields.includes("helperPropertiesEnabled"));
  assert.ok(fields.includes("enumFieldDoc"));
  assert.equal(fields.includes("token"), false);
});

test("漂移比较：helperProperties 非对象时明确报告字段，不误判为默认值", () => {
  const drifts = compareCliConfig(buildCliConfig(settings()), { helperProperties: [] });
  const fields = drifts.map((drift) => drift.field);
  assert.ok(fields.includes("helperProperties"));
  assert.equal(fields.includes("helperPropertiesEnabled"), false);
  assert.equal(fields.includes("enumFieldDoc"), false);
});

test("漂移比较：目标文件含 token 时只报告存在状态，不泄露明文", () => {
  const desired = buildCliConfig(settings());
  const secret = "APS_super_secret_token";
  const drifts = compareCliConfig(desired, { token: secret });
  const tokenDrift = drifts.find((drift) => drift.field === "token");
  assert.ok(tokenDrift);
  assert.equal(tokenDrift?.current, "已存在（CLI 禁止写入）");
  assert.equal(tokenDrift?.expected, "移除");
  assert.ok(!formatCliConfigDrift(drifts).includes(secret));
});

test("一键更新保留 CLI 自有字段与 $schema，移除 token 并覆盖映射字段", () => {
  const desired = buildCliConfig(settings({ include: ["**/new/**/*.java"], projectId: 42 }));
  const merged = mergeCliConfig(
    {
      $schema: "./node_modules/@duyiliu/api2apifox/schema/config.schema.json",
      title: "团队接口",
      timeoutMs: 600000,
      token: "APS_should_be_removed",
      projectId: 1,
      include: ["**/old/**/*.java"],
    },
    desired
  );

  assert.equal(merged.$schema, "./node_modules/@duyiliu/api2apifox/schema/config.schema.json");
  assert.equal(merged.title, "团队接口");
  assert.equal(merged.timeoutMs, 600000);
  assert.ok(!("token" in merged));
  assert.equal(merged.projectId, 42);
  assert.deepEqual(merged.include, ["**/new/**/*.java"]);
  assert.deepEqual(merged.helperProperties, { enabled: true, enumFieldDoc: false });
});

test("解析现有配置：非对象根节点/非法 JSON 返回可展示原因", () => {
  assert.deepEqual(parseCliConfig('{"projectId":1}'), { data: { projectId: 1 } });
  assert.equal(parseCliConfig("[]").error, "配置文件根节点必须是对象");
  assert.match(parseCliConfig("{oops").error ?? "", /.+/);
  assert.equal(parseCliConfig('"text"').error, "配置文件根节点必须是对象");
});

test("等效命令引用同一工作区路径并只执行扫描", () => {
  assert.equal(
    cliEquivalentCommand("D:/work/demo project"),
    'api2apifox scan --project "D:/work/demo project" --format json'
  );
  assert.equal(cliEquivalentCommand('D:/work/a"b'), 'api2apifox scan --project "D:/work/a\\"b" --format json');
});

test("生成的配置文件可被 CLI 直接解析，且不包含 token/未知字段", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-exported-config-"));
  try {
    const desired = buildCliConfig(
      settings({
        projectId: 99,
        include: ["**/src/main/java/**/*.java", "**/api/**/*.java"],
        exclude: ["**/target/**", "**/generated/**"],
        helperProperties: false,
        enumFieldDoc: true,
        maxDependencyJars: 64,
      })
    );
    fs.writeFileSync(path.join(root, ".api2apifox.json"), `${JSON.stringify(desired, null, 2)}\n`);
    const resolved = resolveConfig(root, {}, {});
    assert.equal(resolved.config.projectId, 99);
    assert.deepEqual(resolved.config.include, ["**/src/main/java/**/*.java", "**/api/**/*.java"]);
    assert.deepEqual(resolved.config.exclude, ["**/target/**", "**/generated/**"]);
    assert.equal(resolved.config.helperPropertiesEnabled, false);
    assert.equal(resolved.config.enumFieldDoc, true);
    assert.equal(resolved.config.maxDependencyJars, 64);
    assert.equal(resolved.token, undefined);
    assert.deepEqual(resolved.diagnostics, []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("扩展命令贡献点包含导出 CLI 配置入口", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8")
  ) as { contributes?: { commands?: { command?: string; title?: string }[] } };
  const command = manifest.contributes?.commands?.find((item) => item.command === "apifoxHelper.exportCliConfig");
  assert.ok(command);
  assert.match(command.title ?? "", /导出 CLI 配置/);
});

test("共享默认值：CLI resolveConfig 与导出漂移基准使用同一份 include/exclude", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-cli-config-"));
  const resolved = resolveConfig(root, {}, {});
  assert.deepEqual(resolved.config.include, CLI_CONFIG_DEFAULTS.include);
  assert.deepEqual(resolved.config.exclude, CLI_CONFIG_DEFAULTS.exclude);
  assert.equal(resolved.config.maxDependencyJars, CLI_CONFIG_DEFAULTS.maxDependencyJars);
  assert.equal(resolved.config.helperPropertiesEnabled, CLI_CONFIG_DEFAULTS.helperPropertiesEnabled);
});

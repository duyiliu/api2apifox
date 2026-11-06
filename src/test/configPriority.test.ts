import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { ConfigError, resolveConfig } from "../core/config";

/* ------------------------------------------------------------------ *
 * G4 的配置侧:冲突策略 4 合法值 + 非法值、数值边界、优先级链、
 * token 禁入配置文件。
 *
 * 现有 coreConfig.test.ts 覆盖了基本优先级与校验;这里补边界与"透传可达性"。
 * ------------------------------------------------------------------ */

interface Fx {
  root: string;
  write(rel: string, content: string): void;
  cleanup(): void;
}

function fixture(files: Record<string, string> = {}): Fx {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-config-"));
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

/* ---------------- 冲突策略 ---------------- */

test("config:4 个合法冲突策略值都能从文件读入并标注来源", () => {
  const behaviors = ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"] as const;
  for (const behavior of behaviors) {
    const fx = fixture({
      ".api2apifox.json": JSON.stringify({
        endpointConflictBehavior: behavior,
        schemaConflictBehavior: behavior,
      }),
    });
    try {
      const { config, sources } = resolveConfig(fx.root, {}, {});
      assert.equal(config.endpointConflictBehavior, behavior);
      assert.equal(config.schemaConflictBehavior, behavior);
      assert.equal(sources.endpointConflictBehavior, "file:.api2apifox.json");
    } finally {
      fx.cleanup();
    }
  }
});

test("config:非法冲突策略被拒绝(CONFIG_INVALID),不是静默取默认值", () => {
  for (const bad of ["overwrite_existing", "AUTO_MERGE ", "NEW", "", 1, null, true]) {
    const fx = fixture({ ".api2apifox.json": JSON.stringify({ endpointConflictBehavior: bad }) });
    try {
      assert.throws(
        () => resolveConfig(fx.root, {}, {}),
        (err: unknown) => {
          assert.ok(err instanceof ConfigError, `值 ${JSON.stringify(bad)} 应抛 ConfigError`);
          assert.equal(err.diagnostics[0].code, "CONFIG_INVALID");
          assert.match(err.diagnostics[0].message, /endpointConflictBehavior/);
          return true;
        },
        `值 ${JSON.stringify(bad)}`
      );
    } finally {
      fx.cleanup();
    }
  }
});

test("config:CLI 覆盖 > 环境变量 > 文件 > 默认值(逐层可观测)", () => {
  const fx = fixture({
    ".api2apifox.json": JSON.stringify({
      endpointConflictBehavior: "KEEP_EXISTING",
      projectId: 11,
      timeoutMs: 1000,
    }),
  });
  try {
    const fileOnly = resolveConfig(fx.root, {}, {});
    assert.equal(fileOnly.config.endpointConflictBehavior, "KEEP_EXISTING");
    assert.equal(fileOnly.sources.endpointConflictBehavior, "file:.api2apifox.json");

    const envWins = resolveConfig(fx.root, {}, { API2APIFOX_ENDPOINT_CONFLICT: "AUTO_MERGE" });
    assert.equal(envWins.config.endpointConflictBehavior, "AUTO_MERGE");
    assert.equal(envWins.sources.endpointConflictBehavior, "env:API2APIFOX_ENDPOINT_CONFLICT");

    const cliWins = resolveConfig(fx.root, { endpointConflictBehavior: "CREATE_NEW" }, {
      API2APIFOX_ENDPOINT_CONFLICT: "AUTO_MERGE",
    });
    assert.equal(cliWins.config.endpointConflictBehavior, "CREATE_NEW");
    assert.equal(cliWins.sources.endpointConflictBehavior, "cli");

    const defaults = resolveConfig(fx.root, {}, {});
    assert.equal(defaults.config.schemaConflictBehavior, "OVERWRITE_EXISTING");
    assert.equal(defaults.sources.schemaConflictBehavior, "default");
  } finally {
    fx.cleanup();
  }
});

test("config:非法环境变量值被拒绝,不静默回退到文件值", () => {
  const fx = fixture({ ".api2apifox.json": JSON.stringify({ endpointConflictBehavior: "KEEP_EXISTING" }) });
  try {
    assert.throws(
      () => resolveConfig(fx.root, {}, { API2APIFOX_ENDPOINT_CONFLICT: "BOGUS" }),
      (err: unknown) => {
        assert.ok(err instanceof ConfigError);
        assert.match(err.diagnostics.map((d) => d.message).join("\n"), /API2APIFOX_ENDPOINT_CONFLICT/);
        return true;
      }
    );
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 数值边界 ---------------- */

test("config:maxDependencyJars 边界 0 合法(表示不做依赖解析),负数与小数为非法", () => {
  const ok = fixture({ ".api2apifox.json": JSON.stringify({ maxDependencyJars: 0 }) });
  try {
    assert.equal(resolveConfig(ok.root, {}, {}).config.maxDependencyJars, 0);
  } finally {
    ok.cleanup();
  }
  for (const bad of [-1, 1.5, "120", null]) {
    const fx = fixture({ ".api2apifox.json": JSON.stringify({ maxDependencyJars: bad }) });
    try {
      assert.throws(() => resolveConfig(fx.root, {}, {}), ConfigError, `maxDependencyJars=${JSON.stringify(bad)}`);
    } finally {
      fx.cleanup();
    }
  }
});

test("config:timeoutMs 必须为正数;0 / 负数 / Infinity / 字符串都被拒绝", () => {
  for (const bad of [0, -1, "300000", null]) {
    const fx = fixture({ ".api2apifox.json": JSON.stringify({ timeoutMs: bad }) });
    try {
      assert.throws(
        () => resolveConfig(fx.root, {}, {}),
        (err: unknown) => err instanceof ConfigError && /timeoutMs/.test(err.diagnostics[0].message),
        `timeoutMs=${JSON.stringify(bad)}`
      );
    } finally {
      fx.cleanup();
    }
  }
  const ok = fixture({ ".api2apifox.json": JSON.stringify({ timeoutMs: 1 }) });
  try {
    assert.equal(resolveConfig(ok.root, {}, {}).config.timeoutMs, 1);
  } finally {
    ok.cleanup();
  }
});

test("config:超大 maxDependencyJars 被接受(由 jar 上限逻辑自行处理)", () => {
  const fx = fixture({ ".api2apifox.json": JSON.stringify({ maxDependencyJars: 100000 }) });
  try {
    assert.equal(resolveConfig(fx.root, {}, {}).config.maxDependencyJars, 100000);
  } finally {
    fx.cleanup();
  }
});

test("config:schemaFolderId 允许 0 与正整数,拒绝负数", () => {
  for (const good of [0, 1, 999999]) {
    const fx = fixture({ ".api2apifox.json": JSON.stringify({ schemaFolderId: good }) });
    try {
      assert.equal(resolveConfig(fx.root, {}, {}).config.schemaFolderId, good);
    } finally {
      fx.cleanup();
    }
  }
  const bad = fixture({ ".api2apifox.json": JSON.stringify({ schemaFolderId: -1 }) });
  try {
    assert.throws(() => resolveConfig(bad.root, {}, {}), ConfigError);
  } finally {
    bad.cleanup();
  }
});

/* ---------------- token 安全 ---------------- */

test("config:配置文件出现 token 字段时直接拒绝(即使值为空字符串或 null)", () => {
  for (const value of ["x", "", null]) {
    const fx = fixture({ ".api2apifox.json": JSON.stringify({ token: value }) });
    try {
      assert.throws(
        () => resolveConfig(fx.root, {}, {}),
        (err: unknown) => {
          assert.ok(err instanceof ConfigError);
          assert.equal(err.diagnostics[0].code, "CONFIG_TOKEN_FORBIDDEN");
          return true;
        },
        `token=${JSON.stringify(value)}`
      );
    } finally {
      fx.cleanup();
    }
  }
});

test("config:token 只能来自环境变量或 CLI,且来源标注正确", () => {
  const fx = fixture({});
  try {
    const fromEnv = resolveConfig(fx.root, {}, { API2APIFOX_TOKEN: "env-token" });
    assert.equal(fromEnv.token, "env-token");
    assert.equal(fromEnv.tokenSource, "env:API2APIFOX_TOKEN");

    const fromCli = resolveConfig(fx.root, { token: "cli-token" }, { API2APIFOX_TOKEN: "env-token" });
    assert.equal(fromCli.token, "cli-token");
    assert.equal(fromCli.tokenSource, "cli");

    const none = resolveConfig(fx.root, {}, {});
    assert.equal(none.token, undefined);
    assert.equal(none.tokenSource, undefined);
  } finally {
    fx.cleanup();
  }
});

/* ---------------- 其他校验 ---------------- */

test("config:apiBaseUrl 只接受 http/https,其他协议与非法 URL 被拒绝", () => {
  for (const bad of ["ftp://x", "file:///tmp", "not-a-url", "//x", "javascript:alert(1)"]) {
    const fx = fixture({ ".api2apifox.json": JSON.stringify({ apiBaseUrl: bad }) });
    try {
      assert.throws(
        () => resolveConfig(fx.root, {}, {}),
        (err: unknown) => err instanceof ConfigError && /apiBaseUrl/.test(err.diagnostics[0].message),
        `apiBaseUrl=${bad}`
      );
    } finally {
      fx.cleanup();
    }
  }
  const ok = fixture({ ".api2apifox.json": JSON.stringify({ apiBaseUrl: "http://internal:8080/apifox" }) });
  try {
    assert.equal(resolveConfig(ok.root, {}, {}).config.apiBaseUrl, "http://internal:8080/apifox");
  } finally {
    ok.cleanup();
  }
});

test("config:include 为空数组被拒绝(不能扫全仓)", () => {
  const fx = fixture({ ".api2apifox.json": JSON.stringify({ include: [] }) });
  try {
    assert.throws(
      () => resolveConfig(fx.root, {}, {}),
      (err: unknown) => err instanceof ConfigError && /include/.test(err.diagnostics[0].message)
    );
  } finally {
    fx.cleanup();
  }
});

test("config:非法 JSON 与缺失的显式配置文件都报 CONFIG_* 错误", () => {
  const badJson = fixture({ ".api2apifox.json": "{ not json" });
  try {
    assert.throws(
      () => resolveConfig(badJson.root, {}, {}),
      (err: unknown) => err instanceof ConfigError && err.diagnostics[0].code === "CONFIG_INVALID_JSON"
    );
  } finally {
    badJson.cleanup();
  }

  const missing = fixture({});
  try {
    assert.throws(
      () => resolveConfig(missing.root, { configFile: "nope.json" }, {}),
      (err: unknown) => err instanceof ConfigError && err.diagnostics[0].code === "CONFIG_NOT_FOUND"
    );
    // 未显式指定时,缺省 .api2apifox.json 缺失是合法的
    assert.equal(resolveConfig(missing.root, {}, {}).configFile, undefined);
  } finally {
    missing.cleanup();
  }
});

test("config:未知字段(含嵌套)被拒绝,错别字不会静默失效", () => {
  for (const payload of [
    { unknownKey: 1 },
    { helperProperties: { unknownNested: true } },
    { helperProperties: [] },
  ]) {
    const fx = fixture({ ".api2apifox.json": JSON.stringify(payload) });
    try {
      assert.throws(
        () => resolveConfig(fx.root, {}, {}),
        (err: unknown) =>
          err instanceof ConfigError && /未知配置字段|必须是对象/.test(err.diagnostics[0].message),
        JSON.stringify(payload)
      );
    } finally {
      fx.cleanup();
    }
  }
});

test("config:title 缺省取项目目录名;空白 title 被拒绝", () => {
  const fx = fixture({});
  try {
    const { config } = resolveConfig(fx.root, {}, {});
    assert.equal(config.title, path.basename(fx.root));
  } finally {
    fx.cleanup();
  }
  const blank = fixture({ ".api2apifox.json": JSON.stringify({ title: "   " }) });
  try {
    assert.throws(() => resolveConfig(blank.root, {}, {}), ConfigError);
  } finally {
    blank.cleanup();
  }
});

test("config:API2APIFOX_PROJECT_ID 解析为数字;非数字被拒绝", () => {
  const fx = fixture({});
  try {
    assert.equal(resolveConfig(fx.root, {}, { API2APIFOX_PROJECT_ID: "4242" }).config.projectId, 4242);
    assert.throws(() => resolveConfig(fx.root, {}, { API2APIFOX_PROJECT_ID: "abc" }), ConfigError);
  } finally {
    fx.cleanup();
  }
});

test("config:默认值集合与 README 承诺一致(防止默认值漂移)", () => {
  const fx = fixture({});
  try {
    const { config } = resolveConfig(fx.root, {}, {});
    assert.equal(config.apiBaseUrl, "https://api.apifox.com");
    assert.equal(config.exportPath, "openapi.gen.json");
    assert.equal(config.pageTypeStyle, "mybatis-plus");
    assert.equal(config.folderNameSource, "tag");
    assert.equal(config.rootFolderName, "");
    assert.equal(config.updateFolderOfChangedEndpoint, true);
    assert.equal(config.schemaFolderId, 0);
    assert.equal(config.helperPropertiesEnabled, true);
    assert.equal(config.enumFieldDoc, false);
    assert.equal(config.maxDependencyJars, 120);
    assert.equal(config.timeoutMs, 300_000);
    assert.deepEqual(config.include, ["**/src/main/java/**/*.java"]);
    assert.ok(config.exclude.includes("**/target/**"));
    assert.ok(config.exclude.includes("**/src/test/**"));
  } finally {
    fx.cleanup();
  }
});

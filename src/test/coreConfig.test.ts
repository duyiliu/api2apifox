import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { ConfigError, resolveConfig } from "../core/config";

function temporaryProject(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-config-"));
}

test("CLI > 环境变量 > 配置文件 > 默认值", () => {
  const root = temporaryProject();
  fs.writeFileSync(
    path.join(root, ".api2apifox.json"),
    JSON.stringify({ projectId: 1, apiBaseUrl: "https://file.example", folderNameSource: "controller" })
  );
  const resolved = resolveConfig(
    root,
    { projectId: 3 },
    { API2APIFOX_PROJECT_ID: "2", API2APIFOX_API_BASE_URL: "https://env.example", API2APIFOX_TOKEN: "secret" }
  );
  assert.equal(resolved.config.projectId, 3);
  assert.equal(resolved.sources.projectId, "cli");
  assert.equal(resolved.config.apiBaseUrl, "https://env.example");
  assert.equal(resolved.sources.apiBaseUrl, "env:API2APIFOX_API_BASE_URL");
  assert.equal(resolved.config.folderNameSource, "controller");
  assert.match(resolved.sources.folderNameSource, /^file:/);
  assert.equal(resolved.token, "secret");
  assert.equal(resolved.tokenSource, "env:API2APIFOX_TOKEN");
});

test("配置文件禁止保存 token", () => {
  const root = temporaryProject();
  fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ token: "should-not-be-here" }));
  assert.throws(() => resolveConfig(root), (error: unknown) => {
    assert.ok(error instanceof ConfigError);
    assert.match(error.message, /不允许包含 token/);
    return true;
  });
});

test("apiBaseUrl 只允许 http/https", () => {
  const root = temporaryProject();
  fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ apiBaseUrl: "file:///tmp/apifox" }));
  assert.throws(() => resolveConfig(root), /只允许 http 或 https/);
});

test("helperProperties 必须是对象,非对象值报 CONFIG_INVALID", () => {
  const root = temporaryProject();
  fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ helperProperties: true }));
  assert.throws(() => resolveConfig(root), /helperProperties 必须是对象/);
});

test("严格拒绝未知配置字段", () => {
  const root = temporaryProject();
  fs.writeFileSync(path.join(root, ".api2apifox.json"), JSON.stringify({ projectID: 42 }));
  assert.throws(() => resolveConfig(root), /未知配置字段:projectID/);
});

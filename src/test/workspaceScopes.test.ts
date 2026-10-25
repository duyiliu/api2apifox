import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  apiFolderKey,
  detectProjectFolders,
  endpointSelectionKey,
  planProjectBindingMigration,
  resolveExportPath,
  treeFolderKey,
  workspaceFolderForPath,
} from "../config/workspaceScopes";

const existsFrom = (files: string[]) => {
  const set = new Set(files.map((file) => file.replace(/\\/g, "/")));
  return (candidate: string) => set.has(candidate.replace(/\\/g, "/"));
};

test("项目文件夹识别:pom.xml / build.gradle(.kts) 才算项目根", () => {
  const folders = [
    { name: "service-a", fsPath: "/w/service-a" },
    { name: "service-b", fsPath: "/w/service-b" },
    { name: "docs", fsPath: "/w/docs" },
  ];
  const exists = existsFrom(["/w/service-a/pom.xml", "/w/service-b/build.gradle.kts", "/w/service-b/build.gradle"]);
  const detected = detectProjectFolders(folders, exists);
  assert.deepEqual(detected.map((folder) => folder.label), ["service-a", "service-b"]);
  assert.deepEqual(detected.map((folder) => folder.detected), [true, true]);
});

test("项目文件夹识别:一个构建文件都没有时退回全部文件夹(单根兼容)", () => {
  const folders = [
    { name: "single", fsPath: "/w/single" },
    { name: "shared", fsPath: "/w/shared" },
  ];
  const detected = detectProjectFolders(folders, existsFrom([]));
  assert.deepEqual(detected.map((folder) => folder.label), ["single", "shared"]);
  assert.deepEqual(detected.map((folder) => folder.detected), [false, false]);
});

test("workspaceFolderForPath:按最长前缀归属,不同文件夹同名接口不混淆", () => {
  const folders = detectProjectFolders(
    [
      { name: "outer", fsPath: "/w/outer" },
      { name: "inner", fsPath: "/w/outer/inner" },
    ],
    existsFrom(["/w/outer/pom.xml", "/w/outer/inner/pom.xml"])
  );
  assert.equal(workspaceFolderForPath("/w/outer/inner/src/A.java", folders)?.label, "inner");
  assert.equal(workspaceFolderForPath("/w/outer/src/A.java", folders)?.label, "outer");
  assert.equal(workspaceFolderForPath("/elsewhere/A.java", folders), undefined);
});

test("目录 key:rootFolderName 与 folderNameSource 与 x-apifox-folder 一致", () => {
  assert.equal(apiFolderKey({ folderNameSource: "tag", rootFolderName: "" }, { tag: "患者", controller: "PatientController" }), "患者");
  assert.equal(apiFolderKey({ folderNameSource: "controller", rootFolderName: "Svc" }, { tag: "患者", controller: "PatientController" }), "Svc/PatientController");
});

test("多根树目录带工作区前缀,单根保持原目录", () => {
  assert.equal(treeFolderKey("service-a", "患者", true), "service-a/患者");
  assert.equal(treeFolderKey("service-a", "患者", false), "患者");
});

test("勾选键加入工作区文件夹:同名接口在不同文件夹互不影响", () => {
  const a = endpointSelectionKey("/w/service-a", { method: "GET", path: "/users" });
  const b = endpointSelectionKey("/w/service-b", { method: "GET", path: "/users" });
  assert.notEqual(a, b);
  assert.ok(a.startsWith("/w/service-a\u0000"));
  assert.ok(b.includes("GET /users"));
});

test("导出路径按文件夹根目录解析,绝对路径保持原样", () => {
  assert.equal(resolveExportPath("/w/service-a", "openapi.gen.json"), join("/w/service-a", "openapi.gen.json"));
  assert.equal(resolveExportPath("/w/service-a", "/tmp/spec.json"), "/tmp/spec.json");
});

test("单根旧配置迁移:只复制到尚未设置文件夹级绑定的文件夹", () => {
  const folders = [
    { key: "/w/a", label: "a" },
    { key: "/w/b", label: "b" },
  ];
  const plan = planProjectBindingMigration(
    folders,
    {
      "/w/a": { projectId: 7, projectName: "A 项目", teamName: "团队", source: "folder" },
      "/w/b": { projectId: 0, projectName: "", teamName: "", source: "none" },
    },
    { projectId: 42, projectName: "旧项目", teamName: "旧团队" }
  );
  assert.deepEqual(plan, [
    { folderKey: "/w/b", label: "b", binding: { projectId: 42, projectName: "旧项目", teamName: "旧团队" } },
  ]);
});

test("单根旧配置迁移:旧绑定为空或文件夹已继承工作区级配置时保持原样", () => {
  const folders = [{ key: "/w/a", label: "a" }];
  assert.deepEqual(planProjectBindingMigration(folders, {}, { projectId: 0 }), []);
  const inherited = planProjectBindingMigration(
    folders,
    { "/w/a": { projectId: 42, projectName: "旧项目", teamName: "旧团队", source: "workspace" } },
    { projectId: 42, projectName: "旧项目", teamName: "旧团队" }
  );
  assert.equal(inherited.length, 1);
});

test("package.json:项目绑定/导出路径是 resource scope,并提供迁移命令", () => {
  const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));
  const props = pkg.contributes.configuration.properties;
  for (const key of ["projectId", "projectName", "teamName", "exportPath"]) {
    assert.equal(props[`apifoxHelper.${key}`].scope, "resource", key);
  }
  assert.ok(
    pkg.contributes.commands.some((command: { command: string }) => command.command === "apifoxHelper.migrateFolderProjectBindings")
  );
});

test("settings.ts 使用 URI 作用域读取并以 WorkspaceFolder 写入项目绑定", () => {
  const src = readFileSync(join(__dirname, "..", "config", "settings.js"), "utf8");
  assert.match(src, /getConfiguration\("apifoxHelper", uri\)/);
  assert.match(src, /vscode\.ConfigurationTarget\.WorkspaceFolder/);
  assert.match(src, /workspaceFolderValue/);
});

test("接口树勾选键包含文件夹作用域", () => {
  const src = readFileSync(join(__dirname, "..", "providers", "ApiTreeProvider.js"), "utf8");
  assert.match(src, /endpointSelectionKey\)\(this\.scopeKeyOf\(ep\), ep\)/);
  assert.match(src, /scopedCheckedStorageKey/);
});

test("扩展按文件夹扫描并分别导出/同步", () => {
  const src = readFileSync(join(__dirname, "..", "extension.js"), "utf8");
  assert.match(src, /new vscode\.RelativePattern\(scope\.folder/);
  assert.match(src, /for \(const scope of scopes\)/);
  assert.match(src, /analyzeScope\(scope/);
  assert.match(src, /saveProjectId\)\(item\.binding\.projectId/);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildFolderTree,
  countFolderEndpoints,
  flattenFolderEndpoints,
  folderSelectionState,
  splitFolderKey,
  UNGROUPED_FOLDER,
} from "../providers/folderTree";
import { EndpointInfo } from "../java/model";

const ep = (method: string, path: string, folder: string): { endpoint: EndpointInfo; folder: string } => ({
  folder,
  endpoint: {
    method,
    path,
    tag: folder,
    controller: "C",
    operationId: method.toLowerCase() + path.replace(/\W/g, "_"),
    fsPath: "/w/A.java",
    summary: undefined,
    description: undefined,
    deprecated: false,
    flavor: "spring-mvc",
    parameters: [],
  } as unknown as EndpointInfo,
});

const items = [
  ep("GET", "/assessment/worklists", "测评工作站"),
  ep("GET", "/assessment/visits/{visitId}/scales", "测评工作站"),
  ep("GET", "/assessment/visits/{visitId}/scales/CARS", "测评工作站/测评量表-CARS"),
  ep("POST", "/assessment/visits/{visitId}/scales/CARS", "测评工作站/测评量表-CARS"),
  ep("GET", "/assessment/visits/{visitId}/scales/SDS", "测评工作站/测评量表-SDS"),
  ep("GET", "/enum/list", ""),
];
const endpoints = items.map((i) => i.endpoint);
const folderOf = (e: EndpointInfo): string => e.tag;
const tree = buildFolderTree(endpoints, folderOf);

test("splitFolderKey:按 / 拆段并容忍空段与缺失", () => {
  assert.deepEqual(splitFolderKey("测评工作站/测评量表-CARS"), ["测评工作站", "测评量表-CARS"]);
  assert.deepEqual(splitFolderKey("  a // b / "), ["a", "b"]);
  assert.deepEqual(splitFolderKey(""), [UNGROUPED_FOLDER]);
  assert.deepEqual(splitFolderKey("///"), [UNGROUPED_FOLDER]);
});

test("目录路径逐级嵌套,不再整串平铺", () => {
  const top = tree.map((n) => n.label);
  assert.ok(top.includes("测评工作站"));
  assert.ok(!top.includes("测评工作站/测评量表-CARS"));
  const workstation = tree.find((n) => n.key === "测评工作站");
  assert.ok(workstation);
  assert.deepEqual(workstation!.children.map((c) => c.key), ["测评工作站/测评量表-CARS", "测评工作站/测评量表-SDS"]);
  assert.equal(workstation!.endpoints.length, 2);
  assert.equal(workstation!.children[0].endpoints.length, 2);
});

test("接口按路径+方法排序,目录按名称排序", () => {
  const workstation = tree.find((n) => n.key === "测评工作站")!;
  assert.deepEqual(
    workstation.endpoints.map((e) => `${e.method} ${e.path}`),
    ["GET /assessment/visits/{visitId}/scales", "GET /assessment/worklists"]
  );
  const labels = tree.map((n) => n.label);
  assert.deepEqual([...labels].sort(), ["测评工作站", "未分组"].sort());
  assert.deepEqual([...labels].sort((a, b) => a.localeCompare(b)), labels);
});

test("父目录统计与勾选联动整棵子树", () => {
  const workstation = tree.find((n) => n.key === "测评工作站")!;
  assert.equal(countFolderEndpoints(workstation), 5);
  assert.equal(flattenFolderEndpoints(workstation).length, 5);
  const none = folderSelectionState(workstation, () => false);
  assert.equal(none, "none");
  const some = folderSelectionState(workstation, (e) => e.path.includes("CARS"));
  assert.equal(some, "some");
  const all = folderSelectionState(workstation, () => true);
  assert.equal(all, "all");
});

test("空目录 key 归入未分组且不产生空目录节点", () => {
  const ungrouped = tree.find((n) => n.key === UNGROUPED_FOLDER);
  assert.ok(ungrouped);
  assert.equal(ungrouped!.endpoints.length, 1);
  assert.equal(ungrouped!.children.length, 0);
});

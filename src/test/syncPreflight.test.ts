import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSyncPreflightDetail, conflictBehaviorLabel } from "../ui/syncPreflight";

test("冲突策略转换为用户可理解的中文", () => {
  assert.equal(conflictBehaviorLabel("OVERWRITE_EXISTING"), "覆盖已有内容");
  assert.equal(conflictBehaviorLabel("KEEP_EXISTING"), "保留已有内容（跳过冲突）");
});

test("批量同步预检同时展示目标、范围、隐藏选择与策略", () => {
  const detail = buildSyncPreflightDetail({
    teamName: "研发团队",
    projectName: "用户中心",
    projectId: 42,
    scopeLabel: "全部已选接口",
    endpointCount: 8,
    visibleChecked: 3,
    hiddenChecked: 5,
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "AUTO_MERGE",
  });

  assert.match(detail, /研发团队 \/ 用户中心（ID: 42）/);
  assert.match(detail, /全部已选接口，共 8 个接口/);
  assert.match(detail, /当前可见 3 个，过滤隐藏 5 个/);
  assert.match(detail, /接口冲突：覆盖已有内容/);
  assert.match(detail, /模型冲突：自动合并/);
});

test("镜像同步预检必须展示删除清单与破坏性语义", () => {
  const detail = buildSyncPreflightDetail({
    teamName: "研发团队",
    projectName: "用户中心",
    projectId: 42,
    scopeLabel: "整个工作区",
    endpointCount: 8,
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    deleteUnmatchedResources: true,
    deletionPreview: {
      endpoints: [{ method: "GET", path: "/legacy/users" }],
      schemas: ["LegacyUser"],
    },
  });

  assert.match(detail, /删除传播：已开启/);
  assert.match(detail, /将删除：接口 1 个，数据模型 1 个/);
  assert.match(detail, /接口 GET \/legacy\/users/);
  assert.match(detail, /数据模型 LegacyUser/);
});

test("未开启删除传播时不出现删除提示", () => {
  const detail = buildSyncPreflightDetail({
    teamName: "",
    projectName: "",
    projectId: 42,
    scopeLabel: "当前文件 A.java",
    endpointCount: 1,
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
  });
  assert.doesNotMatch(detail, /删除传播|将删除/);
});

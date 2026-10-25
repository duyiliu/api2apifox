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
    changeSummary: "新增 2，变更 1，未变化 3，源码已删除 1",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "AUTO_MERGE",
  });

  assert.match(detail, /研发团队 \/ 用户中心（ID: 42）/);
  assert.match(detail, /全部已选接口，共 8 个接口/);
  assert.match(detail, /当前可见 3 个，过滤隐藏 5 个/);
  assert.match(detail, /差异：新增 2，变更 1，未变化 3，源码已删除 1/);
  assert.match(detail, /接口冲突：覆盖已有内容/);
  assert.match(detail, /模型冲突：自动合并/);
});

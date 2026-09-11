import assert from "node:assert/strict";
import { test } from "node:test";
import { EndpointInfo } from "../java/model";
import { buildSyncReport, formatSyncTime } from "../ui/syncResult";
import { syncTargetLabel } from "../ui/syncPreflight";

function endpoint(overrides: Partial<EndpointInfo> & { path: string; method: string; operationId: string }): EndpointInfo {
  return {
    tag: "患者档案",
    parameters: [],
    fsPath: "d:/ws/cah-childhealth/src/main/java/PatientController.java",
    controller: "PatientController",
    flavor: "spring-mvc",
    ...overrides,
  } as EndpointInfo;
}

const baseInput = {
  endpoints: [
    endpoint({
      path: "/api/patients",
      method: "GET",
      operationId: "pagePatients",
      summary: "分页查询患者",
      methodRange: { startOffset: 123, endOffset: 456, startLine: 8 },
    }),
    endpoint({ path: "/api/patients", method: "POST", operationId: "savePatient", summary: "" }),
  ],
  target: "研发团队 / 儿保（ID: 42）",
  projectId: 42,
  scope: "整个工作区",
  endpointConflictBehavior: "OVERWRITE_EXISTING",
  schemaConflictBehavior: "KEEP_EXISTING",
  folderOf: () => "儿保后端/患者档案",
  workspaceRoot: "d:\\ws\\cah-childhealth",
  finishedAt: new Date(2026, 8, 10, 10, 5, 6),
};

test("汇总计数成表：接口与数据模型始终保留，目录只在有变化时出现", () => {
  const report = buildSyncReport({
    ...baseInput,
    counters: {
      endpointCreated: 12,
      endpointUpdated: 3,
      endpointIgnored: 0,
      endpointFailed: 1,
      schemaIgnored: 8,
      endpointFolderCreated: 2,
    },
    errors: [{ message: "接口 /api/patients 导入失败" }],
    warnings: ["schemaFolderName 已不被支持"],
  });

  assert.deepEqual(
    report.summary.map((r) => r.category),
    ["接口", "数据模型", "接口目录"]
  );
  const endpointRow = report.summary[0];
  assert.deepEqual(
    [endpointRow.created, endpointRow.updated, endpointRow.ignored, endpointRow.failed, endpointRow.total],
    [12, 3, 0, 1, 16]
  );
  const schemaRow = report.summary[1];
  assert.deepEqual([schemaRow.created, schemaRow.ignored, schemaRow.total], [0, 8, 8]);
  assert.deepEqual(report.errors, ["接口 /api/patients 导入失败"]);
  assert.deepEqual(report.warnings, ["schemaFolderName 已不被支持"]);
});

test("接口清单：名称回退 operationId、目录按 folderOf、源文件转相对路径", () => {
  const report = buildSyncReport({ ...baseInput, counters: { endpointIgnored: 2 }, errors: [], warnings: [] });

  assert.equal(report.endpoints.length, 2);
  assert.deepEqual(report.endpoints[0], {
    name: "分页查询患者",
    method: "GET",
    path: "/api/patients",
    folder: "儿保后端/患者档案",
    controller: "PatientController",
    file: "src/main/java/PatientController.java",
    fsPath: "d:/ws/cah-childhealth/src/main/java/PatientController.java",
    startOffset: 123,
  });
  // summary 为空时用 operationId，避免清单出现空名称
  assert.equal(report.endpoints[1].name, "savePatient");
});

test("报告头部同时给出目标、范围、时间与冲突策略（解释忽略计数）", () => {
  const report = buildSyncReport({
    ...baseInput,
    counters: {},
    errors: [],
    warnings: [],
    workspaceRoot: undefined,
  });

  assert.equal(report.target, "研发团队 / 儿保（ID: 42）");
  assert.equal(report.projectId, 42);
  assert.equal(report.scope, "整个工作区");
  assert.equal(report.finishedAt, "2026-09-10 10:05:06");
  assert.equal(report.conflict, "接口=覆盖已有内容；数据模型=保留已有内容（跳过冲突）");
  // 没有根目录时保留原始路径，不做截断
  assert.equal(report.endpoints[0].file, "d:/ws/cah-childhealth/src/main/java/PatientController.java");
  // 计数缺失时接口/数据模型仍以 0 行呈现
  assert.deepEqual(
    report.summary.map((r) => r.total),
    [0, 0]
  );
});

test("时间文本与目标标签为固定格式", () => {
  assert.equal(formatSyncTime(new Date(2026, 0, 2, 3, 4, 5)), "2026-01-02 03:04:05");
  assert.equal(syncTargetLabel("", "", 7), "项目 7（ID: 7）");
  assert.equal(syncTargetLabel("团队", "项目", 7), "团队 / 项目（ID: 7）");
});

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { EndpointInfo } from "../java/model";
import { OpenApiSpec } from "../openapi/builder";
import {
  changedOperationKeys,
  diffSyncBaseline,
  emptySyncBaseline,
  operationDigest,
  parseSyncBaseline,
  readSyncBaselineFile,
  recordSyncBaseline,
  serializeSyncBaseline,
  subsetAnalysisForKeys,
  syncCandidates,
  syncStatusMap,
  writeSyncBaselineFile,
} from "../core/syncBaseline";

function spec(fooDescription = "foo", includePost = true): OpenApiSpec {
  const paths: OpenApiSpec["paths"] = {
    "/api/users": {
      get: {
        tags: ["用户"],
        summary: "查询用户",
        operationId: "getUser",
        "x-apifox-folder": "用户",
        responses: {
          "200": {
            description: "ok",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
        },
      },
    },
  };
  if (includePost) {
    paths["/api/orders"] = {
      post: {
        tags: ["订单"],
        summary: "创建订单",
        operationId: "createOrder",
        responses: { "200": { description: "ok" } },
      },
    };
  }
  return {
    openapi: "3.0.3",
    info: { title: "demo", version: "1.0.0" },
    paths,
    components: {
      schemas: {
        User: {
          type: "object",
          description: fooDescription,
          properties: { name: { type: "string" } },
        },
        Unused: { type: "object" },
      },
    },
  };
}

function endpoint(method: string, endpointPath: string, summary?: string): EndpointInfo {
  return {
    method,
    path: endpointPath,
    tag: method === "GET" ? "用户" : "订单",
    operationId: `${method.toLowerCase()}${endpointPath.replace(/\W/g, "")}`,
    summary,
    parameters: [],
    fsPath: "d:/ws/src/UserController.java",
    controller: "UserController",
    flavor: "spring-mvc",
  } as EndpointInfo;
}

function analysis(current = spec(), endpoints = [endpoint("GET", "/api/users", "查询用户"), endpoint("POST", "/api/orders", "创建订单")]) {
  return { spec: current, endpoints, warnings: [] };
}

test("无基线时所有当前接口为新增；记录后相同摘要为未变化", () => {
  const input = analysis();
  const candidates = syncCandidates(input);
  const first = diffSyncBaseline(emptySyncBaseline(), 42, "workspace", candidates);
  assert.equal(first.hasBaseline, false);
  assert.deepEqual(first.counts, { added: 2, changed: 0, unchanged: 0, deleted: 0 });
  assert.deepEqual(first.added.map((entry) => `${entry.method} ${entry.path}`), ["GET /api/users", "POST /api/orders"]);
  assert.equal(first.added[0].folder, "用户");
  assert.equal(first.added[0].sourceFile, "d:/ws/src/UserController.java");

  const baseline = recordSyncBaseline(emptySyncBaseline(), 42, "workspace", candidates, {
    at: new Date("2026-01-02T03:04:05Z"),
  });
  const second = diffSyncBaseline(baseline, 42, "workspace", syncCandidates(input));
  assert.equal(second.hasBaseline, true);
  assert.deepEqual(second.counts, { added: 0, changed: 0, unchanged: 2, deleted: 0 });
  assert.deepEqual(syncStatusMap(second).get("GET /api/users"), "unchanged");
});

test("operation 或引用模型变化都识别为已变更", () => {
  const baseline = recordSyncBaseline(emptySyncBaseline(), 42, "workspace", syncCandidates(analysis()));

  const operationChanged = analysis();
  (operationChanged.spec.paths["/api/orders"].post as Record<string, unknown>).summary = "创建订单 v2";
  const diff = diffSyncBaseline(baseline, 42, "workspace", syncCandidates(operationChanged));
  assert.deepEqual(diff.changed.map((entry) => `${entry.method} ${entry.path}`), ["POST /api/orders"]);
  assert.equal(diff.unchanged.length, 1);

  const schemaChanged = analysis(spec("用户模型 v2"));
  const schemaDiff = diffSyncBaseline(baseline, 42, "workspace", syncCandidates(schemaChanged));
  assert.deepEqual(schemaDiff.changed.map((entry) => `${entry.method} ${entry.path}`), ["GET /api/users"]);
  assert.equal(schemaDiff.changed[0].summary, "查询用户");
});

test("源码删除进入已删除清单；显式 prune 后才从基线移除", () => {
  const baseline = recordSyncBaseline(emptySyncBaseline(), 42, "workspace", syncCandidates(analysis()));
  const withoutPost = analysis(spec(), [endpoint("GET", "/api/users", "查询用户")]);

  const diff = diffSyncBaseline(baseline, 42, "workspace", syncCandidates(withoutPost));
  assert.deepEqual(diff.deleted.map((entry) => `${entry.method} ${entry.path}`), ["POST /api/orders"]);
  assert.equal(diff.counts.deleted, 1);

  const kept = recordSyncBaseline(baseline, 42, "workspace", syncCandidates(withoutPost));
  assert.equal(diffSyncBaseline(kept, 42, "workspace", syncCandidates(withoutPost)).deleted.length, 1);

  const pruned = recordSyncBaseline(baseline, 42, "workspace", syncCandidates(withoutPost), { prune: true });
  assert.equal(diffSyncBaseline(pruned, 42, "workspace", syncCandidates(withoutPost)).deleted.length, 0);
});

test("不同 project / scope 的基线互相隔离", () => {
  const baseline = recordSyncBaseline(emptySyncBaseline(), 42, "workspace", syncCandidates(analysis()));
  const otherScope = diffSyncBaseline(baseline, 42, "file:d:/ws/src/UserController.java", syncCandidates(analysis()));
  assert.equal(otherScope.added.length, 2);
  assert.equal(otherScope.deleted.length, 0);

  const otherProject = diffSyncBaseline(baseline, 43, "workspace", syncCandidates(analysis()));
  assert.equal(otherProject.added.length, 2);
  assert.equal(otherProject.deleted.length, 0);

  // 同一项目、同一 scope 仍然命中基线
  assert.equal(diffSyncBaseline(baseline, 42, "workspace", syncCandidates(analysis())).unchanged.length, 2);
});

test("基线 JSON 可往返；损坏/旧版本按无基线处理", () => {
  const baseline = recordSyncBaseline(emptySyncBaseline(), 42, "workspace", syncCandidates(analysis()));
  const parsed = parseSyncBaseline(serializeSyncBaseline(baseline));
  assert.deepEqual(
    diffSyncBaseline(parsed, 42, "workspace", syncCandidates(analysis())).counts,
    { added: 0, changed: 0, unchanged: 2, deleted: 0 }
  );
  assert.deepEqual(parseSyncBaseline("{broken").projects, {});
  assert.deepEqual(parseSyncBaseline(JSON.stringify({ schemaVersion: 0, projects: {} })).projects, {});
});

test("只上传新增/变更：子集 spec 仅保留选中 operation 及其引用模型", () => {
  const input = analysis();
  const baseline = recordSyncBaseline(emptySyncBaseline(), 42, "workspace", syncCandidates(input));
  const changedSpec = spec("用户模型 v2");
  const current = analysis(changedSpec);
  const diff = diffSyncBaseline(baseline, 42, "workspace", syncCandidates(current));
  const keys = changedOperationKeys(diff);
  assert.deepEqual([...keys], ["GET /api/users"]);

  const subset = subsetAnalysisForKeys(current, keys);
  assert.deepEqual(subset.endpoints.map((entry) => entry.method), ["GET"]);
  assert.deepEqual(Object.keys(subset.spec.paths), ["/api/users"]);
  assert.ok(subset.spec.paths["/api/users"].get);
  assert.equal(subset.spec.paths["/api/users"].post, undefined);
  assert.deepEqual(Object.keys(subset.spec.components?.schemas ?? {}), ["User"]);
  assert.ok(subset.spec.components?.schemas.User);
});

test("operationDigest 对对象键顺序不敏感，内容变化才改变摘要", () => {
  const s = spec();
  const operation = s.paths["/api/users"].get as Record<string, unknown>;
  const reordered = Object.fromEntries(Object.entries(operation).reverse());
  assert.equal(operationDigest(s, operation), operationDigest(s, reordered));

  const changed = { ...operation, summary: "新摘要" };
  assert.notEqual(operationDigest(s, operation), operationDigest(s, changed));
});

test("基线文件读写：不存在视为空基线，写入后可读回", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-baseline-"));
  const file = path.join(dir, "nested", "baseline.json");
  try {
    assert.deepEqual(await readSyncBaselineFile(file), emptySyncBaseline());
    const baseline = recordSyncBaseline(emptySyncBaseline(), 42, "workspace", syncCandidates(analysis()));
    await writeSyncBaselineFile(file, baseline);
    const loaded = await readSyncBaselineFile(file);
    assert.equal(diffSyncBaseline(loaded, 42, "workspace", syncCandidates(analysis())).unchanged.length, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

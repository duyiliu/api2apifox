import assert from "node:assert/strict";
import { test } from "node:test";
import { syncProject } from "../core/syncService";
import { ProjectAnalysisResult, ResolvedConfig } from "../core/types";

const ORIGINAL_FETCH = globalThis.fetch;

function makeConfig(overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return {
    projectRoot: "/tmp/project",
    title: "demo",
    projectId: 42,
    apiBaseUrl: "https://api.example.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: ["**/*.java"],
    exclude: [],
    exportPath: "openapi.gen.json",
    pageTypeStyle: "mybatis-plus",
    folderNameSource: "tag",
    rootFolderName: "",
    schemaFolderId: 0,
    helperPropertiesEnabled: true,
    enumFieldDoc: false,
    dependencyRepos: [],
    dependencyJars: [],
    maxDependencyJars: 120,
    deleteUnmatchedResources: false,
    timeoutMs: 5_000,
    ...overrides,
  };
}

function makeAnalyzed(): ProjectAnalysisResult {
  return {
    spec: {
      openapi: "3.0.3",
      info: { title: "demo", version: "1.0.0" },
      paths: { "/users": { get: { summary: "list" } } },
      components: { schemas: { User: { type: "object" } } },
    },
    endpoints: [{ method: "GET", path: "/users" }],
    warnings: [],
    projectRoot: "/tmp/project",
    scannedFiles: 1,
    skippedFiles: 0,
    diagnostics: [],
  } as unknown as ProjectAnalysisResult;
}

test("syncProject:未开启删除时保持原有导入语义,不访问导出接口", async () => {
  const calls: { url: string; body: any }[] = [];
  globalThis.fetch = ((url: string, init?: { body?: string }) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : undefined });
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: { counters: { endpointCreated: 2 }, errors: [] } }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    const result = await syncProject({
      config: makeConfig(),
      token: "token",
      analyzed: makeAnalyzed(),
      scopeType: "workspace",
    });
    assert.equal(result.deleteUnmatchedResources, false);
    assert.equal(result.deletionPreview, undefined);
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/import-openapi$/);
    assert.equal(calls[0].body.options.deleteUnmatchedResources, false);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("syncProject:dry-run 开启删除时导出远端清单并返回预览,不调用导入", async () => {
  const calls: string[] = [];
  globalThis.fetch = ((url: string) => {
    calls.push(String(url));
    return Promise.resolve(
      new Response(
        JSON.stringify({
          code: 0,
          data: {
            openapi: "3.0.3",
            paths: { "/users": { get: {} }, "/legacy": { delete: {} } },
            components: { schemas: { User: {}, Legacy: {} } },
          },
        }),
        { status: 200 }
      )
    );
  }) as unknown as typeof fetch;
  try {
    const result = await syncProject({
      config: makeConfig(),
      token: "token",
      analyzed: makeAnalyzed(),
      dryRun: true,
      deleteUnmatchedResources: true,
      scopeType: "workspace",
    });
    assert.equal(result.dryRun, true);
    assert.equal(result.deleteUnmatchedResources, true);
    assert.deepEqual(result.deletionPreview, {
      endpoints: [{ method: "DELETE", path: "/legacy" }],
      schemas: ["Legacy"],
    });
    assert.deepEqual(calls, ["https://api.example.com/v1/projects/42/export-openapi"]);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("syncProject:dry-run 未开启删除时完全离线", async () => {
  globalThis.fetch = (() => {
    throw new Error("dry-run 不应发起请求");
  }) as unknown as typeof fetch;
  try {
    const result = await syncProject({
      config: makeConfig(),
      token: "",
      analyzed: makeAnalyzed(),
      dryRun: true,
      scopeType: "workspace",
    });
    assert.equal(result.deletionPreview, undefined);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("syncProject:真实同步透传 deleteUnmatchedResources", async () => {
  let body: any;
  globalThis.fetch = ((_url: string, init?: { body?: string }) => {
    body = init?.body ? JSON.parse(init.body) : undefined;
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: { counters: { endpointDeleted: 1 }, errors: [] } }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    const result = await syncProject({
      config: makeConfig(),
      token: "token",
      analyzed: makeAnalyzed(),
      deleteUnmatchedResources: true,
      scopeType: "workspace",
    });
    assert.equal(body.options.deleteUnmatchedResources, true);
    assert.equal(result.counters.endpointDeleted, 1);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("syncProject:拒绝在局部同步中删除,避免误删其他来源接口", async () => {
  await assert.rejects(
    syncProject({
      config: makeConfig(),
      token: "token",
      analyzed: makeAnalyzed(),
      deleteUnmatchedResources: true,
      scopeType: "file",
    }),
    /仅支持整个工作区/
  );
});

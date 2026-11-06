/**
 * G3：扩展（uploader.syncToApifox）与 CLI（core/syncService.syncProject）同步参数一致性。
 *
 * 两条同步路径由两段独立代码维护，没有共享断言就必然漂移。这里用同一份
 * AnalyzeOutput + 等价配置分别驱动两条路径，直接 diff 它们发给 Apifox 的 options 对象。
 *
 * 已知差异（本次测试锁定的基线，见报告"已知限制"）：
 *  - CLI 显式传 deleteUnmatchedResources:false；扩展侧不传该键，依赖 Apifox 服务端默认值。
 *    若服务端默认值变化，扩展会开始删除未匹配资源 —— 这是真实的数据风险，
 *    因此本用例把这个差异显式断言出来，而不是假装一致。
 */

import assert from "node:assert/strict";
import Module from "node:module";
import { test } from "node:test";
import { syncProject } from "../core/syncService";
import { ResolvedConfig } from "../core/types";
import { ProjectAnalysisResult } from "../core/types";

/* ---------------- 最小 vscode 桩：uploader 只用到 window.withProgress ---------------- */

const MODULE_LOAD = (Module as unknown as { _load: (...args: unknown[]) => unknown })._load;

function installVscodeStub(): void {
  (Module as unknown as { _load: unknown })._load = function (request: string, ...rest: unknown[]) {
    if (request === "vscode") {
      return {
        ProgressLocation: { Notification: 15 },
        window: {
          withProgress: async (_opts: unknown, task: (progress: { report: () => void }) => unknown) =>
            task({ report: () => undefined }),
        },
      };
    }
    return (MODULE_LOAD as (...args: unknown[]) => unknown).call(this, request, ...rest);
  };
}

function restoreModuleLoad(): void {
  (Module as unknown as { _load: unknown })._load = MODULE_LOAD;
}

/** 清掉 uploader 的模块缓存，让每次 require 都拿到本次安装的桩 */
function freshUploader(): typeof import("../apifox/uploader") {
  const resolved = require.resolve("../apifox/uploader");
  delete require.cache[resolved];
  return require("../apifox/uploader") as typeof import("../apifox/uploader");
}

/* ---------------- 共享夹具 ---------------- */

const SPEC = {
  openapi: "3.0.3",
  info: { title: "p", version: "1.0.0" },
  paths: { "/a": { get: { responses: {} } } },
} as never;

function analyzed(): ProjectAnalysisResult {
  return {
    spec: SPEC,
    endpoints: [{ method: "GET", path: "/a", controller: "A", tag: "A", flavor: "spring-mvc", parameters: [] } as never],
    warnings: [],
    projectRoot: "/tmp/p",
    scannedFiles: 1,
    skippedFiles: 0,
    diagnostics: [],
  };
}

function config(overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
  return {
    projectRoot: "/tmp/p",
    title: "p",
    projectId: 4242,
    apiBaseUrl: "https://api.example.com",
    endpointConflictBehavior: "OVERWRITE_EXISTING",
    schemaConflictBehavior: "OVERWRITE_EXISTING",
    include: ["**/*.java"],
    exclude: [],
    exportPath: "openapi.gen.json",
    pageTypeStyle: "mybatis-plus",
    folderNameSource: "tag",
    rootFolderName: "",
    updateFolderOfChangedEndpoint: true,
    schemaFolderId: 0,
    helperPropertiesEnabled: true,
    enumFieldDoc: false,
    dependencyRepos: [],
    dependencyJars: [],
    maxDependencyJars: 120,
    timeoutMs: 5_000,
    ...overrides,
  };
}

const ORIGINAL_FETCH = globalThis.fetch;

/** 捕获一次同步实际发出的 options 与 input */
async function captureOptions(run: () => Promise<unknown>): Promise<{ options: Record<string, unknown>; input: string }> {
  let captured: { options: Record<string, unknown>; input: string } | undefined;
  globalThis.fetch = ((_url: unknown, init?: { body?: string }) => {
    const body = JSON.parse(init?.body ?? "{}") as { options: Record<string, unknown>; input: string };
    captured = { options: body.options ?? {}, input: body.input ?? "" };
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: { counters: {}, errors: [] } }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    await run();
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
  assert.ok(captured, "同步未发出导入请求");
  return captured;
}

/** 由 ResolvedConfig 造出等价的扩展侧 settings */
function settingsOf(cfg: ResolvedConfig) {
  return {
    projectId: cfg.projectId,
    apiBaseUrl: cfg.apiBaseUrl,
    endpointConflictBehavior: cfg.endpointConflictBehavior,
    schemaConflictBehavior: cfg.schemaConflictBehavior,
    schemaFolderId: cfg.schemaFolderId,
    schemaFolderName: "",
    updateFolderOfChangedEndpoint: cfg.updateFolderOfChangedEndpoint,
    include: cfg.include,
    exclude: cfg.exclude,
  } as never;
}

/**
 * 扩展侧 ApifoxClient 的 baseUrl 来自 settings，CLI 来自 config；
 * 两者都指向同一 mock 时才可比。故这里只比较 options 与 input，不比较 URL。
 */
async function captureCli(cfg: ResolvedConfig, token = "t") {
  return captureOptions(() => syncProject({ config: cfg, token, analyzed: analyzed() }));
}

async function captureExtension(cfg: ResolvedConfig) {
  installVscodeStub();
  try {
    const { ApifoxClient } = await import("../apifox/client");
    const { syncToApifox } = freshUploader();
    const client = new ApifoxClient(cfg.apiBaseUrl, "t", undefined, cfg.timeoutMs);
    return await captureOptions(() => syncToApifox(client, settingsOf(cfg), analyzed() as never));
  } finally {
    restoreModuleLoad();
  }
}

/* ---------------- 一致性断言 ---------------- */

const CONFLICT_MODES = ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"] as const;

for (const endpointMode of CONFLICT_MODES) {
  for (const schemaMode of CONFLICT_MODES) {
    test(`G3/G4 一致性：接口=${endpointMode} 模型=${schemaMode} 两条路径参数相同`, async () => {
      const cfg = config({ endpointConflictBehavior: endpointMode, schemaConflictBehavior: schemaMode });
      const cli = await captureCli(cfg);
      const ext = await captureExtension(cfg);

      // OpenAPI 文档必须逐字节一致：两路径用的是同一个 builder
      assert.equal(ext.input, cli.input);

      // 冲突策略必须原样透传（4×4 全组合，覆盖 as never 强转处）
      assert.equal(cli.options.endpointOverwriteBehavior, endpointMode);
      assert.equal(ext.options.endpointOverwriteBehavior, endpointMode);
      assert.equal(cli.options.schemaOverwriteBehavior, schemaMode);
      assert.equal(ext.options.schemaOverwriteBehavior, schemaMode);

      // 目录迁移开关一致
      assert.equal(cli.options.updateFolderOfChangedEndpoint, true);
      assert.equal(ext.options.updateFolderOfChangedEndpoint, true);

      // 两路径都不应预建目录（目录由 x-apifox-folder 在导入时创建）
      assert.equal(cli.options.targetEndpointFolderId, undefined);
      assert.equal(ext.options.targetEndpointFolderId, undefined);
    });
  }
}

test("G3 一致性：updateFolderOfChangedEndpoint=false 两条路径都关闭目录迁移", async () => {
  const cfg = config({ updateFolderOfChangedEndpoint: false });
  const cli = await captureCli(cfg);
  const ext = await captureExtension(cfg);
  assert.equal(cli.options.updateFolderOfChangedEndpoint, false);
  assert.equal(ext.options.updateFolderOfChangedEndpoint, false);
});

test("G3 一致性：schemaFolderId>0 时两条路径都以数字 ID 透传", async () => {
  const cfg = config({ schemaFolderId: 456 });
  const cli = await captureCli(cfg);
  const ext = await captureExtension(cfg);
  assert.equal(cli.options.targetSchemaFolderId, 456);
  assert.equal(ext.options.targetSchemaFolderId, 456);
});

test("G3 一致性：schemaFolderId=0 时两条路径都省略该键（放模型根目录）", async () => {
  const cfg = config({ schemaFolderId: 0 });
  const cli = await captureCli(cfg);
  const ext = await captureExtension(cfg);
  assert.equal(cli.options.targetSchemaFolderId, undefined);
  assert.equal(ext.options.targetSchemaFolderId, undefined);
});

test("G3 已知差异：CLI 显式 deleteUnmatchedResources=false，扩展侧不传该键", async () => {
  const cfg = config();
  const cli = await captureCli(cfg);
  const ext = await captureExtension(cfg);
  // CLI 侧有硬保护
  assert.equal(cli.options.deleteUnmatchedResources, false);
  // 扩展侧当前不传（依赖 Apifox 服务端默认）。此处断言当前事实，
  // 若后续为扩展补齐该键，本用例会失败并提示同步更新覆盖矩阵。
  assert.equal(Object.prototype.hasOwnProperty.call(ext.options, "deleteUnmatchedResources"), false);
});

test("G3 一致性：两路径请求头形状相同（版本头 + Bearer）", async () => {
  const cfg = config();
  const headers: Record<string, Record<string, string>> = {};
  async function capture(label: string, run: (baseUrl: string) => Promise<unknown>, baseUrl: string) {
    globalThis.fetch = ((_url: unknown, init?: { headers?: Record<string, string> }) => {
      headers[label] = init?.headers ?? {};
      return Promise.resolve(new Response(JSON.stringify({ code: 0, data: { counters: {}, errors: [] } }), { status: 200 }));
    }) as unknown as typeof fetch;
    try {
      await run(baseUrl);
    } finally {
      globalThis.fetch = ORIGINAL_FETCH;
    }
  }
  const { ApifoxClient } = await import("../apifox/client");
  await capture("cli", () => syncProject({ config: cfg, token: "t", analyzed: analyzed() }), cfg.apiBaseUrl);
  installVscodeStub();
  try {
    const { syncToApifox } = freshUploader();
    await capture(
      "ext",
      () => syncToApifox(new ApifoxClient(cfg.apiBaseUrl, "t"), settingsOf(cfg), analyzed() as never),
      cfg.apiBaseUrl
    );
  } finally {
    restoreModuleLoad();
  }
  assert.deepEqual(headers.ext, headers.cli);
  assert.equal(headers.cli["X-Apifox-Api-Version"], "2024-03-28");
  assert.equal(headers.cli.Authorization, "Bearer t");
});

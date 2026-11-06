const assert = require("node:assert/strict");
const { test } = require("node:test");

/**
 * M20:同步报告 HTML 的注入面与空数据形态(独立文件,不改既有 cli.test.js)。
 *
 * 渲染契约:用户可控内容只进入 <script> 内的 JSON 数据载荷
 * (JSON.stringify 后把 < 转义为 \u003c),不得以未转义形式进入 HTML 标签/属性。
 * 一旦渲染器改为模板拼接,这里的断言会失败。运行在构建产物 dist/cli.js 上。
 */

const { buildCliSyncReport, renderReportHtml } = require("../dist/cli.js");

function sampleReport(over = {}) {
  return {
    projectId: 4242,
    projectUrl: "https://app.apifox.com/project/4242",
    target: "Apifox 项目（ID: 4242）",
    scope: "整个项目",
    finishedAt: "2025-01-01 12:00:00",
    conflict: "接口=自动合并；数据模型=自动合并",
    summary: [],
    endpoints: [],
    errors: [],
    warnings: [],
    ...over,
  };
}

function endpointRow(i, over = {}) {
  return {
    name: `接口-${i}`,
    method: "GET",
    path: `/api/v1/res/${i}`,
    folder: "系统/DemoController",
    controller: "DemoController",
    file: "src/main/java/demo/DemoController.java",
    fsPath: "D:/demo/src/main/java/demo/DemoController.java",
    startOffset: 100 + i,
    ...over,
  };
}

test("M20:属性注入 — 名称/目标/冲突说明里的引号与事件处理器不进入 HTML 属性", () => {
  const html = renderReportHtml(
    sampleReport({
      target: '" onmouseover="alert(1)',
      conflict: '"><img src=x onerror=alert(1)>',
      endpoints: [
        endpointRow(0, {
          name: '" autofocus onfocus="alert(1)',
          path: '/x" onmouseover="alert(1)" data-y="',
          folder: '目录" onmouseover="',
        }),
      ],
    })
  );
  // 原始引号序列只可能来自模板拼接;数据载荷里的引号已由 JSON.stringify 转义为 \"
  assert.equal(html.includes('" onmouseover="alert(1)'), false);
  assert.equal(html.includes('<img'), false, "< 必须转义为 \\u003c,不能形成真实标签");
  assert.equal(html.includes('" autofocus onfocus="'), false);
});

test("M20:URL 注入 — projectUrl 只进数据载荷,不成为 href/src/标签属性", () => {
  const html = renderReportHtml(sampleReport({ projectUrl: 'javascript:alert(1)" onclick="pwn()' }));
  assert.equal(html.includes('href="javascript:'), false);
  assert.equal(html.includes('src="javascript:'), false);
  assert.equal(html.includes('" onclick="pwn()'), false);
  // 原值保留在数据载荷里,由页面脚本层决定是否/如何跳转
  assert.equal(html.includes("javascript:alert(1)"), true);
});

test("M20:错误/告警文本注入 — 脚本与标签片段整体转义,不产生可执行标签", () => {
  const html = renderReportHtml(
    sampleReport({
      errors: ["导入失败 </script><script>alert(2)</script>"],
      warnings: ['<iframe src="javascript:alert(3)"></iframe>'],
    })
  );
  assert.equal(html.includes("</script><script>alert(2)"), false);
  assert.equal(html.includes("<script>alert(2)"), false);
  assert.equal(html.includes("<iframe"), false);
  assert.equal(html.includes("\\u003c/script>"), true);
  assert.equal(html.includes("\\u003ciframe"), true);
});

test("M20:空 endpoints/零计数/空错误 — 报告仍完整可渲染且无 undefined", () => {
  const html = renderReportHtml(sampleReport());
  assert.ok(html.includes("同步结果"));
  assert.ok(html.includes('"endpoints":[]'));
  assert.ok(html.includes('"errors":[]'));
  assert.ok(html.includes('"warnings":[]'));
  assert.ok(html.includes("Apifox 未返回计数"), "空计数提示应保留");
  assert.equal(html.includes("undefined"), false);
});

test("M20:buildCliSyncReport 空同步(0 接口/空计数)产出空形态报告", () => {
  const report = buildCliSyncReport({
    synced: {
      dryRun: false,
      target: { projectId: 7, apiBaseUrl: "https://api.apifox.com" },
      scope: { type: "workspace", endpointCount: 0 },
      counters: {},
      errors: [],
    },
    analyzed: { endpoints: [], warnings: [] },
    resolved: {
      config: {
        projectRoot: "D:/demo",
        folderNameSource: "controller",
        rootFolderName: "",
        endpointConflictBehavior: "OVERWRITE_EXISTING",
        schemaConflictBehavior: "OVERWRITE_EXISTING",
      },
    },
  });
  assert.equal(report.projectId, 7);
  assert.equal(report.projectUrl, "https://app.apifox.com/project/7");
  assert.deepEqual(report.endpoints, []);
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.warnings, []);
  // 计数表仍保留两个分类行为零值(报告面板固定行,不是空数组)
  assert.deepEqual(
    report.summary.map((row) => [row.category, row.total]),
    [
      ["接口", 0],
      ["数据模型", 0],
    ]
  );
  const html = renderReportHtml(report);
  assert.ok(html.includes("同步结果"));
  assert.equal(html.includes("undefined"), false);
});

test("M20:超长接口清单(200 条)完整进入数据载荷且不截断", () => {
  const endpoints = Array.from({ length: 200 }, (_, i) => endpointRow(i));
  const html = renderReportHtml(sampleReport({ endpoints }));
  assert.ok(html.includes('"name":"接口-0"'));
  assert.ok(html.includes('"name":"接口-199"'));
  // 每条接口都进入数据载荷(JSON 内 name 出现 200 次)
  assert.equal((html.match(/"name":"接口-/g) || []).length, 200);
});

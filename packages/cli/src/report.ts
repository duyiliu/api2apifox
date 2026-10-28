import { exec } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { ResolvedConfigResult } from "../../../src/core/types";
import { ProjectAnalysisResult, SyncResult } from "../../../src/core/types";
import { EndpointInfo } from "../../../src/java/model";
import { buildSyncReport, projectWebUrl, SyncReport } from "../../../src/ui/syncResult";

/**
 * 同步结果浏览器报告页:CLI 版「结果面板」。
 * 与 VS Code 扩展的 SyncResultPanel 展示同一份 SyncReport 数据,
 * 区别是这里生成自包含 HTML(数据内嵌),用系统默认浏览器打开。
 */

/** 目录名:与写入 OpenAPI 的 x-apifox-folder 规则保持一致(scan 输出同源)。 */
export function folderOfEndpoint(endpoint: EndpointInfo, resolved: ResolvedConfigResult): string {
  const key = resolved.config.folderNameSource === "controller" ? endpoint.controller : endpoint.tag;
  return resolved.config.rootFolderName.trim() ? `${resolved.config.rootFolderName.trim()}/${key}` : key;
}

function scopeLabel(type: SyncResult["scope"]["type"]): string {
  switch (type) {
    case "workspace":
      return "整个项目";
    case "file":
      return "指定文件";
    case "endpoint":
      return "指定接口";
    case "selection":
      return "指定文件与接口";
  }
}

/** 一次 CLI 同步 → 结果报告(计数来自 Apifox 导入返回,不做逐接口状态推断)。 */
export function buildCliSyncReport(input: {
  synced: SyncResult;
  analyzed: ProjectAnalysisResult;
  resolved: ResolvedConfigResult;
}): SyncReport {
  const { synced, analyzed, resolved } = input;
  return buildSyncReport({
    counters: synced.counters,
    errors: synced.errors,
    warnings: analyzed.warnings,
    endpoints: analyzed.endpoints,
    target: `Apifox 项目（ID: ${synced.target.projectId}）`,
    projectId: synced.target.projectId,
    projectUrl: projectWebUrl(synced.target.apiBaseUrl, synced.target.projectId),
    scope: scopeLabel(synced.scope.type),
    endpointConflictBehavior: resolved.config.endpointConflictBehavior,
    schemaConflictBehavior: resolved.config.schemaConflictBehavior,
    folderOf: (endpoint) => folderOfEndpoint(endpoint, resolved),
    workspaceRoot: resolved.config.projectRoot,
  });
}

/** 报告落盘路径:临时目录下按项目固定命名,重复同步原地覆盖,不污染项目目录。 */
export function syncReportPath(projectId: number): string {
  return path.join(os.tmpdir(), `api2apifox-sync-report-${projectId}.html`);
}

/** 生成自包含 HTML:无外部资源、无网络请求,数据内嵌,亮/暗自适应。 */
export function renderReportHtml(report: SyncReport): string {
  // < 转义防止接口名等用户内容提前闭合 script 标签
  const data = JSON.stringify(report).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<title>ApiGen for Apifox 同步结果</title>
<style>
  :root {
    --bg: #f6f8fa; --card: #ffffff; --fg: #1f2328; --muted: #59636e;
    --border: #d1d9e0; --hover: rgba(9, 105, 218, 0.06);
    --btn-bg: rgba(9, 105, 218, 0.08); --btn-fg: #0969da; --btn-hover: rgba(9, 105, 218, 0.16);
    --ok: #1a7f37; --info: #0969da; --warn: #9a6700; --error: #cf222e;
    --m-get: #0969da; --m-post: #1a7f37; --m-put: #9a6700; --m-delete: #cf222e; --m-patch: #8250df;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0d1117; --card: #151b23; --fg: #e6edf3; --muted: #9198a1;
      --border: #3d444d; --hover: rgba(68, 147, 248, 0.12);
      --btn-bg: rgba(68, 147, 248, 0.15); --btn-fg: #4493f8; --btn-hover: rgba(68, 147, 248, 0.25);
      --ok: #3fb950; --info: #4493f8; --warn: #d29922; --error: #f85149;
      --m-get: #4493f8; --m-post: #3fb950; --m-put: #d29922; --m-delete: #f85149; --m-patch: #ab7df8;
    }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--fg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; }
  .page { max-width: 1100px; margin: 0 auto; padding: 24px 20px 56px; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 14px; margin-bottom: 18px; flex-wrap: wrap; }
  .header-title { font-size: 18px; font-weight: 600; }
  .header-title .brand { font-size: 12px; font-weight: 400; color: var(--muted); margin-left: 8px; }
  .meta { display: grid; grid-template-columns: auto auto; gap: 2px 10px; font-size: 12px; }
  .meta .label { color: var(--muted); }
  .result-banner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; margin-bottom: 20px; border: 1px solid var(--border); border-left: 4px solid var(--ok); border-radius: 6px; background: var(--card); flex-wrap: wrap; }
  .result-banner.warning { border-left-color: var(--warn); }
  .result-banner.error { border-left-color: var(--error); }
  .result-title { font-size: 15px; font-weight: 600; }
  .result-detail { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
  .section { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px; margin-bottom: 18px; }
  .section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
  .section-head h2 { font-size: 14px; font-weight: 600; }
  .count { color: var(--muted); font-weight: 400; margin-left: 6px; }
  .tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  button { background: var(--btn-bg); color: var(--btn-fg); border: none; border-radius: 5px; padding: 5px 12px; font-size: 12.5px; cursor: pointer; font-family: inherit; }
  button:hover { background: var(--btn-hover); }
  button:focus-visible, input:focus-visible, th.sortable:focus-visible { outline: 2px solid var(--info); outline-offset: 1px; }
  button.primary { background: #1f6feb; color: #fff; }
  button.primary:hover { background: #388bfd; }
  @media (prefers-color-scheme: dark) { button.primary { background: #1f6feb; color: #fff; } }
  input[type="search"] { background: var(--bg); color: var(--fg); border: 1px solid var(--border); border-radius: 5px; padding: 5px 10px; font-size: 12.5px; min-width: 250px; font-family: inherit; }
  .copy-hint { color: var(--ok); font-size: 12px; opacity: 0; transition: opacity 0.2s; }
  .copy-hint.show { opacity: 1; }
  .table-wrap { width: 100%; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 7px 10px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
  thead th { color: var(--muted); font-weight: 500; white-space: nowrap; position: sticky; top: 0; background: var(--card); }
  th.sortable { cursor: pointer; user-select: none; }
  th.sortable:hover { color: var(--fg); }
  th .arrow { margin-left: 4px; font-size: 10px; }
  tbody tr:hover { background: var(--hover); }
  tbody tr:last-child td { border-bottom: none; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .cell-path { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; word-break: break-all; }
  .muted { color: var(--muted); }
  .badge { display: inline-block; min-width: 22px; text-align: center; border-radius: 4px; padding: 0 6px; font-size: 12px; }
  .badge.ok { background: rgba(26, 127, 55, 0.14); color: var(--ok); }
  .badge.info { background: rgba(9, 105, 218, 0.12); color: var(--info); }
  .badge.muted-badge { background: var(--hover); color: var(--muted); }
  .badge.error { background: rgba(207, 34, 46, 0.12); color: var(--error); }
  .method { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; font-weight: 600; }
  .method-get { color: var(--m-get); } .method-post { color: var(--m-post); } .method-put { color: var(--m-put); }
  .method-delete { color: var(--m-delete); } .method-patch { color: var(--m-patch); }
  ul.issues { list-style: none; }
  ul.issues li { padding: 6px 10px; border-left: 3px solid var(--warn); background: rgba(154, 103, 0, 0.08); margin-bottom: 6px; word-break: break-word; border-radius: 0 4px 4px 0; font-size: 13px; }
  ul.issues li.error { border-left-color: var(--error); background: rgba(207, 34, 46, 0.08); }
  .empty { color: var(--muted); padding: 10px 0; }
  .hidden { display: none; }
  .footer { color: var(--muted); font-size: 12px; text-align: center; margin-top: 26px; }
  @media (max-width: 720px) {
    .page { padding: 16px 12px 40px; }
    .header { flex-direction: column; }
    .meta { grid-template-columns: auto 1fr; width: 100%; }
    input[type="search"] { min-width: 180px; width: 100%; }
    #endpointTable th:nth-child(5), #endpointTable td:nth-child(5) { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-title">同步结果<span class="brand">ApiGen for Apifox</span></div>
    <div class="meta">
      <span class="label">目标</span><span id="metaTarget">—</span>
      <span class="label">范围</span><span id="metaScope">—</span>
      <span class="label">时间</span><span id="metaTime">—</span>
      <span class="label">冲突策略</span><span id="metaConflict">—</span>
    </div>
  </div>

  <div class="result-banner" id="resultBanner" role="status" aria-live="polite">
    <div>
      <div class="result-title" id="resultTitle">同步完成</div>
      <div class="result-detail" id="resultDetail">正在读取同步结果…</div>
    </div>
    <button type="button" id="btnOpenProject" class="primary">在 Apifox 中打开项目</button>
  </div>

  <div class="section">
    <div class="section-head">
      <h2>导入计数</h2>
      <div class="tools">
        <button type="button" id="btnCopySummary">复制汇总</button>
        <span class="copy-hint" id="summaryCopyHint" aria-live="polite">已复制</span>
      </div>
    </div>
    <div class="table-wrap"><table id="summaryTable">
      <thead>
        <tr><th>分类</th><th class="num">新增</th><th class="num">更新</th><th class="num">忽略</th><th class="num">失败</th><th class="num">合计</th></tr>
      </thead>
      <tbody></tbody>
    </table></div>
    <div class="empty hidden" id="summaryEmpty">Apifox 未返回计数。</div>
  </div>

  <div class="section hidden" id="issueSection">
    <div class="section-head"><h2>需要关注<span class="count" id="issueCount"></span></h2></div>
    <ul class="issues" id="issueList"></ul>
  </div>

  <div class="section">
    <div class="section-head">
      <h2>接口清单<span class="count" id="endpointCount"></span></h2>
      <div class="tools">
        <input id="filter" type="search" placeholder="过滤 名称/方法/路径/目录/文件">
        <button type="button" id="btnCopyEndpoints">复制清单 (TSV)</button>
        <button type="button" id="btnCopyMarkdown">复制 Markdown</button>
        <span class="copy-hint" id="endpointCopyHint" aria-live="polite">已复制</span>
      </div>
    </div>
    <div class="table-wrap"><table id="endpointTable">
      <thead>
        <tr>
          <th class="sortable" data-key="name" tabindex="0">接口名称</th>
          <th class="sortable" data-key="method" tabindex="0">方法</th>
          <th class="sortable" data-key="path" tabindex="0">路径</th>
          <th class="sortable" data-key="folder" tabindex="0">目录</th>
          <th class="sortable" data-key="file" tabindex="0">源文件</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table></div>
    <div class="empty hidden" id="endpointEmpty">没有接口。</div>
    <div class="empty hidden" id="endpointFilteredEmpty">没有匹配的接口。</div>
  </div>

  <footer class="footer">由 api2apifox CLI 生成 · 计数来自 Apifox 导入结果，逐接口状态 Apifox 不返回</footer>
</div>

<script>
  var REPORT = ${data};
  var sortKey = "folder";
  var sortDir = 1;
  var keyword = "";

  function el(id) { return document.getElementById(id); }
  function setText(id, text) { el(id).textContent = text; }

  var METHOD_CLASS = { GET: "method-get", POST: "method-post", PUT: "method-put", DELETE: "method-delete", PATCH: "method-patch" };

  function badge(value, kind) {
    var span = document.createElement("span");
    span.className = "badge " + (value > 0 ? kind : "muted-badge");
    span.textContent = String(value);
    return span;
  }

  function numCell(value, kind) {
    var td = document.createElement("td");
    td.className = "num";
    td.appendChild(badge(value, kind));
    return td;
  }

  function renderSummary() {
    var tbody = el("summaryTable").querySelector("tbody");
    tbody.textContent = "";
    var rows = (REPORT && REPORT.summary) || [];
    el("summaryEmpty").classList.toggle("hidden", rows.length > 0);
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var tr = document.createElement("tr");
      var name = document.createElement("td");
      name.textContent = row.category;
      tr.appendChild(name);
      tr.appendChild(numCell(row.created, "ok"));
      tr.appendChild(numCell(row.updated, "info"));
      tr.appendChild(numCell(row.ignored, "muted-badge"));
      tr.appendChild(numCell(row.failed, "error"));
      var total = document.createElement("td");
      total.className = "num muted";
      total.textContent = String(row.total);
      tr.appendChild(total);
      tbody.appendChild(tr);
    }
  }

  function renderResultBanner() {
    var endpoint = ((REPORT && REPORT.summary) || []).filter(function (row) { return row.category === "接口"; })[0] || { created: 0, updated: 0, ignored: 0, failed: 0 };
    var errorCount = (REPORT.errors || []).length;
    var warningCount = (REPORT.warnings || []).length;
    var failed = endpoint.failed + errorCount;
    var banner = el("resultBanner");
    banner.classList.toggle("error", failed > 0);
    banner.classList.toggle("warning", failed === 0 && warningCount > 0);
    setText("resultTitle", failed > 0 ? "同步完成，但存在失败项" : warningCount > 0 ? "同步完成，有需要关注的警告" : "同步完成");
    var parts = ["接口新增 " + endpoint.created, "更新 " + endpoint.updated, "忽略 " + endpoint.ignored];
    if (endpoint.failed > 0) { parts.push("失败 " + endpoint.failed); }
    if (errorCount > 0) { parts.push("错误 " + errorCount); }
    if (warningCount > 0) { parts.push("警告 " + warningCount); }
    setText("resultDetail", parts.join(" · "));
    el("btnOpenProject").classList.toggle("hidden", !REPORT.projectUrl);
  }

  function visibleEndpoints() {
    var all = (REPORT && REPORT.endpoints) || [];
    var kw = keyword.trim().toLowerCase();
    var filtered = kw
      ? all.filter(function (r) { return [r.name, r.method, r.path, r.folder, r.controller, r.file].join(" ").toLowerCase().indexOf(kw) >= 0; })
      : all.slice();
    filtered.sort(function (a, b) {
      var av = String(a[sortKey] || "");
      var bv = String(b[sortKey] || "");
      return av.localeCompare(bv, "zh-Hans-CN") * sortDir || a.path.localeCompare(b.path) * sortDir;
    });
    return filtered;
  }

  function renderEndpoints() {
    var tbody = el("endpointTable").querySelector("tbody");
    tbody.textContent = "";
    var all = (REPORT && REPORT.endpoints) || [];
    var rows = visibleEndpoints();
    el("endpointCount").textContent = keyword.trim()
      ? " 共 " + all.length + " 个，筛出 " + rows.length + " 个"
      : " 共 " + all.length + " 个";
    el("endpointEmpty").classList.toggle("hidden", all.length > 0);
    el("endpointFilteredEmpty").classList.toggle("hidden", !(all.length > 0 && rows.length === 0));

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var tr = document.createElement("tr");

      var name = document.createElement("td");
      name.textContent = row.name;
      tr.appendChild(name);

      var method = document.createElement("td");
      var methodSpan = document.createElement("span");
      methodSpan.className = "method " + (METHOD_CLASS[row.method] || "");
      methodSpan.textContent = row.method;
      method.appendChild(methodSpan);
      tr.appendChild(method);

      var p = document.createElement("td");
      p.className = "cell-path";
      p.textContent = row.path;
      tr.appendChild(p);

      var folder = document.createElement("td");
      folder.textContent = row.folder;
      tr.appendChild(folder);

      var file = document.createElement("td");
      file.className = "cell-path";
      file.textContent = row.file;
      tr.appendChild(file);

      tbody.appendChild(tr);
    }

    var headers = document.querySelectorAll("#endpointTable th.sortable");
    for (var j = 0; j < headers.length; j++) {
      var th = headers[j];
      var existing = th.querySelector(".arrow");
      if (existing) { existing.remove(); }
      if (th.dataset.key === sortKey) {
        th.setAttribute("aria-sort", sortDir > 0 ? "ascending" : "descending");
        var arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = sortDir > 0 ? "▲" : "▼";
        th.appendChild(arrow);
      } else {
        th.setAttribute("aria-sort", "none");
      }
    }
  }

  function renderIssues() {
    var list = el("issueList");
    list.textContent = "";
    var items = [];
    var errors = (REPORT && REPORT.errors) || [];
    var warnings = (REPORT && REPORT.warnings) || [];
    for (var i = 0; i < errors.length; i++) { items.push({ text: errors[i], error: true }); }
    for (var j = 0; j < warnings.length; j++) { items.push({ text: warnings[j], error: false }); }
    el("issueSection").classList.toggle("hidden", items.length === 0);
    setText("issueCount", items.length ? " 共 " + items.length + " 项" : "");
    for (var k = 0; k < items.length; k++) {
      var li = document.createElement("li");
      li.className = items[k].error ? "error" : "";
      li.textContent = items[k].text;
      list.appendChild(li);
    }
  }

  function render() {
    setText("metaTarget", REPORT.target);
    setText("metaScope", REPORT.scope);
    setText("metaTime", REPORT.finishedAt);
    setText("metaConflict", REPORT.conflict);
    renderResultBanner();
    renderSummary();
    renderEndpoints();
    renderIssues();
    document.title = "同步结果 · " + REPORT.target;
  }

  function summaryTsv() {
    var lines = ["分类\\t新增\\t更新\\t忽略\\t失败\\t合计"];
    var rows = (REPORT && REPORT.summary) || [];
    for (var i = 0; i < rows.length; i++) {
      lines.push([rows[i].category, rows[i].created, rows[i].updated, rows[i].ignored, rows[i].failed, rows[i].total].join("\\t"));
    }
    return lines.join("\\n");
  }

  function endpointTsv() {
    var lines = ["接口名称\\t方法\\t路径\\t目录\\t源文件"];
    var rows = visibleEndpoints();
    for (var i = 0; i < rows.length; i++) {
      lines.push([rows[i].name, rows[i].method, rows[i].path, rows[i].folder, rows[i].file].join("\\t"));
    }
    return lines.join("\\n");
  }

  // 表格单元格转义:接口名/路径含 | 或换行会破坏 Markdown 表结构
  // 注意:此处位于 TS 模板字符串内,反斜杠需双写(输出到页面的 JS 才是单斜杠)
  function mdCell(v) {
    return String(v == null ? "" : v).replace(/\\|/g, "\\\\|").replace(/[\\r\\n]+/g, " ");
  }

  function markdown() {
    var lines = ["## 同步结果", "", "- 目标：" + REPORT.target, "- 范围：" + REPORT.scope, "- 时间：" + REPORT.finishedAt, "- 冲突策略：" + REPORT.conflict, ""];
    lines.push("| 分类 | 新增 | 更新 | 忽略 | 失败 | 合计 |", "| --- | ---: | ---: | ---: | ---: | ---: |");
    var rows = (REPORT && REPORT.summary) || [];
    for (var i = 0; i < rows.length; i++) {
      lines.push("| " + mdCell(rows[i].category) + " | " + rows[i].created + " | " + rows[i].updated + " | " + rows[i].ignored + " | " + rows[i].failed + " | " + rows[i].total + " |");
    }
    lines.push("", "| 接口名称 | 方法 | 路径 | 目录 |", "| --- | --- | --- | --- |");
    var endpoints = visibleEndpoints();
    for (var j = 0; j < endpoints.length; j++) {
      lines.push("| " + mdCell(endpoints[j].name) + " | " + mdCell(endpoints[j].method) + " | " + mdCell(endpoints[j].path) + " | " + mdCell(endpoints[j].folder) + " |");
    }
    var errors = REPORT.errors || [];
    if (errors.length) {
      lines.push("", "**错误**");
      for (var k = 0; k < errors.length; k++) { lines.push("- " + errors[k]); }
    }
    var warnings = REPORT.warnings || [];
    if (warnings.length) {
      lines.push("", "**警告**");
      for (var m = 0; m < warnings.length; m++) { lines.push("- " + warnings[m]); }
    }
    return lines.join("\\n");
  }

  // file:// 下 clipboard API 可能被拒绝,退回 execCommand
  function copyText(text, label) {
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      if (ok) { showHint(label); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showHint(label); }, fallback);
    } else {
      fallback();
    }
  }

  function showHint(label) {
    var hint = el(label === "汇总" ? "summaryCopyHint" : "endpointCopyHint");
    hint.classList.add("show");
    setTimeout(function () { hint.classList.remove("show"); }, 1500);
  }

  el("filter").addEventListener("input", function (event) {
    keyword = event.target.value || "";
    renderEndpoints();
  });

  function applySort(target) {
    var th = target.closest ? target.closest("th.sortable") : null;
    if (!th) { return; }
    var key = th.dataset.key;
    if (sortKey === key) {
      sortDir = -sortDir;
    } else {
      sortKey = key;
      sortDir = 1;
    }
    renderEndpoints();
  }

  document.querySelector("#endpointTable thead").addEventListener("click", function (event) {
    applySort(event.target);
  });
  document.querySelector("#endpointTable thead").addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      applySort(event.target);
    }
  });

  el("btnCopySummary").addEventListener("click", function () { copyText(summaryTsv(), "汇总"); });
  el("btnCopyEndpoints").addEventListener("click", function () { copyText(endpointTsv(), "接口清单"); });
  el("btnCopyMarkdown").addEventListener("click", function () { copyText(markdown(), "接口清单"); });
  el("btnOpenProject").addEventListener("click", function () {
    if (REPORT.projectUrl) { window.open(REPORT.projectUrl, "_blank", "noopener"); }
  });

  render();
</script>
</body>
</html>`;
}

/** 用系统默认程序打开(浏览器)。无头/受限环境可能失败,由调用方降级提示。 */
export function openInBrowser(target: string): Promise<boolean> {
  return new Promise((resolve) => {
    const command =
      process.platform === "win32"
        ? `start "" "${target}"`
        : process.platform === "darwin"
          ? `open "${target}"`
          : `xdg-open "${target}"`;
    exec(command, { timeout: 5000, windowsHide: true }, (error) => resolve(!error));
  });
}

/**
 * 写报告文件并尝试用浏览器打开。
 * 报告只是同步结果的展示,任何失败都不影响 CLI 退出码:写失败返回 undefined,打开失败走 stderr 提示。
 */
export async function writeReportAndOpen(report: SyncReport): Promise<string | undefined> {
  const file = syncReportPath(report.projectId);
  try {
    await fs.promises.writeFile(file, renderReportHtml(report), "utf8");
  } catch (error) {
    process.stderr.write(`api2apifox: 同步报告写入失败:${error instanceof Error ? error.message : String(error)}\n`);
    return undefined;
  }
  if (!(await openInBrowser(file))) {
    process.stderr.write(`api2apifox: 无法自动打开浏览器,请手动查看同步报告:${file}\n`);
  }
  return file;
}

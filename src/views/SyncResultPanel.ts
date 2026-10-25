import * as vscode from "vscode";
import { SyncReport } from "../ui/syncResult";
import { getNonce } from "../ui/nonce";

/**
 * 同步结果面板:与设置中心同级的 Webview 视图。
 * 汇总计数按「分类 × 新增/更新/忽略/失败」成表,接口清单支持排序、过滤与一键复制。
 * 数据来自 Apifox 导入接口返回的 counters,面板不做二次推断(逐接口状态 Apifox 不返回)。
 */
export class SyncResultPanel {
  private static current: SyncResultPanel | undefined;
  private static lastReport: SyncReport | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _webviewReady = false;
  private _pending: SyncReport | undefined;

  /** 展示一次同步结果:面板已存在则原地刷新,否则在编辑器旁新建(不抢焦点)。 */
  public static createOrShow(report: SyncReport): void {
    SyncResultPanel.lastReport = report;
    if (SyncResultPanel.current) {
      SyncResultPanel.current._panel.reveal(SyncResultPanel.current._panel.viewColumn ?? vscode.ViewColumn.Beside, true);
      SyncResultPanel.current._render(report);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      "apifoxHelperSyncResult",
      "ApiGen for Apifox 同步结果",
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true, retainContextWhenHidden: true }
    );
    SyncResultPanel.current = new SyncResultPanel(panel);
    SyncResultPanel.current._render(report);
  }

  /** 重新打开上次结果(面板被关掉后仍可从命令/状态栏菜单进入)。 */
  public static showLast(): void {
    if (SyncResultPanel.current) {
      SyncResultPanel.current._panel.reveal(undefined, true);
      return;
    }
    if (SyncResultPanel.lastReport) {
      SyncResultPanel.createOrShow(SyncResultPanel.lastReport);
      return;
    }
    vscode.window.showInformationMessage("还没有同步记录，先执行一次同步。");
  }

  private constructor(panel: vscode.WebviewPanel) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "ready":
            this._webviewReady = true;
            if (this._pending) {
              this._post(this._pending);
            }
            break;
          case "copy":
            await vscode.env.clipboard.writeText(String(message.text ?? ""));
            this._postMessage({ command: "copied", label: message.label });
            break;
          case "openProject":
            // 跳转地址由报告构建方按 apiBaseUrl 推导(私有化部署为 undefined,按钮已隐藏)
            if (this._pending?.projectUrl) {
              await vscode.env.openExternal(vscode.Uri.parse(this._pending.projectUrl));
            }
            break;
          case "openSource": {
            const fsPath = typeof message.fsPath === "string" ? message.fsPath : "";
            if (!fsPath) {
              break;
            }
            // 只允许打开工作区内文件(fsPath 来自本端生成的报告,这里做兜底校验)
            const fileUri = vscode.Uri.file(fsPath);
            if (!vscode.workspace.getWorkspaceFolder(fileUri)) {
              break;
            }
            try {
              const doc = await vscode.workspace.openTextDocument(fileUri);
              const editor = await vscode.window.showTextDocument(doc, { preview: true });
              const offset = Number(message.startOffset);
              if (Number.isFinite(offset) && offset >= 0) {
                const pos = doc.positionAt(offset);
                editor.selection = new vscode.Selection(pos, pos);
                editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
              }
            } catch {
              vscode.window.showWarningMessage(`无法打开源文件：${fsPath}`);
            }
            break;
          }
        }
      },
      null,
      this._disposables
    );
  }

  private _render(report: SyncReport): void {
    this._pending = report;
    if (this._webviewReady) {
      this._post(report);
    }
  }

  private _post(report: SyncReport): void {
    this._postMessage({ command: "render", report });
  }

  private _postMessage(message: unknown): void {
    void this._panel.webview.postMessage(message);
  }

  private dispose(): void {
    SyncResultPanel.current = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>ApiGen for Apifox 同步结果</title>
  <style>
    :root {
      --border-color: var(--vscode-widget-border, var(--vscode-sideBar-border, rgba(255, 255, 255, 0.1)));
      --muted: var(--vscode-descriptionForeground);
      --btn-bg: var(--vscode-button-background);
      --btn-fg: var(--vscode-button-foreground);
      --btn-hover: var(--vscode-button-hoverBackground);
      --btn-sec-bg: var(--vscode-button-secondaryBackground, rgba(255, 255, 255, 0.08));
      --btn-sec-fg: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
      --btn-sec-hover: var(--vscode-button-secondaryHoverBackground, rgba(255, 255, 255, 0.15));
      --ok: #49b36b;
      --info: var(--vscode-focusBorder, #3794ff);
      --warn: #d7a12c;
      --error: #f14c4c;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      line-height: 1.6;
      padding: 20px 24px 48px 24px;
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .header-title { font-size: 17px; font-weight: 600; }
    .meta { display: grid; grid-template-columns: auto auto; gap: 2px 10px; font-size: 12px; }
    .meta .label { color: var(--muted); }
    .result-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 14px;
      margin-bottom: 20px;
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--ok);
      border-radius: 5px;
      background: rgba(73, 179, 107, 0.08);
    }
    .result-banner.warning {
      border-left-color: var(--warn);
      background: rgba(215, 161, 44, 0.08);
    }
    .result-banner.error {
      border-left-color: var(--error);
      background: rgba(241, 76, 76, 0.08);
    }
    .result-title { font-size: 14px; font-weight: 600; }
    .result-detail { color: var(--muted); font-size: 12px; margin-top: 2px; }
    .section { margin-bottom: 22px; }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .section-head h2 { font-size: 13.5px; font-weight: 600; }
    .count { color: var(--muted); font-weight: 400; margin-left: 6px; }
    .tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    button {
      background: var(--btn-sec-bg);
      color: var(--btn-sec-fg);
      border: none;
      border-radius: 3px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
      font-family: inherit;
    }
    button:hover { background: var(--btn-sec-hover); }
    button:focus-visible, input:focus-visible, th.sortable:focus-visible, .source-link:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }
    input[type="search"] {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, var(--border-color));
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      min-width: 240px;
      font-family: inherit;
    }
    .copy-hint { color: var(--ok); font-size: 12px; opacity: 0; transition: opacity 0.2s; }
    .copy-hint.show { opacity: 1; }
    .table-wrap { width: 100%; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    th, td { padding: 6px 10px; border-bottom: 1px solid var(--border-color); text-align: left; vertical-align: top; }
    thead th {
      color: var(--muted);
      font-weight: 500;
      white-space: nowrap;
      position: sticky;
      top: 0;
      background: var(--vscode-editor-background);
    }
    th.sortable { cursor: pointer; user-select: none; }
    th.sortable:hover { color: var(--vscode-foreground); }
    th .arrow { margin-left: 4px; font-size: 10px; }
    tbody tr:hover { background: var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.04)); }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .cell-path { font-family: var(--vscode-editor-font-family, monospace); word-break: break-all; }
    .muted { color: var(--muted); }
    .badge { display: inline-block; min-width: 20px; text-align: center; border-radius: 3px; padding: 0 5px; font-size: 11.5px; }
    .badge.ok { background: rgba(73, 179, 107, 0.18); color: var(--ok); }
    .badge.info { background: rgba(55, 148, 255, 0.16); color: var(--info); }
    .badge.muted-badge { background: rgba(140, 140, 140, 0.16); color: var(--muted); }
    .badge.error { background: rgba(241, 76, 76, 0.16); color: var(--error); }
    .method { font-family: var(--vscode-editor-font-family, monospace); font-size: 11.5px; font-weight: 600; }
    .method-get { color: #3794ff; }
    .method-post { color: #49b36b; }
    .method-put { color: #d7a12c; }
    .method-delete { color: #f14c4c; }
    .method-patch { color: #b180d7; }
    .source-link {
      appearance: none;
      border: 0;
      background: transparent;
      color: var(--vscode-textLink-foreground);
      cursor: pointer;
      padding: 0;
      text-align: left;
      font: inherit;
    }
    .source-link:hover { text-decoration: underline; background: transparent; }
    ul.issues { list-style: none; }
    ul.issues li { padding: 5px 8px; border-left: 3px solid var(--warn); background: rgba(215, 161, 44, 0.08); margin-bottom: 6px; word-break: break-word; }
    ul.issues li.error { border-left-color: var(--error); background: rgba(241, 76, 76, 0.08); }
    .empty { color: var(--muted); padding: 10px 0; }
    .hidden { display: none; }
    @media (max-width: 720px) {
      body { padding: 16px 14px 36px; }
      .header { flex-direction: column; }
      .meta { grid-template-columns: auto 1fr; width: 100%; }
      .result-banner { align-items: flex-start; flex-direction: column; }
      input[type="search"] { min-width: 180px; width: 100%; }
      .tools { width: 100%; }
      #endpointTable th:nth-child(4), #endpointTable td:nth-child(4) { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">同步结果</div>
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
  </div>

  <div class="section">
    <div class="section-head">
      <h2>导入计数</h2>
      <div class="tools">
        <button type="button" id="btnOpenProject">在 Apifox 中打开项目</button>
        <button type="button" id="btnCopySummary">复制汇总</button>
        <span class="copy-hint" id="summaryCopyHint" aria-live="polite">已复制</span>
      </div>
    </div>
    <div class="table-wrap"><table id="summaryTable">
      <thead>
        <tr>
          <th>分类</th>
          <th class="num">新增</th>
          <th class="num">更新</th>
          <th class="num">忽略</th>
          <th class="num">失败</th>
          <th class="num">合计</th>
        </tr>
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
          <th class="sortable" data-key="name" tabindex="0" role="button">接口名称</th>
          <th class="sortable" data-key="method" tabindex="0" role="button">方法</th>
          <th class="sortable" data-key="path" tabindex="0" role="button">路径</th>
          <th class="sortable" data-key="folder" tabindex="0" role="button">目录</th>
          <th class="sortable" data-key="file" tabindex="0" role="button">源文件</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table></div>
    <div class="empty hidden" id="endpointEmpty">没有接口。</div>
    <div class="empty hidden" id="endpointFilteredEmpty">没有匹配的接口。</div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let report = null;
    let sortKey = "folder";
    let sortDir = 1;
    let keyword = "";
    let readySent = false;

    const el = (id) => document.getElementById(id);
    const setText = (id, text) => { el(id).textContent = text; };

    const METHOD_CLASS = { GET: "method-get", POST: "method-post", PUT: "method-put", DELETE: "method-delete", PATCH: "method-patch" };
    const STATUS_LABEL = { added: "新增", changed: "已变更", unchanged: "未变化", deleted: "源码已删除" };
    const STATUS_KIND = { added: "ok", changed: "info", unchanged: "muted-badge", deleted: "error" };

    function badge(value, kind) {
      const span = document.createElement("span");
      span.className = "badge " + (value > 0 ? kind : "muted-badge");
      span.textContent = String(value);
      return span;
    }

    function numCell(value, kind) {
      const td = document.createElement("td");
      td.className = "num";
      td.appendChild(badge(value, kind));
      return td;
    }

    function renderSummary() {
      const tbody = el("summaryTable").querySelector("tbody");
      tbody.textContent = "";
      const rows = (report && report.summary) || [];
      el("summaryEmpty").classList.toggle("hidden", rows.length > 0);
      for (const row of rows) {
        const tr = document.createElement("tr");
        const name = document.createElement("td");
        name.textContent = row.category;
        tr.appendChild(name);
        tr.appendChild(numCell(row.created, "ok"));
        tr.appendChild(numCell(row.updated, "info"));
        tr.appendChild(numCell(row.ignored, "muted-badge"));
        tr.appendChild(numCell(row.failed, "error"));
        const total = document.createElement("td");
        total.className = "num muted";
        total.textContent = String(row.total);
        tr.appendChild(total);
        tbody.appendChild(tr);
      }
    }

    function renderResultBanner() {
      const endpoint = ((report && report.summary) || []).find((row) => row.category === "接口") || {
        created: 0, updated: 0, ignored: 0, failed: 0
      };
      const errorCount = (report.errors || []).length;
      const warningCount = (report.warnings || []).length;
      const failed = endpoint.failed + errorCount;
      const banner = el("resultBanner");
      banner.classList.toggle("error", failed > 0);
      banner.classList.toggle("warning", failed === 0 && warningCount > 0);
      setText("resultTitle", failed > 0 ? "同步完成，但存在失败项" : warningCount > 0 ? "同步完成，有需要关注的警告" : "同步完成");
      const parts = ["接口新增 " + endpoint.created, "更新 " + endpoint.updated, "忽略 " + endpoint.ignored];
      if (endpoint.failed > 0) { parts.push("失败 " + endpoint.failed); }
      if (errorCount > 0) { parts.push("错误 " + errorCount); }
      if (warningCount > 0) { parts.push("警告 " + warningCount); }
      if (report.changes) {
        parts.push("差异 新增 " + report.changes.added + " / 变更 " + report.changes.changed + " / 未变化 " + report.changes.unchanged + " / 源码已删除 " + report.changes.deleted);
      }
      if (report.baselineUpdated) { parts.push("基线已更新"); }
      setText("resultDetail", parts.join(" · "));
    }

    function visibleEndpoints() {
      const all = (report && report.endpoints) || [];
      const kw = keyword.trim().toLowerCase();
      const filtered = kw
        ? all.filter((r) => [r.name, r.method, r.path, r.folder, r.controller, r.file].join(" ").toLowerCase().includes(kw))
        : all.slice();
      const dir = sortDir;
      filtered.sort((a, b) => {
        const av = String(a[sortKey] || "");
        const bv = String(b[sortKey] || "");
        return av.localeCompare(bv, "zh-Hans-CN") * dir || a.path.localeCompare(b.path) * dir;
      });
      return filtered;
    }

    function renderEndpoints() {
      const tbody = el("endpointTable").querySelector("tbody");
      tbody.textContent = "";
      const all = (report && report.endpoints) || [];
      const rows = visibleEndpoints();
      el("endpointCount").textContent = keyword.trim()
        ? " 共 " + all.length + " 个，筛出 " + rows.length + " 个"
        : " 共 " + all.length + " 个";
      el("endpointEmpty").classList.toggle("hidden", all.length > 0);
      el("endpointFilteredEmpty").classList.toggle("hidden", !(all.length > 0 && rows.length === 0));

      for (const row of rows) {
        const tr = document.createElement("tr");
        const name = document.createElement("td");
        if (row.status) {
          const status = document.createElement("span");
          status.className = "badge " + (STATUS_KIND[row.status] || "muted-badge");
          status.textContent = STATUS_LABEL[row.status] || row.status;
          status.style.marginRight = "6px";
          name.appendChild(status);
        }
        name.appendChild(document.createTextNode(row.name));
        tr.appendChild(name);

        const method = document.createElement("td");
        const methodSpan = document.createElement("span");
        methodSpan.className = "method " + (METHOD_CLASS[row.method] || "");
        methodSpan.textContent = row.method;
        method.appendChild(methodSpan);
        tr.appendChild(method);

        const path = document.createElement("td");
        path.className = "cell-path";
        path.textContent = row.path;
        tr.appendChild(path);

        const folder = document.createElement("td");
        folder.textContent = row.folder;
        tr.appendChild(folder);

        const file = document.createElement("td");
        const source = document.createElement("button");
        source.type = "button";
        source.className = "source-link";
        source.textContent = row.file;
        source.title = "打开源文件";
        source.addEventListener("click", () => vscode.postMessage({
          command: "openSource",
          fsPath: row.fsPath,
          startOffset: row.startOffset,
        }));
        file.appendChild(source);
        tr.appendChild(file);

        tbody.appendChild(tr);
      }

      for (const th of document.querySelectorAll("#endpointTable th.sortable")) {
        const existing = th.querySelector(".arrow");
        if (existing) { existing.remove(); }
        if (th.dataset.key === sortKey) {
          th.setAttribute("aria-sort", sortDir > 0 ? "ascending" : "descending");
          const arrow = document.createElement("span");
          arrow.className = "arrow";
          arrow.textContent = sortDir > 0 ? "▲" : "▼";
          th.appendChild(arrow);
        } else {
          th.setAttribute("aria-sort", "none");
        }
      }
    }

    function renderIssues() {
      const list = el("issueList");
      list.textContent = "";
      const items = [];
      for (const e of (report && report.errors) || []) { items.push({ text: e, error: true }); }
      for (const w of (report && report.warnings) || []) { items.push({ text: w, error: false }); }
      el("issueSection").classList.toggle("hidden", items.length === 0);
      setText("issueCount", items.length ? " 共 " + items.length + " 项" : "");
      for (const item of items) {
        const li = document.createElement("li");
        li.className = item.error ? "error" : "";
        li.textContent = item.text;
        list.appendChild(li);
      }
    }

    function render() {
      if (!report) { return; }
      setText("metaTarget", report.target);
      setText("metaScope", report.scope);
      setText("metaTime", report.finishedAt);
      setText("metaConflict", report.conflict);
      el("btnOpenProject").classList.toggle("hidden", !report.projectUrl);
      renderResultBanner();
      renderSummary();
      renderEndpoints();
      renderIssues();
    }

    function summaryTsv() {
      const lines = ["分类\t新增\t更新\t忽略\t失败\t合计"];
      for (const row of (report && report.summary) || []) {
        lines.push([row.category, row.created, row.updated, row.ignored, row.failed, row.total].join("\t"));
      }
      return lines.join("\\n");
    }

    function endpointTsv() {
      const lines = ["接口名称\t方法\t路径\t目录\t同步状态\t源文件"];
      for (const row of visibleEndpoints()) {
        lines.push([row.name, row.method, row.path, row.folder, STATUS_LABEL[row.status] || "", row.file].join("\t"));
      }
      return lines.join("\\n");
    }

    // 表格单元格转义:接口名/路径含 | 或换行会破坏 Markdown 表结构
    // 注意:此处位于 HTML 模板字符串内,反斜杠需双写(发出到 webview 的 JS 才是单斜杠)
    function mdCell(v) {
      return String(v == null ? "" : v).replace(/\\|/g, "\\\\|").replace(/[\\r\\n]+/g, " ");
    }

    function markdown() {
      if (!report) { return ""; }
      const lines = ["## 同步结果", "", "- 目标：" + report.target, "- 范围：" + report.scope, "- 时间：" + report.finishedAt, "- 冲突策略：" + report.conflict, ""];
      lines.push("| 分类 | 新增 | 更新 | 忽略 | 失败 | 合计 |", "| --- | ---: | ---: | ---: | ---: | ---: |");
      for (const row of report.summary) {
        lines.push("| " + mdCell(row.category) + " | " + row.created + " | " + row.updated + " | " + row.ignored + " | " + row.failed + " | " + row.total + " |");
      }
      lines.push("", "| 接口名称 | 方法 | 路径 | 目录 | 同步状态 |", "| --- | --- | --- | --- | --- |");
      for (const row of visibleEndpoints()) {
        lines.push("| " + mdCell(row.name) + " | " + mdCell(row.method) + " | " + mdCell(row.path) + " | " + mdCell(row.folder) + " | " + mdCell(STATUS_LABEL[row.status] || "") + " |");
      }
      if ((report.errors || []).length) {
        lines.push("", "**错误**");
        for (const e of report.errors) { lines.push("- " + e); }
      }
      const issues = (report.warnings || []);
      if (issues.length) {
        lines.push("", "**警告**");
        for (const w of issues) { lines.push("- " + w); }
      }
      return lines.join("\\n");
    }

    function copy(text, label) {
      vscode.postMessage({ command: "copy", text: text, label: label });
    }

    function showHint(label) {
      const hint = el(label === "汇总" ? "summaryCopyHint" : "endpointCopyHint");
      hint.classList.add("show");
      setTimeout(() => hint.classList.remove("show"), 1500);
    }

    el("filter").addEventListener("input", (event) => {
      keyword = event.target.value || "";
      renderEndpoints();
    });

    function applySort(target) {
      const th = target.closest("th.sortable");
      if (!th) { return; }
      const key = th.dataset.key;
      if (sortKey === key) {
        sortDir = -sortDir;
      } else {
        sortKey = key;
        sortDir = 1;
      }
      renderEndpoints();
    }

    document.querySelector("#endpointTable thead").addEventListener("click", (event) => {
      applySort(event.target);
    });
    document.querySelector("#endpointTable thead").addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        applySort(event.target);
      }
    });

    el("btnCopySummary").addEventListener("click", () => copy(summaryTsv(), "汇总"));
    el("btnCopyEndpoints").addEventListener("click", () => copy(endpointTsv(), "接口清单"));
    el("btnCopyMarkdown").addEventListener("click", () => copy(markdown(), "Markdown"));
    el("btnOpenProject").addEventListener("click", () => vscode.postMessage({ command: "openProject" }));

    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "render") {
        report = message.report;
        render();
      } else if (message.command === "copied") {
        showHint(message.label);
      }
    });

    if (!readySent) {
      readySent = true;
      vscode.postMessage({ command: "ready" });
    }
  </script>
</body>
</html>`;
  }
}

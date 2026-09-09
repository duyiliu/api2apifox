import * as vscode from "vscode";
import { getToken, setToken } from "../config/secret";
import { getSettings, ApifoxSettings } from "../config/settings";
import { ApifoxClient, ApifoxTeam, ApifoxProject } from "../apifox/client";
import { errorMessage, TOKEN_HELP_URL } from "../apifox/uploader";

export class SettingsPanel {
  public static currentPanel: SettingsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _secrets: vscode.SecretStorage;
  private _disposables: vscode.Disposable[] = [];
  private readonly _onSettingsChanged?: () => void;

  public static createOrShow(
    extensionUri: vscode.Uri,
    secrets: vscode.SecretStorage,
    onSettingsChanged?: () => void
  ): SettingsPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (SettingsPanel.currentPanel) {
      SettingsPanel.currentPanel._panel.reveal(column);
      SettingsPanel.currentPanel._sendInitData();
      return SettingsPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      "apifoxHelperSettings",
      "ApiGen for Apifox 设置中心",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri, secrets, onSettingsChanged);
    return SettingsPanel.currentPanel;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    private readonly _extensionUri: vscode.Uri,
    secrets: vscode.SecretStorage,
    onSettingsChanged?: () => void
  ) {
    this._panel = panel;
    this._secrets = secrets;
    this._onSettingsChanged = onSettingsChanged;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "ready":
            await this._sendInitData();
            break;
          case "testConnection":
            await this._handleTestConnection(message.token, message.apiBaseUrl);
            break;
          case "fetchProjects":
            await this._handleFetchProjects(message.token, message.apiBaseUrl, message.teamId);
            break;
          case "save":
            await this._handleSave(message.data);
            break;
          case "openHelp":
            await vscode.env.openExternal(vscode.Uri.parse(TOKEN_HELP_URL));
            break;
          case "openAdvancedSettings":
            await vscode.commands.executeCommand("workbench.action.openSettings", "apifoxHelper");
            break;
        }
      },
      null,
      this._disposables
    );
  }

  private async _sendInitData(): Promise<void> {
    const settings = getSettings();
    const token = (await getToken(this._secrets)) || "";
    this._panel.webview.postMessage({
      command: "init",
      data: {
        token,
        settings,
      },
    });
  }

  private async _handleTestConnection(token: string, apiBaseUrl: string): Promise<void> {
    const cleanedToken = (token || "").trim();
    const cleanedUrl = (apiBaseUrl || "https://api.apifox.com").trim().replace(/\/+$/, "");

    if (!cleanedToken) {
      this._panel.webview.postMessage({
        command: "testResult",
        ok: false,
        message: "请先输入 API 访问令牌 (Access Token)",
      });
      return;
    }

    try {
      const client = new ApifoxClient(cleanedUrl, cleanedToken);
      const teams = await client.listTeams();
      this._panel.webview.postMessage({
        command: "testResult",
        ok: true,
        message: `连接成功！已获取到 ${teams.length} 个团队`,
        teams,
      });
    } catch (err) {
      this._panel.webview.postMessage({
        command: "testResult",
        ok: false,
        message: errorMessage(err),
      });
    }
  }

  private async _handleFetchProjects(token: string, apiBaseUrl: string, teamId: number): Promise<void> {
    const cleanedToken = (token || "").trim();
    const cleanedUrl = (apiBaseUrl || "https://api.apifox.com").trim().replace(/\/+$/, "");
    if (!cleanedToken || !teamId) {
      return;
    }
    try {
      const client = new ApifoxClient(cleanedUrl, cleanedToken);
      const projects = await client.listTeamProjects(teamId);
      this._panel.webview.postMessage({
        command: "projectsResult",
        ok: true,
        teamId,
        projects,
      });
    } catch (err) {
      this._panel.webview.postMessage({
        command: "projectsResult",
        ok: false,
        teamId,
        message: errorMessage(err),
      });
    }
  }

  private async _handleSave(formData: {
    token: string;
    apiBaseUrl: string;
    teamName: string;
    projectId: number;
    projectName: string;
    endpointConflictBehavior: string;
    schemaConflictBehavior: string;
    folderNameSource: "tag" | "controller";
    pageTypeStyle: "mybatis-plus" | "spring-data";
    rootFolderName: string;
    schemaFolderId: number;
    enumFieldDoc: boolean;
  }): Promise<void> {
    try {
      // 1. 保存 Token
      const cleanedToken = (formData.token || "").trim();
      await setToken(this._secrets, cleanedToken || undefined);

      // 2. 保存 VS Code 配置项
      const cfg = vscode.workspace.getConfiguration("apifoxHelper");
      const target = vscode.workspace.workspaceFolders
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;

      await cfg.update("apiBaseUrl", formData.apiBaseUrl?.trim() || "https://api.apifox.com", target);
      await cfg.update("teamName", formData.teamName || "", target);
      await cfg.update("projectId", Number(formData.projectId) || 0, target);
      await cfg.update("projectName", formData.projectName || "", target);
      await cfg.update("endpointConflictBehavior", formData.endpointConflictBehavior, target);
      await cfg.update("schemaConflictBehavior", formData.schemaConflictBehavior, target);
      await cfg.update("folderNameSource", formData.folderNameSource, target);
      await cfg.update("pageTypeStyle", formData.pageTypeStyle, target);
      await cfg.update("rootFolderName", formData.rootFolderName?.trim() || "", target);
      await cfg.update("schemaFolderId", Number(formData.schemaFolderId) || 0, target);
      await cfg.update("helperProperties.enumFieldDoc", Boolean(formData.enumFieldDoc), target);

      this._panel.webview.postMessage({
        command: "saveResult",
        ok: true,
        message: "设置已成功保存并生效！",
      });

      vscode.window.showInformationMessage("ApiGen for Apifox 配置已成功保存！");
      this._onSettingsChanged?.();
    } catch (err) {
      this._panel.webview.postMessage({
        command: "saveResult",
        ok: false,
        message: `保存失败: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  public dispose(): void {
    SettingsPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'unsafe-inline'; img-src ${webview.cspSource} data:;">
  <title>ApiGen for Apifox 设置中心</title>
  <style>
    :root {
      --card-bg: var(--vscode-editor-background);
      --border-color: var(--vscode-widget-border, var(--vscode-sideBar-border, rgba(255, 255, 255, 0.1)));
      --input-bg: var(--vscode-input-background);
      --input-fg: var(--vscode-input-foreground);
      --input-border: var(--vscode-input-border, rgba(255, 255, 255, 0.15));
      --btn-bg: var(--vscode-button-background);
      --btn-fg: var(--vscode-button-foreground);
      --btn-hover: var(--vscode-button-hoverBackground);
      --btn-sec-bg: var(--vscode-button-secondaryBackground, rgba(255, 255, 255, 0.08));
      --btn-sec-fg: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
      --btn-sec-hover: var(--vscode-button-secondaryHoverBackground, rgba(255, 255, 255, 0.15));
      --success-bg: rgba(73, 179, 107, 0.15);
      --success-border: #49b36b;
      --error-bg: rgba(241, 76, 76, 0.15);
      --error-border: #f14c4c;
      --info-color: var(--vscode-descriptionForeground);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      line-height: 1.6;
      padding: 24px 32px 60px 32px;
      max-width: 860px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .header-title {
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-tag {
      font-size: 11px;
      background: var(--btn-sec-bg);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 2px 8px;
      color: var(--info-color);
    }
    .section {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--vscode-foreground);
    }
    .form-group {
      margin-bottom: 18px;
    }
    .form-group:last-child {
      margin-bottom: 0;
    }
    .form-label {
      display: block;
      font-weight: 500;
      margin-bottom: 6px;
      color: var(--vscode-foreground);
    }
    .form-desc {
      font-size: 12px;
      color: var(--info-color);
      margin-top: 4px;
    }
    .input-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    input[type="text"], input[type="password"], input[type="number"], select {
      width: 100%;
      background: var(--input-bg);
      color: var(--input-fg);
      border: 1px solid var(--input-border);
      border-radius: 4px;
      padding: 7px 10px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, select:focus {
      border-color: var(--vscode-focusBorder);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      background: var(--btn-bg);
      color: var(--btn-fg);
      white-space: nowrap;
      transition: background-color 0.2s, opacity 0.2s;
    }
    .btn:hover:not(:disabled) {
      background: var(--btn-hover);
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: var(--btn-sec-bg);
      color: var(--btn-sec-fg);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover:not(:disabled) {
      background: var(--btn-sec-hover);
    }
    .btn-icon {
      padding: 7px 10px;
    }
    .status-box {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 12px;
      display: none;
      align-items: center;
      gap: 8px;
    }
    .status-box.show {
      display: flex;
    }
    .status-success {
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      color: var(--vscode-foreground);
    }
    .status-error {
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      color: var(--vscode-foreground);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .link {
      color: var(--vscode-textLink-foreground);
      text-decoration: none;
      cursor: pointer;
    }
    .link:hover {
      text-decoration: underline;
    }
    .footer-bar {
      position: sticky;
      bottom: 0;
      background: var(--card-bg);
      border-top: 1px solid var(--border-color);
      padding: 16px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 24px;
      z-index: 10;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      margin-top: 6px;
    }
    .checkbox-row input {
      cursor: pointer;
    }
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">
      <span>🚀 ApiGen for Apifox 配置中心</span>
      <span class="header-tag">Spring Boot ⇄ Apifox</span>
    </div>
    <button class="btn btn-secondary" id="btnHelp">📖 查看 Token 帮助</button>
  </div>

  <!-- 账号与网络服务 -->
  <div class="section">
    <div class="section-title">🔑 账号凭据与 API 网关</div>
    
    <div class="form-group">
      <label class="form-label">API 访问令牌 (Personal Access Token)</label>
      <div class="input-row">
        <input type="password" id="inputToken" placeholder="粘贴 APS-xxxxxxxxxxxx" autocomplete="off" />
        <button class="btn btn-secondary btn-icon" id="btnToggleToken" title="显示/隐藏密文">👁</button>
        <button class="btn btn-secondary" id="btnPasteToken">📋 粘贴</button>
      </div>
      <div class="form-desc">
        在 Apifox 客户端「头像 → 账号设置 → API 访问令牌」中生成（建议设置较长有效期）。
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Apifox 开放 API 服务地址 (Base URL)</label>
      <div class="input-row">
        <input type="text" id="inputBaseUrl" value="https://api.apifox.com" placeholder="https://api.apifox.com" />
        <button class="btn btn-secondary" id="btnResetBaseUrl">恢复默认公网</button>
      </div>
      <div class="form-desc">默认公网为 <code>https://api.apifox.com</code>；企业私有化部署请填写私有云 API 网关地址。</div>
    </div>

    <div style="margin-top: 14px;">
      <button class="btn btn-secondary" id="btnTestConn">⚡ 测试连接与验证令牌</button>
    </div>

    <div class="status-box" id="testStatusBox">
      <span id="testStatusIcon"></span>
      <span id="testStatusMsg"></span>
    </div>
  </div>

  <!-- 团队与项目绑定 -->
  <div class="section">
    <div class="section-title">📦 绑定 Apifox 团队与项目</div>
    
    <div class="grid-2">
      <div class="form-group">
        <label class="form-label">所属团队 (Team)</label>
        <div class="input-row">
          <select id="selectTeam">
            <option value="">-- 请先点击测试连接或选择团队 --</option>
          </select>
          <button class="btn btn-secondary btn-icon" id="btnRefreshTeams" title="拉取团队列表">🔄</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">绑定项目 (Project)</label>
        <select id="selectProject">
          <option value="0">-- 请先选择团队 --</option>
        </select>
      </div>
    </div>
    <div class="form-desc" id="currentBindingDesc">当前未选择项目</div>
  </div>

  <!-- 同步策略与规则 -->
  <div class="section">
    <div class="section-title">⚙ 同步策略与解析偏好</div>

    <div class="grid-2">
      <div class="form-group">
        <label class="form-label">接口冲突处理 (Endpoint Overwrite)</label>
        <select id="selectEndpointConflict">
          <option value="OVERWRITE_EXISTING">覆盖已有接口 (推荐)</option>
          <option value="AUTO_MERGE">自动合并</option>
          <option value="KEEP_EXISTING">保留现有 (跳过已存在)</option>
          <option value="CREATE_NEW">创建新接口</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">数据模型冲突处理 (Schema Overwrite)</label>
        <select id="selectSchemaConflict">
          <option value="OVERWRITE_EXISTING">覆盖已有数据模型 (推荐)</option>
          <option value="AUTO_MERGE">自动合并</option>
          <option value="KEEP_EXISTING">保留现有 (跳过已存在)</option>
          <option value="CREATE_NEW">创建新数据模型</option>
        </select>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 14px;">
      <div class="form-group">
        <label class="form-label">接口目录命名依据 (Folder Name Source)</label>
        <select id="selectFolderSource">
          <option value="tag">优先使用 @Tag / @Api 注解名称</option>
          <option value="controller">使用 Controller 类名</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">分页模型展开风格 (Page Packaging)</label>
        <select id="selectPageStyle">
          <option value="mybatis-plus">MyBatis-Plus (records, total, size, current)</option>
          <option value="spring-data">Spring Data (content, totalElements, size)</option>
        </select>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 14px;">
      <div class="form-group">
        <label class="form-label">接口全局父目录 (可选)</label>
        <input type="text" id="inputRootFolder" placeholder="例如：儿童青少年健康 / 儿保模块（留空则不加父目录）" />
      </div>

      <div class="form-group">
        <label class="form-label">数据模型目标目录 ID (可选数字 ID)</label>
        <input type="number" id="inputSchemaFolderId" placeholder="可在 Apifox 客户端目录右键复制数字 ID" />
      </div>
    </div>

    <div class="form-group" style="margin-top: 14px;">
      <label class="checkbox-row">
        <input type="checkbox" id="checkEnumDoc" />
        <span>自动在枚举字段描述后追加「(枚举类: 类名)」</span>
      </label>
    </div>
  </div>

  <!-- 底部固定保存栏 -->
  <div class="footer-bar">
    <div style="display: flex; align-items: center; gap: 14px;">
      <div id="saveFeedback" style="font-size: 13px; font-weight: 500;"></div>
      <a class="link" id="btnAdvancedSettings" style="font-size: 12px; white-space: nowrap;">完整高级设置 (扫描范围 / 依赖 Jar / 规则)...</a>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn btn-secondary" id="btnRestoreDefaults">重置默认策略</button>
      <button class="btn" id="btnSave">💾 保存配置</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // 状态与缓存
    let teamsCache = [];
    let projectsCache = new Map(); // teamId -> projects[]
    let currentConfig = null;

    // DOM 元素
    const inputToken = document.getElementById('inputToken');
    const btnToggleToken = document.getElementById('btnToggleToken');
    const btnPasteToken = document.getElementById('btnPasteToken');
    const inputBaseUrl = document.getElementById('inputBaseUrl');
    const btnResetBaseUrl = document.getElementById('btnResetBaseUrl');
    const btnTestConn = document.getElementById('btnTestConn');
    const testStatusBox = document.getElementById('testStatusBox');
    const testStatusIcon = document.getElementById('testStatusIcon');
    const testStatusMsg = document.getElementById('testStatusMsg');
    const selectTeam = document.getElementById('selectTeam');
    const btnRefreshTeams = document.getElementById('btnRefreshTeams');
    const selectProject = document.getElementById('selectProject');
    const currentBindingDesc = document.getElementById('currentBindingDesc');
    const selectEndpointConflict = document.getElementById('selectEndpointConflict');
    const selectSchemaConflict = document.getElementById('selectSchemaConflict');
    const selectFolderSource = document.getElementById('selectFolderSource');
    const selectPageStyle = document.getElementById('selectPageStyle');
    const inputRootFolder = document.getElementById('inputRootFolder');
    const inputSchemaFolderId = document.getElementById('inputSchemaFolderId');
    const checkEnumDoc = document.getElementById('checkEnumDoc');
    const btnSave = document.getElementById('btnSave');
    const btnRestoreDefaults = document.getElementById('btnRestoreDefaults');
    const btnHelp = document.getElementById('btnHelp');
    const btnAdvancedSettings = document.getElementById('btnAdvancedSettings');
    const saveFeedback = document.getElementById('saveFeedback');

    // 密码显隐
    btnToggleToken.addEventListener('click', () => {
      if (inputToken.type === 'password') {
        inputToken.type = 'text';
        btnToggleToken.textContent = '🔒';
      } else {
        inputToken.type = 'password';
        btnToggleToken.textContent = '👁';
      }
    });

    // 粘贴
    btnPasteToken.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          inputToken.value = text.trim();
          showStatus('testStatusBox', 'info', '已从剪贴板粘贴令牌');
        }
      } catch {
        inputToken.focus();
      }
    });

    // 重置 BaseUrl
    btnResetBaseUrl.addEventListener('click', () => {
      inputBaseUrl.value = 'https://api.apifox.com';
    });

    // 查看帮助
    btnHelp.addEventListener('click', () => {
      vscode.postMessage({ command: 'openHelp' });
    });

    // 完整高级设置(原生设置页)
    btnAdvancedSettings.addEventListener('click', () => {
      vscode.postMessage({ command: 'openAdvancedSettings' });
    });

    // 测试连接
    btnTestConn.addEventListener('click', () => {
      const token = inputToken.value.trim();
      const baseUrl = inputBaseUrl.value.trim();
      if (!token) {
        showStatus('testStatusBox', 'error', '请先填写 API 访问令牌');
        inputToken.focus();
        return;
      }
      setLoading(btnTestConn, true, '正在连接 Apifox...');
      showStatus('testStatusBox', 'info', '正在连接 Apifox 开放 API...');
      vscode.postMessage({
        command: 'testConnection',
        token,
        apiBaseUrl: baseUrl,
      });
    });

    btnRefreshTeams.addEventListener('click', () => {
      btnTestConn.click();
    });

    // 团队选择变化 -> 拉取项目
    selectTeam.addEventListener('change', () => {
      const teamId = Number(selectTeam.value);
      if (!teamId) {
        selectProject.innerHTML = '<option value="0">-- 请先选择团队 --</option>';
        updateBindingDesc();
        return;
      }
      const cached = projectsCache.get(teamId);
      if (cached) {
        populateProjects(cached);
      } else {
        selectProject.innerHTML = '<option value="0">正在加载项目列表...</option>';
        vscode.postMessage({
          command: 'fetchProjects',
          token: inputToken.value.trim(),
          apiBaseUrl: inputBaseUrl.value.trim(),
          teamId,
        });
      }
      updateBindingDesc();
    });

    selectProject.addEventListener('change', () => {
      updateBindingDesc();
    });

    function updateBindingDesc() {
      const teamOpt = selectTeam.selectedOptions[0];
      const projOpt = selectProject.selectedOptions[0];
      const teamName = teamOpt && teamOpt.value ? teamOpt.textContent : '';
      const projId = Number(selectProject.value) || 0;
      const projName = projOpt && projId > 0 ? projOpt.textContent : '';

      if (projId > 0) {
        currentBindingDesc.innerHTML = '✅ 当前已选: <strong>' + projName + '</strong> (ID: ' + projId + ') · 所属团队: ' + teamName;
      } else {
        currentBindingDesc.textContent = '当前未选择有效项目';
      }
    }

    function populateTeams(teams, selectedTeamName) {
      teamsCache = teams;
      selectTeam.innerHTML = '<option value="">-- 请选择团队 --</option>';
      let foundIndex = -1;
      teams.forEach((t, i) => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name + ' (ID: ' + t.id + ')';
        if (selectedTeamName && t.name === selectedTeamName) {
          foundIndex = i;
          opt.selected = true;
        }
        selectTeam.appendChild(opt);
      });
      if (foundIndex >= 0) {
        selectTeam.dispatchEvent(new Event('change'));
      }
    }

    function populateProjects(projects, preselectedProjectId) {
      const teamId = Number(selectTeam.value);
      if (teamId) {
        projectsCache.set(teamId, projects);
      }
      selectProject.innerHTML = '<option value="0">-- 请选择项目 --</option>';
      projects.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name + ' (ID: ' + p.id + ')';
        if (preselectedProjectId && p.id === preselectedProjectId) {
          opt.selected = true;
        }
        selectProject.appendChild(opt);
      });
      updateBindingDesc();
    }

    // 保存
    btnSave.addEventListener('click', () => {
      const teamOpt = selectTeam.selectedOptions[0];
      const projOpt = selectProject.selectedOptions[0];
      const teamName = teamOpt && teamOpt.value ? teamOpt.textContent.replace(/ \\(ID: \\d+\\)$/, '') : (currentConfig?.settings?.teamName || '');
      const projectId = Number(selectProject.value) || 0;
      let projectName = '';
      if (projOpt && projectId > 0) {
        projectName = projOpt.textContent.replace(/ \\(ID: \\d+\\)$/, '');
      } else if (currentConfig?.settings?.projectId === projectId) {
        projectName = currentConfig.settings.projectName || '';
      }

      const formData = {
        token: inputToken.value.trim(),
        apiBaseUrl: inputBaseUrl.value.trim(),
        teamName,
        projectId,
        projectName,
        endpointConflictBehavior: selectEndpointConflict.value,
        schemaConflictBehavior: selectSchemaConflict.value,
        folderNameSource: selectFolderSource.value,
        pageTypeStyle: selectPageStyle.value,
        rootFolderName: inputRootFolder.value.trim(),
        schemaFolderId: Number(inputSchemaFolderId.value) || 0,
        enumFieldDoc: checkEnumDoc.checked,
      };

      // 同步到本地缓存,便于保存后自动验证时按新选择预选团队/项目
      if (currentConfig) {
        currentConfig.settings = { ...currentConfig.settings, teamName, projectName, projectId };
      }

      setLoading(btnSave, true, '正在保存...');
      vscode.postMessage({ command: 'save', data: formData });
    });

    btnRestoreDefaults.addEventListener('click', () => {
      selectEndpointConflict.value = 'OVERWRITE_EXISTING';
      selectSchemaConflict.value = 'OVERWRITE_EXISTING';
      selectFolderSource.value = 'tag';
      selectPageStyle.value = 'mybatis-plus';
      inputRootFolder.value = '';
      inputSchemaFolderId.value = '';
      checkEnumDoc.checked = false;
      saveFeedback.style.color = 'var(--info-color)';
      saveFeedback.textContent = '策略选项已重置为默认值，点击「保存配置」后生效。';
    });

    function showStatus(boxId, type, msg) {
      const box = document.getElementById(boxId);
      box.className = 'status-box show ' + (type === 'error' ? 'status-error' : 'status-success');
      testStatusIcon.textContent = type === 'error' ? '❌' : '✅';
      testStatusMsg.textContent = msg;
    }

    function setLoading(btn, loading, text) {
      btn.disabled = loading;
      if (loading) {
        btn.innerHTML = '<span class="spinner"></span> ' + text;
      } else {
        btn.textContent = text;
      }
    }

    // 接收 Extension 消息
    window.addEventListener('message', (event) => {
      const msg = event.data;
      switch (msg.command) {
        case 'init': {
          currentConfig = msg.data;
          const s = msg.data.settings || {};
          inputToken.value = msg.data.token || '';
          inputBaseUrl.value = s.apiBaseUrl || 'https://api.apifox.com';
          selectEndpointConflict.value = s.endpointConflictBehavior || 'OVERWRITE_EXISTING';
          selectSchemaConflict.value = s.schemaConflictBehavior || 'OVERWRITE_EXISTING';
          selectFolderSource.value = s.folderNameSource || 'tag';
          selectPageStyle.value = s.pageTypeStyle || 'mybatis-plus';
          inputRootFolder.value = s.rootFolderName || '';
          inputSchemaFolderId.value = s.schemaFolderId || '';
          checkEnumDoc.checked = Boolean(s.enumFieldDoc);

          if (s.teamName || s.projectId) {
            selectTeam.innerHTML = '<option value="temp" selected>' + (s.teamName || '已选团队') + '</option>';
            selectProject.innerHTML = '<option value="' + (s.projectId || 0) + '" selected>' + (s.projectName || ('项目 ' + s.projectId)) + (s.projectId ? ' (ID: ' + s.projectId + ')' : '') + '</option>';
            updateBindingDesc();
          }

          // 如果已有 Token，自动静默测试连接并拉取团队
          if (msg.data.token) {
            vscode.postMessage({
              command: 'testConnection',
              token: msg.data.token,
              apiBaseUrl: s.apiBaseUrl || 'https://api.apifox.com',
            });
          }
          break;
        }
        case 'testResult': {
          setLoading(btnTestConn, false, '⚡ 测试连接与验证令牌');
          if (msg.ok) {
            showStatus('testStatusBox', 'success', msg.message);
            if (msg.teams && msg.teams.length) {
              populateTeams(msg.teams, currentConfig?.settings?.teamName);
            }
          } else {
            showStatus('testStatusBox', 'error', '连接失败: ' + msg.message);
          }
          break;
        }
        case 'projectsResult': {
          if (msg.ok) {
            populateProjects(msg.projects, currentConfig?.settings?.projectId);
          } else {
            selectProject.innerHTML = '<option value="0">加载项目失败: ' + msg.message + '</option>';
          }
          break;
        }
        case 'saveResult': {
          setLoading(btnSave, false, '💾 保存配置');
          if (msg.ok) {
            saveFeedback.style.color = '#49b36b';
            saveFeedback.textContent = '✅ ' + msg.message;
            setTimeout(() => { saveFeedback.textContent = ''; }, 4000);
            // 令牌非空时保存后自动验证连接,并刷新团队/项目下拉(按新绑定预选)
            if (inputToken.value.trim()) {
              showStatus('testStatusBox', 'success', '已保存，正在自动验证连接...');
              vscode.postMessage({
                command: 'testConnection',
                token: inputToken.value.trim(),
                apiBaseUrl: inputBaseUrl.value.trim(),
              });
            }
          } else {
            saveFeedback.style.color = '#f14c4c';
            saveFeedback.textContent = '❌ ' + msg.message;
          }
          break;
        }
      }
    });

    // 页面就绪
    vscode.postMessage({ command: 'ready' });
  </script>
</body>
</html>`;
  }
}

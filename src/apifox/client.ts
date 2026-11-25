import { EndpointInfo } from "../java/model";

/** Apifox 开放 API 客户端(纯 HTTP,不依赖 vscode) */
export interface ApifoxTeam {
  id: number;
  name: string;
}

export interface ApifoxProject {
  id: number;
  name: string;
  /** 所属团队名(便于在同名项目间区分) */
  teamName?: string;
}

export interface ImportOptions {
  targetEndpointFolderId?: number;
  targetSchemaFolderId?: number;
  endpointOverwriteBehavior?: "OVERWRITE_EXISTING" | "AUTO_MERGE" | "KEEP_EXISTING" | "CREATE_NEW";
  schemaOverwriteBehavior?: "OVERWRITE_EXISTING" | "AUTO_MERGE" | "KEEP_EXISTING" | "CREATE_NEW";
  deleteUnmatchedResources?: boolean;
  /** 覆盖已存在的接口时,是否同步更新其所在目录(对应 Apifox 导入的「更新接口所在目录」) */
  updateFolderOfChangedEndpoint?: boolean;
}

/**
 * 导入结果里的单条接口映射。
 * 官方 import-openapi 目前只回传 counters/errors，不返回接口 ID 与 Mock 地址；
 * 这里按宽松口径解析，Apifox 一旦补上该字段即可直接产出接口级链接。
 */
export interface ImportEndpointResult {
  /** Apifox 接口 ID（用于拼接口文档页链接） */
  id?: number;
  method?: string;
  path?: string;
  operationId?: string;
  /** Apifox 直接给出的接口文档页地址（优先于按 ID 推导） */
  url?: string;
  /** Apifox 直接给出的 Mock 地址 */
  mockUrl?: string;
}

export interface ImportResult {
  counters: Record<string, number>;
  errors: { message?: string; code?: string }[];
  /** 逐接口映射；Apifox 未返回时不出现该键（保持与旧响应一致的形状） */
  endpoints?: ImportEndpointResult[];
}

export class ApifoxApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export const APIFOX_API_VERSION = "2024-03-28";

export class ApifoxClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly apiVersion: string = APIFOX_API_VERSION,
    /** 请求超时毫秒数;导入大文档可能偏慢,默认给足 60s */
    private readonly timeoutMs: number = 60_000,
    /** CLI 可传入外部取消信号;扩展调用方缺省时仅受 timeout 控制 */
    private readonly signal?: AbortSignal
  ) {}

  /**
   * 团队列表。GET /v1/teams(未在开放 API 文档中列出,但为官方客户端在用的有效端点;
   * 旧版 GET /v1/projects 已被 Apifox 下线,命中不存在的路由会 302 跳转帮助页)。
   */
  async listTeams(): Promise<ApifoxTeam[]> {
    const body = await this.request<unknown>("GET", "/v1/teams");
    return extractList<ApifoxTeam>(body, (item) => typeof item?.id === "number" && typeof item?.name === "string");
  }

  /**
   * 指定团队下的项目列表。GET /v1/teams/{teamId}/projects。
   */
  async listTeamProjects(teamId: number): Promise<ApifoxProject[]> {
    const body = await this.request<unknown>("GET", `/v1/teams/${teamId}/projects`);
    return extractList<ApifoxProject>(body, (item) => typeof item?.id === "number" && typeof item?.name === "string");
  }

  /**
   * 当前令牌可见的全部项目:先取团队,再逐团队取项目合并。
   * 单个团队拉取失败不影响其余团队(仅跳过并在结果中缺失);
   * 全部失败时抛出首个错误,避免把接口异常误判为"令牌下没有项目"。
   */
  async listProjects(): Promise<ApifoxProject[]> {
    const teams = await this.listTeams();
    let failed = 0;
    let firstError: unknown;
    const results = await Promise.all(
      teams.map(async (team) => {
        try {
          const projects = await this.listTeamProjects(team.id);
          return projects.map((p) => ({ ...p, teamName: team.name }));
        } catch (err) {
          failed++;
          firstError ??= err;
          return [] as ApifoxProject[];
        }
      })
    );
    const projects = results.flat();
    if (!projects.length && failed > 0 && teams.length > 0) {
      throw firstError instanceof Error
        ? firstError
        : new ApifoxApiError(`${failed} 个团队的项目列表拉取失败`, 0);
    }
    return projects;
  }

  /**
   * 导入 OpenAPI 数据。input 为 OpenAPI JSON 序列化字符串。
   * 文档:https://apifox-openapi.apifox.cn 「导入 OpenAPI/Swagger 格式数据」
   */
  async importOpenapi(projectId: number, openapiJson: string, options: ImportOptions = {}): Promise<ImportResult> {
    const body = await this.request<{
      counters?: Record<string, number>;
      errors?: { message?: string; code?: string }[];
      endpoints?: unknown;
    }>("POST", `/v1/projects/${projectId}/import-openapi`, { input: openapiJson, options });
    const result: ImportResult = {
      counters: body?.counters ?? {},
      errors: body?.errors ?? [],
    };
    const endpoints = extractImportEndpoints(body?.endpoints);
    if (endpoints.length) {
      result.endpoints = endpoints;
    }
    return result;
  }

  private async request<T>(method: string, path: string, json?: unknown): Promise<T> {
    const url = this.baseUrl.replace(/\/+$/, "") + path;
    let res: Response;
    let text: string;
    try {
      res = await fetch(url, {
        method,
        headers: {
          "X-Apifox-Api-Version": this.apiVersion,
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: json === undefined ? undefined : JSON.stringify(json),
        signal: combineAbortSignals(
          this.signal ? [this.signal, AbortSignal.timeout(this.timeoutMs)] : [AbortSignal.timeout(this.timeoutMs)]
        ),
      });
      // Fetch resolves once headers arrive; body consumption can still time out or fail.
      // Keep it in the same mapping path so CLI callers receive REQUEST_TIMEOUT/NETWORK_FAILED.
      text = await res.text();
    } catch (err) {
      if (this.signal?.aborted) {
        const cancelled = new Error("操作已取消");
        cancelled.name = "AbortError";
        throw cancelled;
      }
      if (isAbortError(err)) {
        throw new ApifoxApiError(`请求超时(${this.timeoutMs}ms):${url}`, 0);
      }
      throw new ApifoxApiError(formatNetworkFailure(url, err), 0);
    }

    // Apifox 网关对不存在的路由返回 302 跳转帮助页,fetch 跟随后是 200 HTML,会造成“假成功”;
    // 显式识别重定向,给出可定位的错误而不是静默空结果。
    if (res.redirected) {
      throw new ApifoxApiError(
        `请求被重定向到 ${res.url}(原路由可能已被 Apifox 下线或调整),请检查 apiBaseUrl 与插件版本`,
        res.status
      );
    }

    let payload: { code?: number | string; message?: string; data?: unknown } | undefined;
    try {
      payload = text ? JSON.parse(text) : undefined;
    } catch {
      // 非 JSON 响应
    }

    if (!res.ok) {
      throw new ApifoxApiError(humanizeError(res.status, payload), res.status);
    }
    if (payload && typeof payload.code === "number" && payload.code !== 0) {
      throw new ApifoxApiError(humanizeError(res.status, payload), res.status);
    }
    // 部分网关把逐接口映射放在 data 同级；数组响应（如 listTeams）必须保持原形状
    const unwrapped = (payload?.data ?? payload) as T;
    const outer = (payload as { endpoints?: unknown } | undefined)?.endpoints;
    const obj = typeof unwrapped === "object" && unwrapped !== null && !Array.isArray(unwrapped);
    if (!outer || !obj || (unwrapped as { endpoints?: unknown }).endpoints !== undefined) return unwrapped;
    return { ...(unwrapped as object), endpoints: outer } as T;
  }
}

/** Merge signals while preserving the Node.js >=20 CLI contract on versions before AbortSignal.any(). */
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(signals);
  }

  const controller = new AbortController();
  const listeners: { signal: AbortSignal; listener: () => void }[] = [];
  let settled = false;
  const cleanup = () => {
    for (const { signal, listener } of listeners) {
      signal.removeEventListener("abort", listener);
    }
    listeners.length = 0;
  };
  const abortFrom = (source: AbortSignal) => {
    if (settled) {
      return;
    }
    settled = true;
    cleanup();
    controller.abort(source.reason);
  };

  for (const signal of signals) {
    if (signal.aborted) {
      abortFrom(signal);
      break;
    }
    const listener = () => abortFrom(signal);
    listeners.push({ signal, listener });
    signal.addEventListener("abort", listener, { once: true });
  }
  return controller.signal;
}

function humanizeError(status: number, payload?: { message?: string; code?: number | string }): string {
  if (status === 401) {
    return "访问令牌无效或已过期(401),请用「api2apifox: 设置访问令牌」重新配置";
  }
  if (status === 403) {
    return "令牌权限不足或他人正在导入(403),请稍后重试";
  }
  if (status === 404) {
    return "接口或项目不存在(404),请检查项目 ID 与 API 地址";
  }
  const msg = payload?.message;
  return `Apifox 开放 API 请求失败(${status})${msg ? `: ${msg}` : ""}`;
}

/** 兼容 data 为数组或 {items:[]} 等形态 */
function extractList<T>(body: unknown, valid: (item: any) => boolean): T[] {
  const arr = Array.isArray(body) ? body : Array.isArray((body as { items?: unknown[] })?.items) ? (body as { items: unknown[] }).items : [];
  return arr.filter(valid) as T[];
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readId(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

/** 逐接口映射的宽松解析：字段别名依次尝试，完全无信息的条目丢弃（仅按 ID 也能给链接）。 */
export function extractImportEndpoints(body: unknown): ImportEndpointResult[] {
  const holder = body as { items?: unknown[]; endpoints?: unknown[] } | undefined;
  const arr =
    (Array.isArray(body) ? body : undefined) ??
    (Array.isArray(holder?.items) ? holder?.items : undefined) ??
    (Array.isArray(holder?.endpoints) ? holder?.endpoints : undefined) ??
    [];
  const items: ImportEndpointResult[] = [];
  for (const raw of arr) {
    if (!isRecord(raw)) continue;
    const id = readId(raw.id) ?? readId(raw.endpointId);
    const method = readString(raw.method)?.toUpperCase();
    const path = readString(raw.path);
    const operationId = readString(raw.operationId) ?? readString(raw.operationID);
    const url = readString(raw.url) ?? readString(raw.apifoxUrl);
    const mockUrl = readString(raw.mockUrl) ?? readString(raw.mockURL);
    if (id === undefined && !method && !path && !operationId && !url) continue;
    items.push({ id, method, path, operationId, url, mockUrl });
  }
  return items;
}

/* ---------------- 同步报告用的逐接口可寻址索引 ---------------- */

/**
 * 逐接口可寻址信息。官方 import-openapi 只回传 counters/errors；拿不到接口级依据时
 * 按允许的降级口径退回项目页并逐行标注，不做猜测拼装。
 */
export interface SyncEndpointLink {
  name: string;
  method: string;
  path: string;
  /** 接口文档页；只有项目页可用时为项目页（degraded=true），都没有时不出现 */
  apifoxUrl?: string;
  degraded?: boolean;
  apifoxEndpointId?: number;
  mockUrl?: string;
}

export interface EndpointLinks {
  /** per-endpoint 全可定位 / partial 部分可定位 / project 至多项目页 */
  mode: "per-endpoint" | "partial" | "project";
  reason?: string;
  links: SyncEndpointLink[];
}

/** 降级原因文案（JSON 信封、报告页共用），按每行实际结果归因 */
export const ENDPOINT_LINK_NO_MAPPING_REASON = "无法把接口对应到 Apifox 接口 ID 与文档地址，不能逐条生成接口链接";
export const ENDPOINT_LINK_NO_PROJECT_REASON =
  "私有化部署无法推导项目页：这些接口没有可用的接口文档页链接；已取得的接口地址与 Mock 地址仍会保留";
export const ENDPOINT_LINK_PRIVATE_DEPLOY_REASON =
  "apiBaseUrl 不是公网 Apifox 域名（私有化部署），无法推导接口文档页地址";
export const ENDPOINT_LINK_AMBIGUOUS_REASON =
  "Apifox 回传的接口路由映射存在重复或歧义，已跳过这些接口的接口级文档链接";
export const ENDPOINT_LINK_DRY_RUN_REASON = "dry-run 预检未写入 Apifox，不生成接口链接";

/** 公网 Apifox 项目页地址；私有化部署与非法地址返回 undefined。 */
export function projectWebUrl(apiBaseUrl: string, projectId: number): string | undefined {
  if (!(projectId > 0)) return undefined;
  try {
    const host = new URL(apiBaseUrl).hostname.toLowerCase();
    return ["api.apifox.com", "apifox.com", "www.apifox.com"].includes(host)
      ? `https://app.apifox.com/project/${projectId}`
      : undefined;
  } catch {
    // 非法 URL 由上游配置校验拦截,这里按无法推导处理
    return undefined;
  }
}

function routeKey(method: string, path: string): string {
  const trimmed = path.trim();
  return `${method.trim().toUpperCase()} ${trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed}`;
}

/**
 * 接口 → 导入条目。路由是唯一可信主键，命中多条按歧义处理；operationId 只在条目
 * 自身无路由信息、且本次唯一时兜底，避免同名 operationId 把链接串到别的接口。
 */
function matchImported(
  endpoint: EndpointInfo,
  imported: ImportEndpointResult[],
  duplicateOperationIds: Set<string>
): ImportEndpointResult | "ambiguous" | undefined {
  const key = routeKey(endpoint.method, endpoint.path);
  const byRoute = imported.filter((item) => item.method && item.path && routeKey(item.method, item.path) === key);
  if (byRoute.length) return byRoute.length > 1 ? "ambiguous" : byRoute[0];
  if (duplicateOperationIds.has(endpoint.operationId)) return undefined;
  const byOperationId = imported.filter((item) => !item.method && !item.path && item.operationId === endpoint.operationId);
  return byOperationId.length > 1 ? "ambiguous" : byOperationId[0];
}

export interface BuildEndpointLinksInput {
  endpoints: EndpointInfo[];
  /** Apifox 导入响应回传的逐接口映射（当前官方接口不返回，为空即降级） */
  imported?: ImportEndpointResult[];
  apiBaseUrl: string;
  projectId: number;
}

/**
 * 接口清单 → 可寻址索引：直传地址优先、其次按接口 ID 推导；其余行退回项目页并标
 * degraded。mode/reason 按“真正拿到地址的行”统计，缺项目页、歧义、私有化分别归因。
 */
export function buildEndpointLinks(input: BuildEndpointLinksInput): EndpointLinks {
  const baseUrl = (input.apiBaseUrl ?? "").trim();
  const projectUrl = projectWebUrl(baseUrl, input.projectId);
  const imported = input.imported ?? [];

  const counts = new Map<string, number>();
  for (const endpoint of input.endpoints) {
    counts.set(endpoint.operationId, (counts.get(endpoint.operationId) ?? 0) + 1);
  }
  const duplicateOperationIds = new Set([...counts].filter(([, n]) => n > 1).map(([id]) => id));

  const causes: string[] = [];
  let resolved = 0;
  const links: SyncEndpointLink[] = input.endpoints.map((endpoint) => {
    const match = imported.length ? matchImported(endpoint, imported, duplicateOperationIds) : undefined;
    const entry = match === "ambiguous" ? undefined : match;
    const endpointId = entry?.id && entry.id > 0 ? entry.id : undefined;
    const url = entry?.url ?? (endpointId && projectUrl ? `${projectUrl}/apis/api-${endpointId}` : undefined);
    if (url) resolved++;
    const link: SyncEndpointLink = {
      name: endpoint.summary?.trim() || endpoint.operationId,
      method: endpoint.method,
      path: endpoint.path,
      ...(url ? { apifoxUrl: url } : projectUrl ? { apifoxUrl: projectUrl, degraded: true } : {}),
      ...(endpointId ? { apifoxEndpointId: endpointId } : {}),
      ...(entry?.mockUrl ? { mockUrl: entry.mockUrl } : {}),
    };
    // 每行只归一个主因:歧义 / 有 ID 但缺公网域名 / 已退回项目页 / 无项目页可用
    const cause = url
      ? undefined
      : match === "ambiguous"
        ? ENDPOINT_LINK_AMBIGUOUS_REASON
        : endpointId
          ? ENDPOINT_LINK_PRIVATE_DEPLOY_REASON
          : projectUrl
            ? ENDPOINT_LINK_NO_MAPPING_REASON
            : ENDPOINT_LINK_NO_PROJECT_REASON;
    if (cause && !causes.includes(cause)) causes.push(cause);
    return link;
  });

  if (!links.length) {
    return { mode: "project", links };
  }
  return resolved === links.length
    ? { mode: "per-endpoint", links }
    : { mode: resolved ? "partial" : "project", reason: causes.join("；"), links };
}

/** 错误链上的单个节点:文本描述、错误名,以及命中本机地址时的端点(用于识别代理) */
interface ErrorNode {
  name: string;
  text: string;
  loopback?: string;
}

/** cause 链递归深度上限,防止异常对象自引用或深层嵌套拖垮报错路径 */
const MAX_ERROR_DEPTH = 6;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isLoopbackHost(host: string): boolean {
  const normalized = host.replace(/^\[|\]$/g, "").toLowerCase();
  return normalized === "localhost" || normalized === "::1" || normalized.startsWith("127.");
}

/** 单节点可读文本:以 message 为主,message 未包含 code 时补上,避免丢失 ECONNREFUSED 这类关键码 */
function describeNode(node: Record<string, unknown>): string {
  const message = readText(node.message);
  const code = readText(node.code);
  if (!code || message.includes(code)) {
    return message;
  }
  return message ? `${message} ${code}` : code;
}

function loopbackEndpoint(node: Record<string, unknown>): string | undefined {
  const host = readText(node.address) || readText(node.hostname);
  if (!host || !isLoopbackHost(host)) {
    return undefined;
  }
  return typeof node.port === "number" ? `${host}:${node.port}` : host;
}

/**
 * 展开错误链。除了标准 cause,还需处理 AggregateError:多地址(IPv4/IPv6)全部失败时
 * undici 会把各地址的错误挂在 errors 上,只读 cause 会漏掉真实原因。
 */
function collectErrorChain(err: unknown): ErrorNode[] {
  const nodes: ErrorNode[] = [];
  const seen = new Set<unknown>();
  const visit = (value: unknown, depth: number): void => {
    if (depth > MAX_ERROR_DEPTH || !isRecord(value) || seen.has(value)) {
      return;
    }
    seen.add(value);
    nodes.push({ name: readText(value.name), text: describeNode(value), loopback: loopbackEndpoint(value) });
    if (Array.isArray(value.errors)) {
      for (const sub of value.errors) {
        visit(sub, depth + 1);
      }
    }
    visit(value.cause, depth + 1);
  };
  visit(err, 0);
  return nodes;
}

function chainText(nodes: ErrorNode[], err: unknown): string {
  return nodes.map((node) => node.text).filter(Boolean).join(": ") || String(err);
}

/**
 * 展开错误链的可读描述。Node 的 fetch 连接失败时只抛 `TypeError: fetch failed`,
 * 真实原因(ECONNREFUSED / ENOTFOUND / 证书错误等)只存在于 err.cause 中;
 * 不展开会把「本地代理未启动」这类可定位问题压成一句无信息量的 "fetch failed"。
 */
export function describeErrorChain(err: unknown): string {
  return chainText(collectErrorChain(err), err);
}

/**
 * 网络请求失败的完整描述。扩展宿主里的 fetch 受 IDE 代理(http.proxy)影响,
 * 因此当失败地址是本机端口、目标主机却在别处时,直接点明代理未启动这一常见原因。
 */
export function formatNetworkFailure(url: string, err: unknown): string {
  const nodes = collectErrorChain(err);
  let message = `网络请求失败(${url}):${chainText(nodes, err)}`;
  const localEndpoint = nodes.find((node) => node.loopback)?.loopback;
  const targetHost = hostOf(url);
  if (localEndpoint && targetHost && !isLoopbackHost(targetHost)) {
    message += `;错误地址 ${localEndpoint} 是本机端口(目标为 ${targetHost}),通常是 IDE/系统代理未启动,请检查代理设置后重试`;
  }
  return message;
}

function hostOf(url: string): string | undefined {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

/** AbortSignal.timeout 触发时错误既可能是 DOMException,也可能被 undici 包进 cause,故沿链查找 */
function isAbortError(err: unknown): boolean {
  return collectErrorChain(err).some((node) => node.name === "TimeoutError" || node.name === "AbortError");
}

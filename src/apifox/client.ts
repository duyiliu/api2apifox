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
}

export interface ImportResult {
  counters: Record<string, number>;
  errors: { message?: string; code?: string }[];
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
    private readonly timeoutMs: number = 60_000
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
   * 单个团队拉取失败不影响其余团队(仅跳过并在结果中缺失)。
   */
  async listProjects(): Promise<ApifoxProject[]> {
    const teams = await this.listTeams();
    const results = await Promise.all(
      teams.map(async (team) => {
        try {
          const projects = await this.listTeamProjects(team.id);
          return projects.map((p) => ({ ...p, teamName: team.name }));
        } catch {
          return [] as ApifoxProject[];
        }
      })
    );
    return results.flat();
  }

  /**
   * 导入 OpenAPI 数据。input 为 OpenAPI JSON 序列化字符串。
   * 文档:https://apifox-openapi.apifox.cn 「导入 OpenAPI/Swagger 格式数据」
   */
  async importOpenapi(projectId: number, openapiJson: string, options: ImportOptions = {}): Promise<ImportResult> {
    const body = await this.request<{ counters?: Record<string, number>; errors?: { message?: string; code?: string }[] }>(
      "POST",
      `/v1/projects/${projectId}/import-openapi`,
      { input: openapiJson, options }
    );
    return {
      counters: body?.counters ?? {},
      errors: body?.errors ?? [],
    };
  }

  private async request<T>(method: string, path: string, json?: unknown): Promise<T> {
    const url = this.baseUrl.replace(/\/+$/, "") + path;
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: {
          "X-Apifox-Api-Version": this.apiVersion,
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: json === undefined ? undefined : JSON.stringify(json),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      if (isAbortError(err)) {
        throw new ApifoxApiError(`请求超时(${this.timeoutMs}ms):${url}`, 0);
      }
      throw new ApifoxApiError(formatNetworkFailure(url, err), 0);
    }

    const text = await res.text();

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
    return (payload?.data ?? payload) as T;
  }
}

function humanizeError(status: number, payload?: { message?: string; code?: number | string }): string {
  if (status === 401) {
    return "访问令牌无效或已过期(401),请用「ApiGen for Apifox: 设置访问令牌」重新配置";
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

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
    private readonly apiVersion: string = APIFOX_API_VERSION
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
      });
    } catch (err) {
      throw new ApifoxApiError(`网络请求失败(${url}):${err instanceof Error ? err.message : String(err)}`, 0);
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
    return "访问令牌无效或已过期(401),请用「Apifox Helper: 设置访问令牌」重新配置";
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

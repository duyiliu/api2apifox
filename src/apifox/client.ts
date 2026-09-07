/** Apifox 开放 API 客户端(纯 HTTP,不依赖 vscode) */
export interface ApifoxProject {
  id: number;
  name: string;
}

export interface ApifoxFolder {
  id: number;
  name: string;
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

  /** 项目列表 */
  async listProjects(): Promise<ApifoxProject[]> {
    const body = await this.request<unknown>("GET", "/v1/projects");
    return extractList<ApifoxProject>(body, (item) => typeof item?.id === "number" && typeof item?.name === "string");
  }

  /** 接口目录列表 */
  async listEndpointFolders(projectId: number): Promise<ApifoxFolder[]> {
    const body = await this.request<unknown>("GET", `/v1/projects/${projectId}/endpoint-folders`);
    return extractList<ApifoxFolder>(body, (item) => typeof item?.id === "number" && typeof item?.name === "string");
  }

  /** 新建接口目录 */
  async createEndpointFolder(projectId: number, name: string, parentId = 0): Promise<ApifoxFolder> {
    const body = await this.request<{ id?: number; name?: string }>("POST", `/v1/projects/${projectId}/endpoint-folders`, {
      name,
      parentId,
    });
    if (typeof body?.id === "number") {
      return { id: body.id, name: body.name ?? name };
    }
    throw new ApifoxApiError(`创建接口目录「${name}」失败:响应缺少 id`, 500);
  }

  /** 数据模型目录列表 */
  async listSchemaFolders(projectId: number): Promise<ApifoxFolder[]> {
    const body = await this.request<unknown>("GET", `/v1/projects/${projectId}/schema-folders`);
    return extractList<ApifoxFolder>(body, (item) => typeof item?.id === "number" && typeof item?.name === "string");
  }

  /** 新建数据模型目录 */
  async createSchemaFolder(projectId: number, name: string, parentId = 0): Promise<ApifoxFolder> {
    const body = await this.request<{ id?: number; name?: string }>("POST", `/v1/projects/${projectId}/schema-folders`, {
      name,
      parentId,
    });
    if (typeof body?.id === "number") {
      return { id: body.id, name: body.name ?? name };
    }
    throw new ApifoxApiError(`创建数据模型目录「${name}」失败:响应缺少 id`, 500);
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

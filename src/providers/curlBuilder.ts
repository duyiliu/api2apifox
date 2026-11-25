import { EndpointInfo, ParameterInfo } from "../java/model";
import { JsonSchema } from "../java/schemaResolver";

/**
 * 「复制为 cURL」的命令构造器(纯函数,可单测):
 * - 输入 EndpointInfo 与该接口在 OpenAPI spec 中对应的 operation(可选);
 *   operation 中的 requestBody schema 已经过 hidden/JsonIgnore/规则过滤,
 *   body 骨架由此生成,与同步到 Apifox 的口径天然一致。
 * - GET/DELETE 直接生成可执行 cURL;POST/PUT/PATCH 携带 -X、Content-Type
 *   (复用 consumes 口径)与 JSON body 骨架(取前若干个代表字段)。
 * - path 参数按类型给占位值,query 参数按类型给示例值,必填 header 生成 -H 占位。
 * - 长 body(>4KB)截断保护:返回 truncated 标记,由调用方决定提示口径。
 */

export const CURL_BODY_TRUNCATE_BYTES = 4096;
/** body 骨架最多选取的代表字段数 */
export const CURL_BODY_MAX_FIELDS = 3;

export interface CurlBuildResult {
  /** 生成的 cURL 命令(多行,\ 续行) */
  command: string;
  /** body 是否因超长被截断 */
  truncated: boolean;
}

export interface OperationLike {
  requestBody?: {
    content?: Record<string, { schema?: JsonSchema }>;
  };
}

/** query/path/header 参数示例值(按 schema/typeText 类型给) */
function exampleForType(typeText: string | undefined): string {
  const t = (typeText ?? "").replace(/<.*>/, "").trim();
  if (/^(int|long|short|byte|Integer|Long|Short|Byte|BigInteger)$/.test(t)) {
    return "1";
  }
  if (/^(float|double|Float|Double|BigDecimal|Number)$/.test(t)) {
    return "1.0";
  }
  if (/^(boolean|Boolean)$/.test(t)) {
    return "true";
  }
  if (/^(LocalDate)$/.test(t)) {
    return "2024-01-01";
  }
  if (/^(Date|Timestamp|LocalDateTime|Instant|ZonedDateTime|OffsetDateTime)$/.test(t)) {
    return "2024-01-01T00:00:00Z";
  }
  return "";
}

/** path 参数占位值:整数 1,其余用参数名让读者一眼看出替换位置 */
function pathPlaceholder(p: ParameterInfo): string {
  const numeric = exampleForType(p.typeText);
  if (numeric && numeric !== "true" && numeric !== "2024-01-01" && numeric !== "2024-01-01T00:00:00Z") {
    return numeric;
  }
  return `{${p.name}}`;
}

/** query 参数示例值:显式 example 优先,其次按类型,字符串类型回退为参数名(语义化占位) */
function queryExample(p: ParameterInfo): string {
  if (p.example !== undefined && p.example !== "") {
    return p.example;
  }
  const typed = exampleForType(p.typeText);
  return typed || p.name;
}

/** 从 schema 生成最小 JSON 示例(只取前 maxFields 个代表字段) */
function sampleFromSchema(schema: JsonSchema | undefined, maxFields: number, depth = 0): unknown {
  if (!schema || depth > 4) {
    return {};
  }
  if (schema.example !== undefined) {
    return schema.example;
  }
  // allOf 包装(带 $ref 的兄弟字段):取第一个非 $ref 成员的 properties
  if (schema.allOf?.length) {
    for (const sub of schema.allOf) {
      if (sub.properties) {
        return sampleFromSchema(sub, maxFields, depth + 1);
      }
    }
    return {};
  }
  if (schema.$ref) {
    return {};
  }
  if (schema.enum?.length) {
    return schema.enum[0];
  }
  switch (schema.type) {
    case "integer":
    case "number":
      return schema.format === "double" || schema.format === "float" ? 1.0 : 1;
    case "boolean":
      return true;
    case "string":
      if (schema.format === "date-time") {
        return "2024-01-01T00:00:00Z";
      }
      if (schema.format === "date") {
        return "2024-01-01";
      }
      if (schema.format === "uuid") {
        return "00000000-0000-0000-0000-000000000000";
      }
      return "string";
    case "array":
      return schema.items ? [sampleFromSchema(schema.items, maxFields, depth + 1)] : [];
    case "object":
    default: {
      const props = schema.properties;
      if (!props || !Object.keys(props).length) {
        return {};
      }
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(props).slice(0, maxFields)) {
        out[key] = sampleFromSchema(props[key], maxFields, depth + 1);
      }
      return out;
    }
  }
}

/** 单引号包裹 POSIX shell 安全字符串(内部单引号转 '\'' 序列) */
function shQuote(text: string): string {
  return `'${text.replace(/'/g, `'\\''`)}'`;
}

/** 去掉首尾斜杠外的空白,保证 baseUrl 与路径拼接只出现一次斜杠 */
function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * 生成接口的 cURL 命令。
 * @param ep 接口元数据(method/path/parameters/requestBody/consumes)
 * @param operation OpenAPI operation(可选;用于取 requestBody schema 生成 body 骨架)
 * @param baseUrl 请求主机(http://localhost:8080 等),调用方从设置注入
 */
export function buildCurlCommand(ep: EndpointInfo, operation: OperationLike | undefined, baseUrl: string): CurlBuildResult {
  const params = ep.parameters ?? [];
  const pathParams = params.filter((p) => p.in === "path");
  const queryParams = params.filter((p) => p.in === "query");
  const headerParams = params.filter((p) => p.in === "header" && p.required);

  // path 参数按类型填占位值
  let resolvedPath = ep.path;
  for (const p of pathParams) {
    resolvedPath = resolvedPath.split(`{${p.name}}`).join(pathPlaceholder(p));
  }

  // query 参数单独用 URLSearchParams 编码,再手工拼回完整 URL:
  // 直接用 new URL() 会把 path 占位符 {name} 编码成 %7Bname%7D,失去可读性。
  const search = new URLSearchParams();
  for (const p of queryParams) {
    search.append(p.name, queryExample(p));
  }
  const query = search.toString();
  const fullUrl = `${joinUrl(baseUrl, resolvedPath)}${query ? `?${query}` : ""}`;

  const lines: string[] = [`curl -X ${ep.method} ${shQuote(fullUrl)}`];
  for (const p of headerParams) {
    const placeholder = p.example ?? `<${p.name}>`;
    lines.push(`  -H ${shQuote(`${p.name}: ${placeholder}`)}`);
  }

  let truncated = false;
  if (ep.requestBody && ep.method !== "GET" && ep.method !== "DELETE") {
    const consumes = ep.consumes?.length ? ep.consumes : ["application/json"];
    const contentType = consumes[0];
    lines.push(`  -H ${shQuote(`Content-Type: ${contentType}`)}`);
    if (contentType.includes("multipart/form-data")) {
      // multipart:文件上传场景 -F 占位
      for (const f of ep.requestBody.formFields ?? []) {
        if (f.typeText.includes("MultipartFile")) {
          lines.push(`  -F ${shQuote(`${f.name}=@/path/to/file`)}`);
        } else {
          lines.push(`  -F ${shQuote(`${f.name}=${queryExample(f)}`)}`);
        }
      }
    } else if (contentType.includes("json")) {
      // JSON body 骨架:从 operation schema 取代表字段生成最小示例
      const content = operation?.requestBody?.content;
      const media = content?.[contentType] ?? content?.["application/json"] ?? Object.values(content ?? {})[0];
      const sample = sampleFromSchema(media?.schema, CURL_BODY_MAX_FIELDS);
      let body = JSON.stringify(sample);
      if (body.length > CURL_BODY_TRUNCATE_BYTES) {
        body = `${body.slice(0, CURL_BODY_TRUNCATE_BYTES)}...`;
        truncated = true;
      }
      lines.push(`  -d ${shQuote(body)}`);
    }
  }

  return { command: lines.join(" \\\n"), truncated };
}

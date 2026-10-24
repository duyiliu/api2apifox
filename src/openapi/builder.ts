import { AnnotationInfo, EndpointInfo, ParseResult, TypeIndex } from "../java/model";
import { applyConstraints, JsonSchema, ResolveContext, resolveTypeText, SchemaRegistry } from "../java/schemaResolver";
import { typeScopeOf } from "../java/typeIndex";
import { HelperProperties } from "../config/helperProperties";

export interface BuildOptions {
  /** OpenAPI info.title,一般用工作区名 */
  title: string;
  description?: string;
  /** 简单名为 Page 的分页包装展开风格(默认 mybatis-plus) */
  pageStyle?: "spring-data" | "mybatis-plus";
  /** .apifox-helper.properties 字段规则 */
  rules?: HelperProperties;
  /** 枚举字段自动追加「(枚举类:X)」 */
  enumFieldDoc?: boolean;
  /** 为每个 operation 计算 x-apifox-folder 目录(与 folderNameSource/rootFolderName 对应) */
  folderOf?: (ep: EndpointInfo) => string;
}

export interface OpenApiSpec {
  openapi: string;
  info: { title: string; description?: string; version: string };
  tags?: { name: string; description?: string }[];
  paths: Record<string, Record<string, unknown>>;
  components?: { schemas: Record<string, JsonSchema> };
}

export interface BuildOutput {
  spec: OpenApiSpec;
  warnings: string[];
}

/** 把解析结果构建为 OpenAPI 3.0 文档 */
export function buildOpenApi(parse: ParseResult, index: TypeIndex, options: BuildOptions): BuildOutput {
  const registry = new SchemaRegistry();
  const fieldWarnings: string[] = [];
  const ctx: ResolveContext = {
    index,
    registry,
    options: { pageStyle: options.pageStyle, enumFieldDoc: options.enumFieldDoc },
    fieldRules: options.rules,
    fieldWarnings,
  };
  const paths: Record<string, Record<string, unknown>> = {};
  const tags = new Map<string, string | undefined>();
  const usedOperationIds = new Map<string, number>();
  const opFlavors = new Map<string, string>();

  for (const ep of parse.endpoints) {
    tags.set(ep.tag, tags.get(ep.tag) ?? undefined);
    const pathItem = (paths[ep.path] ??= {});
    const verbKey = ep.method.toLowerCase();
    const existing = pathItem[verbKey];
    if (existing) {
      // 同 method+path 冲突:Spring MVC Controller 优先于 Feign/JAX-RS(它是文档的 source of truth)
      const existingFlavor = opFlavors.get(`${ep.path} ${verbKey}`);
      if (existingFlavor === "spring-mvc" || ep.flavor !== "spring-mvc") {
        parse.warnings.push(`接口重复,已跳过: ${ep.method} ${ep.path} (${ep.controller}.${ep.operationId})`);
        continue;
      }
    }
    const count = usedOperationIds.get(ep.operationId) ?? 0;
    usedOperationIds.set(ep.operationId, count + 1);
    opFlavors.set(`${ep.path} ${verbKey}`, ep.flavor);
    pathItem[verbKey] = buildOperation(ep, ctx, count > 0 ? `${ep.operationId}_${count + 1}` : ep.operationId, options.folderOf);
  }

  const spec: OpenApiSpec = {
    openapi: "3.0.3",
    info: {
      title: options.title,
      description: options.description,
      version: "1.0.0",
    },
    tags: [...tags.keys()].map((name) => ({ name })),
    paths,
  };
  if (Object.keys(registry.schemas).length) {
    spec.components = { schemas: registry.schemas };
  }
  if (registry.warnings.length) {
    parse.warnings.push(...registry.warnings);
  }
  if (fieldWarnings.length) {
    parse.warnings.push(...fieldWarnings);
  }
  return { spec, warnings: parse.warnings };
}

function buildOperation(ep: EndpointInfo, ctx: ResolveContext, operationId: string, folderOf?: (ep: EndpointInfo) => string): Record<string, unknown> {
  // 控制器自身的类作用域:接口签名中的简单名同样要优先命中 Controller 的成员类型
  // (继承自父类/接口的方法按方法声明处类型的作用域解析)
  const epScope = typeScopeOf(ctx.index.types.get(ep.declaringType ?? ep.controller));
  const opCtx: ResolveContext = epScope ? { ...ctx, scope: epScope } : ctx;
  const op: Record<string, unknown> = {
    tags: [ep.tag],
    summary: ep.summary,
    description: ep.description,
    operationId,
  };
  if (ep.deprecated) {
    op.deprecated = true;
  }
  // x-apifox-folder:Apifox 导入时优先按它建接口目录;缺省时用 tags[0]
  if (folderOf) {
    const folder = folderOf(ep);
    if (folder) {
      op["x-apifox-folder"] = folder;
    }
  }

  const parameters = ep.parameters.map((p) => {
    const schema = resolveTypeText(p.typeText, opCtx);
    applyParamConstraints(p, schema);
    const param: Record<string, unknown> = {
      name: p.name,
      in: p.in,
      required: p.in === "path" ? true : p.required,
      schema,
    };
    if (p.description) {
      param.description = p.description;
    }
    if (p.example !== undefined) {
      param.example = p.example;
    }
    if (p.defaultValue !== undefined) {
      param.schema = { ...(param.schema as JsonSchema), default: p.defaultValue };
    }
    return param;
  });
  if (parameters.length) {
    op.parameters = parameters;
  }

  if (ep.requestBody) {
    const rb = ep.requestBody;
    if (rb.formFields) {
      // 文件上传(multipart/form-data)
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];
      for (const f of rb.formFields) {
        const schema = f.typeText.includes("MultipartFile")
          ? ({ type: "string", format: "binary", description: f.description } as JsonSchema)
          : (() => {
              const s = resolveTypeText(f.typeText, opCtx);
              applyParamConstraints(f, s);
              return s;
            })();
        properties[f.name] = schema;
        if (f.required) {
          required.push(f.name);
        }
      }
      const schema: JsonSchema = { type: "object", properties };
      if (required.length) {
        schema.required = required;
      }
      op.requestBody = {
        required: rb.required,
        content: buildContent(ep.consumes, "multipart/form-data", { schema }),
      };
    } else if (rb.typeText !== "__multipart__") {
      const schema = resolveTypeText(rb.typeText, opCtx);
      const jsonBody: Record<string, unknown> = { schema };
      if (rb.description) {
        jsonBody.description = rb.description;
      }
      op.requestBody = {
        required: rb.required,
        content: buildContent(ep.consumes, "application/json", jsonBody),
      };
    }
  }

  const responses: Record<string, unknown> = {};
  const okResponse: Record<string, unknown> = { description: ep.responseDescription || "OK" };
  const innerReturn = responseInnerType(ep.returnType);
  if (innerReturn) {
    okResponse.content = buildContent(ep.produces, "*/*", { schema: resolveTypeText(innerReturn, opCtx) });
  }
  responses["200"] = okResponse;

  // @ApiResponse/@ResponseStatus 声明的额外状态码
  for (const extra of ep.extraResponses ?? []) {
    const resp: Record<string, unknown> = { description: extra.description || "" };
    if (extra.schemaText) {
      resp.content = buildContent(ep.produces, "*/*", { schema: resolveTypeText(extra.schemaText, opCtx) });
    }
    responses[extra.code] = resp;
  }
  op.responses = responses;

  return op;
}

/**
 * 按声明的媒体类型生成 content 条目;多个媒体类型各自一份(同一个 schema 内容)。
 * 未声明时回退到默认类型(请求 application/json 或 multipart/form-data,响应 *\/*)。
 */
function buildContent(mediaTypes: string[] | undefined, fallback: string, body: Record<string, unknown>): Record<string, unknown> {
  const types = mediaTypes?.length ? mediaTypes : [fallback];
  const content: Record<string, unknown> = {};
  for (const type of types) {
    content[type] ??= { ...body };
  }
  return content;
}

/** 参数上的 Bean Validation 注解 -> schema 约束 */
function applyParamConstraints(p: { annotations?: AnnotationInfo[] }, schema: JsonSchema): void {
  if (p.annotations?.length) {
    applyConstraints(p.annotations, schema);
  }
}

/** 解开 ResponseEntity<T>/Mono<T> 外壳;void/Void 返回 undefined 表示无响应体 */
function responseInnerType(typeText?: string): string | undefined {
  if (!typeText) {
    return undefined;
  }
  let t = typeText.trim();
  const m = /^(?:ResponseEntity|Mono|HttpEntity)\s*<(.*)>$/.exec(t);
  if (m) {
    t = m[1].trim();
  }
  if (t === "void" || t === "Void") {
    return undefined;
  }
  return t;
}

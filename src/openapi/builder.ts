import { AnnotationInfo, EndpointInfo, ParseResult, SecurityRequirement, TypeIndex } from "../java/model";
import {
  applyConstraints,
  JsonSchema,
  paramRuleEngine,
  ResolveContext,
  resolveTypeText,
  SchemaRegistry,
  withRefSiblings,
} from "../java/schemaResolver";
import { typeScopeOf } from "../java/typeIndex";
import { HelperProperties } from "../config/helperProperties";

export interface BuildOptions {
  /** OpenAPI info.title,一般用工作区名 */
  title: string;
  description?: string;
  /** OpenAPI info.version;未指定时保持历史默认 "1.0.0" */
  openapiInfoVersion?: string;
  /** 简单名为 Page 的分页包装展开风格(默认 mybatis-plus) */
  pageStyle?: "spring-data" | "mybatis-plus";
  /** .apifox-helper.properties 字段规则 */
  rules?: HelperProperties;
  /** 枚举字段自动追加「(枚举类:X)」 */
  enumFieldDoc?: boolean;
  /** 为每个 operation 计算 x-apifox-folder 目录(与 folderNameSource/rootFolderName 对应) */
  folderOf?: (ep: EndpointInfo) => string;
  /**
   * 鉴权注解的输出方式:
   * "description"(默认)在 operation description 尾部追加「权限:`xxx`」行;
   * "extension" 写入 x-permission / x-roles 扩展字段。
   * 不改动 security/securitySchemes(避免生成错误的全局鉴权声明)。
   */
  securityDocMode?: "description" | "extension";
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
    pathItem[verbKey] = buildOperation(ep, ctx, count > 0 ? `${ep.operationId}_${count + 1}` : ep.operationId, options.folderOf, options.securityDocMode);
  }

  const spec: OpenApiSpec = {
    openapi: "3.0.3",
    info: {
      title: options.title,
      description: options.description,
      version: options.openapiInfoVersion ?? "1.0.0",
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

/** 角色类鉴权注解(值是角色串);Secured 语义上就是角色检查 */
const ROLE_ANNOTATIONS = new Set(["SaCheckRole", "RequiresRoles", "Secured"]);
/** 权限类鉴权注解(值是权限串) */
const PERMISSION_ANNOTATIONS = new Set(["SaCheckPermission", "RequiresPermissions"]);

/**
 * 把接口的鉴权要求写入 operation。
 * description 模式:在 description 尾部追加「**鉴权要求**」小节,类级/方法级分行列出;
 * extension 模式:权限/表达式写入 x-permission、角色写入 x-roles(原文透传,类级与方法级合并去重)。
 * 两种模式都不触碰 security/securitySchemes,避免生成错误的全局鉴权声明。
 */
function applySecurityRequirements(
  op: Record<string, unknown>,
  requirements: SecurityRequirement[] | undefined,
  mode: "description" | "extension"
): void {
  if (!requirements?.length) {
    return;
  }
  if (mode === "extension") {
    const permissions: string[] = [];
    const roles: string[] = [];
    const push = (target: string[], value: string) => {
      if (!target.includes(value)) {
        target.push(value);
      }
    };
    for (const req of requirements) {
      if (ROLE_ANNOTATIONS.has(req.annotation)) {
        push(roles, req.value);
      } else {
        // 权限串与 PreAuthorize/PostAuthorize 的 SpEL 表达式统一入 x-permission(原文透传)
        push(permissions, req.value);
      }
    }
    if (permissions.length) {
      op["x-permission"] = permissions;
    }
    if (roles.length) {
      op["x-roles"] = roles;
    }
    return;
  }
  const labelOf = (req: SecurityRequirement): string =>
    ROLE_ANNOTATIONS.has(req.annotation) ? "角色" : PERMISSION_ANNOTATIONS.has(req.annotation) ? "权限" : "鉴权";
  const lines = requirements.map((req) => `- ${labelOf(req)}：\`${req.value}\`(${req.source === "class" ? "类级" : "方法级"} @${req.annotation})`);
  const block = ["**鉴权要求**", ...lines].join("\n");
  const existing = typeof op.description === "string" && op.description ? op.description : "";
  op.description = existing ? `${existing}\n\n${block}` : block;
}

function buildOperation(
  ep: EndpointInfo,
  ctx: ResolveContext,
  operationId: string,
  folderOf?: (ep: EndpointInfo) => string,
  securityDocMode: "description" | "extension" = "description"
): Record<string, unknown> {
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
  applySecurityRequirements(op, ep.security, securityDocMode);
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

  // param.* 参数级规则(与 field.* 同求值管线):param.ignore/required/type/doc
  const paramSubject = `${ep.controller}.${ep.methodName ?? ep.operationId}`;
  const parameters = ep.parameters
    .map((p) => {
      const rule = paramRuleEngine(p, paramSubject, opCtx);
      if (rule.ignored) {
        return undefined;
      }
      let schema = resolveTypeText(p.typeText, opCtx);
      if (rule.typeOverride) {
        schema = { type: rule.typeOverride.type, ...(rule.typeOverride.format ? { format: rule.typeOverride.format } : {}) };
      }
      applyParamConstraints(p, schema);
      const param: Record<string, unknown> = {
        name: p.name,
        in: p.in,
        required: p.in === "path" ? true : (rule.required ?? p.required),
        schema,
      };
      const desc = rule.appendDoc.length ? [p.description, ...rule.appendDoc].filter(Boolean).join("\n") : p.description;
      if (desc) {
        param.description = desc;
      }
      if (p.example !== undefined) {
        param.example = p.example;
      }
      if (p.defaultValue !== undefined) {
        // @RequestParam(defaultValue) 同样不能写成 $ref 的兄弟字段
        param.schema = withRefSiblings(param.schema as JsonSchema, { default: p.defaultValue });
      }
      return param;
    })
    .filter((x): x is Record<string, unknown> => x !== undefined);
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
        const rule = paramRuleEngine(f, paramSubject, opCtx);
        if (rule.ignored) {
          continue;
        }
        const desc = rule.appendDoc.length ? [f.description, ...rule.appendDoc].filter(Boolean).join("\n") : f.description;
        const schema = f.typeText.includes("MultipartFile")
          ? ({ type: "string", format: "binary", description: desc } as JsonSchema)
          : (() => {
              const s = rule.typeOverride
                ? ({ type: rule.typeOverride.type, ...(rule.typeOverride.format ? { format: rule.typeOverride.format } : {}) } as JsonSchema)
                : resolveTypeText(f.typeText, opCtx);
              applyParamConstraints(f, s);
              return s;
            })();
        properties[f.name] = schema;
        if (rule.required ?? f.required) {
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

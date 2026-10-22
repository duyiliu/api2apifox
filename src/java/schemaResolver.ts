import { annBool, annStr, ClassInfo, FieldInfo, findAnn, TypeIndex } from "./model";
import { parseTypeText, simpleName, TypeRef, typeToKeyText } from "./typeText";
import { AnnotationInfo } from "./annotation";
import { HelperProperties } from "../config/helperProperties";
import { detectValueSyntax, evalCondition, evalRuleValue, RuleContext } from "./ruleEval";
import { resolveScopedType, typeScopeOf } from "./typeIndex";

export interface JsonSchema {
  type?: string;
  format?: string;
  description?: string;
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: JsonSchema | boolean;
  enum?: string[];
  $ref?: string;
  nullable?: boolean;
  example?: string;
  title?: string;
  default?: unknown;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  /** OpenAPI 3.0:布尔修饰符,须与 minimum/maximum 同用 */
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  pattern?: string;
}

/** 稳定的 JSON 序列化(对象键排序),用于判定两份 schema 结构是否一致 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return "{" + entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",") + "}";
}

function refTo(name: string): JsonSchema {
  return { $ref: `#/components/schemas/${name}` };
}

/**
 * components/schemas 注册表。
 * 以「类型身份」(qualifiedName + 泛型实参)去重:同一类型只生成一份定义;
 * 不同类型的简单名相同时(如实体 `ExamProject` 与请求内嵌 `...SaveRequest.ExamProject`),
 * 首个占用简单名,后续追加 `_2`、`_3` … 并记录告警,避免后者静默复用前者的 $ref
 * (对齐 IDEA 版 easy-api `OpenApiSchemaConverter.registerWithShapeCheck` 的口径:
 * 非递归的已完成模型可按相同结构复用;递归模型保留预留名称,避免改变已发出的引用)。
 */
export class SchemaRegistry {
  readonly schemas: Record<string, JsonSchema> = {};
  /** 同名不同结构产生的命名冲突告警(由调用方并入 warnings 输出) */
  readonly warnings: string[] = [];
  /** 类型身份 -> 最终 schema 名 */
  private readonly byIdentity = new Map<string, string>();
  /** 构建前预留唯一名称;循环引用一旦使用该名称,整个构建过程不再重命名。 */
  private readonly pending = new Map<string, { name: string; referenced: boolean }>();

  /**
   * 取已存在的 $ref;不存在则用 make() 生成并登记。
   * @param identity 类型身份(qualifiedName + 泛型实参),同一身份只构建一次
   * @param displayName 期望的 schema 名(简单名[+«泛型»]);冲突时实际登记名可能带 `_N` 后缀
   */
  getOrAdd(identity: string, displayName: string, make: () => JsonSchema): JsonSchema {
    const known = this.byIdentity.get(identity);
    if (known) {
      return refTo(known);
    }
    const pending = this.pending.get(identity);
    if (pending) {
      pending.referenced = true;
      return refTo(pending.name);
    }

    const { name: reserved, candidates } = this.reserveName(displayName);
    const entry = { name: reserved, referenced: false };
    this.pending.set(identity, entry);
    try {
      const schema = make();
      // 仅复用构建前已完成的模型;有循环引用时必须保留已经发出的名称。
      const shape = entry.referenced ? undefined : stableStringify(schema);
      const equivalent = shape !== undefined
        ? candidates.find(([, existing]) => stableStringify(existing) === shape)
        : undefined;
      const name = equivalent?.[0] ?? reserved;
      if (!equivalent) {
        this.schemas[name] = schema;
      }
      if (!equivalent && name !== displayName) {
        this.warnings.push(`同名类型冲突:${identity} 已登记为 ${name},以保留独立模型及循环引用`);
      }
      this.byIdentity.set(identity, name);
      return refTo(name);
    } finally {
      this.pending.delete(identity);
    }
  }

  /** 已登记和正在构建的名称均不可占用,保证递归中的类型身份不会发生碰撞。 */
  private reserveName(baseName: string): { name: string; candidates: [string, JsonSchema][] } {
    const reserved = new Set([...this.pending.values()].map((entry) => entry.name));
    const candidates: [string, JsonSchema][] = [];
    for (let n = 1; ; n++) {
      const candidate = n === 1 ? baseName : `${baseName}_${n}`;
      const existing = this.schemas[candidate];
      if (existing) {
        candidates.push([candidate, existing]);
      } else if (!reserved.has(candidate)) {
        return { name: candidate, candidates };
      }
    }
  }
}

export interface ResolveContext {
  index: TypeIndex;
  registry: SchemaRegistry;
  /** 泛型形参绑定:T -> TypeRef */
  bindings?: Map<string, TypeRef>;
  /**
   * 当前解析位置的完整 Java 成员类型路径(**由内向外**,如 Outer.Inner → Outer)。
   * 类体内对简单名的引用优先命中成员(嵌套)类型,与 IDEA 版 PSI 解析口径一致;
   * Controller 层解析用 typeScopeOf(controllerInfo) 传入。
   */
  scope?: readonly string[];
  /** 解析选项 */
  options?: ResolveOptions;
  /** .apifox-helper.properties 的字段规则(可空) */
  fieldRules?: HelperProperties | undefined;
  /** 字段规则产生的告警(收集后随 warnings 输出) */
  fieldWarnings?: string[];
}

export interface ResolveOptions {
  /** 简单名为 Page 的分页包装按哪个库的形态展开(默认 mybatis-plus) */
  pageStyle?: "spring-data" | "mybatis-plus";
  /** 枚举字段自动在描述后追加「(枚举类:X)」(对应团队 groovy 规则意图,默认关) */
  enumFieldDoc?: boolean;
}

/** 类型文本 -> OpenAPI schema。返回内联标量或 components $ref */
export function resolveTypeText(typeText: string, ctx: ResolveContext): JsonSchema {
  return resolveType(parseTypeText(typeText), ctx);
}

export function resolveType(t: TypeRef, ctx: ResolveContext): JsonSchema {
  if (t.dims > 0) {
    return { type: "array", items: resolveType({ ...t, dims: t.dims - 1 }, ctx) };
  }

  const name = simpleName(t.name);

  // 泛型形参(如 Result<T> 中的 T)
  const bound = !t.name.includes(".") ? ctx.bindings?.get(name) : undefined;
  if (bound) {
    const bindings = new Map(ctx.bindings);
    bindings.delete(name);
    return resolveType(bound, { ...ctx, bindings });
  }

  const builtin = builtinSchema(name, t, ctx);
  if (builtin) {
    return builtin;
  }

  const page = pageSchema(name, t, ctx);
  if (page) {
    return page;
  }

  // 源码类型 → 依赖 jar 中的类型(按需解析 .class,结果回填缓存)
  const info = resolveScopedType(ctx.index, t.name, ctx.scope);
  if (!info) {
    return { type: "object", description: `未识别的类型: ${t.name}` };
  }
  if (info.kind === "enum") {
    return enumSchema(info);
  }

  // 在调用处解析实参身份,防止进入包装类作用域后将 A.Item/B.Item 混为简单名 Item。
  const instance = { ...t, args: t.args.map((arg) => bindTypeArgument(arg, ctx)) };
  const bindings = new Map<string, TypeRef>();
  info.typeParams.forEach((param, i) => {
    if (instance.args[i]) {
      bindings.set(param, instance.args[i]);
    }
  });
  return ctx.registry.getOrAdd(schemaIdentity(info, instance), schemaName(info, instance), () =>
    classSchema(info, { ...ctx, bindings })
  );
}

/** 将泛型变量替换为绑定值,并把源码类型解析成调用处的全限定名(含嵌套路径)。 */
function bindTypeArgument(t: TypeRef, ctx: ResolveContext, resolving = new Set<string>()): TypeRef {
  const bound = !t.name.includes(".") ? ctx.bindings?.get(t.name) : undefined;
  if (bound && !resolving.has(t.name)) {
    const next = new Set(resolving).add(t.name);
    const resolved = bindTypeArgument(bound, ctx, next);
    return { ...resolved, dims: resolved.dims + t.dims, wildcard: t.wildcard ?? resolved.wildcard };
  }
  const name = simpleName(t.name);
  const builtin = PRIMITIVES[name] || COLLECTIONS.has(name) || MAPS.has(name) ||
    ["ResponseEntity", "Mono", "Flux", "Optional", "Page", "PageImpl", "Slice", "IPage", "PageInfo"].includes(name);
  const info = builtin ? undefined : resolveScopedType(ctx.index, t.name, ctx.scope);
  return { ...t, name: info?.qualifiedName ?? t.name, args: t.args.map((arg) => bindTypeArgument(arg, ctx, resolving)) };
}

/** 类型身份:全限定名 + 泛型实参(同一类型的不同泛型实例各自成模型) */
function schemaIdentity(info: ClassInfo, t: TypeRef): string {
  return info.qualifiedName + genericKeyText(t);
}

/** 期望的 schema 名:简单名 + 泛型实参 */
function schemaName(info: ClassInfo, t: TypeRef): string {
  const displayType = (arg: TypeRef): TypeRef => ({ ...arg, name: simpleName(arg.name), args: arg.args.map(displayType) });
  return info.simpleName + genericKeyText({ ...t, args: t.args.map(displayType) });
}

function genericKeyText(t: TypeRef): string {
  return t.args.length ? "«" + t.args.map(typeToKeyText).join(",") + "»" : "";
}

/**
 * 类/枚举级描述(对应 Apifox 数据模型备注):
 * @Schema(description) > @ApiModel(value/description) > 类 Javadoc(正文优先,单行取首行)。
 * 注:@ApiModelProperty 仅用于字段级描述,类上不生效。
 */
export function classDescription(
  annotations: AnnotationInfo[],
  javadoc?: { description: string; firstLine: string }
): string | undefined {
  const schema = findAnn(annotations, "Schema");
  const d1 = schema ? annStr(schema.args, "description", "value") : undefined;
  if (d1) {
    return d1;
  }
  // Swagger 2 类级 @ApiModel 是常见备注来源(IDEA 版插件同义),此前未识别导致备注永远同步不上去
  const apiModel = findAnn(annotations, "ApiModel");
  const d2 = apiModel ? annStr(apiModel.args, "value", "description") : undefined;
  if (d2) {
    return d2;
  }
  const text = javadoc?.description || javadoc?.firstLine;
  return text && text.trim() ? text : undefined;
}

function enumSchema(info: ClassInfo): JsonSchema {
  const schema: JsonSchema = { type: "string", title: info.simpleName };
  if (info.enumConstants.length) {
    schema.enum = [...info.enumConstants];
  }
  const desc = classDescription(info.annotations, info.javadoc);
  if (desc) {
    schema.description = desc;
  }
  return schema;
}

function classSchema(info: ClassInfo, ctx: ResolveContext): JsonSchema {
  const fields: FieldInfo[] = info.fields.length ? info.fields : info.recordComponents;
  // 字段类型在**本类的作用域**下解析:同名嵌套类型优先于顶层类型(与 Java/PSI 一致)
  const classCtx: ResolveContext = { ...ctx, scope: typeScopeOf(info) };

  // 父类字段(含父类泛型绑定)
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  if (info.superClass) {
    const supRef = parseTypeText(info.superClass);
    // 与类型解析同口径:作用域内解析优先,源码索引其次,未命中时从依赖 jar 取(框架基类的字段同样要合并)
    const supInfo = resolveScopedType(ctx.index, supRef.name, classCtx.scope);
    if (supInfo && supInfo.kind !== "enum") {
      const supBindings = new Map<string, TypeRef>();
      supInfo.typeParams.forEach((p, i) => {
        if (supRef.args[i]) {
          supBindings.set(p, bindTypeArgument(supRef.args[i], classCtx));
        }
      });
      const supSchema = classSchema(supInfo, { ...classCtx, bindings: supBindings });
      Object.assign(properties, supSchema.properties ?? {});
      required.push(...(supSchema.required ?? []));
    }
  }

  for (const field of fields) {
    // 规则引擎:字段级 .apifox-helper.properties(field.*)
    const rule = fieldRuleEngine(field, info, classCtx);
    if (rule.ignored) {
      continue;
    }
    if (findAnn(field.annotations, "JsonIgnore")) {
      continue;
    }
    if (isHidden(field.annotations)) {
      continue;
    }
    // FASTJSON serialize=false 或 GSON 无Expose 视为忽略;@JSONField(name)/@SerializedName 重命名
    const jsonField = findAnn(field.annotations, "JSONField");
    if (jsonField) {
      const serialize = annBool(jsonField.args, "serialize");
      if (serialize === false) {
        continue;
      }
    }
    const jsonProp = findAnn(field.annotations, "JsonProperty");
    const gsonName = findAnn(field.annotations, "SerializedName");
    const fastName = findAnn(field.annotations, "JSONField");
    const propName =
      rule.fieldName ??
      ((jsonProp ? annStr(jsonProp.args, "value", "name") : undefined) ??
        (gsonName ? annStr(gsonName.args, "value", "name") : undefined) ??
        (fastName ? annStr(fastName.args, "name") : undefined) ??
        field.name);
    const schema = resolveTypeText(field.typeText, classCtx);
    const desc = schemaDescription(field.annotations, field.javadoc?.description);
    const finalDesc = rule.appendDesc(desc, field, ctx);
    if (finalDesc) {
      schema.description = finalDesc;
    }
    const example = schemaExample(field.annotations);
    if (example) {
      schema.example = example;
    }
    applyConstraints(field.annotations, schema);
    properties[propName] = schema;

    let isRequired =
      annBool(jsonProp?.args ?? {}, "required") === true ||
      !!findAnn(field.annotations, "NotNull", "NotBlank", "NotEmpty");
    if (rule.required !== undefined) {
      isRequired = rule.required;
    }
    if (isRequired && !required.includes(propName)) {
      required.push(propName);
    }
  }

  const schema: JsonSchema = {
    type: "object",
    title: info.simpleName,
    description: classDescription(info.annotations, info.javadoc),
    properties,
  };
  if (required.length) {
    schema.required = required;
  }
  return schema;
}

const PRIMITIVES: Record<string, JsonSchema> = {
  int: { type: "integer", format: "int32" },
  Integer: { type: "integer", format: "int32" },
  short: { type: "integer", format: "int32" },
  Short: { type: "integer", format: "int32" },
  byte: { type: "integer", format: "int32" },
  Byte: { type: "integer", format: "int32" },
  long: { type: "integer", format: "int64" },
  Long: { type: "integer", format: "int64" },
  BigInteger: { type: "integer", format: "int64" },
  float: { type: "number", format: "float" },
  Float: { type: "number", format: "float" },
  double: { type: "number", format: "double" },
  Double: { type: "number", format: "double" },
  BigDecimal: { type: "number", format: "double" },
  Number: { type: "number" },
  boolean: { type: "boolean" },
  Boolean: { type: "boolean" },
  char: { type: "string" },
  Character: { type: "string" },
  String: { type: "string" },
  CharSequence: { type: "string" },
  Object: { type: "object" },
  Date: { type: "string", format: "date-time" },
  Timestamp: { type: "string", format: "date-time" },
  LocalDateTime: { type: "string", format: "date-time" },
  Instant: { type: "string", format: "date-time" },
  ZonedDateTime: { type: "string", format: "date-time" },
  OffsetDateTime: { type: "string", format: "date-time" },
  LocalDate: { type: "string", format: "date" },
  LocalTime: { type: "string" },
  Duration: { type: "string" },
  MultipartFile: { type: "string", format: "binary" },
  UUID: { type: "string", format: "uuid" },
};

const COLLECTIONS = new Set([
  "List", "ArrayList", "LinkedList", "Collection", "Set", "HashSet", "LinkedHashSet",
  "TreeSet", "Iterable", "Queue", "Deque", "Stack",
]);

const MAPS = new Set(["Map", "HashMap", "TreeMap", "LinkedHashMap", "ConcurrentHashMap", "SortedMap"]);

/** 分页包装:泛型实参 T 的 schema + 各库的字段形态 */
function pageSchema(name: string, t: TypeRef, ctx: ResolveContext): JsonSchema | undefined {
  const itemType = (): JsonSchema => (t.args[0] ? resolveType(t.args[0], ctx) : { type: "object" });
  const int64 = { type: "integer", format: "int64" } as JsonSchema;
  const int32 = { type: "integer", format: "int32" } as JsonSchema;
  const bool = { type: "boolean" } as JsonSchema;

  // PageHelper 的 PageInfo<T>
  if (name === "PageInfo") {
    return {
      type: "object",
      title: `PageInfo«${t.args[0] ? typeToKeyText(t.args[0]) : "Object"}»`,
      description: "分页数据(PageHelper)",
      properties: {
        total: { ...int64, description: "总记录数" },
        list: { type: "array", items: itemType(), description: "当前页数据" },
        pageNum: { ...int32, description: "当前页码" },
        pageSize: { ...int32, description: "每页条数" },
        pages: { ...int32, description: "总页数" },
        prePage: { ...int32, description: "上一页页码" },
        nextPage: { ...int32, description: "下一页页码" },
        isFirstPage: { ...bool, description: "是否首页" },
        isLastPage: { ...bool, description: "是否末页" },
        hasPreviousPage: { ...bool, description: "是否有上一页" },
        hasNextPage: { ...bool, description: "是否有下一页" },
      },
    };
  }

  // MyBatis-Plus 的 IPage<T>
  if (name === "IPage") {
    return {
      type: "object",
      title: `IPage«${t.args[0] ? typeToKeyText(t.args[0]) : "Object"}»`,
      description: "分页数据(MyBatis-Plus)",
      properties: {
        records: { type: "array", items: itemType(), description: "当前页数据" },
        total: { ...int64, description: "总记录数" },
        size: { ...int64, description: "每页条数" },
        current: { ...int64, description: "当前页码" },
        pages: { ...int64, description: "总页数" },
      },
    };
  }

  // 简单名 Page/PageImpl/Slice:按配置风格展开
  if (name === "Page" || name === "PageImpl" || name === "Slice") {
    const style =
      name === "Slice"
        ? "spring-data"
        : ctx.options?.pageStyle === "spring-data"
          ? "spring-data"
          : "mybatis-plus";
    if (style === "spring-data") {
      return {
        type: "object",
        title: `Page«${t.args[0] ? typeToKeyText(t.args[0]) : "Object"}»`,
        description: "分页数据(Spring Data)",
        properties: {
          content: { type: "array", items: itemType(), description: "当前页数据" },
          totalElements: { ...int64, description: "总记录数" },
          totalPages: { ...int32, description: "总页数" },
          number: { ...int32, description: "当前页码(0 基)" },
          size: { ...int32, description: "每页条数" },
          numberOfElements: { ...int32, description: "当前页实际条数" },
          first: { ...bool, description: "是否首页" },
          last: { ...bool, description: "是否末页" },
          empty: { ...bool, description: "是否为空" },
        },
      };
    }
    return {
      type: "object",
      title: `Page«${t.args[0] ? typeToKeyText(t.args[0]) : "Object"}»`,
      description: "分页数据(MyBatis-Plus)",
      properties: {
        records: { type: "array", items: itemType(), description: "当前页数据" },
        total: { ...int64, description: "总记录数" },
        size: { ...int64, description: "每页条数" },
        current: { ...int64, description: "当前页码" },
        pages: { ...int64, description: "总页数" },
      },
    };
  }
  return undefined;
}

function builtinSchema(name: string, t: TypeRef, ctx: ResolveContext): JsonSchema | undefined {
  const prim = PRIMITIVES[name];
  if (prim) {
    return { ...prim };
  }
  if (COLLECTIONS.has(name)) {
    return { type: "array", items: t.args[0] ? resolveType(t.args[0], ctx) : { type: "object" } };
  }
  if (MAPS.has(name)) {
    return { type: "object", additionalProperties: t.args[1] ? resolveType(t.args[1], ctx) : { type: "object" } };
  }
  // 常见包装:响应实体 / 响应式 / 可空
  if (name === "ResponseEntity" || name === "Mono") {
    return t.args[0] ? resolveType(t.args[0], ctx) : undefined;
  }
  if (name === "Flux") {
    return { type: "array", items: t.args[0] ? resolveType(t.args[0], ctx) : { type: "object" } };
  }
  if (name === "Optional") {
    return { ...(t.args[0] ? resolveType(t.args[0], ctx) : { type: "object" }), nullable: true };
  }
  return undefined;
}

/** 从 Swagger/OpenAPI 注解与 Javadoc 中取描述(注解优先) */
export function schemaDescription(annotations: AnnotationInfo[], fallback?: string): string | undefined {
  const schema = findAnn(annotations, "Schema");
  const d1 = schema ? annStr(schema.args, "description", "value") : undefined;
  if (d1) {
    return d1;
  }
  const modelProp = findAnn(annotations, "ApiModelProperty");
  const d2 = modelProp ? annStr(modelProp.args, "value") : undefined;
  if (d2) {
    return d2;
  }
  return fallback && fallback.trim() ? fallback : undefined;
}

/** 注解中声明 hidden 的(@Schema(hidden=true)/@ApiModelProperty(hidden=true)) */
export function isHidden(annotations: AnnotationInfo[]): boolean {
  const schema = findAnn(annotations, "Schema");
  if (schema && annBool(schema.args, "hidden") === true) {
    return true;
  }
  const modelProp = findAnn(annotations, "ApiModelProperty");
  return !!modelProp && annBool(modelProp.args, "hidden") === true;
}

/**
 * Bean Validation 约束 -> JSON Schema:
 * @Size -> minLength/maxLength/minItems/maxItems,@Min/@Max/@DecimalMin/@DecimalMax/@Positive... -> minimum/maximum,
 * @Pattern -> pattern,@Email -> format,@NotBlank/@NotEmpty -> minLength/minItems。
 */
export function applyConstraints(annotations: AnnotationInfo[], schema: JsonSchema): JsonSchema {
  const isString = schema.type === "string";
  const isArray = schema.type === "array";

  const size = findAnn(annotations, "Size");
  if (size) {
    const min = annNum(size.args, "min");
    const max = annNum(size.args, "max");
    if (isArray) {
      if (min !== undefined) {
        schema.minItems = min;
      }
      if (max !== undefined) {
        schema.maxItems = max;
      }
    } else if (isString) {
      if (min !== undefined) {
        schema.minLength = min;
      }
      if (max !== undefined) {
        schema.maxLength = max;
      }
    }
  }

  const range = (ann: AnnotationInfo | undefined, key: "minimum" | "maximum") => {
    if (!ann) {
      return;
    }
    const v = annStr(ann.args, "value");
    const num = v !== undefined ? Number(v) : undefined;
    if (num === undefined || Number.isNaN(num)) {
      return;
    }
    schema[key] = num;
    // OpenAPI 3.0 的 exclusiveMinimum/Maximum 是布尔修饰符(3.1 才是数值),须与 minimum/maximum 同用
    const inclusive = annBool(ann.args, "inclusive");
    if (inclusive === false) {
      if (key === "minimum") {
        schema.exclusiveMinimum = true;
      } else {
        schema.exclusiveMaximum = true;
      }
    }
  };
  range(findAnn(annotations, "Min"), "minimum");
  range(findAnn(annotations, "Max"), "maximum");
  range(findAnn(annotations, "DecimalMin"), "minimum");
  range(findAnn(annotations, "DecimalMax"), "maximum");

  const positive = findAnn(annotations, "Positive", "PositiveOrZero");
  if (positive) {
    schema.minimum = 0;
    if (positive.name === "Positive") {
      schema.exclusiveMinimum = true;
    }
  }
  const negative = findAnn(annotations, "Negative", "NegativeOrZero");
  if (negative) {
    schema.maximum = 0;
    if (negative.name === "Negative") {
      schema.exclusiveMaximum = true;
    }
  }

  const pattern = findAnn(annotations, "Pattern");
  const regexp = pattern ? annStr(pattern.args, "regexp", "value") : undefined;
  if (regexp) {
    schema.pattern = regexp;
  }
  if (isString && findAnn(annotations, "Email")) {
    schema.format = "email";
  }
  if (findAnn(annotations, "NotBlank", "NotEmpty")) {
    if (isArray) {
      schema.minItems = schema.minItems ?? 1;
    } else if (isString) {
      schema.minLength = schema.minLength ?? 1;
    }
  }
  return schema;
}

function annNum(args: Record<string, unknown>, key: string): number | undefined {
  const v = args[key];
  if (typeof v === "number") {
    return v;
  }
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

/** 从注解中取 example */
export function schemaExample(annotations: AnnotationInfo[]): string | undefined {
  const schema = findAnn(annotations, "Schema");
  const e1 = schema ? annStr(schema.args, "example") : undefined;
  if (e1) {
    return e1;
  }
  const modelProp = findAnn(annotations, "ApiModelProperty");
  return modelProp ? annStr(modelProp.args, "example") : undefined;
}

/* ---------------- .apifox-helper.properties 字段级规则 ---------------- */

/**
 * 取字段的枚举类型名:字段本身是枚举,或数组/集合的元素类型是枚举(如 List<HighRiskFactorCode>、MyEnum[]),
 * 与 .apifox-helper.properties 中 helper.findClass(it.type()?.name())?.isEnum() 的判定意图对齐。
 * 非枚举返回 undefined。
 */
function enumTypeNameOf(field: FieldInfo, ctx: ResolveContext): string | undefined {
  let t = parseTypeText(field.typeText);
  // 逐层剥掉数组维度与集合包装(限 8 层,防御异常类型声明)
  for (let depth = 0; depth < 8; depth++) {
    if (t.dims > 0) {
      t = { ...t, dims: t.dims - 1 };
      continue;
    }
    const name = simpleName(t.name);
    if (COLLECTIONS.has(name) && t.args[0]) {
      t = t.args[0];
      continue;
    }
    const info = resolveScopedType(ctx.index, name, ctx.scope);
    return info && info.kind === "enum" ? name : undefined;
  }
  return undefined;
}

interface FieldRuleEngineResult {
  /** field.ignore 命中 → 忽略字段 */
  ignored: boolean;
  /** field.name 覆盖字段名 */
  fieldName?: string;
  /** field.required 覆盖 required */
  required?: boolean;
  /** 追加/设置 description 的规则结果 */
  appendDesc: (currentDesc: string | undefined, field: FieldInfo, ctx: ResolveContext) => string | undefined;
}

/** 把 RuleContext 所需的字段元数据补齐到 ctx.fieldRules 对象 */
function fieldRuleContext(field: FieldInfo, classInfo: ClassInfo, ctx: ResolveContext): RuleContext {
  const enumName = enumTypeNameOf(field, ctx);
  return {
    annotations: field.annotations,
    javadocRaw: rawJavadocOf(field),
    subject: `${classInfo.simpleName}.${field.name}`,
    fieldName: field.name,
    isEnum: enumName !== undefined,
    enumSimpleName: enumName,
  };
}

/** 返回字段 javadoc 原文(供 #tag 语法);无则 undefined */
function rawJavadocOf(field: FieldInfo): string | undefined {
  return field.javadocRaw;
}

/** 从 rules 中收集适用于某字段的全部 field.* 规则并求值 */
function fieldRuleEngine(field: FieldInfo, classInfo: ClassInfo, ctx: ResolveContext): FieldRuleEngineResult {
  const result: FieldRuleEngineResult = {
    ignored: false,
    appendDesc: (_d, _f, _c) => _d,
  };
  // enumFieldDoc 开关不依赖 rules,单独处理(集合元素为枚举时同样追加,如 List<MyEnum>)
  const enumName = ctx.options?.enumFieldDoc === true ? enumTypeNameOf(field, ctx) : undefined;
  if (enumName) {
    result.appendDesc = (_currentDesc: string | undefined, _f, _c) =>
      _currentDesc ? `${_currentDesc}\n(枚举类:${enumName})` : `(枚举类:${enumName})`;
  }
  const rules = ctx.fieldRules;
  if (!rules) {
    return result;
  }
  const rctx = fieldRuleContext(field, classInfo, ctx);
  const warn = (msg: string) => {
    ctx.fieldWarnings?.push(msg);
  };

  // field.ignore:任一命中 → 忽略
  // 语义:#tag/@ann 命中即忽略;groovy 安全形态返回非空/true 才忽略;
  // 字面量值视为“字段名等于该值”才忽略(对齐 demo 的 field.ignore=ignoreLog 用法)。
  for (const e of rules.entries) {
    if (e.key !== "field.ignore" && e.key !== "json.rule.field.ignore") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported) {
      warn(`${e.key} 条件无法求值,已跳过:${truncate(e.cond ?? "", 50)}(文件 ${e.file}:${e.line})`);
      continue;
    }
    if (!cond.hit) {
      continue;
    }
    const syn = detectValueSyntax(e.value);
    let ignoreNow = false;
    if (syn.type === "literal") {
      ignoreNow = syn.body === field.name;
    } else {
      const v = evalRuleValue(e.value, rctx, e.key, warn);
      if (v.skipped && v.reason) {
        warn(`${v.reason}(文件 ${e.file}:${e.line})`);
        continue;
      }
      ignoreNow = v.matched && v.value !== undefined && v.value !== "" && v.value !== "false";
    }
    if (ignoreNow) {
      result.ignored = true;
    }
  }
  if (result.ignored) {
    return result;
  }

  // field.name:覆盖输出名(仅字面量/简单值;规则命中且值可用才生效)
  for (const e of rules.entries) {
    if (e.key !== "field.name") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported || !cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.matched && v.value !== undefined && v.value.trim()) {
      result.fieldName = v.value;
    }
  }

  // field.required:命中 true → required;false → 非 required
  for (const e of rules.entries) {
    if (e.key !== "field.required") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported || !cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.matched) {
      result.required = v.value === "true" || v.value === "TRUE";
    }
  }

  // field.doc / field.description:收集全部命中规则(追加)
  const docRules: { text: string }[] = [];
  for (const e of rules.entries) {
    if (e.key !== "field.doc" && e.key !== "field.description" && e.key !== "json.rule.field.description") {
      continue;
    }
    const cond = evalCondition(e.cond, rctx, e.key, warn);
    if (!cond.supported) {
      warn(`${e.key} 条件无法求值,已跳过:${truncate(e.cond ?? "", 50)}(文件 ${e.file}:${e.line})`);
      continue;
    }
    if (!cond.hit) {
      continue;
    }
    const v = evalRuleValue(e.value, rctx, e.key, warn);
    if (v.skipped && v.reason) {
      warn(`${v.reason}(文件 ${e.file}:${e.line})`);
      continue;
    }
    if (v.matched && v.value !== undefined && v.value.trim()) {
      docRules.push({ text: v.value });
    }
  }
  if (docRules.length) {
    const prevAppend = result.appendDesc;
    result.appendDesc = (currentDesc, field, ctx) => {
      let d = prevAppend(currentDesc, field, ctx);
      for (const r of docRules) {
        if (!d) {
          d = r.text;
        } else if (!d.includes(r.text)) {
          d = d + "\n" + r.text;
        }
      }
      return d;
    };
  }
  return result;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

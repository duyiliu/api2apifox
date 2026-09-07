import { annBool, annStr, ClassInfo, FieldInfo, findAnn, TypeIndex } from "./model";
import { parseTypeText, simpleName, TypeRef, typeToKeyText } from "./typeText";
import { AnnotationInfo } from "./annotation";

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

/** components/schemas 注册表:同名类型 + 相同泛型实参只生成一份定义 */
export class SchemaRegistry {
  readonly schemas: Record<string, JsonSchema> = {};
  private readonly inProgress = new Set<string>();

  /** 取已存在的 $ref;不存在则用 make() 生成并登记;生成中重复请求(循环引用)返回 $ref 占位 */
  getOrAdd(key: string, make: () => JsonSchema): JsonSchema {
    const existing = this.schemas[key];
    if (existing) {
      return { $ref: `#/components/schemas/${key}` };
    }
    if (this.inProgress.has(key)) {
      return { $ref: `#/components/schemas/${key}` };
    }
    this.inProgress.add(key);
    const schema = make();
    this.schemas[key] = schema;
    this.inProgress.delete(key);
    return { $ref: `#/components/schemas/${key}` };
  }
}

export interface ResolveContext {
  index: TypeIndex;
  registry: SchemaRegistry;
  /** 泛型形参绑定:T -> TypeRef */
  bindings?: Map<string, TypeRef>;
  /** 解析选项 */
  options?: ResolveOptions;
}

export interface ResolveOptions {
  /** 简单名为 Page 的分页包装按哪个库的形态展开(默认 mybatis-plus) */
  pageStyle?: "spring-data" | "mybatis-plus";
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
  const bound = ctx.bindings?.get(name);
  if (bound) {
    return resolveType(bound, ctx);
  }

  const builtin = builtinSchema(name, t, ctx);
  if (builtin) {
    return builtin;
  }

  const page = pageSchema(name, t, ctx);
  if (page) {
    return page;
  }

  const info = ctx.index.types.get(name);
  if (!info) {
    return { type: "object", description: `未识别的类型: ${t.name}` };
  }
  if (info.kind === "enum") {
    return enumSchema(info);
  }

  const bindings = new Map<string, TypeRef>();
  info.typeParams.forEach((param, i) => {
    if (t.args[i]) {
      bindings.set(param, t.args[i]);
    }
  });
  const key = schemaKey(info, t);
  return ctx.registry.getOrAdd(key, () => classSchema(info, { ...ctx, bindings }));
}

function schemaKey(info: ClassInfo, t: TypeRef): string {
  if (!t.args.length) {
    return info.simpleName;
  }
  return info.simpleName + "«" + t.args.map(typeToKeyText).join(",") + "»";
}

function enumSchema(info: ClassInfo): JsonSchema {
  const schema: JsonSchema = { type: "string", title: info.simpleName };
  if (info.enumConstants.length) {
    schema.enum = [...info.enumConstants];
  }
  const desc = schemaDescription(info.annotations, info.javadoc?.description);
  if (desc) {
    schema.description = desc;
  }
  return schema;
}

function classSchema(info: ClassInfo, ctx: ResolveContext): JsonSchema {
  const fields: FieldInfo[] = info.fields.length ? info.fields : info.recordComponents;

  // 父类字段(含父类泛型绑定)
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  if (info.superClass) {
    const supRef = parseTypeText(info.superClass);
    const supInfo = ctx.index.types.get(simpleName(supRef.name));
    if (supInfo && supInfo.kind !== "enum") {
      const supBindings = new Map<string, TypeRef>();
      supInfo.typeParams.forEach((p, i) => {
        if (supRef.args[i]) {
          supBindings.set(p, supRef.args[i]);
        }
      });
      const supSchema = classSchema(supInfo, { ...ctx, bindings: supBindings });
      Object.assign(properties, supSchema.properties ?? {});
      required.push(...(supSchema.required ?? []));
    }
  }

  for (const field of fields) {
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
      (jsonProp ? annStr(jsonProp.args, "value", "name") : undefined) ??
      (gsonName ? annStr(gsonName.args, "value", "name") : undefined) ??
      (fastName ? annStr(fastName.args, "name") : undefined) ??
      field.name;
    const schema = resolveTypeText(field.typeText, ctx);
    const desc = schemaDescription(field.annotations, field.javadoc?.description);
    if (desc) {
      schema.description = desc;
    }
    const example = schemaExample(field.annotations);
    if (example) {
      schema.example = example;
    }
    applyConstraints(field.annotations, schema);
    properties[propName] = schema;

    const isRequired =
      annBool(jsonProp?.args ?? {}, "required") === true ||
      !!findAnn(field.annotations, "NotNull", "NotBlank", "NotEmpty");
    if (isRequired && !required.includes(propName)) {
      required.push(propName);
    }
  }

  const schema: JsonSchema = {
    type: "object",
    title: info.simpleName,
    description: schemaDescription(info.annotations, info.javadoc?.description),
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

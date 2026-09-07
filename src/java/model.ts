import { AnnotationArgs, AnnotationInfo } from "./annotation";
import { JavadocInfo } from "./javadoc";

export { AnnotationArgs, AnnotationInfo };

/** 扫描输入:文件路径 + 内容 */
export interface SourceFile {
  /** 文件路径(作为标识) */
  fsPath: string;
  content: string;
}

export type TypeKind = "class" | "enum" | "record" | "interface";

export interface FieldInfo {
  name: string;
  /** 源码切片的类型文本 */
  typeText: string;
  annotations: AnnotationInfo[];
  javadoc?: JavadocInfo;
}

export interface ClassInfo {
  simpleName: string;
  qualifiedName: string;
  kind: TypeKind;
  /** 泛型形参名列表,如 ["T","R"] */
  typeParams: string[];
  fields: FieldInfo[];
  /** record 组件(有值时 fields 为空) */
  recordComponents: FieldInfo[];
  enumConstants: string[];
  annotations: AnnotationInfo[];
  javadoc?: JavadocInfo;
  /** extends 的类型文本(含泛型实参) */
  superClass?: string;
}

/** 全项目类型索引 */
export interface TypeIndex {
  /** 简单名 -> ClassInfo(重名时后扫到的覆盖;同项目内简单名通常唯一) */
  types: Map<string, ClassInfo>;
  /** 文件路径 -> 该文件定义的类型简单名 */
  byFile: Map<string, string[]>;
}

/** 一个 REST 接口(OpenAPI Operation 的中间表示) */
export interface ParameterInfo {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  typeText: string;
  required: boolean;
  description?: string;
  example?: string;
  defaultValue?: string;
  /** 参数级注解(用于 Bean Validation 约束映射) */
  annotations?: AnnotationInfo[];
}

export interface RequestBodyInfo {
  typeText: string;
  required: boolean;
  description?: string;
  /** 文件上传(multipart/form-data)字段;有值时 typeText 为 __multipart__ */
  formFields?: ParameterInfo[];
}

/** 非默认的响应声明(@ApiResponse/@ApiResponses/@ResponseStatus) */
export interface ResponseInfo {
  /** HTTP 状态码文本,如 "404" */
  code: string;
  description?: string;
  /** 响应体类型文本(来自 @Schema(implementation=X.class)) */
  schemaText?: string;
}

/** 接口来源风格 */
export type EndpointFlavor = "spring-mvc" | "jaxrs" | "feign" | "actuator";

export interface EndpointInfo {
  /** GET/POST/... */
  method: string;
  /** 接口路径(含类级前缀) */
  path: string;
  /** 归属 tag(通常为 Controller 名或 @Tag) */
  tag: string;
  operationId: string;
  summary?: string;
  description?: string;
  parameters: ParameterInfo[];
  requestBody?: RequestBodyInfo;
  /** 返回类型文本;void 为 undefined */
  returnType?: string;
  responseDescription?: string;
  /** 所属源文件 */
  fsPath: string;
  /** Controller 简单名 */
  controller: string;
  /** spring-mvc / jaxrs / feign / actuator */
  flavor: EndpointFlavor;
  /** 额外响应(@ApiResponse/@ResponseStatus 等) */
  extraResponses?: ResponseInfo[];
  /** 请求体媒体类型(@Consumes),已映射为 mime */
  consumes?: string[];
  /** 响应媒体类型(@Produces),已映射为 mime */
  produces?: string[];
  /** 方法声明位置(源码 offset,闭区间) */
  methodRange?: { startOffset: number; endOffset: number; startLine: number };
  /** 方法已 @Deprecated */
  deprecated?: boolean;
}

export interface ParseResult {
  endpoints: EndpointInfo[];
  /** 解析过程中的告警(无法识别的参数等) */
  warnings: string[];
}

/** AnnotationArgs 便捷读取 */
export function annStr(args: AnnotationArgs, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = args[k];
    if (typeof v === "string") {
      return v;
    }
    if (typeof v === "number" || typeof v === "boolean") {
      return String(v);
    }
  }
  return undefined;
}

export function annArray(args: AnnotationArgs, ...keys: string[]): string[] {
  for (const k of keys) {
    const v = args[k];
    if (Array.isArray(v)) {
      return v.map(String);
    }
    if (v !== undefined) {
      return [String(v)];
    }
  }
  return [];
}

export function annBool(args: AnnotationArgs, key: string): boolean | undefined {
  const v = args[key];
  return typeof v === "boolean" ? v : undefined;
}

export function findAnn(annotations: AnnotationInfo[], ...names: string[]): AnnotationInfo | undefined {
  return annotations.find((a) => names.includes(a.name));
}

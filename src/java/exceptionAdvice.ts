import { collectAnnotations, splitTopLevel } from "./annotation";
import { CstNode, childAll, childNode, findAll, isCstNode, nodeJavadoc, nodeText, tokenImage, typeNameOf } from "./cst";
import { parseJavadoc } from "./javadoc";
import { normalizeStatus } from "./httpStatus";
import { annArray, annStr, AnnotationInfo, findAnn, ResponseInfo, TypeIndex } from "./model";
import { ParsedFile } from "./typeIndex";

/**
 * 一个 @ExceptionHandler 方法产出的响应:状态码 + 错误体类型(来自方法返回类型)。
 * schemaText 未声明(Void/void/裸 ResponseEntity)时不产出响应体。
 */
export interface ExceptionAdviceResponse extends ResponseInfo {
  /** 声明 handler 的 advice 类型名(告警用) */
  adviceType: string;
  /** handler 方法名(告警用) */
  methodName: string;
  /** @ExceptionHandler 声明的异常类型简单名 */
  exceptionTypes: string[];
}

/**
 * 一个 @RestControllerAdvice/@ControllerAdvice 类。
 * 无 basePackages/basePackageClasses/assignableTypes 为全局 advice;否则按包/类型收窄。
 */
export interface ExceptionAdvice {
  adviceType: string;
  /** advice 自身包名 */
  packageName?: string;
  basePackages: string[];
  basePackageClasses: string[];
  assignableTypes: string[];
  /** 收窄声明(任一限定属性存在) */
  narrow: boolean;
  responses: ExceptionAdviceResponse[];
}

interface AdviceMethodSite {
  method: CstNode;
  wrapper: CstNode;
  annotations: AnnotationInfo[];
}

/** 顶层类型声明:类声明包装节点 + 内层 normalClassDeclaration */
interface AdviceTypeSite {
  pf: ParsedFile;
  carrier: CstNode;
  inner: CstNode;
  typeName: string;
  annotations: AnnotationInfo[];
  packageName?: string;
}

function packageOf(source: string): string | undefined {
  return /^\s*package\s+([\w.]+)\s*;/m.exec(source)?.[1];
}

function adviceTypes(files: ParsedFile[]): AdviceTypeSite[] {
  const out: AdviceTypeSite[] = [];
  for (const pf of files) {
    if (pf.parseError) {
      continue;
    }
    for (const typeDecl of findAll(pf.cst, "typeDeclaration")) {
      const classDecl = childNode(typeDecl, "classDeclaration");
      const normal = classDecl ? childNode(classDecl, "normalClassDeclaration") : undefined;
      if (!normal) {
        continue;
      }
      const annotations = collectAnnotations(
        [...childAll(classDecl, "classModifier"), ...childAll(normal, "classModifier")].filter(isCstNode),
        pf.source
      );
      if (!findAnn(annotations, "RestControllerAdvice", "ControllerAdvice")) {
        continue;
      }
      const typeName = typeNameOf(normal);
      if (!typeName) {
        continue;
      }
      out.push({ pf, carrier: typeDecl, inner: normal, typeName, annotations, packageName: packageOf(pf.source) });
    }
  }
  return out;
}

/** 类体内直接声明的方法(不展开父类:advice 的 handler 必须有方法体,继承 handler 极少见) */
function adviceMethodsOf(site: AdviceTypeSite): AdviceMethodSite[] {
  const out: AdviceMethodSite[] = [];
  for (const member of childAll(childNode(site.inner, "classBody"), "classBodyDeclaration").filter(isCstNode)) {
    const memberDecl = childNode(member, "classMemberDeclaration") ?? childNode(member, "memberDeclaration");
    const method = childNode(memberDecl, "methodDeclaration");
    if (!method) {
      continue;
    }
    const annotations = collectAnnotations(childAll(method, "methodModifier").filter(isCstNode), site.pf.source);
    out.push({ method, wrapper: member, annotations });
  }
  return out;
}

/** "ParamException.class" / {A.class, B.class} -> ["ParamException"] */
function exceptionTypesOf(ann: AnnotationInfo): string[] {
  return annArray(ann.args, "value", "exception")
    .map((raw) => raw.trim().replace(/\.class$/, ""))
    .map((raw) => (raw.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw))
    .filter(Boolean);
}

/** ResponseEntity 的工厂方法名 -> 状态码 */
const RESPONSE_ENTITY_FACTORIES: Record<string, string> = {
  ok: "200", created: "201", accepted: "202", noContent: "204",
  badRequest: "400", unauthorized: "401", forbidden: "403", notFound: "404",
  conflict: "409", unprocessableEntity: "422", tooManyRequests: "429",
  internalServerError: "500", badGateway: "502", serviceUnavailable: "503",
};

/**
 * ResponseEntity 的状态码:优先 ResponseEntity.status(HttpStatus.X|数字),
 * 其次 ResponseEntity.badRequest()/notFound() 等工厂方法。
 */
function statusFromBody(bodyText: string): string | undefined {
  const statusCall = /ResponseEntity\s*\.\s*status\s*\(\s*([\w.]+)\s*\)/.exec(bodyText);
  if (statusCall) {
    const code = normalizeStatus(statusCall[1]);
    return /^\d{3}$/.test(code) ? code : undefined;
  }
  const factory = /ResponseEntity\s*\.\s*(\w+)\s*\(/.exec(bodyText);
  if (factory) {
    return RESPONSE_ENTITY_FACTORIES[factory[1]];
  }
  // new ResponseEntity<>(body, HttpStatus.X) / (body, headers, 201):按顶层逗号切参,末参或次参为状态码
  const ctorStart = bodyText.indexOf("new ResponseEntity");
  const open = ctorStart >= 0 ? firstParenAfter(bodyText, ctorStart) : -1;
  const close = open >= 0 ? matchingParen(bodyText, open) : -1;
  if (open >= 0 && close > open) {
    const args = splitTopLevel(bodyText.slice(open + 1, close));
    const candidate = (args.length >= 3 ? args[2] : args[1])?.trim();
    if (candidate) {
      const code = normalizeStatus(candidate);
      if (/^\d{3}$/.test(code)) {
        return code;
      }
    }
  }
  return undefined;
}

function firstParenAfter(text: string, from: number): number {
  for (let i = from; i < text.length; i++) {
    if (text[i] === "(") {
      return i;
    }
  }
  return -1;
}

/** 从左括号位置找配对的右括号(忽略字符串字面量) */
function matchingParen(text: string, open: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") {
        i++;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "(") {
      depth++;
    } else if (ch === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

/** 剥离 ResponseEntity/HttpEntity 外壳;void/Void/裸 ResponseEntity 表示无响应体 */
function responseBodyType(returnType: string | undefined): string | undefined {
  if (!returnType) {
    return undefined;
  }
  let t = returnType.trim();
  const generic = /^(?:ResponseEntity|HttpEntity)\s*<(.*)>$/.exec(t);
  if (generic) {
    t = generic[1].trim();
  } else if (/^(?:ResponseEntity|HttpEntity)$/.test(t)) {
    return undefined;
  }
  if (!t || t === "void" || t === "Void") {
    return undefined;
  }
  return t;
}

function returnTypeOf(pf: ParsedFile, method: CstNode): string | undefined {
  const header = childNode(method, "methodHeader") ?? method;
  const result = childNode(header, "result");
  const unannType = result ? childNode(result, "unannType") : undefined;
  return unannType ? nodeText(pf.source, unannType).trim() : undefined;
}

/** 单个 advice 类 -> 响应列表(状态码无法解析的 handler 通过 warnings 上报并跳过) */
function responsesOf(site: AdviceTypeSite, warnings: string[]): ExceptionAdviceResponse[] {
  const out: ExceptionAdviceResponse[] = [];
  for (const { method, wrapper, annotations } of adviceMethodsOf(site)) {
    const handler = findAnn(annotations, "ExceptionHandler");
    if (!handler) {
      continue;
    }
    const header = childNode(method, "methodHeader") ?? method;
    const declarator = childNode(header, "methodDeclarator");
    const methodName = tokenImage(declarator, "Identifier") ?? "";
    const exceptionTypes = exceptionTypesOf(handler);
    const javadoc = parseJavadoc(nodeJavadoc(wrapper));

    const returnType = returnTypeOf(site.pf, method);
    const returnsResponseEntity = !!returnType && /^(ResponseEntity|HttpEntity)\b/.test(returnType.trim());
    const statusAnn = findAnn(annotations, "ResponseStatus");
    const declared = statusAnn ? normalizeStatus(annStr(statusAnn.args, "value", "code") ?? "") : "";
    const declaredCode = /^\d{3}$/.test(declared) ? declared : undefined;
    // Spring 口径:返回 ResponseEntity 时其状态码优先于方法级 @ResponseStatus
    const code = returnsResponseEntity
      ? statusFromBody(nodeText(site.pf.source, method)) ?? declaredCode
      : declaredCode;
    if (!code) {
      // 告警以 @ExceptionHandler 开头,不落入 `Controller.method:` 归属规则,
      // 单接口子集同步时也不会被 filterWarningsForEndpoints 当作他人告警丢弃
      warnings.push(
        `@ExceptionHandler ${site.typeName}.${methodName}: 未声明可解析的状态码(@ResponseStatus 或 ResponseEntity.status),已跳过该错误响应`
      );
      continue;
    }
    const description =
      (statusAnn ? annStr(statusAnn.args, "reason") : undefined) ||
      javadoc?.returns?.trim() ||
      javadoc?.firstLine ||
      undefined;
    out.push({
      code,
      description,
      schemaText: responseBodyType(returnType),
      adviceType: site.typeName,
      methodName,
      exceptionTypes,
    });
  }
  return out;
}

/** 收集全部 advice(声明顺序;文件间顺序与扫描输入一致) */
export function collectExceptionAdvices(
  files: ParsedFile[],
  index: TypeIndex | undefined,
  warnings: string[]
): ExceptionAdvice[] {
  const out: ExceptionAdvice[] = [];
  for (const site of adviceTypes(files)) {
    const adviceAnn = findAnn(site.annotations, "RestControllerAdvice", "ControllerAdvice");
    const args = adviceAnn?.args ?? {};
    // @ControllerAdvice("com.example") 的 value 是 basePackages 的别名
    const basePackages = annArray(args, "basePackages", "value").map((p) => p.trim()).filter(Boolean);
    const basePackageClasses = annArray(args, "basePackageClasses")
      .map((raw) => raw.trim().replace(/\.class$/, ""))
      .map((raw) => qualifiedNameOf(raw, index))
      .filter(Boolean);
    const assignableTypes = annArray(args, "assignableTypes")
      .map((raw) => raw.trim().replace(/\.class$/, ""))
      .map((raw) => qualifiedNameOf(raw, index))
      .filter(Boolean);
    out.push({
      adviceType: site.typeName,
      packageName: site.packageName,
      basePackages,
      basePackageClasses,
      assignableTypes,
      narrow: basePackages.length > 0 || basePackageClasses.length > 0 || assignableTypes.length > 0,
      responses: responsesOf(site, warnings),
    });
  }
  return out;
}

/** 源码索引能定位时补全为全限定名(包名匹配才可靠) */
function qualifiedNameOf(name: string, index: TypeIndex | undefined): string {
  if (name.includes(".")) {
    return name;
  }
  return index?.types.get(name)?.qualifiedName ?? name;
}

/**
 * advice 是否作用于该 Controller:
 * - 全局 advice 恒为 true;
 * - basePackages/basePackageClasses 按包名前缀匹配;
 * - assignableTypes 匹配 Controller 自身或其父类/接口链上的类型名(简单名或全限定名)。
 */
export function adviceMatchesController(
  advice: ExceptionAdvice,
  controller: { qualifiedName?: string; hierarchy: readonly string[] }
): boolean {
  if (!advice.narrow) {
    return true;
  }
  const pkg = controller.qualifiedName?.includes(".")
    ? controller.qualifiedName.slice(0, controller.qualifiedName.lastIndexOf("."))
    : "";
  const inPackage = (base: string): boolean => {
    const prefix = base.trim();
    return !!pkg && !!prefix && (pkg === prefix || pkg.startsWith(`${prefix}.`));
  };
  if (advice.basePackages.some(inPackage)) {
    return true;
  }
  // basePackageClasses 取其所在包(索引可定位时为全限定名)
  if (
    advice.basePackageClasses.some((qualified) =>
      inPackage(qualified.includes(".") ? qualified.slice(0, qualified.lastIndexOf(".")) : "")
    )
  ) {
    return true;
  }
  const names = new Set(controller.hierarchy.flatMap((n) => [n, n.slice(n.lastIndexOf(".") + 1)]));
  if (controller.qualifiedName) {
    names.add(controller.qualifiedName);
  }
  for (const type of advice.assignableTypes) {
    if (names.has(type) || names.has(type.slice(type.lastIndexOf(".") + 1))) {
      return true;
    }
  }
  return false;
}

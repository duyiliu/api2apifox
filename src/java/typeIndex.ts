import { parse } from "java-parser";
import { collectAnnotations, parseArgsText } from "./annotation";
import { CstNode, childAll, childNode, findAll, isCstNode, nodeJavadoc, nodeText, tokenImage, typeNameOf } from "./cst";
import { parseJavadoc } from "./javadoc";
import { AnnotationInfo, annStr, ClassInfo, FieldInfo, findAnn, TypeIndex, TypeKind } from "./model";
import { parseTypeText, simpleName } from "./typeText";

export interface ParsedFile {
  fsPath: string;
  source: string;
  cst: CstNode;
}

/** 解析单个 Java 源文件 */
export function parseJava(fsPath: string, content: string): ParsedFile {
  return { fsPath, source: content, cst: parse(content) as CstNode };
}

function childNodes(node: CstNode | undefined, key: string): CstNode[] {
  return childAll(node, key).filter(isCstNode);
}

function hasModifier(mods: CstNode[], name: string): boolean {
  return mods.some((m) => Object.keys(m.children ?? {}).includes(name));
}

/** 类级 Javadoc 附着在 typeDeclaration(包装节点)上 */
function javadocOf(...nodes: (CstNode | undefined)[]) {
  for (const n of nodes) {
    const jd = parseJavadoc(nodeJavadoc(n));
    if (jd) {
      return jd;
    }
  }
  return undefined;
}

/** 从若干节点(包装层与声明层)收集 classModifier 上的注解 */
function annotationsOf(...nodes: (CstNode | undefined)[]) {
  const out: CstNode[] = [];
  for (const n of nodes) {
    out.push(...childNodes(n, "classModifier"));
  }
  return out;
}

function collectFields(classBody: CstNode | undefined, source: string): FieldInfo[] {
  const fields: FieldInfo[] = [];
  for (const bodyDecl of childNodes(classBody, "classBodyDeclaration")) {
    const member = childNode(bodyDecl, "classMemberDeclaration") ?? childNode(bodyDecl, "memberDeclaration");
    const fd = childNode(member, "fieldDeclaration");
    if (!fd) {
      continue;
    }
    const mods = childNodes(fd, "fieldModifier");
    if (hasModifier(mods, "static")) {
      continue; // 静态常量不作为模型属性
    }
    const typeNode = childNode(fd, "unannType");
    const typeText = typeNode ? nodeText(source, typeNode).trim() : "Object";
    const javadocRaw = nodeJavadoc(bodyDecl);
    const javadoc = parseJavadoc(javadocRaw);
    const vdl = childNode(fd, "variableDeclaratorList");
    for (const vd of childNodes(vdl, "variableDeclarator")) {
      const name = tokenImage(childNode(vd, "variableDeclaratorId"), "Identifier");
      if (!name) {
        continue;
      }
      fields.push({ name, typeText, annotations: collectAnnotations(mods, source), javadoc, javadocRaw });
    }
  }
  return fields;
}

function typeParamsOf(decl: CstNode | undefined): string[] {
  const tp = childNode(decl, "typeParameters");
  if (!tp) {
    return [];
  }
  const list = childNode(tp, "typeParameterList") ?? tp;
  return childNodes(list, "typeParameter")
    .map((n) => typeNameOf(n))
    .filter((s) => s.length > 0);
}

interface EnumConstantDetail {
  name: string;
  annotations: AnnotationInfo[];
  args: string[];
  javadoc?: string;
}

interface EnumDetails {
  constants: string[];
  values: string[];
  docs: (string | undefined)[];
  warning?: string;
}

function enumConstantsOf(decl: CstNode, source: string): EnumConstantDetail[] {
  const list = childNode(childNode(decl, "enumBody"), "enumConstantList");
  // 首个常量前的 javadoc 会挂到 enumConstantList 上(后续常量挂各自节点),与 record 组件一致
  const listJavadoc = nodeJavadoc(list);
  const out: EnumConstantDetail[] = [];
  childNodes(list, "enumConstant").forEach((c, index) => {
    const name = tokenImage(c, "Identifier");
    if (!name) {
      return;
    }
    const args = childNodes(childNode(c, "argumentList"), "expression").map((e) => nodeText(source, e).trim());
    const javadocRaw = nodeJavadoc(c) ?? (index === 0 ? listJavadoc : undefined);
    const jd = parseJavadoc(javadocRaw);
    out.push({
      name,
      annotations: collectAnnotations(childNodes(c, "enumConstantModifier"), source),
      args,
      javadoc: jd?.description || jd?.firstLine || undefined,
    });
  });
  return out;
}

/** 枚举构造器及其形参名(按声明顺序,用于常量实参定位) */
function enumConstructorsOf(decl: CstNode): { node: CstNode; params: string[] }[] {
  const decls = childNode(childNode(decl, "enumBody"), "enumBodyDeclarations");
  const out: { node: CstNode; params: string[] }[] = [];
  for (const bd of childNodes(decls, "classBodyDeclaration")) {
    const ctor = childNode(bd, "constructorDeclaration");
    if (!ctor) {
      continue;
    }
    const list = childNode(childNode(ctor, "constructorDeclarator"), "formalParameterList");
    const params = childNodes(list, "formalParameter").map((p) => {
      const vd = findAll(p, "variableDeclaratorId")[0];
      return tokenImage(vd, "Identifier") ?? "";
    });
    out.push({ node: ctor, params });
  }
  return out;
}

/** @JsonValue 方法及其 return 的字段名(仅支持 return code / return this.code) */
function jsonValueFieldOf(decl: CstNode, source: string): { found: boolean; field?: string } {
  const decls = childNode(childNode(decl, "enumBody"), "enumBodyDeclarations");
  for (const bd of childNodes(decls, "classBodyDeclaration")) {
    const member = childNode(bd, "classMemberDeclaration") ?? childNode(bd, "memberDeclaration") ?? bd;
    const method = childNode(member, "methodDeclaration");
    if (!method) {
      continue;
    }
    if (!findAnn(collectAnnotations(childNodes(method, "methodModifier"), source), "JsonValue")) {
      continue;
    }
    const expression = childNode(findAll(method, "returnStatement")[0], "expression");
    const text = expression ? nodeText(source, expression).trim() : "";
    const m = /^(?:this\s*\.\s*)?([A-Za-z_$][\w$]*)$/.exec(text);
    return m ? { found: true, field: m[1] } : { found: true };
  }
  return { found: false };
}

/** 返回值字段对应到构造参数下标的路径:优先同名形参,其次 this.field = param 赋值 */
function constructorParamIndexFor(field: string, ctors: { node: CstNode; params: string[] }[], source: string): number | undefined {
  for (const ctor of ctors) {
    const index = ctor.params.indexOf(field);
    if (index >= 0) {
      return index;
    }
  }
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const ctor of ctors) {
    const body = childNode(ctor.node, "constructorBody");
    if (!body) {
      continue;
    }
    const m = new RegExp(`this\\s*\\.\\s*${escaped}\\s*=\\s*([A-Za-z_$][\\w$]*)\\s*;`).exec(nodeText(source, body));
    const param = m?.[1];
    const index = param ? ctor.params.indexOf(param) : -1;
    if (index >= 0) {
      return index;
    }
  }
  return undefined;
}

/** 枚举构造实参的简单字面量 -> 文档值;非字面量表达式视为不可解析 */
function enumArgumentValue(text: string): string | undefined {
  const t = text.trim();
  if (!t) {
    return undefined;
  }
  if (t === "null" || t === "true" || t === "false") {
    return t;
  }
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?[fFdDlL]?$/.test(t)) {
    return t.replace(/[fFdDlL]$/, "");
  }
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    const value = parseArgsText(t).value;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

function enumDetailsOf(decl: CstNode, source: string, displayName: string): EnumDetails {
  const details = enumConstantsOf(decl, source);
  const constants = details.map((d) => d.name);
  const docs = details.map((d) => d.javadoc);
  const jsonValue = jsonValueFieldOf(decl, source);
  const ctors = enumConstructorsOf(decl);
  const paramIndex = jsonValue.field ? constructorParamIndexFor(jsonValue.field, ctors, source) : undefined;
  let unresolved = false;
  const values = details.map((d) => {
    // @JsonProperty 优先于 @JsonValue
    const prop = findAnn(d.annotations, "JsonProperty");
    const propValue = prop ? annStr(prop.args, "value", "name") : undefined;
    if (propValue !== undefined) {
      return propValue;
    }
    if (!jsonValue.found) {
      return d.name;
    }
    if (paramIndex !== undefined && paramIndex < d.args.length) {
      const value = enumArgumentValue(d.args[paramIndex]);
      if (value !== undefined) {
        return value;
      }
    }
    unresolved = true;
    return d.name;
  });
  return {
    constants,
    values,
    docs,
    ...(unresolved ? { warning: `枚举 ${displayName} 的 @JsonValue 无法解析,已回退常量名` } : {}),
  };
}

function recordComponentsOf(decl: CstNode, source: string): FieldInfo[] {
  const list = childNode(childNode(decl, "recordHeader"), "recordComponentList");
  // 首个组件前的 javadoc 会挂到 recordComponentList 上(后续组件挂各自节点),故首个组件回退取列表节点的注释
  const listJavadoc = nodeJavadoc(list);
  return childNodes(list, "recordComponent").map((rc, index) => {
    const typeNode = childNode(rc, "unannType");
    // record 组件的注解挂在 recordComponentModifier(非字段的 variableModifier)
    const javadocRaw = nodeJavadoc(rc) ?? (index === 0 ? listJavadoc : undefined);
    return {
      name: tokenImage(rc, "Identifier") ?? "",
      typeText: typeNode ? nodeText(source, typeNode).trim() : "Object",
      annotations: collectAnnotations(childNodes(rc, "recordComponentModifier"), source),
      javadoc: parseJavadoc(javadocRaw),
      javadocRaw,
    };
  });
}

/**
 * 取类的父类类型文本(如 "BaseQuery<String>")。
 * java-parser 的节点名是 classExtends(内含 classType),而非 superclass;此前用错名字导致
 * 继承从未生效——父类字段在响应模型与查询 Bean 展开中都会静默丢失。
 */
function superClassOf(normal: CstNode, source: string): string | undefined {
  const sup = childNode(normal, "classExtends");
  if (!sup) {
    return undefined;
  }
  const typeNode = findFirstType(sup);
  if (!typeNode) {
    return undefined;
  }
  const text = nodeText(source, typeNode).trim();
  return text && parseTypeText(text).name !== "Object" ? text : undefined;
}

/** 在子树中找第一个类型节点(unannClassOrInterfaceType / unannType / classType) */
function findFirstType(node: CstNode): CstNode | undefined {
  return (
    childNode(node, "unannClassOrInterfaceType") ??
    childNode(node, "unannType") ??
    childNode(node, "classType") ??
    findAll(node, "unannClassOrInterfaceType")[0] ??
    findAll(node, "classType")[0]
  );
}

/** 取 classDeclaration/interfaceDeclaration 内层的实际类型声明节点 */
function innerTypeDeclOf(decl: CstNode): CstNode | undefined {
  return (
    childNode(decl, "normalClassDeclaration") ??
    childNode(decl, "enumDeclaration") ??
    childNode(decl, "recordDeclaration") ??
    childNode(decl, "normalInterfaceDeclaration")
  );
}

/** 取类型声明的体节点(classBody/interfaceBody/enumBody/recordBody) */
function typeBodyOf(decl: CstNode): CstNode | undefined {
  const inner = innerTypeDeclOf(decl);
  if (!inner) {
    return undefined;
  }
  return (
    childNode(inner, "classBody") ??
    childNode(inner, "interfaceBody") ??
    childNode(inner, "enumBody") ??
    childNode(inner, "recordBody")
  );
}

/** 全限定名:package + 外层类型链 + 简单名(嵌套类型如 `pkg.Outer.Inner`) */
function qualify(source: string, simpleName: string, enclosing: string[] = []): string {
  const m = /^\s*package\s+([\w.]+)\s*;/m.exec(source);
  return [m?.[1], ...enclosing, simpleName].filter(Boolean).join(".");
}

/**
 * 由 classDeclaration / interfaceDeclaration 构建 ClassInfo(class/enum/record/interface)。
 * enclosing:外层类型简单名链(由外向内);javadocCarriers:注释可能挂靠的外层节点(顶层为 typeDeclaration,
 * 嵌套为 classBodyDeclaration / interfaceMemberDeclaration),按“由外向内”的顺序传入。
 */
function classInfoOf(
  decl: CstNode,
  source: string,
  enclosing: string[] = [],
  ...javadocCarriers: (CstNode | undefined)[]
): ClassInfo | undefined {
  const normal = childNode(decl, "normalClassDeclaration");
  const enumDecl = childNode(decl, "enumDeclaration");
  const recordDecl = childNode(decl, "recordDeclaration");
  const normalItf = childNode(decl, "normalInterfaceDeclaration");
  const inner = normal ?? enumDecl ?? recordDecl ?? normalItf;
  if (!inner) {
    return undefined;
  }
  const simpleName = typeNameOf(inner);
  if (!simpleName) {
    return undefined;
  }
  const base = {
    simpleName,
    qualifiedName: qualify(source, simpleName, enclosing),
    ...(enclosing.length ? { enclosing: [...enclosing] } : {}),
    annotations: collectAnnotations(annotationsOf(decl, inner), source),
    javadoc: javadocOf(...javadocCarriers, decl, inner),
  };
  if (normal) {
    return {
      ...base,
      kind: "class",
      typeParams: typeParamsOf(normal),
      fields: collectFields(childNode(normal, "classBody"), source),
      recordComponents: [],
      enumConstants: [],
      enumValues: [],
      enumDocs: [],
      superClass: superClassOf(normal, source),
    };
  }
  if (enumDecl) {
    const details = enumDetailsOf(enumDecl, source, base.qualifiedName);
    return {
      ...base,
      kind: "enum",
      typeParams: [],
      fields: [],
      recordComponents: [],
      enumConstants: details.constants,
      enumValues: details.values,
      enumDocs: details.docs,
      ...(details.warning ? { enumValueWarning: details.warning } : {}),
    };
  }
  if (recordDecl) {
    return {
      ...base,
      kind: "record",
      typeParams: typeParamsOf(recordDecl),
      fields: [],
      recordComponents: recordComponentsOf(recordDecl, source),
      enumConstants: [],
      enumValues: [],
      enumDocs: [],
    };
  }
  return {
    ...base,
    kind: "interface" as TypeKind,
    typeParams: typeParamsOf(normalItf),
    fields: [],
    recordComponents: [],
    enumConstants: [],
    enumValues: [],
    enumDocs: [],
  };
}

/** 取类/接口/枚举体中的直接成员类型声明及其中间载体节点(供 javadoc 挂靠) */
function directMemberTypeDecls(body: CstNode | undefined): { decl: CstNode; carrier: CstNode }[] {
  const out: { decl: CstNode; carrier: CstNode }[] = [];
  const consider = (carrier: CstNode) => {
    const member =
      childNode(carrier, "classMemberDeclaration") ?? childNode(carrier, "interfaceMemberDeclaration") ?? carrier;
    const decl = childNode(member, "classDeclaration") ?? childNode(member, "interfaceDeclaration");
    if (decl) {
      out.push({ decl, carrier });
    }
  };
  for (const bd of childNodes(body, "classBodyDeclaration")) {
    consider(bd);
  }
  for (const im of childNodes(body, "interfaceMemberDeclaration")) {
    consider(im);
  }
  // 枚举体:`{ A, B; class Inner {...} }` 的成员挂在 enumBodyDeclarations 下
  const enumBodyDecls = childNode(body, "enumBodyDeclarations");
  if (enumBodyDecls) {
    for (const bd of childNodes(enumBodyDecls, "classBodyDeclaration")) {
      consider(bd);
    }
  }
  return out;
}

/**
 * 递归登记一个类型声明(顶层或嵌套)及其成员类型。
 * 嵌套类型同时进入 nested(始终登记,键为 `Outer.Inner`)与 types(仅当简单名未被占用,维持顶层优先)。
 */
function indexTypeDecl(
  pf: ParsedFile,
  decl: CstNode,
  carrier: CstNode | undefined,
  enclosing: string[],
  out: { types: Map<string, ClassInfo>; nested: Map<string, ClassInfo>; names: string[] }
): void {
  const info = classInfoOf(decl, pf.source, enclosing, carrier);
  if (!info) {
    return;
  }
  if (enclosing.length) {
    out.nested.set([...enclosing, info.simpleName].join("."), info);
    if (!out.types.has(info.simpleName)) {
      out.types.set(info.simpleName, info);
      out.names.push(info.simpleName);
    }
  } else {
    out.types.set(info.simpleName, info);
    out.names.push(info.simpleName);
  }
  const body = typeBodyOf(decl);
  for (const member of directMemberTypeDecls(body)) {
    indexTypeDecl(pf, member.decl, member.carrier, [...enclosing, info.simpleName], out);
  }
}

/** 构建类型索引:顶层声明 + 类/接口/record/枚举体内的嵌套类型声明(递归) */
export function buildIndex(files: ParsedFile[]): TypeIndex {
  const types = new Map<string, ClassInfo>();
  const nested = new Map<string, ClassInfo>();
  const byFile = new Map<string, string[]>();

  for (const pf of files) {
    const names: string[] = [];
    const out = { types, nested, names };

    // ---- 顶层声明 ----
    for (const typeDecl of findAll(pf.cst, "typeDeclaration")) {
      const decl = childNode(typeDecl, "classDeclaration") ?? childNode(typeDecl, "interfaceDeclaration");
      if (!decl) {
        continue;
      }
      indexTypeDecl(pf, decl, typeDecl, [], out);
    }

    byFile.set(pf.fsPath, names);
  }
  return { types, nested, byFile };
}

/**
 * 按 Java 作用域查找类型:类体内对简单名的引用优先命中该类的成员类型(嵌套类型遮蔽顶层同名类型),
 * 逐层向外(内层 → 外层 → 顶层)回退;也支持显式 `Outer.Inner` / `pkg.Outer.Inner` 写法。
 * scope 为由内向外的完整成员路径(如 Outer.Inner → Outer);未命中时回退顶层/依赖 jar 索引。
 * 与 IDEA 版基于 PSI(PsiType.resolve)的解析口径对齐。
 */
export function resolveScopedType(index: TypeIndex, name: string, scope?: readonly string[]): ClassInfo | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return undefined;
  }
  // 相对成员路径也按当前作用域补全,例如 Outer 中的 Inner.Item。
  for (const enc of scope ?? []) {
    const hit = index.nested.get(`${enc}.${trimmed}`);
    if (hit) {
      return hit;
    }
  }
  // 显式限定名:逐段剥掉前导包名,尝试嵌套键 `Outer.Inner`
  if (trimmed.includes(".")) {
    const parts = trimmed.split(".");
    for (let i = 0; i < parts.length - 1; i++) {
      const hit = index.nested.get(parts.slice(i).join("."));
      if (hit) {
        return hit;
      }
    }
  }
  return resolveIndexedType(index, simpleName(trimmed));
}

/** 类型自身的作用域链(由内向外,含自身);用于解析其字段/父类中的简单名 */
export function typeScopeOf(info: ClassInfo | undefined): string[] | undefined {
  if (!info) {
    return undefined;
  }
  const path = [...(info.enclosing ?? []), info.simpleName];
  return path.map((_, i) => path.slice(0, path.length - i).join("."));
}

/**
 * 按简单名查找类型:先查源码索引,未命中时从依赖 jar 的 .class 按需解析并回填缓存
 * (未配置 Maven 仓库时 jarLookup 为 undefined,退化为纯源码索引查询)。
 * 框架类(如自定义 ResponseDto、MyBatis-Plus 的 Page)依赖此回填避免重复解析同一 .class。
 */
export function resolveIndexedType(index: TypeIndex, name: string): ClassInfo | undefined {
  const simple = simpleName(name);
  const cached = index.types.get(simple);
  if (cached) {
    return cached;
  }
  const fromJar = index.jarLookup?.(simple);
  if (fromJar) {
    index.types.set(simple, fromJar);
  }
  return fromJar;
}

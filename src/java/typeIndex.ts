import { parse } from "java-parser";
import { collectAnnotations } from "./annotation";
import { CstNode, childAll, childNode, findAll, isCstNode, nodeJavadoc, nodeText, tokenImage, typeNameOf } from "./cst";
import { parseJavadoc } from "./javadoc";
import { ClassInfo, FieldInfo, TypeIndex, TypeKind } from "./model";
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

function enumConstantsOf(decl: CstNode): string[] {
  const list = childNode(childNode(decl, "enumBody"), "enumConstantList");
  return childNodes(list, "enumConstant")
    .map((c) => tokenImage(c, "Identifier") ?? "")
    .filter((s) => s.length > 0);
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
      superClass: superClassOf(normal, source),
    };
  }
  if (enumDecl) {
    return {
      ...base,
      kind: "enum",
      typeParams: [],
      fields: [],
      recordComponents: [],
      enumConstants: enumConstantsOf(enumDecl),
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
    };
  }
  return {
    ...base,
    kind: "interface" as TypeKind,
    typeParams: typeParamsOf(normalItf),
    fields: [],
    recordComponents: [],
    enumConstants: [],
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
  out: {
    types: Map<string, ClassInfo>;
    nested: Map<string, ClassInfo>;
    qualified: Map<string, ClassInfo>;
    names: string[];
  }
): void {
  const info = classInfoOf(decl, pf.source, enclosing, carrier);
  if (!info) {
    return;
  }
  out.qualified.set(info.qualifiedName, info);
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
  const qualified = new Map<string, ClassInfo>();
  const byFile = new Map<string, string[]>();

  for (const pf of files) {
    const names: string[] = [];
    const out = { types, nested, qualified, names };

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
  return { types, nested, qualified, byFile };
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
  // 显式限定名:先按全限定名精确匹配(包名限定可避开简单名冲突),
  // 再逐段剥掉前导包名,尝试嵌套键 `Outer.Inner`
  if (trimmed.includes(".")) {
    const exact = index.qualified?.get(trimmed);
    if (exact) {
      return exact;
    }
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

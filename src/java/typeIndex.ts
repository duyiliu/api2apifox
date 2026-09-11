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

function qualify(source: string, simpleName: string): string {
  const m = /^\s*package\s+([\w.]+)\s*;/m.exec(source);
  return m ? `${m[1]}.${simpleName}` : simpleName;
}

/**
 * 由 classDeclaration / interfaceDeclaration 构建 ClassInfo(class/enum/record/interface)。
 * javadocCarriers:注释可能挂靠的外层节点(顶层为 typeDeclaration,嵌套为 classBodyDeclaration /
 * interfaceMemberDeclaration),按“由外向内”的顺序传入。
 */
function classInfoOf(decl: CstNode, source: string, ...javadocCarriers: (CstNode | undefined)[]): ClassInfo | undefined {
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
    qualifiedName: qualify(source, simpleName),
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

/** 构建类型索引:顶层声明 + 类/接口/record 体内的嵌套(静态)类型声明 */
export function buildIndex(files: ParsedFile[]): TypeIndex {
  const types = new Map<string, ClassInfo>();
  const byFile = new Map<string, string[]>();

  for (const pf of files) {
    const names: string[] = [];
    const indexed = new Set<CstNode>();

    // ---- 顶层声明 ----
    for (const typeDecl of findAll(pf.cst, "typeDeclaration")) {
      const decl = childNode(typeDecl, "classDeclaration") ?? childNode(typeDecl, "interfaceDeclaration");
      if (!decl) {
        continue;
      }
      const info = classInfoOf(decl, pf.source, typeDecl);
      if (info) {
        indexed.add(decl);
        types.set(info.simpleName, info);
        names.push(info.simpleName);
      }
    }

    // ---- 嵌套声明:类体内的 class/interface(含 enum/record)、接口体内的 class/interface ----
    // 形如 `PatientSaveRequest.HealthProfileRequest` 的请求模型依赖于此;同名时顶层声明优先。
    const bodyDecls = [...findAll(pf.cst, "classBodyDeclaration"), ...findAll(pf.cst, "interfaceMemberDeclaration")];
    for (const bodyDecl of bodyDecls) {
      const member = childNode(bodyDecl, "classMemberDeclaration") ?? bodyDecl;
      const decl = childNode(member, "classDeclaration") ?? childNode(member, "interfaceDeclaration");
      if (!decl || indexed.has(decl)) {
        continue;
      }
      const info = classInfoOf(decl, pf.source, bodyDecl);
      if (!info || types.has(info.simpleName)) {
        continue;
      }
      indexed.add(decl);
      types.set(info.simpleName, info);
      names.push(info.simpleName);
    }

    byFile.set(pf.fsPath, names);
  }
  return { types, byFile };
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

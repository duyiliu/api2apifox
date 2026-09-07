import { parse } from "java-parser";
import { collectAnnotations } from "./annotation";
import { CstNode, childAll, childNode, findAll, isCstNode, nodeJavadoc, nodeText, tokenImage, typeNameOf } from "./cst";
import { parseJavadoc } from "./javadoc";
import { ClassInfo, FieldInfo, SourceFile, TypeIndex, TypeKind } from "./model";
import { parseTypeText } from "./typeText";

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
    const javadoc = parseJavadoc(nodeJavadoc(bodyDecl));
    const vdl = childNode(fd, "variableDeclaratorList");
    for (const vd of childNodes(vdl, "variableDeclarator")) {
      const name = tokenImage(childNode(vd, "variableDeclaratorId"), "Identifier");
      if (!name) {
        continue;
      }
      fields.push({ name, typeText, annotations: collectAnnotations(mods, source), javadoc });
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
  return childNodes(list, "recordComponent").map((rc) => {
    const typeNode = childNode(rc, "unannType");
    return {
      name: tokenImage(rc, "Identifier") ?? "",
      typeText: typeNode ? nodeText(source, typeNode).trim() : "Object",
      annotations: collectAnnotations(childNodes(rc, "variableModifier"), source),
    };
  });
}

function superClassOf(normal: CstNode, source: string): string | undefined {
  const sup = childNode(normal, "superclass");
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

/** 在子树中找第一个类型节点(unannClassOrInterfaceType / unannType) */
function findFirstType(node: CstNode): CstNode | undefined {
  return childNode(node, "unannClassOrInterfaceType") ?? childNode(node, "unannType") ?? findAll(node, "unannClassOrInterfaceType")[0];
}

function qualify(source: string, simpleName: string): string {
  const m = /^\s*package\s+([\w.]+)\s*;/m.exec(source);
  return m ? `${m[1]}.${simpleName}` : simpleName;
}

/** 构建类型索引 */
export function buildIndex(files: ParsedFile[]): TypeIndex {
  const types = new Map<string, ClassInfo>();
  const byFile = new Map<string, string[]>();

  for (const pf of files) {
    const names: string[] = [];
    for (const typeDecl of findAll(pf.cst, "typeDeclaration")) {
      const classDecl = childNode(typeDecl, "classDeclaration");
      const interfaceDecl = childNode(typeDecl, "interfaceDeclaration");

      // ---- class / enum / record ----
      const normal = classDecl ? childNode(classDecl, "normalClassDeclaration") : undefined;
      const enumDecl = classDecl ? childNode(classDecl, "enumDeclaration") : undefined;
      const recordDecl = classDecl ? childNode(classDecl, "recordDeclaration") : undefined;

      if (normal) {
        const simpleName = typeNameOf(normal);
        if (simpleName) {
          const classBody = childNode(normal, "classBody");
          const info: ClassInfo = {
            simpleName,
            qualifiedName: qualify(pf.source, simpleName),
            kind: "class",
            typeParams: typeParamsOf(normal),
            fields: collectFields(classBody as CstNode, pf.source),
            recordComponents: [],
            enumConstants: [],
            annotations: collectAnnotations(annotationsOf(classDecl, normal), pf.source),
            superClass: superClassOf(normal, pf.source),
            javadoc: javadocOf(typeDecl, classDecl, normal),
          };
          types.set(simpleName, info);
          names.push(simpleName);
        }
      } else if (enumDecl) {
        const simpleName = typeNameOf(enumDecl);
        if (simpleName) {
          types.set(simpleName, {
            simpleName,
            qualifiedName: qualify(pf.source, simpleName),
            kind: "enum",
            typeParams: [],
            fields: [],
            recordComponents: [],
            enumConstants: enumConstantsOf(enumDecl),
            annotations: collectAnnotations(annotationsOf(classDecl, enumDecl), pf.source),
            javadoc: javadocOf(typeDecl, classDecl, enumDecl),
          });
          names.push(simpleName);
        }
      } else if (recordDecl) {
        const simpleName = typeNameOf(recordDecl);
        if (simpleName) {
          types.set(simpleName, {
            simpleName,
            qualifiedName: qualify(pf.source, simpleName),
            kind: "record",
            typeParams: typeParamsOf(recordDecl),
            fields: [],
            recordComponents: recordComponentsOf(recordDecl, pf.source),
            enumConstants: [],
            annotations: collectAnnotations(annotationsOf(classDecl, recordDecl), pf.source),
            javadoc: javadocOf(typeDecl, classDecl, recordDecl),
          });
          names.push(simpleName);
        }
      }

      // ---- interface(索引留档;Feign 支持为二期) ----
      if (interfaceDecl) {
        const normalItf = childNode(interfaceDecl, "normalInterfaceDeclaration");
        const simpleName = normalItf ? typeNameOf(normalItf) : "";
        if (simpleName) {
          types.set(simpleName, {
            simpleName,
            qualifiedName: qualify(pf.source, simpleName),
            kind: "interface" as TypeKind,
            typeParams: typeParamsOf(normalItf),
            fields: [],
            recordComponents: [],
            enumConstants: [],
            annotations: collectAnnotations(annotationsOf(interfaceDecl, normalItf), pf.source),
            javadoc: javadocOf(typeDecl, interfaceDecl, normalItf),
          });
          names.push(simpleName);
        }
      }
    }
    byFile.set(pf.fsPath, names);
  }
  return { types, byFile };
}

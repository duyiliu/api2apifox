/**
 * java-parser CST 的轻量封装。
 * java-parser 输出 chevrotain 风格 CST:节点为 { name, children, location },
 * token 为 { image, startOffset, endOffset, ... },location.endOffset 为闭区间(含最后一个字符)。
 */
export interface JavaToken {
  image: string;
  startOffset: number;
  endOffset: number;
  startLine: number;
  endLine: number;
}

export interface CstLocation {
  startOffset: number;
  endOffset: number;
  startLine?: number;
  endLine?: number;
}

export interface CstNode {
  name: string;
  children?: Record<string, CstElement[]>;
  location?: CstLocation;
  leadingComments?: JavaToken[];
  trailingComments?: JavaToken[];
}

export type CstElement = CstNode | JavaToken;

export function isCstNode(el: CstElement | undefined | null): el is CstNode {
  return !!el && typeof el === "object" && "name" in el && "children" in el;
}

export function isToken(el: CstElement | undefined | null): el is JavaToken {
  return !!el && typeof el === "object" && "image" in el;
}

/** 取某规则名下的全部子元素 */
export function childAll(node: CstNode | undefined, name: string): CstElement[] {
  return (node?.children?.[name] ?? []) as CstElement[];
}

/** 取某规则名下的第一个子元素(节点或 token) */
export function child(node: CstNode | undefined, name: string): CstElement | undefined {
  return childAll(node, name)[0];
}

/** 取某规则名下的第一个子节点(CST 节点) */
export function childNode(node: CstNode | undefined, name: string): CstNode | undefined {
  const c = child(node, name);
  return isCstNode(c) ? c : undefined;
}

/** 取某规则名下第一个 token 的 image */
export function tokenImage(node: CstNode | undefined, name: string): string | undefined {
  const c = child(node, name);
  return isToken(c) ? c.image : undefined;
}

/** 在子树中按规则名查找(深度优先,含自身) */
export function findAll(node: CstNode | undefined, name: string, out: CstNode[] = [], depth = 0): CstNode[] {
  if (!node || depth > 200) {
    return out;
  }
  if (node.name === name) {
    out.push(node);
  }
  for (const v of Object.values(node.children ?? {})) {
    for (const el of v) {
      if (isCstNode(el)) {
        findAll(el, name, out, depth + 1);
      }
    }
  }
  return out;
}

/** 查找第一个匹配规则的子孙节点 */
export function findFirst(node: CstNode | undefined, name: string): CstNode | undefined {
  return findAll(node, name)[0];
}

/** 按源码 offset 切出节点对应文本 */
export function nodeText(source: string, node: CstNode): string {
  const loc = node.location;
  if (!loc) {
    return "";
  }
  return source.slice(loc.startOffset, loc.endOffset + 1);
}

/** 节点上的 Javadoc(leadingComments 中以 /** 开头的注释) */
export function nodeJavadoc(node: CstNode | undefined): string | undefined {
  const comments = node?.leadingComments ?? [];
  const jd = comments.find((c) => c.image.trimEnd().startsWith("/**"));
  return jd ? jd.image : undefined;
}

/**
 * 类型声明(typeIdentifier 形态不定:可能是规则节点内含 Identifier token,也可能直接是 token),
 * 统一在此提取类/枚举/record/接口名。
 */
export function typeNameOf(decl: CstNode | undefined, rule = "typeIdentifier"): string {
  const ti = childNode(decl, rule);
  if (ti) {
    return tokenImage(ti, "Identifier") ?? tokenImage(ti, rule) ?? "";
  }
  return tokenImage(decl, rule) ?? tokenImage(decl, "Identifier") ?? "";
}

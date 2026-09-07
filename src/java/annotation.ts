import { CstNode, childAll, childNode, isToken, nodeText, tokenImage } from "./cst";

/** 注解参数值:标量或标量数组(源码原文形式,如 "RequestMethod.GET"、"Foo.class"、字符串去引号后) */
export type ArgValue = string | number | boolean;
export type AnnotationArgs = Record<string, ArgValue | ArgValue[]>;

export interface AnnotationInfo {
  /** 简单名,如 RequestMapping(不含包名) */
  name: string;
  /** 完整源码文本 */
  raw: string;
  /** 解析后的参数;单值注解记在 "value" 键下 */
  args: AnnotationArgs;
}

/**
 * 从修饰符列表(类/方法/字段/参数的 *Modifier 规则)中收集注解。
 * 注解参数通过源码切片 + 轻量文本解析获得,不遍历表达式子树。
 */
export function collectAnnotations(modifiers: CstNode[], source: string): AnnotationInfo[] {
  const result: AnnotationInfo[] = [];
  for (const mod of modifiers) {
    const ann = childNode(mod, "annotation");
    if (!ann) {
      continue;
    }
    result.push(parseAnnotation(ann, source));
  }
  return result;
}

export function parseAnnotation(ann: CstNode, source: string): AnnotationInfo {
  const raw = nodeText(source, ann);
  const typeName = childNode(ann, "typeName");
  const ids = childAll(typeName, "Identifier").filter(isToken);
  const name = ids.length ? ids[ids.length - 1].image : "";

  let args: AnnotationArgs = {};
  const lbrace = tokenImage(ann, "LBrace");
  if (lbrace) {
    // 在 "(" 与 ")" 之间取参数文本
    const inner = raw.slice(raw.indexOf("(") + 1, raw.lastIndexOf(")")).trim();
    args = inner ? parseArgsText(inner) : {};
  }
  return { name, raw, args };
}

/**
 * 解析注解参数文本,如:
 *   value = {"/{id}", "/item/{id}"}, method = {RequestMethod.DELETE}
 *   "关键字"
 *   description = "用户名", example = "zhangsan"
 */
export function parseArgsText(text: string): AnnotationArgs {
  const args: AnnotationArgs = {};
  for (const part of splitTopLevel(text)) {
    const eq = findTopLevelEquals(part);
    let key = "value";
    let valueText = part.trim();
    if (eq >= 0) {
      key = part.slice(0, eq).trim();
      valueText = part.slice(eq + 1).trim();
    }
    args[key] = parseValueText(valueText);
  }
  return args;
}

/** 解析单个值:字符串字面量 / {数组} / 数字 / 布尔 / 其他原样保留 */
function parseValueText(text: string): ArgValue | ArgValue[] {
  const t = text.trim();
  if (t.startsWith("{") && t.endsWith("}")) {
    return splitTopLevel(t.slice(1, -1))
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(parseValueText) as ArgValue[];
  }
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return unescapeJava(t.slice(1, -1));
  }
  if (t === "true") {
    return true;
  }
  if (t === "false") {
    return false;
  }
  if (/^-?\d+$/.test(t)) {
    return parseInt(t, 10);
  }
  if (/^-?\d*\.\d+([eE][+-]?\d+)?$/.test(t)) {
    return parseFloat(t);
  }
  // 枚举 RequestMethod.GET、类引用 Foo.class 等原样保留
  return t;
}

/** 按顶层逗号切分(忽略括号/花括号/引号内的逗号) */
export function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inStr: string | null = null;
  let cur = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      cur += ch;
      if (ch === "\\") {
        if (i + 1 < text.length) {
          cur += text[++i];
        }
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
    } else if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
    } else if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim().length > 0) {
    parts.push(cur);
  }
  return parts;
}

function findTopLevelEquals(text: string): number {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\") {
        i++;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
    } else if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
    } else if (ch === "=" && depth === 0 && text[i + 1] !== "=" && text[i - 1] !== "=" && text[i - 1] !== "!" && text[i - 1] !== ">" && text[i - 1] !== "<") {
      return i;
    }
  }
  return -1;
}

function unescapeJava(s: string): string {
  return s.replace(/\\(.)/g, (_m, c: string) => {
    switch (c) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      case '"':
        return '"';
      case "'":
        return "'";
      case "\\":
        return "\\";
      default:
        return c;
    }
  });
}

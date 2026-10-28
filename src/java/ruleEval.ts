/**
 * easyyapi/Apifox Helper 声明式规则求值。
 *
 * 在 VS Code 版中没有 Groovy/classpath 运行时,因此:
 *  - 支持官方规则值语法:#tag(读 javadoc 标签)、@注解(判断存在)、@注解#属性(读属性值)、字面量
 *  - 条件(cond)支持:#tag 存在、@注解 存在、!@注解 取反;groovy:/js: 条件一律跳过并 warning
 *  - 值支持一种“安全形态”的 groovy:纯字符串拼接 + it.ann("fqcn","attr") + 条件运算符
 *    (如团队配置的 field.doc=groovy: "（框架字典：" + it.ann("X","value") + "）")。
 *    其余 groovy:/js: 一律不执行,记 warning 返回 undefined。
 *  - 不做任何 eval/反射,所有解析均为文本层。
 */

import { AnnotationInfo } from "./model";
import { unescapeProp } from "../config/helperProperties";

/** 参与规则匹配的上下文 */
export interface RuleContext {
  /** 注解(简单名或全限定名均可匹配) */
  annotations: AnnotationInfo[];
  /** 该级 javadoc 原文(用于 #tag 读取);无则为 undefined */
  javadocRaw?: string;
  /** 提示用的对象描述(如 “类 UserController 的字段 age”),用于 warning */
  subject: string;
  /** 可选:附加的注解(如字段所在类的类注解),供某些条件判定 */
  extraAnnotations?: AnnotationInfo[];
  /** 字段级上下文:字段名(供 it.name() 之类小驼峰判断) */
  fieldName?: string;
  /** 字段级上下文:该字段是否为枚举类型 */
  isEnum?: boolean;
  /** 字段级上下文:枚举类型的简单类名 */
  enumSimpleName?: string;
  /**
   * 字段级上下文:声明类型文本(去空白,如 `Long`、`java.lang.Long`、`List<Long>`、`Long[]`),
   * 供 it.type()?.name() 比较
   */
  fieldType?: string;
  /** 字段级上下文:声明类型的根简单名(如 `List<Long>` → `List`),供 it.type()?.simpleName() 比较 */
  fieldTypeSimple?: string;
}

export type RuleValueSyntax = "tag" | "ann-attr" | "literal" | "groovy" | "js";

export interface RuleEvalResult {
  /** 求值结果;undefined 表示规则不适用(条件不满足)或不可安全执行(有 warning) */
  value?: string;
  /** 是否命中(条件满足;即使值不可安全执行也算命中) */
  matched: boolean;
  /** 是否因不可安全执行而未产出值 */
  skipped?: boolean;
  /** 跳过的原因(展示给用户) */
  reason?: string;
}

/** 识别规则值的语法形态 */
export function detectValueSyntax(value: string): { type: RuleValueSyntax; body: string } {
  const t = value.trimStart();
  if (t.startsWith("groovy:")) {
    return { type: "groovy", body: t.slice("groovy:".length) };
  }
  if (t.startsWith("js:")) {
    return { type: "js", body: t.slice("js:".length) };
  }
  if (t.startsWith("#")) {
    return { type: "tag", body: t.slice(1).trim() };
  }
  if (t.startsWith("@")) {
    return { type: "ann-attr", body: t.slice(1).trim() };
  }
  return { type: "literal", body: t.trim() };
}

/**
 * 解析值语法并求值。
 * @param ctx 上下文
 * @param defaultWarn 无法求值时的 warning 前缀(通常为 key)
 */
export function evalRuleValue(
  raw: string,
  ctx: RuleContext,
  key: string,
  _onWarning: (msg: string) => void
): RuleEvalResult {
  const syntax = detectValueSyntax(raw);

  // #tag:读 javadoc @tag 的正文
  if (syntax.type === "tag") {
    const v = javadocTagValue(ctx.javadocRaw, syntax.body);
    return { matched: v !== undefined, value: v };
  }

  // @注解 / @注解#attr
  if (syntax.type === "ann-attr") {
    const { fqcn, attr } = splitAnnRef(syntax.body);
    const ann = findAnnotationByName(ctx.annotations, fqcn);
    if (!ann) {
      return { matched: false };
    }
    if (!attr) {
      // 仅判断存在:取默认 value,没有则为空串(由上层决定如何用)
      const v = readAttr(ann, "value");
      return { matched: true, value: v !== undefined ? String(v) : "" };
    }
    const v = readAttr(ann, attr);
    return { matched: v !== undefined, value: v !== undefined ? String(v) : undefined };
  }

  // 字面量(含纯文本;不做 groovy 执行)
  if (syntax.type === "literal") {
    return { matched: true, value: syntax.body };
  }

  // groovy / js:尝试安全形态翻译
  const r = trySafeGroovy(syntax.body, ctx);
  if (r.matched === false && !r.unsupported) {
    // 条件未命中(静默)
    return { matched: false };
  }
  if (r.value !== undefined) {
    return { matched: true, value: r.value };
  }
  // 无法安全翻译 → 跳过
  return {
    matched: true,
    skipped: true,
    reason: `${key} 的 groovy/js 规则无法在无脚本运行时下安全执行,已跳过:${truncate(raw, 60)}`,
  };
}

/**
 * 判断条件(cond)是否命中。
 * 支持:#tag(存在)、@注解(存在)、@注解#attr(存在)、!@注解(取反)、字面量(空/无特殊含义)。
 * groovy:/js:/复杂表达式:不执行,返回 { supported:false } 由上层决定跳过该规则。
 */
export function evalCondition(
  cond: string | undefined,
  ctx: RuleContext,
  _key: string,
  _onWarning: (msg: string) => void
): { hit: boolean; supported: boolean } {
  if (!cond || !cond.trim()) {
    return { hit: true, supported: true };
  }
  const c = cond.trim();

  // 取反
  let negate = false;
  let body = c;
  if (c.startsWith("!")) {
    negate = true;
    body = c.slice(1).trim();
  }

  // groovy:/js: 条件
  if (body.startsWith("groovy:") || body.startsWith("js:")) {
    return { hit: false, supported: false };
  }

  if (body.startsWith("#")) {
    const tag = body.slice(1).trim();
    const has = hasJavadocTag(ctx.javadocRaw, tag);
    return { hit: negate ? !has : has, supported: true };
  }
  if (body.startsWith("@")) {
    const { fqcn } = splitAnnRef(body.slice(1).trim());
    const has = !!findAnnotationByName(ctx.annotations, fqcn);
    return { hit: negate ? !has : has, supported: true };
  }
  // 裸字面量条件:官方允许(如 key[#x]),其余字面量当作“恒真但无法理解”,保守跳过
  return { hit: false, supported: false };
}

/**
 * 尝试翻译“安全形态”的 groovy 表达式。仅支持:
 *   (1) 形如 条件 ? "字符串+it.ann(...)+..." : null / "" / undefined
 *   (2) 纯字符串拼接表达式,含 it.ann("fqcn","attr")、it.name()(仅小驼峰判断用)
 * 返回:matched=true → 命中并产出 value;
 *       matched=false, unsupported=false → 条件未命中(静默);
 *       unsupported=true → 无法安全翻译(上层应告警跳过)。
 */
export function trySafeGroovy(script: string, ctx: RuleContext): { matched: boolean; value?: string; unsupported?: boolean } {
  const s = script.trim();

  // 去除包装的多行 ```(在 helperProperties 已去除,此处兜底)
  const clean = s.replace(/^```\s*/g, "").replace(/```\s*$/g, "").trim();

  // 三元形态:cond ? thenExpr : elseExpr
  const tern = findTopLevelTernary(clean);
  if (tern) {
    const { cond, thenExpr, elseExpr } = tern;
    // 仅支持 cond 为可安全求值的简单条件(如 it.name() 小驼峰判断 / it.ann 存在)
    const condVal = evalSafeCondition(cond, ctx);
    if (condVal === undefined) {
      return { matched: false, unsupported: true };
    }
    // else 分支必须是 null / 空串 / undefined → 不产出
    const elseClean = stripParens(elseExpr).trim();
    if (!/^(null|""|''|undefined)?$/.test(elseClean)) {
      return { matched: false, unsupported: true };
    }
    const thenVal = evalSafeStringExpr(thenExpr, ctx);
    if (thenVal === undefined) {
      return { matched: false, unsupported: true };
    }
    return condVal ? { matched: true, value: thenVal } : { matched: false };
  }

  // 纯字符串表达式(无三元):尝试
  const v = evalSafeStringExpr(clean, ctx);
  if (v !== undefined) {
    return { matched: true, value: v };
  }
  return { matched: false, unsupported: true };
}

/**
 * 计算安全条件(三元 cond 部分)。返回 true/false;无法求值返回 undefined。
 * 支持的形态:
 *  - it.name()?.length() > 0 && Character.isLowerCase(it.name().charAt(0)) ... (字段名小驼峰)
 *  - it.hasAnn("fqcn") / it.hasAnn("fqcn","attr") / it.ann(...) != null
 *  - 裸的布尔表达式与 || &&、!、比较等仅在上述原子组合内求值
 */
function evalSafeCondition(cond: string, ctx: RuleContext): boolean | undefined {
  let c = stripParens(cond.trim());

  // 拆顶层 || (取或);任一为 true → true
  const ors = splitTopLevelOps(c, "||");
  if (ors.length > 1) {
    const vals = ors.map((o) => evalSafeCondition(o, ctx));
    if (vals.some((v) => v === true)) {
      return true;
    }
    if (vals.some((v) => v === undefined)) {
      return undefined;
    }
    return false;
  }
  const ands = splitTopLevelOps(c, "&&");
  if (ands.length > 1) {
    const vals = ands.map((o) => evalSafeCondition(o, ctx));
    if (vals.some((v) => v === false)) {
      return false;
    }
    if (vals.some((v) => v === undefined)) {
      return undefined;
    }
    return true;
  }
  if (c.startsWith("!")) {
    const inner = evalSafeCondition(c.slice(1).trim(), ctx);
    return inner === undefined ? undefined : !inner;
  }

  // 字段名小驼峰:it.name()?.length() > 0 && Character.isLowerCase(it.name().charAt(0))
  const lowerMatch = /^Character\.isLowerCase\(it\.name\(\)\.charAt\(0\)\)$/.test(c);
  if (lowerMatch) {
    const n = ctxFieldName(ctx);
    return n !== undefined && n.length > 0 && /^[a-z]/.test(n);
  }
  const lenMatch = /^it\.name\(\)\?*\.length\(\)\s*>\s*0$/.test(c);
  if (lenMatch) {
    const n = ctxFieldName(ctx);
    return n !== undefined && n.length > 0;
  }
  // 枚举类型判断: helper.findClass(it.type()?.name())?.isEnum() 或 it.type()?.isEnum()
  if (c.includes("isEnum()") && (c.includes("findClass") || c.includes("it.type()"))) {
    return ctx.isEnum === true;
  }
  const hasAnn = /^it\.hasAnn\("([^"]+)"\)$/.exec(c) || /^it\.hasAnn\("([^"]+)","([^"]+)"\)$/.exec(c);
  if (hasAnn) {
    return !!findAnnotationByName(ctx.annotations, hasAnn[1]);
  }
  // 裸 hasAnn 判断
  const hasAnnSimple = /^it\.hasAnn\(([^)]+)\)$/.exec(c);
  if (hasAnnSimple) {
    const q = stripQuotes(hasAnnSimple[1]);
    if (q !== undefined) {
      return !!findAnnotationByName(ctx.annotations, q);
    }
  }

  // it.name()/it.type() 访问器:与字符串字面量比较或调用字符串方法
  // 如 it.name().endsWith("Id")、it.type()?.name() == "java.lang.Long"
  const accCond = evalAccessorCondition(c, ctx);
  if (accCond !== undefined) {
    return accCond;
  }
  return undefined;
}

/**
 * 字段访问器(`it.name()`、`it.type()?.name()`、`it.type()?.simpleName()`)的
 * 字符串方法调用与 ==/!= 比较求值。访问器取不到值(无字段上下文)时:
 * 方法调用判 false,!= 判 true,== 判 false——与"字段无类型信息则不匹配"的直觉一致。
 * 非访问器形态返回 undefined(不支持,由上层告警跳过)。
 */
function evalAccessorCondition(expr: string, ctx: RuleContext): boolean | undefined {
  // X.method("lit"):方法在 equals/startsWith/endsWith/contains/matches/equalsIgnoreCase 内
  const methodCall = /^(.+?)\??\.(equals|equalsIgnoreCase|startsWith|endsWith|contains|matches)\((.*)\)$/s.exec(expr);
  if (methodCall) {
    const acc = accessorValue(methodCall[1].trim(), ctx);
    if (!acc.handled) {
      return undefined;
    }
    const arg = stripQuotes(methodCall[3].trim());
    if (arg === undefined || acc.value === undefined) {
      return false;
    }
    switch (methodCall[2]) {
      case "equals":
        return acc.value === arg;
      case "equalsIgnoreCase":
        return acc.value.toLowerCase() === arg.toLowerCase();
      case "startsWith":
        return acc.value.startsWith(arg);
      case "endsWith":
        return acc.value.endsWith(arg);
      case "contains":
        return acc.value.includes(arg);
      case "matches":
        try {
          return new RegExp(arg).test(acc.value);
        } catch {
          return false;
        }
    }
    return false;
  }
  // X == "lit" / X != "lit" / X == null / X != null
  const cmp = /^(.+?)\s*(==|!=)\s*(.+?)\s*$/s.exec(expr);
  if (cmp) {
    const acc = accessorValue(cmp[1].trim(), ctx);
    if (!acc.handled) {
      return undefined;
    }
    const raw = cmp[3].trim();
    const rhs = raw === "null" ? undefined : stripQuotes(raw);
    const same = acc.value === rhs;
    return cmp[2] === "==" ? same : !same;
  }
  return undefined;
}

/** 求 it.name()/it.type()?.name()/it.type()?.simpleName() 的当前值;非访问器 handled=false */
function accessorValue(expr: string, ctx: RuleContext): { handled: boolean; value?: string } {
  if (/^it\.name\(\)$/.test(expr)) {
    return { handled: true, value: ctx.fieldName };
  }
  if (/^it\.type\(\)\?*\.simpleName\(\)$/.test(expr)) {
    return { handled: true, value: ctx.fieldTypeSimple };
  }
  if (/^it\.type\(\)\?*\.name\(\)$/.test(expr)) {
    return { handled: true, value: ctx.fieldType };
  }
  return { handled: false };
}

/**
 * 求值安全字符串表达式:允许 "..." 字符串、+ 拼接、it.ann("fqcn","attr")、it.name()。
 * 返回字符串;无法求值返回 undefined。
 */
function evalSafeStringExpr(expr: string, ctx: RuleContext): string | undefined {
  // 整体去括号
  const cleaned = stripParens(expr.trim()).trim();
  if (!cleaned) {
    return "";
  }
  // 尝试按顶层 + 拆分(字符串拼接)
  const parts = splitTopLevelOps(cleaned, "+");
  if (parts.length > 1) {
    let out = "";
    for (const part of parts) {
      const v = evalSafeStringExpr(part, ctx);
      if (v === undefined) {
        return undefined;
      }
      out += v;
    }
    return out;
  }
  // 单字符串字面量
  const str = tryUnquote(cleaned);
  if (str !== undefined) {
    return str;
  }
  // 提取枚举类名: it.type()?.name()?.substring(...) 或 it.type()?.name()
  if (cleaned.includes("it.type()") && (cleaned.includes("substring") || cleaned.includes("name") || cleaned.includes("simpleName"))) {
    return ctx.enumSimpleName !== undefined ? ctx.enumSimpleName : "";
  }
  // it.ann("fqcn","attr")(容忍参数间空白)
  const annCall = /^it\.ann\("([^"]+)"\s*,\s*"([^"]+)"\)$/.exec(cleaned);
  if (annCall) {
    const ann = findAnnotationByName(ctx.annotations, annCall[1]);
    if (!ann) {
      return undefined;
    }
    const v = readAttr(ann, annCall[2]);
    return v !== undefined ? String(v) : undefined;
  }
  // it.ann("fqcn") → 默认 value
  const annCall1 = /^it\.ann\("([^"]+)"\)$/.exec(cleaned);
  if (annCall1) {
    const ann = findAnnotationByName(ctx.annotations, annCall1[1]);
    if (!ann) {
      return undefined;
    }
    const v = readAttr(ann, "value");
    return v !== undefined ? String(v) : undefined;
  }
  return undefined;
}

/** 从上下文取“字段名”(it.name() 在 field 级上下文 = 字段名) */
function ctxFieldName(ctx: RuleContext): string | undefined {
  // RuleContext 通过 subject 约定无法可靠取字段名,扩展一个字段由上层传入
  return (ctx as RuleContext & { fieldName?: string }).fieldName;
}

/* ---------- javadoc tag 读取 ---------- */

/** javadoc 原文中取 @tag 的正文(单行;不处理多行续) */
export function javadocTagValue(raw: string | undefined, tag: string): string | undefined {
  if (!raw) {
    return undefined;
  }
  const re = new RegExp(`@${escapeRe(tag)}\\s+([^@\\n]+)`, "m");
  const m = re.exec(raw);
  if (!m) {
    return undefined;
  }
  const v = m[1].trim();
  return v || undefined;
}

function hasJavadocTag(raw: string | undefined, tag: string): boolean {
  if (!raw) {
    return false;
  }
  return new RegExp(`(^|\\n)\\s*\\*?\\s*@${escapeRe(tag)}\\b`, "m").test(raw);
}

/* ---------- 注解读取(与 model 一致,支持简单名/全限定名) ---------- */

function findAnnotationByName(annotations: AnnotationInfo[], nameOrFqcn: string): AnnotationInfo | undefined {
  if (!nameOrFqcn) {
    return undefined;
  }
  const simple = nameOrFqcn.slice(nameOrFqcn.lastIndexOf(".") + 1);
  return annotations.find((a) => a.name === simple || a.name === nameOrFqcn);
}

function readAttr(ann: AnnotationInfo, attr: string): unknown {
  if (attr === "value" && ann.args["value"] !== undefined) {
    return ann.args["value"];
  }
  if (ann.args[attr] !== undefined) {
    return ann.args[attr];
  }
  return undefined;
}

/* ---------- 文本工具 ---------- */

function splitAnnRef(body: string): { fqcn: string; attr?: string } {
  const idx = body.indexOf("#");
  if (idx < 0) {
    return { fqcn: body };
  }
  return { fqcn: body.slice(0, idx).trim(), attr: body.slice(idx + 1).trim() || undefined };
}

/** 找顶层三元 ? : 的位置(不处理嵌套三元) */
function findTopLevelTernary(s: string): { cond: string; thenExpr: string; elseExpr: string } | undefined {
  let depth = 0;
  let inStr: string | null = null;
  let qIdx = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
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
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
    } else if (ch === "?" && depth === 0 && qIdx < 0) {
      qIdx = i;
      break; // 只看第一个顶层 ?
    }
  }
  if (qIdx < 0) {
    return undefined;
  }
  // 找顶层 :
  let colonIdx = -1;
  depth = 0;
  inStr = null;
  for (let i = qIdx + 1; i < s.length; i++) {
    const ch = s[i];
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
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
    } else if (ch === ":" && depth === 0) {
      colonIdx = i;
      break;
    }
  }
  if (colonIdx < 0) {
    return undefined;
  }
  return {
    cond: s.slice(0, qIdx).trim(),
    thenExpr: s.slice(qIdx + 1, colonIdx).trim(),
    elseExpr: s.slice(colonIdx + 1).trim(),
  };
}

/** 按顶层操作符拆分(不拆字符串内) */
function splitTopLevelOps(s: string, op: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let inStr: string | null = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      cur += ch;
      if (ch === "\\") {
        if (i + 1 < s.length) {
          cur += s[++i];
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
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
    } else if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
    } else if (s.startsWith(op, i) && depth === 0) {
      out.push(cur.trim());
      cur = "";
      i += op.length - 1;
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) {
    out.push(cur.trim());
  }
  return out;
}

function stripParens(s: string): string {
  let t = s.trim();
  while (t.startsWith("(") && t.endsWith(")") && balanced(t.slice(1, -1))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

function balanced(s: string): boolean {
  let d = 0;
  let inStr: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
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
    } else if (ch === "(") {
      d++;
    } else if (ch === ")") {
      d--;
      if (d < 0) {
        return false;
      }
    }
  }
  return d === 0 && !inStr;
}

/** 尝试整体作为字符串字面量去掉引号并反转义;非字面量返回 undefined */
function tryUnquote(s: string): string | undefined {
  const t = s.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return unescapeProp(t.slice(1, -1));
  }
  return undefined;
}

function stripQuotes(s: string): string | undefined {
  const t = s.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1);
  }
  return t;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export { splitTopLevelOps as _test_splitTopLevelOps };

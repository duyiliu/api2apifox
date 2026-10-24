/**
 * Java 类型声明文本的轻量解析器(输入是从源码切出的类型串,如
 * "ApiResult<List<UserVO>>"、"Map<String, List<User>>"、"String[][]")。
 */
export interface TypeRef {
  /** 不含泛型参数与数组维度的名字,可能是限定名(a.b.C) */
  name: string;
  /** 泛型实参 */
  args: TypeRef[];
  /** 数组维度 */
  dims: number;
  /** 通配符形式:"?"、"extends"、"super" */
  wildcard?: "?" | "extends" | "super";
  /** 内部标记:该名字是尚未绑定的泛型形参(不参与文本还原与 schema 命名) */
  unbound?: boolean;
}

export function parseTypeText(text: string): TypeRef {
  const parser = new TypeParser(text.replace(/\s+/g, " ").trim());
  const t = parser.parseType();
  return t;
}

/** 把 TypeRef 还原为稳定的 key 文本(用于 schema 命名) */
export function typeToKeyText(t: TypeRef): string {
  const base = t.name + (t.args.length ? "«" + t.args.map(typeToKeyText).join(",") + "»" : "");
  return base + "[]".repeat(t.dims);
}

/** 把 TypeRef 还原为可再次解析的类型文本(保持泛型实参、通配符与数组维度) */
export function typeRefToText(t: TypeRef): string {
  let base: string;
  if (t.wildcard === "?" && t.name === "Object" && !t.args.length) {
    base = "?";
  } else {
    base = t.name + (t.args.length ? "<" + t.args.map(typeRefToText).join(", ") + ">" : "");
    if (t.wildcard === "extends") {
      base = "? extends " + base;
    } else if (t.wildcard === "super") {
      base = "? super " + base;
    }
  }
  return base + "[]".repeat(t.dims);
}

/**
 * 递归替换泛型形参(如把 `List<T>` 中的 T 换成绑定值 User)。
 * 绑定值自身也可能引用其他形参(多级继承),按 bindings 递归展开;
 * 自引用绑定(T -> T)不会死循环,原样保留,由调用方按未绑定处理。
 */
export function substituteTypeVars(t: TypeRef, bindings: Map<string, TypeRef>, resolving = new Set<string>()): TypeRef {
  const key = t.name.includes(".") ? undefined : t.name;
  const bound = key ? bindings.get(key) : undefined;
  if (bound && key && !resolving.has(key)) {
    const next = new Set(resolving);
    next.add(key);
    const replaced = substituteTypeVars(bound, bindings, next);
    return { ...replaced, dims: replaced.dims + t.dims, wildcard: t.wildcard ?? replaced.wildcard };
  }
  return { ...t, args: t.args.map((arg) => substituteTypeVars(arg, bindings, resolving)) };
}

/** 收集类型中仍以泛型形参出现的名字(用于未绑定告警) */
export function collectTypeVarNames(t: TypeRef, vars: ReadonlySet<string>, out: Set<string>): void {
  if (vars.has(t.name) && !t.name.includes(".")) {
    out.add(t.name);
  }
  for (const arg of t.args) {
    collectTypeVarNames(arg, vars, out);
  }
}

/** 取最后一段简单名 */
export function simpleName(qualified: string): string {
  const i = qualified.lastIndexOf(".");
  return i >= 0 ? qualified.slice(i + 1) : qualified;
}

class TypeParser {
  private pos = 0;
  constructor(private readonly text: string) {}

  parseType(): TypeRef {
    let t = this.parseBase();
    while (this.peek() === "[") {
      this.expect("[");
      this.expect("]");
      t = { ...t, dims: t.dims + 1 };
    }
    return t;
  }

  private parseBase(): TypeRef {
    this.skipSpaces();
    if (this.peek() === "?") {
      this.pos++;
      this.skipSpaces();
      if (this.matchWord("extends")) {
        const inner = this.parseType();
        return { ...inner, wildcard: "extends" };
      }
      if (this.matchWord("super")) {
        const inner = this.parseType();
        return { ...inner, wildcard: "super" };
      }
      return { name: "Object", args: [], dims: 0, wildcard: "?" };
    }
    const nameMatch = /^\w+(?:\.\w+)*/.exec(this.text.slice(this.pos));
    if (!nameMatch) {
      return { name: this.text.trim() || "Object", args: [], dims: 0 };
    }
    this.pos += nameMatch[0].length;
    let args: TypeRef[] = [];
    this.skipSpaces();
    if (this.peek() === "<") {
      this.pos++;
      args = this.parseArgs();
      this.expect(">");
    }
    return { name: nameMatch[0], args, dims: 0 };
  }

  private parseArgs(): TypeRef[] {
    const args: TypeRef[] = [];
    for (;;) {
      args.push(this.parseType());
      this.skipSpaces();
      if (this.peek() === ",") {
        this.pos++;
        continue;
      }
      break;
    }
    return args;
  }

  private peek(): string {
    return this.text[this.pos] ?? "";
  }

  private skipSpaces(): void {
    while (this.text[this.pos] === " ") {
      this.pos++;
    }
  }

  private expect(ch: string): void {
    if (this.text[this.pos] === ch) {
      this.pos++;
    }
  }

  private matchWord(word: string): boolean {
    if (this.text.startsWith(word, this.pos)) {
      this.pos += word.length;
      this.skipSpaces();
      return true;
    }
    return false;
  }
}

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

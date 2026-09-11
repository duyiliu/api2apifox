/**
 * JVM 字段/类 descriptor 与泛型 Signature 的轻量解析。
 * 输入是 .class 文件里的形式(如 "Ljava/util/List<Ljava/lang/Long;>;"),
 * 输出还原为 Java 源码风格类型文本(如 "List<Long>"),供既有 TypeRef 管线使用。
 */

export interface SigType {
  /** 源码风格类型名(简单名或以 . 分隔的限定名,统一转简单名由上层处理) */
  name: string;
  args: SigType[];
  dims: number;
}

/** 字段/方法签名(含类型变量)或普通 descriptor → SigType;解析失败返回 undefined */
export function parseFieldSignature(sig: string): SigType | undefined {
  try {
    const p = new SigParser(sig);
    return p.parseType();
  } catch {
    return undefined;
  }
}

/** 类签名 "<E:Ljava/lang/Object;>Ljava/lang/Object;" → { typeParams, super } */
export function parseClassSignature(sig: string): { typeParams: string[]; superSig?: SigType } | undefined {
  try {
    const p = new SigParser(sig);
    const typeParams: string[] = [];
    if (p.peek() === "<") {
      p.next();
      // pos 边界防止畸形签名(缺 '>')时 peek 恒为空串、循环体不再推进而死循环
      while (p.pos < p.s.length && p.peek() !== ">") {
        const name = p.readIdentifier(); // 类型形参名
        p.next(); // ':' (class bound)
        p.parseType(); // class bound 类型(丢弃,只留形参名)
        while (p.pos < p.s.length && p.peek() === ":") {
          p.next();
          p.parseType(); // interface bounds
        }
        typeParams.push(name);
      }
      p.next(); // '>'
    }
    const superSig = p.peek() ? p.parseType() : undefined;
    return { typeParams, superSig };
  } catch {
    return undefined;
  }
}

/** SigType → 源码风格文本,如 List<Map<String,Long>>[] */
export function sigToText(t: SigType): string {
  let s = t.name;
  if (t.args.length) {
    s += "<" + t.args.map(sigToText).join(", ") + ">";
  }
  return s + "[]".repeat(t.dims);
}

class SigParser {
  pos = 0;
  constructor(readonly s: string) {}

  peek(offset = 0): string {
    return this.s[this.pos + offset] ?? "";
  }

  next(): string {
    return this.s[this.pos++] ?? "";
  }

  skip(ch: string): void {
    while (this.peek() === ch) {
      this.pos++;
    }
  }

  readIdentifier(): string {
    let out = "";
    while (this.pos < this.s.length && /[\w$.]/.test(this.s[this.pos])) {
      out += this.next();
    }
    return out;
  }

  /** 解析一个类型:数组维度(前缀 [)+ 基础类型/类类型(可能带 <...>)/类型变量/通配符 */
  parseType(): SigType {
    let dims = 0;
    while (this.peek() === "[") {
      this.next();
      dims++;
    }
    let t: SigType;
    const c = this.peek();
    if (c === "T") {
      // 类型变量 TE;
      this.next();
      const name = this.readIdentifier();
      this.skip(";");
      t = { name, args: [], dims };
    } else if (c === "*") {
      this.next();
      t = { name: "Object", args: [], dims };
    } else if (c === "+" || c === "-") {
      // 通配符 extends/super:取实参类型
      this.next();
      t = this.parseType();
      t = { ...t, dims };
    } else if (c === "L") {
      this.next(); // L
      let name = "";
      let args: SigType[] = [];
      while (this.pos < this.s.length) {
        const ch = this.peek();
        if (ch === "<") {
          this.next();
          // pos 边界防止畸形签名(缺 '>')时死循环(parseType 对空串不再推进)
          while (this.pos < this.s.length && this.peek() !== ">") {
            args.push(this.parseType());
          }
          this.next(); // '>'
          continue;
        }
        if (ch === ";") {
          this.next();
          break;
        }
        if (ch === ".") {
          // 内部类分隔:pkg/Outer<TA;>.Inner 的 '.' → '.'
          name += ".";
          this.next();
          continue;
        }
        name += this.next();
      }
      t = { name: name.replace(/\//g, "."), args, dims };
    } else {
      // 基础类型 B C D F I J S Z V
      const base = this.next();
      const prim: Record<string, string> = {
        B: "byte", C: "char", D: "double", F: "float", I: "int", J: "long", S: "short", Z: "boolean", V: "void",
      };
      t = { name: prim[base] ?? "Object", args: [], dims };
    }
    return t;
  }
}

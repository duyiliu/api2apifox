/**
 * Java .class 字节码的轻量解析器(只读类结构,不读方法体)。
 * 目标:从 jar 内的 .class 还原出与源码解析一致的类型信息——
 * 类别(class/interface/enum)、泛型形参、父类、字段(名/类型/泛型签名)、
 * 字段与类上的 RUNTIME 注解(含值,如 @ApiModelProperty 的中文描述)。
 *
 * 规格:The Java Virtual Machine Class File Format(JVM Spec §4)。
 */
import { parseClassSignature, parseFieldSignature, sigToText } from "./descriptor";

/* ---------- 常量池 tag ---------- */
const CP_UTF8 = 1;
const CP_INTEGER = 3;
const CP_FLOAT = 4;
const CP_LONG = 5;
const CP_DOUBLE = 6;
const CP_CLASS = 7;
const CP_STRING = 8;
const CP_FIELDREF = 9;
const CP_METHODREF = 10;
const CP_IFACEMETHODREF = 11;
const CP_NAMEANDTYPE = 12;
const CP_METHODHANDLE = 15;
const CP_METHODTYPE = 16;
const CP_DYNAMIC = 17;
const CP_INVOKEDYNAMIC = 18;
const CP_MODULE = 19;
const CP_PACKAGE = 20;

/* ---------- access flags ---------- */
export const ACC_PUBLIC = 0x0001;
const ACC_INTERFACE = 0x0200;
const ACC_ABSTRACT = 0x0400;
const ACC_SYNTHETIC = 0x1000;
const ACC_ANNOTATION_TYPE = 0x2000;
const ACC_ENUM = 0x4000;
const ACC_STATIC = 0x0008;
const ACC_FINAL = 0x0010;

export interface ClassFileAnnotation {
  /** 简单名,如 DataDic */
  name: string;
  /** 全限定名(点分隔) */
  fqcn: string;
  /** 元素值(标量或数组;enum 取常量名,class 取类名) */
  args: Record<string, unknown>;
}

export interface ClassFileField {
  name: string;
  /** 源码风格类型文本(优先泛型 Signature,否则 descriptor) */
  typeText: string;
  annotations: ClassFileAnnotation[];
  static: boolean;
  synthetic: boolean;
  enumConstant: boolean;
}

export interface ParsedClassFile {
  /** 点分隔全限定名 */
  fqcn: string;
  simpleName: string;
  kind: "class" | "interface" | "enum" | "annotation";
  typeParams: string[];
  /** 源码风格父类文本(含泛型实参);无则为 undefined */
  superClass?: string;
  fields: ClassFileField[];
  /** 枚举常量名(声明顺序) */
  enumConstants: string[];
  annotations: ClassFileAnnotation[];
}

/** 解析 .class 字节;失败抛错 */
export function parseClassFile(buf: Buffer): ParsedClassFile {
  const r = new ByteReader(buf);
  const magic = r.u4();
  if (magic !== 0xcafebabe) {
    throw new Error(`不是 class 文件(magic=0x${magic.toString(16)})`);
  }
  r.u2(); // minor
  r.u2(); // major

  /* ---- 常量池 ---- */
  const cpCount = r.u2();
  const cp: (string | number | LongVal | { index: number })[] = new Array(cpCount);
  let i = 1;
  while (i < cpCount) {
    const tag = r.u1();
    switch (tag) {
      case CP_UTF8:
        cp[i] = r.utf8();
        break;
      case CP_INTEGER:
      case CP_FLOAT:
        cp[i] = r.bytes(4).readUInt32BE(0);
        break;
      case CP_LONG:
      case CP_DOUBLE:
        cp[i] = new LongVal(r.bytes(8));
        i++; // 8 字节常量占两个槽
        break;
      case CP_CLASS:
      case CP_STRING:
      case CP_METHODTYPE:
      case CP_MODULE:
      case CP_PACKAGE:
        cp[i] = { index: r.u2() };
        break;
      case CP_FIELDREF:
      case CP_METHODREF:
      case CP_IFACEMETHODREF:
      case CP_NAMEANDTYPE:
      case CP_DYNAMIC:
      case CP_INVOKEDYNAMIC: {
        const a = r.u2();
        const b = r.u2();
        cp[i] = { index: a, index2: b } as never;
        break;
      }
      case CP_METHODHANDLE: {
        const a = r.u1();
        const b = r.u2();
        cp[i] = { index: b, kind: a } as never;
        break;
      }
      default:
        throw new Error(`未知常量池 tag: ${tag}`);
    }
    i++;
  }

  const utf8 = (idx: number): string => (typeof cp[idx] === "string" ? (cp[idx] as string) : "");
  const classNameOf = (idx: number): string => {
    const e = cp[idx] as { index: number } | undefined;
    if (!e || typeof e.index !== "number") {
      return "";
    }
    return utf8(e.index).replace(/\//g, ".");
  };

  /* ---- 类头 ---- */
  const accessFlags = r.u2();
  const thisClass = classNameOf(r.u2());
  const superClassIdx = r.u2();
  const interfacesCount = r.u2();
  for (let k = 0; k < interfacesCount; k++) {
    r.u2();
  }

  /* ---- fields(含枚举常量) ---- */
  const fieldsCount = r.u2();
  const fields: ClassFileField[] = [];
  const enumConstants: string[] = [];
  const selfDesc = "L" + thisClass.replace(/\./g, "/") + ";";
  for (let k = 0; k < fieldsCount; k++) {
    const fAccess = r.u2();
    const fNameIdx = r.u2();
    const fDescIdx = r.u2();
    const name = utf8(fNameIdx);
    const descriptor = utf8(fDescIdx);
    const anns: ClassFileAnnotation[] = [];
    let signature: string | undefined;
    const attrCount = r.u2();
    for (let a = 0; a < attrCount; a++) {
      const attrName = utf8(r.u2());
      const attrLen = r.u4();
      const attrBody = r.bytes(attrLen);
      if (attrName === "Signature") {
        signature = utf8(attrBody.readUInt16BE(0));
      } else if (attrName === "RuntimeVisibleAnnotations") {
        try {
          anns.push(...readAnnotations(new ByteReader(attrBody), cp, utf8));
        } catch {
          // 注解解析失败不阻断字段解析
        }
      }
    }
    const synthetic = (fAccess & ACC_SYNTHETIC) !== 0;
    const isStatic = (fAccess & ACC_STATIC) !== 0;
    const isEnumConst = (accessFlags & ACC_ENUM) !== 0 && descriptor === selfDesc && isStatic && (fAccess & ACC_FINAL) !== 0;
    if (isEnumConst) {
      enumConstants.push(name);
      continue;
    }
    if (synthetic || isStatic) {
      continue; // 与源码解析一致:静态/synthetic 字段不作为模型属性
    }
    const sig = signature ?? descriptor;
    const parsed = parseFieldSignature(sig);
    fields.push({
      name,
      typeText: parsed ? sigToText(parsed) : "Object",
      annotations: anns,
      static: isStatic,
      synthetic,
      enumConstant: false,
    });
  }

  /* ---- methods:跳过(文档生成不需要);但需消费以保持流位置正确 ---- */
  const methodsCount = r.u2();
  for (let k = 0; k < methodsCount; k++) {
    r.u2(); // access
    r.u2(); // name
    r.u2(); // descriptor
    const attrCount = r.u2();
    for (let a = 0; a < attrCount; a++) {
      r.u2(); // name
      r.bytes(r.u4());
    }
  }

  /* ---- 类级属性:Signature / RuntimeVisibleAnnotations ---- */
  let classSignature: string | undefined;
  const classAnns: ClassFileAnnotation[] = [];
  const classAttrCount = r.u2();
  for (let a = 0; a < classAttrCount; a++) {
    const attrName = utf8(r.u2());
    const attrLen = r.u4();
    const attrBody = r.bytes(attrLen);
    if (attrName === "Signature") {
      classSignature = utf8(attrBody.readUInt16BE(0));
    } else if (attrName === "RuntimeVisibleAnnotations") {
      try {
        classAnns.push(...readAnnotations(new ByteReader(attrBody), cp, utf8));
      } catch {
        // 忽略
      }
    }
  }

  /* ---- 汇总 ---- */
  let typeParams: string[] = [];
  let superClass: string | undefined;
  if (classSignature) {
    const cs = parseClassSignature(classSignature);
    if (cs) {
      typeParams = cs.typeParams;
      if (cs.superSig) {
        const text = sigToText(cs.superSig);
        if (text !== "java.lang.Object" && text !== "Object") {
          superClass = text;
        }
      }
    }
  } else if (superClassIdx !== 0) {
    const sc = classNameOf(superClassIdx);
    if (sc && sc !== "java.lang.Object") {
      superClass = sc;
    }
  }

  const kind: ParsedClassFile["kind"] =
    (accessFlags & ACC_ANNOTATION_TYPE) !== 0
      ? "annotation"
      : (accessFlags & ACC_ENUM) !== 0
        ? "enum"
        : (accessFlags & ACC_INTERFACE) !== 0
          ? "interface"
          : "class";

  const simpleName = thisClass.slice(thisClass.lastIndexOf(".") + 1);
  return { fqcn: thisClass, simpleName, kind, typeParams, superClass, fields, enumConstants, annotations: classAnns };
}

class LongVal {
  constructor(readonly buf: Buffer) {}
}

class ByteReader {
  private pos = 0;
  constructor(private readonly buf: Buffer) {}

  u1(): number {
    return this.buf.readUInt8(this.pos++);
  }

  u2(): number {
    const v = this.buf.readUInt16BE(this.pos);
    this.pos += 2;
    return v;
  }

  u4(): number {
    const v = this.buf.readUInt32BE(this.pos);
    this.pos += 4;
    return v;
  }

  bytes(n: number): Buffer {
    const b = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return b;
  }

  utf8(): string {
    const len = this.u2();
    const raw = this.bytes(len);
    // JVM modified-UTF8:常规内容与标准 UTF-8 兼容(含中文);不做 0xC0 80 补零等边角处理
    return raw.toString("utf8");
  }
}

/** RuntimeVisibleAnnotations 结构 → 注解列表 */
function readAnnotations(r: ByteReader, cp: unknown[], utf8: (i: number) => string): ClassFileAnnotation[] {
  const num = r.u2();
  const out: ClassFileAnnotation[] = [];
  for (let k = 0; k < num; k++) {
    out.push(readAnnotation(r, cp, utf8));
  }
  return out;
}

function readAnnotation(r: ByteReader, cp: unknown[], utf8: (i: number) => string): ClassFileAnnotation {
  const typeDesc = utf8(r.u2()); // 如 "Lext/plus/common/core/annotation/DataDic;"
  const fqcn = typeDesc.replace(/^L|;$/g, "").replace(/\//g, ".");
  const numPairs = r.u2();
  const args: Record<string, unknown> = {};
  for (let k = 0; k < numPairs; k++) {
    const name = utf8(r.u2());
    args[name] = readElementValue(r, cp, utf8);
  }
  return { name: fqcn.slice(fqcn.lastIndexOf(".") + 1), fqcn, args };
}

function readElementValue(r: ByteReader, cp: unknown[], utf8: (i: number) => string): unknown {
  const tag = String.fromCharCode(r.u1());
  switch (tag) {
    case "B":
    case "C":
    case "I":
    case "S": {
      const idx = r.u2();
      const v = cp[idx];
      return typeof v === "number" ? v : undefined;
    }
    case "Z": {
      const idx = r.u2();
      const v = cp[idx];
      return typeof v === "number" ? v !== 0 : undefined;
    }
    case "D":
    case "F":
    case "J": {
      const idx = r.u2();
      const v = cp[idx];
      if (v instanceof LongVal) {
        const lo = v.buf.readUInt32BE(4);
        return lo; // 文档场景取低 32 位即可(long 值当 id 用)
      }
      return typeof v === "number" ? v : undefined;
    }
    case "s":
      return utf8(r.u2());
    case "e": {
      r.u2(); // enum type name
      return utf8(r.u2()); // 常量名
    }
    case "c": {
      const d = utf8(r.u2());
      return d.replace(/^L|;$/g, "").replace(/\//g, ".");
    }
    case "@": {
      const ann = readAnnotation(r, cp, utf8);
      return ann;
    }
    case "[": {
      const n = r.u2();
      const arr: unknown[] = [];
      for (let k = 0; k < n; k++) {
        arr.push(readElementValue(r, cp, utf8));
      }
      return arr;
    }
    default:
      return undefined;
  }
}

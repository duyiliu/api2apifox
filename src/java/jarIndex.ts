/**
 * 依赖 jar 的类索引:从本地 Maven 仓库读取 jar(zip),按需解析其中的 .class
 * 字节码并转换为与源码解析一致的 ClassInfo,供 TypeIndex 兜底(源码没有的类型,
 * 如框架的 ResponseDto/分页包装,无需白名单即可展开)。
 *
 * 组成:
 *  - 极简 zip 读取(EOCD → central directory → local header;DEFLATE 用 zlib.inflateRaw)
 *  - Maven 仓库发现(settings.xml localRepository、默认 ~/.m2/repository、用户配置)
 *  - 工作区 pom.xml 依赖坐标 → jar 定位(版本取目录内最新)
 *  - 简单类名 → {jar, entry} 索引(只读 central directory,不解压全部)
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as zlib from "zlib";
import { parseClassFile, ParsedClassFile } from "./classFile";
import { AnnotationArgs, AnnotationInfo, ClassInfo, FieldInfo, TypeKind } from "./model";
import { ArgValue } from "./annotation";

/* ---------------- zip 读取 ---------------- */

interface ZipEntryMeta {
  name: string;
  method: number;
  compressedSize: number;
  localOffset: number;
}

// zip 小端读取时的签名值(PK\x05\x06 等按 LE 解释)
const EOCD_SIG = 0x06054b50;
const CDE_SIG = 0x02014b50;
const LFH_SIG = 0x04034b50;

/** 读取 jar 的全部条目元数据(central directory;不解压) */
export function readZipEntries(buf: Buffer): ZipEntryMeta[] {
  // 1. 从尾部找 EOCD
  const minTail = 22;
  const maxComment = 0xffff;
  const start = Math.max(0, buf.length - minTail - maxComment);
  let eocd = -1;
  for (let i = buf.length - minTail; i >= start; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) {
    throw new Error("zip: 未找到 EOCD");
  }
  const total = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);

  // 2. central directory
  const out: ZipEntryMeta[] = [];
  let p = cdOffset;
  for (let k = 0; k < total; k++) {
    if (buf.readUInt32LE(p) !== CDE_SIG) {
      break;
    }
    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    out.push({ name, method, compressedSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

/** 读取 jar 中单个条目的数据 */
export function readZipEntry(buf: Buffer, entry: ZipEntryMeta): Buffer {
  const lp = entry.localOffset;
  if (buf.readUInt32LE(lp) !== LFH_SIG) {
    throw new Error(`zip: local header 校验失败(${entry.name})`);
  }
  const nameLen = buf.readUInt16LE(lp + 26);
  const extraLen = buf.readUInt16LE(lp + 28);
  const dataStart = lp + 30 + nameLen + extraLen;
  const raw = buf.subarray(dataStart, dataStart + entry.compressedSize);
  if (entry.method === 0) {
    return Buffer.from(raw);
  }
  if (entry.method === 8) {
    return zlib.inflateRawSync(raw);
  }
  throw new Error(`zip: 不支持的压缩方式 ${entry.method}(${entry.name})`);
}

/* ---------------- .class → ClassInfo ---------------- */

function toAnnotationInfo(a: ParsedClassFile["annotations"][number]): AnnotationInfo {
  const args: AnnotationArgs = {};
  for (const [k, v] of Object.entries(a.args)) {
    args[k] = toArgValue(v);
  }
  return { name: a.name, raw: `@${a.fqcn}`, args };
}

function toArgValue(v: unknown): ArgValue | ArgValue[] {
  if (Array.isArray(v)) {
    return v.map((x) => toArgValue(x)) as ArgValue[];
  }
  if (v === null || v === undefined) {
    return "";
  }
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return v;
  }
  if (typeof v === "object" && "name" in (v as object) && "args" in (v as object)) {
    // 嵌套注解:展平为其 args 的 value 字符串(文档场景够用)
    const nested = (v as { args?: Record<string, unknown> }).args ?? {};
    const first = Object.values(nested)[0];
    return typeof first === "string" || typeof first === "number" || typeof first === "boolean" ? first : "";
  }
  return String(v);
}

function toClassInfo(pc: ParsedClassFile): ClassInfo {
  const fields: FieldInfo[] = pc.fields.map((f) => ({
    name: f.name,
    typeText: f.typeText,
    annotations: f.annotations.map(toAnnotationInfo),
    javadoc: undefined,
  }));
  const kind: TypeKind = pc.kind === "enum" ? "enum" : pc.kind === "interface" ? "interface" : "class";
  return {
    simpleName: pc.simpleName,
    qualifiedName: pc.fqcn,
    kind,
    typeParams: pc.typeParams,
    fields,
    recordComponents: [],
    enumConstants: pc.enumConstants,
    annotations: pc.annotations.map(toAnnotationInfo),
    superClass: pc.superClass,
  };
}

/* ---------------- jar 类索引 ---------------- */

interface EntryRef {
  jarPath: string;
  entryName: string;
}

/**
 * 简单类名 → jar 条目的索引。lookup 按需解析 .class 并缓存 ClassInfo。
 * 索引只遍历各 jar 的 central directory(不解压),构造开销低。
 */
export class JarClassIndex {
  private readonly bySimple = new Map<string, EntryRef>();
  private readonly cache = new Map<string, ClassInfo | null>();
  private readonly jarCache = new Map<string, { buf: Buffer; entries: Map<string, ZipEntryMeta> } | null>();
  /** 解析失败的条目(jar 缺失/损坏),用于诊断 */
  readonly warnings: string[] = [];

  static build(jarPaths: string[]): JarClassIndex {
    const idx = new JarClassIndex();
    for (const jp of jarPaths) {
      try {
        const buf = fs.readFileSync(jp);
        for (const e of readZipEntries(buf)) {
          if (!e.name.endsWith(".class")) {
            continue;
          }
          if (e.name.endsWith("module-info.class") || e.name.endsWith("package-info.class")) {
            continue;
          }
          const base = e.name.slice(0, -".class".length);
          const simple = base.slice(base.lastIndexOf("/") + 1).split("$").pop() ?? base;
          if (!simple || !/^[A-Za-z_]\w*$/.test(simple)) {
            continue;
          }
          // 源码优先:同名条目保留首个(先注册的 jar 优先);通常各 jar 类名不冲突
          if (!idx.bySimple.has(simple)) {
            idx.bySimple.set(simple, { jarPath: jp, entryName: e.name });
          }
        }
      } catch (err) {
        idx.warnings.push(`读取 jar 失败 ${jp}:${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return idx;
  }

  get size(): number {
    return this.bySimple.size;
  }

  private jarOf(jarPath: string): { buf: Buffer; entries: Map<string, ZipEntryMeta> } | null {
    if (this.jarCache.has(jarPath)) {
      return this.jarCache.get(jarPath) ?? null;
    }
    try {
      const buf = fs.readFileSync(jarPath);
      const entries = new Map(readZipEntries(buf).map((e) => [e.name, e]));
      const val = { buf, entries };
      this.jarCache.set(jarPath, val);
      return val;
    } catch (err) {
      this.warnings.push(`读取 jar 失败 ${jarPath}:${err instanceof Error ? err.message : String(err)}`);
      this.jarCache.set(jarPath, null);
      return null;
    }
  }

  /** 按简单类名取 ClassInfo;无/失败返回 undefined */
  lookup(simpleName: string): ClassInfo | undefined {
    if (this.cache.has(simpleName)) {
      const hit = this.cache.get(simpleName);
      return hit ?? undefined;
    }
    const ref = this.bySimple.get(simpleName);
    if (!ref) {
      this.cache.set(simpleName, null);
      return undefined;
    }
    try {
      const jar = this.jarOf(ref.jarPath);
      const entry = jar?.entries.get(ref.entryName);
      if (!jar || !entry) {
        this.cache.set(simpleName, null);
        return undefined;
      }
      const classBytes = readZipEntry(jar.buf, entry);
      const info = toClassInfo(parseClassFile(classBytes));
      this.cache.set(simpleName, info);
      return info;
    } catch (err) {
      this.warnings.push(`解析 ${ref.jarPath}!${ref.entryName} 失败:${err instanceof Error ? err.message : String(err)}`);
      this.cache.set(simpleName, null);
      return undefined;
    }
  }
}

/* ---------------- Maven 仓库与坐标 ---------------- */

export interface PomCoordinate {
  groupId: string;
  artifactId: string;
}

/**
 * 自动发现本地 Maven 仓库(用户显式配置的优先),发现链:
 *  1. settings 显式 dependencyRepos
 *  2. JetBrains IDEA 路径变量 MAVEN_REPOSITORY(APPDATA 下 JetBrains 各产品的 path.macros.xml)
 *  3. IDEA Maven 索引登记的本地仓库(mavenIndicesState.xml 的 entry key,过滤远程 URL)
 *  4. ~/.m2/settings.xml 的 localRepository
 *  5. 默认 ~/.m2/repository
 */
export function discoverMavenRepos(configured: string[]): string[] {
  const repos: string[] = [];
  const push = (p: string) => {
    if (!p) {
      return;
    }
    try {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory() && !repos.includes(p)) {
        repos.push(p);
      }
    } catch {
      // 忽略不可访问路径
    }
  };
  // 1. 用户配置
  for (const r of configured) {
    push(r);
  }
  // 2/3. JetBrains(IDEA 等)配置目录
  for (const dir of jetbrainsOptionDirs()) {
    let products: string[] = [];
    try {
      products = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const prod of products) {
      const optBase = path.join(dir, prod, "options");
      // MAVEN_REPOSITORY 路径宏(IDEA 里覆盖本地仓库时写入)
      const macros = readTextSafe(path.join(optBase, "path.macros.xml"));
      if (macros) {
        const m = /<macro\s+name="MAVEN_REPOSITORY"\s+value="([^"]+)"/.exec(macros);
        if (m) {
          push(m[1]);
        }
      }
      // Maven 索引登记的本地仓库
      const indices = readTextSafe(path.join(optBase, "mavenIndicesState.xml"));
      if (indices) {
        for (const em of indices.matchAll(/<entry key="([^"]+)">/g)) {
          const v = em[1];
          if (v && !/^https?:/i.test(v)) {
            push(v);
          }
        }
      }
    }
  }
  // 4. ~/.m2/settings.xml 的 localRepository
  const settings = path.join(os.homedir(), ".m2", "settings.xml");
  const settingsText = readTextSafe(settings);
  if (settingsText) {
    const m = /<localRepository>([^<]+)<\/localRepository>/.exec(settingsText);
    if (m) {
      push(m[1].trim());
    }
  }
  // 5. 默认 ~/.m2/repository
  push(path.join(os.homedir(), ".m2", "repository"));
  return repos;
}

/** JetBrains 系产品(IDEA 等)的 options 目录候选(Windows/macOS/Linux) */
function jetbrainsOptionDirs(): string[] {
  const out: string[] = [];
  const appData = process.env.APPDATA;
  if (appData) {
    out.push(path.join(appData, "JetBrains"));
  }
  const home = os.homedir();
  out.push(path.join(home, ".config", "JetBrains"));
  out.push(path.join(home, "Library", "Application Support", "JetBrains"));
  return out;
}

function readTextSafe(p: string): string | undefined {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return undefined;
  }
}

/** 解析 pom.xml 文本中的直接依赖坐标(忽略含 ${} 的、test/provided 的) */
export function parsePomDependencies(content: string): PomCoordinate[] {
  const out: PomCoordinate[] = [];
  const seen = new Set<string>();
  for (const m of content.matchAll(/<dependency>[\s\S]*?<\/dependency>/g)) {
    const d = m[0];
    if (/<scope>\s*(test|provided)\s*<\/scope>/.test(d)) {
      continue;
    }
    const g = /<groupId>\s*([^<]+?)\s*<\/groupId>/.exec(d)?.[1];
    const a = /<artifactId>\s*([^<]+?)\s*<\/artifactId>/.exec(d)?.[1];
    if (!g || !a || g.includes("${") || a.includes("${")) {
      continue;
    }
    const key = `${g}:${a}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ groupId: g, artifactId: a });
    }
  }
  return out;
}

/** 版本自然排序比较:"2.10.0" > "2.9.0" > "1.0.0-RELEASE" */
function versionCompare(a: string, b: string): number {
  const pa = a.split(/[.-]/);
  const pb = b.split(/[.-]/);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const xa = pa[i] ?? "";
    const xb = pb[i] ?? "";
    const na = /^\d+$/.test(xa) ? parseInt(xa, 10) : NaN;
    const nb = /^\d+$/.test(xb) ? parseInt(xb, 10) : NaN;
    if (!isNaN(na) && !isNaN(nb)) {
      if (na !== nb) {
        return na - nb;
      }
      continue;
    }
    const c = xa.localeCompare(xb);
    if (c !== 0) {
      return c;
    }
  }
  return 0;
}

/** 在仓库中定位坐标对应的 jar(每个 artifact 取最新版本) */
/**
 * 解析依赖 jar 集合:直接依赖(工作区 pom 坐标)+ 传递依赖(jar 内嵌
 * META-INF/maven 下的 pom.xml 声明的依赖,迭代 2 轮,总量封顶)。
 */
export function resolveDependencyJars(
  repos: string[],
  pomCoords: PomCoordinate[],
  opts: { maxRounds?: number; maxJars?: number } = {}
): { jars: string[]; warnings: string[] } {
  const maxRounds = opts.maxRounds ?? 2;
  const maxJars = opts.maxJars ?? 120;
  const collected: string[] = [];
  const collectedSet = new Set<string>();
  const knownCoords = new Set(pomCoords.map((c) => `${c.groupId}:${c.artifactId}`));
  const warnings: string[] = [];

  let roundCoords = pomCoords;
  for (let round = 0; round <= maxRounds && collected.length < maxJars; round++) {
    const jars = findJarsForCoordinates(repos, roundCoords);
    const fresh = jars.filter((j) => !collectedSet.has(j));
    for (const j of fresh) {
      if (collected.length >= maxJars) {
        warnings.push(`依赖 jar 数量达到上限 ${maxJars},忽略其余`);
        break;
      }
      collected.push(j);
      collectedSet.add(j);
    }
    if (round === maxRounds || !fresh.length) {
      break;
    }
    // 读取新 jar 内嵌 pom 的依赖坐标(传递依赖)
    const next: PomCoordinate[] = [];
    for (const j of jars) {
      try {
        const buf = fs.readFileSync(j);
        const entries = readZipEntries(buf);
        const pomEntry = entries.find((e) => /^META-INF\/maven\/[^/]+\/[^/]+\/pom\.xml$/.test(e.name));
        if (pomEntry) {
          for (const c of parsePomDependencies(readZipEntry(buf, pomEntry).toString("utf8"))) {
            const key = `${c.groupId}:${c.artifactId}`;
            if (!knownCoords.has(key)) {
              knownCoords.add(key);
              next.push(c);
            }
          }
        }
      } catch (err) {
        warnings.push(`读取 ${j} 内嵌 pom 失败:${err instanceof Error ? err.message : String(err)}`);
      }
    }
    if (!next.length) {
      break;
    }
    roundCoords = next;
  }
  return { jars: collected, warnings };
}

export function findJarsForCoordinates(repos: string[], coords: PomCoordinate[]): string[] {
  const jars: string[] = [];
  const seen = new Set<string>();
  for (const c of coords) {
    // 每个仓库分别尝试(repos 按优先级排序),第一个命中该坐标的仓库生效
    let versions: string[] = [];
    let artifactDirHit = "";
    for (const repo of repos) {
      const artifactDir = path.join(repo, ...c.groupId.split("."), c.artifactId);
      let list: string[];
      try {
        list = fs.readdirSync(artifactDir);
      } catch {
        continue;
      }
      const vers = list.filter((v) => {
        try {
          return fs.statSync(path.join(artifactDir, v)).isDirectory() && !/^\./.test(v);
        } catch {
          return false;
        }
      });
      if (vers.length) {
        artifactDirHit = artifactDir;
        versions = vers;
        break;
      }
    }
    if (!versions.length) {
      continue;
    }
    versions.sort(versionCompare);
    // 从最新往回找第一个实体 jar
    for (let i = versions.length - 1; i >= 0; i--) {
      const vDir = path.join(artifactDirHit, versions[i]);
      try {
        const jar = fs
          .readdirSync(vDir)
          .find((f) => f === `${c.artifactId}-${versions[i]}.jar` && !f.includes("sources") && !f.includes("javadoc"));
        if (jar) {
          const full = path.join(vDir, jar);
          if (!seen.has(full)) {
            seen.add(full);
            jars.push(full);
          }
          break;
        }
      } catch {
        // 版本目录不可读,继续回退
      }
    }
  }
  return jars;
}

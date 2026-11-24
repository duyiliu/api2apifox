import * as fs from "node:fs";
import * as path from "node:path";
import fg from "fast-glob";
import { parseProperties, unescapeProp } from "../config/helperProperties";
import { fileSetFingerprint } from "../config/fileFingerprint";
import { createGitEntryProbe, isInHiddenDirectory, isSkippedCheckout } from "../java/scanScope";
import { throwIfAborted } from "./projectScanner";

/**
 * 读取 Spring 的 application 配置,算出接口路径的真实前缀(Issue #44)。
 * 只解析平面键;锚点、别名、块标量、多文档等无法安全推导的写法一律告警跳过,不影响其余接口产出。
 */

/** 参与前缀计算的配置键(拼接顺序:context-path -> servlet.path) */
const CONTEXT_PATH = "server.servlet.context-path";
const SERVLET_PATH = "spring.mvc.servlet.path";
const WEBFLUX_BASE_PATH = "spring.webflux.base-path";
const PROFILES_ACTIVE = "spring.profiles.active";

/** 诊断短名,与 Issue 示例 `已应用 context-path=/api-xxx（application.yml）` 同口径 */
const KEY_LABELS: Record<string, string> = {
  [CONTEXT_PATH]: "context-path",
  [SERVLET_PATH]: "servlet.path",
  [WEBFLUX_BASE_PATH]: "base-path",
};

/** 命中的配置键、值,以及来源文件(项目根模块只写文件名,子模块写相对路径) */
export interface SpringPathPrefixPart {
  key: string;
  value: string;
  file: string;
}

/** 一个模块(含 src/main/resources 的目录)解析出的前缀 */
export interface SpringPathPrefixModule {
  moduleRoot: string;
  prefix: string;
  parts: SpringPathPrefixPart[];
}

export interface SpringPathPrefixes {
  modules: SpringPathPrefixModule[];
  /** 解析失败/无法静态求值的问题 */
  warnings: string[];
  /** 已应用前缀的来源说明 */
  messages: string[];
  /** 配置文件指纹(参与结果缓存键);无配置文件时为空串 */
  key: string;
  prefixFor(fsPath: string): string;
}

interface ConfigFile {
  id: string;
  display: string;
  moduleRoot: string;
  /** 基础层为 undefined;profile 变体为 profile 名 */
  profile?: string;
  content: string;
}

const APPLICATION_NAME = /^application(-([\w.-]+))?\.(yml|yaml|properties)$/i;

const absPosix = (file: string): string => path.resolve(file).replace(/\\/g, "/");
const unique = (items: string[]): string[] => [...new Set(items)];

export function createSpringPathPrefixes(
  modules: SpringPathPrefixModule[],
  warnings: string[] = [],
  messages: string[] = [],
  key = ""
): SpringPathPrefixes {
  // 最长模块根优先:父模块的 application 配置不能串到子模块
  const sorted = [...modules].sort((a, b) => b.moduleRoot.length - a.moduleRoot.length);
  return {
    modules: sorted,
    warnings,
    messages,
    key,
    prefixFor(fsPath: string): string {
      const normalized = absPosix(fsPath);
      return sorted.find((m) => normalized === m.moduleRoot || normalized.startsWith(`${m.moduleRoot}/`))?.prefix ?? "";
    },
  };
}

/** 找出各模块 `src/main/resources` 下的 application 配置(含 profile 变体);与 Java 扫描同口径剔除隐藏目录/嵌套检出 */
export async function findSpringConfigFiles(roots: string[], signal?: AbortSignal): Promise<string[]> {
  const probe = createGitEntryProbe((candidate) => fs.existsSync(candidate));
  const found = new Set<string>();
  for (const root of roots) {
    throwIfAborted(signal);
    const matches = await fg("**/src/main/resources/**/application*.{yml,yaml,properties}", {
      cwd: root,
      absolute: true,
      onlyFiles: true,
      unique: true,
      dot: true,
      followSymbolicLinks: false,
    });
    for (const file of matches) {
      throwIfAborted(signal);
      const dir = path.dirname(file);
      const skipped = isInHiddenDirectory(dir, root) || isSkippedCheckout(dir, root, probe.hasGitEntry);
      if (APPLICATION_NAME.test(path.basename(file)) && !skipped) {
        found.add(path.resolve(file));
      }
    }
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

/** 扫描并读取(CLI 用,每次都重读);扩展侧用 loadSpringPathPrefixes(带会话缓存) */
export async function discoverSpringPathPrefixes(roots: string[], signal?: AbortSignal): Promise<SpringPathPrefixes> {
  const warnings: string[] = [];
  const files: { path: string; content: string }[] = [];
  for (const file of await findSpringConfigFiles(roots, signal)) {
    throwIfAborted(signal);
    try {
      files.push({ path: file, content: await fs.promises.readFile(file, "utf8") });
    } catch (error) {
      warnings.push(`Spring 配置文件读取失败:${file}(${error instanceof Error ? error.message : String(error)})`);
    }
  }
  const parsed = parseSpringPathPrefixes(files, roots);
  const key = fileSetFingerprint(files.map((file) => file.path));
  return createSpringPathPrefixes(parsed.modules, unique([...warnings, ...parsed.warnings]), parsed.messages, key);
}

/** 会话级缓存(扩展用):配置文件集合与 size/mtime 未变时复用,避免每次刷新树都重读 */
let cache: { key: string; prefixes: SpringPathPrefixes } | undefined;

export async function loadSpringPathPrefixes(roots: string[]): Promise<SpringPathPrefixes> {
  const files: string[] = [];
  for (const root of roots) {
    try {
      files.push(...(await findSpringConfigFiles([root])));
    } catch {
      // 单个工作区目录不可扫时跳过,不影响其它目录
    }
  }
  const unique = [...new Set(files)].sort();
  const key = fileSetFingerprint(unique);
  if (cache?.key === key) {
    return cache.prefixes;
  }
  const contents: { path: string; content: string }[] = [];
  let readAll = true;
  for (const file of unique) {
    try {
      contents.push({ path: file, content: await fs.promises.readFile(file, "utf8") });
    } catch {
      // 不可读时本次不写缓存,下次刷新重试
      readAll = false;
    }
  }
  const parsed = parseSpringPathPrefixes(contents, roots);
  const prefixes = createSpringPathPrefixes(parsed.modules, parsed.warnings, parsed.messages, key);
  if (readAll) {
    cache = { key, prefixes };
  }
  return prefixes;
}

/** 清空会话缓存(扩展停用/配置切换时调用) */
export const resetSpringPathPrefixCache = (): void => {
  cache = undefined;
};

/** 纯函数:文件内容由调用方提供,便于用夹具锁定 profile 合并次序(roots 用于诊断里的相对路径) */
export function parseSpringPathPrefixes(
  files: { path: string; content: string; root?: string }[],
  roots: string[] = []
): SpringPathPrefixes {
  const warnings: string[] = [];
  const messages: string[] = [];
  const byModule = new Map<string, ConfigFile[]>();
  for (const file of files) {
    const id = absPosix(file.path);
    const moduleRoot = moduleRootOf(id);
    if (!moduleRoot) {
      // 不在 src/main/resources 下:不是 Spring 配置
      continue;
    }
    const match = APPLICATION_NAME.exec(path.posix.basename(id));
    const scope = file.root ? [file.root] : roots;
    const list = byModule.get(moduleRoot) ?? [];
    list.push({ id, display: displayPath(id, moduleRoot, scope), moduleRoot, profile: match?.[2], content: file.content });
    byModule.set(moduleRoot, list);
  }
  const modules: SpringPathPrefixModule[] = [];
  for (const [moduleRoot, list] of [...byModule.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const values = mergeConfigLayers(list, warnings);
    const resolved = resolvePrefix(values, warnings);
    if (resolved.parts.length) {
      messages.push(...resolved.parts.map((part) => `已应用 ${KEY_LABELS[part.key]}=${part.value}（${part.file}）`));
      modules.push({ moduleRoot, prefix: resolved.prefix, parts: resolved.parts });
    }
  }
  return createSpringPathPrefixes(modules, unique(warnings), messages);
}

/** 基础层先合并,再按 spring.profiles.active 的顺序合并 profile 变体(后激活覆盖先激活) */
function mergeConfigLayers(files: ConfigFile[], warnings: string[]): Map<string, { value: string; file: string }> {
  const values = new Map<string, { value: string; file: string }>();
  const apply = (file: ConfigFile, base: boolean): void => {
    for (const [key, value] of parseConfig(file, warnings)) {
      // profile 变体里的 spring.profiles.active 不递归展开(Spring 自身同口径)
      if (base || key !== PROFILES_ACTIVE) {
        values.set(key, { value, file: file.display });
      }
    }
  };
  // 同目录 properties 覆写 yaml 是 Spring Boot 的规则;层内按文件名排序保证确定性
  const rank = (file: ConfigFile) => (file.profile ? 2 : 0) + (file.id.endsWith(".properties") ? 1 : 0);
  const ordered = [...files].sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
  ordered.filter((item) => !item.profile).forEach((file) => apply(file, true));
  const byProfile = new Map(ordered.filter((item) => item.profile).map((item) => [item.profile!, item]));
  parseProfileList(values.get(PROFILES_ACTIVE)?.value ?? "").forEach((profile) => {
    const file = byProfile.get(profile);
    if (file) apply(file, false);
  });
  return values;
}

function resolvePrefix(
  values: Map<string, { value: string; file: string }>,
  warnings: string[]
): { prefix: string; parts: SpringPathPrefixPart[] } {
  const take = (key: string): SpringPathPrefixPart | undefined => {
    const hit = values.get(key);
    const value = hit ? normalizePrefix(hit.value, key, warnings, hit.file) : "";
    return value && hit ? { key, value, file: hit.file } : undefined;
  };

  const webflux = take(WEBFLUX_BASE_PATH);
  if (webflux) {
    if (values.has(CONTEXT_PATH) || values.has(SERVLET_PATH)) {
      warnings.push(
        `检测到 ${WEBFLUX_BASE_PATH}=${webflux.value} 时按 WebFlux 栈取前缀,已忽略 ${CONTEXT_PATH}/${SERVLET_PATH}`
      );
    }
    return { prefix: webflux.value, parts: [webflux] };
  }
  const parts = [take(CONTEXT_PATH), take(SERVLET_PATH)].filter((part): part is SpringPathPrefixPart => !!part);
  const joined = parts.map((part) => part.value).join("").replace(/\/{2,}/g, "/");
  return { prefix: joined.replace(/\/+$/, ""), parts };
}

/** 去引号/首尾空白,补前导 /,去尾随 /,折叠重复 /;`/` 视为无前缀 */
function normalizePrefix(raw: string, key: string, warnings: string[], file: string): string {
  if (raw.includes("${")) {
    warnings.push(`${file}: ${key} 的值包含占位符,无法静态求值,已忽略:${raw}`);
    return "";
  }
  const value = unquote(raw).trim();
  const normalized = value ? `/${value.replace(/^\/+/, "")}`.replace(/\/{2,}/g, "/") : "";
  return normalized === "/" ? "" : normalized.replace(/\/+$/, "");
}

function parseProfileList(raw: string): string[] {
  return raw.split(",").map((item) => unquote(item).trim()).filter(Boolean);
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed[0] === "'" && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  if (trimmed.length >= 2 && trimmed[0] === '"' && trimmed.endsWith('"')) {
    return unescapeProp(trimmed.slice(1, -1));
  }
  return trimmed;
}

function parseConfig(file: ConfigFile, warnings: string[]): Map<string, string> {
  return file.id.endsWith(".properties") ? parsePropertiesConfig(file, warnings) : parseYamlConfig(file, warnings);
}

function parsePropertiesConfig(file: ConfigFile, warnings: string[]): Map<string, string> {
  const parsed = parseProperties(file.content, file.display);
  warnings.push(...parsed.warnings);
  const values = new Map<string, string>();
  // key[...] 是 Apifox Helper 的条件语法,不是 Spring 配置
  parsed.entries
    .filter((entry) => entry.cond === undefined)
    .forEach((entry) => values.set(entry.key.trim(), unescapeProp(entry.value)));
  return values;
}

/** 平面键 YAML:按缩进维护键路径(兼容点号写法);锚点/别名/块标量/多文档/Tab 缩进告警跳过 */
function parseYamlConfig(file: ConfigFile, warnings: string[]): Map<string, string> {
  const values = new Map<string, string>();
  const stack: { indent: number; key: string }[] = [];
  let skipDeeperThan = -1;
  file.content.split(/\r\n|\r|\n/).forEach((rawLine, index) => {
    const lineNo = index + 1;
    if (!rawLine.trim()) return;
    const indent = rawLine.length - rawLine.trimStart().length;
    // YAML 不允许用制表符缩进
    if (rawLine[0] === "\t" || /^ +\t/.test(rawLine)) {
      warnings.push(`${file.display}:${lineNo} 缩进含制表符,YAML 不允许,已跳过该行`);
      return;
    }
    if (skipDeeperThan >= 0 && indent > skipDeeperThan) return;
    skipDeeperThan = -1;
    const skip = (message: string) => {
      warnings.push(`${file.display}:${lineNo} ${message}:${rawLine.trim().slice(0, 40)}`);
      skipDeeperThan = indent;
    };
    const line = stripYamlComment(rawLine.slice(indent)).trimEnd();
    if (!line.trim()) return;
    if (/^(---|\.\.\.)$/.test(line.trim())) {
      warnings.push(`${file.display}:${lineNo} 多文档 YAML 不支持,已停止解析该文件`);
      skipDeeperThan = Number.MAX_SAFE_INTEGER;
      return;
    }
    if (line.startsWith("- ")) {
      const parent = stack[stack.length - 1];
      if (!parent) {
        warnings.push(`${file.display}:${lineNo} 顶层列表项无法归属配置键,已跳过`);
        return;
      }
      const listKey = [...stack.map((frame) => frame.key), parent.key].join(".");
      const item = unquote(stripYamlComment(line.slice(2)));
      values.set(listKey, values.has(listKey) ? `${values.get(listKey)},${item}` : item);
      return;
    }
    const separator = line.indexOf(":");
    if (separator <= 0) {
      warnings.push(`${file.display}:${lineNo} 无法解析的 YAML 行(缺少 :):${line.trim().slice(0, 40)}`);
      return;
    }
    const rawKey = line.slice(0, separator).trim();
    const key = unquote(rawKey);
    if (!key || /^[?&*]|^<</.test(rawKey)) {
      skip("锚点/别名/复杂键写法不支持");
      return;
    }
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const fullKey = [...stack.map((frame) => frame.key), key].join(".");
    const value = line.slice(separator + 1).trim();
    if (!value) {
      stack.push({ indent, key });
      return;
    }
    if (/^[|>&*]/.test(value)) {
      skip(`${/^[|>]/.test(value) ? "块标量" : "锚点/别名"}写法不支持(${fullKey})`);
      return;
    }
    values.set(fullKey, unquote(value));
  });
  return values;
}

/** 行内注释:引号外的 ` #`(YAML 要求注释前有空白) */
function stripYamlComment(value: string): string {
  let quote: string | null = null;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (quote && ch === "\\" && quote === '"') i++;
    else if (quote && ch === quote) quote = null;
    else if (!quote && (ch === '"' || ch === "'")) quote = ch;
    else if (!quote && ch === "#" && (i === 0 || /\s/.test(value[i - 1]))) {
      return value.slice(0, i);
    }
  }
  return value;
}

/** `<module>/src/main/resources/[...]/application*.yml` -> `<module>` */
function moduleRootOf(file: string): string | undefined {
  const marker = "/src/main/resources/";
  const index = file.lastIndexOf(marker);
  return index < 0 ? undefined : file.slice(0, index);
}

/** 项目根模块写文件名(同 Issue 示例);子模块写相对路径以区分同名文件 */
function displayPath(file: string, moduleRoot: string, roots: string[]): string {
  const best = roots.map(absPosix).filter((root) => file === root || file.startsWith(`${root}/`)).sort((a, b) => b.length - a.length)[0];
  return !best ? file : best === moduleRoot ? path.posix.basename(file) : file.slice(best.length + 1);
}

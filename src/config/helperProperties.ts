/**
 * Java .properties 解析器,用于读取 Apifox Helper 风格的项目级配置
 * (.apifox-helper.properties / properties.additional 链式加载)。
 *
 * 兼容 IDEA 版 Apifox Helper(easyyapi)的 properties 语法子集:
 *  - 行分隔:key=value / key:value(不支持空格分隔,值内可含任意文本,避免 key 被误切)
 *  - 注释:# 或 ! 开头(行首)
 *  - 续行:行尾以奇数个 \ 结尾,下一行拼接到 value
 *  - 多行值:以 ``` 结尾开启,以单独一行 ``` 结束(去首尾空行)
 *  - 条件后缀:key[condition]=value(condition 原样保留)
 *  - 简单转义:value 中 \n \t \r \\ \: \= \uXXXX
 */

export interface HelperPropEntry {
  /** 规则 key(不含条件后缀) */
  key: string;
  /** key[...] 中的条件文本;无条件为 undefined */
  cond?: string;
  /** 值(已去除行续接与包裹符,未做二次转义求值) */
  value: string;
  /** 来源文件(诊断用) */
  file: string;
  /** 行号(诊断用) */
  line: number;
  /**
   * 规则作用域目录(规则文件所在目录;properties.additional 继承主文件目录)。
   * 只有位于该目录下的源码文件才应用此规则,避免多模块仓库中规则串到其他模块。
   */
  baseDir: string;
}

export interface HelperProperties {
  entries: HelperPropEntry[];
  /** 解析过程中的问题(不阻断) */
  warnings: string[];
  /** 文件路径列表(含 properties.additional 展开) */
  files: string[];
  /** 参与加载的文件(含不可读的 properties.additional 引用),用于会话缓存失效判断 */
  watchedFiles?: string[];
  /** 项目根目录:jar 中的类型没有源码路径,只应用此目录下的规则 */
  rootDir?: string;
}

const BACKTICK = "```";

/**
 * 解析单个 properties 文本(纯函数)。
 * @param text 文件内容(UTF-8)
 * @param file 来源路径(诊断)
 */
export function parseProperties(text: string, file = "<memory>"): { entries: HelperPropEntry[]; warnings: string[] } {
  const entries: HelperPropEntry[] = [];
  const warnings: string[] = [];
  const baseDir = normalizePath(dirOf(file));

  // 预处理:按物理行拆,不吞掉 \n 以便续行判断
  const rawLines = text.split(/\r\n|\r|\n/);
  const lines: { text: string; lineNo: number }[] = rawLines.map((t, i) => ({ text: t, lineNo: i + 1 }));

  let i = 0;
  while (i < lines.length) {
    let { text, lineNo } = lines[i];

    // 多行值(``` 包裹)
    if (text.trimEnd().endsWith(BACKTICK) && !text.trim().startsWith("#")) {
      const startLine = lineNo;
      const firstPart = text.slice(0, text.lastIndexOf(BACKTICK));
      const bodyLines: string[] = [];
      if (firstPart.includes("=") || firstPart.includes(":") || firstPart.trim().length === 0) {
        // key=groovy:``` 或 key=``` 形态:先取 key 部分,再收集 body
        const assignIdx = findKeySeparator(firstPart);
        if (assignIdx < 0) {
          warnings.push(`${file}:${lineNo} 多行配置缺少 key`);
          // 跳过直到结束 ```,防止错乱
          i++;
          while (i < lines.length && !lines[i].text.trim().startsWith(BACKTICK)) {
            i++;
          }
          continue;
        }
        const keyRaw = firstPart.slice(0, assignIdx).trim();
        // key 可能带 [condition]
        const { key, cond } = splitKeyCond(keyRaw);
        if (!key) {
          warnings.push(`${file}:${startLine} 空配置 key,已跳过`);
        }
        let prefix = firstPart.slice(assignIdx + 1).trim(); // "groovy:" 等前缀
        // body:从下一行到 ``` 结束行之前
        i++;
        while (i < lines.length && !lines[i].text.trim().startsWith(BACKTICK)) {
          bodyLines.push(lines[i].text);
          i++;
        }
        const value = prefix + "\n" + bodyLines.join("\n");
        const cleaned = trimBlankLines(value);
        if (key) {
          entries.push({ key, cond, value: cleaned, file, line: startLine, baseDir });
        }
        // i 指向 ``` 行或末尾,统一再 ++
        i++;
        continue;
      }
      // 非 key= 形态的 ``` 行(如独立脚本),按普通行忽略
      i++;
      continue;
    }

    // 注释行(注意:值内部可能含 #,只在行首判断)
    const trimmed = text.trimStart();
    if (trimmed.startsWith("#") || trimmed.startsWith("!")) {
      i++;
      continue;
    }
    if (trimmed.length === 0) {
      i++;
      continue;
    }

    const assignIdx = findKeySeparator(text);
    if (assignIdx < 0) {
      // 无分隔符:可能是 key 单独成行(非法),跳过并告警
      warnings.push(`${file}:${lineNo} 无法解析的行(缺少 = 或 :):${trimmed.slice(0, 40)}`);
      i++;
      continue;
    }
    const keyRaw = text.slice(0, assignIdx).trim();
    let value = text.slice(assignIdx + 1).trimStart();
    const { key, cond } = splitKeyCond(keyRaw);
    if (!key) {
      warnings.push(`${file}:${lineNo} 空配置 key,已跳过`);
    }

    // 续行:以奇数个 \ 结尾
    while (endsWithOddBackslash(value)) {
      const raw2 = value;
      // 去掉末尾续行符
      value = raw2.slice(0, -1);
      // 吃掉续行符前的尾部空白(properties 续行语义)
      value = value.replace(/[ \t]+$/, "");
      if (i + 1 < lines.length) {
        i++;
        // 续行的行首空白被忽略
        value += lines[i].text.replace(/^[ \t]+/, "");
      } else {
        warnings.push(`${file}:${lineNo} 行末 \\ 续行后无内容`);
        break;
      }
    }

    // 值:去除尾部空白(注释混排不处理,保持与 IDEA 一致的行尾整体)
    const finalValue = trimTrailingWs(value);
    if (key) {
      entries.push({ key, cond, value: finalValue, file, line: lineNo, baseDir });
    }
    i++;
  }

  return { entries, warnings };
}

/**
 * 多文件加载:按顺序追加,支持 properties.additional 相对引用。
 * @param readFile 读取 additional 引用文件的回调(路径已规范化为 / 分隔);
 *   返回 undefined 表示文件不可读,跳过并告警。不传则无法回填引用文件内容,
 *   引用条目会被跳过(与旧行为一致)。
 * @param rootDir 项目根目录(用于 jar 类型的规则作用域);缺省时取各规则文件目录的公共祖先。
 */
export function loadPropertiesFiles(
  files: { path: string; content: string }[],
  readFile?: (path: string) => string | undefined,
  rootDir?: string
): HelperProperties {
  const entries: HelperPropEntry[] = [];
  const warnings: string[] = [];
  const visited = new Set<string>();
  const watched = new Set<string>();
  const loaded: string[] = [];

  const queue: { path: string; content: string; baseDir: string }[] = files.map((f) => ({
    ...f,
    baseDir: normalizePath(dirOf(f.path)),
  }));
  while (queue.length) {
    const cur = queue.shift()!;
    if (visited.has(cur.path)) {
      continue;
    }
    visited.add(cur.path);
    watched.add(cur.path);
    if (cur.content === "" && readFile && isPlausibleFile(cur.path)) {
      const content = readFile(cur.path);
      if (content === undefined) {
        warnings.push(`properties.additional 引用的文件不可读,已跳过:${cur.path}`);
        continue;
      }
      cur.content = content;
    }
    loaded.push(cur.path);
    const r = parseProperties(cur.content, cur.path);
    // properties.additional 继承主文件的模块目录:引用文件里的目录/字段规则仍作用于主文件所在模块
    entries.push(...r.entries.map((e) => ({ ...e, baseDir: cur.baseDir })));
    warnings.push(...r.warnings);
    // properties.additional:路径相对当前文件目录
    for (const e of r.entries) {
      if (e.key === "properties.additional") {
        const p = resolveAdditionalPath(cur.path, e.value);
        if (p && !visited.has(p)) {
          queue.push({ path: p, content: "", baseDir: cur.baseDir });
        }
      }
    }
  }

  // 目录由浅到深应用:模块规则排在项目根规则之后,后命中的规则覆盖先命中的。
  // Array#sort 稳定,同目录(含 properties.additional)内保持文件加载顺序。
  entries.sort((a, b) => pathDepth(a.baseDir) - pathDepth(b.baseDir));

  const root = rootDir !== undefined
    ? normalizePath(rootDir)
    : commonAncestorDir(files.map((f) => normalizePath(dirOf(f.path))));
  return { entries, warnings, files: loaded, watchedFiles: [...watched], rootDir: root };
}

/** 规则文件目录作用域:源码文件位于 baseDir 下(含同目录)才应用该规则 */
export function ruleEntriesForSource(rules: HelperProperties, fsPath: string): HelperPropEntry[] {
  return rules.entries.filter((e) => isUnderDir(fsPath, e.baseDir));
}

/** jar 中的类型没有源码路径:只应用项目根目录规则,避免模块规则跨模块污染 */
export function ruleEntriesForJarType(rules: HelperProperties): HelperPropEntry[] {
  const root = rules.rootDir !== undefined ? normalizePath(rules.rootDir) : shallowestBaseDir(rules.entries);
  if (root === undefined) {
    return rules.entries;
  }
  const normalizedRoot = normalizeRuleDir(root);
  return rules.entries.filter((e) => normalizeRuleDir(e.baseDir) === normalizedRoot);
}

/** 路径规范化(统一 / 分隔;Windows 文件系统大小写不敏感) */
function normalizeRuleDir(p: string): string {
  const normalized = normalizePath(p).replace(/\/+$/, "");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

/** fsPath 是否位于 baseDir 下(baseDir 为空表示无目录信息,按全局规则处理) */
function isUnderDir(fsPath: string, baseDir: string): boolean {
  if (!baseDir) {
    return true;
  }
  const p = normalizeRuleDir(fsPath);
  const b = normalizeRuleDir(baseDir);
  return p === b || p.startsWith(b + "/");
}

function pathDepth(dir: string): number {
  return normalizePath(dir).split("/").filter(Boolean).length;
}

function shallowestBaseDir(entries: HelperPropEntry[]): string | undefined {
  let best: string | undefined;
  let bestDepth = Infinity;
  for (const e of entries) {
    const depth = pathDepth(e.baseDir);
    if (depth < bestDepth) {
      best = e.baseDir;
      bestDepth = depth;
    }
  }
  return best;
}

/** 各目录的公共祖先(用于未显式提供项目根时的兜底) */
function commonAncestorDir(dirs: string[]): string | undefined {
  if (!dirs.length) {
    return undefined;
  }
  const split = (dir: string) => normalizePath(dir).split("/").filter((part, i) => i === 0 || part.length > 0);
  let prefix = split(dirs[0]);
  for (const dir of dirs.slice(1)) {
    const parts = split(dir);
    let i = 0;
    while (i < prefix.length && i < parts.length && prefix[i] === parts[i]) {
      i++;
    }
    prefix = prefix.slice(0, i);
  }
  const joined = prefix.join("/");
  if (joined) {
    return joined;
  }
  return normalizePath(dirs[0]).startsWith("/") ? "/" : "";
}

/** 路径像真实文件(非调用方为占位构造的空串路径)才尝试读取 */
function isPlausibleFile(p: string): boolean {
  return p.length > 0 && !p.endsWith("/");
}

function resolveAdditionalPath(baseFile: string, raw: string): string | undefined {
  // 兼容 ${module_path} 前缀(视为 baseFile 所在目录)
  let p = raw.trim();
  if (!p) {
    return undefined;
  }
  p = p.replace(/\$\{module_path\}/g, dirOf(baseFile));
  if (!isAbsolute(p)) {
    p = joinPath(dirOf(baseFile), p);
  }
  return normalizePath(p);
}

/** key[cond] 拆分 */
function splitKeyCond(keyRaw: string): { key: string; cond?: string } {
  const idx = keyRaw.indexOf("[");
  if (idx < 0 || !keyRaw.endsWith("]")) {
    return { key: keyRaw };
  }
  const key = keyRaw.slice(0, idx).trim();
  const cond = keyRaw.slice(idx + 1, -1);
  return { key, cond: cond || undefined };
}

/** 找 key 与 value 的分隔符:首个不在括号内的 = 或 : (properties 也允许空格,但为避免误判仅支持 = 与 : ) */
function findKeySeparator(line: string): number {
  let inStr: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
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
    if (ch === "=" || ch === ":") {
      // 排除 :: 等情况(不处理,保持简单;key 通常不含 : )
      return i;
    }
  }
  return -1;
}

function endsWithOddBackslash(s: string): boolean {
  let n = 0;
  for (let i = s.length - 1; i >= 0 && s[i] === "\\"; i--) {
    n++;
  }
  return n % 2 === 1;
}

function trimBlankLines(s: string): string {
  return s.replace(/^\s*\n/, "").replace(/\s+$/, "");
}

function trimTrailingWs(s: string): string {
  return s.replace(/[ \t\r]+$/, "");
}

function dirOf(p: string): string {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i < 0 ? "" : p.slice(0, i);
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

function isAbsolute(p: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith("/") || p.startsWith("\\\\");
}

function joinPath(a: string, b: string): string {
  if (!a) {
    return b;
  }
  return a.replace(/[\\/]+$/, "") + "/" + b.replace(/^[\\/]+/, "");
}

/** \n \t \uXXXX 等基础转义求值(值语义;不做 ISO-8859-1 全量处理) */
export function unescapeProp(s: string): string {
  return s.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_m, g: string) => {
    if (g.startsWith("u")) {
      return String.fromCharCode(parseInt(g.slice(1), 16));
    }
    switch (g) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      case "f":
        return "\f";
      case "\\":
        return "\\";
      default:
        return g;
    }
  });
}

import { parseControllers } from "./java/controllerParser";
import { EndpointInfo, SourceFile } from "./java/model";
import { ClassInfo } from "./java/model";
import { ParseDiagnostic } from "./java/model";
import { buildIndex, parseJava, ParsedFile } from "./java/typeIndex";
import { buildOpenApi, OpenApiSpec } from "./openapi/builder";
import { HelperProperties } from "./config/helperProperties";

/**
 * 同 method+path 的跨风格重复(如 Feign 接口与 Controller 声明了同一接口):
 * 保留 Spring MVC Controller 版本(文档的 source of truth),其余丢弃。
 * 不去重会导致上传时把 Controller 接口传进 Feign 接口名的目录。
 */
export function dedupeEndpoints(endpoints: EndpointInfo[]): EndpointInfo[] {
  const seen = new Map<string, EndpointInfo>();
  for (const ep of endpoints) {
    const key = `${ep.method} ${ep.path}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, ep);
      continue;
    }
    if (existing.flavor !== "spring-mvc" && ep.flavor === "spring-mvc") {
      seen.set(key, ep);
    }
  }
  return [...seen.values()];
}

export interface AnalyzeOptions {
  title: string;
  /** 简单名为 Page 的分页包装展开风格 */
  pageStyle?: "spring-data" | "mybatis-plus";
  /** .apifox-helper.properties 规则 */
  rules?: HelperProperties;
  /** 枚举字段自动追加「(枚举类:X)」(默认关) */
  enumFieldDoc?: boolean;
  /** 接口目录:x-apifox-folder(优先于 tags 用于 Apifox 建目录) */
  folderOf?: (ep: EndpointInfo) => string;
  /** 源码未覆盖的类型,从依赖 jar 的 .class 按需解析(框架类识别) */
  jarLookup?: (simpleName: string) => ClassInfo | undefined;
  /**
   * 结果级缓存键:外部配置(如目录命名、依赖 jar 索引)无法从源码派生时由调用方汇总。
   * 与 title/pageStyle/rules/enumFieldDoc 一起参与缓存失效判断。
   */
  cacheKey?: string;
}

export interface AnalyzeOutput {
  spec: OpenApiSpec;
  endpoints: EndpointInfo[];
  warnings: string[];
  /** 可定位到源文件/行的告警(供 Problems 面板使用) */
  parseDiagnostics: ParseDiagnostic[];
}

/** 诊断去重:同一方法的多条路由/路径会重复收集同一条告警 */
export function dedupeDiagnostics(diagnostics: readonly ParseDiagnostic[]): ParseDiagnostic[] {
  const seen = new Set<string>();
  const out: ParseDiagnostic[] = [];
  for (const d of diagnostics) {
    const key = `${d.filePath}\u0000${d.line ?? ""}\u0000${d.message}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push({ ...d });
  }
  return out;
}

/** 子集分析时诊断与告警同口径过滤(告警正文唯一对应其来源接口) */
function filterDiagnosticsForWarnings(diagnostics: ParseDiagnostic[], warnings: string[]): ParseDiagnostic[] {
  const kept = new Set(warnings);
  return diagnostics.filter((d) => kept.has(d.message));
}

export function filterWarningsForEndpoints(warnings: string[], kept: EndpointInfo[]): string[] {
  const keptControllers = new Set(kept.map((e) => e.controller));
  const keptOperations = new Set(kept.map((e) => `${e.controller}.${e.operationId}`));
  // 告警正文按 Controller.methodName 书写(controllerParser 的 warnings),operationId 口径兜底
  const keptMethodNames = new Set(kept.map((e) => `${e.controller}.${e.methodName ?? e.operationId}`));

  return warnings.filter((w) => {
    // 形式 1: "UserController.patchUser: ..."
    const methodMatch = /^([A-Za-z0-9_$]+)\.([A-Za-z0-9_$]+)\s*[:：]/.exec(w);
    if (methodMatch) {
      const [, ctrl, method] = methodMatch;
      if (!keptControllers.has(ctrl)) {
        return false;
      }
      return keptOperations.has(`${ctrl}.${method}`) || keptMethodNames.has(`${ctrl}.${method}`);
    }
    // 形式 2: "UserController: ..." 或 "类 UserController 的字段 age: ..."
    const ctrlMatch = /(?:^|类\s*)([A-Za-z0-9_$]+Controller|[A-Za-z0-9_$]+Service)\b/.exec(w);
    if (ctrlMatch) {
      const [, ctrl] = ctrlMatch;
      return keptControllers.has(ctrl);
    }
    // 全局系统级告警保留
    return true;
  });
}

function run(files: SourceFile[], options: AnalyzeOptions, endpointFilter?: (ep: EndpointInfo) => boolean): AnalyzeOutput {
  const parsed = files.map((f) => parseJava(f.fsPath, f.content));
  const index = buildIndex(parsed);
  index.jarLookup = options.jarLookup;
  const parseResult = parseControllers(parsed, options.rules, index);
  const all = dedupeEndpoints(parseResult.endpoints);
  const kept = endpointFilter ? all.filter(endpointFilter) : all;
  const filtered = { ...parseResult, endpoints: kept };
  const { spec } = buildOpenApi(filtered, index, {
    title: options.title,
    pageStyle: options.pageStyle,
    rules: options.rules,
    enumFieldDoc: options.enumFieldDoc,
    folderOf: options.folderOf,
  });
  const rawWarnings = [...new Set(parseResult.warnings)];
  const warnings = endpointFilter ? filterWarningsForEndpoints(rawWarnings, kept) : rawWarnings;
  const rawDiagnostics = dedupeDiagnostics(parseResult.diagnostics);
  const parseDiagnostics = endpointFilter ? filterDiagnosticsForWarnings(rawDiagnostics, warnings) : rawDiagnostics;
  return { spec, endpoints: kept, warnings, parseDiagnostics };
}

/** 解析 -> 索引 -> 提取接口 -> 生成 OpenAPI(纯逻辑,便于测试) */
export function analyze(files: SourceFile[], options: AnalyzeOptions | string): AnalyzeOutput {
  const opts = typeof options === "string" ? { title: options } : options;
  return run(files, opts);
}

/** 只构建满足条件的接口子集(单接口/单文件同步用) */
export function analyzeSubset(files: SourceFile[], options: AnalyzeOptions, endpointFilter: (ep: EndpointInfo) => boolean): AnalyzeOutput {
  return run(files, options, endpointFilter);
}

/** 影响分析结果的配置指纹(函数型配置由调用方的 cacheKey 负责) */
function optionsCacheKey(opts: AnalyzeOptions): string {
  return JSON.stringify([
    opts.title,
    opts.pageStyle ?? "",
    opts.enumFieldDoc ?? false,
    opts.cacheKey ?? "",
    opts.rules
      ? {
          files: opts.rules.files,
          warnings: opts.rules.warnings,
          entries: opts.rules.entries.map((e) => [e.key, e.cond ?? "", e.value, e.file, e.line]),
        }
      : null,
  ]);
}

/**
 * 带缓存的解析器:同一会话内,内容未变的文件不重复解析。
 * java-parser 单文件毫秒级,缓存只是优化,不影响正确性。
 */
export class AnalyzeCache {
  private readonly cache = new Map<string, { content: string; parsed: ParsedFile; version: number }>();
  /** 文件集代际:文件列表/顺序变化或任一文件重新解析时递增,作为结果缓存的 O(1) 签名 */
  private epoch = 0;
  /** 上一轮文件路径列表(含顺序),用于发现文件增删/重排 */
  private lastPaths: string[] = [];
  private lastResult?: { key: string; output: AnalyzeOutput };
  private readonly filterIds = new WeakMap<(ep: EndpointInfo) => boolean, number>();
  private nextFilterId = 0;

  /** 写入缓存条目时记录解析版本(= 当前代际),供上层判断缓存是否被复用 */
  private remember(fsPath: string, content: string, parsed: ParsedFile): void {
    this.epoch++;
    this.cache.set(fsPath, { content, parsed, version: this.epoch });
  }

  private parsedOf(files: SourceFile[]): ParsedFile[] {
    let changed = this.lastPaths.length !== files.length;
    if (!changed) {
      for (let i = 0; i < files.length; i++) {
        if (this.lastPaths[i] !== files[i].fsPath) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      this.lastPaths = files.map((f) => f.fsPath);
      this.epoch++;
      // 文件集变化时清掉不在新集合内的解析缓存:已删除/移出扫描范围的文件不会再被引用,避免长会话无界增长
      const alive = new Set(this.lastPaths);
      for (const key of this.cache.keys()) {
        if (!alive.has(key)) {
          this.cache.delete(key);
        }
      }
    }
    return files.map((f) => {
      const hit = this.cache.get(f.fsPath);
      if (hit && hit.content === f.content) {
        return hit.parsed;
      }
      const parsed = parseJava(f.fsPath, f.content);
      this.remember(f.fsPath, f.content, parsed);
      return parsed;
    });
  }

  private resultKey(opts: AnalyzeOptions, endpointFilter?: (ep: EndpointInfo) => boolean): string {
    let filterId = 0;
    if (endpointFilter) {
      const known = this.filterIds.get(endpointFilter);
      if (known === undefined) {
        filterId = ++this.nextFilterId;
        this.filterIds.set(endpointFilter, filterId);
      } else {
        filterId = known;
      }
    }
    return `${this.epoch}\u0000${optionsCacheKey(opts)}\u0000${filterId}`;
  }

  private runCached(files: SourceFile[], opts: AnalyzeOptions, endpointFilter?: (ep: EndpointInfo) => boolean): AnalyzeOutput {
    const parsed = this.parsedOf(files);
    const key = this.resultKey(opts, endpointFilter);
    if (this.lastResult && this.lastResult.key === key) {
      // warnings/parseDiagnostics 返回副本:syncToApifox 会原地 push 提示语,不能污染缓存结果
      return {
        ...this.lastResult.output,
        warnings: [...this.lastResult.output.warnings],
        parseDiagnostics: this.lastResult.output.parseDiagnostics.map((d) => ({ ...d })),
      };
    }
    const index = buildIndex(parsed);
    index.jarLookup = opts.jarLookup;
    const parseResult = parseControllers(parsed, opts.rules, index);
    const all = dedupeEndpoints(parseResult.endpoints);
    const kept = endpointFilter ? all.filter(endpointFilter) : all;
    const deduped = { ...parseResult, endpoints: kept };
    const { spec } = buildOpenApi(deduped, index, {
      title: opts.title,
      pageStyle: opts.pageStyle,
      rules: opts.rules,
      enumFieldDoc: opts.enumFieldDoc,
      folderOf: opts.folderOf,
    });
    const rawWarnings = [...new Set(parseResult.warnings)];
    const warnings = endpointFilter ? filterWarningsForEndpoints(rawWarnings, kept) : rawWarnings;
    const rawDiagnostics = dedupeDiagnostics(parseResult.diagnostics);
    const parseDiagnostics = endpointFilter ? filterDiagnosticsForWarnings(rawDiagnostics, warnings) : rawDiagnostics;
    const output = { spec, endpoints: kept, warnings, parseDiagnostics };
    // 缓存存副本:调用方(如 syncToApifox)会原地 push warnings,不能污染缓存
    this.lastResult = {
      key,
      output: { ...output, warnings: [...output.warnings], parseDiagnostics: output.parseDiagnostics.map((d) => ({ ...d })) },
    };
    return output;
  }

  analyze(files: SourceFile[], options: AnalyzeOptions | string): AnalyzeOutput {
    const opts = typeof options === "string" ? { title: options } : options;
    return this.runCached(files, opts);
  }

  /** 只构建满足条件的接口子集;与 analyze 共用 CST 缓存,勾选/单文件同步不再全量重解析 */
  analyzeSubset(files: SourceFile[], options: AnalyzeOptions | string, endpointFilter: (ep: EndpointInfo) => boolean): AnalyzeOutput {
    const opts = typeof options === "string" ? { title: options } : options;
    return this.runCached(files, opts, endpointFilter);
  }

  /** 单文件轻量解析(CodeLens 用,不做类型解析与去重);解析结果回写缓存并推进代际,防止结果缓存漏失效 */
  endpointsOfFile(fsPath: string, content: string): EndpointInfo[] {
    const hit = this.cache.get(fsPath);
    if (hit && hit.content === content) {
      return parseControllers([hit.parsed]).endpoints;
    }
    const parsed = parseJava(fsPath, content);
    this.remember(fsPath, content, parsed);
    return parseControllers([parsed]).endpoints;
  }
}

/** 找到包含给定源码 offset 的接口(单接口上传) */
export function endpointAt(endpoints: EndpointInfo[], fsPath: string, offset: number): EndpointInfo | undefined {
  const inFile = endpoints.filter((e) => e.fsPath === fsPath && e.methodRange);
  // 包含光标的声明优先;否则取光标之前最近的一个
  const containing = inFile.find((e) => offset >= e.methodRange!.startOffset && offset <= e.methodRange!.endOffset);
  if (containing) {
    return containing;
  }
  let best: EndpointInfo | undefined;
  for (const e of inFile) {
    if (e.methodRange!.startOffset <= offset && (!best || e.methodRange!.startOffset > best.methodRange!.startOffset)) {
      best = e;
    }
  }
  return best;
}

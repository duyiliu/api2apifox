import { parseControllers } from "./java/controllerParser";
import { EndpointInfo, SourceFile } from "./java/model";
import { buildIndex, parseJava, ParsedFile } from "./java/typeIndex";
import { buildOpenApi, OpenApiSpec } from "./openapi/builder";

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
}

export interface AnalyzeOutput {
  spec: OpenApiSpec;
  endpoints: EndpointInfo[];
  warnings: string[];
}

function run(files: SourceFile[], options: AnalyzeOptions, endpointFilter?: (ep: EndpointInfo) => boolean): AnalyzeOutput {
  const parsed = files.map((f) => parseJava(f.fsPath, f.content));
  const index = buildIndex(parsed);
  const parseResult = parseControllers(parsed);
  const all = dedupeEndpoints(parseResult.endpoints);
  const kept = endpointFilter ? all.filter(endpointFilter) : all;
  const filtered = { ...parseResult, endpoints: kept };
  const { spec } = buildOpenApi(filtered, index, { title: options.title, pageStyle: options.pageStyle });
  return { spec, endpoints: kept, warnings: [...new Set(parseResult.warnings)] };
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

/**
 * 带缓存的解析器:同一会话内,内容未变的文件不重复解析。
 * java-parser 单文件毫秒级,缓存只是优化,不影响正确性。
 */
export class AnalyzeCache {
  private readonly cache = new Map<string, { content: string; parsed: ParsedFile }>();

  analyze(files: SourceFile[], options: AnalyzeOptions | string): AnalyzeOutput {
    const opts = typeof options === "string" ? { title: options } : options;
    const parsed = files.map((f) => {
      const hit = this.cache.get(f.fsPath);
      let p: ParsedFile;
      if (hit && hit.content === f.content) {
        p = hit.parsed;
      } else {
        p = parseJava(f.fsPath, f.content);
        this.cache.set(f.fsPath, { content: f.content, parsed: p });
      }
      return p;
    });
    const index = buildIndex(parsed);
    const parseResult = parseControllers(parsed);
    const deduped = { ...parseResult, endpoints: dedupeEndpoints(parseResult.endpoints) };
    const { spec } = buildOpenApi(deduped, index, { title: opts.title, pageStyle: opts.pageStyle });
    return { spec, endpoints: deduped.endpoints, warnings: [...new Set(parseResult.warnings)] };
  }

  /** 单文件轻量解析(CodeLens 用,不做类型解析与去重) */
  endpointsOfFile(fsPath: string, content: string): EndpointInfo[] {
    const hit = this.cache.get(fsPath);
    const parsed = hit && hit.content === content ? hit.parsed : parseJava(fsPath, content);
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

import { EndpointInfo, ParseDiagnostic } from "../java/model";
import { ImportErrorItem } from "./syncResult";

/** Problems 面板中的告警级别:解析告警为 Warning,导入失败为 Error */
export type ProblemSeverity = "warning" | "error";

/** 一条落在具体源文件上的诊断(与 vscode.Diagnostic 解耦,便于单测) */
export interface ProblemDiagnostic {
  /** 源文件绝对路径 */
  filePath: string;
  /** 1-based 行号;缺失时定位到文件首行 */
  line?: number;
  severity: ProblemSeverity;
  message: string;
}

function dedupe(problems: readonly ProblemDiagnostic[]): ProblemDiagnostic[] {
  const seen = new Set<string>();
  const out: ProblemDiagnostic[] = [];
  for (const p of problems) {
    const key = `${p.filePath}\u0000${p.line ?? ""}\u0000${p.severity}\u0000${p.message}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(p);
  }
  return out;
}

/** 解析告警(controllerParser 产生,带 filePath/line)-> Problems 条目 */
export function problemsFromParseDiagnostics(diagnostics: readonly ParseDiagnostic[]): ProblemDiagnostic[] {
  return dedupe(
    diagnostics
      .filter((d) => !!d.filePath)
      .map((d) => ({
        filePath: d.filePath,
        line: d.line,
        severity: "warning" as const,
        message: d.message,
      }))
  );
}

/**
 * 导入错误归属到源文件:Apifox 只返回文本错误,能从中识别出 operationId、
 * Controller.methodName 或 HTTP 方法 + 路径时,落到该接口方法所在行。
 * 同一路径多方法且错误未指明方法时视为无法归属,宁可不落点也不误报。
 */
export function attributeImportErrors(
  errors: readonly ImportErrorItem[],
  endpoints: readonly EndpointInfo[]
): ProblemDiagnostic[] {
  const out: ProblemDiagnostic[] = [];
  for (const error of errors) {
    const message = (error.message || error.code || "").trim();
    if (!message) {
      continue;
    }
    const matched = matchEndpoint(message, endpoints);
    if (!matched) {
      continue;
    }
    out.push({
      filePath: matched.fsPath,
      line: matched.methodRange?.startLine,
      severity: "error",
      message,
    });
  }
  return dedupe(out);
}

/** 按错误文本匹配接口;返回唯一最高分接口,并列时返回 undefined */
function matchEndpoint(message: string, endpoints: readonly EndpointInfo[]): EndpointInfo | undefined {
  let best: EndpointInfo | undefined;
  let bestScore = 0;
  let tied = false;
  for (const ep of endpoints) {
    const score = scoreEndpoint(message, ep);
    if (score > bestScore) {
      best = ep;
      bestScore = score;
      tied = false;
    } else if (score > 0 && score === bestScore) {
      tied = true;
    }
  }
  return bestScore > 0 && !tied ? best : undefined;
}

function scoreEndpoint(message: string, ep: EndpointInfo): number {
  let score = 0;
  if (ep.operationId && message.includes(ep.operationId)) {
    score += 5;
  }
  if (ep.methodName && message.includes(`${ep.controller}.${ep.methodName}`)) {
    score += 5;
  }
  // "/" 会匹配任意文本,不作为归属依据
  if (ep.path && ep.path !== "/" && message.includes(ep.path)) {
    score += 2;
    if (new RegExp(`\\b${escapeRegExp(ep.method)}\\b`, "i").test(message)) {
      score += 2;
    }
  }
  return score;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

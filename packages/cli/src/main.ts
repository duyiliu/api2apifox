import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { analyzeProject } from "../../../src/core/projectAnalyzer";
import { ConfigOverrides, resolveConfig } from "../../../src/core/config";
import { EndpointSummary, ProjectAnalysisResult, ResolvedConfigResult, SyncResult } from "../../../src/core/types";
import { hasImportFailures, syncProject } from "../../../src/core/syncService";
import { CliOptions, parseCliArgs } from "./args";
import { CliError, toCliError } from "./errors";
import { diagnosticMessages, FailureEnvelope, SuccessEnvelope, writeJson, writeText } from "./output";

const VERSION = (require("../package.json") as { version: string }).version;

export async function runCli(argv = process.argv.slice(2)): Promise<number> {
  const startedAt = Date.now();
  // 参数解析失败时拿不到 options,但仍需按调用方要求的格式回报,
  // 否则 AI 调用方在传错参数时只能收到 stderr 文本而拿不到 JSON 信封。
  const requestedFormat = detectRequestedFormat(argv);
  let options: CliOptions | undefined;
  const controller = new AbortController();
  const abort = () => controller.abort();
  process.once("SIGINT", abort);
  process.once("SIGTERM", abort);
  try {
    options = parseCliArgs(argv);
    if (options.version) {
      writeText(VERSION);
      return 0;
    }
    if (options.help || !options.command) {
      writeText(helpText(options.command));
      return 0;
    }
    const resolved = resolveConfig(path.resolve(options.project), configOverrides(options));
    let result: unknown;
    let warnings: string[] = [];
    switch (options.command) {
      case "config":
        result = configResult(resolved);
        warnings = diagnosticMessages(resolved.diagnostics);
        break;
      case "scan": {
        const analyzed = await analyzeSelected(resolved, options, controller.signal);
        ensureEndpoints(analyzed, options);
        result = scanResult(analyzed, resolved);
        warnings = analyzed.warnings;
        break;
      }
      case "export": {
        const analyzed = await analyzeSelected(resolved, options, controller.signal);
        ensureEndpoints(analyzed, options);
        result = await exportResult(analyzed, resolved, options, controller.signal);
        warnings = analyzed.warnings;
        break;
      }
      case "sync": {
        const analyzed = await analyzeSelected(resolved, options, controller.signal);
        ensureEndpoints(analyzed, options);
        validateSyncConfig(resolved, options);
        if (!options.dryRun) {
          await confirmSync(resolved, analyzed, options);
        }
        const synced = await syncProject({
          config: resolved.config,
          token: resolved.token ?? "",
          analyzed,
          dryRun: options.dryRun,
          scopeType: scopeType(options),
          signal: controller.signal,
        });
        result = synced;
        warnings = analyzed.warnings;
        if (hasImportFailures(synced)) {
          throw new CliError("IMPORT_PARTIAL_FAILURE", "Apifox 导入完成，但存在失败项", 6, false, undefined, synced);
        }
        break;
      }
    }
    outputSuccess(options, result, warnings, Date.now() - startedAt);
    return 0;
  } catch (error) {
    const cliError = toCliError(error);
    outputFailure(options, cliError, Date.now() - startedAt, requestedFormat);
    return cliError.exitCode;
  } finally {
    process.removeListener("SIGINT", abort);
    process.removeListener("SIGTERM", abort);
  }
}

async function analyzeSelected(
  resolved: ResolvedConfigResult,
  options: CliOptions,
  signal: AbortSignal
): Promise<ProjectAnalysisResult> {
  return analyzeProject({
    config: resolved.config,
    files: options.files,
    endpoints: options.endpoints,
    signal,
  });
}

function ensureEndpoints(analyzed: ProjectAnalysisResult, options: CliOptions): void {
  if (analyzed.scannedFiles === 0) {
    throw new CliError("NO_JAVA_FILES", "没有扫描到任何 Java 源文件，请检查 include/exclude 配置", 3);
  }
  if (!analyzed.endpoints.length) {
    const code = options.files.length || options.endpoints.length ? "NO_ENDPOINT_MATCHED" : "NO_ENDPOINTS_FOUND";
    throw new CliError(code, "未发现符合范围的 REST 接口", 3);
  }
}

function scanResult(analyzed: ProjectAnalysisResult, resolved: ResolvedConfigResult): Record<string, unknown> {
  const schemas = analyzed.spec.components?.schemas ?? {};
  return {
    projectRoot: analyzed.projectRoot,
    scannedFiles: analyzed.scannedFiles,
    skippedFiles: analyzed.skippedFiles,
    endpointCount: analyzed.endpoints.length,
    schemaCount: Object.keys(schemas).length,
    endpoints: analyzed.endpoints.map((endpoint): EndpointSummary => ({
      method: endpoint.method,
      path: endpoint.path,
      summary: endpoint.summary,
      folder: folderOf(endpoint, resolved),
      controller: endpoint.controller,
      file: relativeFile(analyzed.projectRoot, endpoint.fsPath),
      line: endpoint.methodRange?.startLine,
      flavor: endpoint.flavor,
    })),
  };
}

async function exportResult(
  analyzed: ProjectAnalysisResult,
  resolved: ResolvedConfigResult,
  options: CliOptions,
  signal: AbortSignal
): Promise<Record<string, unknown>> {
  if (options.stdout) {
    if (options.format === "json") {
      throw new CliError("INVALID_ARGUMENT", "--stdout 不能与 --format json 同时使用", 2);
    }
    process.stdout.write(`${JSON.stringify(analyzed.spec, null, 2)}\n`);
    return { stdout: true, endpointCount: analyzed.endpoints.length };
  }
  const output = path.resolve(resolved.config.projectRoot, options.output ?? resolved.config.exportPath);
  if (fs.existsSync(output) && !options.force) {
    throw new CliError("OUTPUT_EXISTS", `输出文件已存在:${output}，使用 --force 覆盖`, 2);
  }
  if (signal.aborted) {
    throw new CliError("CANCELLED", "操作已取消", 130);
  }
  await fs.promises.mkdir(path.dirname(output), { recursive: true });
  const temporary = `${output}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.promises.writeFile(temporary, `${JSON.stringify(analyzed.spec, null, 2)}\n`, "utf8");
    if (signal.aborted) {
      throw new CliError("CANCELLED", "操作已取消", 130);
    }
    await fs.promises.rename(temporary, output);
  } catch (error) {
    await fs.promises.rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
  return {
    output,
    endpointCount: analyzed.endpoints.length,
    schemaCount: Object.keys(analyzed.spec.components?.schemas ?? {}).length,
  };
}

function validateSyncConfig(resolved: ResolvedConfigResult, options: CliOptions): void {
  if (resolved.config.projectId <= 0) {
    throw new CliError("PROJECT_ID_REQUIRED", "sync 需要 projectId，可通过配置、环境变量或 --project-id 提供", 2);
  }
  if (!options.dryRun && !resolved.token) {
    throw new CliError("TOKEN_REQUIRED", "sync 需要 API2APIFOX_TOKEN 环境变量或 --token", 2);
  }
}

async function confirmSync(
  resolved: ResolvedConfigResult,
  analyzed: ProjectAnalysisResult,
  options: CliOptions
): Promise<void> {
  if (options.yes) {
    return;
  }
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new CliError("CONFIRMATION_REQUIRED", "非交互环境执行同步必须显式传入 --yes", 2);
  }
  const prompt = `将 ${analyzed.endpoints.length} 个接口同步到 Apifox 项目 ${resolved.config.projectId}，继续？ [y/N] `;
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const answer = (await rl.question(prompt)).trim().toLowerCase();
    if (answer !== "y" && answer !== "yes") {
      throw new CliError("CANCELLED", "用户取消同步", 130);
    }
  } finally {
    rl.close();
  }
}

function configResult(resolved: ResolvedConfigResult): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(resolved.config)) {
    if (key === "projectRoot" || key === "title") {
      fields[key] = { value, source: key === "projectRoot" ? "cli/default" : "default/file/cli" };
    } else {
      fields[key] = { value, source: resolved.sources[key as keyof typeof resolved.sources] };
    }
  }
  fields.token = { configured: Boolean(resolved.token), source: resolved.tokenSource };
  return { configFile: resolved.configFile, fields };
}

function configOverrides(options: CliOptions): ConfigOverrides {
  return {
    configFile: options.configFile,
    token: options.token,
    projectId: options.projectId,
    endpointConflictBehavior: options.endpointConflictBehavior,
    schemaConflictBehavior: options.schemaConflictBehavior,
    include: options.includes.length ? options.includes : undefined,
    exclude: options.excludes.length ? options.excludes : undefined,
    dependencyRepos: options.dependencyRepos.length ? options.dependencyRepos : undefined,
    dependencyJars: options.dependencyJars.length ? options.dependencyJars : undefined,
    exportPath: options.output,
    timeoutMs: options.timeoutMs,
  };
}

function outputSuccess(options: CliOptions, result: unknown, warnings: string[], durationMs: number): void {
  if (options.command === "export" && options.stdout) {
    return;
  }
  if (options.format === "json") {
    const envelope: SuccessEnvelope = {
      schemaVersion: 1,
      ok: true,
      command: options.command ?? "help",
      version: VERSION,
      durationMs,
      result,
      warnings,
    };
    writeJson(envelope);
    return;
  }
  writeText(formatTextResult(options.command, result, warnings));
}

function outputFailure(
  options: CliOptions | undefined,
  error: CliError,
  durationMs: number,
  fallbackFormat: "text" | "json"
): void {
  if ((options?.format ?? fallbackFormat) === "json") {
    const envelope: FailureEnvelope = {
      schemaVersion: 1,
      ok: false,
      command: options?.command ?? "unknown",
      version: VERSION,
      durationMs,
      error: {
        code: error.code,
        message: error.message,
        status: error.status,
        retryable: error.retryable,
        details: error.details,
      },
      warnings: [],
    };
    writeJson(envelope);
    return;
  }
  process.stderr.write(`api2apifox: ${error.message}\n`);
}

function formatTextResult(command: CliOptions["command"], result: unknown, warnings: string[]): string {
  const value = result as Record<string, unknown>;
  const warningText = warnings.length ? `\n警告:\n${warnings.map((item) => `- ${item}`).join("\n")}` : "";
  if (command === "scan") {
    return `扫描完成: ${value.scannedFiles} 个 Java 文件，${value.endpointCount} 个接口，${value.schemaCount} 个模型${warningText}`;
  }
  if (command === "export") {
    return `OpenAPI 已导出到 ${value.output}，共 ${value.endpointCount} 个接口${warningText}`;
  }
  if (command === "sync") {
    const sync = result as unknown as SyncResult;
    return sync.dryRun
      ? `同步预检完成:项目 ${sync.target.projectId}，${sync.scope.endpointCount} 个接口，未写入 Apifox${warningText}`
      : `同步完成:项目 ${sync.target.projectId}，${sync.scope.endpointCount} 个接口${warningText}`;
  }
  return `${JSON.stringify(result, null, 2)}${warningText}`;
}

function folderOf(endpoint: ProjectAnalysisResult["endpoints"][number], resolved: ResolvedConfigResult): string {
  const key = resolved.config.folderNameSource === "controller" ? endpoint.controller : endpoint.tag;
  return resolved.config.rootFolderName.trim() ? `${resolved.config.rootFolderName.trim()}/${key}` : key;
}

function relativeFile(root: string, file: string): string {
  return path.relative(root, file).replace(/\\/g, "/");
}

function scopeType(options: CliOptions): SyncResult["scope"]["type"] {
  if (options.endpoints.length) {
    return options.files.length ? "selection" : "endpoint";
  }
  return options.files.length ? "file" : "workspace";
}

/** 从原始 argv 兜底识别输出格式,供参数解析失败时仍能按调用方要求回报错误 */
function detectRequestedFormat(argv: string[]): "text" | "json" {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--format=json" || (argv[i] === "--format" && argv[i + 1] === "json")) {
      return "json";
    }
  }
  return "text";
}

function helpText(command?: CliOptions["command"]): string {
  if (command) {
    return commandHelp(command);
  }
  return `api2apifox ${VERSION}\n\n用法:\n  api2apifox <command> [options]\n\n命令:\n  scan     扫描 Java 项目并输出接口摘要\n  export   生成 OpenAPI JSON 文件\n  sync     预检或同步到 Apifox\n  config   输出最终配置及来源（Token 仅显示是否存在）\n\n公共参数:\n  --project <dir>          项目根目录，默认当前目录\n  --config <file>          配置文件，默认 .api2apifox.json\n  --format text|json       输出格式\n  --file <path>            筛选源文件，可重复\n  --endpoint <METHOD PATH> 筛选接口，可重复\n  --timeout-ms <ms>        Apifox 请求等待上限，默认 300000\n  --help                   显示帮助\n  --version                显示版本\n\n运行 api2apifox <command> --help 查看命令参数。`;
}

function commandHelp(command: NonNullable<CliOptions["command"]>): string {
  const common = `\n公共筛选:\n  --file <path>\n  --endpoint <METHOD PATH>\n  --include <glob>\n  --exclude <glob>`;
  switch (command) {
    case "scan":
      return `api2apifox scan --project . [--format json]${common}`;
    case "export":
      return `api2apifox export --project . [--output openapi.gen.json] [--force] [--stdout]${common}`;
    case "sync":
      return `api2apifox sync --project . [--dry-run | --yes] [--project-id <id>] [--token <token>] [--timeout-ms <ms>]${common}`;
    case "config":
      return "api2apifox config --project . [--format json]";
  }
}

if (require.main === module) {
  void runCli().then((code) => {
    process.exitCode = code;
  });
}

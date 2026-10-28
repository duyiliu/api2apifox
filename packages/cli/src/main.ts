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
import { buildCliSyncReport, folderOfEndpoint, writeReportAndOpen } from "./report";

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
        result = configResult(resolved, options.projectSource);
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
        // 真实同步落地后生成浏览器报告页(部分失败也要展示,便于排查);--no-report 可关闭
        if (!options.dryRun && !options.noReport) {
          const reportPath = await writeReportAndOpen(buildCliSyncReport({ synced, analyzed, resolved }));
          if (reportPath) {
            result = { ...synced, reportPath };
          }
        }
        if (hasImportFailures(synced)) {
          throw new CliError("IMPORT_PARTIAL_FAILURE", "Apifox 导入完成，但存在失败项", 6, false, undefined, result);
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
      folder: folderOfEndpoint(endpoint, resolved),
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

function configResult(resolved: ResolvedConfigResult, projectSource: "default" | "cli"): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(resolved.config)) {
    if (key === "projectRoot") {
      fields[key] = { value, source: projectSource };
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
    maxDependencyJars: options.dependencyMaxJars,
    idAsString: options.idAsString,
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
  writeText(formatTextResult(options.command, result, options.quiet ? [] : warnings));
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
    const sync = result as unknown as SyncResult & { reportPath?: string };
    const base = sync.dryRun
      ? `同步预检完成:项目 ${sync.target.projectId}，${sync.scope.endpointCount} 个接口，未写入 Apifox`
      : `同步完成:项目 ${sync.target.projectId}，${sync.scope.endpointCount} 个接口`;
    const reportText = sync.reportPath ? `\n同步报告:${sync.reportPath}` : "";
    return `${base}${reportText}${warningText}`;
  }
  return `${JSON.stringify(result, null, 2)}${warningText}`;
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

const DEFAULT_INCLUDE_TEXT = "**/src/main/java/**/*.java";
const DEFAULT_EXCLUDE_TEXT = "**/target/**、**/build/**、**/src/test/**、**/sample/** 等 5 项";

/** 公共筛选参数说明：多个命令共用，避免各命令帮助文案彼此漂移 */
const FILTER_HELP = `  --file <path>             只保留该源文件（相对项目根或绝对路径）里的接口，可重复
  --endpoint <METHOD PATH>  只保留该接口，如 "GET /api/users"，可重复
  --include <glob>          扫描包含的 glob，可重复；传入即整体替换默认值 ${DEFAULT_INCLUDE_TEXT}
  --exclude <glob>          扫描排除的 glob，可重复；传入即整体替换默认值 ${DEFAULT_EXCLUDE_TEXT}`;

const COMMON_HELP = `  --project <dir>           项目根目录，默认当前目录
  --config <file>           配置文件，默认 <project>/.api2apifox.json
  --format text|json        输出格式，默认 text；json 时 stdout 只输出一个 JSON 信封
  --quiet                   text 模式隐藏非致命警告；json 信封内容不变`;

const HELP_FLAG = `  -h, --help                显示帮助`;

const FILTER_NOTE = `说明:
  --file / --endpoint 是解析后过滤，不会减少扫描量；想加快速度请用 --include / --exclude 收敛范围。
  --include / --exclude 不是追加：传入即整体替换默认列表，需要保留默认范围时请显式写全。`;

function helpText(command?: CliOptions["command"]): string {
  if (command) {
    return commandHelp(command);
  }
  return `api2apifox ${VERSION}

用法:
  api2apifox <command> [options]

命令:
  scan     扫描 Java 项目并输出接口摘要（只读，不联网）
  export   生成 OpenAPI JSON 文件（只读，不联网）
  sync     --dry-run 预检，或真正同步到 Apifox
  config   输出最终配置及其来源（Token 只显示是否已配置）

公共参数:
${COMMON_HELP}
${FILTER_HELP}
  --dependency-repo <dir>   额外的本地 Maven 仓库目录，可重复（传入即替换配置值）
  --dependency-jar <path>   显式依赖 jar 的绝对路径，可重复（传入即替换配置值）
  --dependency-max-jars <n> 依赖 jar 解析总数上限，默认 120；0 表示不做依赖解析
  --id-as-string <bool>     ID 语义字段（id/*Id 且 Long/long/BigInteger）按 string 生成，
                            默认 true；显式 false 关闭（配置/规则文件任一写 false 即关）
  --timeout-ms <ms>         Apifox 请求等待上限，默认 300000
${HELP_FLAG}
  -v, --version             显示版本

退出码:
  0 成功        2 参数/配置/确认错误   3 没有 Java 文件或目标接口
  4 鉴权/权限   5 网络/超时/服务错误   6 导入部分失败
  7 本地 I/O 或内部错误              130 取消

配置优先级: 命令行参数 > API2APIFOX_* 环境变量 > .api2apifox.json > 默认值

运行 api2apifox <command> --help 查看该命令的完整参数。`;
}

function commandHelp(command: NonNullable<CliOptions["command"]>): string {
  switch (command) {
    case "scan":
      return `api2apifox scan [options]

扫描 Java 项目并输出接口摘要。只读：不写文件、不联网。

选项:
${COMMON_HELP}
${FILTER_HELP}
${HELP_FLAG}

${FILTER_NOTE}
  没有匹配到接口时退出码为 3。`;
    case "export":
      return `api2apifox export [options]

把扫描结果导出为 OpenAPI 3.0 JSON。只读：不联网。

选项:
${COMMON_HELP}
  -o, --output <file>       输出文件，默认取配置 exportPath（openapi.gen.json）
  --force                   目标文件已存在时覆盖
  --stdout                  把 OpenAPI 直接写到 stdout（不能与 --format json 同时使用）
${FILTER_HELP}
${HELP_FLAG}

${FILTER_NOTE}`;
    case "sync":
      return `api2apifox sync [options]

把接口同步到 Apifox；加 --dry-run 只预检、不写入。

选项:
${COMMON_HELP}
  --dry-run                 只预检，不写入 Apifox（无需 token）
  -y, --yes                 跳过交互确认；非交互环境必须显式传入
  --no-report               不生成并打开同步结果报告页（默认真实同步后在浏览器弹出总结）
  --project-id <id>         目标 Apifox 项目 ID
  --token <token>           Apifox 访问令牌，推荐改用 API2APIFOX_TOKEN 环境变量
  --endpoint-conflict <模式> 接口冲突处理：OVERWRITE_EXISTING | AUTO_MERGE | KEEP_EXISTING | CREATE_NEW
  --schema-conflict <模式>   数据模型冲突处理：取值同上
  --timeout-ms <ms>         等待上限，默认 300000；首次全量导入偏慢，可调大
${FILTER_HELP}
${HELP_FLAG}

${FILTER_NOTE}
  返回 REQUEST_TIMEOUT 表示本地已停止等待，服务端可能仍在导入：请先查询目标项目确认结果，不要立即重试。`;
    case "config":
      return `api2apifox config [options]

输出每个配置字段的最终值与来源（default / file:... / env:... / cli），
Token 只显示是否已配置，不输出明文。

选项:
${COMMON_HELP}
${HELP_FLAG}`;
  }
}

if (require.main === module) {
  void runCli().then((code) => {
    process.exitCode = code;
  });
}

// 供测试与脚本复用(不影响 CLI 执行语义:主入口仍由 require.main 保护)
export { buildCliSyncReport, renderReportHtml, syncReportPath } from "./report";

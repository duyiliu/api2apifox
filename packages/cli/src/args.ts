import { parseArgs, ParseArgsConfig } from "node:util";
import { ConflictBehavior } from "../../../src/core/types";
import { CliError } from "./errors";

export type CommandName = "scan" | "export" | "sync" | "config";

export interface CliOptions {
  command?: CommandName;
  help: boolean;
  version: boolean;
  project: string;
  projectSource: "default" | "cli";
  configFile?: string;
  format: "text" | "json";
  quiet: boolean;
  files: string[];
  endpoints: string[];
  output?: string;
  stdout: boolean;
  force: boolean;
  projectId?: number;
  token?: string;
  dryRun: boolean;
  yes: boolean;
  /** 不生成并打开同步结果报告页(sync 专用) */
  noReport: boolean;
  endpointConflictBehavior?: ConflictBehavior;
  schemaConflictBehavior?: ConflictBehavior;
  includes: string[];
  excludes: string[];
  dependencyRepos: string[];
  dependencyJars: string[];
  dependencyMaxJars?: number;
  /** Apifox 请求等待上限（毫秒）；导入首次建目录/接口/模型可能较慢 */
  timeoutMs?: number;
}

const conflictBehaviors: ConflictBehavior[] = ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"];

const argumentOptions = {
  help: { type: "boolean", short: "h", default: false },
  version: { type: "boolean", short: "v", default: false },
  project: { type: "string", default: "." },
  config: { type: "string" },
  format: { type: "string", default: "text" },
  quiet: { type: "boolean", default: false },
  file: { type: "string", multiple: true, default: [] },
  endpoint: { type: "string", multiple: true, default: [] },
  output: { type: "string", short: "o" },
  stdout: { type: "boolean", default: false },
  force: { type: "boolean", default: false },
  "project-id": { type: "string" },
  token: { type: "string" },
  "dry-run": { type: "boolean", default: false },
  yes: { type: "boolean", short: "y", default: false },
  "no-report": { type: "boolean", default: false },
  "endpoint-conflict": { type: "string" },
  "schema-conflict": { type: "string" },
  include: { type: "string", multiple: true, default: [] },
  exclude: { type: "string", multiple: true, default: [] },
  "dependency-repo": { type: "string", multiple: true, default: [] },
  "dependency-jar": { type: "string", multiple: true, default: [] },
  "dependency-max-jars": { type: "string" },
  "timeout-ms": { type: "string" },
} as const satisfies NonNullable<ParseArgsConfig["options"]>;

type ParsedArguments = ReturnType<typeof parseArgs<{ options: typeof argumentOptions }>>;

export function parseCliArgs(argv: string[]): CliOptions {
  const first = argv[0];
  const command = first && !first.startsWith("-") ? first : undefined;
  if (command && !isCommand(command)) {
    throw new CliError("INVALID_ARGUMENT", `未知命令:${command}`, 2);
  }
  const rest = command ? argv.slice(1) : argv;
  let parsed: ParsedArguments;
  try {
    parsed = parseArgs({
      args: rest,
      allowPositionals: false,
      strict: true,
      options: argumentOptions,
    });
  } catch (error) {
    throw new CliError("INVALID_ARGUMENT", error instanceof Error ? error.message : String(error), 2);
  }

  const format = parsed.values.format;
  if (format !== "text" && format !== "json") {
    throw new CliError("INVALID_ARGUMENT", "--format 只支持 text 或 json", 2);
  }
  const projectId = parsed.values["project-id"] === undefined ? undefined : parsePositiveInteger(parsed.values["project-id"], "--project-id");
  return {
    command: command as CommandName | undefined,
    help: parsed.values.help ?? false,
    version: parsed.values.version ?? false,
    project: parsed.values.project ?? ".",
    projectSource: hasOption(rest, "--project") ? "cli" : "default",
    configFile: parsed.values.config,
    format,
    quiet: parsed.values.quiet ?? false,
    files: parsed.values.file ?? [],
    endpoints: parsed.values.endpoint ?? [],
    output: parsed.values.output,
    stdout: parsed.values.stdout ?? false,
    force: parsed.values.force ?? false,
    projectId,
    token: parsed.values.token,
    dryRun: parsed.values["dry-run"] ?? false,
    yes: parsed.values.yes ?? false,
    noReport: parsed.values["no-report"] ?? false,
    endpointConflictBehavior: parseConflict(parsed.values["endpoint-conflict"], "--endpoint-conflict"),
    schemaConflictBehavior: parseConflict(parsed.values["schema-conflict"], "--schema-conflict"),
    includes: parsed.values.include ?? [],
    excludes: parsed.values.exclude ?? [],
    dependencyRepos: parsed.values["dependency-repo"] ?? [],
    dependencyJars: parsed.values["dependency-jar"] ?? [],
    dependencyMaxJars:
      parsed.values["dependency-max-jars"] === undefined
        ? undefined
        : parseNonNegativeInteger(parsed.values["dependency-max-jars"], "--dependency-max-jars"),
    timeoutMs: parsed.values["timeout-ms"] === undefined ? undefined : parsePositiveInteger(parsed.values["timeout-ms"], "--timeout-ms"),
  };
}

function hasOption(args: string[], name: string): boolean {
  return args.some((arg) => arg === name || arg.startsWith(`${name}=`));
}

function isCommand(value: string): value is CommandName {
  return value === "scan" || value === "export" || value === "sync" || value === "config";
}

function parsePositiveInteger(raw: string, option: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new CliError("INVALID_ARGUMENT", `${option} 必须是正整数`, 2);
  }
  return value;
}

function parseNonNegativeInteger(raw: string, option: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new CliError("INVALID_ARGUMENT", `${option} 必须是大于等于 0 的整数`, 2);
  }
  return value;
}

function parseConflict(raw: string | undefined, option: string): ConflictBehavior | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (!conflictBehaviors.includes(raw as ConflictBehavior)) {
    throw new CliError("INVALID_ARGUMENT", `${option} 的值无效:${raw}`, 2);
  }
  return raw as ConflictBehavior;
}

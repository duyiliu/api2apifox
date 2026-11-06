import * as fs from "node:fs";
import * as path from "node:path";
import fg from "fast-glob";
import { SourceFile } from "../java/model";
import { createGitEntryProbe, isInHiddenDirectory, isSkippedCheckout } from "../java/scanScope";
import { Diagnostic, ResolvedConfig } from "./types";

export interface ProjectScanResult {
  files: SourceFile[];
  scannedFiles: number;
  skippedFiles: number;
  diagnostics: Diagnostic[];
}

export async function scanProject(config: ResolvedConfig, signal?: AbortSignal): Promise<ProjectScanResult> {
  throwIfAborted(signal);
  const diagnostics: Diagnostic[] = [];
  const matches = await globJavaFiles(config, diagnostics);
  matches.sort((a, b) => a.localeCompare(b));

  const probe = createGitEntryProbe((candidate) => fs.existsSync(candidate));
  let skippedFiles = 0;
  const files: SourceFile[] = [];
  for (const file of matches) {
    throwIfAborted(signal);
    const dir = path.dirname(file);
    if (isInHiddenDirectory(dir, config.projectRoot) || isSkippedCheckout(dir, config.projectRoot, probe.hasGitEntry)) {
      skippedFiles++;
      continue;
    }
    try {
      files.push({ fsPath: path.resolve(file), content: await fs.promises.readFile(file, "utf8") });
    } catch (error) {
      skippedFiles++;
      diagnostics.push({
        level: "warning",
        code: "FILE_READ_FAILED",
        message: `Java 文件读取失败:${error instanceof Error ? error.message : String(error)}`,
        file,
      });
    }
  }
  return { files, scannedFiles: files.length, skippedFiles, diagnostics };
}

/**
 * 按 include/exclude 扫描 Java 文件。
 * Windows 上用户常把路径直接写成 `src\main\java\**\*.java`，而 fast-glob 只认正斜杠，
 * 反斜杠会被当成转义符导致零匹配（表现为「没有扫描到任何 Java 源文件」）。
 * 因此仅在原写法零匹配时，用正斜杠写法重试一次；原写法能匹配时行为完全不变，
 * 避免影响依赖反斜杠转义的少见 glob。
 */
async function globJavaFiles(config: ResolvedConfig, diagnostics: Diagnostic[]): Promise<string[]> {
  const options = {
    cwd: config.projectRoot,
    absolute: true,
    onlyFiles: true as const,
    unique: true,
    dot: true,
    followSymbolicLinks: false,
  };
  const matches = await fg(config.include, { ...options, ignore: config.exclude });
  if (matches.length) {
    return matches;
  }
  const hasBackslash = [...config.include, ...config.exclude].some((pattern) => pattern.includes("\\"));
  if (!hasBackslash) {
    return matches;
  }
  const toPosix = (pattern: string) => pattern.replace(/\\/g, "/");
  const retried = await fg(config.include.map(toPosix), { ...options, ignore: config.exclude.map(toPosix) });
  if (retried.length) {
    diagnostics.push({
      level: "warning",
      code: "GLOB_BACKSLASH_NORMALIZED",
      message: "include/exclude 使用了反斜杠路径分隔符，已按正斜杠重新匹配；建议改用 / 写法",
    });
  }
  return retried;
}

export async function findProjectFiles(
  projectRoot: string,
  pattern: string,
  ignore: string[],
  maxFiles?: number,
  signal?: AbortSignal
): Promise<string[]> {
  throwIfAborted(signal);
  const files = await fg(pattern, {
    cwd: projectRoot,
    ignore,
    absolute: true,
    onlyFiles: true,
    unique: true,
    dot: true,
    followSymbolicLinks: false,
  });
  files.sort((a, b) => a.localeCompare(b));
  const probe = createGitEntryProbe((candidate) => fs.existsSync(candidate));
  const scopedFiles: string[] = [];
  for (const file of files) {
    throwIfAborted(signal);
    const dir = path.dirname(file);
    if (!isInHiddenDirectory(dir, projectRoot) && !isSkippedCheckout(dir, projectRoot, probe.hasGitEntry)) {
      scopedFiles.push(file);
    }
  }
  return maxFiles === undefined ? scopedFiles : scopedFiles.slice(0, maxFiles);
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const error = new Error("操作已取消");
    error.name = "AbortError";
    throw error;
  }
}

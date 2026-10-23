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
  const matches = await fg(config.include, {
    cwd: config.projectRoot,
    ignore: config.exclude,
    absolute: true,
    onlyFiles: true,
    unique: true,
    dot: true,
    followSymbolicLinks: false,
  });
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

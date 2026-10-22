import * as fs from "node:fs";
import * as path from "node:path";
import { HelperProperties, loadPropertiesFiles } from "../config/helperProperties";
import { discoverMavenRepos, JarClassIndex, parsePomDependencies, resolveDependencyJars } from "../java/jarIndex";
import { EndpointInfo } from "../java/model";
import { analyze, analyzeSubset } from "../pipeline";
import { ProjectAnalysisResult, ResolvedConfig } from "./types";
import { findProjectFiles, scanProject, throwIfAborted } from "./projectScanner";

export interface AnalyzeProjectRequest {
  config: ResolvedConfig;
  files?: string[];
  endpoints?: string[];
  signal?: AbortSignal;
}

export async function analyzeProject(request: AnalyzeProjectRequest): Promise<ProjectAnalysisResult> {
  const { config, signal } = request;
  const scanned = await scanProject(config, signal);
  if (!scanned.files.length) {
    return {
      projectRoot: config.projectRoot,
      scannedFiles: 0,
      skippedFiles: scanned.skippedFiles,
      diagnostics: scanned.diagnostics,
      spec: emptySpec(config.title),
      endpoints: [],
      warnings: [],
    };
  }

  throwIfAborted(signal);
  const helperProperties = await loadProjectHelperProperties(config, signal);
  const dependency = await buildProjectJarIndex(config, signal);
  const fileSelectors = normalizeFiles(request.files ?? [], config.projectRoot);
  const endpointSelectors = new Set((request.endpoints ?? []).map(normalizeEndpointSelector));
  const hasFilter = fileSelectors.size > 0 || endpointSelectors.size > 0;
  const folderOf = (endpoint: EndpointInfo): string => {
    const key = config.folderNameSource === "controller" ? endpoint.controller : endpoint.tag;
    return config.rootFolderName.trim() ? `${config.rootFolderName.trim()}/${key}` : key;
  };
  const options = {
    title: config.title,
    pageStyle: config.pageTypeStyle,
    rules: helperProperties,
    enumFieldDoc: config.enumFieldDoc,
    folderOf,
    jarLookup: dependency.index ? (name: string) => dependency.index!.lookup(name) : undefined,
  };
  const output = hasFilter
    ? analyzeSubset(scanned.files, options, (endpoint) => {
        const fileMatch = fileSelectors.size === 0 || fileSelectors.has(normalizeFsPath(endpoint.fsPath)) ||
          (!!endpoint.ownerFsPath && fileSelectors.has(normalizeFsPath(endpoint.ownerFsPath)));
        const endpointMatch = endpointSelectors.size === 0 || endpointSelectors.has(`${endpoint.method.toUpperCase()} ${normalizeEndpointPath(endpoint.path)}`);
        return fileMatch && endpointMatch;
      })
    : analyze(scanned.files, options);

  const dependencyWarnings = [...dependency.warnings, ...(dependency.index?.warnings ?? [])];
  const warnings = [...new Set([...(helperProperties?.warnings ?? []), ...dependencyWarnings, ...output.warnings])];
  return {
    ...output,
    warnings,
    projectRoot: config.projectRoot,
    scannedFiles: scanned.scannedFiles,
    skippedFiles: scanned.skippedFiles,
    diagnostics: scanned.diagnostics,
  };
}

async function loadProjectHelperProperties(config: ResolvedConfig, signal?: AbortSignal): Promise<HelperProperties | undefined> {
  if (!config.helperPropertiesEnabled) {
    return undefined;
  }
  const files = await findProjectFiles(config.projectRoot, "**/.apifox-helper.properties", ["**/node_modules/**"], undefined, signal);
  const contents: { path: string; content: string }[] = [];
  for (const file of files) {
    throwIfAborted(signal);
    const dir = path.dirname(file);
    if (dir.split(path.sep).some((segment) => segment.startsWith(".")) && path.resolve(dir) !== path.resolve(config.projectRoot)) {
      continue;
    }
    try {
      contents.push({ path: normalizeFsPath(file), content: await fs.promises.readFile(file, "utf8") });
    } catch {
      // 规则文件不可读时由缺失规则自然降级，不阻断接口扫描。
    }
  }
  if (!contents.length) {
    return undefined;
  }
  contents.sort((a, b) => pathDepth(a.path) - pathDepth(b.path) || a.path.localeCompare(b.path));
  return loadPropertiesFiles(contents, (candidate) => {
    try {
      return fs.readFileSync(candidate, "utf8");
    } catch {
      return undefined;
    }
  });
}

async function buildProjectJarIndex(
  config: ResolvedConfig,
  signal?: AbortSignal
): Promise<{ index?: JarClassIndex; warnings: string[] }> {
  const warnings: string[] = [];
  const jars: string[] = [];
  for (const configured of config.dependencyJars) {
    const candidate = path.isAbsolute(configured) ? configured : path.resolve(config.projectRoot, configured);
    try {
      if (fs.statSync(candidate).isFile()) {
        jars.push(candidate);
      }
    } catch {
      warnings.push(`显式依赖 jar 不可读:${candidate}`);
    }
  }

  const repos = discoverMavenRepos(
    config.dependencyRepos.map((repo) => (path.isAbsolute(repo) ? repo : path.resolve(config.projectRoot, repo)))
  );
  if (repos.length) {
    const pomFiles = await findProjectFiles(config.projectRoot, "**/pom.xml", ["**/target/**", "**/.*/**"], 200, signal);
    const coordinates: { groupId: string; artifactId: string }[] = [];
    for (const pom of pomFiles) {
      throwIfAborted(signal);
      try {
        coordinates.push(...parsePomDependencies(await fs.promises.readFile(pom, "utf8")));
      } catch {
        warnings.push(`pom.xml 不可读:${pom}`);
      }
    }
    const resolved = resolveDependencyJars(repos, coordinates);
    jars.push(...resolved.jars);
    warnings.push(...resolved.warnings);
  }

  const unique = [...new Set(jars)];
  if (!unique.length) {
    return { warnings };
  }
  const index = JarClassIndex.build(unique);
  return index.size ? { index, warnings } : { warnings: [...warnings, ...index.warnings] };
}

function normalizeFiles(files: string[], projectRoot: string): Set<string> {
  return new Set(files.map((file) => normalizeFsPath(path.isAbsolute(file) ? file : path.resolve(projectRoot, file))));
}

function normalizeFsPath(file: string): string {
  const normalized = path.resolve(file).replace(/\\/g, "/");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function normalizeEndpointSelector(selector: string): string {
  const match = /^([A-Za-z]+)\s+(.+)$/.exec(selector.trim());
  return match ? `${match[1].toUpperCase()} ${normalizeEndpointPath(match[2])}` : selector.trim().toUpperCase();
}

function normalizeEndpointPath(endpointPath: string): string {
  const normalized = endpointPath.trim().replace(/\/{2,}/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function pathDepth(file: string): number {
  return file.split("/").length;
}

function emptySpec(title: string): ProjectAnalysisResult["spec"] {
  return { openapi: "3.0.3", info: { title, version: "1.0.0" }, paths: {} };
}

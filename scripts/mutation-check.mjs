#!/usr/bin/env node
/**
 * 聚焦变异测试（矩阵第 5 节目标集）。
 *
 * 为什么自己做而不用 StrykerJS：仓库无变异工具链，对 ~17.7k 行 TS 起全量
 * Stryker 成本过高；本脚本只对"关键决策点"逐个施加 1 处文本变异、
 * 重跑相关用例、记录 killed / survived，并在结束时自动还原源码。
 *
 * 用法：node scripts/mutation-check.mjs [--only <id>]
 * 退出码：0 = 所有变异被杀或已解释；1 = 存在未解释的存活变异
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * 每个变异 = 一处源码文本替换 + 受影响测试文件。
 * expect: "killed" 预期被杀死；"survived" 预期存活（必须给出等价性解释）。
 */
const MUTANTS = [
  /* ---- syncService.ts：G2 部分失败判定 ---- */
  {
    id: "SYNC-1",
    file: "src/core/syncService.ts",
    from: "/Failed$/i.test(key)",
    to: "/Failed/i.test(key)",
    why: "去掉正则末尾 $ → 任何含 Failed 的键都算失败",
    tests: ["out/test/syncService.test.js"],
    expect: "killed",
  },
  {
    id: "SYNC-2",
    file: "src/core/syncService.ts",
    from: "/Failed$/i.test(key) && value > 0",
    to: "/Failed$/i.test(key) && value >= 0",
    why: "*Failed=0 也被算作失败（全部成功会误报部分失败）",
    tests: ["out/test/syncService.test.js"],
    expect: "killed",
  },
  {
    id: "SYNC-3",
    file: "src/core/syncService.ts",
    from: "if (result.errors.length > 0) {",
    to: "if (result.errors.length > 1) {",
    why: "只剩 1 条导入错误时不判失败",
    tests: ["out/test/syncService.test.js"],
    expect: "killed",
  },
  {
    id: "SYNC-4",
    file: "src/core/syncService.ts",
    from: "if (request.dryRun || !analyzed.endpoints.length) {",
    to: "if (request.dryRun) {",
    why: "0 接口不再短路 → 会发起一次无意义导入",
    tests: ["out/test/syncService.test.js"],
    expect: "killed",
  },
  {
    id: "SYNC-5",
    file: "src/core/syncService.ts",
    from: "deleteUnmatchedResources: false,",
    to: "deleteUnmatchedResources: true,",
    why: "开启删除未匹配资源（会删掉手工维护的接口）",
    tests: ["out/test/syncService.test.js", "packages/cli/test/cli-sync.test.js"],
    expect: "killed",
  },
  {
    id: "SYNC-6",
    file: "src/core/syncService.ts",
    from: "config.schemaFolderId > 0 ? config.schemaFolderId : undefined",
    to: "config.schemaFolderId >= 0 ? config.schemaFolderId : undefined",
    why: "schemaFolderId=0 也作为目录 ID 发送",
    tests: ["out/test/syncService.test.js"],
    expect: "killed",
  },

  /* ---- core/config.ts：G4 冲突策略校验与优先级 ---- */
  {
    id: "CFG-1",
    file: "src/core/config.ts",
    from: "if (!CONFLICT_BEHAVIORS.includes(config.endpointConflictBehavior)) {",
    to: "if (false) {",
    why: "移除接口冲突策略的最终校验（overrides 非法值会静默通过）",
    tests: ["out/test/clientErrors.test.js"],
    expect: "killed",
  },
  {
    id: "CFG-2",
    file: "src/core/config.ts",
    from: "if (!CONFLICT_BEHAVIORS.includes(config.schemaConflictBehavior)) {",
    to: "if (false) {",
    why: "移除模型冲突策略的最终校验",
    tests: ["out/test/clientErrors.test.js"],
    expect: "killed",
  },
  {
    id: "CFG-3",
    file: "src/core/config.ts",
    from: "maxDependencyJars < 0",
    to: "maxDependencyJars <= 0",
    why: "maxDependencyJars=0 被视为非法（0 本应是合法的\"关闭依赖解析\"）",
    tests: ["out/test/coreConfig.test.js"],
    expect: "killed",
  },

  /* ---- pipeline.ts：G9 告警过滤 + 去重 ---- */
  {
    id: "PIPE-1",
    file: "src/pipeline.ts",
    from: "if (existing.flavor !== \"spring-mvc\" && ep.flavor === \"spring-mvc\") {",
    to: "if (existing.flavor === \"spring-mvc\" && ep.flavor !== \"spring-mvc\") {",
    why: "去重时保留 Feign 版本而非 Controller 版本",
    tests: ["out/test/analyze.test.js", "out/test/features.test.js"],
    expect: "killed",
  },
  {
    id: "PIPE-2",
    file: "src/pipeline.ts",
    from: "    // 全局系统级告警保留\n    return true;\n  });\n}",
    to: "    // 全局系统级告警保留\n    return false;\n  });\n}",
    why: "过滤掉所有无法归属的全局告警（用户看不到仓库/jar 失败）",
    tests: ["out/test/warningFilter.test.js"],
    expect: "killed",
  },
  {
    id: "PIPE-3",
    file: "src/pipeline.ts",
    from: "if (!keptControllers.has(ctrl)) {\n        return false;",
    to: "if (!keptControllers.has(ctrl)) {\n        return true;",
    why: "泄露未选中控制器的方法级告警",
    tests: ["out/test/warningFilter.test.js"],
    expect: "killed",
  },
  {
    id: "PIPE-4",
    file: "src/pipeline.ts",
    from: "  return endpointFilter ? [...new Set([...parseErrors, ...filterWarningsForEndpoints(others, kept)])] : all;",
    to: "  return all;",
    why: "子集分析不再过滤告警（单接口同步冒出全项目告警）",
    tests: ["out/test/warningFilter.test.js"],
    expect: "killed",
  },
  {
    id: "PIPE-5",
    file: "src/pipeline.ts",
    from: "return { ...this.lastResult.output, warnings: [...this.lastResult.output.warnings] };",
    to: "return this.lastResult.output;",
    why: "缓存命中返回共享引用（调用方 push 会污染缓存）",
    tests: ["out/test/warningFilter.test.js", "out/test/analyze.test.js"],
    expect: "killed",
  },

  {
    id: "PIPE-6",
    file: "src/pipeline.ts",
    from: "  return endpointFilter ? [...new Set([...parseErrors, ...filterWarningsForEndpoints(others, kept)])] : all;",
    to: "  return endpointFilter ? filterWarningsForEndpoints(all, kept) : all;",
    why: "解析失败告警重新参与子集过滤（裸文件名 *Controller.java 坏文件的告警被误删）",
    tests: ["out/test/malformedSource.test.js", "out/test/warningFilter.test.js"],
    expect: "killed",
  },

  /* ---- java/typeIndex.ts：G5 解析隔离（本次修复的新防线） ---- */
  {
    id: "PARSE-1",
    file: "src/java/typeIndex.ts",
    from: "  } catch (err) {\n    return { fsPath, source: content, cst: EMPTY_CST, parseError: parseErrorMessage(err) };",
    to: "  } catch (err) {\n    throw err;",
    why: "撤销文件级隔离，恢复\"一个坏文件拖垮整次扫描\"",
    tests: ["out/test/malformedSource.test.js"],
    expect: "killed",
  },
  {
    id: "PARSE-2",
    file: "src/java/typeIndex.ts",
    from: "    if (pf.parseError) {\n      byFile.set(pf.fsPath, []);\n      continue;\n    }",
    to: "",
    why: "解析失败文件仍进入索引（空 CST 参与扫描，白耗性能）",
    tests: ["out/test/malformedSource.test.js"],
    expect: "survived",
    equivalentBecause:
      "空 CST 的 children 为 {}，findAll 遍历不到任何 typeDeclaration，indexTypeDecl 不会被调用，" +
      "因此 byFile 最终仍是空数组、types 不变。该早退只是省掉一次空遍历的性能优化，" +
      "行为与不加早退完全等价（malformedSource 全绿即为证据）。",
  },

  /* ---- java/jarIndex.ts：G6 同名类与上限边界 ---- */
  {
    id: "JAR-1",
    file: "src/java/jarIndex.ts",
    from: "        if (!idx.bySimple.has(simple)) {\n          idx.bySimple.set(simple, { jarPath: jp, entryName: e.name });\n        }",
    to: "        idx.bySimple.set(simple, { jarPath: jp, entryName: e.name });",
    why: "同名类改为\"后注册覆盖先注册\"（classpath 语义反转）",
    tests: ["out/test/jarCounterexamples.test.js"],
    expect: "killed",
  },
  {
    id: "JAR-2",
    file: "src/java/jarIndex.ts",
    from: "      if (collected.length >= maxJars) {",
    to: "      if (collected.length > maxJars) {",
    why: "上限比较 > vs >=（会多收 1 个 jar）",
    tests: ["out/test/jarCounterexamples.test.js"],
    expect: "killed",
  },
  {
    id: "JAR-3",
    file: "src/java/jarIndex.ts",
    from: "        if (e.name.endsWith(\"module-info.class\") || e.name.endsWith(\"package-info.class\")) {",
    to: "        if (false) {",
    why: "module-info/package-info 进入索引（污染简单类名空间）",
    tests: ["out/test/jarCounterexamples.test.js"],
    expect: "survived",
    equivalentBecause:
      "显式排除是第二道防线，第一道是类名正则 /^[A-Za-z_]\w*$/：\"module-info\" 与 \"package-info\" 都含 '-'，" +
      "在缺少显式排除时仍会被该正则过滤掉，索引规模与 lookup 结果完全不变。" +
      "保留显式排除的价值是「不依赖正则细节」的可读防线；jarCounterexamples 已用例锁定最终结果不变。",
  },

  /* ---- java/ruleEval.ts：G8 白名单安全 ---- */
  {
    id: "RULE-1",
    file: "src/java/ruleEval.ts",
    from: "  return {\n    matched: true,\n    skipped: true,",
    to: "  return {\n    matched: true,\n    skipped: false,",
    why: "不可翻译的 groovy 不再标 skipped（上层会当成无值命中，掩盖告警）",
    tests: ["out/test/groovySafety.test.js", "out/test/properties.test.js"],
    expect: "killed",
  },
  {
    id: "RULE-2",
    file: "src/java/ruleEval.ts",
    from: "  if (body.startsWith(\"groovy:\") || body.startsWith(\"js:\")) {\n    return { hit: false, supported: false };",
    to: "  if (body.startsWith(\"groovy:\") || body.startsWith(\"js:\")) {\n    return { hit: true, supported: true };",
    why: "groovy 条件被当作恒真放行（危险规则会被应用）",
    tests: ["out/test/groovySafety.test.js"],
    expect: "killed",
  },
  {
    id: "RULE-3",
    file: "src/java/ruleEval.ts",
    from: "  const str = tryUnquote(cleaned);\n  if (str !== undefined) {\n    return str;\n  }",
    to: "  const str = tryUnquote(cleaned);\n  if (str !== undefined) {\n    return undefined;\n  }",
    why: "纯字符串字面量不再产出值（合法 groovy 规则失效）",
    tests: ["out/test/groovySafety.test.js", "out/test/rules.test.js"],
    expect: "killed",
  },

  /* ---- apifox/client.ts：G7 错误矩阵 ---- */
  {
    id: "CLIENT-1",
    file: "src/apifox/client.ts",
    from: "    if (res.redirected) {",
    to: "    if (false) {",
    why: "关闭 302 假成功识别（下线路由会被当成功）",
    tests: ["out/test/client.test.js"],
    expect: "killed",
  },
  {
    id: "CLIENT-2",
    file: "src/apifox/client.ts",
    from: "    if (payload && typeof payload.code === \"number\" && payload.code !== 0) {",
    to: "    if (payload && typeof payload.code === \"number\" && payload.code > 0) {",
    why: "负业务码不再视为错误",
    tests: ["out/test/client.test.js", "out/test/clientErrors.test.js"],
    expect: "killed",
  },
  {
    id: "CLIENT-3",
    file: "src/apifox/client.ts",
    from: "  if (status === 401) {",
    to: "  if (status === 411) {",
    why: "401 不再给出\"重新配置令牌\"的可执行提示",
    tests: ["out/test/clientErrors.test.js"],
    expect: "killed",
  },
  {
    id: "CLIENT-4",
    file: "src/apifox/client.ts",
    from: "    const url = this.baseUrl.replace(/\\/+$/, \"\") + path;",
    to: "    const url = this.baseUrl + path;",
    why: "不再去除尾部斜杠（私有化部署 baseURL 带 / 时产生 //v1）",
    tests: ["out/test/clientErrors.test.js"],
    expect: "killed",
  },
  {
    id: "CLIENT-5",
    file: "src/apifox/client.ts",
    from: "    if (!projects.length && failed > 0 && teams.length > 0) {",
    to: "    if (false) {",
    why: "全部团队失败时返回空列表（UI 显示\"没有项目\"而非报错）",
    tests: ["out/test/clientErrors.test.js"],
    expect: "killed",
  },

  /* ---- core/projectScanner.ts：G10 反斜杠 glob（本次修复） ---- */
  {
    id: "SCAN-1",
    file: "src/core/projectScanner.ts",
    from: 'const toPosix = (pattern: string) => pattern.replace(/\\\\/g, "/");',
    to: "const toPosix = (pattern: string) => pattern;",
    why: "撤销反斜杠 glob 归一（Windows 上 --include '**\\*.java' 零匹配）",
    tests: ["packages/cli/test/cli-sync.test.js"],
    expect: "killed",
  },

  {
    id: "SCAN-2",
    file: "src/core/projectAnalyzer.ts",
    from: "    const warnings = [...new Set([...diagnosticWarnings, ...(helperProperties?.warnings ?? []), ...dependencyWarnings, ...output.warnings])];",
    to: "    const warnings = [...new Set([...(helperProperties?.warnings ?? []), ...dependencyWarnings, ...output.warnings])];",
    why: "撤销 diagnostics→warnings 合并（GLOB_BACKSLASH_NORMALIZED 重新变为不可达）",
    tests: ["packages/cli/test/cli-sync.test.js"],
    expect: "killed",
  },

  /* ---- cli/report.ts：HTML 转义 ---- */
  {
    id: "REPORT-1",
    file: "packages/cli/src/report.ts",
    from: "const data = JSON.stringify(report).replace(/</g, \"\\\\u003c\");",
    to: "const data = JSON.stringify(report);",
    why: "移除 < 转义（接口名可提前闭合 script 标签）",
    tests: ["packages/cli/test/cli.test.js"],
    expect: "killed",
  },
];

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : undefined;
const selected = only ? MUTANTS.filter((m) => m.id === only) : MUTANTS;

function build() {
  execFileSync("npx", ["tsc", "-p", "tsconfig.test.json"], { cwd: ROOT, stdio: "pipe", shell: true });
  execFileSync("npm", ["run", "build", "--workspace", "@duyiliu/api2apifox"], { cwd: ROOT, stdio: "pipe", shell: true });
}

function runTests(files) {
  try {
    execFileSync(process.execPath, ["--test", ...files], { cwd: ROOT, stdio: "pipe" });
    return true; // 全绿 = 变异存活
  } catch {
    return false; // 有失败 = 变异被杀死
  }
}

/**
 * 仓库部分文件是 CRLF（Windows checkout），而变异锚点用 LF 书写。
 * 统一在 LF 空间做查找/替换，回写时恢复原文件的换行风格，
 * 避免"锚点未命中"或把整文件换行风格改掉。
 */
function mutateSource(original, from, to) {
  const crlf = original.includes("\r\n");
  const lfText = crlf ? original.replace(/\r\n/g, "\n") : original;
  if (!lfText.includes(from)) {
    return undefined;
  }
  const mutated = lfText.replace(from, to);
  return crlf ? mutated.replace(/\n/g, "\r\n") : mutated;
}

const results = [];
for (const mutant of selected) {
  const target = join(ROOT, mutant.file);
  const original = readFileSync(target, "utf8");
  const mutated = mutateSource(original, mutant.from, mutant.to);
  if (mutated === undefined) {
    results.push({ ...mutant, status: "STALE", detail: "变异锚点未命中源码（源码已变动）" });
    continue;
  }
  try {
    writeFileSync(target, mutated, "utf8");
    try {
      build();
    } catch (err) {
      // 变异导致编译失败也算被杀死（类型系统挡住了这个错误），但要单独标注
      results.push({ ...mutant, status: "KILLED_BY_TYPES", detail: String(err?.message ?? err).slice(0, 200) });
      process.stdout.write(`${mutant.id.padEnd(10)} type-err  ${mutant.why}\n`);
      continue;
    }
    const alive = runTests(mutant.tests);
    results.push({ ...mutant, status: alive ? "SURVIVED" : "KILLED" });
    process.stdout.write(`${mutant.id.padEnd(10)} ${alive ? "SURVIVED" : "killed  "}  ${mutant.why}\n`);
  } finally {
    writeFileSync(target, original, "utf8");
  }
}

// 还原后重新构建，避免留下变异产物
build();

const killed = results.filter((r) => r.status === "KILLED" || r.status === "KILLED_BY_TYPES");
const survived = results.filter((r) => r.status === "SURVIVED");
const stale = results.filter((r) => r.status === "STALE");
const unexplained = results.filter(
  (r) => r.status === "SURVIVED" && (!r.equivalentBecause || r.expect !== "survived")
);

console.log(`\n变异总数 ${results.length}：killed ${killed.length} / survived ${survived.length} / stale ${stale.length}`);
for (const r of survived) {
  console.log(`\n[存活] ${r.id} — ${r.why}`);
  console.log(`  解释：${r.equivalentBecause ?? "!! 未解释，需补测试或补充等价性说明"}`);
}
for (const r of stale) {
  console.log(`\n[锚点失效] ${r.id} — ${r.detail}`);
}

process.exitCode = unexplained.length || stale.length ? 1 : 0;

#!/usr/bin/env node
/**
 * 变异结果汇总/清单生成器（统一交付用，只读 artifacts，不改源码）。
 *
 * 输入：reports/mutation/per-file/<name>.json（逐文件 Stryker 产物，八文件各一份）
 * 输出：
 *   work/统一交付/mutation-summary.json  —— 逐文件分数/计数（供报告引用）
 *   work/统一交付/mutation-summary.md    —— 报告用表格
 *   work/统一交付/survivors-raw.json     —— 全部 Survived / NoCoverage 清单（含原始代码与偏移说明）
 *
 * 事实口径（与 Stryker clear-text 表一致）：
 *   - Timeout 计入 killed；Error（编译/运行时错误）不计入任何分母。
 *   - 总分 = (killed+timeout) / (mutants - errors)
 *   - covered 分 = (killed+timeout) / (mutants - errors - noCoverage)
 *
 * 行号口径：报告 JSON 内嵌 `source` 是变异时真实生效的文件内容。
 * 历史上（13:13~14:22 的 7 次跑）out/*.js 顶部带过 2 行注入的 `// @ts-nocheck`
 * 头部（QA 对账 §3.6 记录的外部注入残留），因此这些产物中 line N 对应当前
 * 干净构建的 line N-2。本脚本逐文件检测头部并记录 `lineInCleanBuild`，
 * 行文本以嵌入源为准（运行时唯一权威）。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const IN_DIR = path.join(ROOT, "reports/mutation/per-file");
const OUT_DIR = path.join(ROOT, "work/统一交付");
const NAMES = ["pipeline", "syncService", "config", "builder", "client", "jarIndex", "controllerParser", "schemaResolver"];

/** tsc CJS 样板（等价变异）：对 exports 元数据/辅助函数本身的改写 */
function boilerplateReason(orig, replacement) {
  const joined = `${orig} ${replacement ?? ""}`;
  if (/__esModule/.test(orig)) return "tsc CJS 样板（__esModule）——仅导出元数据，无运行时消费者";
  if (/__importStar|__exportStar|__createBinding|Object\.defineProperty\(exports/.test(orig))
    return "tsc 互操作辅助函数样板——由编译器生成，替换不改变可观测行为（见 stryker.preamble.md）";
  return null;
}

const summary = { generatedAt: new Date().toISOString(), files: {}, totals: { mutants: 0, killed: 0, survived: 0, noCoverage: 0, timeout: 0, error: 0 } };
const survivors = [];

for (const name of NAMES) {
  const file = path.join(IN_DIR, `${name}.json`);
  if (!fs.existsSync(file)) {
    summary.files[name] = { missing: true };
    continue;
  }
  const report = JSON.parse(fs.readFileSync(file, "utf8"));
  const entry = { mutants: 0, killed: 0, survived: 0, noCoverage: 0, timeout: 0, error: 0, byFile: {} };
  const filesObj = report.files ?? {};
  for (const [fileName, info] of Object.entries(filesObj)) {
    const embLines = (info.source ?? "").split(/\r?\n/);
    const headerOffset = embLines[0]?.trim() === "// @ts-nocheck" ? 2 : 0;
    for (const m of info.mutants ?? []) {
      entry.mutants += 1;
      const status = m.status;
      if (status === "Killed") entry.killed += 1;
      else if (status === "Survived") entry.survived += 1;
      else if (status === "NoCoverage") entry.noCoverage += 1;
      else if (status === "Timeout") entry.timeout += 1;
      else entry.error += 1;
      if (status === "Survived" || status === "NoCoverage") {
        const sLine = m.location?.start?.line ?? 0;
        const eLine = m.location?.end?.line ?? sLine;
        const sCol = m.location?.start?.column ?? 0;
        const eCol = m.location?.end?.column ?? 0;
        const orig =
          sLine === eLine
            ? (embLines[sLine - 1] ?? "").slice(sCol, eCol)
            : [(embLines[sLine - 1] ?? "").slice(sCol), ...(eLine - sLine > 1 ? Array.from({ length: eLine - sLine - 1 }, (_, i) => embLines[sLine + i] ?? "") : []), (embLines[eLine - 1] ?? "").slice(0, eCol)].join("\n");
        const lineText = (embLines[sLine - 1] ?? "").trim();
        survivors.push({
          file: fileName,
          id: m.id,
          status,
          mutator: m.mutatorName,
          orig: orig.replace(/\s+/g, " ").slice(0, 120),
          replacement: m.replacement,
          location: `${sLine}:${sCol}`,
          lineInCleanBuild: sLine - headerOffset,
          source: lineText.slice(0, 200),
          boilerplate: boilerplateReason(orig, m.replacement),
          testsCompleted: m.testsCompleted ?? null,
        });
      }
    }
    entry.byFile[fileName] = {
      mutants: (info.mutants ?? []).length,
      killed: (info.mutants ?? []).filter((m) => m.status === "Killed").length,
      survived: (info.mutants ?? []).filter((m) => m.status === "Survived").length,
      noCoverage: (info.mutants ?? []).filter((m) => m.status === "NoCoverage").length,
    };
    entry.embeddedHeaderOffset = headerOffset;
  }
  const effectiveKilled = entry.killed + entry.timeout;
  const scorable = entry.mutants - entry.error;
  const covered = scorable - entry.noCoverage;
  entry.effectiveKilled = effectiveKilled;
  entry.scoreTotal = scorable ? +((effectiveKilled / scorable) * 100).toFixed(2) : 0;
  entry.scoreCovered = covered ? +((effectiveKilled / covered) * 100).toFixed(2) : 0;
  summary.files[name] = entry;
  for (const key of ["mutants", "killed", "survived", "noCoverage", "timeout", "error"]) summary.totals[key] += entry[key];
}

summary.totals.effectiveKilled = summary.totals.killed + summary.totals.timeout;
const scorableTotal = summary.totals.mutants - summary.totals.error;
summary.totals.scoreTotal = +((summary.totals.effectiveKilled / scorableTotal) * 100).toFixed(2);
const coveredTotal = scorableTotal - summary.totals.noCoverage;
summary.totals.scoreCovered = +((summary.totals.effectiveKilled / coveredTotal) * 100).toFixed(2);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "mutation-summary.json"), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(OUT_DIR, "survivors-raw.json"), JSON.stringify(survivors, null, 2));

const rows = NAMES.map((name) => {
  const f = summary.files[name];
  if (!f || f.missing) return `| ${name} | 缺失产物 | - | - | - | - | - | - |`;
  return `| ${name} | ${f.mutants} | ${f.effectiveKilled} | ${f.survived} | ${f.noCoverage} | ${f.error} | ${f.scoreTotal}% | ${f.scoreCovered}% |`;
});
const md = [
  "# Stryker 逐文件变异结果（自动汇总）",
  "",
  `生成时间：${summary.generatedAt}`,
  "",
  "口径：killed 含 Timeout；Error 不计入分母（与 Stryker clear-text 表一致）。",
  "",
  "| 文件 | 变异数 | killed(含timeout) | survived | no-coverage | error | 总分 | covered 分 |",
  "|---|---|---|---|---|---|---|---|",
  ...rows,
  `| **合计** | ${summary.totals.mutants} | ${summary.totals.effectiveKilled} | ${summary.totals.survived} | ${summary.totals.noCoverage} | ${summary.totals.error} | ${summary.totals.scoreTotal}% | ${summary.totals.scoreCovered}% |`,
  "",
  `存活+未覆盖清单：${survivors.length} 条，明细见 \`survivors-raw.json\`（机械标记的 tsc 样板 ${survivors.filter((s) => s.boilerplate).length} 条）。`,
  "",
].join("\n");
fs.writeFileSync(path.join(OUT_DIR, "mutation-summary.md"), md);
console.log(md);
console.log("survivors:", survivors.length, "boilerplate:", survivors.filter((s) => s.boilerplate).length);

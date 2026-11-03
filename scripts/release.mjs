#!/usr/bin/env node
// 统一发版准备：扩展与 Skill 使用同一版本号，更新两个 package.json、重建 Skill runtime、校验。
// 不自动 commit/tag/push，只打印下一步命令。
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const rootManifestPath = path.join(root, "package.json");
const cliManifestPath = path.join(root, "packages", "cli", "package.json");
const input = process.argv[2]?.trim();

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!input) {
  fail("用法：npm run release -- <patch|minor|major|x.y.z>\n例如：npm run release -- 0.4.1");
}

const rootManifest = JSON.parse(fs.readFileSync(rootManifestPath, "utf8"));
const cliManifest = JSON.parse(fs.readFileSync(cliManifestPath, "utf8"));
const current = rootManifest.version;
if (cliManifest.version !== current) {
  fail(`当前版本不一致：根 ${current}，CLI ${cliManifest.version}。请先统一版本再发版。`);
}

function nextVersion(currentVersion, value) {
  const [major, minor, patch] = currentVersion.split(".").map(Number);
  if (value === "patch") return `${major}.${minor}.${patch + 1}`;
  if (value === "minor") return `${major}.${minor + 1}.0`;
  if (value === "major") return `${major + 1}.0.0`;
  if (!/^\d+\.\d+\.\d+$/.test(value)) {
    fail(`版本参数必须是 patch、minor、major 或 x.y.z：${value}`);
  }
  return value;
}

const next = nextVersion(current, input);
const compare = (a, b) => {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
};
if (compare(next, current) <= 0) {
  fail(`新版本 ${next} 必须大于当前版本 ${current}`);
}

const status = execSync("git status --porcelain", { cwd: root, encoding: "utf8" }).trim();
if (status) {
  console.log("提示：当前工作区已有未提交改动，发布前请确认只包含本次版本变更。");
}

rootManifest.version = next;
cliManifest.version = next;
fs.writeFileSync(rootManifestPath, `${JSON.stringify(rootManifest, null, 2)}\n`);
fs.writeFileSync(cliManifestPath, `${JSON.stringify(cliManifest, null, 2)}\n`);
console.log(`统一版本：${current} -> ${next}`);

execSync("npm install --package-lock-only --ignore-scripts --no-audit --no-fund", { cwd: root, stdio: "inherit" });
execSync("npm run build:skill", { cwd: root, stdio: "inherit" });
execSync("npm run check:skill", { cwd: root, stdio: "inherit" });

const readmePath = path.join(root, "README.md");
const readme = fs.readFileSync(readmePath, "utf8");
const nextReadme = readme.split(`#v${current}`).join(`#v${next}`);
if (nextReadme !== readme) {
  fs.writeFileSync(readmePath, nextReadme);
  console.log(`README 固定版本示例：#v${current} -> #v${next}`);
}

for (const relative of ["skills/api2apifox/SKILL.md", "skills/api2apifox/references/cli.md"]) {
  const file = path.join(root, relative);
  const text = fs.readFileSync(file, "utf8");
  const updated = text.split(`"version": "${current}"`).join(`"version": "${next}"`);
  if (updated !== text) {
    fs.writeFileSync(file, updated);
    console.log(`${relative} 版本示例：${current} -> ${next}`);
  }
}

console.log(`
下一步：
  git add package.json packages/cli/package.json package-lock.json skills/api2apifox README.md
  git commit -m "chore(release): v${next}"
  git tag v${next}
  git push origin main --tags
`);

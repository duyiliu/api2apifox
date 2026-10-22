// 校验真正被打包的可执行文件,避免 package.json 已升版但 dist 仍是旧 bundle。
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { gunzipSync } = require("node:zlib");
const { spawnSync } = require("node:child_process");
const expected = require("./package.json");

function readPackage(tarball) {
  const archive = gunzipSync(fs.readFileSync(tarball));
  const entries = new Map();
  for (let offset = 0; offset + 512 <= archive.length;) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const text = (start, end) => header.subarray(start, end).toString("utf8").replace(/\0.*$/s, "").trim();
    const name = [text(345, 500), text(0, 100)].filter(Boolean).join("/");
    const size = Number.parseInt(text(124, 136), 8);
    assert.ok(Number.isSafeInteger(size) && size >= 0 && offset + 512 + size <= archive.length, "无效的 npm tarball");
    if (name === "package/package.json" || name === "package/dist/cli.js") {
      entries.set(name, archive.subarray(offset + 512, offset + 512 + size));
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  assert.ok(entries.has("package/package.json") && entries.has("package/dist/cli.js"), "tarball 缺少清单或 CLI bundle");
  return {
    manifest: JSON.parse(entries.get("package/package.json").toString("utf8")),
    bundle: entries.get("package/dist/cli.js"),
  };
}

function verify(manifest, bundle) {
  assert.equal(manifest.name, expected.name, "tarball 包名与源码不一致");
  assert.equal(manifest.version, expected.version, "tarball 版本与源码不一致");
  // 只将已知 bundle 写入临时文件,保留 require.main 入口语义,不解压任意 tar 路径或执行安装脚本。
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-verify-"));
  const executable = path.join(dir, "cli.js");
  try {
    fs.writeFileSync(executable, bundle);
    const result = spawnSync(process.execPath, [executable, "--version"], { encoding: "utf8", timeout: 15000 });
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    assert.equal(result.stdout.trim(), manifest.version, "CLI 运行版本与发布清单不一致,请重新构建");
  } finally {
    if (fs.existsSync(executable)) fs.unlinkSync(executable);
    fs.rmdirSync(dir);
  }
  console.log(`Verified ${manifest.name}@${manifest.version}`);
}

try {
  const target = process.argv[2];
  assert.ok(target, "用法: node verify-package.js <tarball.tgz|--bundle>");
  const packed = target === "--bundle"
    ? { manifest: expected, bundle: fs.readFileSync(path.join(__dirname, "dist", "cli.js")) }
    : readPackage(target);
  verify(packed.manifest, packed.bundle);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

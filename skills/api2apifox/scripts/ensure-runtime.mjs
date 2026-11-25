#!/usr/bin/env node
// 确保 Skill CLI 运行时在本地存在且 sha256 与 release.json 一致。
//
// 运行时二进制不再随 git 仓库分发（避免并行 PR 二进制冲突与仓库膨胀）：
// 仓库只提交 release.json（版本 + sha256  pin），首次使用时按内容寻址从
// GitHub Releases 下载对应 api2apifox-runtime-<sha256>.cjs 资产并校验缓存。
// 任何历史 ref 的 release.json 都指向一份曾经上传、内容可自我校验的资产，
// 因此 tag / main / 任意 commit 安装均能拿到与源码严格一致的运行时。
//
// 离线/内网：发行版 zip（api2apifox-skill-<版本>.zip）内含完整运行时，解压即用；
// 或用环境变量 API2APIFOX_RUNTIME_URL 指定一个镜像/内网直链（完整 URL）。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const runtimeDir = fileURLToPath(new URL("../runtime/", import.meta.url));
const ENTRY = "api2apifox.cjs";

export function readReleasePin() {
  const release = JSON.parse(fs.readFileSync(path.join(runtimeDir, "release.json"), "utf8"));
  const expected = release.sha256?.[ENTRY];
  if (!expected) throw new Error("release.json 缺少 api2apifox.cjs 的 sha256");
  return { version: release.version, expected };
}

export function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

/** 已缓存且哈希一致时返回 true */
export function runtimeIsCurrent(expected) {
  const target = path.join(runtimeDir, ENTRY);
  return fs.existsSync(target) && sha256File(target) === expected;
}

function assetUrls(version, sha) {
  const override = process.env.API2APIFOX_RUNTIME_URL?.trim();
  if (override) return [override];
  const name = `api2apifox-runtime-${sha}.cjs`;
  const ghPath = `github.com/duyiliu/api2apifox/releases/download/runtime/${name}`;
  const ghTagPath = `github.com/duyiliu/api2apifox/releases/download/v${version}/${name}`;
  return [
    // 直连滚动 prerelease：main 每次推进由 automation 上传，覆盖 main/任意 commit 安装
    `https://${ghPath}`,
    // 直连 tag 正式 release：永久保留，滚动资产被 GC 后的兜底
    `https://${ghTagPath}`,
    // 国内镜像:GitHub 直连在部分网络被限速到十几 KB/s,镜像做竞速兜底。
    // 下载字节一律经 sha256 校验后才写入,镜像不可信也不会引入污染,只影响可用性
    `https://gh-proxy.com/https://${ghPath}`,
    `https://ghfast.top/https://${ghPath}`,
  ];
}

async function download(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const resp = await fetch(url, { redirect: "follow", signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return Buffer.from(await resp.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

/** 下载并按期望哈希校验;校验失败视为本次尝试失败(不写入) */
async function downloadVerified(url, expected) {
  const bytes = await download(url);
  const actual = crypto.createHash("sha256").update(bytes).digest("hex");
  if (actual !== expected) {
    throw new Error(`哈希不一致（期望 ${expected.slice(0, 12)}… 实得 ${actual.slice(0, 12)}…）`);
  }
  return bytes;
}

/**
 * 确保运行时可用，返回运行时文件路径。
 * 已缓存且校验通过直接返回；否则按内容寻址下载、校验 sha256 后原子写入缓存。
 */
export async function ensureRuntime() {
  const { version, expected } = readReleasePin();
  const target = path.join(runtimeDir, ENTRY);
  if (runtimeIsCurrent(expected)) return target;

  // 多源竞速:直连与镜像同时发起,第一个通过 sha256 校验的胜出。
  // 串行回退在被限速网络(十几 KB/s)下要把时间浪费在注定很慢的直连上;
  // 内容寻址保证镜像只影响可达性、不影响完整性,竞速是安全的
  const urls = assetUrls(version, expected);
  let bytes;
  try {
    bytes = await Promise.any(urls.map((url) => downloadVerified(url, expected)));
  } catch (aggregate) {
    const errors = aggregate.errors?.map((e, i) => `${urls[i]} ${e.message}`) ?? [aggregate.message];
    throw new Error(
      `运行时下载失败：\n  - ${errors.join("\n  - ")}\n` +
        `可选解决路径：\n` +
        `  1. 检查网络后重试（资产托管在 GitHub Releases，部分网络需要代理）；\n` +
        `  2. 离线/内网：下载 api2apifox-skill-${version}.zip 解压覆盖安装（内含完整运行时）；\n` +
        `  3. 设置环境变量 API2APIFOX_RUNTIME_URL 为可达的镜像/内网直链后重试。`
    );
  }
  const tmp = `${target}.download-${process.pid}`;
  fs.writeFileSync(tmp, bytes);
  fs.renameSync(tmp, target);
  return target;
}

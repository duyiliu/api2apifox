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
  return [
    // 滚动 prerelease：main 每次推进由 automation 上传，覆盖 main/任意 commit 安装
    `https://github.com/duyiliu/api2apifox/releases/download/runtime/${name}`,
    // tag 正式 release：永久保留，滚动资产被 GC 后的兜底
    `https://github.com/duyiliu/api2apifox/releases/download/v${version}/${name}`,
  ];
}

async function download(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const resp = await fetch(url, { redirect: "follow", signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return Buffer.from(await resp.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 确保运行时可用，返回运行时文件路径。
 * 已缓存且校验通过直接返回；否则按内容寻址下载、校验 sha256 后原子写入缓存。
 */
export async function ensureRuntime() {
  const { version, expected } = readReleasePin();
  const target = path.join(runtimeDir, ENTRY);
  if (runtimeIsCurrent(expected)) return target;

  const errors = [];
  for (const url of assetUrls(version, expected)) {
    try {
      const bytes = await download(url);
      const actual = crypto.createHash("sha256").update(bytes).digest("hex");
      if (actual !== expected) {
        errors.push(`${url} 哈希不一致（期望 ${expected.slice(0, 12)}… 实得 ${actual.slice(0, 12)}…），已拒绝写入`);
        continue;
      }
      const tmp = `${target}.download-${process.pid}`;
      fs.writeFileSync(tmp, bytes);
      fs.renameSync(tmp, target);
      return target;
    } catch (error) {
      errors.push(`${url} ${error.message}`);
    }
  }
  throw new Error(
    `运行时下载失败：\n  - ${errors.join("\n  - ")}\n` +
      `可选解决路径：\n` +
      `  1. 检查网络后重试（资产托管在 GitHub Releases，部分网络需要代理）；\n` +
      `  2. 离线/内网：下载 api2apifox-skill-${version}.zip 解压覆盖安装（内含完整运行时）；\n` +
      `  3. 设置环境变量 API2APIFOX_RUNTIME_URL 为可达的镜像/内网直链后重试。`
  );
}

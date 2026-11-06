/**
 * B4（下）：Maven 依赖解析链补测（src/java/jarIndex.ts）。
 *
 * 发现链（discoverMavenRepos）的补测见 jarDiscovery.test.ts；本文件覆盖其后半段：
 *   - parsePomDependencies:scope 过滤、${} 占位跳过、去重
 *   - findJarsForCoordinates:仓库优先级、版本排序(2.10.0 > 2.9.0)、
 *     sources/javadoc 排除、隐藏目录跳过、坐标缺失跳过
 *   - resolveDependencyJars:直接 + 传递依赖(读 jar 内嵌 pom)、maxJars 上限告警、
 *     去重与多轮收敛、坏 jar 内嵌 pom 的告警路径
 *
 * 全部在 os.tmpdir() 下的假仓库布局运行,不读取、不修改真实 ~/.m2。
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { test } from "node:test";
import { findJarsForCoordinates, parsePomDependencies, resolveDependencyJars } from "../java/jarIndex";

/* ---------------- 手拼 zip(STORED)（与 jar.test.ts 同一构造方式） ---------------- */

function buildZip(files: { name: string; data: Buffer; deflate?: boolean }[]): Buffer {
  const parts: Buffer[] = [];
  const central: number[] = [];
  const u2 = (v: number) => [v & 0xff, (v >> 8) & 0xff];
  const u4 = (v: number) => [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff];
  let offset = 0;
  for (const f of files) {
    const nameBuf = Buffer.from(f.name, "utf8");
    const data = f.deflate ? zlib.deflateRawSync(f.data) : f.data;
    const method = f.deflate ? 8 : 0;
    const lfh = Buffer.from([
      ...u4(0x04034b50), ...u2(20), ...u2(0), ...u2(method),
      ...u2(0), ...u2(0), ...u4(0),
      ...u4(data.length), ...u4(f.data.length),
      ...u2(nameBuf.length), ...u2(0),
      ...nameBuf,
    ]);
    parts.push(lfh, data);
    central.push(...u4(0x02014b50), ...u2(20), ...u2(20), ...u2(0), ...u2(method),
      ...u2(0), ...u2(0), ...u4(0), ...u4(data.length), ...u4(f.data.length),
      ...u2(nameBuf.length), ...u2(0), ...u2(0), ...u2(0), ...u2(0), ...u4(0), ...u4(offset),
      ...nameBuf);
    offset += lfh.length + data.length;
  }
  const cdBuf = Buffer.from(central);
  const eocd = Buffer.from([
    ...u4(0x06054b50), ...u2(0), ...u2(0), ...u2(files.length), ...u2(files.length),
    ...u4(cdBuf.length), ...u4(offset), ...u2(0),
  ]);
  return Buffer.concat([...parts, cdBuf, eocd]);
}

function tmpRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-jar-resolve-"));
}

/** 在假仓库里落一个坐标的指定版本 jar(内容任意) */
function putJar(repo: string, group: string, artifact: string, version: string, content: Buffer = Buffer.from([0x50, 0x4b, 0x03, 0x04])): string {
  const dir = path.join(repo, ...group.split("."), artifact, version);
  fs.mkdirSync(dir, { recursive: true });
  const jar = path.join(dir, `${artifact}-${version}.jar`);
  fs.writeFileSync(jar, content);
  return jar;
}

function putVersionDir(repo: string, group: string, artifact: string, version: string): string {
  const dir = path.join(repo, ...group.split("."), artifact, version);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/* ---------------- parsePomDependencies ---------------- */

test("parsePomDependencies:跳过 test/provided scope、跳过 ${} 占位、去重", () => {
  const pom = `
<project>
  <dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId><version>3.0.0</version></dependency>
    <dependency><groupId>junit</groupId><artifactId>junit</artifactId><version>4.13</version><scope>test</scope></dependency>
    <dependency><groupId>jakarta.servlet</groupId><artifactId>jakarta.servlet-api</artifactId><version>6.0</version><scope>provided</scope></dependency>
    <dependency><groupId>\${project.groupId}</groupId><artifactId>internal</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId><version>3.0.0</version></dependency>
    <dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>2.15.0</version></dependency>
  </dependencies>
</project>`;
  assert.deepEqual(parsePomDependencies(pom), [
    { groupId: "org.springframework.boot", artifactId: "spring-boot-starter-web" },
    { groupId: "com.fasterxml.jackson.core", artifactId: "jackson-databind" },
  ]);
});

test("parsePomDependencies:空 pom 与无依赖 pom 返回空数组", () => {
  assert.deepEqual(parsePomDependencies(""), []);
  assert.deepEqual(parsePomDependencies("<project></project>"), []);
});

/* ---------------- findJarsForCoordinates ---------------- */

test("findJarsForCoordinates:多仓库时第一个命中的仓库生效", async () => {
  const root = tmpRoot();
  try {
    const repoA = path.join(root, "repoA");
    const repoB = path.join(root, "repoB");
    const jarA = putJar(repoA, "com.demo", "lib", "1.0.0");
    putJar(repoB, "com.demo", "lib", "1.0.0");
    assert.deepEqual(
      await findJarsForCoordinates([repoA, repoB], [{ groupId: "com.demo", artifactId: "lib" }]),
      [jarA],
      "优先级高的仓库先命中"
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("findJarsForCoordinates:版本自然排序取最新(2.10.0 > 2.9.0),sources/javadoc 不算 jar", async () => {
  const root = tmpRoot();
  try {
    const repo = path.join(root, "repo");
    for (const v of ["2.9.0", "2.10.0", "1.0.0-RELEASE"]) {
      putVersionDir(repo, "com.demo", "lib", v);
      fs.writeFileSync(path.join(repo, "com", "demo", "lib", v, `lib-${v}.jar`), Buffer.from("x"));
    }
    // 最新版本目录里只放 sources/javadoc 变体 → 应回退到 2.9.0
    const newest = path.join(repo, "com", "demo", "lib", "2.10.0");
    fs.rmSync(path.join(newest, "lib-2.10.0.jar"));
    fs.writeFileSync(path.join(newest, "lib-2.10.0-sources.jar"), Buffer.from("x"));
    fs.writeFileSync(path.join(newest, "lib-2.10.0-javadoc.jar"), Buffer.from("x"));
    const found = await findJarsForCoordinates([repo], [{ groupId: "com.demo", artifactId: "lib" }]);
    assert.equal(found.length, 1);
    assert.match(found[0], /lib-2\.9\.0\.jar$/, "最新实体 jar 不可用时回退到次新版本");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("findJarsForCoordinates:隐藏版本目录被跳过,坐标完全缺失返回空", async () => {
  const root = tmpRoot();
  try {
    const repo = path.join(root, "repo");
    putVersionDir(repo, "com.demo", "lib", ".hidden");
    const missing = findJarsForCoordinates([repo], [
      { groupId: "com.demo", artifactId: "lib" },
      { groupId: "com.absent", artifactId: "ghost" },
    ]);
    assert.deepEqual(await missing, []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

/* ---------------- resolveDependencyJars ---------------- */

test("resolveDependencyJars:内嵌 pom 的传递依赖被解析(两轮收敛)", async () => {
  const root = tmpRoot();
  try {
    const repo = path.join(root, "repo");
    // a-1.0.jar 内嵌 pom 依赖 b:b
    const pomOfA = `<project><dependencies><dependency><groupId>com.demo</groupId><artifactId>b</artifactId><version>2.0.0</version></dependency></dependencies></project>`;
    const jarA = putJar(repo, "com.demo", "a", "1.0.0", buildZip([{ name: "META-INF/maven/com.demo/a/pom.xml", data: Buffer.from(pomOfA) }]));
    const jarB = putJar(repo, "com.demo", "b", "2.0.0");
    const r = await resolveDependencyJars([repo], [{ groupId: "com.demo", artifactId: "a" }], { maxRounds: 2 });
    assert.deepEqual(r.jars, [jarA, jarB], "直接依赖 + 传递依赖都要收集");
    assert.deepEqual(r.warnings, []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("resolveDependencyJars:maxJars 上限触发告警并截断", async () => {
  const root = tmpRoot();
  try {
    const repo = path.join(root, "repo");
    const coords = [
      { groupId: "com.demo", artifactId: "a" },
      { groupId: "com.demo", artifactId: "b" },
      { groupId: "com.demo", artifactId: "c" },
    ];
    for (const c of coords) {
      putJar(repo, c.groupId, c.artifactId, "1.0.0");
    }
    const r = await resolveDependencyJars([repo], coords, { maxRounds: 1, maxJars: 2 });
    assert.equal(r.jars.length, 2, "超过上限的部分不收集");
    assert.equal(r.warnings.length, 1);
    assert.match(r.warnings[0], /依赖 jar 数量达到上限 2,忽略 1 个/);
    assert.match(r.warnings[0], /c-1\.0\.0\.jar/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("resolveDependencyJars:仓库无命中返回空且无告警;坏 jar 内嵌 pom 读取失败记告警", async () => {
  const root = tmpRoot();
  try {
    const repo = path.join(root, "repo");
    const empty = await resolveDependencyJars([repo], [{ groupId: "com.absent", artifactId: "ghost" }], { maxRounds: 1 });
    assert.deepEqual(empty.jars, []);
    assert.deepEqual(empty.warnings, []);

    // 有 jar 但不是 zip（无 EOCD）→ 读内嵌 pom 返回 undefined，不产生告警，收集本身不受影响
    putJar(repo, "com.demo", "bad", "1.0.0", Buffer.from("not-a-zip"));
    const r = await resolveDependencyJars([repo], [{ groupId: "com.demo", artifactId: "bad" }], { maxRounds: 2 });
    assert.equal(r.jars.length, 1);
    assert.deepEqual(r.warnings, [], "无 EOCD 的 jar 只是没有内嵌 pom，不是错误");

    // 带 EOCD 但 local header 签名损坏 → 读取内嵌 pom 抛错，走告警分支
    const broken = buildZip([{ name: "META-INF/maven/com.demo/broken/pom.xml", data: Buffer.from("<project/>") }]);
    broken.writeUInt32LE(0, 0); // 抹掉 LFH 签名(0x04034b50)
    putJar(repo, "com.demo", "broken", "1.0.0", broken);
    const rb = await resolveDependencyJars([repo], [{ groupId: "com.demo", artifactId: "broken" }], { maxRounds: 2 });
    assert.equal(rb.jars.length, 1);
    assert.ok(rb.warnings.some((w) => /内嵌 pom 失败/.test(w)), JSON.stringify(rb.warnings));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

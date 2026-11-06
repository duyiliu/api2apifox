/**
 * G6：依赖 jar 解析反例。
 *
 * 矩阵指出的空白：损坏 zip、zip 内非 class 条目、假 class 魔数、
 * 同名类双 jar 的"先注册优先"语义、maxDependencyJars=0。
 * 这些场景直接决定"依赖类型识别失败时是降级还是崩溃"。
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import * as zlib from "node:zlib";
import { JarClassIndex, readZipEntries, readZipEntry, resolveDependencyJars } from "../java/jarIndex";

/* ---------------- 复用手拼 zip / class 工具（与 jar.test.ts 同构，独立维护） ---------------- */

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

/** 最小可解析 class：仅魔数/版本/常量池/this+super 指向 Object，无字段无方法 */
function minimalClass(fqcn: string): Buffer {
  const entries: { tag: number; bytes: number[] }[] = [];
  const utf8 = (s: string) => {
    const b = Buffer.from(s, "utf8");
    entries.push({ tag: 1, bytes: [(b.length >> 8) & 0xff, b.length & 0xff, ...b] });
    return entries.length;
  };
  const cls = (idx: number) => {
    entries.push({ tag: 7, bytes: [(idx >> 8) & 0xff, idx & 0xff] });
    return entries.length;
  };
  const iThis = utf8(fqcn);
  const iThisClass = cls(iThis);
  const iObj = utf8("java/lang/Object");
  const iObjClass = cls(iObj);

  const be2 = (v: number) => [(v >> 8) & 0xff, v & 0xff];
  const be4 = (v: number) => [(v >> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
  const out: number[] = [];
  out.push(...be4(0xcafebabe), ...be2(0), ...be2(52));
  out.push(...be2(entries.length + 1));
  for (const e of entries) out.push(e.tag, ...e.bytes);
  out.push(...be2(0x0001)); // ACC_PUBLIC
  out.push(...be2(iThisClass), ...be2(iObjClass), ...be2(0)); // this/super/interfaces
  out.push(...be2(0)); // fields
  out.push(...be2(0)); // methods
  out.push(...be2(0)); // attributes
  return Buffer.from(out);
}

function tempJar(zip: Buffer, name = `apifox-test-${Date.now()}-${Math.random().toString(36).slice(2)}.jar`): string {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, zip);
  return p;
}

function withIndex(jars: string[], fn: (idx: JarClassIndex) => void): void {
  const idx = JarClassIndex.build(jars);
  try {
    fn(idx);
  } finally {
    // Windows 上未关 fd 会阻止 unlink
    idx.dispose();
  }
}

/* ---------------- 损坏输入 ---------------- */

test("G6 完全不是 zip 的文件：build 不抛异常，warnings 说明读取失败", () => {
  const p = path.join(os.tmpdir(), `apifox-notzip-${Date.now()}.jar`);
  fs.writeFileSync(p, Buffer.from("this is definitely not a zip archive at all"));
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.size, 0);
      assert.ok(idx.warnings.some((w) => w.includes("读取 jar 失败")), idx.warnings.join("|"));
      assert.equal(idx.lookup("Anything"), undefined);
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

test("G6 空文件（0 字节）jar：不抛异常、告警可定位", () => {
  const p = path.join(os.tmpdir(), `apifox-empty-${Date.now()}.jar`);
  fs.writeFileSync(p, Buffer.alloc(0));
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.size, 0);
      assert.ok(idx.warnings.length > 0);
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

test("G6 EOCD 被截断（尾部 20 字节丢失）：不抛异常", () => {
  const full = buildZip([{ name: "com/x/A.class", data: minimalClass("com/x/A") }]);
  const truncated = full.subarray(0, full.length - 20);
  const p = path.join(os.tmpdir(), `apifox-truncated-${Date.now()}.jar`);
  fs.writeFileSync(p, truncated);
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.size, 0);
      assert.ok(idx.warnings.length > 0, "截断 zip 应产生告警");
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

test("G6 jar 文件不存在：告警而非崩溃（配置里写了过期路径是常见情况）", () => {
  const missing = path.join(os.tmpdir(), `apifox-missing-${Date.now()}.jar`);
  withIndex([missing], (idx) => {
    assert.equal(idx.size, 0);
    assert.ok(idx.warnings.some((w) => w.includes("读取 jar 失败")));
  });
});

test("G6 坏 CRC / 数据损坏的 DEFLATE 条目：lookup 返回 undefined 并告警（不抛异常）", () => {
  const good = buildZip([{ name: "com/x/Broken.class", data: minimalClass("com/x/Broken"), deflate: true }]);
  // 破坏压缩数据区：把 local header 之后若干字节改成 0xff
  const corrupted = Buffer.from(good);
  const dataStart = 30 + "com/x/Broken.class".length;
  for (let i = dataStart; i < Math.min(dataStart + 8, corrupted.length); i++) corrupted[i] = 0xff;
  const p = path.join(os.tmpdir(), `apifox-corrupt-${Date.now()}.jar`);
  fs.writeFileSync(p, corrupted);
  try {
    withIndex([p], (idx) => {
      // 索引本身能建（只读 central directory），失败发生在按需解析时
      assert.equal(idx.lookup("Broken"), undefined);
      assert.ok(idx.warnings.some((w) => w.includes("解析") && w.includes("Broken")), idx.warnings.join("|"));
      // 同一 lookup 重复调用不应重复堆叠告警
      idx.lookup("Broken");
      assert.equal(idx.warnings.filter((w) => w.includes("Broken")).length, 1);
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

/* ---------------- 条目过滤 ---------------- */

test("G6 假 class（魔数错误，非 cafebabe）：跳过并告警，不影响同 jar 内其它类", () => {
  const fake = Buffer.from("CAFEBABE-but-not-really-a-class-file");
  const p = tempJar(
    buildZip([
      { name: "com/x/Fake.class", data: fake },
      { name: "com/x/Real.class", data: minimalClass("com/x/Real") },
    ])
  );
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.lookup("Fake"), undefined);
      assert.ok(idx.warnings.some((w) => w.includes("Fake")), idx.warnings.join("|"));
      const real = idx.lookup("Real")!;
      assert.equal(real.qualifiedName, "com.x.Real");
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

test("G6 zip 内非 class 条目（MANIFEST/资源/目录）不进入索引", () => {
  const p = tempJar(
    buildZip([
      { name: "META-INF/MANIFEST.MF", data: Buffer.from("Manifest-Version: 1.0\n") },
      { name: "com/x/logo.png", data: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
      { name: "com/x/data.json", data: Buffer.from("{}") },
      { name: "com/x/Only.class", data: minimalClass("com/x/Only") },
    ])
  );
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.size, 1);
      assert.ok(idx.lookup("Only"));
      assert.equal(idx.lookup("MANIFEST"), undefined);
      assert.equal(idx.lookup("logo"), undefined);
      assert.equal(idx.lookup("data"), undefined);
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

test("G6 module-info.class / package-info.class 被排除", () => {
  const p = tempJar(
    buildZip([
      { name: "module-info.class", data: minimalClass("module-info") },
      { name: "com/x/package-info.class", data: minimalClass("com/x/package-info") },
      { name: "com/x/Keep.class", data: minimalClass("com/x/Keep") },
    ])
  );
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.size, 1);
      assert.ok(idx.lookup("Keep"));
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

test("G6 非法类名条目（含 - 或数字开头）被过滤，不污染索引", () => {
  const p = tempJar(
    buildZip([
      { name: "com/x/invalid-name.class", data: minimalClass("com/x/invalid-name") },
      { name: "com/x/9StartsWithDigit.class", data: minimalClass("com/x/9StartsWithDigit") },
      { name: "com/x/Valid.class", data: minimalClass("com/x/Valid") },
    ])
  );
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.size, 1);
      assert.ok(idx.lookup("Valid"));
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

/* ---------------- 同名类语义 ---------------- */

test("G6 同名类出现在两个 jar：先注册（classpath 靠前）的 jar 优先", () => {
  // 这是 Maven 版本冲突的常见表现：不能随机取，必须是确定性的"首个 jar 生效"
  const first = tempJar(buildZip([{ name: "com/first/Dup.class", data: minimalClass("com/first/Dup") }]), `apifox-a-${Date.now()}.jar`);
  const second = tempJar(buildZip([{ name: "com/second/Dup.class", data: minimalClass("com/second/Dup") }]), `apifox-b-${Date.now()}.jar`);
  try {
    withIndex([first, second], (idx) => {
      assert.equal(idx.lookup("Dup")!.qualifiedName, "com.first.Dup");
    });
    // 顺序调换后结果随之调换，证明是"先注册优先"而不是路径排序
    withIndex([second, first], (idx) => {
      assert.equal(idx.lookup("Dup")!.qualifiedName, "com.second.Dup");
    });
  } finally {
    fs.rmSync(first, { force: true });
    fs.rmSync(second, { force: true });
  }
});

test("G6 同一 jar 内简单类名重复（不同包）也保留首个", () => {
  const p = tempJar(
    buildZip([
      { name: "com/a/Same.class", data: minimalClass("com/a/Same") },
      { name: "com/b/Same.class", data: minimalClass("com/b/Same") },
    ])
  );
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.size, 1);
      assert.equal(idx.lookup("Same")!.qualifiedName, "com.a.Same");
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

test("G6 内部类 $ 形式按简单名去后缀索引", () => {
  const p = tempJar(
    buildZip([
      { name: "com/x/Outer.class", data: minimalClass("com/x/Outer") },
      { name: "com/x/Outer$Inner.class", data: minimalClass("com/x/Outer$Inner") },
    ])
  );
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.size, 2);
      assert.ok(idx.lookup("Inner"), "内部类应能以简单名 Inner 命中");
      assert.equal(idx.lookup("Inner")!.qualifiedName, "com.x.Outer$Inner");
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

/* ---------------- maxDependencyJars 边界 ---------------- */

test("G6 resolveDependencyJars:maxJars=0 时不解析任何依赖且不产生上限告警", () => {
  // 0 的语义是"关闭依赖解析"，不是"到达上限被裁剪"，因此不应有误导性告警
  return resolveDependencyJars([path.join(os.tmpdir(), "no-repo")], [{ groupId: "a", artifactId: "b" }], {
    maxJars: 0,
    maxRounds: 0,
  }).then((res) => {
    assert.deepEqual(res.jars, []);
    assert.deepEqual(res.warnings, []);
  });
});

test("G6 resolveDependencyJars:仓库不存在时返回空结果且不抛异常", async () => {
  const res = await resolveDependencyJars([path.join(os.tmpdir(), `apifox-norepo-${Date.now()}`)], [
    { groupId: "com.x", artifactId: "dep" },
  ]);
  assert.deepEqual(res.jars, []);
  assert.deepEqual(res.warnings, []);
});

test("G6 resolveDependencyJars:maxJars=1 时只保留 1 个并告警列出丢弃项", async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "apifox-repo6-"));
  const mkJar = (artifact: string) => {
    const dir = path.join(repo, "com", "x", artifact, "1.0");
    fs.mkdirSync(dir, { recursive: true });
    const p = path.join(dir, `${artifact}-1.0.jar`);
    fs.writeFileSync(p, buildZip([{ name: `com/x/${artifact}.class`, data: minimalClass(`com/x/${artifact}`) }]));
    return p;
  };
  mkJar("dep-a");
  mkJar("dep-b");
  try {
    const res = await resolveDependencyJars(
      [repo],
      [
        { groupId: "com.x", artifactId: "dep-a" },
        { groupId: "com.x", artifactId: "dep-b" },
      ],
      { maxJars: 1, maxRounds: 0 }
    );
    assert.equal(res.jars.length, 1);
    assert.ok(res.warnings.some((w) => w.includes("上限") && w.includes("dep-b")));
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

/* ---------------- zip 读取器直测 ---------------- */

test("G6 readZipEntries:无 EOCD 抛出可识别错误", () => {
  assert.throws(() => readZipEntries(Buffer.from("not a zip")), /EOCD/);
});

test("G6 readZipEntry:local header 签名错误时抛出含条目名的错误", () => {
  const zip = buildZip([{ name: "com/x/A.class", data: minimalClass("com/x/A") }]);
  const entries = readZipEntries(zip);
  const broken = Buffer.from(zip);
  broken[0] = 0x00; // 破坏 LFH_SIG
  assert.throws(() => readZipEntry(broken, entries[0]), /local header|zip/);
});

test("G6 readZipEntry:不支持的压缩方式（method=12）抛出明确错误", () => {
  const zip = buildZip([{ name: "com/x/A.class", data: minimalClass("com/x/A") }]);
  const entries = readZipEntries(zip);
  const patched = { ...entries[0], method: 12 };
  assert.throws(() => readZipEntry(zip, patched), /不支持的压缩方式/);
});

test("G6 module-info/package-info 不进入索引（双重防线：显式排除 + 类名正则）", () => {
  // 这里断言的是"索引里绝不会出现这两个条目"这一结果。
  // 实现上有两道防线：显式 endsWith 排除，以及 simpleName 必须匹配 /^[A-Za-z_]\w*$/
  // ——"module-info" 含 '-'，本就会被类名正则拦掉（因此变异测试中删除显式排除是等价变异）。
  // 本用例锁定结果不变，避免将来有人放宽类名正则时把这两个条目放进索引。
  const p = tempJar(
    buildZip([
      { name: "module-info.class", data: minimalClass("module-info") },
      { name: "com/x/package-info.class", data: minimalClass("com/x/package-info") },
      { name: "com/x/Normal.class", data: minimalClass("com/x/Normal") },
    ])
  );
  try {
    withIndex([p], (idx) => {
      assert.equal(idx.lookup("module-info"), undefined);
      assert.equal(idx.lookup("module-info.java"), undefined);
      assert.equal(idx.lookup("package-info"), undefined);
      // 索引大小必须是 1：多出来的条目证明有 info 类漏进了索引
      assert.equal(idx.size, 1);
    });
  } finally {
    fs.rmSync(p, { force: true });
  }
});

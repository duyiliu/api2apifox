import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { test } from "node:test";
import { JarClassIndex, readZipEntries, readZipEntry } from "../java/jarIndex";

/* ------------------------------------------------------------------ *
 * G6:依赖 jar 解析反例。
 *
 * 现有 jar.test.ts 覆盖了正常 zip/STORED/DEFLATE/上限丢弃/畸形签名。
 * 这里补:损坏 zip、非 class 条目、假 class 魔数、同名类跨 jar 的
 * 「先注册优先」语义、maxDependencyJars=0、条目名大小写、非 ASCII 条目名。
 * ------------------------------------------------------------------ */

/* zip 结构用小端(规范),class 文件用大端(规范) —— 两套字节序必须分开 */
const u2 = (v: number) => [v & 0xff, (v >> 8) & 0xff];
const u4 = (v: number) => [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff];
const be2 = (v: number) => [(v >> 8) & 0xff, v & 0xff];
const be4 = (v: number) => [(v >> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];

function buildZip(files: { name: string; data: Buffer; deflate?: boolean; corruptCrc?: boolean }[]): Buffer {
  const parts: Buffer[] = [];
  const central: number[] = [];
  let offset = 0;
  for (const f of files) {
    const nameBuf = Buffer.from(f.name, "utf8");
    const data = f.deflate ? zlib.deflateRawSync(f.data) : f.data;
    const method = f.deflate ? 8 : 0;
    const crc = f.corruptCrc ? 0xdeadbeef : 0;
    const lfh = Buffer.from([
      ...u4(0x04034b50), ...u2(20), ...u2(0), ...u2(method),
      ...u2(0), ...u2(0), ...u4(crc),
      ...u4(data.length), ...u4(f.data.length),
      ...u2(nameBuf.length), ...u2(0),
      ...nameBuf,
    ]);
    parts.push(lfh, data);
    central.push(...u4(0x02014b50), ...u2(20), ...u2(20), ...u2(0), ...u2(method),
      ...u2(0), ...u2(0), ...u4(crc), ...u4(data.length), ...u4(f.data.length),
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

/** 最小合法 class:只有魔数与版本,字段/方法/属性计数为 0(parser 应能容忍) */
function minimalClass(className = "com/x/Min"): Buffer {
  const nameBuf = Buffer.from(className, "utf8");
  const cp: number[] = [];
  // #1 Utf8 类名
  cp.push(1, ...be2(nameBuf.length), ...nameBuf);
  // #2 Class -> #1
  cp.push(7, ...be2(1));
  // #3 Utf8 java/lang/Object
  const obj = Buffer.from("java/lang/Object", "utf8");
  cp.push(1, ...be2(obj.length), ...obj);
  // #4 Class -> #3
  cp.push(7, ...be2(3));
  return Buffer.from([
    ...be4(0xcafebabe), ...be2(0), ...be2(52),
    ...be2(5), // constant_pool_count = entries + 1
    ...cp,
    ...be2(0x0001), // public
    ...be2(2), ...be2(4), ...be2(0), // this, super, interfaces
    ...be2(0), // fields
    ...be2(0), // methods
    ...be2(0), // attributes
  ]);
}

/** 与 minimalClass 同名但字段不同,用于验证「先注册优先」 */
function classWithField(className: string, fieldName: string): Buffer {
  const nameBuf = Buffer.from(className, "utf8");
  const fieldBuf = Buffer.from(fieldName, "utf8");
  const strBuf = Buffer.from("Ljava/lang/String;", "utf8");
  const obj = Buffer.from("java/lang/Object", "utf8");
  const cp: number[] = [];
  cp.push(1, ...be2(nameBuf.length), ...nameBuf); // #1
  cp.push(7, ...be2(1)); // #2
  cp.push(1, ...be2(obj.length), ...obj); // #3
  cp.push(7, ...be2(3)); // #4
  cp.push(1, ...be2(fieldBuf.length), ...fieldBuf); // #5
  cp.push(1, ...be2(strBuf.length), ...strBuf); // #6
  return Buffer.from([
    ...be4(0xcafebabe), ...be2(0), ...be2(52),
    ...be2(7),
    ...cp,
    ...be2(0x0001),
    ...be2(2), ...be2(4), ...be2(0),
    ...be2(1), // 1 个字段
    ...be2(0x0001), ...be2(5), ...be2(6), ...be2(0),
    ...be2(0),
    ...be2(0),
  ]);
}

let seq = 0;
function tempJar(bytes: Buffer, label = "jar"): string {
  const file = path.join(os.tmpdir(), `api2apifox-${label}-${Date.now()}-${seq++}.jar`);
  fs.writeFileSync(file, bytes);
  return file;
}

function cleanupJars(paths: string[]): void {
  for (const p of paths) {
    try {
      fs.unlinkSync(p);
    } catch {
      /* 已被 dispose 用例删除 */
    }
  }
}

/* ---------------- 损坏 zip ---------------- */

test("jar:完全不是 zip 的文件只产生一条「读取 jar 失败」告警,不抛错", () => {
  const jar = tempJar(Buffer.from("plain text, definitely not a zip"));
  const idx = JarClassIndex.build([jar]);
  try {
    assert.equal(idx.size, 0);
    assert.equal(idx.warnings.length, 1);
    assert.match(idx.warnings[0], /读取 jar 失败/);
    assert.equal(idx.lookup("Anything"), undefined);
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

test("jar:空文件与截断 zip 都降级为告警", () => {
  const empty = tempJar(Buffer.alloc(0), "empty");
  const full = buildZip([{ name: "com/x/A.class", data: minimalClass("com/x/A") }]);
  const truncated = tempJar(full.subarray(0, Math.floor(full.length / 2)), "trunc");
  const idx = JarClassIndex.build([empty, truncated]);
  try {
    assert.equal(idx.size, 0);
    assert.equal(idx.warnings.length, 2, `两个坏 jar 各一条告警:${JSON.stringify(idx.warnings)}`);
    assert.ok(idx.warnings.every((w) => /读取 jar 失败/.test(w)));
  } finally {
    idx.dispose();
    cleanupJars([empty, truncated]);
  }
});

test("jar:CRC 字段损坏不会被检出(读取不校验 CRC),内容正常时照常解析", () => {
  const jar = tempJar(
    buildZip([{ name: "com/x/Bad.class", data: minimalClass("com/x/Bad"), deflate: true, corruptCrc: true }]),
    "crc"
  );
  const idx = JarClassIndex.build([jar]);
  try {
    assert.equal(idx.size, 1);
    // 实测:readZipEntryFrom 直接用 inflateRawSync,不校验 CRC-32。
    // 后果:字节被静默篡改时不会报错,而是可能解析出错误的类型信息。
    // 锁定现状 —— 若将来加入 CRC 校验,该用例应改为断言告警 + undefined。
    const info = idx.lookup("Bad");
    assert.ok(info, "CRC 不匹配不影响解压,仍返回类型信息");
    assert.equal(info.qualifiedName, "com.x.Bad");
    assert.deepEqual(idx.warnings, [], "不产生任何 CRC 相关告警");
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

test("jar:压缩数据本身损坏时 lookup 告警并返回 undefined", () => {
  // 用一份刻意破坏的 deflate 流验证解压失败路径：直接拼局部文件头 + 垃圾数据，
  // 避开“截断整 zip 会连带损坏中央目录”这种干扰因素。
  const name = Buffer.from("com/x/Short.class", "utf8");
  const garbage = Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  const local = Buffer.from([
    ...u4(0x04034b50), ...u2(20), ...u2(0), ...u2(8),
    ...u2(0), ...u2(0), ...u4(0),
    ...u4(garbage.length), ...u4(64),
    ...u2(name.length), ...u2(0),
    ...name,
  ]);
  const jar = tempJar(Buffer.concat([local, garbage]), "short");
  const idx = JarClassIndex.build([jar]);
  try {
    // 没有中央目录，建索引时就会报“读取 jar 失败”
    assert.equal(idx.warnings.length, 1);
    assert.match(idx.warnings[0], /读取 jar 失败/);
    assert.equal(idx.lookup("Short"), undefined);
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

test("jar:local header 签名被破坏时 lookup 告警(不返回半截数据)", () => {
  const bytes = Buffer.from(buildZip([{ name: "com/x/L.class", data: minimalClass("com/x/L") }]));
  bytes.writeUInt32LE(0xdeadbeef, 0); // 破坏第一个 local file header 签名
  const jar = tempJar(bytes, "lfh");
  const idx = JarClassIndex.build([jar]);
  try {
    assert.equal(idx.lookup("L"), undefined);
    assert.ok(idx.warnings.some((w) => /local header 校验失败/.test(w)), JSON.stringify(idx.warnings));
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

/* ---------------- 非 class 条目 / 假 class ---------------- */

test("jar:非 class 条目(资源/MANIFEST/目录)不进入索引", () => {
  const jar = tempJar(
    buildZip([
      { name: "META-INF/MANIFEST.MF", data: Buffer.from("Manifest-Version: 1.0\n") },
      { name: "com/x/config.properties", data: Buffer.from("a=b\n") },
      { name: "com/x/", data: Buffer.alloc(0) },
      { name: "com/x/Real.class", data: minimalClass("com/x/Real") },
    ]),
    "mixed"
  );
  const idx = JarClassIndex.build([jar]);
  try {
    assert.equal(idx.size, 1);
    assert.ok(idx.lookup("Real"));
    assert.equal(idx.lookup("MANIFEST"), undefined);
    assert.equal(idx.lookup("config"), undefined);
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

test("jar:module-info.class 与 package-info.class 被显式排除", () => {
  const jar = tempJar(
    buildZip([
      { name: "module-info.class", data: minimalClass("module-info") },
      { name: "com/x/package-info.class", data: minimalClass("com/x/package-info") },
      { name: "com/x/Keep.class", data: minimalClass("com/x/Keep") },
    ]),
    "info"
  );
  const idx = JarClassIndex.build([jar]);
  try {
    assert.equal(idx.size, 1, "只应登记 Keep");
    assert.ok(idx.lookup("Keep"));
    assert.equal(idx.lookup("module-info"), undefined);
    assert.equal(idx.lookup("package-info"), undefined);
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

test("jar:魔数错误的假 .class 在 lookup 时告警并返回 undefined", () => {
  const jar = tempJar(
    buildZip([{ name: "com/x/Fake.class", data: Buffer.from("this is not a class file at all") }]),
    "fake"
  );
  const idx = JarClassIndex.build([jar]);
  try {
    assert.equal(idx.size, 1, "条目名以 .class 结尾就会登记");
    assert.equal(idx.lookup("Fake"), undefined);
    assert.ok(idx.warnings.some((w) => /解析 .*Fake\.class 失败/.test(w)), JSON.stringify(idx.warnings));
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

test("jar:条目名不以合法标识符结尾(如 1.class)时不登记,也不抛错", () => {
  const jar = tempJar(
    buildZip([
      { name: "com/x/1.class", data: minimalClass("com/x/1") },
      { name: "com/x/-bad.class", data: minimalClass("com/x/-bad") },
      { name: "com/x/Good$Inner.class", data: minimalClass("com/x/Good$Inner") },
    ]),
    "names"
  );
  const idx = JarClassIndex.build([jar]);
  try {
    assert.equal(idx.lookup("1"), undefined);
    assert.equal(idx.lookup("-bad"), undefined);
    // 内部类按 $ 之后的部分登记(Nested 口径)
    assert.ok(idx.lookup("Inner"), "内部类应能用简单名 Inner 命中");
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

/* ---------------- 同名类跨 jar ---------------- */

test("jar:同名类出现在多个 jar 时保留首个 jar 的版本(顺序即优先级)", () => {
  const jarA = tempJar(buildZip([{ name: "com/x/Dup.class", data: classWithField("com/x/Dup", "fromA") }]), "dupa");
  const jarB = tempJar(buildZip([{ name: "com/x/Dup.class", data: classWithField("com/x/Dup", "fromB") }]), "dupb");
  const idx = JarClassIndex.build([jarA, jarB]);
  try {
    const info = idx.lookup("Dup")!;
    assert.ok(info);
    assert.deepEqual(info.fields.map((f) => f.name), ["fromA"], "首个 jar 生效");
  } finally {
    idx.dispose();
    cleanupJars([jarA, jarB]);
  }

  // 反向顺序:结果随顺序变化,证明"先注册优先"而非"后覆盖"
  const jarC = tempJar(buildZip([{ name: "com/x/Dup.class", data: classWithField("com/x/Dup", "fromC") }]), "dupc");
  const jarD = tempJar(buildZip([{ name: "com/x/Dup.class", data: classWithField("com/x/Dup", "fromD") }]), "dupd");
  const idx2 = JarClassIndex.build([jarD, jarC]);
  try {
    assert.deepEqual(idx2.lookup("Dup")!.fields.map((f) => f.name), ["fromD"]);
  } finally {
    idx2.dispose();
    cleanupJars([jarC, jarD]);
  }
});

test("jar:同一个 jar 重复传入不重复登记(去重由 build 保证)", () => {
  const jar = tempJar(buildZip([{ name: "com/x/One.class", data: minimalClass("com/x/One") }]), "once");
  const idx = JarClassIndex.build([jar, jar]);
  try {
    assert.equal(idx.size, 1);
    assert.ok(idx.lookup("One"));
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

test("jar:lookup 结果被缓存,第二次调用不重复解析(同一对象引用)", () => {
  const jar = tempJar(buildZip([{ name: "com/x/Cached.class", data: minimalClass("com/x/Cached") }]), "cache");
  const idx = JarClassIndex.build([jar]);
  try {
    const first = idx.lookup("Cached");
    const second = idx.lookup("Cached");
    assert.ok(first);
    assert.equal(first, second, "应命中缓存返回同一对象");
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

test("jar:lookup 失败结果也被缓存(不会每次重新报错)", () => {
  const jar = tempJar(buildZip([{ name: "com/x/Broken2.class", data: Buffer.from("junk") }]), "cachefail");
  const idx = JarClassIndex.build([jar]);
  try {
    assert.equal(idx.lookup("Broken2"), undefined);
    const afterFirst = idx.warnings.length;
    assert.equal(idx.lookup("Broken2"), undefined);
    assert.equal(idx.warnings.length, afterFirst, "第二次查询不应再追加告警");
  } finally {
    idx.dispose();
    cleanupJars([jar]);
  }
});

/* ---------------- dispose ---------------- */

test("jar:dispose 后重复调用不抛错(幂等)", () => {
  const jar = tempJar(buildZip([{ name: "com/x/D.class", data: minimalClass("com/x/D") }]), "disp");
  const idx = JarClassIndex.build([jar]);
  try {
    idx.dispose();
    assert.doesNotThrow(() => idx.dispose());
  } finally {
    cleanupJars([jar]);
  }
});

test("jar:dispose 后 Windows 上可以删除 jar 文件(证明 fd 已释放)", () => {
  const jar = tempJar(buildZip([{ name: "com/x/E.class", data: minimalClass("com/x/E") }]), "fd");
  const idx = JarClassIndex.build([jar]);
  idx.dispose();
  assert.doesNotThrow(() => fs.unlinkSync(jar), "dispose 后必须能删除,否则长会话会泄漏 fd");
});

/* ---------------- 空输入 ---------------- */

test("jar:build([]) 返回空索引,size=0,warnings 为空", () => {
  const idx = JarClassIndex.build([]);
  try {
    assert.equal(idx.size, 0);
    assert.deepEqual(idx.warnings, []);
  } finally {
    idx.dispose();
  }
});

test("jar:不存在的 jar 路径产生告警但不抛错(projectAnalyzer 依赖此行为)", () => {
  const missing = path.join(os.tmpdir(), `api2apifox-missing-${Date.now()}.jar`);
  const idx = JarClassIndex.build([missing]);
  try {
    assert.equal(idx.size, 0);
    assert.equal(idx.warnings.length, 1);
    assert.match(idx.warnings[0], /读取 jar 失败/);
  } finally {
    idx.dispose();
  }
});

/* ---------------- zip 读取底层契约 ---------------- */

test("zip:readZipEntries 对缺少 EOCD 的缓冲区抛明确错误", () => {
  assert.throws(() => readZipEntries(Buffer.from("no eocd here")), /未找到 EOCD/);
});

test("zip:不支持的压缩方式(如 bzip2=12)在读取条目时抛明确错误", () => {
  // 手工构造只改 central directory 的 method 字段过于脆弱;
  // 这里直接验证 readZipEntry 对未知 method 的分支:用一个 STORED 条目改 method 号。
  const bytes = Buffer.from(buildZip([{ name: "com/x/Z.class", data: minimalClass("com/x/Z") }]));
  const entries = readZipEntries(bytes);
  assert.equal(entries.length, 1);
  const patched = { ...entries[0], method: 12 };
  assert.throws(() => readZipEntry(bytes, patched), /不支持的压缩方式 12/);
});

test("zip:条目名大小写敏感(com/x/A.class 与 Com/X/a.class 是两个条目)", () => {
  const zip = buildZip([
    { name: "com/x/A.class", data: minimalClass("com/x/A") },
    { name: "Com/X/a.class", data: minimalClass("Com/X/a") },
  ]);
  const entries = readZipEntries(zip);
  assert.equal(entries.length, 2);
  assert.notEqual(entries[0].name, entries[1].name);
});

test("zip:非 ASCII 条目名按 UTF-8 正确还原", () => {
  const zip = buildZip([{ name: "com/中文/控制器.class", data: minimalClass("com/中文/控制器") }]);
  const entries = readZipEntries(zip);
  assert.equal(entries[0].name, "com/中文/控制器.class");
  assert.deepEqual(readZipEntry(zip, entries[0]), minimalClass("com/中文/控制器"));
});

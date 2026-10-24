import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { test } from "node:test";
import { parseClassSignature, parseFieldSignature, sigToText } from "../java/descriptor";
import { parseClassFile } from "../java/classFile";
import { JarClassIndex, readZipEntries, readZipEntry } from "../java/jarIndex";

/* ---------------- descriptor / signature ---------------- */

test("signature:字段类型变量与泛型", () => {
  assert.equal(sigToText(parseFieldSignature("TE;")!), "E");
  assert.equal(sigToText(parseFieldSignature("Ljava/lang/String;")!), "java.lang.String");
  assert.equal(sigToText(parseFieldSignature("Ljava/util/List<Ljava/lang/Long;>;")!), "java.util.List<java.lang.Long>");
  assert.equal(sigToText(parseFieldSignature("[Ljava/lang/String;")!), "java.lang.String[]");
  assert.equal(sigToText(parseFieldSignature("[TE;")!), "E[]");
  assert.equal(sigToText(parseFieldSignature("Ljava/util/Map<Ljava/lang/String;Ljava/util/List<TT;>;>;")!), "java.util.Map<java.lang.String, java.util.List<T>>");
});

test("signature:类签名解析泛型形参与父类", () => {
  const cs = parseClassSignature("<T:Ljava/lang/Object;>Ljava/lang/Object;")!;
  assert.deepEqual(cs.typeParams, ["T"]);
  assert.equal(cs.superSig && sigToText(cs.superSig), "java.lang.Object");

  const cs2 = parseClassSignature("<E:Ljava/lang/Object;>Lcom/x/Base<TE;>;")!;
  assert.deepEqual(cs2.typeParams, ["E"]);
  assert.equal(cs2.superSig && sigToText(cs2.superSig), "com.x.Base<E>");
});

/* ---------------- 手拼 .class(无外部依赖的字节码样例) ---------------- */

/** 构造最小 Demo.class:泛型 <T>,字段 data:T(Signature),字段 name:String 带 @com.anno.Label(value="姓名") */
function buildDemoClassExplicit(): Buffer {
  // 常量池条目(1-based):手动编号
  const entries: { tag: number; bytes: number[] }[] = [];
  const utf8Idx = (s: string) => {
    const b = Buffer.from(s, "utf8");
    // class 常量池整数为大端
    entries.push({ tag: 1, bytes: [(b.length >> 8) & 0xff, b.length & 0xff, ...b] });
    return entries.length;
  };
  const classIdx = (nameUtf8Idx: number) => {
    entries.push({ tag: 7, bytes: [(nameUtf8Idx >> 8) & 0xff, nameUtf8Idx & 0xff] });
    return entries.length;
  };

  // 注意顺序:Utf8 与 Class 穿插,索引按 push 顺序
  const iThis = utf8Idx("com/x/Demo");
  const iThisClass = classIdx(iThis);
  const iObj = utf8Idx("java/lang/Object");
  const iObjClass = classIdx(iObj);
  const iData = utf8Idx("data");
  const iDataDesc = utf8Idx("Ljava/lang/Object;");
  const iSig = utf8Idx("TT;"); // 类型变量 T(标记 T + 形参名 T)
  const iSigAttr = utf8Idx("Signature");
  const iName = utf8Idx("name");
  const iNameDesc = utf8Idx("Ljava/lang/String;");
  const iRva = utf8Idx("RuntimeVisibleAnnotations");
  const iLabel = utf8Idx("Lcom/anno/Label;");
  const iValue = utf8Idx("value");
  const iNameZh = utf8Idx("姓名");
  const iClassSig = utf8Idx("<T:Ljava/lang/Object;>Ljava/lang/Object;");

  const be2 = (v: number) => [(v >> 8) & 0xff, v & 0xff];
  const be4 = (v: number) => [(v >> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];

  const out: number[] = [];
  // class 文件为大端
  out.push(...be4(0xcafebabe), ...be2(0), ...be2(52));
  out.push(...be2(entries.length + 1));
  for (const e of entries) {
    out.push(e.tag, ...e.bytes);
  }
  out.push(...be2(0x0001)); // ACC_PUBLIC
  out.push(...be2(iThisClass), ...be2(iObjClass), ...be2(0)); // this/super/interfaces

  // fields:2 个
  out.push(...be2(2));
  // field data:T(access private=0x0002,无注解)
  out.push(...be2(0x0002), ...be2(iData), ...be2(iDataDesc), ...be2(1)); // 1 attr
  out.push(...be2(iSigAttr), ...be4(2), ...be2(iSig));
  // field name:String 带 @Label(value="姓名")
  const annBody = [
    ...be2(1), // num_annotations
    ...be2(iLabel), // annotation type
    ...be2(1), // num pairs
    ...be2(iValue), // pair name
    0x73, // tag 's'
    ...be2(iNameZh), // utf8 index
  ];
  out.push(...be2(0x0002), ...be2(iName), ...be2(iNameDesc), ...be2(1));
  out.push(...be2(iRva), ...be4(annBody.length), ...annBody);

  // methods:0
  out.push(...be2(0));
  // class attrs:1(Signature)
  out.push(...be2(1));
  out.push(...be2(iSigAttr), ...be4(2), ...be2(iClassSig));

  return Buffer.from(out);
}

test("classFile:解析手拼 Demo.class(泛型/字段/注解值)", () => {
  const pc = parseClassFile(buildDemoClassExplicit());
  assert.equal(pc.fqcn, "com.x.Demo");
  assert.equal(pc.kind, "class");
  assert.deepEqual(pc.typeParams, ["T"]);
  const data = pc.fields.find((f) => f.name === "data")!;
  assert.equal(data.typeText, "T");
  const name = pc.fields.find((f) => f.name === "name")!;
  assert.equal(name.typeText, "java.lang.String");
  assert.equal(name.annotations.length, 1);
  assert.equal(name.annotations[0].name, "Label");
  assert.equal(name.annotations[0].args.value, "姓名");
});

/* ---------------- 手拼 zip(STORED) ---------------- */

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

test("zip:STORED 与 DEFLATE 读取", () => {
  const demo = buildDemoClassExplicit();
  const zip = buildZip([
    { name: "META-INF/MANIFEST.MF", data: Buffer.from("Manifest-Version: 1.0\n") },
    { name: "com/x/Demo.class", data: demo, deflate: true },
  ]);
  const entries = readZipEntries(zip);
  assert.equal(entries.length, 2);
  const cls = entries.find((e) => e.name.endsWith(".class"))!;
  const bytes = readZipEntry(zip, cls);
  assert.deepEqual(bytes, demo);
});

test("JarClassIndex:按需解析 zip 内 .class", () => {
  const zipPath = `${require("os").tmpdir()}/apifox-helper-test-${Date.now()}.jar`;
  fs.writeFileSync(zipPath, buildZip([
    { name: "com/x/Demo.class", data: buildDemoClassExplicit(), deflate: true },
  ]));
  const idx = JarClassIndex.build([zipPath]);
  try {
    const info = idx.lookup("Demo")!;
    assert.ok(info);
    assert.equal(info.qualifiedName, "com.x.Demo");
    assert.deepEqual(info.typeParams, ["T"]);
    const nameField = info.fields.find((f) => f.name === "name")!;
    assert.equal(nameField.annotations[0].args.value, "姓名");
    assert.equal(idx.lookup("不存在"), undefined);
  } finally {
    // 索引持有 jar fd,Windows 上未关闭会阻塞 unlink
    idx.dispose();
    fs.unlinkSync(zipPath);
  }
});

/* ---------------- 真实环境 jar(存在才跑) ---------------- */

const EXT_JAR = "D:/repository/ext/plus/extreme-common-core/2.2.0/extreme-common-core-2.2.0.jar";

test("真实 jar:ResponseDto 解析(本机存在才执行)", { skip: !fs.existsSync(EXT_JAR) }, () => {
  const idx = JarClassIndex.build([EXT_JAR]);
  try {
    const info = idx.lookup("ResponseDto")!;
    assert.ok(info, "应找到 ResponseDto");
    assert.equal(info.kind, "class");
    assert.ok(info.typeParams.includes("T"));
    const names = info.fields.map((f) => f.name);
    assert.ok(names.includes("data"), names.join(","));
  } finally {
    idx.dispose();
  }
});

test("自动发现:无需配置即可找到本机 Maven 仓库(存在 IDEA 配置时)", { skip: !fs.existsSync(EXT_JAR) }, async (t) => {
  const { discoverMavenRepos } = require("../java/jarIndex");
  const repos = await discoverMavenRepos([]);
  t.diagnostic("发现仓库: " + repos.join(" | "));
  assert.ok(repos.some((r: string) => r.replace(/\\/g, "/") === "D:/repository"), "应自动发现 D:/repository: " + repos.join(","));
});

test("resolveDependencyJars:达到上限时告警列出被丢弃的 jar", async () => {
  const { resolveDependencyJars } = require("../java/jarIndex");
  const os = require("os");
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-repo-"));
  const mkJar = (artifact: string, version: string) => {
    const dir = path.join(repo, "com", "x", artifact, version);
    fs.mkdirSync(dir, { recursive: true });
    const jarPath = path.join(dir, `${artifact}-${version}.jar`);
    fs.writeFileSync(jarPath, buildZip([{ name: "com/x/Fake.class", data: buildDemoClassExplicit() }]));
    return jarPath;
  };
  mkJar("dep-a", "1.0");
  mkJar("dep-b", "1.0");

  const res = await resolveDependencyJars(
    [repo],
    [
      { groupId: "com.x", artifactId: "dep-a" },
      { groupId: "com.x", artifactId: "dep-b" },
    ],
    { maxJars: 1, maxRounds: 0 }
  );
  assert.equal(res.jars.length, 1);
  assert.ok(res.jars[0].endsWith("dep-a-1.0.jar"), "直接依赖按坐标顺序优先保留");
  const warn = res.warnings.find((w: string) => w.includes("上限"));
  assert.ok(warn, "应产生上限告警");
  assert.ok(warn.includes("dep-b-1.0.jar"), "告警应列出被丢弃的 jar: " + warn);
  assert.ok(warn.includes("maxDependencyJars"), "告警应给出可调口径: " + warn);
});

/* ---------------- 畸形签名回归(此前死循环 OOM) ---------------- */

test("signature:畸形输入(缺 > / 缺 ;)正常返回,不死循环", () => {
  // 泛型 < 未闭合:此前 peek 恒为空串导致 args 无限累积直到 OOM
  const unclosed = parseFieldSignature("Ljava/util/List<");
  assert.ok(unclosed);
  assert.equal(unclosed.name, "java.util.List");
  // 类型变量 ; 缺失:读到串尾即止
  const unterminatedVar = parseFieldSignature("TX");
  assert.ok(unterminatedVar);
  // 类签名 > 未闭合:容错读到串尾为止,不死循环、返回可用的部分结果
  const cs = parseClassSignature("<E:Ljava/lang/Object;Ljava/util/List<");
  assert.ok(cs);
  assert.ok(cs.typeParams.includes("E"));
  // 合法类签名:形参与父类解析不受影响
  const ok = parseClassSignature("<E:Ljava/lang/Object;>Ljava/util/List<Ljava/lang/String;>;")!;
  assert.deepEqual(ok.typeParams, ["E"]);
  assert.equal(sigToText(ok.superSig!), "java.util.List<java.lang.String>");
  // 正常输入不受影响
  assert.equal(sigToText(parseFieldSignature("Ljava/util/List<Ljava/lang/Long;>;")!), "java.util.List<java.lang.Long>");
});

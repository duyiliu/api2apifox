import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { test } from "node:test";
import { analyze } from "../pipeline";
import { AnnotationInfo, SourceFile } from "../java/model";
import { evalCondition, evalRuleValue, RuleContext, RuleEvalResult } from "../java/ruleEval";
import { loadPropertiesFiles } from "../config/helperProperties";

/**
 * G8:groovy/js 白名单安全回归集(独立文件,既有 rules/properties.test 禁改)。
 *
 * 验收口径(矩阵 §7 DoD 第 3 条):恶意脚本必须「skipped + 告警文案 + 不执行」,
 * 而不是只看 skipped 文案。"不执行"的证明方式:
 *  - 脚本中携带对本机临时目录 canary 文件的写入调用(new File/writeFileSync/exec 等),
 *    求值后断言 canary 文件不存在;
 *  - System.exit/反射类以「测试进程仍然活着继续执行后续断言」为证;
 *  - 白名单外表达式一律不允许部分求值:结果 value 必须为 undefined。
 */

const NOOP = () => {};

const DIC: AnnotationInfo = { name: "DataDic", raw: '@DataDic(value = "FMJG")', args: { value: "FMJG" } };

function ctx(over: Partial<RuleContext> = {}): RuleContext {
  return { annotations: [DIC], javadocRaw: "/** @doc x */", subject: "类 Demo 的字段 f", ...over };
}

/** canary 文件:每次调用唯一;安全求值绝不允许创建它 */
function canaryFile(): string {
  return path
    .join(os.tmpdir(), `api2apifox-g8-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`)
    .replace(/\\/g, "/");
}

function assertSkipped(r: RuleEvalResult, key = "field.doc"): void {
  assert.equal(r.matched, true, JSON.stringify(r));
  assert.equal(r.skipped, true, JSON.stringify(r));
  assert.equal(r.value, undefined, "白名单外表达式不允许产出任何值");
  assert.ok(r.reason, "必须有告警原因");
  assert.match(r.reason!, new RegExp(`${key} `));
  assert.match(r.reason!, /无法在无脚本运行时下安全执行/);
}

function evalSkipped(script: string, key = "field.doc", over: Partial<RuleContext> = {}): RuleEvalResult {
  const r = evalRuleValue(`groovy: ${script}`, ctx(over), key, NOOP);
  assertSkipped(r, key);
  return r;
}

/* ---------- 值层面的绕过集:全部 skipped + 不执行 ---------- */

test("G8:System.exit → skipped+告警,求值进程未被终止", () => {
  evalSkipped("System.exit(1)");
  evalSkipped('System.exit(1); "done"'); // 多语句同样整体拒绝
  // 能继续执行到这里,本身就是 System.exit 未被调用的证明
});

test("G8:new File 写文件 → 不执行(canary 不出现)", () => {
  const canary = canaryFile();
  try {
    evalSkipped(`new File("${canary}").text = "pwned"`);
    evalSkipped(`def s = "x"; new File("${canary}").text = "pwned"; s`); // 分号多语句
    evalSkipped(`new File("${canary}").write("pwned")`);
    assert.equal(fs.existsSync(canary), false, "canary 文件被创建 = 规则体被执行");
  } finally {
    fs.rmSync(canary, { force: true });
  }
});

test("G8:Runtime/exec 外部进程调用 → 不执行", () => {
  const canary = canaryFile();
  try {
    evalSkipped(`Runtime.getRuntime().exec("cmd /c echo pwned > ${canary}")`);
    evalSkipped('"cmd".execute()');
    evalSkipped('["cmd","/c","ver"].execute().text');
    assert.equal(fs.existsSync(canary), false);
  } finally {
    fs.rmSync(canary, { force: true });
  }
});

test("G8:反射与类加载器逃逸 → 不执行", () => {
  evalSkipped('Class.forName("java.lang.System").getMethod("exit", Integer.TYPE).invoke(null, 1)');
  evalSkipped('this.class.classLoader.loadClass("java.lang.System")');
  evalSkipped('Thread.currentThread().getContextClassLoader().loadClass("java.lang.Runtime")');
});

test("G8:js: 前缀一律不执行(无脚本运行时,不存在 eval 通道)", () => {
  const canary = canaryFile();
  try {
    const writeFile = evalRuleValue(`js: require("fs").writeFileSync("${canary}", "pwned")`, ctx(), "field.doc", NOOP);
    assertSkipped(writeFile);
    const exit = evalRuleValue("js: System.exit(1)", ctx(), "field.doc", NOOP);
    assertSkipped(exit);
    assert.equal(fs.existsSync(canary), false);
  } finally {
    fs.rmSync(canary, { force: true });
  }
});

test("G8:三元分支内藏副作用 → 整体拒绝,不部分求值", () => {
  const canary = canaryFile();
  try {
    evalSkipped(`true ? new File("${canary}").text : null`);
    evalSkipped(`it.hasAnn("DataDic") ? it.ann("DataDic","value") + new File("${canary}").text : null`);
    assert.equal(fs.existsSync(canary), false);
  } finally {
    fs.rmSync(canary, { force: true });
  }
});

test("G8:安全拼接中混入白名单外片段 → 不产出部分拼接值", () => {
  const r = evalSkipped('"（框架字典：" + it.ann("DataDic","value") + "）" + Runtime.getRuntime().exec("x")');
  assert.equal(r.value, undefined);
});

test("G8:it.ann 参数必须为字面量,动态/嵌套调用拒绝", () => {
  evalSkipped('it.ann("DataDic", it.name())');
  evalSkipped('it.ann(getKey(), "value")');
});

test("G8:``` 多行包装的副作用脚本 → 不执行", () => {
  const canary = canaryFile();
  try {
    const r = evalRuleValue(`groovy: \`\`\`\nnew File("${canary}").text = "pwned"\n\`\`\``, ctx(), "field.doc", NOOP);
    assertSkipped(r);
    assert.equal(fs.existsSync(canary), false);
  } finally {
    fs.rmSync(canary, { force: true });
  }
});

/* ---------- 条件层面的绕过集 ---------- */

test("G8:groovy/js 条件一律 unsupported,不执行", () => {
  const canary = canaryFile();
  try {
    const conds = [
      "groovy: System.exit(1)",
      `groovy: new File("${canary}").text = "pwned"`,
      `js: require("fs").writeFileSync("${canary}", "pwned")`,
      "groovy: it.hasAnn('X')",
    ];
    for (const cond of conds) {
      const r = evalCondition(cond, ctx(), "ignore", NOOP);
      assert.equal(r.supported, false, cond);
      assert.equal(r.hit, false, cond);
    }
    assert.equal(fs.existsSync(canary), false);
  } finally {
    fs.rmSync(canary, { force: true });
  }
});

/* ---------- 白名单回归:不扩大拒绝面 ---------- */

test("G8:白名单内安全形态仍然求值(防线不得误伤既有用法)", () => {
  const concat = evalRuleValue('groovy: "（框架字典：" + it.ann("DataDic","value") + "）"', ctx(), "field.doc", NOOP);
  assert.equal(concat.matched, true);
  assert.equal(concat.value, "（框架字典：FMJG）");
  assert.notEqual(concat.skipped, true);

  const ternHit = evalRuleValue('groovy: it.hasAnn("DataDic") ? it.ann("DataDic","value") : null', ctx(), "field.doc", NOOP);
  assert.equal(ternHit.value, "FMJG");

  // 条件假分支:条件可求值为 false 时静默不产出(而非 skipped)。
  // 注意条件必须用外层括号包住,否则 `?.` 里的 ? 会被顶层三元探测误判(既有行为)。
  const camel = 'groovy: (it.name()?.length() > 0 && Character.isLowerCase(it.name().charAt(0))) ? "小驼峰字段" : null';
  const ternFalse = evalRuleValue(camel, ctx({ fieldName: "Age" }), "field.doc", NOOP);
  assert.equal(ternFalse.matched, false, "条件为假 → 静默未命中");
  assert.notEqual(ternFalse.skipped, true);
  const ternTrue = evalRuleValue(camel, ctx({ fieldName: "age" }), "field.doc", NOOP);
  assert.equal(ternTrue.value, "小驼峰字段");
});

/* ---------- 端到端:规则告警进入 pipeline warnings,canary 不落盘 ---------- */

const DTO = `
package com.example;

import io.swagger.annotations.ApiModelProperty;

public class PatientProfile {
  /** 分娩机构代码 */
  @ApiModelProperty("分娩机构代码")
  private String fmjgbm;

  @ApiModelProperty("性别")
  private String genderCode;
}
`;

const CTL = `
package com.example;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
public class PatientProfileController {
  /** 分页查询患者档案
   * @folder 档案管理
   */
  @GetMapping
  public PatientProfile getProfile(PatientProfile profile) { return null; }
}
`;

const files: SourceFile[] = [
  { fsPath: "/mem/dto.java", content: DTO },
  { fsPath: "/mem/ctl.java", content: CTL },
];

test("G8 e2e:恶意 groovy 值规则在完整解析链路中被跳过且产生告警", () => {
  const canary = canaryFile();
  try {
    const rules = loadPropertiesFiles([
      { path: "/mem/.apifox-helper.properties", content: `field.doc=groovy: new File("${canary}").text = "pwned"` },
    ]);
    const res = analyze(files, { title: "t", rules });
    assert.equal(fs.existsSync(canary), false, "解析链路中规则体被执行");
    assert.ok(
      res.warnings.some((w) => /无法在无脚本运行时下安全执行/.test(w)),
      `warnings 应包含跳过告警,实际:${JSON.stringify(res.warnings)}`
    );
  } finally {
    fs.rmSync(canary, { force: true });
  }
});

test("G8 e2e:不可求值的条件规则整条跳过并产生条件告警", () => {
  // 注:properties 解析器会把含 ":" 的条件(key[groovy:…]/key[js:…])在解析层截断为键名,
  // 因此 groovy/js 条件实际到不了 evalCondition;此处用同样走 "supported=false" 告警分支的
  // 字面量条件做端到端,groovy/js 条件的拒绝语义由上面的单元用例锁定(另见 D8 观察)。
  const rules = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: "ignore[plainword]=true" }]);
  const res = analyze(files, { title: "t", rules });
  assert.ok(res.warnings.some((w) => /ignore 条件无法求值/.test(w)), JSON.stringify(res.warnings));
  // 规则未生效:接口没有被 ignore
  assert.ok(Object.keys(res.spec.paths ?? {}).length > 0);
});

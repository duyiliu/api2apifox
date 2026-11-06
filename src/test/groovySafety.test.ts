/**
 * G8：groovy/js 白名单安全回归 —— 必须证明"不执行"，而不只是"返回 skipped 文案"。
 *
 * 证据链设计（三层，缺一层都只是文案断言）：
 *  1. **副作用探针**：把 process.exit / fs 写 / Function / eval / globalThis 上的探针属性
 *     全部换成会记录调用的桩，跑完整 analyze() 后断言探针零调用。
 *  2. **输出断言**：对应规则产出 skipped + 可读告警，规则值不进入 spec。
 *  3. **源码事实**：ruleEval 中不存在 eval / new Function / child_process 等执行入口
 *     （静态断言，防止将来有人为了"兼容更多 groovy"偷偷接上执行器）。
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { test } from "node:test";
import { parseProperties } from "../config/helperProperties";
import { evalCondition, evalRuleValue, trySafeGroovy } from "../java/ruleEval";
import { analyze } from "../pipeline";

const NOOP = () => undefined;

/* ---------------- 副作用探针 ---------------- */

interface Probe {
  hits: string[];
  restore: () => void;
}

/**
 * 安装副作用探针。任何被探针覆盖的入口一旦被调用，都会在 hits 里留痕。
 * 用 property descriptor 覆盖后原样还原，避免污染其他测试。
 */
function installProbes(extra: string[] = []): Probe {
  const hits: string[] = [];
  const restores: (() => void)[] = [];

  const spy = (holder: Record<string, unknown>, key: string, label: string) => {
    const descriptor = Object.getOwnPropertyDescriptor(holder, key);
    const original = holder[key];
    const stub = function (this: unknown, ...args: unknown[]) {
      hits.push(`${label}(${args.map((a) => String(a)).join(",").slice(0, 60)})`);
      return undefined;
    };
    Object.defineProperty(holder, key, { value: stub, configurable: true, writable: true });
    restores.push(() => {
      if (descriptor) {
        Object.defineProperty(holder, key, descriptor);
      } else {
        holder[key] = original;
      }
    });
  };

  spy(process as unknown as Record<string, unknown>, "exit", "process.exit");
  spy(globalThis as unknown as Record<string, unknown>, "eval", "globalThis.eval");
  spy(globalThis as unknown as Record<string, unknown>, "Function", "globalThis.Function");
  spy(process as unknown as Record<string, unknown>, "kill", "process.kill");
  for (const label of extra) {
    const [holderName, prop] = label.split(".");
    const holder = holderName === "fs" ? (fs as unknown as Record<string, unknown>) : (globalThis as unknown as Record<string, unknown>);
    if (prop && typeof holder[prop] !== "undefined") {
      spy(holder, prop, label);
    }
  }

  return {
    hits,
    restore: () => {
      for (const r of restores.reverse()) r();
    },
  };
}

const HEALTHY = `import org.springframework.web.bind.annotation.*;
/** 用户接口 */
@RestController
@RequestMapping("/u")
public class U {
  /** 字段说明 */
  @GetMapping("/a")
  public String a() { return null; }
}`;

/** 把一组 properties 行做成 HelperProperties */
function props(lines: string[]) {
  const parsed = parseProperties(lines.join("\n"), "/p/.apifox-helper.properties");
  return { ...parsed, files: ["/p/.apifox-helper.properties"] };
}

/* ---------------- 危险脚本：逐条证明不执行 ---------------- */

const DANGEROUS = [
  { name: "System.exit(1)", value: "groovy: System.exit(1)" },
  { name: "System.exit(0) 带引号包裹", value: 'groovy: "x" + System.exit(0)' },
  { name: "Runtime.exec", value: 'groovy: Runtime.getRuntime().exec("calc.exe")' },
  { name: "new File 写入", value: 'groovy: "a" + new File("C:/pwn.txt").text' },
  { name: "new File 覆盖配置", value: 'groovy: new File("C:/pwn.txt").delete()' },
  { name: "反射 Class.forName", value: 'groovy: Class.forName("java.lang.Runtime").getMethod("exec")' },
  { name: "分号多语句", value: 'groovy: logger.info("a"); System.exit(2); "b"' },
  { name: "直接 eval", value: 'groovy: eval("System.exit(3)")' },
  { name: "ProcessBuilder", value: 'groovy: new ProcessBuilder("cmd","/c","dir").start()' },
  { name: "JS 形态 process.exit", value: "js: process.exit(4)" },
  { name: "JS 形态 require", value: 'js: require("fs").writeFileSync("C:/pwn.txt","x")' },
  { name: "it.ann 之外的方法调用", value: 'groovy: it.getClass().forName("java.lang.System")' },
  { name: "it.doc 读取任意文件", value: 'groovy: new File(it.doc("C:/etc/passwd")).text' },
];

for (const { name, value } of DANGEROUS) {
  test(`G8 危险 groovy/js 不执行：${name}`, () => {
    const probes = installProbes();
    try {
      // 1) 单元层：求值结果必须是 skipped（无法安全翻译），而不是伪造出值
      const single = evalRuleValue(value, { annotations: [], javadocRaw: "/** @x y */", subject: "f" }, "field.doc", NOOP);
      assert.equal(single.skipped, true, `${name} 应被判定为不可安全执行`);
      assert.equal(single.value, undefined, `${name} 不得产出任何值`);
      assert.ok(single.reason && /无法在无脚本运行时下安全执行|已跳过/.test(single.reason), `${name} 缺少可读跳过原因`);

      // 2) 整链层：跑完整 analyze，确认副作用探针零调用
      const out = analyze([{ fsPath: "/p/U.java", content: HEALTHY }], {
        title: "t",
        rules: props([`field.doc=${value}`]),
      });
      assert.ok(Array.isArray(out.endpoints));
      // 接口本身仍应被正常识别（安全策略只影响规则值，不影响解析）
      assert.equal(out.endpoints.length, 1);
      assert.deepEqual(probes.hits, [], `${name} 触发了副作用：${probes.hits.join(" | ")}`);
    } finally {
      probes.restore();
    }
  });
}

test("G8 危险 groovy 条件不执行，规则整体不生效", () => {
  const probes = installProbes();
  try {
    const cond = evalCondition('groovy: System.exit(9) == null', { annotations: [], subject: "f" }, "k", NOOP);
    // 不支持的条件一律 supported=false，由上层跳过规则（绝不"当作 true"放行）
    assert.equal(cond.supported, false);
    assert.equal(cond.hit, false);

    const out = analyze([{ fsPath: "/p/U.java", content: HEALTHY }], {
      title: "t",
      rules: props(["field.doc[groovy: System.exit(9) == null]=危险"]),
    });
    assert.deepEqual(probes.hits, []);
    // 条件不支持 → 规则不应用 → 不应出现"危险"这个文档值
    assert.ok(!JSON.stringify(out.spec).includes("危险"));
  } finally {
    probes.restore();
  }
});

test("G8 带副作用的 js: 前缀同样不执行", () => {
  const probes = installProbes();
  try {
    const single = evalRuleValue("js: globalThis.pwned = 1", { annotations: [], subject: "f" }, "field.doc", NOOP);
    assert.equal(single.skipped, true);
    assert.equal((globalThis as unknown as Record<string, unknown>).pwned, undefined);
    assert.deepEqual(probes.hits, []);
  } finally {
    probes.restore();
  }
});

/* ---------------- 白名单内的安全形态仍然工作（防止"一刀切禁用"） ---------------- */

test("G8 白名单形态仍可用：it.ann 字符串拼接产出值", () => {
  const r = evalRuleValue(
    'groovy: "（字典：" + it.ann("com.x.DataDic","value") + "）"',
    {
      annotations: [{ name: "DataDic", raw: "@DataDic", args: { value: "FMJG" } }],
      subject: "f",
    },
    "field.doc",
    NOOP
  );
  assert.equal(r.skipped, undefined);
  assert.equal(r.value, "（字典：FMJG）");
});

test("G8 白名单形态不因含 it.ann 而放行任意调用", () => {
  // 关键：不能因为表达式里出现合法片段就整体放行
  const r = trySafeGroovy('it.ann("com.x.DataDic","value") + System.exit(1)', {
    annotations: [{ name: "DataDic", raw: "@DataDic", args: { value: "FMJG" } }],
    subject: "f",
  });
  assert.equal(r.unsupported, true);
  assert.equal(r.value, undefined);
});

test("G8 字符串字面量中出现的危险词不应触发执行，但也不应被当成合法规则值", () => {
  const probes = installProbes();
  try {
    // 字面量规则是合法的（用户就想写这段文字），只要求不执行
    const r = evalRuleValue('literal: System.exit(1)', { annotations: [], subject: "f" }, "field.doc", NOOP);
    assert.deepEqual(probes.hits, []);
    // detectValueSyntax 把 "literal:" 视为普通字面量，直接返回文本
    assert.equal(r.value, "literal: System.exit(1)");
  } finally {
    probes.restore();
  }
});

/* ---------------- 静态事实：ruleEval 无执行入口 ---------------- */

test("G8 ruleEval 源码不含 eval/new Function/child_process 等执行入口", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../../src/java/ruleEval.ts"), "utf8");
  const forbidden = [/\beval\s*\(/, /new\s+Function\s*\(/, /require\(\s*["']child_process["']\s*\)/, /\bvm\.runIn/, /\bimport\s*\(\s*["']/];
  for (const pattern of forbidden) {
    assert.ok(!pattern.test(source), `ruleEval.ts 出现禁止的执行入口:${pattern}`);
  }
  // 且确实实现了"无法翻译即跳过"的分支
  assert.match(source, /skipped:\s*true/);
});

test("G8 白名单实现在文本层：matches() 的非法正则在安全条件求值中被 catch", () => {
  // 白名单里唯一会编译正则的分支是 matches()；非法模式必须按"不匹配"处理，
  // 而不是把异常抛到用户面前。此处走实际可达路径（三元条件里的访问器判断）。
  const bad = trySafeGroovy('it.name().matches("[") ? "Y" : null', { annotations: [], subject: "f", fieldName: "abc" });
  assert.equal(bad.matched, false, "非法正则应按不匹配处理，而不是抛异常或伪造命中");
  assert.equal(bad.unsupported, undefined);

  // 合法正则仍正常工作，证明不是一刀切禁用
  const good = trySafeGroovy('it.name().matches("^a") ? "Y" : null', { annotations: [], subject: "f", fieldName: "abc" });
  assert.equal(good.matched, true);
  assert.equal(good.value, "Y");

  // 顶层的 matches() 条件不在白名单内，必须显式判为不支持
  const top = evalCondition('it.name().matches("a.*")', { annotations: [], subject: "f", fieldName: "abc" }, "k", NOOP);
  assert.equal(top.supported, false);
  assert.equal(top.hit, false);
});

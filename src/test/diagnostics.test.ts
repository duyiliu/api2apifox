import assert from "node:assert/strict";
import { test } from "node:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { AnalyzeCache, analyze, analyzeSubset } from "../pipeline";
import { EndpointInfo, SourceFile } from "../java/model";
import { attributeImportErrors, problemsFromParseDiagnostics } from "../ui/diagnostics";

const SAMPLE_ROOT = path.join(__dirname, "..", "..", "sample");

function loadSample(): SourceFile[] {
  const out: SourceFile[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".java")) {
        out.push({ fsPath: full, content: fs.readFileSync(full, "utf8") });
      }
    }
  };
  walk(SAMPLE_ROOT);
  return out;
}

const DEMO_CONTROLLER = [
  "package demo;",
  "",
  "import org.springframework.web.bind.annotation.*;",
  "",
  "@RestController",
  "public class DemoController {",
  '    @GetMapping("/demo")',
  "    public String demo(DemoQuery query) {",
  '        return "ok";',
  "    }",
  "}",
].join("\n");

const DEMO_QUERY = ["package demo;", "", "public class DemoQuery {", "}"].join("\n");

test("解析告警带上源文件与参数所在行,供 Problems 面板定位", () => {
  const analyzed = analyze(
    [
      { fsPath: "/mem/DemoController.java", content: DEMO_CONTROLLER },
      { fsPath: "/mem/DemoQuery.java", content: DEMO_QUERY },
    ],
    "demo"
  );

  const warning = analyzed.warnings.find((w) => w.includes("DemoController.demo") && w.includes("缺少 @RequestParam"));
  assert.ok(warning, "应产生缺注解参数告警: " + analyzed.warnings.join("|"));
  const diagnostic = analyzed.parseDiagnostics.find((d) => d.message === warning);
  assert.ok(diagnostic, "告警应同时产生可定位诊断");
  assert.equal(diagnostic.filePath, "/mem/DemoController.java");
  // demo(DemoQuery query) 为第 8 行(1-based)
  assert.equal(diagnostic.line, 8);
});

test("解析告警的行号来自真实源码(不依赖样例行号硬编码)", () => {
  const files = loadSample();
  const analyzed = analyze(files, "demo");
  const userPath = path.join(SAMPLE_ROOT, "src/main/java/com/example/controller/UserController.java");
  const source = fs.readFileSync(userPath, "utf8");
  const expectedLine = source.split("\n").findIndex((line) => line.includes("patchUser(")) + 1;

  const diagnostic = analyzed.parseDiagnostics.find((d) => d.message.includes("patchUser") && d.message.includes("缺少 @RequestParam"));
  assert.ok(diagnostic, "样例 patchUser 的缺注解告警应可定位");
  assert.equal(diagnostic.filePath, userPath);
  assert.equal(diagnostic.line, expectedLine);
});

test("子集分析按所选接口过滤可定位诊断", () => {
  const files = loadSample();
  const users = analyzeSubset(files, { title: "demo" }, (ep) => ep.controller === "UserController");
  assert.ok(
    users.parseDiagnostics.some((d) => d.message.includes("patchUser")),
    "选中 UserController 时应保留 patchUser 诊断"
  );

  const orders = analyzeSubset(files, { title: "demo" }, (ep) => ep.controller === "OrderController");
  assert.ok(
    !orders.parseDiagnostics.some((d) => d.message.includes("patchUser")),
    "未选 UserController 时不应泄露其诊断"
  );
  assert.ok(orders.parseDiagnostics.every((d) => orders.warnings.includes(d.message)));
});

test("AnalyzeCache 返回诊断副本,下游修改不污染缓存", () => {
  const files = loadSample();
  const cache = new AnalyzeCache();
  const first = cache.analyze(files, "demo");
  const replay = cache.analyze(files, "demo");

  assert.deepEqual(replay.parseDiagnostics, first.parseDiagnostics);
  assert.notEqual(replay.parseDiagnostics, first.parseDiagnostics, "诊断数组应为副本");
  if (first.parseDiagnostics.length) {
    assert.notEqual(replay.parseDiagnostics[0], first.parseDiagnostics[0], "诊断对象应为副本");
    replay.parseDiagnostics[0].message = "polluted";
    const third = cache.analyze(files, "demo");
    assert.notEqual(third.parseDiagnostics[0].message, "polluted");
  }
});

test("解析诊断转换:去重、级别为 warning、无文件条目不进入 Problems", () => {
  const problems = problemsFromParseDiagnostics([
    { message: "A", filePath: "/mem/A.java", line: 3 },
    { message: "A", filePath: "/mem/A.java", line: 3 },
    { message: "B", filePath: "/mem/B.java", line: 9 },
    { message: "no file", filePath: "", line: 1 },
  ]);
  assert.deepEqual(problems, [
    { filePath: "/mem/A.java", line: 3, severity: "warning", message: "A" },
    { filePath: "/mem/B.java", line: 9, severity: "warning", message: "B" },
  ]);
});

function endpoint(overrides: Partial<EndpointInfo> & { path: string; method: string; operationId: string }): EndpointInfo {
  return {
    tag: "t",
    parameters: [],
    fsPath: "d:/ws/PatientController.java",
    controller: "PatientController",
    flavor: "spring-mvc",
    methodRange: { startOffset: 100, endOffset: 200, startLine: 12 },
    ...overrides,
  } as EndpointInfo;
}

test("导入错误按方法+路径/operationId 归属到源文件行", () => {
  const endpoints = [
    endpoint({ path: "/api/patients/{id}", method: "DELETE", operationId: "PatientController_delete", methodName: "delete" }),
    endpoint({ path: "/api/patients", method: "GET", operationId: "PatientController_list", methodName: "list" }),
  ];

  const byMethodPath = attributeImportErrors([{ message: "接口 DELETE /api/patients/{id} 导入失败" }], endpoints);
  assert.deepEqual(byMethodPath, [
    {
      filePath: "d:/ws/PatientController.java",
      line: 12,
      severity: "error",
      message: "接口 DELETE /api/patients/{id} 导入失败",
    },
  ]);

  const byOperationId = attributeImportErrors([{ message: "operation PatientController_list rejected", code: "BAD_REQUEST" }], endpoints);
  assert.equal(byOperationId.length, 1);
  assert.equal(byOperationId[0].filePath, "d:/ws/PatientController.java");
});

test("导入错误无法唯一归属时不做猜测", () => {
  const endpoints = [
    endpoint({ path: "/api/patients", method: "GET", operationId: "getPatients" }),
    endpoint({ path: "/api/patients", method: "POST", operationId: "createPatient" }),
  ];
  assert.deepEqual(attributeImportErrors([{ message: "接口 /api/patients 导入失败" }], endpoints), []);
  assert.deepEqual(attributeImportErrors([{ message: "未知错误" }], endpoints), []);
  assert.deepEqual(attributeImportErrors([{ code: "" }], endpoints), []);
});

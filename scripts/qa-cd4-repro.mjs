#!/usr/bin/env node
/**
 * C-D4 运行时复现脚本（QA 对账文档 §3.3 复现的落地版）。
 *
 * 场景：端点缺 methodName（该字段可选，QA 复现中为 null）时，
 * parser 口径告警 `UserController.getUserById: …` 是否被 filterWarningsForEndpoints 保留。
 *
 * 用法（需先 npm run build:test 生成 out/）：
 *   node scripts/qa-cd4-repro.mjs
 *
 * 修复前：kept.length === 0（告警被静默丢弃，QA 运行时复现成立）；
 * 修复后：kept.length === 1（保留 1 条）——本脚本以此作为回归门禁。
 */
import { filterWarningsForEndpoints } from "../out/pipeline.js";

const endpoint = {
  method: "GET",
  path: "/users/{id}",
  tag: "UserController",
  operationId: "UserController_getUserById",
  methodName: null,
  parameters: [],
  controller: "UserController",
  flavor: "spring-mvc",
  fsPath: "UserController.java",
};

const parserWarnings = ["UserController.getUserById: 参数 id 缺少 @RequestParam 注解,已忽略"];
const kept = filterWarningsForEndpoints(parserWarnings, [endpoint]);
console.log(JSON.stringify({ kept, keptCount: kept.length }, null, 2));

if (kept.length !== 1) {
  console.error("C-D4 仍存在:parser 口径告警被静默丢弃(保留 0 条)");
  process.exit(1);
}

// 对照:未选中的方法仍应被过滤(兜底不放宽口径)
const other = filterWarningsForEndpoints(["UserController.deleteUser: 参数 x"], [endpoint]);
if (other.length !== 0) {
  console.error("回归风险:未选中方法的告警未被过滤(兜底过宽)");
  process.exit(1);
}

console.log("C-D4 已修复:parser 口径告警保留 1 条;未选中方法仍被过滤");

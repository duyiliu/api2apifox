import assert from "node:assert/strict";
import { test } from "node:test";
import Module from "node:module";
import * as vm from "node:vm";
import { getNonce } from "../ui/nonce";

/**
 * Webview 的 HTML 写在 TS 模板字面量里,而模板会吞掉单写的反斜杠:
 * 源码里的 /\/+$/ 到运行时变成 //+$/,该行后半段被当成注释,最终整段脚本语法错误、
 * 页面所有按钮失效(点「测试连接」毫无反应)。这里对生成的 HTML 做静态校验:
 * 内联脚本必须能被解析,且脚本引用的元素 id 都真实存在。
 */

interface PanelClass {
  prototype: { _getHtmlForWebview(webview: { cspSource: string }): string };
}

type Loader = (request: string, ...rest: unknown[]) => unknown;
const moduleWithLoader = Module as unknown as { _load: Loader };
const originalLoad = moduleWithLoader._load;
moduleWithLoader._load = function (request: string, ...rest: unknown[]): unknown {
  if (request === "vscode") {
    return { window: {}, Uri: {}, env: {}, commands: {}, workspace: {} };
  }
  return originalLoad.call(this, request, ...rest);
};

// 必须等 vscode mock 生效后再加载面板模块(二者顶层 import vscode),故此处用 require 而非 import
const { SettingsPanel } = require("../views/SettingsPanel") as { SettingsPanel: PanelClass };
const { SyncResultPanel } = require("../views/SyncResultPanel") as { SyncResultPanel: PanelClass };

function renderHtml(panel: PanelClass): string {
  return panel.prototype._getHtmlForWebview({ cspSource: "vscode-webview://test" });
}

function inlineScripts(html: string): string[] {
  return Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g), (m) => m[1]);
}

/** 脚本语法错误描述;合法时返回 undefined,并把出错行一起带出来便于定位 */
function compileError(code: string): string | undefined {
  try {
    new vm.Script(code);
    return undefined;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const line = Number(/evalmachine\.<anonymous>:(\d+)/.exec(err instanceof Error ? (err.stack ?? "") : "")?.[1] ?? 0);
    if (!line) {
      return message;
    }
    const context = code.split("\n").slice(Math.max(0, line - 2), line + 1).join("\n");
    return `${message}\n${context}`;
  }
}

const panels: [string, PanelClass][] = [
  ["设置中心", SettingsPanel],
  ["同步结果", SyncResultPanel],
];

for (const [name, panel] of panels) {
  test(`webview:${name}内联脚本语法合法(模板转义失误会让整页 JS 失效)`, () => {
    const scripts = inlineScripts(renderHtml(panel));
    assert.ok(scripts.length > 0, `${name}未生成内联脚本`);
    for (const code of scripts) {
      assert.equal(compileError(code), undefined, `${name}内联脚本语法错误`);
    }
  });
}

test("webview:设置中心脚本引用的元素 id 在 HTML 中均存在", () => {
  const html = renderHtml(SettingsPanel);
  const ids = new Set(Array.from(html.matchAll(/id="([^"]+)"/g), (m) => m[1]));
  const referenced = new Set([
    ...Array.from(html.matchAll(/getElementById\('([^']+)'\)/g), (m) => m[1]),
    ...Array.from(html.matchAll(/showStatus\('([^']+)'/g), (m) => m[1]),
  ]);
  const missing = Array.from(referenced).filter((id) => !ids.has(id));
  assert.deepEqual(missing, [], `脚本引用了不存在的元素 id:${missing.join(", ")}`);
});

test("getNonce 生成 16 位随机 nonce(不依赖宿主全局 crypto)", () => {
  const first = getNonce();
  assert.match(first, /^[A-Za-z0-9]{16}$/);
  assert.notEqual(first, getNonce());
});

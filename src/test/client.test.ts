import assert from "node:assert/strict";
import { test } from "node:test";
import { ApifoxApiError, ApifoxClient } from "../apifox/client";

const ORIGINAL_FETCH = globalThis.fetch;

test("client:请求挂起时按 timeoutMs 抛出超时错误", async () => {
  // 模拟忽略 body 但尊重 AbortSignal 的挂起 fetch,验证超时路径(此前无超时会永远挂起)
  globalThis.fetch = ((_url: unknown, init?: { signal?: AbortSignal }) =>
    new Promise((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) {
        return;
      }
      if (signal.aborted) {
        reject(signal.reason);
        return;
      }
      signal.addEventListener("abort", () => reject(signal.reason));
    })) as unknown as typeof fetch;
  // AbortSignal.timeout 的定时器是 unref 的,需要 ref 的句柄保活事件循环,否则进程提前退出
  const keepAlive = setInterval(() => undefined, 5);
  try {
    const client = new ApifoxClient("https://api.example.com", "token", "2024-03-28", 30);
    await assert.rejects(
      client.listTeams(),
      (err: unknown) => err instanceof ApifoxApiError && err.message.includes("请求超时") && err.status === 0
    );
  } finally {
    clearInterval(keepAlive);
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("client:网络失败抛出可读的 ApifoxApiError", async () => {
  globalThis.fetch = (() => Promise.reject(new Error("ECONNREFUSED"))) as unknown as typeof fetch;
  try {
    const client = new ApifoxClient("https://api.example.com", "token");
    await assert.rejects(
      client.listTeams(),
      (err: unknown) => err instanceof ApifoxApiError && err.message.includes("ECONNREFUSED")
    );
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("client:302 重定向(下线路由的假成功)显式报错", async () => {
  const redirected = new Response("<html>help</html>", { status: 200 });
  Object.defineProperty(redirected, "redirected", { value: true });
  Object.defineProperty(redirected, "url", { value: "https://apifox.com/help" });
  globalThis.fetch = (() => Promise.resolve(redirected)) as unknown as typeof fetch;
  try {
    const client = new ApifoxClient("https://api.example.com", "token");
    await assert.rejects(
      client.listTeams(),
      (err: unknown) => err instanceof ApifoxApiError && err.message.includes("重定向")
    );
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("client:业务错误码非 0 与正常 data 解包", async () => {
  globalThis.fetch = (() =>
    Promise.resolve(new Response(JSON.stringify({ code: 403, message: "forbidden" }), { status: 200 }))) as unknown as typeof fetch;
  try {
    const client = new ApifoxClient("https://api.example.com", "token");
    await assert.rejects(client.listTeams(), (err: unknown) => err instanceof ApifoxApiError && err.message.includes("forbidden"));
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }

  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(JSON.stringify({ code: 0, data: { items: [{ id: 1, name: "t1" }] } }), { status: 200 })
    )) as unknown as typeof fetch;
  try {
    const client = new ApifoxClient("https://api.example.com", "token");
    const teams = await client.listTeams();
    assert.deepEqual(teams, [{ id: 1, name: "t1" }]);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

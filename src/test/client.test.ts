import assert from "node:assert/strict";
import { test } from "node:test";
import { ApifoxApiError, ApifoxClient } from "../apifox/client";

const ORIGINAL_FETCH = globalThis.fetch;

test("client:外部 AbortSignal 取消请求时抛出 AbortError", async () => {
  const controller = new AbortController();
  globalThis.fetch = ((_url: unknown, init?: { signal?: AbortSignal }) =>
    new Promise((_resolve, reject) => {
      const signal = init?.signal;
      if (signal?.aborted) {
        reject(signal.reason);
        return;
      }
      signal?.addEventListener("abort", () => reject(signal.reason), { once: true });
    })) as unknown as typeof fetch;
  try {
    const client = new ApifoxClient("https://api.example.com", "token", undefined, 5_000, controller.signal);
    const pending = client.listTeams();
    controller.abort();
    await assert.rejects(pending, (error: unknown) => error instanceof Error && error.name === "AbortError");
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

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

test("client:网络失败展开 cause 链,暴露 ECONNREFUSED 与本地代理提示", async () => {
  // 复刻 Node fetch 连接失败的真实形态:外层只有 "fetch failed",真因在 cause 上
  const refused = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:55467"), {
    code: "ECONNREFUSED",
    errno: -4078,
    syscall: "connect",
    address: "127.0.0.1",
    port: 55467,
  });
  globalThis.fetch = (() =>
    Promise.reject(new TypeError("fetch failed", { cause: refused }))) as unknown as typeof fetch;
  try {
    const client = new ApifoxClient("https://api.example.com", "token");
    await assert.rejects(
      client.listTeams(),
      (err: unknown) =>
        err instanceof ApifoxApiError &&
        err.message.includes("fetch failed") &&
        err.message.includes("connect ECONNREFUSED 127.0.0.1:55467") &&
        err.message.includes("代理")
    );
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("client:目标自身的失败只展开原因,不误报代理提示", async () => {
  const dns = Object.assign(new Error("getaddrinfo ENOTFOUND api.example.com"), {
    code: "ENOTFOUND",
    hostname: "api.example.com",
  });
  globalThis.fetch = (() =>
    Promise.reject(new TypeError("fetch failed", { cause: dns }))) as unknown as typeof fetch;
  try {
    const client = new ApifoxClient("https://api.example.com", "token");
    await assert.rejects(
      client.listTeams(),
      (err: unknown) =>
        err instanceof ApifoxApiError &&
        err.message.includes("getaddrinfo ENOTFOUND api.example.com") &&
        !err.message.includes("代理")
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

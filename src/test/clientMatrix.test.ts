import assert from "node:assert/strict";
import { test } from "node:test";
import { ApifoxApiError, ApifoxClient } from "../apifox/client";

/* ------------------------------------------------------------------ *
 * G7:ApifoxClient 错误与响应矩阵。
 *
 * 现有 client.test.ts 覆盖了取消/超时/网络失败/302/业务码 6 例。
 * 这里补 401/403/404/429/5xx/非 JSON/缺 data/私有化 baseURL/请求头 等。
 * 全部通过替换 globalThis.fetch 实现,不发真实网络请求。
 * ------------------------------------------------------------------ */

const ORIGINAL_FETCH = globalThis.fetch;

function stubFetch(impl: (url: string, init?: RequestInit) => Promise<Response>): { urls: string[]; calls: RequestInit[] } {
  const urls: string[] = [];
  const calls: RequestInit[] = [];
  globalThis.fetch = ((url: unknown, init?: RequestInit) => {
    urls.push(String(url));
    if (init) {
      calls.push(init);
    }
    return impl(String(url), init);
  }) as unknown as typeof fetch;
  return { urls, calls };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** 每个用例结束后恢复全局 fetch,避免串味 */
function withFetch(fn: () => Promise<void>): () => Promise<void> {
  return async () => {
    try {
      await fn();
    } finally {
      globalThis.fetch = ORIGINAL_FETCH;
    }
  };
}

/* ---------------- 错误状态码 ---------------- */

test(
  "client:401 给出重配令牌的指引并保留 status",
  withFetch(async () => {
    stubFetch(async () => jsonResponse({ message: "unauthorized" }, 401));
    await assert.rejects(new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), (err: any) => {
      assert.ok(err instanceof ApifoxApiError);
      assert.equal(err.status, 401);
      assert.match(err.message, /401/);
      assert.match(err.message, /令牌/);
      assert.ok(!err.message.includes("unauthorized"), "不应回显服务端原始 message,避免误导");
      return true;
    });
  })
);

test(
  "client:403 提示权限不足或并发导入",
  withFetch(async () => {
    stubFetch(async () => jsonResponse({ message: "forbidden" }, 403));
    await assert.rejects(new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), (err: any) => {
      assert.equal(err.status, 403);
      assert.match(err.message, /403/);
      assert.match(err.message, /权限|导入/);
      return true;
    });
  })
);

test(
  "client:404 提示检查项目 ID 与 API 地址",
  withFetch(async () => {
    stubFetch(async () => jsonResponse({}, 404));
    await assert.rejects(new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), (err: any) => {
      assert.equal(err.status, 404);
      assert.match(err.message, /404/);
      assert.match(err.message, /项目 ID|API 地址/);
      return true;
    });
  })
);

test(
  "client:400/422/500/502/503 都归入通用失败,并保留服务端 message 与 status",
  withFetch(async () => {
    for (const status of [400, 422, 500, 502, 503]) {
      stubFetch(async () => jsonResponse({ message: `server says ${status}` }, status));
      await assert.rejects(
        new ApifoxClient("http://127.0.0.1:1", "t").listTeams(),
        (err: any) => {
          assert.equal(err.status, status, `status ${status} 应被保留`);
          assert.match(err.message, new RegExp(String(status)));
          assert.match(err.message, new RegExp(`server says ${status}`));
          return true;
        },
        `status ${status}`
      );
    }
  })
);

test(
  "client:429 限流按通用失败处理(无重试、无 Retry-After 解析)并保留状态码",
  withFetch(async () => {
    // 锁定现状:客户端不做自动重试;429 与 5xx 走同一分支。
    stubFetch(async () => {
      const res = jsonResponse({ message: "too many requests" }, 429);
      return res;
    });
    const client = new ApifoxClient("http://127.0.0.1:1", "t");
    await assert.rejects(client.listTeams(), (err: any) => {
      assert.equal(err.status, 429);
      assert.match(err.message, /429/);
      return true;
    });
  })
);

test(
  "client:429 不做自动重试(单次调用只发一个请求)",
  withFetch(async () => {
    const stub = stubFetch(async () => jsonResponse({ message: "rate limited" }, 429));
    await assert.rejects(new ApifoxClient("http://127.0.0.1:1", "t").listTeams());
    assert.equal(stub.urls.length, 1, "客户端不应内置重试;重试策略由调用方决定");
  })
);

test(
  "client:错误响应体非 JSON 时仍按状态码报错,不抛 JSON 解析异常",
  withFetch(async () => {
    stubFetch(async () => new Response("<html>500 Internal Server Error</html>", { status: 500 }));
    await assert.rejects(new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), (err: any) => {
      assert.equal(err.status, 500);
      assert.match(err.message, /500/);
      return true;
    });
  })
);

/* ---------------- 响应体形态 ---------------- */

test(
  "client:200 + 非 JSON(网关 HTML)返回空列表,不报错(已知静默点)",
  withFetch(async () => {
    // 实测:只有当 fetch 层报告 redirected 时才会显式报错;若代理直接返回 200 HTML,
    // JSON.parse 失败被吞掉,extractList 得到 []。锁定现状并标注风险。
    stubFetch(async () => new Response("<html>gateway ok</html>", { status: 200 }));
    const teams = await new ApifoxClient("http://127.0.0.1:1", "t").listTeams();
    assert.deepEqual(teams, []);
  })
);

test(
  "client:data 缺失时退回整个 payload,再从中提取 items",
  withFetch(async () => {
    stubFetch(async () => jsonResponse({ code: 0 }));
    assert.deepEqual(await new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), []);

    stubFetch(async () => jsonResponse({ code: 0, items: [{ id: 2, name: "no-data" }] }));
    assert.deepEqual(await new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), [{ id: 2, name: "no-data" }]);
  })
);

test(
  "client:data 直接是数组时按数组提取",
  withFetch(async () => {
    stubFetch(async () => jsonResponse([{ id: 1, name: "a" }, { id: 2, name: "b" }]));
    assert.deepEqual(await new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
    ]);
  })
);

test(
  "client:列表项缺 id/name 或类型不符时被过滤,不影响其余项",
  withFetch(async () => {
    stubFetch(async () =>
      jsonResponse({
        code: 0,
        data: { items: [{ id: 1, name: "ok" }, { id: "1", name: "bad-id" }, { name: "no-id" }, null, { id: 3 }] },
      })
    );
    assert.deepEqual(await new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), [{ id: 1, name: "ok" }]);
  })
);

test(
  "client:code 为字符串 \"0\" 时不触发业务错误(类型判断只认 number)",
  withFetch(async () => {
    // 实测:`typeof payload.code === "number"` 才检查,字符串 "0" 直接放行。
    stubFetch(async () => jsonResponse({ code: "0", data: { items: [{ id: 5, name: "str-code" }] } }));
    assert.deepEqual(await new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), [{ id: 5, name: "str-code" }]);
  })
);

test(
  "client:code 为非 0 数字即使 HTTP 200 也抛错,并带上 message",
  withFetch(async () => {
    stubFetch(async () => jsonResponse({ code: 10001, message: "token expired" }));
    await assert.rejects(new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), (err: any) => {
      assert.match(err.message, /token expired/);
      assert.equal(err.status, 200, "业务错误沿用 HTTP 状态码");
      return true;
    });
  })
);

test(
  "client:空响应体按无 payload 处理(不抛 JSON 解析错误)",
  withFetch(async () => {
    stubFetch(async () => new Response("", { status: 200 }));
    assert.deepEqual(await new ApifoxClient("http://127.0.0.1:1", "t").listTeams(), []);
  })
);

/* ---------------- 请求构造 ---------------- */

test(
  "client:请求头固定带 X-Apifox-Api-Version / Authorization / Content-Type",
  withFetch(async () => {
    const stub = stubFetch(async () => jsonResponse([]));
    await new ApifoxClient("http://127.0.0.1:1", "my-token").listTeams();
    const headers = stub.calls[0].headers as Record<string, string>;
    assert.equal(headers["X-Apifox-Api-Version"], "2024-03-28");
    assert.equal(headers.Authorization, "Bearer my-token");
    assert.equal(headers["Content-Type"], "application/json");
    assert.equal(stub.calls[0].method, "GET");
    assert.equal(stub.calls[0].body, undefined, "GET 不带 body");
  })
);

test(
  "client:apiVersion 可覆盖(私有化部署/兼容旧版本)",
  withFetch(async () => {
    const stub = stubFetch(async () => jsonResponse([]));
    await new ApifoxClient("http://127.0.0.1:1", "t", "2023-01-01").listTeams();
    assert.equal((stub.calls[0].headers as Record<string, string>)["X-Apifox-Api-Version"], "2023-01-01");
  })
);

test(
  "client:私有化 http baseUrl 与末尾斜杠都被正确规范化",
  withFetch(async () => {
    const stub = stubFetch(async () => jsonResponse([]));
    await new ApifoxClient("http://internal.example:8080/apifox///", "t").listTeams();
    assert.deepEqual(stub.urls, ["http://internal.example:8080/apifox/v1/teams"]);
  })
);

test(
  "client:importOpenapi 发出 POST,body 为 { input, options }",
  withFetch(async () => {
    const stub = stubFetch(async () => jsonResponse({ code: 0, data: { counters: {}, errors: [] } }));
    const client = new ApifoxClient("http://127.0.0.1:1", "t");
    await client.importOpenapi(9, '{"openapi":"3.0.3"}', {
      endpointOverwriteBehavior: "KEEP_EXISTING",
      deleteUnmatchedResources: false,
    });
    assert.equal(stub.calls[0].method, "POST");
    assert.deepEqual(stub.urls, ["http://127.0.0.1:1/v1/projects/9/import-openapi"]);
    const body = JSON.parse(String(stub.calls[0].body));
    assert.equal(body.input, '{"openapi":"3.0.3"}');
    assert.equal(body.options.endpointOverwriteBehavior, "KEEP_EXISTING");
    assert.equal(body.options.deleteUnmatchedResources, false);
  })
);

test(
  "client:importOpenapi 响应缺 counters/errors 时返回空结构(不返回 undefined)",
  withFetch(async () => {
    stubFetch(async () => jsonResponse({ code: 0, data: {} }));
    const result = await new ApifoxClient("http://127.0.0.1:1", "t").importOpenapi(1, "{}");
    assert.deepEqual(result, { counters: {}, errors: [] });
  })
);

test(
  "client:importOpenapi 的 options 为空对象时仍发送空 options(不是省略)",
  withFetch(async () => {
    const stub = stubFetch(async () => jsonResponse({ code: 0, data: { counters: {}, errors: [] } }));
    await new ApifoxClient("http://127.0.0.1:1", "t").importOpenapi(1, "{}");
    assert.deepEqual(JSON.parse(String(stub.calls[0].body)), { input: "{}", options: {} });
  })
);

/* ---------------- listProjects 聚合语义 ---------------- */

test(
  "client:listProjects 合并多团队项目并标注 teamName",
  withFetch(async () => {
    const routes: Record<string, unknown> = {
      "/v1/teams": { code: 0, data: [{ id: 1, name: "T1" }, { id: 2, name: "T2" }] },
      "/v1/teams/1/projects": { code: 0, data: [{ id: 10, name: "P1" }] },
      "/v1/teams/2/projects": { code: 0, data: [{ id: 20, name: "P2" }] },
    };
    stubFetch(async (url) => {
      const path = new URL(url).pathname;
      return jsonResponse(routes[path] ?? { code: 0, data: [] });
    });
    const projects = await new ApifoxClient("http://127.0.0.1:1", "t").listProjects();
    assert.deepEqual(projects, [
      { id: 10, name: "P1", teamName: "T1" },
      { id: 20, name: "P2", teamName: "T2" },
    ]);
  })
);

test(
  "client:listProjects 单团队失败不影响其余团队(部分降级)",
  withFetch(async () => {
    stubFetch(async (url) => {
      const path = new URL(url).pathname;
      if (path === "/v1/teams") {
        return jsonResponse({ code: 0, data: [{ id: 1, name: "T1" }, { id: 2, name: "T2" }] });
      }
      if (path === "/v1/teams/1/projects") {
        return jsonResponse({ message: "boom" }, 500);
      }
      return jsonResponse({ code: 0, data: [{ id: 20, name: "P2" }] });
    });
    const projects = await new ApifoxClient("http://127.0.0.1:1", "t").listProjects();
    assert.deepEqual(projects, [{ id: 20, name: "P2", teamName: "T2" }]);
  })
);

test(
  "client:listProjects 全部团队失败时抛出首个错误(不能误报为「没有项目」)",
  withFetch(async () => {
    stubFetch(async (url) => {
      const path = new URL(url).pathname;
      if (path === "/v1/teams") {
        return jsonResponse({ code: 0, data: [{ id: 1, name: "T1" }] });
      }
      return jsonResponse({ message: "permission denied" }, 403);
    });
    await assert.rejects(new ApifoxClient("http://127.0.0.1:1", "t").listProjects(), (err: any) => {
      assert.equal(err.status, 403);
      return true;
    });
  })
);

test(
  "client:listProjects 无任何团队时返回空数组(不是错误)",
  withFetch(async () => {
    stubFetch(async () => jsonResponse({ code: 0, data: [] }));
    assert.deepEqual(await new ApifoxClient("http://127.0.0.1:1", "t").listProjects(), []);
  })
);

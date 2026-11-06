/**
 * G7：ApifoxClient 错误矩阵 + G4 冲突策略从配置到请求的透传。
 *
 * 现有 client.test.ts 只覆盖取消/超时/网络/302/业务码；这里补 401/403/429/500、
 * 非 JSON（HTML）响应、缺 data 字段、私有化 http baseURL，以及错误消息里
 * 面向用户的定位信息（不能只说 "failed"）。
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { APIFOX_API_VERSION, ApifoxApiError, ApifoxClient } from "../apifox/client";

const ORIGINAL_FETCH = globalThis.fetch;

function mockResponse(body: string, status = 200, init: ResponseInit = {}): void {
  globalThis.fetch = (() => Promise.resolve(new Response(body, { status, ...init }))) as unknown as typeof fetch;
}

async function withResponse<T>(fn: () => Promise<T>, body: string, status = 200): Promise<T> {
  mockResponse(body, status);
  try {
    return await fn();
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
}

/* ---------------- 状态码矩阵 ---------------- */

test("G7 401 → ApifoxApiError(status=401)，提示重新配置令牌", async () => {
  await assert.rejects(
    withResponse(() => new ApifoxClient("https://api.example.com", "t").listTeams(), '{"code":401}', 401),
    (err: unknown) => {
      assert.ok(err instanceof ApifoxApiError);
      assert.equal(err.status, 401);
      // 必须是可执行的定位文案（不只是状态码）：告知用哪个命令重设令牌
      assert.match(err.message, /访问令牌无效或已过期/);
      assert.match(err.message, /设置访问令牌/);
      return true;
    }
  );
});

test("G7 403 → ApifoxApiError(status=403)，提示权限不足或并发导入", async () => {
  await assert.rejects(
    withResponse(() => new ApifoxClient("https://api.example.com", "t").listTeams(), '{"code":403}', 403),
    (err: unknown) => {
      assert.ok(err instanceof ApifoxApiError);
      assert.equal(err.status, 403);
      assert.match(err.message, /权限|403/);
      return true;
    }
  );
});

test("G7 429 限流 → 保留 status 与 Apifox 返回的 message", async () => {
  await assert.rejects(
    withResponse(
      () => new ApifoxClient("https://api.example.com", "t").listTeams(),
      JSON.stringify({ code: 429, message: "too many requests" }),
      429
    ),
    (err: unknown) => {
      assert.ok(err instanceof ApifoxApiError);
      assert.equal(err.status, 429);
      // 429 走通用分支：状态码 + 服务端 message 都要在，用户才知道是限流
      assert.match(err.message, /429/);
      assert.match(err.message, /too many requests/);
      return true;
    }
  );
});

test("G7 500 → ApifoxApiError(status=500)，保留 status 供 CLI 映射 retryable", async () => {
  await assert.rejects(
    withResponse(() => new ApifoxClient("https://api.example.com", "t").listTeams(), '{"message":"boom"}', 500),
    (err: unknown) => {
      assert.ok(err instanceof ApifoxApiError);
      assert.equal(err.status, 500);
      return true;
    }
  );
});

test("G7 404 → 提示检查项目 ID 与 API 地址", async () => {
  await assert.rejects(
    withResponse(() => new ApifoxClient("https://api.example.com", "t").listTeams(), "{}", 404),
    (err: unknown) => {
      assert.ok(err instanceof ApifoxApiError);
      assert.match(err.message, /项目|404/);
      return true;
    }
  );
});

/* ---------------- 响应体形态 ---------------- */

test("G7 200 但返回 HTML（登录页/网关页）不应被当成成功", async () => {
  // 非 JSON 的 200 会让 payload 为 undefined，request 返回 undefined；
  // 对 listTeams 而言会被归一为空数组——这是"静默空结果"风险点，此处锁定现状。
  const teams = await withResponse(
    () => new ApifoxClient("https://api.example.com", "t").listTeams(),
    "<html><body>login</body></html>",
    200
  );
  assert.deepEqual(teams, []);
});

test("G7 200 HTML 响应在 importOpenapi 上归一为空 counters/errors（不抛错）", async () => {
  const result = await withResponse(
    () => new ApifoxClient("https://api.example.com", "t").importOpenapi(1, "{}"),
    "<html>gateway</html>",
    200
  );
  assert.deepEqual(result.counters, {});
  assert.deepEqual(result.errors, []);
});

test("G7 响应缺 data 字段：listTeams 返回空数组", async () => {
  const teams = await withResponse(() => new ApifoxClient("https://api.example.com", "t").listTeams(), '{"code":0}');
  assert.deepEqual(teams, []);
});

test("G7 响应 data.items 缺失或元素畸形时按契约过滤", async () => {
  const teams = await withResponse(
    () => new ApifoxClient("https://api.example.com", "t").listTeams(),
    JSON.stringify({ code: 0, data: { items: [{ id: 1, name: "ok" }, { id: "bad", name: "x" }, { name: "no-id" }] } })
  );
  // 只保留 id 为 number 且 name 为 string 的项
  assert.deepEqual(teams, [{ id: 1, name: "ok" }]);
});

test("G7 data 直接为数组也支持", async () => {
  const teams = await withResponse(
    () => new ApifoxClient("https://api.example.com", "t").listTeams(),
    JSON.stringify({ code: 0, data: [{ id: 7, name: "direct" }] })
  );
  assert.deepEqual(teams, [{ id: 7, name: "direct" }]);
});

test("G7 业务码为字符串 \"0\" 时不视为错误（只拦 number 型非 0）", async () => {
  const teams = await withResponse(
    () => new ApifoxClient("https://api.example.com", "t").listTeams(),
    JSON.stringify({ code: "0", data: [{ id: 1, name: "x" }] })
  );
  assert.deepEqual(teams, [{ id: 1, name: "x" }]);
});

/* ---------------- 私有化部署 / URL 组装 ---------------- */

test("G7 私有化 http baseURL：允许 http，且尾部斜杠被去除", async () => {
  const urls: string[] = [];
  globalThis.fetch = ((url: unknown) => {
    urls.push(String(url));
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: [] }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    await new ApifoxClient("http://10.0.0.5:8080/", "t").listTeams();
    assert.equal(urls[0], "http://10.0.0.5:8080/v1/teams");
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G7 多个尾部斜杠也被归一，path 拼接不产生 //v1", async () => {
  const urls: string[] = [];
  globalThis.fetch = ((url: unknown) => {
    urls.push(String(url));
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: [] }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    await new ApifoxClient("https://api.example.com///", "t").listTeamProjects(3);
    assert.equal(urls[0], "https://api.example.com/v1/teams/3/projects");
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G7 请求头包含 API 版本与 Bearer 令牌", async () => {
  let headers: Record<string, string> = {};
  globalThis.fetch = ((_url: unknown, init?: { headers?: Record<string, string> }) => {
    headers = init?.headers ?? {};
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: [] }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    await new ApifoxClient("https://api.example.com", "secret-token").listTeams();
    assert.equal(headers.Authorization, "Bearer secret-token");
    assert.equal(headers["X-Apifox-Api-Version"], APIFOX_API_VERSION);
    assert.equal(headers["Content-Type"], "application/json");
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G7 自定义 apiVersion 覆盖默认值", async () => {
  let headers: Record<string, string> = {};
  globalThis.fetch = ((_url: unknown, init?: { headers?: Record<string, string> }) => {
    headers = init?.headers ?? {};
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: [] }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    await new ApifoxClient("https://api.example.com", "t", "2025-01-01").listTeams();
    assert.equal(headers["X-Apifox-Api-Version"], "2025-01-01");
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

/* ---------------- listProjects 的部分失败语义 ---------------- */

test("G7 listProjects：单团队失败不拖垮其余团队", async () => {
  globalThis.fetch = ((url: unknown) => {
    const u = String(url);
    if (u.endsWith("/v1/teams")) {
      return Promise.resolve(
        new Response(JSON.stringify({ code: 0, data: [{ id: 1, name: "ok" }, { id: 2, name: "broken" }] }), { status: 200 })
      );
    }
    if (u.includes("/teams/1/projects")) {
      return Promise.resolve(new Response(JSON.stringify({ code: 0, data: [{ id: 11, name: "p1" }] }), { status: 200 }));
    }
    return Promise.resolve(new Response("{}", { status: 500 }));
  }) as unknown as typeof fetch;
  try {
    const projects = await new ApifoxClient("https://api.example.com", "t").listProjects();
    assert.deepEqual(projects, [{ id: 11, name: "p1", teamName: "ok" }]);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G7 listProjects：全部团队失败时抛出首个错误，而不是返回空列表", async () => {
  globalThis.fetch = ((url: unknown) => {
    const u = String(url);
    if (u.endsWith("/v1/teams")) {
      return Promise.resolve(new Response(JSON.stringify({ code: 0, data: [{ id: 1, name: "t1" }] }), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({ message: "nope" }), { status: 500 }));
  }) as unknown as typeof fetch;
  try {
    // 空列表 + 有失败 → 必须抛错，否则 UI 会显示"令牌下没有项目"
    await assert.rejects(new ApifoxClient("https://api.example.com", "t").listProjects(), ApifoxApiError);
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

/* ---------------- G4：冲突策略非法值在扩展侧的处置 ---------------- */

test("G7 业务码为负值时同样视为错误（不能只拦正数）", async () => {
  await assert.rejects(
    withResponse(
      () => new ApifoxClient("https://api.example.com", "t").listTeams(),
      JSON.stringify({ code: -1, message: "internal business error" })
    ),
    (err: unknown) => {
      assert.ok(err instanceof ApifoxApiError);
      assert.match(err.message, /internal business error/);
      return true;
    }
  );
});

test("G4 扩展侧非法冲突策略会被原样发到 Apifox（as never 强转无运行时校验）", async () => {
  // 这是矩阵 G4 指出的风险点：uploader 用 `as never` 绕过类型，
  // settings 里若出现非法值（手改 settings.json），会静默变成 undefined 或原样发送。
  let body: { options?: Record<string, unknown> } = {};
  globalThis.fetch = ((_url: unknown, init?: { body?: string }) => {
    body = JSON.parse(init?.body ?? "{}");
    return Promise.resolve(new Response(JSON.stringify({ code: 0, data: { counters: {}, errors: [] } }), { status: 200 }));
  }) as unknown as typeof fetch;
  try {
    const client = new ApifoxClient("https://api.example.com", "t");
    await client.importOpenapi(1, "{}", {
      // 模拟 settings 里手改出的非法值
      endpointOverwriteBehavior: "TYPO_MODE" as never,
    });
    // 客户端不做校验：非法值会被原样序列化，Apifox 侧才失败
    assert.equal(body.options?.endpointOverwriteBehavior, "TYPO_MODE");
  } finally {
    globalThis.fetch = ORIGINAL_FETCH;
  }
});

test("G4 CLI 侧非法冲突策略在配置解析阶段被拒绝（不发出请求）", async () => {
  // CLI 有 enumValue 校验；本用例锁定"CLI 不会把非法值发出去"这一侧的保护。
  // 具体由 cli-sync.test.js 通过 --endpoint-conflict 非法值验证退出码 2。
  const { resolveConfig } = await import("../core/config");
  assert.throws(
    () => resolveConfig("/tmp/p", { endpointConflictBehavior: "TYPO_MODE" as never }, {}),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /endpointConflictBehavior/);
      return true;
    }
  );
});

test("G4 4 个合法冲突值在配置层全部可解析并保留", async () => {
  const { resolveConfig } = await import("../core/config");
  for (const mode of ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"] as const) {
    const resolved = resolveConfig("/tmp/p", { endpointConflictBehavior: mode, schemaConflictBehavior: mode }, {});
    assert.equal(resolved.config.endpointConflictBehavior, mode);
    assert.equal(resolved.config.schemaConflictBehavior, mode);
    assert.equal(resolved.sources.endpointConflictBehavior, "cli");
  }
});

test("G4 CLI/overrides 侧非法 schemaConflictBehavior 同样被拒绝（不仅接口策略）", async () => {
  const { resolveConfig } = await import("../core/config");
  assert.throws(
    () => resolveConfig("/tmp/p", { schemaConflictBehavior: "TYPO_MODE" as never }, {}),
    (err: unknown) => err instanceof Error && /schemaConflictBehavior/.test(err.message)
  );
});

test("G4 配置文件里的非法冲突策略也被拒绝", async () => {
  const { resolveConfig } = await import("../core/config");
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-g4-"));
  try {
    fs.writeFileSync(
      path.join(root, ".api2apifox.json"),
      JSON.stringify({ schemaConflictBehavior: "NOT_A_MODE" }),
      "utf8"
    );
    assert.throws(() => resolveConfig(root), /schemaConflictBehavior/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

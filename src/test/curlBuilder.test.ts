import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCurlCommand, CURL_BODY_TRUNCATE_BYTES } from "../providers/curlBuilder";
import { EndpointInfo } from "../java/model";

/* ------------------------------------------------------------------ *
 * 「复制为 cURL」命令构造器契约测试:
 * - GET/DELETE 无 body,query 参数按类型给示例
 * - POST/PUT 携带 -X / Content-Type / JSON body 骨架(取代表字段)
 * - path 参数填占位值,必填 header 生成 -H 占位
 * - multipart/form-data 走 -F,hidden 字段经 spec schema 已过滤
 * ------------------------------------------------------------------ */

function ep(overrides: Partial<EndpointInfo>): EndpointInfo {
  return {
    method: "GET",
    path: "/demo",
    tag: "demo",
    operationId: "DemoController_demo",
    parameters: [],
    fsPath: "/p/DemoController.java",
    controller: "DemoController",
    flavor: "spring-mvc",
    ...overrides,
  } as EndpointInfo;
}

const BASE = "http://localhost:8080";

test("curl:GET 无参数时只有 -X 与 url,默认 baseUrl 拼接", () => {
  const { command, truncated } = buildCurlCommand(ep({ path: "/api/users" }), undefined, BASE);
  assert.equal(truncated, false);
  assert.equal(command, "curl -X GET 'http://localhost:8080/api/users'");
});

test("curl:GET 路径参数整数填 1,字符串保留 {name} 占位", () => {
  const { command } = buildCurlCommand(
    ep({
      path: "/api/users/{id}/orders/{code}",
      parameters: [
        { name: "id", in: "path", typeText: "long", required: true },
        { name: "code", in: "path", typeText: "String", required: true },
      ],
    }),
    undefined,
    BASE
  );
  assert.ok(command.includes("/api/users/1/orders/{code}"), `命令:${command}`);
});

test("curl:GET query 参数按类型给示例值(int=1/boolean=true/string=参数名)", () => {
  const { command } = buildCurlCommand(
    ep({
      path: "/api/users",
      parameters: [
        { name: "page", in: "query", typeText: "int", required: false },
        { name: "size", in: "query", typeText: "Integer", required: false },
        { name: "active", in: "query", typeText: "boolean", required: false },
        { name: "keyword", in: "query", typeText: "String", required: false },
      ],
    }),
    undefined,
    BASE
  );
  // URL 编码不影响这几个值
  assert.ok(command.includes("page=1"), `命令:${command}`);
  assert.ok(command.includes("size=1"), `命令:${command}`);
  assert.ok(command.includes("active=true"), `命令:${command}`);
  assert.ok(command.includes("keyword=keyword"), `命令:${command}`);
});

test("curl:query 显式 example 优先于类型推断", () => {
  const { command } = buildCurlCommand(
    ep({
      path: "/x",
      parameters: [{ name: "status", in: "query", typeText: "String", required: false, example: "ACTIVE" }],
    }),
    undefined,
    BASE
  );
  assert.ok(command.includes("status=ACTIVE"), `命令:${command}`);
});

test("curl:必填 @RequestHeader 生成 -H 占位,非必填不出现", () => {
  const { command } = buildCurlCommand(
    ep({
      path: "/secure",
      parameters: [
        { name: "X-Token", in: "header", typeText: "String", required: true },
        { name: "X-Optional", in: "header", typeText: "String", required: false },
      ],
    }),
    undefined,
    BASE
  );
  assert.ok(command.includes(`-H 'X-Token: <X-Token>'`), `命令:${command}`);
  assert.ok(!command.includes("X-Optional"), `命令:${command}`);
});

test("curl:DELETE 即使有 requestBody 字段也不生成 body(与 GET 同口径)", () => {
  const { command } = buildCurlCommand(
    ep({
      method: "DELETE",
      path: "/api/users/1",
      requestBody: { typeText: "UserUpdateRequest", required: false },
    }),
    undefined,
    BASE
  );
  assert.ok(!command.includes("-d"), `命令:${command}`);
  assert.ok(!command.includes("Content-Type"), `命令:${command}`);
});

test("curl:POST 带 JSON body 骨架,从 schema 取前 3 个代表字段", () => {
  const e = ep({
    method: "POST",
    path: "/api/users",
    requestBody: { typeText: "UserCreateRequest", required: true },
    consumes: ["application/json"],
  });
  const operation = {
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              age: { type: "integer", format: "int32" },
              active: { type: "boolean" },
              extra1: { type: "string" },
              extra2: { type: "string" },
            },
          },
        },
      },
    },
  };
  const { command } = buildCurlCommand(e, operation, BASE);
  assert.ok(command.includes("-X POST"), `命令:${command}`);
  assert.ok(command.includes(`-H 'Content-Type: application/json'`), `命令:${command}`);
  assert.ok(command.includes("-d "), `命令:${command}`);
  // 骨架只取前 3 个代表字段
  assert.ok(command.includes(`"name":"string"`), `命令:${command}`);
  assert.ok(command.includes(`"age":1`), `命令:${command}`);
  assert.ok(command.includes(`"active":true`), `命令:${command}`);
  assert.ok(!command.includes("extra1"), `命令:${command}`);
  assert.ok(!command.includes("extra2"), `命令:${command}`);
});

test("curl:PUT 缺省 consumes 时回退 application/json", () => {
  const e = ep({
    method: "PUT",
    path: "/api/users/{id}",
    parameters: [{ name: "id", in: "path", typeText: "long", required: true }],
    requestBody: { typeText: "UserUpdateRequest", required: true },
  });
  const operation = {
    requestBody: {
      content: {
        "application/json": {
          schema: { type: "object", properties: { nickname: { type: "string" } } },
        },
      },
    },
  };
  const { command } = buildCurlCommand(e, operation, BASE);
  assert.ok(command.includes(`-H 'Content-Type: application/json'`), `命令:${command}`);
  assert.ok(command.includes(`"nickname":"string"`), `命令:${command}`);
});

test("curl:consumes 非 json 时沿用 consumes 口径(如 application/vnd+x-json 自定义类型)", () => {
  const e = ep({
    method: "POST",
    path: "/x",
    requestBody: { typeText: "X", required: true },
    consumes: ["application/vnd.api+json"],
  });
  const operation = {
    requestBody: {
      content: { "application/vnd.api+json": { schema: { type: "object", properties: { a: { type: "integer" } } } } },
    },
  };
  const { command } = buildCurlCommand(e, operation, BASE);
  assert.ok(command.includes("Content-Type: application/vnd.api+json"), `命令:${command}`);
});

test("curl:multipart/form-data 生成 -F 占位,文件字段用 @/path/to/file", () => {
  const e = ep({
    method: "POST",
    path: "/api/users/import",
    requestBody: {
      typeText: "__multipart__",
      required: true,
      formFields: [
        { name: "file", in: "query", typeText: "MultipartFile", required: true },
        { name: "remark", in: "query", typeText: "String", required: false },
      ],
    },
    consumes: ["multipart/form-data"],
  });
  const { command } = buildCurlCommand(e, undefined, BASE);
  assert.ok(command.includes("Content-Type: multipart/form-data"), `命令:${command}`);
  assert.ok(command.includes(`-F 'file=@/path/to/file'`), `命令:${command}`);
  assert.ok(command.includes(`-F 'remark=remark'`), `命令:${command}`);
  assert.ok(!/^ +-d /m.test(command), `命令:${command}`);
});

test("curl:body 超过截断阈值时截断并标记 truncated", () => {
  // 构造超大 body:一个超长字符串字段
  const hugeValue = "x".repeat(CURL_BODY_TRUNCATE_BYTES + 100);
  const e = ep({
    method: "POST",
    path: "/big",
    requestBody: { typeText: "X", required: true },
  });
  const operation = {
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { blob: { type: "string", example: hugeValue } },
          },
        },
      },
    },
  };
  const { command, truncated } = buildCurlCommand(e, operation, BASE);
  assert.equal(truncated, true);
  assert.ok(command.length < CURL_BODY_TRUNCATE_BYTES + 500, `命令长度:${command.length}`);
});

test("curl:hidden 字段已经从 spec schema 中过滤,builder 不再重复过滤(契约验证)", () => {
  // 同步链路里 hidden/JsonIgnore/规则忽略已被 schemaResolver 移除,
  // builder 拿到的 properties 即"对外口径",逐项进入骨架。
  const e = ep({
    method: "POST",
    path: "/users",
    requestBody: { typeText: "UserCreateRequest", required: true },
  });
  const operation = {
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              // password/internalNote 已被上游过滤,不会出现在这里
            },
          },
        },
      },
    },
  };
  const { command } = buildCurlCommand(e, operation, BASE);
  assert.ok(command.includes("name"), `命令:${command}`);
  assert.ok(!command.includes("password"), `命令:${command}`);
  assert.ok(!command.includes("internalNote"), `命令:${command}`);
});

test("curl:baseUrl 末尾斜杠被规范化,不会双斜杠", () => {
  const { command } = buildCurlCommand(ep({ path: "/x" }), undefined, "http://localhost:8080/");
  assert.ok(command.includes("'http://localhost:8080/x'"), `命令:${command}`);
});

test("curl:operation 缺失时仍能生成命令(无 body 骨架但有 Content-Type)", () => {
  const e = ep({
    method: "POST",
    path: "/x",
    requestBody: { typeText: "X", required: true },
  });
  const { command } = buildCurlCommand(e, undefined, BASE);
  assert.ok(command.includes(`-H 'Content-Type: application/json'`), `命令:${command}`);
  // 没有 schema 时 body 为空对象骨架 {}
  assert.ok(command.includes(`-d '{}'`), `命令:${command}`);
});

test("curl:嵌套对象字段递归展开", () => {
  const e = ep({
    method: "POST",
    path: "/x",
    requestBody: { typeText: "X", required: true },
  });
  const operation = {
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              contact: {
                type: "object",
                properties: { phone: { type: "string" }, email: { type: "string" } },
              },
            },
          },
        },
      },
    },
  };
  const { command } = buildCurlCommand(e, operation, BASE);
  assert.ok(command.includes(`"phone":"string"`), `命令:${command}`);
  assert.ok(command.includes(`"email":"string"`), `命令:${command}`);
});

test("curl:数组字段以单元素数组示例", () => {
  const e = ep({
    method: "POST",
    path: "/x",
    requestBody: { typeText: "X", required: true },
  });
  const operation = {
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { tags: { type: "array", items: { type: "string" } } },
          },
        },
      },
    },
  };
  const { command } = buildCurlCommand(e, operation, BASE);
  assert.ok(command.includes(`"tags":["string"]`), `命令:${command}`);
});

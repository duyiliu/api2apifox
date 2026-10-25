import assert from "node:assert/strict";
import { test } from "node:test";
import { AnalyzeCache, analyze } from "../pipeline";
import { EndpointInfo, SourceFile } from "../java/model";

const CLIENT_PATH = "/mem/OrderClient.java";
const CLIENT = `package com.example.client;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.DeleteExchange;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PatchExchange;
import org.springframework.web.service.annotation.PostExchange;
import org.springframework.web.service.annotation.PutExchange;

@HttpExchange("/order")
public interface OrderClient {

  @GetExchange("/{id}")
  OrderVO get(@PathVariable("id") Long id, @RequestHeader("X-Tenant") String tenant);

  @GetExchange(url = "/by-id/{id}", accept = "application/json")
  OrderVO getByUrl(@PathVariable Long id);

  @PostExchange(contentType = MediaType.APPLICATION_JSON)
  OrderVO create(@RequestBody OrderCreate body, @RequestParam(value = "dryRun", defaultValue = "false") boolean dryRun);

  @PutExchange(url = "/{id}")
  OrderVO update(@PathVariable Long id, @RequestBody OrderCreate body);

  @DeleteExchange("/{id}")
  void delete(@PathVariable("id") Long id);

  @PatchExchange(value = "/{id}", contentType = MediaType.APPLICATION_JSON)
  OrderVO patch(@PathVariable Long id, @RequestBody OrderCreate body);

  @HttpExchange(method = "GET", url = "/typed/{id}")
  OrderVO typed(
    @PathVariable Long id,
    @RequestParam("verbose") boolean verbose,
    @RequestHeader(value = "X-Trace", required = false) String trace
  );
}`;

const DTO = `package com.example.client;

public class OrderVO { public Long id; }
public class OrderCreate { public String name; }`;

const FILES: SourceFile[] = [
  { fsPath: CLIENT_PATH, content: CLIENT },
  { fsPath: "/mem/OrderDto.java", content: DTO },
];

function endpointsOf(result: ReturnType<typeof analyze>): Map<string, EndpointInfo> {
  return new Map(result.endpoints.map((endpoint) => [`${endpoint.method} ${endpoint.path}`, endpoint]));
}

test("HttpExchange 默认关闭:未开开关时不产出接口", () => {
  const result = analyze(FILES, { title: "demo" });
  assert.equal(result.endpoints.length, 0);
  assert.deepEqual(result.spec.paths, {});
});

test("@HttpExchange 接口级路径 + @GetExchange 方法级路径", () => {
  const result = analyze(FILES, { title: "demo", includeHttpExchange: true });
  const get = endpointsOf(result).get("GET /order/{id}");
  assert.ok(get, `应产出 GET /order/{id},实际:${[...endpointsOf(result).keys()].join(", ")}`);
  assert.equal(get.flavor, "http-exchange");
  assert.equal(get.controller, "OrderClient");
  assert.equal(get.tag, "OrderClient");
  assert.equal(get.returnType, "OrderVO");

  const id = get.parameters.find((p) => p.name === "id");
  assert.equal(id?.in, "path");
  assert.equal(id?.required, true);
  const tenant = get.parameters.find((p) => p.name === "X-Tenant");
  assert.equal(tenant?.in, "header");
  assert.equal(tenant?.required, true);
});

test("HttpExchange 多方法映射与 Spring MVC 参数语义", () => {
  const result = analyze(FILES, { title: "demo", includeHttpExchange: true });
  const byKey = endpointsOf(result);
  assert.deepEqual(
    [...byKey.keys()].sort(),
    [
      "DELETE /order/{id}",
      "GET /order/by-id/{id}",
      "GET /order/typed/{id}",
      "GET /order/{id}",
      "PATCH /order/{id}",
      "POST /order",
      "PUT /order/{id}",
    ].sort()
  );

  const post = byKey.get("POST /order");
  assert.equal(post?.requestBody?.typeText, "OrderCreate");
  assert.equal(post?.requestBody?.required, true);
  assert.ok(post?.consumes?.includes("application/json"));
  const dryRun = post?.parameters.find((p) => p.name === "dryRun");
  assert.equal(dryRun?.in, "query");
  assert.equal(dryRun?.required, false, "带 defaultValue 的 @RequestParam 应为可选");

  const typed = byKey.get("GET /order/typed/{id}");
  assert.equal(typed?.parameters.find((p) => p.name === "verbose")?.required, true);
  const trace = typed?.parameters.find((p) => p.name === "X-Trace");
  assert.equal(trace?.in, "header");
  assert.equal(trace?.required, false, "@RequestHeader(required=false) 应保持可选");

  const posted = result.spec.paths["/order"].post as Record<string, any>;
  assert.ok(posted.requestBody.content["application/json"]);
  const getByUrl = result.spec.paths["/order/by-id/{id}"].get as Record<string, any>;
  assert.ok(getByUrl.responses["200"].content["application/json"], "方法级 accept 应映射为响应媒体类型");
});

test("HttpExchange 的 url 别名与 @HttpExchange(method=...) 方法级写法", () => {
  const files: SourceFile[] = [{
    fsPath: "/mem/InventoryClient.java",
    content: `package com.example.client;

import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

@HttpExchange(url = "/inventory", contentType = "application/json", accept = "application/json")
public interface InventoryClient {
  @GetExchange(url = "/{sku}")
  String get(String sku);

  @HttpExchange(method = "POST", url = "/adjust")
  String adjust(String body);
}`,
  }];
  const result = analyze(files, { title: "demo", includeHttpExchange: true });
  const byKey = endpointsOf(result);
  assert.ok(byKey.has("GET /inventory/{sku}"));
  assert.ok(byKey.has("POST /inventory/adjust"));
  assert.ok(byKey.get("GET /inventory/{sku}")?.produces?.includes("application/json"));
  assert.ok(byKey.get("POST /inventory/adjust")?.consumes?.includes("application/json"));
});

test("endpointsOfFile 仅在显式开启时识别 HttpExchange(CodeLens 口径)", () => {
  const cache = new AnalyzeCache();
  const file = FILES[0];
  assert.equal(cache.endpointsOfFile(file.fsPath, file.content).length, 0);
  assert.equal(cache.endpointsOfFile(file.fsPath, file.content, true).length, 7);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze } from "../pipeline";
import { SourceFile } from "../java/model";

function analyzeSource(fsPath: string, content: string) {
  const files: SourceFile[] = [{ fsPath, content }];
  return analyze(files, { title: "media" });
}

test("Spring:consumes/produces 支持 MediaType.*_VALUE 常量(XML)", () => {
  const out = analyzeSource(
    "/mem/XmlController.java",
    `package com.example;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/media")
public class XmlController {
    @PostMapping(value = "/xml", consumes = MediaType.APPLICATION_XML_VALUE, produces = MediaType.APPLICATION_XML_VALUE)
    public String xml(@RequestBody String body) { return body; }
}`
  );
  const ep = out.endpoints.find((e) => e.path === "/api/media/xml");
  assert.ok(ep);
  assert.deepEqual(ep.consumes, ["application/xml"]);
  assert.deepEqual(ep.produces, ["application/xml"]);

  const op = out.spec.paths["/api/media/xml"].post as Record<string, any>;
  assert.ok(op.requestBody.content["application/xml"], Object.keys(op.requestBody.content).join(","));
  assert.ok(op.responses["200"].content["application/xml"], Object.keys(op.responses["200"].content).join(","));
});

test("Spring:produces = \"text/plain\" 生成 text/plain 响应 content", () => {
  const out = analyzeSource(
    "/mem/TextController.java",
    `package com.example;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/media")
public class TextController {
    @GetMapping(value = "/text", produces = "text/plain")
    public String text() { return "ok"; }
}`
  );
  const ep = out.endpoints.find((e) => e.path === "/api/media/text");
  assert.ok(ep);
  assert.deepEqual(ep.produces, ["text/plain"]);
  const op = out.spec.paths["/api/media/text"].get as Record<string, any>;
  assert.deepEqual(Object.keys(op.responses["200"].content), ["text/plain"]);
  assert.equal(op.responses["200"].content["text/plain"].schema.type, "string");
});

test("Spring:类级 @RequestMapping 的 consumes/produces 对方法生效(form-urlencoded)", () => {
  const out = analyzeSource(
    "/mem/ClassMediaController.java",
    `package com.example;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/class-media", consumes = "application/x-www-form-urlencoded", produces = "text/plain")
public class ClassMediaController {
    @PostMapping("/submit")
    public String submit(@RequestBody String body) { return body; }
}`
  );
  const ep = out.endpoints.find((e) => e.path === "/api/class-media/submit");
  assert.ok(ep);
  assert.deepEqual(ep.consumes, ["application/x-www-form-urlencoded"]);
  assert.deepEqual(ep.produces, ["text/plain"]);
  const op = out.spec.paths["/api/class-media/submit"].post as Record<string, any>;
  assert.ok(op.requestBody.content["application/x-www-form-urlencoded"]);
  assert.ok(op.responses["200"].content["text/plain"]);
});

test("Spring:多个 consumes/produces 生成多个 content 条目", () => {
  const out = analyzeSource(
    "/mem/MultiMediaController.java",
    `package com.example;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/media")
public class MultiMediaController {
    @PostMapping(
        value = "/multi",
        consumes = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE },
        produces = { "application/json", "text/plain" }
    )
    public String multi(@RequestBody String body) { return body; }
}`
  );
  const ep = out.endpoints.find((e) => e.path === "/api/media/multi");
  assert.ok(ep);
  assert.deepEqual(ep.consumes, ["application/json", "application/xml"]);
  assert.deepEqual(ep.produces, ["application/json", "text/plain"]);
  const op = out.spec.paths["/api/media/multi"].post as Record<string, any>;
  assert.deepEqual(Object.keys(op.requestBody.content), ["application/json", "application/xml"]);
  assert.deepEqual(Object.keys(op.responses["200"].content), ["application/json", "text/plain"]);
});

test("Spring:未声明媒体类型的接口保持 JSON 默认行为", () => {
  const out = analyzeSource(
    "/mem/DefaultMediaController.java",
    `package com.example;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/media")
public class DefaultMediaController {
    @PostMapping("/default")
    public String save(@RequestBody String body) { return body; }
}`
  );
  const ep = out.endpoints.find((e) => e.path === "/api/media/default");
  assert.ok(ep);
  assert.equal(ep.consumes, undefined);
  assert.equal(ep.produces, undefined);
  const op = out.spec.paths["/api/media/default"].post as Record<string, any>;
  assert.deepEqual(Object.keys(op.requestBody.content), ["application/json"]);
  assert.deepEqual(Object.keys(op.responses["200"].content), ["*/*"]);
});

test("Spring:方法级 consumes/produces 覆盖类级对应条件", () => {
  const out = analyzeSource(
    "/mem/OverrideMediaController.java",
    `package com.example;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/override-media", consumes = "application/json", produces = "text/plain")
public class OverrideMediaController {
    @PostMapping(value = "/submit", consumes = MediaType.APPLICATION_XML_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public String submit(@RequestBody String body) { return body; }

    @GetMapping("/fallback")
    public String fallback() { return "ok"; }
}`
  );
  const overridden = out.endpoints.find((e) => e.path === "/api/override-media/submit");
  assert.ok(overridden);
  assert.deepEqual(overridden.consumes, ["application/xml"]);
  assert.deepEqual(overridden.produces, ["application/json"]);
  const op = out.spec.paths["/api/override-media/submit"].post as Record<string, any>;
  assert.deepEqual(Object.keys(op.requestBody.content), ["application/xml"]);
  assert.deepEqual(Object.keys(op.responses["200"].content), ["application/json"]);

  // 方法未声明对应属性时仍继承类级条件
  const fallback = out.endpoints.find((e) => e.path === "/api/override-media/fallback");
  assert.ok(fallback);
  assert.deepEqual(fallback.produces, ["text/plain"]);
});

test("Spring:未列入基础表的 MediaType *_VALUE 常量同样映射为 mime", () => {
  const out = analyzeSource(
    "/mem/MoreMediaController.java",
    `package com.example;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/more-media")
public class MoreMediaController {
    @PostMapping(value = "/png", consumes = MediaType.IMAGE_PNG_VALUE, produces = MediaType.IMAGE_PNG_VALUE)
    public String png(@RequestBody String body) { return body; }

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public String pdf() { return "pdf"; }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public String events() { return "data: ok"; }

    @GetMapping(value = "/problem", produces = MediaType.APPLICATION_PROBLEM_JSON_VALUE)
    public String problem() { return "{}"; }
}`
  );
  const png = out.endpoints.find((e) => e.path === "/api/more-media/png");
  assert.ok(png);
  assert.deepEqual(png.consumes, ["image/png"]);
  assert.deepEqual(png.produces, ["image/png"]);
  const pngOp = out.spec.paths["/api/more-media/png"].post as Record<string, any>;
  assert.deepEqual(Object.keys(pngOp.requestBody.content), ["image/png"]);
  assert.deepEqual(Object.keys(pngOp.responses["200"].content), ["image/png"]);

  for (const [path, mime] of [
    ["/api/more-media/pdf", "application/pdf"],
    ["/api/more-media/events", "text/event-stream"],
    ["/api/more-media/problem", "application/problem+json"],
  ] as const) {
    const ep = out.endpoints.find((e) => e.path === path);
    assert.ok(ep, path);
    assert.deepEqual(ep.produces, [mime], path);
    const op = out.spec.paths[path].get as Record<string, any>;
    assert.deepEqual(Object.keys(op.responses["200"].content), [mime], path);
  }
});

test("JAX-RS:@Produces 多值同样生成多个响应 content;行为不回归", () => {
  const out = analyzeSource(
    "/mem/JaxrsMediaResource.java",
    `package com.example;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/api/jaxrs-media")
@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
public class JaxrsMediaResource {
    @GET
    public String list() { return "ok"; }
}`
  );
  const ep = out.endpoints.find((e) => e.path === "/api/jaxrs-media");
  assert.ok(ep);
  assert.deepEqual(ep.produces, ["application/json", "application/xml"]);
  const op = out.spec.paths["/api/jaxrs-media"].get as Record<string, any>;
  assert.deepEqual(Object.keys(op.responses["200"].content), ["application/json", "application/xml"]);
});

test("JAX-RS:类级与方法级 @Produces 按原有拼接行为同时保留(回归)", () => {
  const out = analyzeSource(
    "/mem/JaxrsOverrideResource.java",
    `package com.example;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/api/jaxrs-override")
@Produces(MediaType.APPLICATION_JSON)
public class JaxrsOverrideResource {
    @GET
    @Produces(MediaType.APPLICATION_XML)
    public String get() { return "ok"; }

    @GET
    @Path("/class-default")
    public String classDefault() { return "ok"; }
}`
  );
  const overridden = out.endpoints.find((e) => e.path === "/api/jaxrs-override");
  assert.ok(overridden);
  // 变更前为 concat(方法级在前),类级类型不能丢失
  assert.deepEqual(overridden.produces, ["application/xml", "application/json"]);
  const classDefault = out.endpoints.find((e) => e.path === "/api/jaxrs-override/class-default");
  assert.ok(classDefault);
  assert.deepEqual(classDefault.produces, ["application/json"]);
  const op = out.spec.paths["/api/jaxrs-override"].get as Record<string, any>;
  assert.deepEqual(Object.keys(op.responses["200"].content), ["application/xml", "application/json"]);
});

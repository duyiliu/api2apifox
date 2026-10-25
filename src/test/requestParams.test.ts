import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze } from "../pipeline";
import { SourceFile } from "../java/model";

const CONTROLLER = `
package com.example;

import java.security.Principal;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/params")
public class ParamController {
    @GetMapping("/cookie")
    public String cookie(@CookieValue("sid") String sid) { return sid; }

    @GetMapping("/cookie-default")
    public String cookieDefault(
            @CookieValue(value = "theme", defaultValue = "dark") String theme,
            @CookieValue(name = "optional", required = false) String optional) { return theme; }

    @GetMapping("/matrix/{id}")
    public String matrix(
            @PathVariable("id") Long id,
            @MatrixVariable("color") String color,
            @MatrixVariable("size") String size) { return id + color + size; }

    @GetMapping("/injected")
    public String injected(
            @RequestAttribute("user") String user,
            @SessionAttribute("tenant") String tenant,
            @Value("\${app.token}") String token,
            @Autowired Object collaborator,
            Principal principal,
            Authentication authentication,
            HttpServletRequest request,
            HttpSession session) { return user + tenant + token + collaborator + principal + authentication + request + session; }

    @GetMapping("/normal")
    public String normal(@RequestParam("q") String q, String keyword) { return q + keyword; }

    @PostMapping("/body")
    public String body(@RequestBody Model model) { return ""; }
}
`;

const files: SourceFile[] = [
  { fsPath: "/mem/ParamController.java", content: CONTROLLER },
  { fsPath: "/mem/Model.java", content: `
package com.example;
public class Model {
    /** 名称 */
    private String name;
}
` },
];
const out = analyze(files, { title: "demo" });

function paramsOf(path: string): Record<string, any>[] {
  const op = out.spec.paths[path].get as Record<string, any>;
  return Array.isArray(op.parameters) ? (op.parameters as Record<string, any>[]) : [];
}

test("@CookieValue 输出 in: cookie,默认必填", () => {
  const params = paramsOf("/api/params/cookie");
  assert.equal(params.length, 1);
  assert.equal(params[0].name, "sid");
  assert.equal(params[0].in, "cookie");
  assert.equal(params[0].required, true);
});

test("@CookieValue 支持 required/defaultValue(默认值隐式可选)", () => {
  const params = paramsOf("/api/params/cookie-default");
  const theme = params.find((p) => p.name === "theme")!;
  assert.equal(theme.in, "cookie");
  assert.equal(theme.required, false);
  assert.equal(theme.schema.default, "dark");
  const optional = params.find((p) => p.name === "optional")!;
  assert.equal(optional.in, "cookie");
  assert.equal(optional.required, false);
});

test("@MatrixVariable 跳过且同一方法只提示一次", () => {
  const params = paramsOf("/api/params/matrix/{id}");
  assert.deepEqual(params.map((p) => p.name), ["id"]);
  const matrixWarnings = out.warnings.filter(
    (w) => w.includes("ParamController.matrix") && w.includes("@MatrixVariable")
  );
  assert.equal(matrixWarnings.length, 1, out.warnings.join("|"));
});

test("容器注入参数(注解与类型)静默忽略,不产生 warning 噪声", () => {
  const params = paramsOf("/api/params/injected");
  assert.deepEqual(params, []);
  assert.ok(
    !out.warnings.some((w) => w.includes("ParamController.injected")),
    "容器注入参数不应产生告警: " + out.warnings.join("|")
  );
});

test("显式 @RequestBody 优先于同名注入类型,不误判为容器参数", () => {
  const op = out.spec.paths["/api/params/body"].post as Record<string, any>;
  assert.equal(op.requestBody.required, true);
  assert.ok(op.requestBody.content["application/json"].schema.$ref.includes("Model"), JSON.stringify(op.requestBody));
  assert.ok(!out.warnings.some((w) => w.includes("ParamController.body")), out.warnings.join("|"));
});

test("现有 @RequestParam 与无注解简单参数解析无回归", () => {
  const params = paramsOf("/api/params/normal");
  assert.deepEqual(params.map((p) => `${p.in}:${p.name}`), ["query:q", "query:keyword"]);
  assert.ok(!out.warnings.some((w) => w.includes("ParamController.normal")), out.warnings.join("|"));
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze, analyzeSubset } from "../pipeline";
import { SourceFile } from "../java/model";
import { collectExceptionAdvices } from "../java/exceptionAdvice";
import { parseJava } from "../java/typeIndex";

/* ------------------------------------------------------------------ *
 * Issue #38:@RestControllerAdvice/@ControllerAdvice + @ExceptionHandler
 * 解析为 OpenAPI 错误响应。覆盖状态码来源、错误体 schema、作用域
 * (全局 / basePackages / basePackageClasses / assignableTypes)与合并优先级。
 * ------------------------------------------------------------------ */

function analyzeSources(sources: Record<string, string>) {
  const files: SourceFile[] = Object.entries(sources).map(([name, content]) => ({
    fsPath: `/mem/${name}.java`,
    content,
  }));
  return analyze(files, { title: "advice" });
}

function op(spec: ReturnType<typeof analyze>["spec"], path: string, verb: string): Record<string, any> {
  return (spec.paths[path] as Record<string, any>)[verb] as Record<string, any>;
}

const CONTROLLER = `
package com.example.user;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
  /** 查询用户 */
  @GetMapping("/{id}")
  public UserVO get(@PathVariable Long id) { return null; }

  /** 创建用户 */
  @PostMapping
  public UserVO create(@RequestBody UserVO body) { return null; }
}
`;

const USER_VO = `
package com.example.user;

public class UserVO {
  private Long id;
  private String username;
}
`;

const ERROR_DTO = `
package com.example.common;

public class ResponseDto<T> {
  private int code;
  private String message;
  private T data;
}
`;

test("全局 @RestControllerAdvice:@ResponseStatus + ResponseDto<Void> 产出 400 及正确 schema", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    GlobalExceptionAdvice: `
package com.example.common;

import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionAdvice {
  /** 参数错误 */
  @ExceptionHandler(ParamException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> handleParam(ParamException e) { return null; }
}

class ParamException extends RuntimeException {}
`,
  });

  const get = op(res.spec, "/users/{id}", "get");
  assert.ok(get.responses["400"], "应出现 400 响应: " + JSON.stringify(Object.keys(get.responses)));
  assert.equal(get.responses["400"].description, "参数错误");
  // ResponseDto<Void> 走 schemaResolver 还原为组件引用
  const ref: string = get.responses["400"].content["*/*"].schema.$ref;
  assert.ok(ref, JSON.stringify(get.responses["400"]));
  const schema = res.spec.components!.schemas[ref.split("/").pop()!];
  assert.deepEqual(Object.keys(schema.properties!).sort(), ["code", "data", "message"]);
  // data 绑定 Void:对象占位,不误引成别的类型
  assert.equal(schema.properties!.data.type, "object");

  // 同一 advice 作用于全部扫描内 endpoints
  assert.ok(op(res.spec, "/users", "post").responses["400"]);
});

test("状态码来源:ResponseEntity.status / 工厂方法 / @ResponseStatus 名称与数字", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    StatusAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class StatusAdvice {
  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ResponseDto<Void>> notFound(NotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ResponseDto<Void>> conflict(ConflictException e) {
    return ResponseEntity.status(409).build();
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ResponseDto<Void>> forbidden(ForbiddenException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
  }

  // 工厂方法:body 类型取自泛型
  @ExceptionHandler(GoneException.class)
  public ResponseEntity<ResponseDto<Void>> gone(GoneException e) {
    return ResponseEntity.notFound().build();
  }

  @ExceptionHandler(NumberException.class)
  @ResponseStatus(value = 422)
  public ResponseDto<Void> unprocessable(NumberException e) { return null; }
}

class NotFoundException extends RuntimeException {}
class ConflictException extends RuntimeException {}
class ForbiddenException extends RuntimeException {}
class GoneException extends RuntimeException {}
class NumberException extends RuntimeException {}
`,
  });

  const get = op(res.spec, "/users/{id}", "get");
  assert.ok(get.responses["404"], "ResponseEntity.status(HttpStatus.NOT_FOUND): " + Object.keys(get.responses));
  assert.ok(get.responses["409"], "ResponseEntity.status(409)");
  assert.ok(get.responses["403"], "HttpStatus.FORBIDDEN");
  assert.ok(get.responses["422"], "@ResponseStatus(value = 422)");
  assert.ok(get.responses["404"].content["*/*"].schema.$ref, "ResponseEntity<T> 应剥离外壳后解析 T");
});

test("状态码无法解析时告警并跳过,不产出该响应", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    BareAdvice: `
package com.example.common;

import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class BareAdvice {
  @ExceptionHandler(IllegalStateException.class)
  public ResponseDto<Void> handle(IllegalStateException e) { return null; }
}
`,
  });
  const get = op(res.spec, "/users/{id}", "get");
  assert.deepEqual(Object.keys(get.responses), ["200"]);
  assert.ok(
    res.warnings.some((w) => w.includes("BareAdvice.handle") && w.includes("状态码")),
    res.warnings.join("\n")
  );
});

test("Void/void 返回不产出错误响应体,仍保留状态码", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    VoidAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class VoidAdvice {
  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public void badRequest(IllegalArgumentException e) { }

  @ExceptionHandler(UnsupportedOperationException.class)
  @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
  public Void notImplemented(UnsupportedOperationException e) { return null; }
}
`,
  });
  const get = op(res.spec, "/users/{id}", "get");
  assert.equal(get.responses["400"].content, undefined);
  assert.equal(get.responses["501"].content, undefined);
});

test("方法级 @ApiResponse/@ResponseStatus 优先,advice 不覆盖同状态码", () => {
  const res = analyzeSources({
    UserController: `
package com.example.user;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
  /** 创建用户 */
  @PostMapping
  @ApiResponses(@ApiResponse(code = 400, message = "方法级:字段校验失败"))
  public UserVO create(@RequestBody UserVO body) { return null; }

  @GetMapping("/plain")
  public UserVO plain() { return null; }
}
`,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    PrecedenceAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class PrecedenceAdvice {
  @ExceptionHandler(ParamException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> badRequest(ParamException e) { return null; }

  @ExceptionHandler(MissingException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ResponseDto<Void> notFound(MissingException e) { return null; }
}

class ParamException extends RuntimeException {}
class MissingException extends RuntimeException {}
`,
  });

  const create = op(res.spec, "/users", "post");
  assert.equal(create.responses["400"].description, "方法级:字段校验失败");
  assert.equal(create.responses["400"].content, undefined, "方法级声明不带 schema 时不应被 advice 补体");
  assert.ok(create.responses["404"], "未冲突的状态码仍由 advice 补上");

  // 未声明任何响应的接口只拿到 advice 的响应
  const plain = op(res.spec, "/users/plain", "get");
  assert.ok(plain.responses["400"]);
  assert.ok(plain.responses["404"]);
});

test("@ApiResponses 与 @ResponseStatus 同码时保留方法级声明", () => {
  const res = analyzeSources({
    UserController: `
package com.example.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void remove(@PathVariable Long id) { }
}
`,
    ResponseDto: ERROR_DTO,
    NoContentAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class NoContentAdvice {
  @ExceptionHandler(DeleteBlockedException.class)
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public ResponseDto<Void> blocked(DeleteBlockedException e) { return null; }
}

class DeleteBlockedException extends RuntimeException {}
`,
  });
  const del = op(res.spec, "/users/{id}", "delete");
  // 方法级 @ResponseStatus 的 204 已存在:advice 不覆盖(保留空 body)
  assert.equal(del.responses["204"].content, undefined);
});

test("同一 advice 内重复状态码按声明顺序保留首个并告警", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    DuplicateAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class DuplicateAdvice {
  @ExceptionHandler(FirstException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public ResponseDto<Void> first(FirstException e) { return null; }

  @ExceptionHandler(SecondException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public ResponseDto<Void> second(SecondException e) { return null; }
}

class FirstException extends RuntimeException {}
class SecondException extends RuntimeException {}
`,
  });
  const get = op(res.spec, "/users/{id}", "get");
  assert.ok(get.responses["409"]);
  assert.ok(
    res.warnings.some((w) => w.includes("DuplicateAdvice") && w.includes("409") && w.includes("重复声明")),
    res.warnings.join("\n")
  );
});

test("basePackages 收窄:只挂到匹配包的 Controller,挂不上记 warning", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    OrderController: `
package com.example.order;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
  @GetMapping("/{id}")
  public String get(@PathVariable Long id) { return null; }
}
`,
    UserPackageAdvice: `
package com.example.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice(basePackages = "com.example.user")
public class UserPackageAdvice {
  @ExceptionHandler(ParamException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> badRequest(ParamException e) { return null; }
}

class ParamException extends RuntimeException {}
`,
  });
  assert.ok(op(res.spec, "/users/{id}", "get").responses["400"], "匹配包应有 400");
  assert.equal(op(res.spec, "/orders/{id}", "get").responses["400"], undefined, "非匹配包不应有 400");
});

test("assignableTypes 收窄:父子继承链命中,其它 Controller 不挂", () => {
  const res = analyzeSources({
    BaseController: `
package com.example.api;

public abstract class BaseController {
}
`,
    UserController: `
package com.example.user;

import com.example.api.BaseController;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController extends BaseController {
  @GetMapping
  public String list() { return null; }
}
`,
    OrderController: `
package com.example.order;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
  @GetMapping
  public String list() { return null; }
}
`,
    ResponseDto: ERROR_DTO,
    AssignableAdvice: `
package com.example.common;

import com.example.api.BaseController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice(assignableTypes = BaseController.class)
public class AssignableAdvice {
  @ExceptionHandler(ParamException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> badRequest(ParamException e) { return null; }
}

class ParamException extends RuntimeException {}
`,
  });
  assert.ok(op(res.spec, "/users", "get").responses["400"], "父类链命中");
  assert.equal(op(res.spec, "/orders", "get").responses["400"], undefined, "无关 Controller 不挂");
});

test("收窄 advice 未匹配任何接口时记 warning 而不静默丢弃", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    UnmatchedAdvice: `
package com.example.other;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice(basePackages = "com.example.nowhere")
public class UnmatchedAdvice {
  @ExceptionHandler(ParamException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> badRequest(ParamException e) { return null; }
}

class ParamException extends RuntimeException {}
`,
  });
  assert.ok(
    res.warnings.some((w) => w.includes("UnmatchedAdvice") && w.includes("未匹配到任何扫描内接口")),
    res.warnings.join("\n")
  );
  assert.equal(op(res.spec, "/users/{id}", "get").responses["400"], undefined);
});

test("@ControllerAdvice(非 Rest)同样解析", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    PlainAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@ControllerAdvice
public class PlainAdvice {
  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ResponseBody
  public String badRequest(IllegalArgumentException e) { return null; }
}
`,
  });
  const get = op(res.spec, "/users/{id}", "get");
  assert.ok(get.responses["400"]);
  assert.deepEqual(get.responses["400"].content["*/*"].schema, { type: "string" });
});

test("无 advice 的项目产物与改动前一致(不产生额外响应/告警)", () => {
  const baseline = analyzeSources({ UserController: CONTROLLER, UserVO: USER_VO });
  for (const verb of ["get"]) {
    assert.deepEqual(Object.keys(op(baseline.spec, "/users/{id}", verb).responses), ["200"]);
  }
  assert.deepEqual(baseline.warnings, []);
  // 无 advice 时只有接口自身引用的模型,不引入错误包装组件
  assert.deepEqual(Object.keys(baseline.spec.components!.schemas), ["UserVO"]);
});

test("advice 中的 handler 不会被当成 REST endpoint", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    GlobalExceptionAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionAdvice {
  @ExceptionHandler(ParamException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> badRequest(ParamException e) { return null; }
}

class ParamException extends RuntimeException {}
`,
  });
  assert.deepEqual(
    res.endpoints.map((e) => `${e.method} ${e.path}`).sort(),
    ["GET /users/{id}", "POST /users"]
  );
});

test("@ControllerAdvice(\"com.example.user\") 的 value 作为 basePackages 别名生效", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    OrderController: `
package com.example.order;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
  @GetMapping
  public String list() { return null; }
}
`,
    ShorthandAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice("com.example.user")
public class ShorthandAdvice {
  @ExceptionHandler(ParamException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> badRequest(ParamException e) { return null; }
}

class ParamException extends RuntimeException {}
`,
  });
  assert.ok(op(res.spec, "/users/{id}", "get").responses["400"]);
  assert.equal(op(res.spec, "/orders", "get").responses["400"], undefined);
});

test("多个全局 advice 声明同状态码:保留先扫描到的并告警", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    AFirstAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class AFirstAdvice {
  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> badRequest(IllegalArgumentException e) { return null; }
}
`,
    BSecondAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class BSecondAdvice {
  @ExceptionHandler(IllegalStateException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public String badRequest(IllegalStateException e) { return null; }
}
`,
  });
  const get = op(res.spec, "/users/{id}", "get");
  // 保留先扫描到的 AFirstAdvice:ResponseDto<Void> 引用,而非第二个的 string
  assert.ok(get.responses["400"].content["*/*"].schema.$ref);
  assert.ok(
    res.warnings.some((w) => w.includes("400") && w.includes("AFirstAdvice") && w.includes("BSecondAdvice")),
    res.warnings.join("\n")
  );
});

test("单接口子集同步时保留 advice 自身的告警(不被当作他人告警过滤)", () => {
  const files: SourceFile[] = [
    { fsPath: "/mem/UserController.java", content: CONTROLLER },
    { fsPath: "/mem/UserVO.java", content: USER_VO },
    { fsPath: "/mem/ResponseDto.java", content: ERROR_DTO },
    {
      fsPath: "/mem/OtherController.java",
      content: `package com.example.other;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/others")
public class OtherController {
  @GetMapping
  public String list() { return null; }
}
`,
    },
    {
      fsPath: "/mem/BadAdvice.java",
      content: `package com.example.common;

import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class BadAdvice {
  @ExceptionHandler(IllegalStateException.class)
  public ResponseDto<Void> handle(IllegalStateException e) { return null; }
}
`,
    },
  ];
  const subset = analyzeSubset(files, { title: "advice" }, (ep) => ep.controller === "UserController");
  assert.ok(
    subset.warnings.some((w) => w.includes("BadAdvice") && w.includes("状态码")),
    "子集同步也必须能看到 advice 的解析问题: " + subset.warnings.join("\n")
  );
});

test("advice 只作用于 Spring MVC 接口,不污染 Feign/JAX-RS 产物", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    UserClient: `
package com.example.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "user", path = "/remote/users")
public interface UserClient {
  @GetMapping("/{id}")
  UserVO get(@PathVariable("id") Long id);
}
`,
    OrderResource: `
package com.example.jaxrs;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/jaxrs/orders")
public class OrderResource {
  @GET
  public String list() { return null; }
}
`,
    GlobalAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalAdvice {
  @ExceptionHandler(ParamException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ResponseDto<Void> badRequest(ParamException e) { return null; }
}

class ParamException extends RuntimeException {}
`,
  });
  assert.ok(op(res.spec, "/users/{id}", "get").responses["400"], "Spring MVC 应挂载");
  assert.equal(op(res.spec, "/remote/users/{id}", "get").responses["400"], undefined, "Feign 不应挂载");
  assert.equal(op(res.spec, "/jaxrs/orders", "get").responses["400"], undefined, "JAX-RS 不应挂载");
});

test("new ResponseEntity<>(body, HttpStatus.X) 构造器也能取到状态码", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    ConstructorAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ConstructorAdvice {
  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ResponseDto<Void>> conflict(ConflictException e) {
    return new ResponseEntity<>(build(e, 1), HttpStatus.CONFLICT);
  }

  private ResponseDto<Void> build(Exception e, int code) { return null; }
}

class ConflictException extends RuntimeException {}
`,
  });
  assert.ok(op(res.spec, "/users/{id}", "get").responses["409"]);
});

test("advice 声明 200 时不覆盖接口内置成功响应,并告警", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    OkAdvice: `
package com.example.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class OkAdvice {
  @ExceptionHandler(FallbackException.class)
  public ResponseEntity<ResponseDto<Void>> ok(FallbackException e) {
    return ResponseEntity.ok(null);
  }

  @ExceptionHandler(AlsoOkException.class)
  @ResponseStatus(HttpStatus.OK)
  public ResponseDto<Void> alsoOk(AlsoOkException e) { return null; }
}

class FallbackException extends RuntimeException {}
class AlsoOkException extends RuntimeException {}
`,
  });

  const get = op(res.spec, "/users/{id}", "get");
  // 内置 200 保留(returnType 为 UserVO,不是 advice 的 ResponseDto<Void>)
  assert.deepEqual(Object.keys(get.responses).sort(), ["200"]);
  assert.equal(get.responses["200"].description, "OK");
  assert.deepEqual(get.responses["200"].content["*/*"].schema, { $ref: "#/components/schemas/UserVO" });
  assert.equal(
    res.spec.components!.schemas["ResponseDto«Void»"],
    undefined,
    "冲突的 advice 错误体不应引入组件"
  );

  // 两条冲突声明各记一条 warning,且指向各自的方法
  const conflict = res.warnings.filter((w) => w.includes("内置成功响应"));
  assert.equal(conflict.length, 2, res.warnings.join("\n"));
  assert.ok(conflict.some((w) => w.includes("OkAdvice.ok") && w.includes("FallbackException")));
  assert.ok(conflict.some((w) => w.includes("OkAdvice.alsoOk") && w.includes("AlsoOkException")));
});

test("@ExceptionHandler 多异常数组:全部异常类型被解析,状态码共用", () => {
  const res = analyzeSources({
    UserController: CONTROLLER,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    ArrayAdvice: `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ArrayAdvice {
  /** 冲突 */
  @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
  @ResponseStatus(HttpStatus.CONFLICT)
  public ResponseDto<Void> conflict(RuntimeException e) { return null; }
}
`,
  });

  const get = op(res.spec, "/users/{id}", "get");
  assert.ok(get.responses["409"], JSON.stringify(Object.keys(get.responses)));
  assert.equal(get.responses["409"].description, "冲突");

  const advise = collectExceptionAdvices(
    [parseJava("/mem/ArrayAdvice.java", `
package com.example.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class ArrayAdvice {
  /** 冲突 */
  @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
  @ResponseStatus(HttpStatus.CONFLICT)
  public ResponseDto<Void> conflict(RuntimeException e) { return null; }
}
`)],
    undefined,
    []
  );
  assert.equal(advise.length, 1);
  assert.deepEqual(advise[0].responses[0].exceptionTypes, ["IllegalArgumentException", "IllegalStateException"]);
  assert.equal(advise[0].responses[0].code, "409");
});

test("方法级已声明 200 时 advice 的 200 跳过并告警,保留方法级声明", () => {
  const res = analyzeSources({
    UserController: `
package com.example.user;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
  @GetMapping("/{id}")
  @ApiResponse(responseCode = "200", description = "方法级:已声明成功体")
  public UserVO get(@PathVariable Long id) { return null; }
}
`,
    UserVO: USER_VO,
    ResponseDto: ERROR_DTO,
    OkAdvice: `
package com.example.common;

import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class OkAdvice {
  @ExceptionHandler(FallbackException.class)
  @ResponseStatus(HttpStatus.OK)
  public ResponseDto<Void> ok(FallbackException e) { return null; }
}

class FallbackException extends RuntimeException {}
`,
  });

  const get = op(res.spec, "/users/{id}", "get");
  assert.equal(get.responses["200"].description, "方法级:已声明成功体");
  assert.ok(
    res.warnings.some((w) => w.includes("OkAdvice.ok") && w.includes("方法级声明冲突")),
    res.warnings.join("\n")
  );
});

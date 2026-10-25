import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze } from "../pipeline";
import { SourceFile } from "../java/model";
import { loadPropertiesFiles } from "../config/helperProperties";
import { JsonSchema } from "../java/schemaResolver";

type Rules = ReturnType<typeof loadPropertiesFiles>;

function schemaOf(dtoSource: string, rootName: string, rules?: Rules): JsonSchema {
  const files: SourceFile[] = [
    { fsPath: "/mem/Dto.java", content: `package com.example;\n${dtoSource}` },
    {
      fsPath: "/mem/Ctl.java",
      content: `package com.example;
import org.springframework.web.bind.annotation.*;

@RestController
public class Ctl {
  @GetMapping("/x")
  public ${rootName} get() { return null; }
}
`,
    },
  ];
  const res = analyze(files, { title: "t", ...(rules ? { rules } : {}) });
  const schema = res.spec.components!.schemas[rootName];
  assert.ok(schema, `应生成模型 ${rootName}: ${Object.keys(res.spec.components!.schemas).join(",")}`);
  return schema;
}

test("@JsonNaming(SnakeCaseStrategy):camelCase 属性转 snake_case,显式注解优先", () => {
  const schema = schemaOf(
    `
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class NamingDto {
  private String userName;
  private String orderNo;
  @JsonProperty("explicitName")
  private String explicitValue;
}
`,
    "NamingDto"
  );
  assert.deepEqual(Object.keys(schema.properties!), ["user_name", "order_no", "explicitName"]);
});

test("@JsonNaming:支持 PropertyNamingStrategies 与旧 PropertyNamingStrategy 的常用策略", () => {
  const cases: [string, string][] = [
    ["PropertyNamingStrategies.KebabCaseStrategy", "user-name"],
    ["PropertyNamingStrategies.LowerCaseStrategy", "username"],
    ["PropertyNamingStrategies.UpperCamelCaseStrategy", "UserName"],
    ["PropertyNamingStrategies.LowerDotCaseStrategy", "user.name"],
    ["PropertyNamingStrategy.SnakeCaseStrategy", "user_name"],
  ];
  cases.forEach(([strategy, expected], i) => {
    const className = `StrategyDto${i}`;
    const schema = schemaOf(
      `
@JsonNaming(${strategy}.class)
public class ${className} {
  private String userName;
}
`,
      className
    );
    assert.deepEqual(Object.keys(schema.properties!), [expected], strategy);
  });
});

test("@JsonNaming:无注解类属性名保持不变", () => {
  const schema = schemaOf(
    `
public class PlainNamingDto {
  private String userName;
  private String plain;
}
`,
    "PlainNamingDto"
  );
  assert.deepEqual(Object.keys(schema.properties!), ["userName", "plain"]);
});

test("@JsonNaming:field.name 规则优先于类级策略与显式注解", () => {
  const rules = loadPropertiesFiles([
    { path: "/mem/.apifox-helper.properties", content: "field.name[#fieldName]=#fieldName" },
  ]);
  const schema = schemaOf(
    `
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class NamingRuleDto {
  /**
   * @fieldName ruleName
   */
  private String ruleField;

  /**
   * @fieldName explicitRuleName
   */
  @JsonProperty("explicitName")
  private String explicitField;
}
`,
    "NamingRuleDto",
    rules
  );
  assert.deepEqual(Object.keys(schema.properties!), ["ruleName", "explicitRuleName"]);
});

test("@JsonNaming:嵌套 DTO 与继承 DTO 同样生效", () => {
  const dto = `
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class NamingParentDto {
  private String createdAt;
  private String URLValue;
}

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class NamingChildDto extends NamingParentDto {
  private String userName;
  private NamingNestedDto nestedDto;
}

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class NamingNestedDto {
  private String nickName;
}
`;
  const child = schemaOf(dto, "NamingChildDto");
  assert.deepEqual(Object.keys(child.properties!), ["created_at", "url_value", "user_name", "nested_dto"]);
  assert.equal(child.properties!.nested_dto.$ref, "#/components/schemas/NamingNestedDto");

  const nested = schemaOf(dto, "NamingNestedDto");
  assert.deepEqual(Object.keys(nested.properties!), ["nick_name"]);
});

test("@JsonNaming:父类声明的策略被子类自有字段沿用", () => {
  const schema = schemaOf(
    `
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class NamingBaseDto {
  private String createdAt;
}

public class NamingInheritedDto extends NamingBaseDto {
  private String userName;
}
`,
    "NamingInheritedDto"
  );
  assert.deepEqual(Object.keys(schema.properties!), ["created_at", "user_name"]);
});

test("@JsonNaming:不影响 query Bean 参数名(Spring 按 Java 字段名绑定)", () => {
  const files: SourceFile[] = [
    {
      fsPath: "/mem/UserQuery.java",
      content: `package com.example;
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserQuery {
  private String userName;
}
`,
    },
    {
      fsPath: "/mem/Ctl.java",
      content: `package com.example;
import org.springframework.web.bind.annotation.*;

@RestController
public class Ctl {
  @GetMapping("/q")
  public String get(UserQuery query) { return null; }
}
`,
    },
  ];
  const res = analyze(files, { title: "t" });
  const op = res.spec.paths["/q"].get as Record<string, any>;
  assert.deepEqual(op.parameters.map((p: any) => p.name), ["userName"]);
});

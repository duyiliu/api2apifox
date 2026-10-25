import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze } from "../pipeline";
import { SourceFile } from "../java/model";
import { buildIndex, parseJava } from "../java/typeIndex";

function analyzeEnum(enumSource: string, enumName: string) {
  const files: SourceFile[] = [
    { fsPath: `/mem/${enumName}.java`, content: enumSource },
    {
      fsPath: "/mem/EnumController.java",
      content: `
package com.example;

import org.springframework.web.bind.annotation.*;

@RestController
public class EnumController {
  @GetMapping("/status")
  public ${enumName} status() { return null; }
}
`,
    },
  ];
  return analyze(files, { title: "t" });
}

function enumOf(out: ReturnType<typeof analyze>): string[] | undefined {
  const op = out.spec.paths["/status"].get as Record<string, any>;
  return op.responses["200"].content["*/*"].schema.enum;
}

test("@JsonValue return code:枚举按构造实参输出真实序列化值", () => {
  const out = analyzeEnum(
    `
package com.example;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Status {
    ACTIVE("A"),
    INACTIVE("I");

    private final String code;

    Status(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }
}
`,
    "Status"
  );
  assert.deepEqual(enumOf(out), ["A", "I"]);
  assert.ok(!out.warnings.some((w) => w.includes("Status")), out.warnings.join("|"));
});

test("@JsonValue return this.code 且 @JsonProperty 优先覆盖", () => {
  const out = analyzeEnum(
    `
package com.example;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Status {
    @JsonProperty("active")
    ACTIVE("A"),
    INACTIVE("I");

    private final String code;

    Status(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return this.code;
    }
}
`,
    "Status"
  );
  assert.deepEqual(enumOf(out), ["active", "I"]);
});

test("普通无值枚举输出保持常量名", () => {
  const out = analyzeEnum(
    `
package com.example;

public enum Mode {
    ON,
    OFF
}
`,
    "Mode"
  );
  assert.deepEqual(enumOf(out), ["ON", "OFF"]);
  assert.ok(!out.warnings.some((w) => w.includes("Mode")), out.warnings.join("|"));
});

test("@JsonValue 无法解析时告警并回退常量名", () => {
  const out = analyzeEnum(
    `
package com.example;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BrokenStatus {
    ACTIVE("A"),
    INACTIVE("I");

    private final String code;

    BrokenStatus(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code + "!";
    }
}
`,
    "BrokenStatus"
  );
  assert.deepEqual(enumOf(out), ["ACTIVE", "INACTIVE"]);
  assert.ok(
    out.warnings.some((w) => w.includes("BrokenStatus") && w.includes("@JsonValue") && w.includes("回退")),
    out.warnings.join("|")
  );
});

test("枚举常量 javadoc 与序列化值平行保存在类型索引", () => {
  const index = buildIndex([
    parseJava(
      "/mem/Status.java",
      `
package com.example;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Status {
    /** 启用 */
    ACTIVE("A"),
    /** 禁用 */
    INACTIVE("I");

    private final String code;

    Status(String code) {
        this.code = code;
    }

    @JsonValue
    public String getCode() {
        return code;
    }
}
`
    ),
  ]);
  const info = index.types.get("Status");
  assert.ok(info);
  assert.deepEqual(info.enumConstants, ["ACTIVE", "INACTIVE"]);
  assert.deepEqual(info.enumValues, ["A", "I"]);
  assert.deepEqual(info.enumDocs, ["启用", "禁用"]);
});

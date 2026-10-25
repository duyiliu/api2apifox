import assert from "node:assert/strict";
import { test } from "node:test";
import { loadPropertiesFiles } from "../config/helperProperties";
import { ClassInfo, SourceFile, TypeIndex } from "../java/model";
import { resolveTypeText, SchemaRegistry } from "../java/schemaResolver";
import { analyze } from "../pipeline";

function controller(className: string, path: string, returnType: string): string {
  return `
package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("${path}")
public class ${className} {
  @GetMapping
  public ${returnType} get() { return null; }
}
`;
}

const CONTROLLERS: SourceFile[] = [
  {
    fsPath: "/repo/src/main/java/com/example/RootController.java",
    content: controller("RootController", "/root", "String"),
  },
  {
    fsPath: "/repo/mod-a/src/main/java/com/example/AController.java",
    content: controller("AController", "/a", "ADto"),
  },
  {
    fsPath: "/repo/mod-b/src/main/java/com/example/BController.java",
    content: controller("BController", "/b", "BDto"),
  },
  {
    fsPath: "/repo/mod-a/src/main/java/com/example/ADto.java",
    content: `
package com.example;
public class ADto {
  /** A 共享字段 */
  private String shared;
  /** 仅 A 忽略 */
  private String onlyA;
}
`,
  },
  {
    fsPath: "/repo/mod-b/src/main/java/com/example/BDto.java",
    content: `
package com.example;
public class BDto {
  /** B 共享字段 */
  private String shared;
  /** 仅 A 忽略 */
  private String onlyA;
}
`,
  },
];

test("规则目录作用域:根规则全局,模块规则只作用于本模块并覆盖根规则", () => {
  const rules = loadPropertiesFiles(
    [
      // 故意打乱输入顺序:加载后仍按目录深度由浅到深应用
      { path: "/repo/mod-b/.apifox-helper.properties", content: "folder.name=B模块" },
      { path: "/repo/.apifox-helper.properties", content: "folder.name=全局" },
      { path: "/repo/mod-a/.apifox-helper.properties".split("/").join(String.fromCharCode(92)), content: "folder.name=A模块" },
    ],
    undefined,
    "/repo"
  );
  const res = analyze(CONTROLLERS, { title: "t", rules });
  const tagOf = (controllerName: string) =>
    res.endpoints.find((e) => e.controller === controllerName)?.tag;

  assert.equal(tagOf("RootController"), "全局", "模块外只应用根规则");
  assert.equal(tagOf("AController"), "A模块", "mod-a 规则覆盖根规则");
  assert.equal(tagOf("BController"), "B模块", "mod-b 规则覆盖根规则");
});

test("字段规则按类所在模块隔离:A 的 field.ignore/field.doc 不影响 B 的 DTO", () => {
  const rules = loadPropertiesFiles(
    [
      {
        path: "/repo/.apifox-helper.properties",
        content: "field.doc=根说明",
      },
      {
        path: "/repo/mod-a/.apifox-helper.properties",
        content: "field.ignore=onlyA\nfield.doc=A模块说明",
      },
    ],
    undefined,
    "/repo"
  );
  const res = analyze(CONTROLLERS, { title: "t", rules });
  const aDto = res.spec.components!.schemas.ADto;
  const bDto = res.spec.components!.schemas.BDto;

  assert.ok(!aDto.properties!.onlyA, "mod-a 的 field.ignore 应忽略 A 模块字段");
  assert.ok(aDto.properties!.shared.description!.includes("根说明"));
  assert.ok(aDto.properties!.shared.description!.includes("A模块说明"));

  assert.ok(bDto.properties!.onlyA, "mod-a 的 field.ignore 不应影响 B 模块 DTO");
  assert.ok(bDto.properties!.shared.description!.includes("根说明"));
  assert.ok(
    !bDto.properties!.shared.description!.includes("A模块说明"),
    "mod-a 的 field.doc 不应串到 B 模块 DTO"
  );
});

test("jar 中的类型没有源码路径:只应用项目根规则", () => {
  const jarDto: ClassInfo = {
    simpleName: "JarDto",
    qualifiedName: "com.framework.JarDto",
    kind: "class",
    typeParams: [],
    fields: [{ name: "moduleOnly", typeText: "String", annotations: [] }],
    recordComponents: [],
    enumConstants: [],
    annotations: [],
  };
  const index: TypeIndex = {
    types: new Map([["JarDto", jarDto]]),
    nested: new Map(),
    byFile: new Map(),
    jarLookup: () => jarDto,
  };
  const rules = loadPropertiesFiles(
    [
      { path: "/repo/.apifox-helper.properties", content: "field.doc=根说明" },
      { path: "/repo/mod-a/.apifox-helper.properties", content: "field.ignore=moduleOnly" },
    ],
    undefined,
    "/repo"
  );
  const registry = new SchemaRegistry();
  resolveTypeText("JarDto", { index, registry, fieldRules: rules });
  const schema = registry.schemas.JarDto;

  assert.ok(schema.properties!.moduleOnly, "jar 类型不应被模块级 field.ignore 忽略");
  assert.equal(schema.properties!.moduleOnly.description, "根说明");
});

test("properties.additional 继承主规则文件目录(模块作用域)", () => {
  const store = new Map<string, string>([
    ["/repo/mod-a/extra.properties", "field.doc=额外说明"],
  ]);
  const rules = loadPropertiesFiles(
    [
      {
        path: "/repo/mod-a/.apifox-helper.properties",
        content: "properties.additional=extra.properties",
      },
    ],
    (p) => store.get(p),
    "/repo"
  );
  const extra = rules.entries.find((e) => e.key === "field.doc");
  assert.ok(extra, "additional 中的规则应被加载");
  assert.equal(extra!.baseDir, "/repo/mod-a");
  assert.equal(rules.rootDir, "/repo");
});

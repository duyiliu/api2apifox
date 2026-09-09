import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze } from "../pipeline";
import { SourceFile } from "../java/model";
import { parseProperties, loadPropertiesFiles } from "../config/helperProperties";

const DTO = `
package com.example;

import io.swagger.annotations.ApiModelProperty;

public class PatientProfile {
  /** 分娩机构代码 */
  @ApiModelProperty("分娩机构代码")
  private String fmjgbm;

  @ApiModelProperty("性别")
  private String genderCode;

  @ApiModelProperty("忽略我")
  private String ignoreLog;

  private String rawName;

  /** 状态 */
  private MyStatus status;
}

enum MyStatus { ACTIVE("ACTIVE", "启用"), DISABLED("DISABLED", "禁用"); private final String code; private final String label; MyStatus(String code, String label) { this.code = code; this.label = label; } }
`;

const CTL = `
package com.example;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
public class PatientProfileController {
  /** 分页查询患者档案
   * @folder 档案管理
   */
  @GetMapping
  public PatientProfile getProfile(PatientProfile profile) { return null; }

  /** 忽略我 */
  @GetMapping("/x")
  public PatientProfile ignoredMethod() { return null; }
}
`;
const files: SourceFile[] = [
  { fsPath: "/mem/dto.java", content: DTO },
  { fsPath: "/mem/ctl.java", content: CTL },
];

test("e2e:field.doc @DataDic 条件规则为字段追加「框架字典」", () => {
  const rules = loadPropertiesFiles([
    {
      path: "/mem/.apifox-helper.properties",
      content: 'field.doc[@ext.plus.common.core.annotation.DataDic]=@ext.plus.common.core.annotation.DataDic#value',
    },
  ]);
  // DTO 里没有 @DataDic,先补:简单模拟另一个 DTO 带该注解
  const dto2 = DTO.replace("private String fmjgbm;", "@ext.plus.common.core.annotation.DataDic(value = \"FMJG\")\n  private String fmjgbm;");
  const res = analyze(
    files.map((f) => (f.fsPath.endsWith("dto.java") ? { ...f, content: dto2 } : f)),
    { title: "t", rules }
  );
  const schema = res.spec.components!.schemas["PatientProfile"];
  assert.ok(schema.properties!.fmjgbm.description!.includes("FMJG"));
  assert.ok(schema.properties!.fmjgbm.description!.includes("分娩机构代码"));
  assert.equal(schema.properties!.genderCode.description, "性别"); // 无 DataDic 不受影响
});

test("e2e:field.doc 字面量规则追加到已有描述", () => {
  const rules = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: "field.doc=来自配置文件补充说明" }]);
  const res = analyze(files, { title: "t", rules });
  const schema = res.spec.components!.schemas["PatientProfile"];
  assert.equal(schema.properties!.rawName.description, "来自配置文件补充说明");
  assert.ok(schema.properties!.fmjgbm.description!.includes("分娩机构代码"));
  assert.ok(schema.properties!.fmjgbm.description!.includes("来自配置文件补充说明"));
});

test("e2e:field.ignore 字面量忽略指定字段", () => {
  const rules = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: "field.ignore=ignoreLog" }]);
  const res = analyze(files, { title: "t", rules });
  const schema = res.spec.components!.schemas["PatientProfile"];
  assert.ok(!schema.properties!.ignoreLog);
  assert.ok(schema.properties!.fmjgbm);
});

test("e2e:field.name 覆盖字段输出名", () => {
  const rules = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: "field.name[#fieldName]=#fieldName" }]);
  const dto2 = DTO.replace(
    "/** 状态 */",
    "/** 状态\n   * @fieldName myStatusAlias\n   */"
  );
  const res = analyze(
    files.map((f) => (f.fsPath.endsWith("dto.java") ? { ...f, content: dto2 } : f)),
    { title: "t", rules }
  );
  const schema = res.spec.components!.schemas["PatientProfile"];
  assert.ok(schema.properties!.myStatusAlias);
  assert.ok(!schema.properties!.status);
});

test("e2e:folder.name=#folder 覆盖目录", () => {
  const rules = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: "folder.name=#folder" }]);
  const res = analyze(files, { title: "t", rules });
  const ep = res.endpoints.find((e) => e.path === "/api/profiles");
  assert.equal(ep!.tag, "档案管理");
});

test("e2e:ignore 忽略整个类与单个方法", () => {
  // 类级 ignore
  const rules1 = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: "ignore=#ignore" }]);
  const ctlIgnore = CTL.replace("@RestController", "/**\n * @ignore\n */\n@RestController");
  const res1 = analyze(
    files.map((f) => (f.fsPath.endsWith("ctl.java") ? { ...f, content: ctlIgnore } : f)),
    { title: "t", rules: rules1 }
  );
  assert.ok(!res1.endpoints.some((e) => e.controller === "PatientProfileController"));

  // 方法级 ignore
  const rules2 = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: "ignore=#ignore" }]);
  const ctlIgnore2 = CTL.replace("/** 忽略我 */", "/** 忽略我\n   * @ignore\n   */");
  const res2 = analyze(
    files.map((f) => (f.fsPath.endsWith("ctl.java") ? { ...f, content: ctlIgnore2 } : f)),
    { title: "t", rules: rules2 }
  );
  assert.ok(res2.endpoints.some((e) => e.path === "/api/profiles"));
  assert.ok(!res2.endpoints.some((e) => e.path === "/api/profiles/x"));
});

test("e2e:api.name 规则与 swagger 注解并存时注解优先", () => {
  const rules = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: "api.name=统一名称" }]);
  const res = analyze(files, { title: "t", rules });
  // getProfile 无 @Operation,javadoc 首行是"分页查询患者档案",api.name 应覆盖之
  const ep = res.endpoints.find((e) => e.path === "/api/profiles");
  assert.equal(ep!.summary, "统一名称");
});

test("e2e:groovy 经典形态(枚举小驼峰)安全求值成功且为枚举字段追加描述,无告警", () => {
  const groovyRule =
    'field.doc=groovy: (it.name()?.length() > 0 && Character.isLowerCase(it.name().charAt(0)) && helper.findClass(it.type()?.name())?.isEnum()) ? "（枚举类：" + it.type()?.name()?.substring(it.type()?.name()?.lastIndexOf(\'.\') + 1) + "）" : null';
  const rules = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: groovyRule }]);
  const res = analyze(files, { title: "t", rules });
  assert.ok(!res.warnings.some((w) => w.includes("groovy")), "不应有 groovy 无法执行的告警");
  const schema = res.spec.components!.schemas["PatientProfile"];
  assert.ok(schema.properties!.status.description!.includes("（枚举类：MyStatus）"));
});

test("e2e:enumFieldDoc 开关开启后枚举字段追加(枚举类:X)", () => {
  const res = analyze(files, { title: "t", enumFieldDoc: true });
  const schema = res.spec.components!.schemas["PatientProfile"];
  assert.ok(schema.properties!.status.description!.includes("(枚举类:MyStatus)"));
});

test("e2e:无注解查询 Bean 展开为 query 参数", () => {
  const ctl = `
package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/profiles")
public class PatientProfileController {
  /** 分页查询档案
   * @param query 查询条件
   */
  @GetMapping
  public PatientProfile page(PatientQuery query) { return null; }
}
`;
  const queryCls = `
package com.example;
public class PatientQuery {
  /** 姓名 */
  private String name;
  /** 页码 */
  private Integer pageNo;
  /** 性别枚举 */
  private MyStatus status;
  @ApiModelProperty("排除的就诊ID")
  private Long excludeVisitId;
}
`;
  const res = analyze(
    [
      { fsPath: "/mem/dto.java", content: DTO },
      { fsPath: "/mem/q.java", content: queryCls },
      { fsPath: "/mem/ctl.java", content: ctl },
    ],
    { title: "t" }
  );
  const op = res.spec.paths["/api/profiles"].get as Record<string, any>;
  const names = op.parameters.map((p: any) => p.name);
  assert.ok(names.includes("name"), "应展开 name: " + names);
  assert.ok(names.includes("pageNo"), "应展开 pageNo");
  assert.ok(names.includes("status"), "应展开 status");
  assert.ok(names.includes("excludeVisitId"), "应展开 excludeVisitId");
  const name = op.parameters.find((p: any) => p.name === "name");
  assert.equal(name.description, "姓名");
  // @ApiModelProperty 描述的字段(无字段 Javadoc)描述不应丢失
  const exclude = op.parameters.find((p: any) => p.name === "excludeVisitId");
  assert.equal(exclude.description, "排除的就诊ID");
  // 不再告警该参数被忽略
  assert.ok(!res.warnings.some((w) => w.includes("PatientQuery") && w.includes("已忽略")), res.warnings.join("|"));
});

test("e2e:spec 带 x-apifox-folder(根目录/目录来源)", () => {
  const res = analyze(files, {
    title: "t",
    folderOf: (ep) => `根/${ep.tag}`,
  });
  const op = res.spec.paths["/api/profiles"].get as Record<string, any>;
  assert.equal(op["x-apifox-folder"], "根/PatientProfileController");
});

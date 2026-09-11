import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze } from "../pipeline";
import { SourceFile } from "../java/model";
import { loadPropertiesFiles } from "../config/helperProperties";

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

test("e2e:枚举元素集合/数组字段(List<枚举>、枚举[])同样追加(枚举类:X)", () => {
  const groovyRule =
    'field.doc=groovy: (it.name()?.length() > 0 && Character.isLowerCase(it.name().charAt(0)) && helper.findClass(it.type()?.name())?.isEnum()) ? "（枚举类：" + it.type()?.name()?.substring(it.type()?.name()?.lastIndexOf(\'.\') + 1) + "）" : null';
  const rules = loadPropertiesFiles([{ path: "/mem/.apifox-helper.properties", content: groovyRule }]);
  // 列表元素为枚举:字段声明类型是 List,枚举判定需下钻到元素类型;纯字符串集合不受影响
  const dto2 = DTO.replace(
    "  /** 状态 */\n  private MyStatus status;",
    `  /** 状态 */
  private MyStatus status;

  /** 状态集合 */
  private java.util.List<MyStatus> statusList;

  /** 状态数组 */
  private MyStatus[] statusArray;

  /** 名称集合 */
  private java.util.List<String> nameList;`
  );
  const res = analyze(
    files.map((f) => (f.fsPath.endsWith("dto.java") ? { ...f, content: dto2 } : f)),
    { title: "t", rules }
  );
  const schema = res.spec.components!.schemas["PatientProfile"];
  assert.ok(schema.properties!.statusList.description!.includes("（枚举类：MyStatus）"));
  assert.ok(schema.properties!.statusArray.description!.includes("（枚举类：MyStatus）"));
  // 字符串集合不能被误判为枚举
  assert.ok(!schema.properties!.nameList.description!.includes("（枚举类"));
});

test("e2e:enumFieldDoc 开关对枚举元素集合字段同样生效", () => {
  const dto2 = DTO.replace(
    "  /** 状态 */\n  private MyStatus status;",
    `  /** 状态 */
  private MyStatus status;

  /** 状态集合 */
  private java.util.List<MyStatus> statusList;`
  );
  const res = analyze(
    files.map((f) => (f.fsPath.endsWith("dto.java") ? { ...f, content: dto2 } : f)),
    { title: "t", enumFieldDoc: true }
  );
  const schema = res.spec.components!.schemas["PatientProfile"];
  assert.ok(schema.properties!.status.description!.includes("(枚举类:MyStatus)"));
  assert.ok(schema.properties!.statusList.description!.includes("(枚举类:MyStatus)"));
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

test("e2e:record 形式的查询 Bean 与 class 一致展开为 query 参数", () => {
  // IDEA 版 Apifox Helper(easy-yapi)遍历 psiClass.fields,而 IntelliJ 平台把 record 组件
  // augment 成 PsiField,故 record 参数同样展开;这里保证两端行为一致。
  const ctl = `
package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/records")
public class RecordQueryController {
  /** 条件查询 */
  @GetMapping
  public PatientProfile page(PatientRecordQuery query) { return null; }
}
`;
  const queryRec = `
package com.example;
import io.swagger.annotations.ApiModelProperty;
public record PatientRecordQuery(
  /** 姓名 */
  String name,
  @ApiModelProperty("页码") Integer pageNo
) {}
`;
  const res = analyze(
    [
      { fsPath: "/mem/dto.java", content: DTO },
      { fsPath: "/mem/qrec.java", content: queryRec },
      { fsPath: "/mem/ctl.java", content: ctl },
    ],
    { title: "t" }
  );
  const op = res.spec.paths["/api/records"].get as Record<string, any>;
  const names = op.parameters.map((p: any) => p.name);
  assert.ok(names.includes("name"), "record 组件 name 应展开: " + names);
  assert.ok(names.includes("pageNo"), "record 组件 pageNo 应展开");
  // 首个组件的 javadoc 会挂到 recordComponentList 上,需回退读取
  assert.equal(op.parameters.find((p: any) => p.name === "name").description, "姓名");
  assert.equal(op.parameters.find((p: any) => p.name === "pageNo").description, "页码");
  assert.ok(
    !res.warnings.some((w) => w.includes("PatientRecordQuery")),
    "record 参数不应再产生无法展开的告警: " + res.warnings.join("|")
  );
});

test("e2e:查询 Bean 的嵌套对象按点号展开,集合并列保持数组形态", () => {
  const ctl = `
package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/nested")
public class NestedQueryController {
  /** 条件查询 */
  @GetMapping
  public PatientProfile page(NestedQuery query) { return null; }
}
`;
  const queryCls = `
package com.example;
import java.util.List;
public class NestedQuery {
  /** 关键字 */
  private String keyword;
  /** 过滤条件 */
  private Filter filter;
  /** 科室编码 */
  private List<String> deptCodes;
  /** 分页 */
  private PagePart page;
}
class Filter {
  /** 名称 */
  private String name;
  /** 起始日期 */
  private java.time.LocalDate startDate;
}
class PagePart {
  private Integer pageNo;
}
`;
  const res = analyze(
    [
      { fsPath: "/mem/dto.java", content: DTO },
      { fsPath: "/mem/nq.java", content: queryCls },
      { fsPath: "/mem/ctl.java", content: ctl },
    ],
    { title: "t" }
  );
  const op = res.spec.paths["/api/nested"].get as Record<string, any>;
  const names = op.parameters.map((p: any) => p.name);
  // 嵌套对象:Spring 按 WebDataBinder 的 autoGrowNestedPaths 以 父.子 绑定
  assert.ok(names.includes("filter.name"), "嵌套字段应带父前缀: " + names);
  assert.ok(names.includes("filter.startDate"), "嵌套字段应带父前缀(含日期类型)");
  assert.ok(names.includes("page.pageNo"), "二级嵌套父字段应带前缀");
  assert.ok(names.includes("keyword"), "顶层字段保持原名");
  assert.equal(op.parameters.find((p: any) => p.name === "filter.name").description, "名称");
  // 集合保持数组形态,不采用 easy-yapi 的 deptCodes[0] 命名
  const dept = op.parameters.find((p: any) => p.name === "deptCodes");
  assert.equal(dept.schema.type, "array");
  assert.ok(!names.some((n: string) => n.includes("[0]")), "不应出现 [0] 形态: " + names);
});

test("e2e:查询 Bean 循环引用与层级超限不再静默丢弃,产生告警", () => {
  const ctl = `
package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/cycle")
public class CycleQueryController {
  /** 循环 */
  @GetMapping
  public PatientProfile page(CycleA query) { return null; }
}
`;
  const classes = `
package com.example;
public class CycleA {
  private CycleB b;
  private String aName;
}
class CycleB {
  private CycleA a;
  private String bName;
}
class Deep1 { private Deep2 d2; private String n1; }
class Deep2 { private Deep3 d3; private String n2; }
class Deep3 { private Deep4 d4; private String n3; }
class Deep4 { private Deep5 d5; private String n4; }
class Deep5 { private Deep6 d6; private String n5; }
class Deep6 { private String n6; }
`;
  const ctlDeep = `
package com.example;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/deep")
public class DeepQueryController {
  /** 过深 */
  @GetMapping
  public PatientProfile page(Deep1 query) { return null; }
}
`;
  const res = analyze(
    [
      { fsPath: "/mem/dto.java", content: DTO },
      { fsPath: "/mem/cyc.java", content: classes },
      { fsPath: "/mem/ctl.java", content: ctl },
      { fsPath: "/mem/ctl2.java", content: ctlDeep },
    ],
    { title: "t" }
  );
  const op = res.spec.paths["/api/cycle"].get as Record<string, any>;
  const names = op.parameters.map((p: any) => p.name);
  // 循环引用处截断,其余字段正常展开,且不出现无限递归
  assert.ok(names.includes("aName"), "根字段应展开: " + names);
  assert.ok(names.includes("b.bName"), "循环前的嵌套字段应展开");
  assert.ok(
    res.warnings.some((w) => w.includes("循环引用")),
    "循环引用应产生告警: " + res.warnings.join("|")
  );

  // 层级上限:超过 5 层的字段拒绝展开并告警,不再静默丢失
  const deepParams = (res.spec.paths["/api/deep"].get as Record<string, any>).parameters
    .map((p: any) => p.name);
  assert.ok(deepParams.includes("d2.d3.d4.d5.n5"), "5 层内的字段应展开: " + deepParams);
  assert.ok(
    res.warnings.some((w) => w.includes("嵌套层级超过")),
    "超限字段应产生告警: " + res.warnings.join("|")
  );
});

test("e2e:spec 带 x-apifox-folder(根目录/目录来源)", () => {
  const res = analyze(files, {
    title: "t",
    folderOf: (ep) => `根/${ep.tag}`,
  });
  const op = res.spec.paths["/api/profiles"].get as Record<string, any>;
  assert.equal(op["x-apifox-folder"], "根/PatientProfileController");
});

import { collectAnnotations, parseArgsText } from "./annotation";
import { CstNode, childAll, childNode, findAll, isCstNode, nodeJavadoc, nodeText, tokenImage, typeNameOf } from "./cst";
import { parseJavadoc } from "./javadoc";
import { parseTypeText, simpleName } from "./typeText";
import { HelperProperties } from "../config/helperProperties";
import { evalCondition, evalRuleValue, RuleContext } from "./ruleEval";
import {
  annArray, annBool, annStr, AnnotationInfo, ClassInfo, EndpointFlavor, EndpointInfo, findAnn,
  ParseResult, ParameterInfo, RequestBodyInfo, ResponseInfo, TypeIndex,
} from "./model";
import { schemaExample, schemaDescription } from "./schemaResolver";
import { ParsedFile, resolveIndexedType } from "./typeIndex";

const SPRING_MAPPINGS: Record<string, string[]> = {
  GetMapping: ["GET"],
  PostMapping: ["POST"],
  PutMapping: ["PUT"],
  DeleteMapping: ["DELETE"],
  PatchMapping: ["PATCH"],
};
const SPRING_MAPPING_NAMES = [...Object.keys(SPRING_MAPPINGS), "RequestMapping"];

const JAXRS_METHODS: Record<string, string> = {
  GET: "GET", POST: "POST", PUT: "PUT", DELETE: "DELETE", PATCH: "PATCH", HEAD: "HEAD", OPTIONS: "OPTIONS",
};

const HTTP_STATUS_BY_NAME: Record<string, string> = {
  OK: "200", CREATED: "201", ACCEPTED: "202", NO_CONTENT: "204",
  MOVED_PERMANENTLY: "301", FOUND: "302", NOT_MODIFIED: "304",
  BAD_REQUEST: "400", UNAUTHORIZED: "401", PAYMENT_REQUIRED: "402", FORBIDDEN: "403", NOT_FOUND: "404",
  METHOD_NOT_ALLOWED: "405", NOT_ACCEPTABLE: "406", CONFLICT: "409", GONE: "410",
  UNSUPPORTED_MEDIA_TYPE: "415", TOO_MANY_REQUESTS: "429",
  INTERNAL_SERVER_ERROR: "500", NOT_IMPLEMENTED: "501", BAD_GATEWAY: "502", SERVICE_UNAVAILABLE: "503",
};

const MEDIA_TYPE_CONSTANTS: Record<string, string> = {
  APPLICATION_JSON: "application/json",
  APPLICATION_JSON_UTF8: "application/json;charset=UTF-8",
  APPLICATION_XML: "application/xml",
  APPLICATION_FORM_URLENCODED: "application/x-www-form-urlencoded",
  APPLICATION_OCTET_STREAM: "application/octet-stream",
  MULTIPART_FORM_DATA: "multipart/form-data",
  TEXT_PLAIN: "text/plain",
  TEXT_HTML: "text/html",
  TEXT_XML: "text/xml",
};

/** 把 "MediaType.APPLICATION_JSON"/"application/json" 统一映射为 mime */
function toMimeType(raw: string): string {
  const last = raw.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw;
  return MEDIA_TYPE_CONSTANTS[last.trim()] ?? raw.trim().replace(/^"|"$/g, "");
}

/** 解析 REST 接口:Spring MVC Controller、OpenFeign 接口、JAX-RS 资源类、Actuator @Endpoint */
export function parseControllers(files: ParsedFile[], rules?: HelperProperties, index?: TypeIndex): ParseResult {
  const endpoints: EndpointInfo[] = [];
  const ruleWarnings: string[] = [];
  const warnings: string[] = [];

  for (const pf of files) {
    for (const typeDecl of findAll(pf.cst, "typeDeclaration")) {
      const classDecl = childNode(typeDecl, "classDeclaration");
      const interfaceDecl = childNode(typeDecl, "interfaceDeclaration");
      const normal = classDecl ? childNode(classDecl, "normalClassDeclaration") : undefined;
      const normalItf = interfaceDecl ? childNode(interfaceDecl, "normalInterfaceDeclaration") : undefined;
      if (!normal && !normalItf) {
        continue;
      }
      const declNode = (normal ?? normalItf) as CstNode;
      const isInterface = !!normalItf;
      const typeAnnotations = collectAnnotations(
        [
          ...childAll(classDecl, "classModifier"),
          ...childAll(interfaceDecl, "classModifier"),
          ...childAll(interfaceDecl, "interfaceModifier"),
          ...childAll(declNode, "classModifier"),
          ...childAll(declNode, "interfaceModifier"),
        ].filter(isCstNode),
        pf.source
      );
      const typeName = typeNameOf(declNode);

      // 类型风格判定
      const isSpringController = !!findAnn(typeAnnotations, "RestController", "Controller");
      const isFeign = isInterface && !!findAnn(typeAnnotations, "FeignClient");
      const pathAnn = findAnn(typeAnnotations, "Path");
      const isJaxrs = !isSpringController && !isFeign && !!pathAnn;
      const actuatorAnn = findAnn(typeAnnotations, "Endpoint");
      const isActuator = !isSpringController && !isFeign && !isJaxrs && !!actuatorAnn;
      if (!isSpringController && !isFeign && !isJaxrs && !isActuator) {
        continue;
      }
      const flavor: EndpointFlavor = isSpringController ? "spring-mvc" : isFeign ? "feign" : isJaxrs ? "jaxrs" : "actuator";

      // 类级路径前缀
      let basePaths: string[] = [""];
      if (isActuator) {
        basePaths = ["/actuator/" + (annStr(actuatorAnn!.args, "id", "value") ?? typeName.toLowerCase())];
      } else {
        const classMapping = findAnn(typeAnnotations, "RequestMapping");
        if (classMapping) {
          basePaths = pathArgsOf(classMapping);
        } else if (isFeign) {
          const feignPath = annStr(findAnn(typeAnnotations, "FeignClient")!.args, "path");
          basePaths = feignPath ? [feignPath] : [""];
        } else if (isJaxrs) {
          basePaths = pathAnn ? pathArgsOf(pathAnn) : [""];
        }
      }

      // tag: @Tag(name) / @Api(tags[0]) / 类型名
      const tagAnn = findAnn(typeAnnotations, "Tag");
      const apiAnn = findAnn(typeAnnotations, "Api");
      let tag =
        (tagAnn && annStr(tagAnn.args, "name", "value")) ||
        (apiAnn && annArray(apiAnn.args, "tags", "value")[0]) ||
        typeName;
      const classJavadoc = parseJavadoc(nodeJavadoc(typeDecl));
      // 类级 ignore 规则命中 → 整类不产接口
      let typeIgnored = false;

      // .apifox-helper.properties 类级规则(ignore / folder.name)
      if (rules) {
        const classCtx: RuleContext = {
          annotations: typeAnnotations,
          javadocRaw: nodeJavadoc(typeDecl),
          subject: `类 ${typeName}`,
        };
        // ignore:命中则整类跳过
        for (const e of rules.entries) {
          if (e.key !== "ignore") {
            continue;
          }
          const cond = evalCondition(e.cond, classCtx, e.key, (m) => ruleWarnings.push(m));
          if (!cond.supported) {
            ruleWarnings.push(`${e.key} 条件无法求值,已跳过:${truncate(e.cond ?? "", 50)}(文件 ${e.file}:${e.line})`);
            continue;
          }
          if (!cond.hit) {
            continue;
          }
          const v = evalRuleValue(e.value, classCtx, e.key, (m) => ruleWarnings.push(m));
          if (v.skipped && v.reason) {
            ruleWarnings.push(`${v.reason}(文件 ${e.file}:${e.line})`);
            continue;
          }
          if (v.matched && v.value !== undefined && v.value !== "") {
            typeIgnored = true;
            break;
          }
        }
        // 类级 folder.name(官方文档 folder.name 以 method 为目标;此处兼容“整类统一目录”的常见用法,
        // 值支持字面量/@注解#attr/#tag。方法级 folder.name(见方法处理)优先级更高,会覆盖此值)
        for (const e of rules.entries) {
          if (e.key !== "folder.name" || typeIgnored) {
            continue;
          }
          const cond = evalCondition(e.cond, classCtx, e.key, (m) => ruleWarnings.push(m));
          if (!cond.supported) {
            ruleWarnings.push(`${e.key} 条件无法求值,已跳过:${truncate(e.cond ?? "", 50)}(文件 ${e.file}:${e.line})`);
            continue;
          }
          if (!cond.hit) {
            continue;
          }
          const v = evalRuleValue(e.value, classCtx, e.key, (m) => ruleWarnings.push(m));
          if (v.skipped && v.reason) {
            ruleWarnings.push(`${v.reason}(文件 ${e.file}:${e.line})`);
            continue;
          }
          if (v.matched && v.value !== undefined && v.value.trim()) {
            tag = v.value;
          }
        }
      }

      // JAX-RS 类级 @Consumes/@Produces 对所有方法生效(方法级优先)
      const classConsumes = annArray(findAnn(typeAnnotations, "Consumes")?.args ?? {}, "value").map(toMimeType);
      const classProduces = annArray(findAnn(typeAnnotations, "Produces")?.args ?? {}, "value").map(toMimeType);

      // 收集方法(类/接口的包装节点与修饰符规则不同;Javadoc 均附着在最近的包装节点上)
      const methodHits: { method: CstNode; wrapper: CstNode; modifierKey: string }[] = [];
      if (isInterface) {
        for (const member of childAll(childNode(declNode, "interfaceBody"), "interfaceMemberDeclaration").filter(isCstNode)) {
          const m = childNode(member, "interfaceMethodDeclaration");
          if (m) {
            methodHits.push({ method: m, wrapper: member, modifierKey: "interfaceMethodModifier" });
          }
        }
      } else {
        for (const member of childAll(childNode(declNode, "classBody"), "classBodyDeclaration").filter(isCstNode)) {
          const memberDecl = childNode(member, "classMemberDeclaration") ?? childNode(member, "memberDeclaration");
          const m = childNode(memberDecl, "methodDeclaration");
          if (m) {
            methodHits.push({ method: m, wrapper: member, modifierKey: "methodModifier" });
          }
        }
      }

      for (const { method, wrapper, modifierKey } of methodHits) {
        const methodAnnotations = collectAnnotations(childAll(method, modifierKey).filter(isCstNode), pf.source);

        // @Operation(hidden=true)/@Api(hidden=true) 的接口跳过
        const operationAnn = findAnn(methodAnnotations, "Operation");
        const apiMethodAnn = findAnn(methodAnnotations, "Api");
        if (annBool(operationAnn?.args ?? {}, "hidden") === true || annBool(apiMethodAnn?.args ?? {}, "hidden") === true) {
          continue;
        }

        const header = childNode(method, "methodHeader") ?? method;
        const declarator = childNode(header, "methodDeclarator");
        const methodName = tokenImage(declarator, "Identifier") ?? "";
        if (!methodName) {
          continue;
        }

        // .apifox-helper.properties 方法级规则(ignore / api.name / method.description)
        let methodIgnored = typeIgnored;
        let ruleSummary: string | undefined;
        let ruleDescAppend: string | undefined;
        let ruleFolder: string | undefined;
        if (rules && !methodIgnored) {
          const methodRawJavadoc = nodeJavadoc(wrapper);
          const mctx: RuleContext = {
            annotations: methodAnnotations,
            javadocRaw: methodRawJavadoc,
            subject: `方法 ${typeName}.${methodName}`,
            extraAnnotations: typeAnnotations,
          };
          const warn = (m: string) => ruleWarnings.push(m);
          for (const e of rules.entries) {
            if (e.key !== "ignore") {
              continue;
            }
            const cond = evalCondition(e.cond, mctx, e.key, warn);
            if (!cond.supported) {
              warn(`${e.key} 条件无法求值,已跳过:${truncate(e.cond ?? "", 50)}(文件 ${e.file}:${e.line})`);
              continue;
            }
            if (!cond.hit) {
              continue;
            }
            const v = evalRuleValue(e.value, mctx, e.key, warn);
            if (v.skipped && v.reason) {
              warn(`${v.reason}(文件 ${e.file}:${e.line})`);
              continue;
            }
            if (v.matched && v.value !== undefined && v.value !== "") {
              methodIgnored = true;
            }
          }
          // api.name
          if (!methodIgnored) {
            for (const e of rules.entries) {
              if (e.key !== "folder.name") {
                continue;
              }
              const cond = evalCondition(e.cond, mctx, e.key, warn);
              if (!cond.supported) {
                warn(`${e.key} 条件无法求值,已跳过:${truncate(e.cond ?? "", 50)}(文件 ${e.file}:${e.line})`);
                continue;
              }
              if (!cond.hit) {
                continue;
              }
              const v = evalRuleValue(e.value, mctx, e.key, warn);
              if (v.skipped && v.reason) {
                warn(`${v.reason}(文件 ${e.file}:${e.line})`);
                continue;
              }
              if (v.matched && v.value !== undefined && v.value.trim()) {
                ruleFolder = v.value;
              }
            }
            // api.name
            for (const e of rules.entries) {
              if (e.key !== "api.name") {
                continue;
              }
              const cond = evalCondition(e.cond, mctx, e.key, warn);
              if (!cond.supported) {
                warn(`${e.key} 条件无法求值,已跳过:${truncate(e.cond ?? "", 50)}(文件 ${e.file}:${e.line})`);
                continue;
              }
              if (!cond.hit) {
                continue;
              }
              const v = evalRuleValue(e.value, mctx, e.key, warn);
              if (v.skipped && v.reason) {
                warn(`${v.reason}(文件 ${e.file}:${e.line})`);
                continue;
              }
              if (v.matched && v.value !== undefined && v.value.trim()) {
                ruleSummary = v.value;
              }
            }
            // method.description(追加,官方语义“额外注释”)
            const appends: string[] = [];
            for (const e of rules.entries) {
              if (e.key !== "method.description" && e.key !== "method.doc") {
                continue;
              }
              const cond = evalCondition(e.cond, mctx, e.key, warn);
              if (!cond.supported) {
                warn(`${e.key} 条件无法求值,已跳过:${truncate(e.cond ?? "", 50)}(文件 ${e.file}:${e.line})`);
                continue;
              }
              if (!cond.hit) {
                continue;
              }
              const v = evalRuleValue(e.value, mctx, e.key, warn);
              if (v.skipped && v.reason) {
                warn(`${v.reason}(文件 ${e.file}:${e.line})`);
                continue;
              }
              if (v.matched && v.value !== undefined && v.value.trim()) {
                appends.push(v.value);
              }
            }
            if (appends.length) {
              ruleDescAppend = appends.join("\n");
            }
          }
        }
        if (methodIgnored) {
          continue;
        }

        const mappings = resolveMapping(methodAnnotations, flavor);
        if (!mappings.length) {
          continue;
        }
        const consumes = annArray(findAnn(methodAnnotations, "Consumes")?.args ?? {}, "value").map(toMimeType).concat(classConsumes);
        const produces = annArray(findAnn(methodAnnotations, "Produces")?.args ?? {}, "value").map(toMimeType).concat(classProduces);

        for (const m of mappings) {
          for (const mp of m.paths) {
            for (const bp of basePaths) {
              const ep = buildEndpoint(pf, warnings, {
                flavor,
                verb: m.method,
                path: joinPath(bp, mp),
                tag: ruleFolder ?? tag,
                controller: typeName,
                methodName,
                methodAnnotations,
                method,
                wrapper,
                classJavadoc,
                consumes,
                produces,
                ruleSummary,
                ruleDescAppend,
                index,
              });
              if (ep) {
                endpoints.push(ep);
              }
            }
          }
        }
      }
    }
  }
  warnings.push(...ruleWarnings);
  return { endpoints, warnings };
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

interface MethodMapping {
  method: string;
  paths: string[];
}

/** 方法上的路由声明 -> HTTP 动词 + 路径(可能多组) */
function resolveMapping(annotations: AnnotationInfo[], flavor: EndpointFlavor): MethodMapping[] {
  if (flavor === "actuator") {
    const op = findAnn(annotations, "ReadOperation", "WriteOperation", "DeleteOperation");
    if (!op) {
      return [];
    }
    const verb = op.name === "ReadOperation" ? "GET" : op.name === "WriteOperation" ? "POST" : "DELETE";
    return [{ method: verb, paths: [""] }];
  }
  if (flavor === "jaxrs") {
    const verbAnn = annotations.find((a) => JAXRS_METHODS[a.name]);
    if (!verbAnn) {
      return [];
    }
    const pathAnn = findAnn(annotations, "Path");
    return [{ method: JAXRS_METHODS[verbAnn.name], paths: pathArgsOf(pathAnn ?? verbAnn) }];
  }
  // spring-mvc / feign
  const mapping = findAnn(annotations, ...SPRING_MAPPING_NAMES);
  if (!mapping) {
    return [];
  }
  let verbs: string[];
  if (SPRING_MAPPINGS[mapping.name]) {
    verbs = SPRING_MAPPINGS[mapping.name];
  } else {
    const declared = annArray(mapping.args, "method");
    verbs = declared.length
      ? declared.map((m) => (m.includes(".") ? m.slice(m.lastIndexOf(".") + 1) : m).toUpperCase())
      : ["GET"];
  }
  const paths = pathArgsOf(mapping);
  return verbs.map((method) => ({ method, paths }));
}

interface EndpointArgs {
  flavor: EndpointFlavor;
  verb: string;
  path: string;
  tag: string;
  controller: string;
  methodName: string;
  methodAnnotations: AnnotationInfo[];
  method: CstNode;
  wrapper: CstNode;
  classJavadoc: ReturnType<typeof parseJavadoc>;
  consumes: string[];
  produces: string[];
  /** api.name 规则覆盖(summary 用;swagger 注解仍优先) */
  ruleSummary?: string;
  /** method.description 规则追加到 description */
  ruleDescAppend?: string;
  /** 全项目类型索引(用于展开无注解的查询 Bean 参数) */
  index?: TypeIndex;
}

function buildEndpoint(pf: ParsedFile, warnings: string[], a: EndpointArgs): EndpointInfo {
  const javadoc = parseJavadoc(nodeJavadoc(a.wrapper));

  const operationAnn = findAnn(a.methodAnnotations, "Operation");
  const apiOperation = findAnn(a.methodAnnotations, "ApiOperation");
  // summary 优先级:@Operation/@ApiOperation > api.name 规则 > javadoc 首行 > 方法名
  const summary =
    (operationAnn && annStr(operationAnn.args, "summary", "value")) ||
    (apiOperation && annStr(apiOperation.args, "value")) ||
    a.ruleSummary ||
    javadoc?.firstLine ||
    a.methodName;
  let description =
    (operationAnn && annStr(operationAnn.args, "description")) ||
    (apiOperation && annStr(apiOperation.args, "notes")) ||
    (javadoc && javadoc.description && javadoc.description !== javadoc.firstLine ? javadoc.description : undefined);
  if (a.ruleDescAppend) {
    description = description ? `${description}\n${a.ruleDescAppend}` : a.ruleDescAppend;
  }

  // ---- 参数 ----
  const header = childNode(a.method, "methodHeader") ?? a.method;
  const declarator = childNode(header, "methodDeclarator");
  const paramList = childNode(declarator, "formalParameterList");
  const parameters: ParameterInfo[] = [];
  const formFields: ParameterInfo[] = [];
  let requestBody: RequestBodyInfo | undefined;
  const paramDocs = { ...a.classJavadoc?.params, ...javadoc?.params };

  for (const fp of childAll(paramList, "formalParameter").filter(isCstNode)) {
    const regular = childNode(fp, "variableParaRegularParameter") ?? childNode(fp, "variableArityParameter");
    if (!regular) {
      continue;
    }
    const annotations = collectAnnotations(childAll(regular, "variableModifier").filter(isCstNode), pf.source);
    const typeNode = childNode(regular, "unannType");
    const typeText = typeNode ? nodeText(pf.source, typeNode).trim() : "Object";
    const paramName = tokenImage(childNode(regular, "variableDeclaratorId"), "Identifier") ?? "";
    if (!paramName) {
      continue;
    }
    if (isHiddenParam(annotations)) {
      continue;
    }

    const docDesc = paramDocs[paramName]?.trim() || undefined;
    const paramAnn = findAnn(annotations, "Parameter");
    const apiParam = findAnn(annotations, "ApiParam");
    const description = (paramAnn && annStr(paramAnn.args, "description", "value")) || (apiParam && annStr(apiParam.args, "value")) || docDesc;
    const example = (paramAnn && annStr(paramAnn.args, "example")) || schemaExample(annotations);

    const pathVar = findAnn(annotations, "PathVariable", "PathParam");
    const selector = findAnn(annotations, "Selector");
    const reqParam = findAnn(annotations, "RequestParam", "QueryParam");
    const reqHeader = findAnn(annotations, "RequestHeader", "HeaderParam");
    const reqBody = findAnn(annotations, "RequestBody");
    const defaultValueAnn = findAnn(annotations, "DefaultValue");

    if (pathVar || selector) {
      parameters.push({
        name: (pathVar && (annStr(pathVar.args, "value", "name") ?? paramName)) || paramName,
        in: "path",
        typeText,
        required: true,
        description,
        example,
        annotations,
      });
    } else if (reqHeader) {
      const dv = defaultValueAnn ? annStr(defaultValueAnn.args, "value") : undefined;
      parameters.push({
        name: annStr(reqHeader.args, "value", "name") ?? paramName,
        in: "header",
        typeText,
        required: a.flavor === "jaxrs" ? true : annBool(reqHeader.args, "required") ?? false,
        description,
        example: example ?? dv,
        defaultValue: dv,
        annotations,
      });
    } else if (reqBody) {
      requestBody = { typeText, required: annBool(reqBody.args, "required") ?? true, description };
    } else if (typeText.includes("MultipartFile")) {
      formFields.push({ name: paramName, in: "query", typeText, required: true, description, example, annotations });
    } else if (reqParam) {
      const dv = annStr(reqParam.args, "defaultValue") ?? (defaultValueAnn ? annStr(defaultValueAnn.args, "value") : undefined);
      parameters.push({
        name: annStr(reqParam.args, "value", "name") ?? paramName,
        in: "query",
        typeText,
        required: dv !== undefined ? false : annBool(reqParam.args, "required") ?? true,
        description,
        example: example ?? dv,
        defaultValue: dv,
        annotations,
      });
    } else if (isPageableType(typeText)) {
      // Spring Data Pageable -> page/size/sort 查询参数
      parameters.push(
        { name: "page", in: "query", typeText: "int", required: false, description: "页码(0 基)", annotations: [] },
        { name: "size", in: "query", typeText: "int", required: false, description: "每页条数", annotations: [] },
        { name: "sort", in: "query", typeText: "List<String>", required: false, description: "排序,如 name,asc", annotations: [] }
      );
    } else if (isSimpleTypeText(typeText)) {
      // 无注解的简单类型:Spring 默认按 query 参数处理
      parameters.push({
        name: paramName,
        in: "query",
        typeText,
        required: a.flavor !== "jaxrs",
        description,
        example,
        annotations,
      });
    } else if (a.flavor === "jaxrs") {
      // JAX-RS 无注解参数即请求体
      requestBody = { typeText, required: true, description };
    } else if (a.index) {
      // Spring 无注解的复杂 Bean:按 query 参数展开字段(如分页/条件查询对象 PatientQuery query)
      const expansion = expandQueryBean(a.index, paramName, typeText);
      for (const w of expansion.warnings) {
        warnings.push(`${a.controller}.${a.methodName}: ${w}`);
      }
      if (expansion.params.length) {
        for (const f of expansion.params) {
          if (!parameters.some((p) => p.name === f.name) && !formFields.some((p) => p.name === f.name)) {
            parameters.push({ ...f, description: f.description || docDescOf(paramDocs, f.name) });
          }
        }
      } else {
        warnings.push(`${a.controller}.${a.methodName}: 参数 ${paramName} (${typeText}) 缺少 @RequestParam/@PathVariable/@RequestBody 注解,且无法展开为查询参数,已忽略`);
      }
    } else {
      warnings.push(`${a.controller}.${a.methodName}: 参数 ${paramName} (${typeText}) 缺少 @RequestParam/@PathVariable/@RequestBody 注解,已忽略`);
    }
  }

  // ---- @ApiImplicitParams 补充参数(不与显式参数重复合并) ----
  for (const imp of collectImplicitParams(a.methodAnnotations)) {
    if (imp.paramType === "body") {
      if (!requestBody && imp.dataType) {
        requestBody = { typeText: imp.dataType, required: imp.required, description: imp.description };
      }
      continue;
    }
    if (imp.paramType === "form") {
      if (!parameters.some((p) => p.name === imp.name) && !formFields.some((p) => p.name === imp.name)) {
        formFields.push({ name: imp.name, in: "query", typeText: imp.dataType ?? "String", required: imp.required, description: imp.description, example: imp.example, annotations: [] });
      }
      continue;
    }
    if (parameters.some((p) => p.name === imp.name)) {
      continue;
    }
    parameters.push({
      name: imp.name,
      in: imp.paramType,
      typeText: imp.dataType ?? "String",
      required: imp.required,
      description: imp.description,
      example: imp.example,
      defaultValue: imp.defaultValue,
      annotations: [],
    });
  }

  if (formFields.length) {
    requestBody = { typeText: "__multipart__", required: true, formFields };
  }

  // ---- 返回类型 ----
  const headerNode = childNode(a.method, "methodHeader") ?? a.method;
  const resultNode = childNode(headerNode, "result");
  const returnType = resultNode ? extractReturnType(pf, resultNode) : undefined;
  const responseDescription = javadoc?.returns?.trim() || "OK";

  // Actuator:@Selector 参数按顺序追加到路径
  let finalPath = a.path;
  if (a.flavor === "actuator") {
    const selectorNames = parameters.filter((p) => p.in === "path").map((p) => `{${p.name}}`);
    if (selectorNames.length) {
      finalPath = joinPath(a.path, selectorNames.join("/"));
    }
  }

  return {
    method: a.verb,
    path: finalPath,
    tag: a.tag,
    operationId: `${a.controller}_${a.methodName}`,
    summary,
    description,
    parameters,
    requestBody,
    returnType,
    responseDescription,
    fsPath: pf.fsPath,
    controller: a.controller,
    flavor: a.flavor,
    extraResponses: collectExtraResponses(a.methodAnnotations),
    consumes: a.consumes.length ? a.consumes : undefined,
    produces: a.produces.length ? a.produces : undefined,
    methodRange: methodRangeOf(a.method),
    deprecated: !!findAnn(a.methodAnnotations, "Deprecated") || hasDeprecatedModifier(a.method),
  };
}

function methodRangeOf(method: CstNode): { startOffset: number; endOffset: number; startLine: number } | undefined {
  const loc = method.location;
  if (!loc) {
    return undefined;
  }
  return { startOffset: loc.startOffset, endOffset: loc.endOffset, startLine: loc.startLine ?? 1 };
}

function hasDeprecatedModifier(method: CstNode): boolean {
  return childAll(method, "methodModifier")
    .filter(isCstNode)
    .some((m) => Object.keys(m.children ?? {}).includes("Deprecated"));
}

interface ImplicitParam {
  name: string;
  paramType: "query" | "path" | "header" | "body" | "form";
  dataType?: string;
  required: boolean;
  description?: string;
  example?: string;
  defaultValue?: string;
}

/** 解析 @ApiImplicitParams/@ApiImplicitParam */
function collectImplicitParams(annotations: AnnotationInfo[]): ImplicitParam[] {
  const singles: AnnotationInfo[] = [];
  const container = findAnn(annotations, "ApiImplicitParams");
  if (container) {
    // 嵌套注解在 args 里是原文数组,逐个还原
    for (const raw of annArray(container.args, "value")) {
      singles.push(parseAnnotationText(raw));
    }
  }
  const direct = findAnn(annotations, "ApiImplicitParam");
  if (direct) {
    singles.push(direct);
  }

  const out: ImplicitParam[] = [];
  for (const imp of singles) {
    if (imp.name !== "ApiImplicitParam") {
      continue;
    }
    const name = annStr(imp.args, "name");
    if (!name) {
      continue;
    }
    const pt = (annStr(imp.args, "paramType") ?? "query").toLowerCase();
    const paramType: ImplicitParam["paramType"] =
      pt === "path" ? "path" : pt === "header" ? "header" : pt === "body" ? "body" : pt === "form" ? "form" : "query";
    const allowMultiple = annStr(imp.args, "allowMultiple") === "true";
    const dataType = annStr(imp.args, "dataType");
    out.push({
      name,
      paramType,
      dataType: allowMultiple && dataType ? `List<${dataType}>` : dataType,
      required: annStr(imp.args, "required") === "true" || annBool(imp.args, "required") === true,
      description: annStr(imp.args, "value"),
      example: annStr(imp.args, "example"),
      defaultValue: annStr(imp.args, "defaultValue"),
    });
  }
  return out;
}

/** 把 "@ApiImplicitParam(...)" 等(可能带嵌套限定前缀)的注解原文解析回 AnnotationInfo */
function parseAnnotationText(raw: string): AnnotationInfo {
  const trimmed = raw.trim().replace(/^_nested_/, "").replace(/_annotation/, "");
  const m = /^@?(?:[\w.]*\.)?(\w+)\(([\s\S]*)\)$/.exec(trimmed);
  if (!m) {
    return { name: trimmed.replace(/^@/, ""), raw, args: {} };
  }
  return { name: m[1], raw, args: parseAnnotationArgsText(m[2]) };
}

function parseAnnotationArgsText(text: string): AnnotationInfo["args"] {
  return parseArgsText(text);
}

/** @ApiResponses/@ApiResponse/@ResponseStatus -> 额外响应 */
function collectExtraResponses(annotations: AnnotationInfo[]): ResponseInfo[] {
  const out: ResponseInfo[] = [];
  const push = (code: string, description?: string, schemaText?: string) => {
    if (code) {
      out.push({ code, description, schemaText });
    }
  };

  const responsesContainer = findAnn(annotations, "ApiResponses");
  if (responsesContainer) {
    for (const raw of annArray(responsesContainer.args, "value")) {
      const ann = parseAnnotationText(raw);
      if (ann.name !== "ApiResponse") {
        continue;
      }
      push(
        normalizeStatus(annStr(ann.args, "code", "responseCode") ?? ""),
        annStr(ann.args, "message", "description"),
        implementationOfClass(ann.raw)
      );
    }
  }
  const direct = findAnn(annotations, "ApiResponse");
  if (direct) {
    push(
      normalizeStatus(annStr(direct.args, "code", "responseCode") ?? ""),
      annStr(direct.args, "message", "description"),
      implementationOfClass(direct.raw)
    );
  }
  const status = findAnn(annotations, "ResponseStatus");
  if (status) {
    push(
      normalizeStatus(annStr(status.args, "value", "code") ?? ""),
      annStr(status.args, "reason") || undefined
    );
  }
  return out;
}

/** @Content(schema = @Schema(implementation = Xxx.class)) 中抓出类型名 */
function implementationOfClass(rawAnn: string): string | undefined {
  const m = /implementation\s*=\s*(\w+(?:\.\w+)*)\.class/.exec(rawAnn);
  return m ? m[1] : undefined;
}

function normalizeStatus(raw: string): string {
  if (/^\d{3}$/.test(raw)) {
    return raw;
  }
  const name = raw.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw;
  return HTTP_STATUS_BY_NAME[name.trim()] || raw;
}

function isHiddenParam(annotations: AnnotationInfo[]): boolean {
  const p = findAnn(annotations, "Parameter");
  if (p && annBool(p.args, "hidden") === true) {
    return true;
  }
  const ap = findAnn(annotations, "ApiParam");
  return !!ap && annBool(ap.args, "hidden") === true;
}

function isPageableType(typeText: string): boolean {
  const t = typeText.trim();
  return t === "Pageable" || t === "org.springframework.data.domain.Pageable";
}

/** 参数级 @param 文档里查某字段说明(paramDocs 是方法 javadoc @param 的合并) */
function docDescOf(paramDocs: Record<string, string>, fieldName: string): string | undefined {
  return paramDocs[fieldName]?.trim() || undefined;
}

/** 查询 Bean 展开的最大嵌套层数(与 easy-yapi flattenFields 的 maxDepth 对齐) */
const MAX_QUERY_BEAN_DEPTH = 5;

interface QueryBeanExpansion {
  params: ParameterInfo[];
  /** 未能展开的嵌套字段告警(层级超限/循环引用),由调用方补上控制器与方法前缀 */
  warnings: string[];
}

/**
 * 展开无注解的“查询 Bean”为 query 参数列表。
 * Spring 对 Controller 方法中无任何绑定注解的普通 JavaBean 参数,会将其字段按 query/form 绑定;
 * 嵌套对象按 WebDataBinder 默认的 autoGrowNestedPaths 以「父字段.子字段」形式绑定,故此处用点号命名递归展开
 * (与 IDEA 版 Apifox Helper / easy-yapi 的展开口径一致)。
 * record 的组件(recordComponents)与 class 字段等价展开——easy-yapi 遍历 psiClass.fields,
 * 而 IntelliJ 平台会把 record 组件 augment 成 PsiField。
 * 集合与数组保持自身形态(如 List<String> 输出为数组参数),不采用 easy-yapi 的 field[0] 命名:
 * Spring 对集合的常规绑定是重复同名参数,文档写 [0] 会误导为只能传一个元素。
 * 无法展开的字段(超出层级上限、循环引用)不再静默丢弃,统一通过 warnings 上报。
 */
function expandQueryBean(index: TypeIndex, paramName: string, typeText: string): QueryBeanExpansion {
  const t = parseTypeText(typeText);
  const info = resolveIndexedType(index, t.name);
  if (!info || info.kind === "enum") {
    return { params: [], warnings: [] };
  }
  const params: ParameterInfo[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  /**
   * @param prefix 嵌套路径前缀(根层级为空)
   * @param depth 嵌套层数(根为 0;父类字段不增加层数)
   * @param pathTypes 当前嵌套路径上的类型名,用于循环引用检测
   */
  const walk = (ci: ClassInfo, prefix: string, depth: number, pathTypes: Set<string>) => {
    const fields = ci.fields.length ? ci.fields : ci.recordComponents;
    for (const f of fields) {
      const name = prefix ? `${prefix}.${f.name}` : f.name;
      if (seen.has(name)) {
        continue;
      }
      const fRef = parseTypeText(f.typeText);
      const fSimple = simpleName(fRef.name);
      // 数组/集合(含 List<Dto>)保持原形态,不下钻
      const sub = fRef.dims === 0 ? resolveIndexedType(index, fSimple) : undefined;
      const nested = !!sub && (sub.kind === "class" || sub.kind === "record") && !isPlainValueType(fSimple);
      if (nested) {
        if (depth + 1 >= MAX_QUERY_BEAN_DEPTH) {
          warnings.push(`参数 ${paramName} 的嵌套字段 ${name} 未展开(嵌套层级超过 ${MAX_QUERY_BEAN_DEPTH} 层)`);
          continue;
        }
        if (pathTypes.has(fSimple)) {
          warnings.push(`参数 ${paramName} 的嵌套字段 ${name} 未展开(检测到循环引用:${fSimple})`);
          continue;
        }
        walk(sub, name, depth + 1, new Set([...pathTypes, fSimple]));
        continue;
      }
      seen.add(name);
      const required = !!findAnn(f.annotations, "NotNull", "NotBlank", "NotEmpty");
      // 字段描述:@ApiModelProperty/@Schema 优先(此前只读 Javadoc,注解描述丢失),Javadoc 兜底
      const desc = schemaDescription(
        f.annotations,
        (f.javadoc && (f.javadoc.description || f.javadoc.firstLine)) || undefined
      );
      params.push({
        name,
        in: "query",
        typeText: f.typeText,
        required,
        description: desc,
        annotations: f.annotations,
      });
    }
    // 父类字段并入当前层级(不改前缀、不增加嵌套层数)
    if (ci.superClass) {
      const sup = resolveIndexedType(index, parseTypeText(ci.superClass).name);
      if (sup && (sup.kind === "class" || sup.kind === "record")) {
        walk(sup, prefix, depth, pathTypes);
      }
    }
  };

  walk(info, "", 0, new Set([info.simpleName]));
  return { params, warnings };
}

function isPlainValueType(simple: string): boolean {
  return /^(int|Integer|long|Long|short|Short|byte|Byte|float|Float|double|Double|boolean|Boolean|String|char|Character|BigDecimal|BigInteger|Date|LocalDate|LocalDateTime|LocalTime|Instant|ZonedDateTime|OffsetDateTime|Timestamp|UUID|Enum|List|Set|Map|String\[\])$/.test(
    simple
  );
}

function extractReturnType(pf: ParsedFile, resultNode: CstNode): string | undefined {
  const unannType = childNode(resultNode, "unannType");
  return unannType ? nodeText(pf.source, unannType).trim() : undefined;
}

/** 映射注解的路径参数:value/path(数组或单值) */
function pathArgsOf(mapping: AnnotationInfo): string[] {
  const paths = annArray(mapping.args, "value", "path");
  return paths.length ? paths : [""];
}

function joinPath(base: string, sub: string): string {
  const p =
    "/" +
    [base, sub]
      .filter((s) => s && s !== "/")
      .map((s) => s.replace(/^\/+|\/+$/g, ""))
      .join("/");
  return p.replace(/\/{2,}/g, "/") || "/";
}

/** Spring 默认按 query 处理的简单类型(含常见日期类型;类型文本可能是限定名,取最后一段判断) */
function isSimpleTypeText(typeText: string): boolean {
  const t = typeText.trim();
  const simple = t.slice(t.lastIndexOf(".") + 1).replace(/(\[\])$/, "");
  return /^(int|Integer|long|Long|short|Short|byte|Byte|float|Float|double|Double|boolean|Boolean|String|char|Character|BigDecimal|BigInteger|Date|LocalDate|LocalDateTime|LocalTime|Instant|ZonedDateTime|OffsetDateTime|Timestamp)$/.test(
    simple
  );
}

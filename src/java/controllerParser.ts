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
import { ParsedFile, resolveScopedType, typeScopeOf } from "./typeIndex";

const SPRING_MAPPINGS: Record<string, string[]> = {
  GetMapping: ["GET"],
  PostMapping: ["POST"],
  PutMapping: ["PUT"],
  DeleteMapping: ["DELETE"],
  PatchMapping: ["PATCH"],
};
/**
 * 方法上只写 @RequestMapping 未声明 method 时,Spring 实际匹配所有 HTTP 方法。
 * 文档输出常用 verb 集合(而不是固定 GET),避免调用方误判接口只支持 GET。
 */
const REQUEST_MAPPING_DEFAULT_VERBS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
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

/** Spring MediaType 常量基名 -> mime;同时派生出 *_VALUE 形式(如 MediaType.APPLICATION_XML_VALUE) */
const MEDIA_TYPE_BASE: Record<string, string> = {
  ALL: "*/*",
  APPLICATION_ATOM_XML: "application/atom+xml",
  APPLICATION_CBOR: "application/cbor",
  APPLICATION_FORM_URLENCODED: "application/x-www-form-urlencoded",
  APPLICATION_GRAPHQL: "application/graphql",
  APPLICATION_GRAPHQL_RESPONSE: "application/graphql-response+json",
  APPLICATION_JSON: "application/json",
  APPLICATION_JSON_UTF8: "application/json;charset=UTF-8",
  APPLICATION_NDJSON: "application/x-ndjson",
  APPLICATION_OCTET_STREAM: "application/octet-stream",
  APPLICATION_PDF: "application/pdf",
  APPLICATION_PROBLEM_JSON: "application/problem+json",
  APPLICATION_PROBLEM_JSON_UTF8: "application/problem+json;charset=UTF-8",
  APPLICATION_PROBLEM_XML: "application/problem+xml",
  APPLICATION_PROTOBUF: "application/x-protobuf",
  APPLICATION_RSS_XML: "application/rss+xml",
  APPLICATION_STREAM_JSON: "application/stream+json",
  APPLICATION_XHTML_XML: "application/xhtml+xml",
  APPLICATION_XML: "application/xml",
  APPLICATION_YAML: "application/yaml",
  IMAGE_GIF: "image/gif",
  IMAGE_JPEG: "image/jpeg",
  IMAGE_PNG: "image/png",
  MULTIPART_FORM_DATA: "multipart/form-data",
  MULTIPART_MIXED: "multipart/mixed",
  MULTIPART_RELATED: "multipart/related",
  TEXT_EVENT_STREAM: "text/event-stream",
  TEXT_HTML: "text/html",
  TEXT_MARKDOWN: "text/markdown",
  TEXT_PLAIN: "text/plain",
  TEXT_XML: "text/xml",
  WILDCARD: "*/*",
};

const MEDIA_TYPE_CONSTANTS: Record<string, string> = { ...MEDIA_TYPE_BASE };
for (const [name, mime] of Object.entries(MEDIA_TYPE_BASE)) {
  MEDIA_TYPE_CONSTANTS[`${name}_VALUE`] = mime;
}

/** 把 "MediaType.APPLICATION_JSON"/"application/json" 统一映射为 mime */
function toMimeType(raw: string): string {
  const last = raw.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw;
  return MEDIA_TYPE_CONSTANTS[last.trim()] ?? raw.trim().replace(/^"|"$/g, "");
}

/** 去重并保持声明顺序(方法级在前,类级在后) */
function uniqueMediaTypes(values: string[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    const mime = value.trim();
    if (mime && !out.includes(mime)) {
      out.push(mime);
    }
  }
  return out;
}

/**
 * 解析 REST 接口:Spring MVC Controller、OpenFeign 接口、JAX-RS 资源类、Actuator @Endpoint。
 * 接口方法可声明在抽象父类或接口中(继承),按 Spring handler 类型及其父类/接口的口径展开;
 * 单文件解析(无类型索引,如 CodeLens)时退化为仅解析本类声明的方法。
 */
export function parseControllers(files: ParsedFile[], rules?: HelperProperties, index?: TypeIndex): ParseResult {
  const endpoints: EndpointInfo[] = [];
  const ruleWarnings: string[] = [];
  const warnings: string[] = [];
  // 继承解析需要回到父类型声明处读取方法;无类型索引时不做继承展开。
  // byFile 复用建索引时已算好的站点,避免每个类型重复走 findAll+注解收集
  const sites = index ? buildTypeSites(files) : undefined;

  for (const pf of files) {
    const fileSites = sites
      ? sites.byFile.get(pf) ?? []
      : findAll(pf.cst, "typeDeclaration")
          .map((d) => typeSiteOf(pf, d))
          .filter((s): s is TypeSite => !!s);
    for (const site of fileSites) {
      const { typeName, typeAnnotations } = site;

      // 继承链:具体类型在首位,父类/接口按 BFS 在后(仅工作区源码内可定位的类型)
      const chain = sites ? superTypeChain(site, sites.byName) : [];
      const hierarchy = [site, ...chain];

      // 类型风格判定:具体类型优先,抽象基类标注 @RestController 时由父类兜底
      const flavor = detectFlavor(site, chain);
      if (!flavor) {
        continue;
      }

      // 类级路径前缀:继承链上最近的类级映射(Spring 的 findMergedAnnotation 口径)
      const basePaths = classBasePaths(hierarchy, flavor);
      const baseMethods = classBaseMethods(hierarchy, flavor);

      // tag: @Tag(name) / @Api(tags[0]) / 类型名
      const tagAnn = findAnn(typeAnnotations, "Tag");
      const apiAnn = findAnn(typeAnnotations, "Api");
      let tag =
        (tagAnn && annStr(tagAnn.args, "name", "value")) ||
        (apiAnn && annArray(apiAnn.args, "tags", "value")[0]) ||
        typeName;
      const classJavadoc = parseJavadoc(nodeJavadoc(site.carrier));
      // 类级 ignore 规则命中 → 整类不产接口
      let typeIgnored = false;

      // .apifox-helper.properties 类级规则(ignore / folder.name)
      if (rules) {
        const classCtx: RuleContext = {
          annotations: typeAnnotations,
          javadocRaw: nodeJavadoc(site.carrier),
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

      // 类级媒体类型:JAX-RS @Consumes/@Produces + Spring 类级 @RequestMapping(继承链最近声明)
      const classMedia = classMediaTypesOf(hierarchy);

      // 收集方法:本类声明的 + 继承链上未被覆写的父类/接口方法(具体类型优先)
      const methodHits = collectMethodHits(site, chain);

      const settledSignatures = new Set<string>();
      for (const hit of methodHits) {
        const { method, wrapper, modifierKey } = hit;
        const source = hit.site.pf.source;
        // 子类已声明同签名方法时,父类同名方法不再产出(覆写以具体类型为准)
        const signature = methodSignature(hit.site, method);
        if (settledSignatures.has(signature)) {
          continue;
        }
        const methodAnnotations = collectAnnotations(childAll(method, modifierKey).filter(isCstNode), source);

        // @Operation(hidden=true)/@Api(hidden=true) 的接口跳过
        const operationAnn = findAnn(methodAnnotations, "Operation");
        const apiMethodAnn = findAnn(methodAnnotations, "Api");
        if (annBool(operationAnn?.args ?? {}, "hidden") === true || annBool(apiMethodAnn?.args ?? {}, "hidden") === true) {
          settledSignatures.add(signature);
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
          // folder.name(方法级,优先于类级 folder.name)
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
          settledSignatures.add(signature);
          continue;
        }

        const mappings = resolveMapping(methodAnnotations, flavor, (message) => {
          warnings.push(`${typeName}.${methodName}: ${message}`);
        }, baseMethods);
        if (!mappings.length) {
          // 未声明路由(如子类覆写但映射注解留在父类),不占用签名,由父类声明继续产出
          continue;
        }
        settledSignatures.add(signature);
        // 方法级媒体类型:JAX-RS @Consumes/@Produces + Spring @XxxMapping(consumes/produces)。
        // JAX-RS 保持原有拼接行为(方法级在前,类级在后);Spring 的对应属性由方法级覆盖类级条件。
        const jaxrsMethodMedia = jaxrsMediaTypesOf(methodAnnotations);
        const springMethodMedia = springMediaTypesOf(methodAnnotations);
        const jaxrsConsumes = [...jaxrsMethodMedia.consumes, ...classMedia.jaxrs.consumes];
        const jaxrsProduces = [...jaxrsMethodMedia.produces, ...classMedia.jaxrs.produces];
        const springConsumes = springMethodMedia.consumes.length ? springMethodMedia.consumes : classMedia.spring.consumes;
        const springProduces = springMethodMedia.produces.length ? springMethodMedia.produces : classMedia.spring.produces;
        const consumes = flavor === "jaxrs"
          ? jaxrsConsumes
          : uniqueMediaTypes([...jaxrsConsumes, ...springConsumes]);
        const produces = flavor === "jaxrs"
          ? jaxrsProduces
          : uniqueMediaTypes([...jaxrsProduces, ...springProduces]);

        for (const m of mappings) {
          for (const mp of m.paths) {
            for (const bp of basePaths) {
              const ep = buildEndpoint(hit.site.pf, warnings, {
                flavor,
                verb: m.method,
                path: joinPath(bp, mp),
                tag: ruleFolder ?? tag,
                controller: typeName,
                declaringType: hit.site.typeName,
                ownerPath: pf.fsPath,
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

/**
 * 顶层类型声明站点:继承解析需要回到声明处读取类级注解、方法与 Javadoc。
 * 只登记顶层类型(与 parseControllers 的扫描范围一致)。
 */
interface TypeSite {
  pf: ParsedFile;
  /** typeDeclaration 包装节点(类级 Javadoc 挂靠处) */
  carrier: CstNode;
  /** normalClassDeclaration / normalInterfaceDeclaration */
  inner: CstNode;
  typeName: string;
  isInterface: boolean;
  typeAnnotations: AnnotationInfo[];
}

function typeSiteOf(pf: ParsedFile, typeDecl: CstNode): TypeSite | undefined {
  const classDecl = childNode(typeDecl, "classDeclaration");
  const interfaceDecl = childNode(typeDecl, "interfaceDeclaration");
  const normal = classDecl ? childNode(classDecl, "normalClassDeclaration") : undefined;
  const normalItf = interfaceDecl ? childNode(interfaceDecl, "normalInterfaceDeclaration") : undefined;
  const inner = normal ?? normalItf;
  if (!inner) {
    return undefined;
  }
  const typeName = typeNameOf(inner);
  if (!typeName) {
    return undefined;
  }
  const typeAnnotations = collectAnnotations(
    [
      ...childAll(classDecl, "classModifier"),
      ...childAll(interfaceDecl, "classModifier"),
      ...childAll(interfaceDecl, "interfaceModifier"),
      ...childAll(inner, "classModifier"),
      ...childAll(inner, "interfaceModifier"),
    ].filter(isCstNode),
    pf.source
  );
  return { pf, carrier: typeDecl, inner, typeName, isInterface: !!normalItf, typeAnnotations };
}

/** 建立 简单名 -> 类型声明站点 的索引(同名以最后扫描到的为准,与类型索引口径一致);byFile 供主循环复用,免于二次 CST 扫描与注解收集 */
function buildTypeSites(files: ParsedFile[]): { byName: Map<string, TypeSite>; byFile: Map<ParsedFile, TypeSite[]> } {
  const byName = new Map<string, TypeSite>();
  const byFile = new Map<ParsedFile, TypeSite[]>();
  for (const pf of files) {
    let list = byFile.get(pf);
    if (!list) {
      list = [];
      byFile.set(pf, list);
    }
    for (const typeDecl of findAll(pf.cst, "typeDeclaration")) {
      const site = typeSiteOf(pf, typeDecl);
      if (site) {
        byName.set(site.typeName, site);
        list.push(site);
      }
    }
  }
  return { byName, byFile };
}

/** 类型文本 -> 简单名(剥掉包名与泛型实参,如 java.util.List<String> -> List) */
function typeTextName(text: string): string {
  return simpleName(parseTypeText(text).name);
}

/** 直接父类型名:类取 extends 的类 + implements 的接口;接口取 extends 的接口 */
function directSuperTypeNames(site: TypeSite): string[] {
  const source = site.pf.source;
  const names: string[] = [];
  const pushInterfaceList = (holder: CstNode | undefined) => {
    const list = childNode(holder, "interfaceTypeList");
    if (!list) {
      return;
    }
    for (const it of childAll(list, "interfaceType").filter(isCstNode)) {
      const classType = childNode(it, "classType");
      const name = classType ? typeTextName(nodeText(source, classType)) : "";
      if (name && name !== "Object") {
        names.push(name);
      }
    }
  };
  if (site.isInterface) {
    pushInterfaceList(childNode(site.inner, "interfaceExtends"));
  } else {
    const ext = childNode(site.inner, "classExtends");
    const classType = ext ? childNode(ext, "classType") : undefined;
    const superName = classType ? typeTextName(nodeText(source, classType)) : "";
    if (superName && superName !== "Object") {
      names.push(superName);
    }
    pushInterfaceList(childNode(site.inner, "classImplements"));
  }
  return names;
}

/**
 * 收集继承链(具体类型在前,父类/接口按 BFS 在后,去重)。
 * 只含工作区源码内可定位的类型;依赖 jar 中的父类没有方法源码,自然跳过。
 */
function superTypeChain(root: TypeSite, sites: Map<string, TypeSite>): TypeSite[] {
  const chain: TypeSite[] = [];
  const visited = new Set<string>([root.typeName]);
  let frontier: TypeSite[] = [root];
  while (frontier.length) {
    const next: TypeSite[] = [];
    for (const site of frontier) {
      for (const name of directSuperTypeNames(site)) {
        if (visited.has(name)) {
          continue;
        }
        const sup = sites.get(name);
        if (!sup) {
          continue;
        }
        visited.add(name);
        chain.push(sup);
        next.push(sup);
      }
    }
    frontier = next;
  }
  return chain;
}

/** 类型风格判定:具体类型优先;抽象基类标注 @RestController/@Controller 时由父类兜底 */
function detectFlavor(site: TypeSite, chain: TypeSite[]): EndpointFlavor | undefined {
  const probe = (s: TypeSite): EndpointFlavor | undefined => {
    if (findAnn(s.typeAnnotations, "RestController", "Controller")) {
      return "spring-mvc";
    }
    if (s.isInterface && findAnn(s.typeAnnotations, "FeignClient")) {
      return "feign";
    }
    if (findAnn(s.typeAnnotations, "Path")) {
      return "jaxrs";
    }
    if (findAnn(s.typeAnnotations, "Endpoint")) {
      return "actuator";
    }
    return undefined;
  };
  const own = probe(site);
  if (own) {
    return own;
  }
  for (const s of chain) {
    const inherited = s.isInterface ? undefined : probe(s);
    if (inherited === "spring-mvc") {
      return inherited;
    }
  }
  return undefined;
}

/** 类级映射声明的 HTTP 动词(最近的类级 @RequestMapping);方法级未声明 method 时继承 */
function classBaseMethods(hierarchy: TypeSite[], flavor: EndpointFlavor): string[] {
  if (flavor !== "spring-mvc" && flavor !== "feign") {
    return [];
  }
  for (const s of hierarchy) {
    const classMapping = findAnn(s.typeAnnotations, "RequestMapping");
    if (classMapping) {
      return normalizeVerbs(annArray(classMapping.args, "method"));
    }
  }
  return [];
}

/** "RequestMethod.POST" -> "POST";保留无法识别的大写原值 */
function normalizeVerbs(values: string[]): string[] {
  return values.map((m) => (m.includes(".") ? m.slice(m.lastIndexOf(".") + 1) : m).toUpperCase());
}

/** 类级路径前缀:取继承链上最近的类级映射(Spring 的 findMergedAnnotation 口径,不叠加) */
function classBasePaths(hierarchy: TypeSite[], flavor: EndpointFlavor): string[] {
  if (flavor === "actuator") {
    const endpointAnn = findAnn(hierarchy[0].typeAnnotations, "Endpoint");
    return ["/actuator/" + (annStr(endpointAnn?.args ?? {}, "id", "value") ?? hierarchy[0].typeName.toLowerCase())];
  }
  if (flavor === "jaxrs") {
    for (const s of hierarchy) {
      const pathAnn = findAnn(s.typeAnnotations, "Path");
      if (pathAnn) {
        return pathArgsOf(pathAnn);
      }
    }
    return [""];
  }
  // spring-mvc / feign
  for (const s of hierarchy) {
    const classMapping = findAnn(s.typeAnnotations, "RequestMapping");
    if (classMapping) {
      return pathArgsOf(classMapping);
    }
    if (flavor === "feign") {
      const feign = findAnn(s.typeAnnotations, "FeignClient");
      const feignPath = feign ? annStr(feign.args, "path") : undefined;
      if (feignPath) {
        return [feignPath];
      }
    }
  }
  return [""];
}

interface MethodHit {
  method: CstNode;
  wrapper: CstNode;
  modifierKey: string;
  /** 声明该方法的类型站点(继承方法为其父类/接口) */
  site: TypeSite;
}

/** 取类型体内直接声明的方法(类/接口的包装节点与修饰符规则不同;Javadoc 附着在最近的包装节点上) */
function declaredMethodsOf(site: TypeSite): MethodHit[] {
  const hits: MethodHit[] = [];
  if (site.isInterface) {
    for (const member of childAll(childNode(site.inner, "interfaceBody"), "interfaceMemberDeclaration").filter(isCstNode)) {
      const m = childNode(member, "interfaceMethodDeclaration");
      if (m) {
        hits.push({ method: m, wrapper: member, modifierKey: "interfaceMethodModifier", site });
      }
    }
    return hits;
  }
  for (const member of childAll(childNode(site.inner, "classBody"), "classBodyDeclaration").filter(isCstNode)) {
    const memberDecl = childNode(member, "classMemberDeclaration") ?? childNode(member, "memberDeclaration");
    const m = childNode(memberDecl, "methodDeclaration");
    if (m) {
      hits.push({ method: m, wrapper: member, modifierKey: "methodModifier", site });
    }
  }
  return hits;
}

/** 抽象父类的 private/static 方法不构成 Spring handler,也不会随继承暴露给子类 */
function hasNonHandlerModifier(method: CstNode, modifierKey: string): boolean {
  return childAll(method, modifierKey)
    .filter(isCstNode)
    .some((m) => !!m.children && ("Private" in m.children || "Static" in m.children));
}

/** 收集方法:本类声明的 + 继承链上的父类/接口方法(具体类型优先,后续按签名去重) */
function collectMethodHits(root: TypeSite, chain: TypeSite[]): MethodHit[] {
  const hits = declaredMethodsOf(root);
  for (const sup of chain) {
    for (const hit of declaredMethodsOf(sup)) {
      if (!hasNonHandlerModifier(hit.method, hit.modifierKey)) {
        hits.push(hit);
      }
    }
  }
  return hits;
}

interface FileScope {
  /** package 声明(可能缺省) */
  packageName?: string;
  /** 简单名 -> 普通 import 全限定名(static import 不参与类型解析) */
  imported: Map<string, string>;
}

const fileScopeCache = new WeakMap<ParsedFile, FileScope>();

/** 文件级作用域(包名 + import)按 ParsedFile 缓存:签名归一化对每个方法都要查 */
function fileScopeOf(pf: ParsedFile): FileScope {
  let scope = fileScopeCache.get(pf);
  if (!scope) {
    const imported = new Map<string, string>();
    for (const match of pf.source.matchAll(/^\s*import\s+(?!static\s+)([\w.]+);/gm)) {
      imported.set(simpleName(match[1]), match[1]);
    }
    scope = { packageName: /^\s*package\s+([\w.]+)\s*;/m.exec(pf.source)?.[1], imported };
    fileScopeCache.set(pf, scope);
  }
  return scope;
}

/** 方法签名按参数类型身份(擦除泛型,保留包名与数组维度),用于区分同名重载并识别覆写 */
function methodSignature(site: TypeSite, method: CstNode): string {
  const { pf } = site;
  const header = childNode(method, "methodHeader") ?? method;
  const declarator = childNode(header, "methodDeclarator");
  const paramList = childNode(declarator, "formalParameterList");
  const { packageName, imported } = fileScopeOf(pf);
  const javaLang = new Set([
    "Boolean", "Byte", "Character", "Class", "Double", "Enum", "Exception", "Float", "Integer",
    "Long", "Math", "Number", "Object", "Record", "RuntimeException", "Short", "String", "Throwable",
    "Void",
  ]);
  const types: string[] = [];
  for (const fp of childAll(paramList, "formalParameter").filter(isCstNode)) {
    const regular = childNode(fp, "variableParaRegularParameter") ?? childNode(fp, "variableArityParameter");
    const typeNode = regular ? childNode(regular, "unannType") : undefined;
    if (!typeNode) {
      types.push("?");
      continue;
    }
    const ref = parseTypeText(nodeText(pf.source, typeNode));
    const name = ref.name;
    const resolvedName = /^(?:boolean|byte|short|int|long|char|float|double|void)$/.test(name) ? name : name.includes(".")
      ? name
      : imported.get(name) ?? (javaLang.has(name) ? `java.lang.${name}` : /^[A-Z]$/.test(name) ? name : [packageName, name].filter(Boolean).join("."));
    const varargs = !!regular && childNode(fp, "variableArityParameter") !== undefined;
    types.push(`${resolvedName}${"[]".repeat(ref.dims + (varargs ? 1 : 0))}`);
  }
  return `${tokenImage(declarator, "Identifier") ?? ""}(${types.join(",")})`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

interface MethodMapping {
  method: string;
  paths: string[];
}

/** 方法上的路由声明 -> HTTP 动词 + 路径(可能多组) */
function resolveMapping(
  annotations: AnnotationInfo[],
  flavor: EndpointFlavor,
  warn?: (message: string) => void,
  baseMethods: string[] = []
): MethodMapping[] {
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
  const declared = SPRING_MAPPINGS[mapping.name] ?? normalizeVerbs(annArray(mapping.args, "method"));
  // 类级 method 是限制条件:与方法级显式动词取交集;方法级未声明时继承类级限制。
  let verbs: string[];
  if (baseMethods.length && declared.length) {
    verbs = [...new Set(declared.filter((method) => baseMethods.includes(method)))];
    if (!verbs.length) {
      warn?.(`类级 method [${baseMethods.join(",")}] 与方法级 method [${declared.join(",")}] 无交集,已跳过该映射`);
      return [];
    }
  } else if (baseMethods.length) {
    verbs = [...new Set(baseMethods)];
  } else if (declared.length) {
    verbs = [...new Set(declared)];
  } else {
    warn?.("@RequestMapping 未声明 method,已按 GET/POST/PUT/PATCH/DELETE 输出");
    verbs = [...REQUEST_MAPPING_DEFAULT_VERBS];
  }
  const paths = pathArgsOf(mapping);
  return verbs.map((method) => ({ method, paths }));
}

interface MediaTypes {
  consumes: string[];
  produces: string[];
}

interface ClassMediaTypes {
  jaxrs: MediaTypes;
  spring: MediaTypes;
}

/** JAX-RS @Consumes/@Produces */
function jaxrsMediaTypesOf(annotations: AnnotationInfo[]): MediaTypes {
  return {
    consumes: annArray(findAnn(annotations, "Consumes")?.args ?? {}, "value").map(toMimeType),
    produces: annArray(findAnn(annotations, "Produces")?.args ?? {}, "value").map(toMimeType),
  };
}

/** 方法/类上的 Spring 映射注解声明的 consumes / produces(@RequestMapping 与 @GetMapping 等派生注解) */
function springMediaTypesOf(annotations: AnnotationInfo[]): MediaTypes {
  const mapping = findAnn(annotations, ...SPRING_MAPPING_NAMES);
  if (!mapping) {
    return { consumes: [], produces: [] };
  }
  return {
    consumes: annArray(mapping.args, "consumes").map(toMimeType),
    produces: annArray(mapping.args, "produces").map(toMimeType),
  };
}

/**
 * 类级媒体类型:JAX-RS @Consumes/@Produces 取具体类型声明;
 * Spring 类级映射取继承链上最近的 @RequestMapping(与 classBasePaths 的 findMergedAnnotation 口径一致)。
 */
function classMediaTypesOf(hierarchy: TypeSite[]): ClassMediaTypes {
  const jaxrs = jaxrsMediaTypesOf(hierarchy[0].typeAnnotations);
  let spring: MediaTypes = { consumes: [], produces: [] };
  for (const site of hierarchy) {
    const classMapping = findAnn(site.typeAnnotations, "RequestMapping");
    if (classMapping) {
      spring = {
        consumes: annArray(classMapping.args, "consumes").map(toMimeType),
        produces: annArray(classMapping.args, "produces").map(toMimeType),
      };
      break;
    }
  }
  return { jaxrs, spring };
}

interface EndpointArgs {
  flavor: EndpointFlavor;
  verb: string;
  path: string;
  tag: string;
  controller: string;
  /** 方法实际声明类型(继承接口为父类型名);缺省等于 controller */
  declaringType?: string;
  /** 具体 Controller 源文件(继承接口时与声明文件不同) */
  ownerPath?: string;
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
        // Spring 的 @RequestHeader 默认 required=true(缺头 400),与 easy-yapi 的 findRequired 口径一致;
        // JAX-RS @HeaderParam 缺失同样报错,@DefaultValue 使其可选(easy-yapi v3 一律视为可选,此处按规范更精确)
        required: a.flavor === "jaxrs" ? defaultValueAnn === undefined : annBool(reqHeader.args, "required") ?? true,
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
        // Spring @RequestParam 默认必填;JAX-RS @QueryParam 缺失只是取 null,天然可选
        // (与 easy-yapi v3 的 JAX-RS 口径一致)
        required: dv !== undefined ? false : annBool(reqParam.args, "required") ?? a.flavor !== "jaxrs",
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
      // 无注解的简单类型:Spring 默认按 query 参数处理且视为可选(缺失绑定 null/缺省值);
      // 原生类型(int/long 等)缺失时无法赋值,实际表现为必填
      parameters.push({
        name: paramName,
        in: "query",
        typeText,
        required: isPrimitiveJavaType(typeText),
        description,
        example,
        annotations,
      });
    } else if (a.flavor === "jaxrs") {
      // JAX-RS 无注解参数即请求体
      requestBody = { typeText, required: true, description };
    } else if (a.index) {
      // Spring 无注解的复杂 Bean:按 query 参数展开字段(如分页/条件查询对象 PatientQuery query)
      // 继承方法的参数类型按声明处类型的作用域解析(成员类型遮蔽口径)
      const declaring = a.declaringType ?? a.controller;
      const expansion = expandQueryBean(a.index, paramName, typeText, typeScopeOf(a.index.types.get(declaring)));
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
    methodName: a.methodName,
    summary,
    description,
    parameters,
    requestBody,
    returnType,
    responseDescription,
    fsPath: pf.fsPath,
    controller: a.controller,
    ...(a.ownerPath && a.ownerPath !== pf.fsPath ? { ownerFsPath: a.ownerPath } : {}),
    ...(a.declaringType && a.declaringType !== a.controller ? { declaringType: a.declaringType } : {}),
    flavor: a.flavor,
    extraResponses: collectExtraResponses(a.methodAnnotations),
    consumes: a.consumes.length ? a.consumes : undefined,
    produces: a.produces.length ? a.produces : undefined,
    methodRange: methodRangeOf(a.method),
    deprecated: !!findAnn(a.methodAnnotations, "Deprecated"),
  };
}

function methodRangeOf(method: CstNode): { startOffset: number; endOffset: number; startLine: number } | undefined {
  const loc = method.location;
  if (!loc) {
    return undefined;
  }
  return { startOffset: loc.startOffset, endOffset: loc.endOffset, startLine: loc.startLine ?? 1 };
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
  const trimmed = raw.trim().replace(/^_nested_/, "").replace(/_annotation$/, "");
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
function expandQueryBean(index: TypeIndex, paramName: string, typeText: string, controllerScope?: readonly string[]): QueryBeanExpansion {
  const t = parseTypeText(typeText);
  const info = resolveScopedType(index, t.name, controllerScope);
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
    // 字段类型在本类作用域下解析:同名嵌套类型优先于顶层类型(与 Java/PSI 一致)
    const scope = typeScopeOf(ci);
    for (const f of fields) {
      const name = prefix ? `${prefix}.${f.name}` : f.name;
      if (seen.has(name)) {
        continue;
      }
      const fRef = parseTypeText(f.typeText);
      const fSimple = simpleName(fRef.name);
      // 数组/集合(含 List<Dto>)保持原形态,不下钻
      const sub = fRef.dims === 0 ? resolveScopedType(index, fRef.name, scope) : undefined;
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
      const sup = resolveScopedType(index, parseTypeText(ci.superClass).name, scope);
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

/** Java 原生类型(不含包装类与数组):query 参数缺失时无法绑定 null,按必填处理 */
function isPrimitiveJavaType(typeText: string): boolean {
  return /^(boolean|byte|short|int|long|char|float|double)$/.test(typeText.trim());
}

/** Spring 默认按 query 处理的简单类型(含常见日期类型;类型文本可能是限定名,取最后一段判断) */
function isSimpleTypeText(typeText: string): boolean {
  const t = typeText.trim();
  const simple = t.slice(t.lastIndexOf(".") + 1).replace(/(\[\])$/, "");
  return /^(int|Integer|long|Long|short|Short|byte|Byte|float|Float|double|Double|boolean|Boolean|String|char|Character|BigDecimal|BigInteger|Date|LocalDate|LocalDateTime|LocalTime|Instant|ZonedDateTime|OffsetDateTime|Timestamp)$/.test(
    simple
  );
}

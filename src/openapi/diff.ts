/**
 * OpenAPI 基线比对（CI 破坏性变更检测）。
 *
 * 比对粒度是「操作 + schema」：先按 path/method 找新增、删除与共有操作，
 * 再把 requestBody / parameters / responses 里的 schema 展开 $ref 后递归比较。
 * 只做结构级判定，不比较枚举收窄等语义级规则（见 Issue #39 的后续迭代说明）。
 */

export type ChangeSeverity = "breaking" | "compatible";

export type ChangeKind =
  | "removed-path"
  | "added-path"
  | "removed-operation"
  | "added-operation"
  | "added-required-parameter"
  | "added-optional-parameter"
  | "removed-parameter"
  | "parameter-became-required"
  | "parameter-became-optional"
  | "added-required-request-body"
  | "added-request-body"
  | "removed-request-body"
  | "added-response"
  | "removed-response"
  | "added-response-body"
  | "removed-response-body"
  | "removed-required-field"
  | "removed-optional-field"
  | "removed-response-field"
  | "added-required-field"
  | "added-optional-field"
  | "field-became-required"
  | "field-became-optional"
  | "type-narrowed"
  | "type-widened"
  | "type-changed"
  | "description-changed";

export interface ApiChange {
  severity: ChangeSeverity;
  kind: ChangeKind;
  /** 形如 "GET /api/v1/users"；路径级变更为路径本身 */
  location: string;
  path: string;
  method?: string;
  /** 变更所在的组件模型名（若能定位） */
  schema?: string;
  /** 变更字段路径，如 "responses.200.data.email" */
  field?: string;
  message: string;
}

export interface ApiDiffResult {
  /** 基线文件的绝对路径 */
  baseline: string;
  summary: { breaking: number; compatible: number; total: number };
  changes: ApiChange[];
}

type JsonObject = Record<string, unknown>;
type Direction = "request" | "response";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;
const MAX_DEPTH = 64;

export function diffOpenApi(baseline: unknown, current: unknown, baselinePath: string): ApiDiffResult {
  const baselineRoot = isObject(baseline) ? baseline : {};
  const currentRoot = isObject(current) ? current : {};
  return diffDocuments(baselineRoot, currentRoot, baselinePath, undefined);
}

/**
 * 按接口范围比对：仅保留 methodsByPath 指定的操作。
 * 空集合表示不限范围（仍报出全部新增/删除）。
 */
export function diffOpenApiScoped(
  baseline: unknown,
  current: unknown,
  baselinePath: string,
  methodsByPath: Map<string, Set<string>> | undefined
): ApiDiffResult {
  const baselineRoot = isObject(baseline) ? baseline : {};
  const currentRoot = isObject(current) ? current : {};
  return diffDocuments(baselineRoot, currentRoot, baselinePath, methodsByPath);
}

function diffDocuments(
  baselineRoot: JsonObject,
  currentRoot: JsonObject,
  baselinePath: string,
  methodsByPath: Map<string, Set<string>> | undefined
): ApiDiffResult {
  const baselinePaths = asObject(baselineRoot.paths);
  const currentPaths = asObject(currentRoot.paths);
  const changes: ApiChange[] = [];
  const inScope = (apiPath: string, method: string): boolean =>
    !methodsByPath || methodsByPath.get(apiPath)?.has(method.toUpperCase()) === true;
  const pathSelected = (apiPath: string): boolean => !methodsByPath || methodsByPath.has(apiPath);

  for (const [apiPath, baselineItem] of Object.entries(baselinePaths)) {
    if (!isObject(baselineItem)) {
      continue;
    }
    if (!isObject(currentPaths[apiPath]) && pathSelected(apiPath)) {
      for (const method of operationsOf(baselineItem).keys()) {
        if (!inScope(apiPath, method)) {
          continue;
        }
        const upper = method.toUpperCase();
        changes.push({
          severity: "breaking",
          kind: "removed-operation",
          location: `${upper} ${apiPath}`,
          path: apiPath,
          method: upper,
          message: `删除操作 ${upper} ${apiPath}`,
        });
      }
      continue;
    }
    diffPathItem(apiPath, baselineItem, asObject(currentPaths[apiPath]), baselineRoot, currentRoot, changes, inScope);
  }

  for (const apiPath of Object.keys(currentPaths)) {
    if (isObject(baselinePaths[apiPath])) {
      continue;
    }
    const methods = [...operationsOf(asObject(currentPaths[apiPath])).keys()]
      .filter((method) => inScope(apiPath, method))
      .map((method) => method.toUpperCase());
    if (methodsByPath && !methodsByPath.has(apiPath)) {
      continue;
    }
    changes.push({
      severity: "compatible",
      kind: "added-path",
      location: apiPath,
      path: apiPath,
      message: `新增路径 ${apiPath}${methods.length ? `（${methods.join("/")}）` : ""}`,
    });
  }

  const deduped = dedupe(changes).sort(compareChange);
  const breaking = deduped.filter((change) => change.severity === "breaking").length;
  return {
    baseline: baselinePath,
    summary: { breaking, compatible: deduped.length - breaking, total: deduped.length },
    changes: deduped,
  };
}

/** 文本模式下的可读报告，供 CLI 直接输出 */
export function formatDiffText(diff: ApiDiffResult): string {
  const lines = [`基线比对完成:破坏性 ${diff.summary.breaking}，兼容 ${diff.summary.compatible}`];
  const groups: { label: string; severity: ChangeSeverity }[] = [
    { label: "破坏性变更", severity: "breaking" },
    { label: "兼容变更", severity: "compatible" },
  ];
  for (const group of groups) {
    const items = diff.changes.filter((change) => change.severity === group.severity);
    if (!items.length) {
      continue;
    }
    lines.push(`${group.label}:`);
    for (const item of items) {
      const field = item.field ? ` ${item.field}` : "";
      lines.push(`- [${item.kind}] ${item.location}${field} — ${item.message}`);
    }
  }
  return lines.join("\n");
}

function diffPathItem(
  apiPath: string,
  baselineItem: JsonObject,
  currentItem: JsonObject,
  baselineRoot: JsonObject,
  currentRoot: JsonObject,
  changes: ApiChange[],
  inScope: (apiPath: string, method: string) => boolean
): void {
  const baselineOps = operationsOf(baselineItem);
  const currentOps = operationsOf(currentItem);

  for (const [method, baselineOp] of baselineOps) {
    if (!inScope(apiPath, method)) {
      continue;
    }
    const currentOp = currentOps.get(method);
    if (!currentOp) {
      const upper = method.toUpperCase();
      changes.push({
        severity: "breaking",
        kind: "removed-operation",
        location: `${upper} ${apiPath}`,
        path: apiPath,
        method: upper,
        message: `删除操作 ${upper} ${apiPath}`,
      });
      continue;
    }
    diffOperation(apiPath, method, baselineItem, baselineOp, currentItem, currentOp, baselineRoot, currentRoot, changes);
  }

  for (const method of currentOps.keys()) {
    if (baselineOps.has(method) || !inScope(apiPath, method)) {
      continue;
    }
    const upper = method.toUpperCase();
    changes.push({
      severity: "compatible",
      kind: "added-operation",
      location: `${upper} ${apiPath}`,
      path: apiPath,
      method: upper,
      message: `新增操作 ${upper} ${apiPath}`,
    });
  }
}

function diffOperation(
  apiPath: string,
  method: string,
  baselineItem: JsonObject,
  baselineOp: JsonObject,
  currentItem: JsonObject,
  currentOp: JsonObject,
  baselineRoot: JsonObject,
  currentRoot: JsonObject,
  changes: ApiChange[]
): void {
  const location = `${method.toUpperCase()} ${apiPath}`;
  const context = { location, apiPath, method: method.toUpperCase(), baselineRoot, currentRoot, changes };

  diffOperationDescription(context, baselineOp, currentOp);
  diffParameters(context, baselineItem, baselineOp, currentItem, currentOp);
  diffRequestBody(context, baselineOp, currentOp);
  diffResponses(context, baselineOp, currentOp);
}

function diffOperationDescription(context: OperationContext, baselineOp: JsonObject, currentOp: JsonObject): void {
  for (const key of ["summary", "description"] as const) {
    const before = typeof baselineOp[key] === "string" ? baselineOp[key] : "";
    const after = typeof currentOp[key] === "string" ? currentOp[key] : "";
    if (before === after) {
      continue;
    }
    context.changes.push({
      severity: "compatible",
      kind: "description-changed",
      location: context.location,
      path: context.apiPath,
      method: context.method,
      field: key,
      message: `操作${key === "summary" ? "摘要" : "描述"}变化`,
    });
  }
}

function diffParameters(
  context: OperationContext,
  baselineItem: JsonObject,
  baselineOp: JsonObject,
  currentItem: JsonObject,
  currentOp: JsonObject
): void {
  const baselineParams = parametersOf(baselineItem, baselineOp, context.baselineRoot);
  const currentParams = parametersOf(currentItem, currentOp, context.currentRoot);

  for (const [key, baselineParam] of baselineParams) {
    const currentParam = currentParams.get(key);
    const name = typeof baselineParam.name === "string" ? baselineParam.name : key;
    if (!currentParam) {
      context.changes.push({
        severity: "compatible",
        kind: "removed-parameter",
        location: context.location,
        path: context.apiPath,
        method: context.method,
        field: `parameters.${name}`,
        message: `删除参数 ${name}`,
      });
      continue;
    }
    const wasRequired = baselineParam.required === true;
    const isRequired = currentParam.required === true;
    if (wasRequired !== isRequired) {
      context.changes.push({
        severity: isRequired ? "breaking" : "compatible",
        kind: isRequired ? "parameter-became-required" : "parameter-became-optional",
        location: context.location,
        path: context.apiPath,
        method: context.method,
        field: `parameters.${name}`,
        message: isRequired ? `参数由可选变为必填:${name}` : `参数由必填变为可选:${name}`,
      });
    }
    diffSchema(baselineParam.schema, currentParam.schema, ["parameters", name], {
      ...context,
      direction: "request",
      schemaName: undefined,
      visiting: new Set<string>(),
      depth: 0,
    });
  }

  for (const [key, currentParam] of currentParams) {
    if (baselineParams.has(key)) {
      continue;
    }
    const name = typeof currentParam.name === "string" ? currentParam.name : key;
    const isRequired = currentParam.required === true;
    context.changes.push({
      severity: isRequired ? "breaking" : "compatible",
      kind: isRequired ? "added-required-parameter" : "added-optional-parameter",
      location: context.location,
      path: context.apiPath,
      method: context.method,
      field: `parameters.${name}`,
      message: isRequired ? `新增必填参数:${name}` : `新增可选参数:${name}`,
    });
  }
}

function diffRequestBody(context: OperationContext, baselineOp: JsonObject, currentOp: JsonObject): void {
  const baselineBody = asObject(baselineOp.requestBody);
  const currentBody = asObject(currentOp.requestBody);
  const baselineSchema = bodySchemaOf(baselineBody);
  const currentSchema = bodySchemaOf(currentBody);

  if (!baselineSchema && !currentSchema) {
    return;
  }
  if (!baselineSchema && currentSchema) {
    const required = currentBody.required === true;
    context.changes.push({
      severity: required ? "breaking" : "compatible",
      kind: required ? "added-required-request-body" : "added-request-body",
      location: context.location,
      path: context.apiPath,
      method: context.method,
      field: "requestBody",
      message: required ? "新增必填请求体" : "新增请求体",
    });
    return;
  }
  if (baselineSchema && !currentSchema) {
    context.changes.push({
      severity: "compatible",
      kind: "removed-request-body",
      location: context.location,
      path: context.apiPath,
      method: context.method,
      field: "requestBody",
      message: "删除请求体",
    });
    return;
  }
  if (baselineSchema && currentSchema) {
    diffSchema(baselineSchema, currentSchema, ["requestBody"], {
      ...context,
      direction: "request",
      schemaName: undefined,
      visiting: new Set<string>(),
      depth: 0,
    });
  }
}

function diffResponses(context: OperationContext, baselineOp: JsonObject, currentOp: JsonObject): void {
  const baselineResponses = asObject(baselineOp.responses);
  const currentResponses = asObject(currentOp.responses);

  for (const [status, baselineResponse] of Object.entries(baselineResponses)) {
    const currentResponse = currentResponses[status];
    if (!isObject(baselineResponse) || !isObject(currentResponse)) {
      context.changes.push({
        severity: "compatible",
        kind: "removed-response",
        location: context.location,
        path: context.apiPath,
        method: context.method,
        field: `responses.${status}`,
        message: `删除响应状态码 ${status}`,
      });
      continue;
    }
    const baselineSchema = bodySchemaOf(baselineResponse);
    const currentSchema = bodySchemaOf(currentResponse);
    if (baselineSchema && !currentSchema) {
      context.changes.push({
        severity: "breaking",
        kind: "removed-response-body",
        location: context.location,
        path: context.apiPath,
        method: context.method,
        field: `responses.${status}`,
        message: `删除响应体:${status}`,
      });
      continue;
    }
    if (!baselineSchema && currentSchema) {
      context.changes.push({
        severity: "compatible",
        kind: "added-response-body",
        location: context.location,
        path: context.apiPath,
        method: context.method,
        field: `responses.${status}`,
        message: `新增响应体:${status}`,
      });
      continue;
    }
    if (baselineSchema && currentSchema) {
      diffSchema(baselineSchema, currentSchema, ["responses", status], {
        ...context,
        direction: "response",
        schemaName: undefined,
        visiting: new Set<string>(),
        depth: 0,
      });
    }
  }

  for (const status of Object.keys(currentResponses)) {
    if (isObject(baselineResponses[status])) {
      continue;
    }
    context.changes.push({
      severity: "compatible",
      kind: "added-response",
      location: context.location,
      path: context.apiPath,
      method: context.method,
      field: `responses.${status}`,
      message: `新增响应状态码 ${status}`,
    });
  }
}

interface OperationContext {
  location: string;
  apiPath: string;
  method: string;
  baselineRoot: JsonObject;
  currentRoot: JsonObject;
  changes: ApiChange[];
}

interface SchemaContext extends OperationContext {
  direction: Direction;
  schemaName?: string;
  visiting: Set<string>;
  depth: number;
}

function diffSchema(baselineNode: unknown, currentNode: unknown, parts: string[], context: SchemaContext): void {
  if (!isObject(baselineNode) || !isObject(currentNode) || context.depth > MAX_DEPTH) {
    return;
  }
  // $ref 只按名字参与递归判定，比较前展开为真实结构；
  // 否则自递归模型会无限展开，或在 ref 同构时把差异藏进未被访问的组件。
  const baseline = expandSchema(baselineNode, context.baselineRoot, new Set());
  const current = expandSchema(currentNode, context.currentRoot, new Set());
  const schemaName = baseline.name ?? current.name ?? context.schemaName;

  const recursionKey =
    baseline.name && current.name ? `${baseline.name}->${current.name}|${context.location}|${parts.join(".")}` : undefined;
  if (recursionKey) {
    if (context.visiting.has(recursionKey)) {
      return;
    }
    context.visiting.add(recursionKey);
  }
  try {
    diffResolvedSchema(baseline.node, current.node, parts, { ...context, schemaName, depth: context.depth + 1 });
  } finally {
    if (recursionKey) {
      context.visiting.delete(recursionKey);
    }
  }
}

function diffResolvedSchema(baseline: JsonObject, current: JsonObject, parts: string[], context: SchemaContext): void {
  if (context.depth > MAX_DEPTH) {
    return;
  }
  const baselineNullable = baseline.nullable === true;
  const currentNullable = current.nullable === true;
  if (baselineNullable && !currentNullable) {
    pushTypeChange(context, parts, "type-narrowed", "由可空收窄为非空");
  } else if (!baselineNullable && currentNullable) {
    pushTypeChange(context, parts, "type-widened", "由非空放宽为可空");
  }

  diffTypes(baseline, current, parts, context);
  diffVariants(baseline, current, parts, context);
  diffArrayItems(baseline, current, parts, context);
  diffObjectProperties(baseline, current, parts, context);
}

function diffTypes(baseline: JsonObject, current: JsonObject, parts: string[], context: SchemaContext): void {
  const baselineTypes = typeSetOf(baseline);
  const currentTypes = typeSetOf(current);
  if (!baselineTypes && !currentTypes) {
    return;
  }
  if (!baselineTypes && currentTypes) {
    pushTypeChange(context, parts, "type-narrowed", `由任意类型收窄为 ${currentTypes.join("|")}`);
    return;
  }
  if (baselineTypes && !currentTypes) {
    pushTypeChange(context, parts, "type-widened", `由 ${baselineTypes.join("|")} 放宽为任意类型`);
    return;
  }
  if (!baselineTypes || !currentTypes) {
    return;
  }
  const currentSubset = currentTypes.every((type) => baselineTypes.some((base) => isAssignable(type, base)));
  const baselineSubset = baselineTypes.every((type) => currentTypes.some((next) => isAssignable(type, next)));
  if (currentSubset && baselineSubset) {
    return;
  }
  const detail = `${baselineTypes.join("|")} → ${currentTypes.join("|")}`;
  if (currentSubset) {
    pushTypeChange(context, parts, "type-narrowed", `类型收窄:${detail}`);
  } else if (baselineSubset) {
    pushTypeChange(context, parts, "type-widened", `类型放宽:${detail}`);
  } else {
    pushTypeChange(context, parts, "type-changed", `类型变更:${detail}`);
  }
}

function diffVariants(baseline: JsonObject, current: JsonObject, parts: string[], context: SchemaContext): void {
  const baselineVariants = variantsOf(baseline);
  const currentVariants = variantsOf(current);
  if (!baselineVariants.length && !currentVariants.length) {
    return;
  }
  if (currentVariants.length < baselineVariants.length) {
    pushTypeChange(
      context,
      parts,
      "type-narrowed",
      `联合类型候选由 ${baselineVariants.length} 个减少为 ${currentVariants.length} 个`
    );
  }
  const shared = Math.min(baselineVariants.length, currentVariants.length);
  for (let index = 0; index < shared; index++) {
    diffSchema(baselineVariants[index], currentVariants[index], [...parts, `variant[${index}]`], context);
  }
}

function diffArrayItems(baseline: JsonObject, current: JsonObject, parts: string[], context: SchemaContext): void {
  const baselineItems = baseline.items;
  const currentItems = current.items;
  const baselineArray = typeSetOf(baseline)?.includes("array") === true || isObject(baselineItems);
  const currentArray = typeSetOf(current)?.includes("array") === true || isObject(currentItems);
  if (!baselineArray && !currentArray) {
    return;
  }
  if (isObject(baselineItems) && isObject(currentItems)) {
    diffSchema(baselineItems, currentItems, [...parts, "[]"], context);
  } else if (!isObject(baselineItems) && isObject(currentItems)) {
    pushTypeChange(context, parts, "type-narrowed", "数组元素由任意类型收窄为具体类型");
  } else if (isObject(baselineItems) && !isObject(currentItems)) {
    pushTypeChange(context, parts, "type-widened", "数组元素由具体类型放宽为任意类型");
  }
}

function diffObjectProperties(baseline: JsonObject, current: JsonObject, parts: string[], context: SchemaContext): void {
  const baselineProps = asObject(baseline.properties);
  const currentProps = asObject(current.properties);
  if (!Object.keys(baselineProps).length && !Object.keys(currentProps).length) {
    return;
  }
  const currentRequired = new Set(requiredOf(current));
  const baselineRequired = new Set(requiredOf(baseline));

  for (const [name, baselineProp] of Object.entries(baselineProps)) {
    if (!isObject(baselineProp)) {
      continue;
    }
    const fieldParts = [...parts, name];
    const currentProp = currentProps[name];
    if (!isObject(currentProp)) {
      const field = fieldParts.join(".");
      if (baselineRequired.has(name)) {
        pushFieldChange(context, "breaking", "removed-required-field", field, `删除必填字段:${field}`);
      } else {
        // 响应字段删除同样会打断对接方；请求侧可选字段删除不破坏已有调用
        const severity = context.direction === "response" ? "breaking" : "compatible";
        const kind = context.direction === "response" ? "removed-response-field" : "removed-optional-field";
        pushFieldChange(context, severity, kind, field, `删除${context.direction === "response" ? "响应" : "可选"}字段:${field}`);
      }
      continue;
    }

    const wasRequired = baselineRequired.has(name);
    const isRequired = currentRequired.has(name);
    if (wasRequired !== isRequired) {
      const field = fieldParts.join(".");
      if (context.direction === "request" && isRequired) {
        pushFieldChange(context, "breaking", "field-became-required", field, `字段由可选变为必填:${field}`);
      } else if (context.direction === "response" && isRequired) {
        pushFieldChange(context, "compatible", "field-became-required", field, `响应字段由可选变为必有:${field}`);
      } else {
        pushFieldChange(
          context,
          context.direction === "request" ? "compatible" : "breaking",
          "field-became-optional",
          field,
          `字段由必填变为可选:${field}`
        );
      }
    }
    diffSchema(baselineProp, currentProp, fieldParts, context);
  }

  for (const name of Object.keys(currentProps)) {
    if (!isObject(currentProps[name]) || isObject(baselineProps[name])) {
      continue;
    }
    const field = [...parts, name].join(".");
    const isRequired = currentRequired.has(name);
    if (context.direction === "request" && isRequired) {
      pushFieldChange(context, "breaking", "added-required-field", field, `新增必填字段:${field}`);
    } else {
      pushFieldChange(context, "compatible", "added-optional-field", field, `新增可选字段:${field}`);
    }
  }
}

function pushTypeChange(
  context: SchemaContext,
  parts: string[],
  kind: "type-narrowed" | "type-widened" | "type-changed",
  message: string
): void {
  pushFieldChange(context, kind === "type-widened" ? "compatible" : "breaking", kind, parts.join("."), message);
}

function pushFieldChange(
  context: SchemaContext,
  severity: ChangeSeverity,
  kind: ChangeKind,
  field: string,
  message: string
): void {
  context.changes.push({
    severity,
    kind,
    location: context.location,
    path: context.apiPath,
    method: context.method,
    schema: context.schemaName,
    field,
    message,
  });
}

function expandSchema(node: JsonObject, root: JsonObject, seen: Set<string>): { node: JsonObject; name?: string } {
  let name: string | undefined;
  let fromRef: JsonObject = {};
  const ref = typeof node.$ref === "string" ? node.$ref : undefined;
  if (ref) {
    name = componentNameOf(ref);
    if (!seen.has(ref)) {
      const target = resolveRef(root, ref);
      if (isObject(target)) {
        const expanded = expandSchema(target, root, new Set([...seen, ref]));
        fromRef = expanded.node;
        name = expanded.name ?? name;
      }
    }
  }

  const siblings: JsonObject = { ...node };
  delete siblings.$ref;
  const allOf = Array.isArray(siblings.allOf) ? siblings.allOf : [];
  delete siblings.allOf;

  let merged: JsonObject = {};
  for (const branch of allOf) {
    if (!isObject(branch)) {
      continue;
    }
    const expanded = expandSchema(branch, root, seen);
    merged = mergeSchema(merged, expanded.node);
    name = name ?? expanded.name;
  }
  merged = mergeSchema(merged, fromRef);
  merged = mergeSchema(merged, siblings);
  return { node: merged, name };
}

function mergeSchema(base: JsonObject, overlay: JsonObject): JsonObject {
  const result: JsonObject = { ...base, ...overlay };
  const baseProperties = asObject(base.properties);
  const overlayProperties = asObject(overlay.properties);
  if (Object.keys(baseProperties).length || Object.keys(overlayProperties).length) {
    result.properties = { ...baseProperties, ...overlayProperties };
  }
  const baseRequired = requiredOf(base);
  const overlayRequired = requiredOf(overlay);
  if (baseRequired.length || overlayRequired.length) {
    result.required = [...new Set([...baseRequired, ...overlayRequired])];
  }
  if (overlay.type === undefined && base.type !== undefined) {
    result.type = base.type;
  }
  if (overlay.nullable === undefined && base.nullable !== undefined) {
    result.nullable = base.nullable;
  }
  if (overlay.items === undefined && base.items !== undefined) {
    result.items = base.items;
  }
  return result;
}

function resolveRef(root: JsonObject, ref: string): unknown {
  if (!ref.startsWith("#/")) {
    return undefined;
  }
  let current: unknown = root;
  for (const raw of ref.slice(2).split("/")) {
    if (!isObject(current)) {
      return undefined;
    }
    current = current[decodePointer(raw)];
  }
  return current;
}

function decodePointer(raw: string): string {
  return raw.replace(/~1/g, "/").replace(/~0/g, "~");
}

function componentNameOf(ref: string): string | undefined {
  if (!ref.startsWith("#/")) {
    return undefined;
  }
  const segments = ref.slice(2).split("/");
  return segments.length ? decodePointer(segments[segments.length - 1]) : undefined;
}

function parametersOf(item: JsonObject, op: JsonObject, root: JsonObject): Map<string, JsonObject> {
  const result = new Map<string, JsonObject>();
  for (const raw of [...asArray(item.parameters), ...asArray(op.parameters)]) {
    if (!isObject(raw)) {
      continue;
    }
    const param = expandSchema(raw, root, new Set()).node;
    const location = typeof param.in === "string" ? param.in : "query";
    const name = typeof param.name === "string" ? param.name : "";
    result.set(`${location}:${name}`, param);
  }
  return result;
}

function bodySchemaOf(node: JsonObject): JsonObject | undefined {
  const content = asObject(node.content);
  const preferred = content["application/json"] ?? content[Object.keys(content)[0]];
  const media = asObject(preferred);
  return isObject(media.schema) ? media.schema : undefined;
}

function operationsOf(item: JsonObject): Map<string, JsonObject> {
  const result = new Map<string, JsonObject>();
  for (const method of HTTP_METHODS) {
    const op = item[method];
    if (isObject(op)) {
      result.set(method, op);
    }
  }
  return result;
}

function typeSetOf(node: JsonObject): string[] | undefined {
  if (typeof node.type === "string") {
    return [node.type];
  }
  if (Array.isArray(node.type)) {
    const types = node.type.filter((value): value is string => typeof value === "string");
    return types.length ? types : undefined;
  }
  return undefined;
}

function variantsOf(node: JsonObject): unknown[] {
  if (Array.isArray(node.oneOf) && node.oneOf.length) {
    return node.oneOf;
  }
  if (Array.isArray(node.anyOf) && node.anyOf.length) {
    return node.anyOf;
  }
  return [];
}

function isAssignable(child: string, parent: string): boolean {
  return child === parent || (child === "integer" && parent === "number");
}

function requiredOf(node: JsonObject): string[] {
  return asArray(node.required).filter((value): value is string => typeof value === "string");
}

function asObject(value: unknown): JsonObject {
  return isObject(value) ? value : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dedupe(changes: ApiChange[]): ApiChange[] {
  const seen = new Set<string>();
  const result: ApiChange[] = [];
  for (const change of changes) {
    const key = [change.severity, change.kind, change.location, change.schema ?? "", change.field ?? ""].join("|");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(change);
  }
  return result;
}

function compareChange(left: ApiChange, right: ApiChange): number {
  if (left.severity !== right.severity) {
    return left.severity === "breaking" ? -1 : 1;
  }
  return (
    left.path.localeCompare(right.path) ||
    (left.method ?? "").localeCompare(right.method ?? "") ||
    (left.field ?? "").localeCompare(right.field ?? "") ||
    left.kind.localeCompare(right.kind)
  );
}


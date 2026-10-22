# 继承接口解析:抽象父类/接口声明的端点归属具体 Controller

> 状态:已实现(128 测试全绿),2026-10-22
> 背景:在真实项目 child-adolescent-health-backend(Ext Plus 框架)中,
> `AbstractScaleController`(抽象基类,无 `@RestController`、无类级 `@RequestMapping`)声明了
> `@GetMapping("record") public ResponseDto<AssessmentRecordResponse> getScaleRecord(...)`,
> `ErxinScaleController` 等 5 个子类继承它并各自声明 `@RestController` + `@RequestMapping("assessment/visits/{visitId}/scales/XXX")`。
> 插件此前只解析 Controller 自身类体内的 `methodDeclaration`,`record` / `draft` 等继承来的端点整体缺失。

## 1. 现状(修复前)

- `src/java/controllerParser.ts` 的 `parseControllers` 只遍历 `typeDeclaration` 自身的方法,
  没有任何「父类型」概念;抽象基类因无 `@RestController` 被直接跳过,子类又看不到父类方法。
- 类级路径前缀只取具体类自己的 `@RequestMapping`;父类上的类级映射(Spring `findMergedAnnotation` 会继承)同样被忽略。
- `parseControllers` 在无 `TypeIndex` 时(CodeLens 单文件路径)必须保持原行为。
- `superClassOf`(typeIndex)只能拿到父类**类型文本**,拿不到父类的方法节点,无法支撑端点解析。

## 2. 参考实现(IDEA 版 → easy-api)

IDEA 版插件不开源(基于 easy-api 定制),以 [tangcent/easy-api](https://github.com/tangcent/easy-api) 源码为口径
(`framework/springmvc/RequestMappingResolver.kt`、`core/psi/type/ResolvedTypes.kt`,
官方测试 `framework/springmvc/InheritedControllerExportTest.kt`):

- **方法枚举**:`ClassType.suitableMethods()` = `psiClass.allMethods`(PSI 自带父类/接口继承,排除构造器与 `java.lang.Object`)
  按 `findSuperMethods()` 去重——被覆写时只保留子类声明,父类声明移出。
- **方法级映射**:`RequestMappingResolver.resolve(resolvedMethod)` 先看方法自身,再沿 `ResolvedMethod.superMethods()`
  逐级向上找映射注解——**覆写未重声明映射时,父类注解仍然生效**。参数注解同样支持沿链回查(如 `@RequestBody` 声明在接口上)。
- **类级映射**:`extractClassMapping` 先看类自身,再按 `allSuperClasses()`(BFS,去重、排除 Object)找**最近的一处**,
  不把父类与子类的前缀叠加(与 Spring `AnnotatedElementUtils.findMergedAnnotation(TYPE_HIERARCHY)` 一致)。
- **Controller 识别**:`SpringControllerRecognizer.isApiClass` 只看类自身/元注解,不因父类被标注而把子类识别为 Controller。

## 3. 本次改动

| 文件 | 改动 |
| --- | --- |
| `src/java/model.ts` | `EndpointInfo` 增加 `ownerFsPath`(具体 Controller 文件)、`declaringType`(方法实际声明类型) |
| `src/java/controllerParser.ts` | 新增 `TypeSite`/`typeSiteOf`/`buildTypeSites`(顶层类型声明站点);`directSuperTypeNames` 读取 `classExtends`/`classImplements`/`interfaceExtends`;`superTypeChain` BFS 收集继承链;`detectFlavor`(具体类优先,父类 `@RestController` 兜底)、`classBasePaths`(继承链上最近的类级映射);`declaredMethodsOf`/`collectMethodHits`/`methodSignature`(按签名去重、父类 private/static 过滤);`hasNonHandlerModifier` |
| `src/openapi/builder.ts` | operation 的类作用域按 `ep.declaringType ?? ep.controller` 取(继承方法的签名类型在声明处解析) |
| `src/extension.ts` | 「同步当前文件」过滤条件增加 `ep.ownerFsPath === target.fsPath` |
| `src/test/analyze.test.ts` | 新增 2 个回归用例(抽象父类继承 + implements 接口声明映射) |
| `README.md` | 接口识别「继承接口」条目与已知边界 |

## 4. 关键决策

- **D1 只做源码内继承**:继承链只能追溯到工作区源码中可定位的顶层类型;依赖 jar 内的父类(如框架基类)无方法源码,不参与。
  非顶层(嵌套)类型不做继承展开,与 `parseControllers` 的既有扫描范围一致。
- **D2 子类覆写优先,但不吞掉父类映射**:按「方法名 + 形参类型简单名」识别覆写;
  只有**产出端点**(命中映射注解且未被 hidden/规则忽略)的声明才占用签名,因此子类覆写未重声明映射时,
  父类声明继续产出(对齐 easy-api `superMethods()` 回退)。覆写并重声明映射时只保留子类声明。
- **D3 类级前缀不叠加**:取继承链(具体类 → 父类 BFS → 接口)上最近的一处 `@RequestMapping` / `@Path`,
  与 Spring 的合并注解口径一致;Feign 的 `@FeignClient(path)` 同理。
- **D4 声明位置与归属分离**:`fsPath`/`methodRange` 指向方法真实声明处(父类文件,保证跳转到定义准确),
  `ownerFsPath` 指向具体 Controller 文件(保证「同步当前文件」不丢接口);`controller`/`operationId`/`tag` 一律取具体类。
- **D5 边界**:覆写且未重声明映射时,参数与返回值按**父类声明**解析(而非 easy-api 的「子类参数 + 沿链回查注解」);
  泛型父类的形参不做实例化绑定,保持既有的「不解析泛型继承」能力边界。

## 5. 验证

- `npm test`:128 用例全绿;新增同名重载回归用例覆盖参数全限定名区分。
- 真实工程端到端(469 个 Java 文件):接口数 121 → 127,新增 6 个继承端点,
  如 `GET /assessment/visits/{visitId}/scales/CARS/record <- CarsScaleController.getScaleRecord`
  (`declaringType=AbstractScaleController`,`fsPath=AbstractScaleController.java`),
  摘要/路径参数/响应 `$ref` 均正常,告警为 0。

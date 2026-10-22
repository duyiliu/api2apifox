# 嵌套类型按 Java 作用域解析 + 同名模型 `_N` 后缀

> 状态:已实现(134 核心测试、10 CLI 测试全绿),2026-10-22
> 背景:在真实项目 child-adolescent-health-backend(Ext Plus 框架)中,
> `SpecialVisitExamProjectSaveRequest.ExamProject`(嵌套 DTO)与
> `modules.exam.model.entity.ExamProject`(顶层实体)简单名相同,
> 同步到 Apifox 后请求体字段 `examProjects.items` 错引了实体模型(实体字段 `projectName`),
> 而非请求内嵌的 `projectCode`。

## 1. 现状(修复前)

- `src/java/typeIndex.ts` 的类型索引**只按简单名**建键:嵌套类型仅在简单名未被占用时进入 `types`,
  与顶层类型重名时被静默丢弃(README「已知边界」里的既有说明)。
- `src/java/schemaResolver.ts` 的 `resolveType` 一律 `resolveIndexedType(index, simpleName)`,
  没有「当前类的作用域」概念,类体内对简单名的引用无法优先命中成员类型。
- `SchemaRegistry.getOrAdd` 以简单名为键:同名类型即使结构不同也会复用同一个 `$ref`(静默错引)。

## 2. 参考实现(IDEA 版 Apifox Helper)

IDEA 版插件不开源,官方文档说明其「基于 [easy-api](https://github.com/tangcent/easy-api) 定制开发」,
故以 easy-api 为参考口径:

- **类型解析**:`core/psi/DefaultPsiClassHelper.kt` 用 `JavaPsiFacade...createTypeFromText(text, contextElement)`
  在声明处(字段所属类)的作用域内建 `PsiType` 再 `TypeResolver.resolve`,即 Java 语义下
  嵌套成员类型遮蔽同名顶层类型;`ObjectModel.ref` 注释亦说明「a nested class knows its own name」。
- **模型命名**:`channel/openapi/OpenApiSchemaConverter.kt` 的 `componentName` 取简单名
  (`substringBefore('<').substringAfterLast('.')`);`registerWithShapeCheck` 在同名且**结构不同**时
  追加 `_2`、`_3` … 并 `warn`,结构相同则复用同一 `$ref`。

## 3. 本次改动

| 文件 | 改动 |
| --- | --- |
| `src/java/model.ts` | `ClassInfo` 增加 `enclosing`(外层类型简单名链,由外向内);`TypeIndex` 增加 `nested`(`Outer.Inner` -> ClassInfo) |
| `src/java/typeIndex.ts` | `buildIndex` 改为递归登记嵌套类型;嵌套类型**始终**进入 `nested`,简单名未被占用时同时进入 `types`(保留顶层优先);`qualifiedName` 修正为 `package.Outer.Inner`;新增 `resolveScopedType`(作用域优先 + 显式 `Outer.Inner` 支持)与 `typeScopeOf` |
| `src/java/schemaResolver.ts` | `ResolveContext.scope`;`classSchema` 以本类作用域解析字段/父类;`resolveType`/`enumTypeNameOf` 走 `resolveScopedType`;`SchemaRegistry` 改为「类型身份(qualifiedName+泛型实参)去重 + 同名不同结构追加 `_N` + 告警」 |
| `src/openapi/builder.ts` | 按 Controller 自身作用域解析接口签名类型;并入 `registry.warnings` |
| `src/java/controllerParser.ts` | 查询 Bean 展开按所属类作用域解析字段/父类 |
| `src/test/analyze.test.ts` | 新增 2 个回归用例(同名嵌套类遮蔽实体 + 显式 `Outer.Inner`) |
| `README.md` | 「已知边界」更新为作用域解析与 `_N` 后缀口径 |

## 4. 关键决策

- **D1 作用域优先于顶层**:类体内简单名先查 `nested.get("外层链.简单名")`,作用域保存完整成员路径(如 `Outer.Inner` → `Outer`),再由内向外、最后回退顶层。
  顶层同包/跨包重名仍无法区分(插件不做 import 解析),保持「后扫描覆盖」的既有边界。
- **D2 去重键用类型身份而非显示名**:同一 `ClassInfo` 的泛型实例按 `qualifiedName + «调用处解析后的实参身份»` 复用;
  不同身份、显示名相同、结构不同才追加 `_N`,避免修复作用域后仍复用错误 `$ref`。
- **D3 构建前预留唯一名称**:正在构建的名称与已完成名称均不可重复占用,循环引用发出后不再重命名。
  仅对已完成且本次无循环引用的同结构模型复用名称,避免重建单个模型时遗留其他模型中的旧引用。

## 5. 验证

- 2026-10-22 复审回归:`npm test` 134/134,CLI 测试 10/10;覆盖多层作用域、泛型包装与继承、同名双向递归(两个入口方向)及非递归同结构复用。

- 初次实现时:`npm test` 125 用例全绿(原 123 + 新增 2)。
- 初次实现时的真实工程端到端(439 个 Java 文件):
  `SpecialVisitExamProjectSaveRequest.examProjects.items -> #/components/schemas/ExamProject`,
  该 `ExamProject` 的 properties 为 `{projectCode}`(嵌套 DTO),实体未被任何接口引用故不产生 `_2`。

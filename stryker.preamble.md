# 存活变异等价性说明（同步维护）

Stryker 在 `out/**`（tsc 产物）上运行。TS 为每个模块注入两行 CJS 样板：

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
```

这两行里的 `"use strict"`、`"__esModule"`、`{value:true}`/`{value:false}`/`{}` 被变异后
**不影响任何可观测行为**：

- `__esModule` 只用于 ESM/CJS 互操作标记，本仓库全部模块经 tsc 编成 CJS 并由 CJS `require` 加载，
  没有 `import x from` 形式的默认导入依赖该标记；
- 该标记既不被测试读取，也不进入任何对外产物（CLI 由 esbuild bundle，扩展由 esbuild 打包，
  两者都会自己生成互操作标记）。

因此位于 `文件:2:*` 且属于 `Object.defineProperty(exports, "__esModule", …)` 的存活变异，
统一判为**等价变异**，不计入未覆盖缺陷。其余任何存活变异都必须逐条解释或补测试杀死。

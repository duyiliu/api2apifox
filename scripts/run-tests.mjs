// 枚举 out/test 下全部测试文件交给 node --test。
// 不能直接用 --test <目录> 或 --test <glob>:不同 Node 版本对目录扫描与
// glob 参数的支持不一致(CI Node 20 无 glob,部分版本目录参数失效),
// 显式文件列表在任何环境下行为一致,且新增测试文件无需维护清单。
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const dir = "out/test";
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".test.js"))
  .sort()
  .map((f) => `${dir}/${f}`);

if (!files.length) {
  console.error(`未找到测试文件:${dir}/*.test.js(先运行 npm run build:test)`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
process.exit(result.status ?? 1);

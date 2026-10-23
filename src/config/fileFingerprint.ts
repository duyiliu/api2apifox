import * as fs from "node:fs";

/** 文件的大小与修改时间,用于判断会话缓存是否仍然有效 */
export interface FileStamp {
  size: number;
  mtimeMs: number;
}

/** 文件指纹探测(测试可注入,避免依赖真实文件系统) */
export type FileStat = (filePath: string) => FileStamp | undefined;

/** 默认探测:文件不可读/不存在时返回 undefined,由调用方记为 missing */
export const statFileSync: FileStat = (filePath) => {
  try {
    const st = fs.statSync(filePath);
    return { size: st.size, mtimeMs: st.mtimeMs };
  } catch {
    return undefined;
  }
};

/**
 * 构造一组文件的指纹:路径集合 + 各文件 size/mtime。
 *
 * 用于会话级缓存失效判断:路径集合变化(新增/删除配置文件)或任一文件
 * 内容变化(mtime/size 变化)都会得到不同指纹;输入顺序不影响结果。
 * 不可读/不存在的文件记为 missing,因此文件重新出现也会使指纹变化。
 */
export function fileSetFingerprint(paths: Iterable<string>, stat: FileStat = statFileSync): string {
  const unique = [...new Set(paths)].sort();
  return unique
    .map((filePath) => {
      const st = stat(filePath);
      return st ? `${filePath}|${st.size}|${st.mtimeMs}` : `${filePath}|missing`;
    })
    .join("\n");
}

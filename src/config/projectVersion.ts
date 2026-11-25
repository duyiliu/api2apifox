/**
 * 从工作区根 pom.xml 提取项目 <version>,作为 OpenAPI info.version 的自动回退来源。
 *
 * 口径:
 *  - 只取 project 元素直接子级的 <version>(父 pom 坐标 <parent><version> 不算,
 *    因为继承父版本的项目自身也可能覆写;读不到自身版本就回退默认,不去猜)。
 *  - 带 "-SNAPSHOT" 后缀时剔除快照标记:接口文档面向的是迭代版本而非单次快照构建。
 *  - 含 ${} 占位、空值、文件缺失或畸形时返回 undefined,调用方静默回退默认值,
 *    不产生任何 warning(Issue #53 验收要求)。
 */

/** 从 pom.xml 文本解析项目版本(纯函数,便于测试);取不到时返回 undefined */
export function parsePomProjectVersion(text: string): string | undefined {
  // 去掉注释,防止注释里的示例 <version> 被误读
  const uncommented = text.replace(/<!--[\s\S]*?-->/g, "");
  const projectMatch = /<project(?:\s[^>]*)?>([\s\S]*?)<\/project>/i.exec(uncommented);
  if (!projectMatch) {
    return undefined;
  }
  const body = projectMatch[1];
  // 剥掉 <parent>...</parent> 段后再找顶层 <version>
  const withoutParent = body.replace(/<parent(?:\s[^>]*)?>[\s\S]*?<\/parent>/i, "");
  const versionMatch = /<version>\s*([^<]+?)\s*<\/version>/i.exec(withoutParent);
  if (!versionMatch) {
    return undefined;
  }
  const raw = versionMatch[1].trim();
  if (!raw || raw.includes("${")) {
    return undefined;
  }
  const stripped = raw.replace(/-SNAPSHOT$/i, "");
  return stripped || undefined;
}

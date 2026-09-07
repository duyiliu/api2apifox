/** 解析后的 Javadoc */
export interface JavadocInfo {
  /** 首行(通常适合做 summary) */
  firstLine: string;
  /** 正文描述(去掉 @tag 行) */
  description: string;
  /** @param name -> 说明 */
  params: Record<string, string>;
  /** @return 说明 */
  returns?: string;
}

/**
 * 解析 Javadoc 原文(/** * ... *\/ 完整注释文本)。
 * 只做面向文档生成的最小解析:首行、正文、@param、@return。
 */
export function parseJavadoc(raw: string | undefined): JavadocInfo | undefined {
  if (!raw) {
    return undefined;
  }
  const cleaned = cleanJavadoc(raw);
  if (!cleaned) {
    return undefined;
  }
  const lines = cleaned.split("\n");
  const params: Record<string, string> = {};
  let returns: string | undefined;
  const descLines: string[] = [];
  let currentTag: string | null = null;

  for (const line of lines) {
    const tagMatch = line.match(/^\s*@(\w+)\s*(.*)$/);
    if (tagMatch) {
      const tag = tagMatch[1];
      const rest = tagMatch[2].trim();
      if (tag === "param") {
        const m = rest.match(/^(\S+)\s*(.*)$/);
        if (m) {
          params[m[1]] = m[2];
        }
        currentTag = null;
      } else if (tag === "return") {
        returns = rest;
        currentTag = null;
      } else {
        // 其他 @tag(如 @author/@throws)不计入描述
        currentTag = tag;
      }
      continue;
    }
    if (currentTag) {
      // tag 的多行续文,丢弃
      continue;
    }
    descLines.push(line);
  }

  const description = descLines.join("\n").trim();
  const firstLine = descLines.find((l) => l.trim().length > 0)?.trim() ?? "";
  return { firstLine, description, params, returns };
}

/** 去掉 /** 与 *\/,以及每行前导的 * */
function cleanJavadoc(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("/**")) {
    text = text.slice(3);
  }
  if (text.endsWith("*/")) {
    text = text.slice(0, -2);
  }
  const lines = text.split("\n").map((line) => line.replace(/^\s*\*/, "").trimEnd());
  // 去掉首尾空行
  while (lines.length && lines[0].trim() === "") {
    lines.shift();
  }
  while (lines.length && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  return lines.join("\n").trim();
}

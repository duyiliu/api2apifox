#!/usr/bin/env python3
"""清理外部/工具注入的 `// @ts-nocheck`（Stryker disableTypeChecks 在 inPlace 模式下的副作用）。

规则：仅在源码/测试/脚本目录中，删除"整行等于 `// @ts-nocheck` 或 `//`"的行，
并把因此产生的连续空行折叠为一个。新写文件不适用本规则（不处理）。
"""
import glob
import sys

PATTERNS = [
    "src/**/*.ts",
    "scripts/*.mjs",
    "scripts/*.cjs",
    "packages/cli/src/**/*.ts",
    "packages/cli/test/*.js",
    "skills/api2apifox/scripts/**/*.mjs",
    "skills/api2apifox/scripts/__tests__/*.mjs",
    "skills/api2apifox/runtime/*.cjs",
]

def fold(lines):
    out, blank = [], 0
    for ln in lines:
        if ln.strip() == "":
            blank += 1
            if blank > 1:
                continue
        else:
            blank = 0
        out.append(ln)
    return out

def main() -> int:
    targets = sorted({f for pat in PATTERNS for f in glob.glob(pat, recursive=True)})
    changed = 0
    for f in targets:
        try:
            raw = open(f, "rb").read().decode("utf-8")
        except Exception:
            continue
        if "@ts-nocheck" not in raw:
            continue
        crlf = "\r\n" in raw
        lines = raw.replace("\r\n", "\n").split("\n")
        out = [ln for ln in lines if ln.strip() not in ("//", "// @ts-nocheck")]
        if out != lines:
            text = "\n".join(fold(out))
            open(f, "wb").write((text.replace("\n", "\r\n") if crlf else text).encode("utf-8"))
            changed += 1
    print(f"cleaned {changed} file(s)")
    return 0

if __name__ == "__main__":
    sys.exit(main())

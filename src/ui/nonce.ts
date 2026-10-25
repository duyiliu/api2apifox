import { randomBytes } from "crypto";

/** 生成 Webview CSP nonce(每次渲染随机,内联 script 携带后方可执行) */
export function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  const bytes = randomBytes(16);
  for (const b of bytes) {
    text += chars[b % chars.length];
  }
  return text;
}

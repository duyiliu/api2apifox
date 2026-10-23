/** 生成 Webview CSP nonce(每次渲染随机,内联 script 携带后方可执行) */
export function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  for (const b of bytes) {
    text += chars[b % chars.length];
  }
  return text;
}

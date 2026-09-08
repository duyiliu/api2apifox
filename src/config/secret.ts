import * as vscode from "vscode";

const SECRET_KEY = "apifoxHelper.token";

export async function getToken(secrets: vscode.SecretStorage): Promise<string | undefined> {
  const token = await secrets.get(SECRET_KEY);
  // 容错:历史存储或粘贴可能带空白字符,会导致 Bearer 头拼接出 401
  return token?.trim() || undefined;
}

export async function setToken(secrets: vscode.SecretStorage, token: string | undefined): Promise<void> {
  const cleaned = token?.trim();
  if (!cleaned) {
    await secrets.delete(SECRET_KEY);
  } else {
    await secrets.store(SECRET_KEY, cleaned);
  }
}

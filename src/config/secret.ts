import * as vscode from "vscode";

const SECRET_KEY = "apifoxHelper.token";

export async function getToken(secrets: vscode.SecretStorage): Promise<string | undefined> {
  return secrets.get(SECRET_KEY);
}

export async function setToken(secrets: vscode.SecretStorage, token: string | undefined): Promise<void> {
  if (token === undefined || token === "") {
    await secrets.delete(SECRET_KEY);
  } else {
    await secrets.store(SECRET_KEY, token);
  }
}

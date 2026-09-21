import { ApifoxApiError } from "../../../src/apifox/client";
import { ConfigError } from "../../../src/core/config";

export class CliError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly exitCode: number,
    readonly retryable = false,
    readonly status?: number,
    readonly details?: unknown
  ) {
    super(message);
  }
}

export function toCliError(error: unknown): CliError {
  if (error instanceof CliError) {
    return error;
  }
  if (error instanceof ConfigError) {
    return new CliError("CONFIG_INVALID", error.message, 2);
  }
  if (error instanceof ApifoxApiError) {
    if (error.status === 401) {
      return new CliError("APIFOX_AUTH_FAILED", error.message, 4, false, error.status);
    }
    if (error.status === 403 || error.status === 404) {
      return new CliError("APIFOX_FORBIDDEN", error.message, 4, false, error.status);
    }
    if (error.status === 0) {
      if (error.message.includes("请求超时")) {
        // 超时只代表本地停止等待,服务端可能已经完成导入;直接重试会产生重复写入,
        // 因此错误信息要求调用方先核对远端状态。
        return new CliError(
          "REQUEST_TIMEOUT",
          `${error.message}。导入可能已在 Apifox 服务端继续执行，请先查询目标项目确认结果再决定是否重试，不要立即重复同步`,
          5,
          true
        );
      }
      return new CliError("NETWORK_FAILED", error.message, 5, true);
    }
    return new CliError("APIFOX_REQUEST_FAILED", error.message, 5, error.status >= 500, error.status);
  }
  if (error instanceof Error && error.name === "AbortError") {
    return new CliError("CANCELLED", "操作已取消", 130);
  }
  return new CliError("INTERNAL_ERROR", error instanceof Error ? error.message : String(error), 7);
}

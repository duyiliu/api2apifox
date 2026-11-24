/** Spring HttpStatus 枚举名 -> 状态码文本(@ResponseStatus / ResponseEntity.status 共用) */
export const HTTP_STATUS_BY_NAME: Record<string, string> = {
  OK: "200", CREATED: "201", ACCEPTED: "202", NO_CONTENT: "204",
  MOVED_PERMANENTLY: "301", FOUND: "302", NOT_MODIFIED: "304",
  BAD_REQUEST: "400", UNAUTHORIZED: "401", PAYMENT_REQUIRED: "402", FORBIDDEN: "403", NOT_FOUND: "404",
  METHOD_NOT_ALLOWED: "405", NOT_ACCEPTABLE: "406", CONFLICT: "409", GONE: "410",
  UNSUPPORTED_MEDIA_TYPE: "415", TOO_MANY_REQUESTS: "429",
  INTERNAL_SERVER_ERROR: "500", NOT_IMPLEMENTED: "501", BAD_GATEWAY: "502", SERVICE_UNAVAILABLE: "503",
};

/**
 * "HttpStatus.BAD_REQUEST" / 400 / "BAD_REQUEST" -> "400";无法识别时保留原值(空串表示未声明)。
 */
export function normalizeStatus(raw: string): string {
  if (/^\d{3}$/.test(raw)) {
    return raw;
  }
  const name = raw.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw;
  return HTTP_STATUS_BY_NAME[name.trim()] || raw;
}

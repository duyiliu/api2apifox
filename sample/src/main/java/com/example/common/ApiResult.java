package com.example.common;

/**
 * 通用响应包装
 */
public class ApiResult<T> {

    /** 业务状态码 */
    private int code;

    /** 提示信息 */
    private String message;

    /** 业务数据 */
    private T data;

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public static <T> ApiResult<T> ok(T data) {
        ApiResult<T> r = new ApiResult<>();
        r.data = data;
        return r;
    }
}

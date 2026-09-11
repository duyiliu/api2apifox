package com.example.dto;

/**
 * 用户联系方式(record;组件注释与组件注解都应出现在模型描述里)
 */
public record UserContactRecord(
        /** 手机号 */
        String phone,
        @io.swagger.v3.oas.annotations.media.Schema(description = "电子邮箱")
        String email) {
}

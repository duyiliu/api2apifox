package com.example.dto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * 创建用户请求
 */
@Data
public class UserCreateRequest {

    /** 用户名(必填,2-20 字符) */
    @NotBlank
    @Size(min = 2, max = 20)
    private String username;

    /** 年龄,1-120 */
    @Min(1)
    @Max(120)
    private Integer age;

    /** 邮箱 */
    @javax.validation.constraints.Email
    private String email;

    /** 手机号 */
    @Pattern(regexp = "^1\\d{10}$")
    private String phone;
}

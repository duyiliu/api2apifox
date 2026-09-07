package com.example.dto;

import lombok.Data;

/**
 * 用户实体
 */
@Data
public class UserVO {

    /** 用户 ID */
    private Long id;

    /** 用户名 */
    private String username;

    /** 邮箱 */
    private String email;

    /** 账号状态 */
    private Status status;

    /** 角色列表 */
    private java.util.List<String> roles;
}

package com.example.dto;

/**
 * 审计字段基类
 */
public class BaseAuditVO {

    /** 创建时间 */
    private java.time.LocalDateTime createdAt;

    /** 创建人 ID */
    private Long createdBy;
}

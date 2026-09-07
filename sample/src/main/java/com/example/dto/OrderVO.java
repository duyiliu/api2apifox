package com.example.dto;

import lombok.Data;

import javax.validation.constraints.DecimalMin;

/**
 * 订单实体
 */
@Data
public class OrderVO {

    /** 订单 ID */
    private Long id;

    /** 订单号 */
    @com.alibaba.fastjson.annotation.JSONField(name = "order_no")
    private String orderNo;

    /** 内部备注(不序列化) */
    @com.alibaba.fastjson.annotation.JSONField(serialize = false)
    private String internalMemo;

    /** 金额(必须大于 0.01) */
    @DecimalMin(value = "0.01", inclusive = false)
    private java.math.BigDecimal amount;
}

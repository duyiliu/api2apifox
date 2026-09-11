package com.example.dto;

/**
 * 分页过滤条件(嵌套对象,查询参数中按 父字段.子字段 展开)
 */
public class PageFilter {

    /** 页码 */
    private Integer pageNo;

    /** 每页条数 */
    private Integer pageSize;
}

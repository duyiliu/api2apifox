package com.example.dto;

import lombok.Data;

import java.util.List;

/**
 * 通用分页对象(项目自定义,结构与 PageInfo 一致)
 */
@Data
public class PageVO<T> {

    /** 当前页数据 */
    private List<T> list;

    /** 总记录数 */
    private Long total;

    /** 当前页码 */
    private Integer pageNum;

    /** 每页条数 */
    private Integer pageSize;
}

package com.example.dto;

import java.util.List;

/**
 * 分页结果基类(泛型基类,用于验证父类泛型绑定)
 *
 * @param <T> 记录类型
 */
public abstract class BasePageResult<T> {

    /** 当前页数据 */
    private List<T> records;

    /** 总记录数 */
    private Long total;
}

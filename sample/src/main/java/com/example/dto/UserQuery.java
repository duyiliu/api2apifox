package com.example.dto;

import java.util.List;

/**
 * 用户查询条件(record 形式的查询 Bean:首组件注释、嵌套对象、集合字段)
 */
public record UserQuery(
        /** 关键字 */
        String keyword,
        /** 分页过滤 */
        PageFilter filter,
        /** 部门编码列表 */
        List<String> deptCodes) {
}

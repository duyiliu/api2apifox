package com.example.controller;

import com.example.common.ApiResult;
import com.example.dto.UserContactRecord;
import com.example.dto.UserDetailVO;
import com.example.dto.UserPageResult;
import com.example.dto.UserQuery;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

/**
 * 用户详情接口
 *
 * <p>用于覆盖继承字段合并、泛型基类绑定、嵌套静态类、record 组件与查询 Bean 展开。</p>
 */
@Tag(name = "用户详情", description = "继承与复合模型示例")
@RestController
@RequestMapping("/api/v1/user-details")
public class UserDetailController {

    /**
     * 查询用户详情
     *
     * @param id 用户 ID
     * @return 用户详情(含父类审计字段与嵌套档案信息)
     */
    @GetMapping("/{id}")
    public ApiResult<UserDetailVO> getUserDetail(@PathVariable("id") Long id) {
        return ApiResult.ok(null);
    }

    /**
     * 条件查询用户列表
     *
     * @param query 查询条件(record 查询 Bean)
     * @return 用户分页结果(继承泛型基类)
     */
    @GetMapping
    public ApiResult<UserPageResult> queryUsers(UserQuery query) {
        return ApiResult.ok(null);
    }

    /**
     * 更新用户联系方式
     *
     * @param id      用户 ID
     * @param contact 联系方式(record 请求体)
     */
    @PutMapping("/{id}/contact")
    public ApiResult<UserContactRecord> updateContact(
            @PathVariable("id") Long id,
            @RequestBody UserContactRecord contact) {
        return ApiResult.ok(null);
    }
}

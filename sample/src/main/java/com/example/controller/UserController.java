package com.example.controller;

import com.example.common.ApiResult;
import com.example.dto.Status;
import com.example.dto.UserCreateRequest;
import com.example.dto.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 用户管理接口
 */
@Tag(name = "用户管理", description = "用户 CRUD")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    /**
     * 分页查询用户列表
     *
     * @param keyword 搜索关键字
     * @param page    页码,从 1 开始
     * @return 用户分页数据
     */
    @Operation(summary = "查询用户列表")
    @GetMapping
    public ApiResult<List<UserVO>> listUsers(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(name = "page", defaultValue = "1") int page) {
        return ApiResult.ok(null);
    }

    /**
     * 创建新用户
     *
     * @param request 用户信息
     * @return 创建后的用户
     */
    @Operation(summary = "创建用户")
    @PostMapping
    public ApiResult<UserVO> createUser(@RequestBody UserCreateRequest request) {
        return ApiResult.ok(null);
    }

    /** 删除用户 */
    @RequestMapping(value = {"/{id}", "/item/{id}"}, method = {RequestMethod.DELETE})
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        return ResponseEntity.ok().build();
    }

    /**
     * 修改用户状态
     *
     * @param id     用户 ID
     * @param status 目标状态
     */
    @PutMapping("/{id}/status")
    public ApiResult<Boolean> updateStatus(
            @PathVariable("id") long id,
            @RequestParam("status") Status status,
            @RequestHeader(value = "X-Operator", required = false) String operator) {
        return ApiResult.ok(true);
    }

    /** 导入用户 Excel */
    @PostMapping("/import")
    public ApiResult<Integer> importUsers(@RequestParam("file") MultipartFile file) {
        return ApiResult.ok(0);
    }

    /**
     * 按日期导出用户(无注解的 LocalDate 参数按 query 处理)
     *
     * @param from 开始日期
     */
    @GetMapping("/export")
    public ApiResult<Void> exportByDate(java.time.LocalDate from) {
        return ApiResult.ok(null);
    }

    /**
     * 部分更新用户(JavaBean 参数缺注解,应产生解析告警)
     */
    @PatchMapping("/{id}")
    public ApiResult<Void> patchUser(@PathVariable("id") Long id, java.util.Map<String, Object> patch) {
        return ApiResult.ok(null);
    }
}

package com.example.client;

import com.example.common.ApiResult;
import com.example.dto.UserVO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * 用户服务 Feign 客户端
 */
@FeignClient(name = "user-service", path = "/api/v1/users")
public interface UserClient {

    /**
     * 查询用户
     *
     * @param id 用户 ID
     * @return 用户信息
     */
    @GetMapping("/{id}")
    ApiResult<UserVO> getUser(@PathVariable("id") Long id);

    /** 创建用户 */
    @PostMapping
    ApiResult<Void> create(@RequestBody UserVO vo);
}

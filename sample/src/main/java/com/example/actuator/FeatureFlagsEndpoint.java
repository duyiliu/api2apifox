package com.example.actuator;

import org.springframework.boot.actuate.endpoint.annotation.DeleteOperation;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.boot.actuate.endpoint.annotation.Selector;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 自定义运维端点
 */
@Component
@Endpoint(id = "feature-flags")
public class FeatureFlagsEndpoint {

    /** 查看全部开关 */
    @ReadOperation
    public Map<String, Boolean> flags() {
        return Map.of();
    }

    /** 查看单个开关 */
    @ReadOperation
    public Boolean flag(@Selector String name) {
        return true;
    }

    /** 重置开关 */
    @DeleteOperation
    public void reset(@Selector String name) {
    }
}

package com.example.controller;

import com.example.common.ApiResult;
import com.example.dto.OrderVO;
import com.example.dto.PageVO;
import com.example.dto.UserVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 订单接口
 */
@Api(tags = "订单管理")
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    /**
     * 分页查询订单(Spring Data Pageable 参数)
     *
     * @return 订单分页
     */
    @GetMapping
    public PageVO<OrderVO> listOrders(Pageable pageable) {
        return null;
    }

    /**
     * 分页查询订单(简单名 Page,按 pageTypeStyle 配置展开)
     */
    @GetMapping("/page")
    public Page<OrderVO> listOrdersByPage() {
        return null;
    }

    /**
     * 分页查询订单(PageHelper 形态)
     */
    @GetMapping("/page-helper")
    public com.github.pagehelper.PageInfo<OrderVO> listOrdersByPageHelper() {
        return null;
    }

    /**
     * 查询订单详情
     *
     * @param id 订单 ID
     */
    @GetMapping("/{id}")
    public ApiResult<OrderVO> getOrder(@org.springframework.web.bind.annotation.PathVariable("id") Long id) {
        return ApiResult.ok(null);
    }

    /**
     * 创建订单(旧接口,含隐式参数与额外响应声明)
     */
    @Deprecated
    @ApiImplicitParams({
            @ApiImplicitParam(name = "channel", value = "下单渠道", paramType = "query", dataType = "String", defaultValue = "app"),
            @ApiImplicitParam(name = "X-Trace-Id", value = "链路 ID", paramType = "header", dataType = "String")
    })
    @ApiResponses({
            @ApiResponse(code = 400, message = "参数错误"),
            @ApiResponse(code = 409, message = "库存不足")
    })
    @PostMapping
    public ApiResult<OrderVO> createOrder(@RequestParam("skuId") Long skuId, @RequestParam("count") Integer count) {
        return ApiResult.ok(null);
    }

    /**
     * 下单 V2
     */
    @ApiOperation(value = "下单 V2", notes = "需要库存服务可用")
    @PostMapping("/v2")
    public ApiResult<OrderVO> createOrderV2(@RequestParam("skuId") Long skuId) {
        return ApiResult.ok(null);
    }

    /** 内部接口,文档隐藏 */
    @io.swagger.v3.oas.annotations.Operation(hidden = true)
    @PostMapping("/internal-migrate")
    public ApiResult<Void> internalMigrate() {
        return ApiResult.ok(null);
    }

    /**
     * 删除订单
     *
     * @param id 订单 ID
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "订单不允许删除")
    public ApiResult<Void> deleteOrder(@org.springframework.web.bind.annotation.PathVariable("id") Long id) {
        return ApiResult.ok(null);
    }
}

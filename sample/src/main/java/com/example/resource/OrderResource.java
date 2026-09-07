package com.example.resource;

import com.example.dto.OrderVO;
import io.swagger.v3.oas.annotations.tags.Tag;

import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * 订单 JAX-RS 资源
 */
@Tag(name = "订单资源(JAX-RS)")
@Path("/api/jaxrs/orders")
@Produces(MediaType.APPLICATION_JSON)
public class OrderResource {

    /**
     * 查询订单列表
     *
     * @param keyword 关键字
     */
    @GET
    public List<OrderVO> list(@QueryParam("keyword") @DefaultValue("") String keyword) {
        return null;
    }

    /**
     * 查询订单
     *
     * @param id 订单 ID
     */
    @GET
    @Path("/{id}")
    public OrderVO get(@PathParam("id") Long id, @HeaderParam("X-Lang") String lang) {
        return null;
    }

    /**
     * 创建订单
     *
     * @param order 订单
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public OrderVO create(OrderVO order) {
        return null;
    }
}

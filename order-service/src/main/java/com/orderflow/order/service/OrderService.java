package com.orderflow.order.service;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.order.dto.request.CreateOrderRequest;
import com.orderflow.order.dto.request.UpdateOrderStatusRequest;
import com.orderflow.order.dto.response.OrderResponse;
import com.orderflow.order.enums.OrderStatus;

import java.util.UUID;

public interface OrderService {
    OrderResponse createOrder(UUID userId, CreateOrderRequest request);
    OrderResponse getOrderById(UUID userId, UUID orderId, boolean isAdmin);
    PageResponse<OrderResponse> getOrdersForUser(UUID userId, int page, int size);
    PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size);
    OrderResponse cancelOrder(UUID userId, UUID orderId, String reason);
    OrderResponse updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request);
}

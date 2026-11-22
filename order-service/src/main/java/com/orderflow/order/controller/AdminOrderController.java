package com.orderflow.order.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.common.dto.PageResponse;
import com.orderflow.order.dto.request.UpdateOrderStatusRequest;
import com.orderflow.order.dto.response.OrderResponse;
import com.orderflow.order.enums.OrderStatus;
import com.orderflow.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Order Management", description = "Admin fulfillment and status tracking operations")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Admin: List all orders with status filter (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<OrderResponse> response = orderService.getAllOrders(status, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Admin: Update order status (SHIPPED, DELIVERED, etc.)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated successfully", response));
    }
}

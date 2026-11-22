package com.orderflow.order.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.UnauthorizedException;
import com.orderflow.order.dto.request.CreateOrderRequest;
import com.orderflow.order.dto.response.OrderResponse;
import com.orderflow.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "Customer order creation, history and cancellation")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create order and start Saga distributed transaction")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody CreateOrderRequest request) {
        UUID userId = validateAndExtractUserId(userIdHeader);
        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully. Saga initiated.", response));
    }

    @GetMapping
    @Operation(summary = "List current user orders (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = validateAndExtractUserId(userIdHeader);
        PageResponse<OrderResponse> response = orderService.getOrdersForUser(userId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRoleHeader,
            @PathVariable UUID id) {
        UUID userId = validateAndExtractUserId(userIdHeader);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userRoleHeader);
        OrderResponse response = orderService.getOrderById(userId, id, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        UUID userId = validateAndExtractUserId(userIdHeader);
        OrderResponse response = orderService.cancelOrder(userId, id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully", response));
    }

    private UUID validateAndExtractUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            throw new UnauthorizedException("Missing authentication context");
        }
        try {
            return UUID.fromString(userIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid user ID in authentication context");
        }
    }
}

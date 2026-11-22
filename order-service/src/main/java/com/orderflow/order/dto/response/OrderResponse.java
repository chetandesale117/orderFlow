package com.orderflow.order.dto.response;

import com.orderflow.order.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private UUID userId;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private UUID shippingAddressId;
    private String shippingAddressSnapshot;
    private String notes;
    private String cancelledReason;
    private List<OrderItemResponse> items;
    private Instant createdAt;
    private Instant updatedAt;
}

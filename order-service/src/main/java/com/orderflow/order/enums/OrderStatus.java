package com.orderflow.order.enums;

public enum OrderStatus {
    PENDING,
    INVENTORY_RESERVED,
    PAYMENT_PROCESSING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    FAILED
}

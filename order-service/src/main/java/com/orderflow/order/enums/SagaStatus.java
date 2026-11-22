package com.orderflow.order.enums;

public enum SagaStatus {
    STARTED,
    STOCK_RESERVING,
    STOCK_RESERVED,
    PAYMENT_PROCESSING,
    COMPLETED,
    COMPENSATING,
    RELEASING_STOCK,
    COMPENSATION_COMPLETED,
    FAILED
}

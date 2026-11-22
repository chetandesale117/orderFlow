package com.orderflow.payment.provider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentProvider {

    PaymentResult charge(UUID orderId, UUID userId, BigDecimal amount, String currency, String idempotencyKey);

    RefundResult refund(String providerPaymentId, BigDecimal amount, String idempotencyKey);

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class PaymentResult {
        private boolean success;
        private String providerPaymentId;
        private String rawResponse;
        private String errorMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class RefundResult {
        private boolean success;
        private String providerRefundId;
        private String rawResponse;
        private String errorMessage;
    }
}

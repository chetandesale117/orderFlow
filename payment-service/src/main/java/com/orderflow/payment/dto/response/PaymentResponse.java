package com.orderflow.payment.dto.response;

import com.orderflow.payment.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private UUID userId;
    private String idempotencyKey;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String provider;
    private String providerPaymentId;
    private String failureReason;
    private Instant paidAt;
    private Instant createdAt;
    private Instant updatedAt;
}

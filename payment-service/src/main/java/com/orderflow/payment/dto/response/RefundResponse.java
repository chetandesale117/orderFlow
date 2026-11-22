package com.orderflow.payment.dto.response;

import com.orderflow.payment.enums.RefundStatus;
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
public class RefundResponse {
    private UUID id;
    private UUID paymentId;
    private String idempotencyKey;
    private BigDecimal amount;
    private String reason;
    private RefundStatus status;
    private String providerRefundId;
    private Instant createdAt;
    private Instant updatedAt;
}

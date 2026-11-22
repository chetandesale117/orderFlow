package com.orderflow.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookPayload {
    private String eventType;
    private UUID paymentId;
    private UUID orderId;
    private String providerPaymentId;
    private BigDecimal amount;
    private String status;
    private String failureReason;
}

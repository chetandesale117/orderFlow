package com.orderflow.payment.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.common.util.CorrelationIdUtil;
import com.orderflow.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentInitiatedConsumer {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.order.payment-initiated", groupId = "payment-service-group")
    public void handlePaymentInitiated(String message) {
        log.info("Received payment-initiated event in payment-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String correlationId = root.hasNonNull("correlationId") ? root.get("correlationId").asText() : null;
            CorrelationIdUtil.setCorrelationId(correlationId);

            UUID orderId = UUID.fromString(root.get("orderId").asText());
            UUID userId = UUID.fromString(root.get("userId").asText());
            BigDecimal amount = new BigDecimal(root.get("amount").asText());
            String currency = root.hasNonNull("currency") ? root.get("currency").asText() : "USD";
            String idempotencyKey = root.hasNonNull("idempotencyKey")
                    ? root.get("idempotencyKey").asText()
                    : "pay-" + userId + "-" + orderId;

            paymentService.processPayment(orderId, userId, amount, currency, idempotencyKey, correlationId);
        } catch (Exception e) {
            log.error("Failed to process payment-initiated event: {}", message, e);
        } finally {
            CorrelationIdUtil.clear();
        }
    }
}

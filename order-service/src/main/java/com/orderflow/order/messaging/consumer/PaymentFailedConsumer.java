package com.orderflow.order.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.common.util.CorrelationIdUtil;
import com.orderflow.order.saga.OrderSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentFailedConsumer {

    private final OrderSagaOrchestrator sagaOrchestrator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.payment.payment-failed", groupId = "order-service-group")
    public void handlePaymentFailed(String message) {
        log.info("Received payment-failed event in order-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String correlationId = root.hasNonNull("correlationId") ? root.get("correlationId").asText() : null;
            CorrelationIdUtil.setCorrelationId(correlationId);

            UUID orderId = UUID.fromString(root.get("orderId").asText());
            String reason = root.hasNonNull("reason") ? root.get("reason").asText() : "Payment rejected by processor";

            sagaOrchestrator.handlePaymentFailed(orderId, reason, correlationId);
        } catch (Exception e) {
            log.error("Failed to process payment-failed event: {}", message, e);
        } finally {
            CorrelationIdUtil.clear();
        }
    }
}

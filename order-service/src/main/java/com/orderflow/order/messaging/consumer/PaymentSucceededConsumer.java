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
public class PaymentSucceededConsumer {

    private final OrderSagaOrchestrator sagaOrchestrator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.payment.payment-succeeded", groupId = "order-service-group")
    public void handlePaymentSucceeded(String message) {
        log.info("Received payment-succeeded event in order-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String correlationId = root.hasNonNull("correlationId") ? root.get("correlationId").asText() : null;
            CorrelationIdUtil.setCorrelationId(correlationId);

            UUID orderId = UUID.fromString(root.get("orderId").asText());
            UUID paymentId = root.hasNonNull("paymentId") ? UUID.fromString(root.get("paymentId").asText()) : null;

            sagaOrchestrator.handlePaymentSucceeded(orderId, paymentId, correlationId);
        } catch (Exception e) {
            log.error("Failed to process payment-succeeded event: {}", message, e);
        } finally {
            CorrelationIdUtil.clear();
        }
    }
}

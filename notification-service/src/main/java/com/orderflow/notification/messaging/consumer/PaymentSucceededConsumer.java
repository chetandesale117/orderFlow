package com.orderflow.notification.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentSucceededConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.payment.payment-succeeded", groupId = "notification-service-group")
    public void handlePaymentSucceeded(String message) {
        log.info("Received payment-succeeded event in notification-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            UUID userId = UUID.fromString(root.get("userId").asText());
            UUID orderId = UUID.fromString(root.get("orderId").asText());
            String providerPaymentId = root.get("providerPaymentId").asText();
            String amount = root.get("amount").asText();

            Map<String, Object> vars = new HashMap<>();
            vars.put("orderId", orderId.toString());
            vars.put("providerPaymentId", providerPaymentId);
            vars.put("amount", amount);

            String recipientEmail = "customer-" + userId.toString().substring(0, 8) + "@orderflow.internal";

            notificationService.sendNotification(userId, recipientEmail, "payment-receipt",
                    "Payment receipt for transaction #" + providerPaymentId, vars);
        } catch (Exception e) {
            log.error("Failed to process payment-succeeded in notification: {}", message, e);
        }
    }
}

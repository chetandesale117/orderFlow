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
public class OrderConfirmedConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.order.order-confirmed", groupId = "notification-service-group")
    public void handleOrderConfirmed(String message) {
        log.info("Received order-confirmed event in notification-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            if (root.isTextual()) {
                root = objectMapper.readTree(root.asText());
            }
            UUID userId = UUID.fromString(root.get("userId").asText());
            String orderNumber = root.get("orderNumber").asText();
            String totalAmount = root.hasNonNull("totalAmount") ? root.get("totalAmount").asText() : "0.00";

            Map<String, Object> vars = new HashMap<>();
            vars.put("orderNumber", orderNumber);
            vars.put("totalAmount", totalAmount);

            // Default notification email target for demo/mailpit
            String recipientEmail = "customer-" + userId.toString().substring(0, 8) + "@orderflow.internal";

            notificationService.sendNotification(userId, recipientEmail, "order-confirmed",
                    "Your order #" + orderNumber + " is confirmed!", vars);
        } catch (Exception e) {
            log.error("Failed to process order-confirmed in notification: {}", message, e);
        }
    }
}

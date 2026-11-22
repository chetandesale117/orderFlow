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
public class OrderShippedConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.order.order-shipped", groupId = "notification-service-group")
    public void handleOrderShipped(String message) {
        log.info("Received order-shipped event in notification-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            if (root.isTextual()) {
                root = objectMapper.readTree(root.asText());
            }
            UUID userId = UUID.fromString(root.get("userId").asText());
            String orderNumber = root.get("orderNumber").asText();

            Map<String, Object> vars = new HashMap<>();
            vars.put("orderNumber", orderNumber);

            String recipientEmail = "customer-" + userId.toString().substring(0, 8) + "@orderflow.internal";

            notificationService.sendNotification(userId, recipientEmail, "order-shipped",
                    "Your order #" + orderNumber + " has shipped!", vars);
        } catch (Exception e) {
            log.error("Failed to process order-shipped in notification: {}", message, e);
        }
    }
}

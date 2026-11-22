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
public class OrderCancelledConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.order.order-cancelled", groupId = "notification-service-group")
    public void handleOrderCancelled(String message) {
        log.info("Received order-cancelled event in notification-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            UUID userId = UUID.fromString(root.get("userId").asText());
            String orderNumber = root.get("orderNumber").asText();
            String reason = root.hasNonNull("reason") ? root.get("reason").asText() : "Cancelled";

            Map<String, Object> vars = new HashMap<>();
            vars.put("orderNumber", orderNumber);
            vars.put("reason", reason);

            String recipientEmail = "customer-" + userId.toString().substring(0, 8) + "@orderflow.internal";

            notificationService.sendNotification(userId, recipientEmail, "order-cancelled",
                    "Order #" + orderNumber + " has been cancelled", vars);
        } catch (Exception e) {
            log.error("Failed to process order-cancelled in notification: {}", message, e);
        }
    }
}

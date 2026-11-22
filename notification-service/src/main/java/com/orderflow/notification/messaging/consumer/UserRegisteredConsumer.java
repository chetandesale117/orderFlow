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
public class UserRegisteredConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.auth.user-registered", groupId = "notification-service-group")
    public void handleUserRegistered(String message) {
        log.info("Received user-registered event in notification-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            UUID userId = UUID.fromString(root.get("userId").asText());
            String email = root.get("email").asText();
            String firstName = root.hasNonNull("firstName") ? root.get("firstName").asText() : "Customer";

            Map<String, Object> vars = new HashMap<>();
            vars.put("firstName", firstName);
            vars.put("email", email);

            notificationService.sendNotification(userId, email, "welcome", "Welcome to OrderFlow!", vars);
        } catch (Exception e) {
            log.error("Failed to process user-registered in notification: {}", message, e);
        }
    }
}

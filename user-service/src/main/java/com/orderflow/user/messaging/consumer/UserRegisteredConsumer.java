package com.orderflow.user.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.common.util.CorrelationIdUtil;
import com.orderflow.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisteredConsumer {

    private final UserService userService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.auth.user-registered", groupId = "user-service-group")
    public void handleUserRegistered(String message) {
        log.info("Received user-registered event in user-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            if (root.isTextual()) {
                root = objectMapper.readTree(root.asText());
            }
            String correlationId = root.has("correlationId") ? root.get("correlationId").asText() : null;
            CorrelationIdUtil.setCorrelationId(correlationId);

            UUID userId = UUID.fromString(root.get("userId").asText());
            String email = root.get("email").asText();
            String firstName = root.hasNonNull("firstName") ? root.get("firstName").asText() : "";
            String lastName = root.hasNonNull("lastName") ? root.get("lastName").asText() : "";

            userService.createSkeletonProfile(userId, email, firstName, lastName);
        } catch (Exception e) {
            log.error("Failed to process user-registered event: {}", message, e);
        } finally {
            CorrelationIdUtil.clear();
        }
    }
}

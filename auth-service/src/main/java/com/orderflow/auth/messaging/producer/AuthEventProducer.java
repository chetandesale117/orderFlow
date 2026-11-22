package com.orderflow.auth.messaging.producer;

import com.orderflow.auth.messaging.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthEventProducer {

    public static final String TOPIC_USER_REGISTERED = "orderflow.auth.user-registered";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegistered(UserRegisteredEvent event) {
        log.info("Publishing UserRegisteredEvent for userId: {} to topic: {}", event.getUserId(), TOPIC_USER_REGISTERED);
        kafkaTemplate.send(TOPIC_USER_REGISTERED, event.getUserId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Successfully published UserRegisteredEvent [offset: {}]",
                                result.getRecordMetadata().offset());
                    } else {
                        log.error("Failed to publish UserRegisteredEvent for userId: {}", event.getUserId(), ex);
                    }
                });
    }
}

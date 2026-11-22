package com.orderflow.inventory.messaging.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventProducer {

    public static final String TOPIC_STOCK_RESERVED = "orderflow.inventory.stock-reserved";
    public static final String TOPIC_STOCK_RESERVATION_FAILED = "orderflow.inventory.stock-reservation-failed";
    public static final String TOPIC_STOCK_RELEASED = "orderflow.inventory.stock-released";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(String topic, String key, Object payload) {
        log.info("Publishing event to topic [{}] with key [{}]", topic, key);
        kafkaTemplate.send(topic, key, payload);
    }
}

package com.orderflow.order.messaging.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    public static final String TOPIC_ORDER_CREATED = "orderflow.order.order-created";
    public static final String TOPIC_PAYMENT_INITIATED = "orderflow.order.payment-initiated";
    public static final String TOPIC_STOCK_RELEASE_REQUESTED = "orderflow.order.stock-release-requested";
    public static final String TOPIC_ORDER_CONFIRMED = "orderflow.order.order-confirmed";
    public static final String TOPIC_ORDER_CANCELLED = "orderflow.order.order-cancelled";
    public static final String TOPIC_ORDER_SHIPPED = "orderflow.order.order-shipped";
    public static final String TOPIC_ORDER_DELIVERED = "orderflow.order.order-delivered";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(String topic, String key, Object payload) {
        log.info("Publishing event to topic [{}] with key [{}]", topic, key);
        kafkaTemplate.send(topic, key, payload);
    }
}

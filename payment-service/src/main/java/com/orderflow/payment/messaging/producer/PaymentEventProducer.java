package com.orderflow.payment.messaging.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventProducer {

    public static final String TOPIC_PAYMENT_SUCCEEDED = "orderflow.payment.payment-succeeded";
    public static final String TOPIC_PAYMENT_FAILED = "orderflow.payment.payment-failed";
    public static final String TOPIC_REFUND_COMPLETED = "orderflow.payment.refund-completed";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(String topic, String key, Object payload) {
        log.info("Publishing event to topic [{}] with key [{}]", topic, key);
        kafkaTemplate.send(topic, key, payload);
    }
}

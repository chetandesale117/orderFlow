package com.orderflow.product.messaging.producer;

import com.orderflow.product.messaging.event.ProductCreatedEvent;
import com.orderflow.product.messaging.event.ProductUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductEventProducer {

    public static final String TOPIC_PRODUCT_CREATED = "orderflow.product.product-created";
    public static final String TOPIC_PRODUCT_UPDATED = "orderflow.product.product-updated";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishProductCreated(ProductCreatedEvent event) {
        log.info("Publishing ProductCreatedEvent for productId: {}", event.getProductId());
        kafkaTemplate.send(TOPIC_PRODUCT_CREATED, event.getProductId().toString(), event);
    }

    public void publishProductUpdated(ProductUpdatedEvent event) {
        log.info("Publishing ProductUpdatedEvent for productId: {}", event.getProductId());
        kafkaTemplate.send(TOPIC_PRODUCT_UPDATED, event.getProductId().toString(), event);
    }
}

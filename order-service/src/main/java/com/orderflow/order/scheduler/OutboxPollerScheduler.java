package com.orderflow.order.scheduler;

import com.orderflow.order.entity.OutboxEvent;
import com.orderflow.order.messaging.producer.OrderEventProducer;
import com.orderflow.order.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPollerScheduler {

    private final OutboxEventRepository outboxEventRepository;
    private final OrderEventProducer orderEventProducer;

    @Scheduled(fixedDelay = 500)
    @Transactional
    public void pollOutbox() {
        List<OutboxEvent> events = outboxEventRepository.findByPublishedFalseOrderByCreatedAtAsc(PageRequest.of(0, 50));
        if (events.isEmpty()) {
            return;
        }

        for (OutboxEvent event : events) {
            try {
                String topic = switch (event.getEventType()) {
                    case "OrderCreated" -> OrderEventProducer.TOPIC_ORDER_CREATED;
                    case "PaymentInitiated" -> OrderEventProducer.TOPIC_PAYMENT_INITIATED;
                    case "StockReleaseRequested" -> OrderEventProducer.TOPIC_STOCK_RELEASE_REQUESTED;
                    case "OrderConfirmed" -> OrderEventProducer.TOPIC_ORDER_CONFIRMED;
                    case "OrderCancelled" -> OrderEventProducer.TOPIC_ORDER_CANCELLED;
                    case "OrderShipped" -> OrderEventProducer.TOPIC_ORDER_SHIPPED;
                    case "OrderDelivered" -> OrderEventProducer.TOPIC_ORDER_DELIVERED;
                    default -> "orderflow.order.events";
                };

                orderEventProducer.publish(topic, event.getAggregateId().toString(), event.getPayload());
                event.setPublished(true);
                event.setPublishedAt(Instant.now());
                outboxEventRepository.save(event);
            } catch (Exception e) {
                log.error("Failed to publish outbox event {}: {}", event.getId(), e.getMessage());
                break;
            }
        }
    }
}

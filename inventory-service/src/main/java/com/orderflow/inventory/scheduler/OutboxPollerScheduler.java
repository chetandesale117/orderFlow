package com.orderflow.inventory.scheduler;

import com.orderflow.inventory.entity.OutboxEvent;
import com.orderflow.inventory.messaging.producer.InventoryEventProducer;
import com.orderflow.inventory.repository.OutboxEventRepository;
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
    private final InventoryEventProducer inventoryEventProducer;

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
                    case "StockReserved" -> InventoryEventProducer.TOPIC_STOCK_RESERVED;
                    case "StockReservationFailed" -> InventoryEventProducer.TOPIC_STOCK_RESERVATION_FAILED;
                    case "StockReleased" -> InventoryEventProducer.TOPIC_STOCK_RELEASED;
                    default -> "orderflow.inventory.events";
                };

                inventoryEventProducer.publish(topic, event.getAggregateId().toString(), event.getPayload());
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

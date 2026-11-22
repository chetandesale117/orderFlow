package com.orderflow.payment.scheduler;

import com.orderflow.payment.entity.OutboxEvent;
import com.orderflow.payment.messaging.producer.PaymentEventProducer;
import com.orderflow.payment.repository.OutboxEventRepository;
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
    private final PaymentEventProducer paymentEventProducer;

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
                    case "PaymentSucceeded" -> PaymentEventProducer.TOPIC_PAYMENT_SUCCEEDED;
                    case "PaymentFailed" -> PaymentEventProducer.TOPIC_PAYMENT_FAILED;
                    case "RefundCompleted" -> PaymentEventProducer.TOPIC_REFUND_COMPLETED;
                    default -> "orderflow.payment.events";
                };

                paymentEventProducer.publish(topic, event.getAggregateId().toString(), event.getPayload());
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

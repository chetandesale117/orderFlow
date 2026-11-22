package com.orderflow.order.saga;

import com.orderflow.order.entity.SagaInstance;
import com.orderflow.order.enums.SagaStatus;
import com.orderflow.order.repository.SagaInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SagaTimeoutScheduler {

    private final SagaInstanceRepository sagaInstanceRepository;
    private final OrderSagaOrchestrator sagaOrchestrator;

    @Scheduled(fixedDelay = 30000) // check every 30 seconds
    public void checkForTimedOutSagas() {
        List<SagaInstance> timedOut = sagaInstanceRepository.findByStatusAndTimeoutAtBefore(
                SagaStatus.PAYMENT_PROCESSING, Instant.now());

        for (SagaInstance saga : timedOut) {
            UUID orderId = saga.getOrder().getId();
            log.warn("Saga {} for order {} timed out in PAYMENT_PROCESSING. Initiating compensation.", saga.getId(), orderId);
            try {
                sagaOrchestrator.handlePaymentFailed(orderId, "Payment processing timed out (exceeded 5 mins)", UUID.randomUUID().toString());
            } catch (Exception e) {
                log.error("Failed to handle timeout for saga {}: {}", saga.getId(), e.getMessage());
            }
        }
    }
}

package com.orderflow.order.saga;

import com.orderflow.common.util.JsonUtil;
import com.orderflow.order.entity.Order;
import com.orderflow.order.entity.OutboxEvent;
import com.orderflow.order.entity.SagaInstance;
import com.orderflow.order.entity.SagaStep;
import com.orderflow.order.enums.OrderStatus;
import com.orderflow.order.enums.SagaStatus;
import com.orderflow.order.enums.SagaStepStatus;
import com.orderflow.order.messaging.event.*;
import com.orderflow.order.repository.OrderRepository;
import com.orderflow.order.repository.OutboxEventRepository;
import com.orderflow.order.repository.SagaInstanceRepository;
import com.orderflow.order.repository.SagaStepRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderSagaOrchestrator {

    private final OrderRepository orderRepository;
    private final SagaInstanceRepository sagaInstanceRepository;
    private final SagaStepRepository sagaStepRepository;
    private final OutboxEventRepository outboxEventRepository;

    @Transactional
    public void startOrderSaga(Order order, String correlationId) {
        log.info("[{}] Starting Order Saga for order: {}", correlationId, order.getId());

        SagaInstance saga = SagaInstance.builder()
                .order(order)
                .sagaType("ORDER_CREATION")
                .currentStep("STOCK_RESERVATION")
                .status(SagaStatus.STOCK_RESERVING)
                .timeoutAt(Instant.now().plus(5, ChronoUnit.MINUTES))
                .build();
        saga = sagaInstanceRepository.save(saga);

        SagaStep stockStep = SagaStep.builder()
                .saga(saga)
                .stepName("STOCK_RESERVATION")
                .status(SagaStepStatus.IN_PROGRESS)
                .startedAt(Instant.now())
                .build();
        sagaStepRepository.save(stockStep);

        // Publish OrderCreatedEvent via Outbox
        List<OrderCreatedEvent.ItemDto> items = order.getItems().stream()
                .map(item -> OrderCreatedEvent.ItemDto.builder()
                        .productId(item.getProductId())
                        .sku(item.getSku())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .orderNumber(order.getOrderNumber())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .build();
        event.initDefaults("OrderCreated", order.getId().toString(), "Order", "order-service", correlationId);

        saveOutbox("Order", order.getId(), "OrderCreated", event, correlationId);
    }

    @Transactional
    public void handleStockReserved(UUID orderId, String correlationId) {
        log.info("[{}] Saga: Stock reserved for order: {}", correlationId, orderId);

        Optional<SagaInstance> sagaOpt = sagaInstanceRepository.findByOrderId(orderId);
        if (sagaOpt.isEmpty()) {
            log.warn("No Saga found for order: {}", orderId);
            return;
        }

        SagaInstance saga = sagaOpt.get();
        if (saga.getStatus() != SagaStatus.STOCK_RESERVING) {
            log.warn("Saga {} not in STOCK_RESERVING state (current: {})", saga.getId(), saga.getStatus());
            return;
        }

        // Update Stock reservation step to COMPLETED
        sagaStepRepository.findBySagaIdAndStepName(saga.getId(), "STOCK_RESERVATION")
                .ifPresent(step -> {
                    step.setStatus(SagaStepStatus.COMPLETED);
                    step.setCompletedAt(Instant.now());
                    sagaStepRepository.save(step);
                });

        Order order = saga.getOrder();
        order.setStatus(OrderStatus.INVENTORY_RESERVED);
        orderRepository.save(order);

        // Advance Saga to PAYMENT_PROCESSING
        saga.setCurrentStep("PAYMENT_PROCESSING");
        saga.setStatus(SagaStatus.PAYMENT_PROCESSING);
        saga.setTimeoutAt(Instant.now().plus(5, ChronoUnit.MINUTES));
        sagaInstanceRepository.save(saga);

        SagaStep paymentStep = SagaStep.builder()
                .saga(saga)
                .stepName("PAYMENT_PROCESSING")
                .status(SagaStepStatus.IN_PROGRESS)
                .startedAt(Instant.now())
                .build();
        sagaStepRepository.save(paymentStep);

        // Publish PaymentInitiatedEvent via Outbox
        String idempotencyKey = "pay-" + order.getUserId() + "-" + order.getId();
        PaymentInitiatedEvent event = PaymentInitiatedEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .amount(order.getTotalAmount())
                .currency("USD")
                .idempotencyKey(idempotencyKey)
                .build();
        event.initDefaults("PaymentInitiated", order.getId().toString(), "Order", "order-service", correlationId);

        saveOutbox("Order", order.getId(), "PaymentInitiated", event, correlationId);
    }

    @Transactional
    public void handleStockReservationFailed(UUID orderId, String reason, String correlationId) {
        log.warn("[{}] Saga: Stock reservation failed for order: {}. Reason: {}", correlationId, orderId, reason);

        Optional<SagaInstance> sagaOpt = sagaInstanceRepository.findByOrderId(orderId);
        if (sagaOpt.isEmpty()) return;

        SagaInstance saga = sagaOpt.get();
        saga.setStatus(SagaStatus.FAILED);
        saga.setCurrentStep("FAILED");
        sagaInstanceRepository.save(saga);

        sagaStepRepository.findBySagaIdAndStepName(saga.getId(), "STOCK_RESERVATION")
                .ifPresent(step -> {
                    step.setStatus(SagaStepStatus.FAILED);
                    step.setErrorMessage(reason);
                    step.setCompletedAt(Instant.now());
                    sagaStepRepository.save(step);
                });

        Order order = saga.getOrder();
        order.setStatus(OrderStatus.FAILED);
        order.setCancelledReason("Stock reservation failed: " + reason);
        orderRepository.save(order);

        OrderCancelledEvent event = OrderCancelledEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .orderNumber(order.getOrderNumber())
                .reason(reason)
                .build();
        event.initDefaults("OrderCancelled", order.getId().toString(), "Order", "order-service", correlationId);

        saveOutbox("Order", order.getId(), "OrderCancelled", event, correlationId);
    }

    @Transactional
    public void handlePaymentSucceeded(UUID orderId, UUID paymentId, String correlationId) {
        log.info("[{}] Saga: Payment succeeded for order: {}. PaymentId: {}", correlationId, orderId, paymentId);

        Optional<SagaInstance> sagaOpt = sagaInstanceRepository.findByOrderId(orderId);
        if (sagaOpt.isEmpty()) return;

        SagaInstance saga = sagaOpt.get();
        if (saga.getStatus() != SagaStatus.PAYMENT_PROCESSING) {
            log.warn("Saga {} not in PAYMENT_PROCESSING state (current: {})", saga.getId(), saga.getStatus());
            return;
        }

        sagaStepRepository.findBySagaIdAndStepName(saga.getId(), "PAYMENT_PROCESSING")
                .ifPresent(step -> {
                    step.setStatus(SagaStepStatus.COMPLETED);
                    step.setCompletedAt(Instant.now());
                    sagaStepRepository.save(step);
                });

        saga.setStatus(SagaStatus.COMPLETED);
        saga.setCurrentStep("COMPLETED");
        sagaInstanceRepository.save(saga);

        Order order = saga.getOrder();
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        OrderConfirmedEvent event = OrderConfirmedEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .build();
        event.initDefaults("OrderConfirmed", order.getId().toString(), "Order", "order-service", correlationId);

        saveOutbox("Order", order.getId(), "OrderConfirmed", event, correlationId);
    }

    @Transactional
    public void handlePaymentFailed(UUID orderId, String reason, String correlationId) {
        log.warn("[{}] Saga: Payment failed for order: {}. Reason: {}. Starting COMPENSATION", correlationId, orderId, reason);

        Optional<SagaInstance> sagaOpt = sagaInstanceRepository.findByOrderId(orderId);
        if (sagaOpt.isEmpty()) return;

        SagaInstance saga = sagaOpt.get();
        sagaStepRepository.findBySagaIdAndStepName(saga.getId(), "PAYMENT_PROCESSING")
                .ifPresent(step -> {
                    step.setStatus(SagaStepStatus.FAILED);
                    step.setErrorMessage(reason);
                    step.setCompletedAt(Instant.now());
                    sagaStepRepository.save(step);
                });

        // Transition to COMPENSATING
        saga.setStatus(SagaStatus.COMPENSATING);
        saga.setCurrentStep("STOCK_RELEASING");
        sagaInstanceRepository.save(saga);

        SagaStep compensationStep = SagaStep.builder()
                .saga(saga)
                .stepName("STOCK_RELEASING")
                .status(SagaStepStatus.IN_PROGRESS)
                .startedAt(Instant.now())
                .build();
        sagaStepRepository.save(compensationStep);

        // Publish StockReleaseRequested via Outbox
        StockReleaseRequestedEvent event = StockReleaseRequestedEvent.builder()
                .orderId(orderId)
                .reason("Payment failure: " + reason)
                .build();
        event.initDefaults("StockReleaseRequested", orderId.toString(), "Order", "order-service", correlationId);

        saveOutbox("Order", orderId, "StockReleaseRequested", event, correlationId);
    }

    @Transactional
    public void handleStockReleased(UUID orderId, String correlationId) {
        log.info("[{}] Saga: Compensation complete. Stock released for order: {}", correlationId, orderId);

        Optional<SagaInstance> sagaOpt = sagaInstanceRepository.findByOrderId(orderId);
        if (sagaOpt.isEmpty()) return;

        SagaInstance saga = sagaOpt.get();
        sagaStepRepository.findBySagaIdAndStepName(saga.getId(), "STOCK_RELEASING")
                .ifPresent(step -> {
                    step.setStatus(SagaStepStatus.COMPENSATED);
                    step.setCompletedAt(Instant.now());
                    sagaStepRepository.save(step);
                });

        saga.setStatus(SagaStatus.FAILED);
        saga.setCurrentStep("COMPENSATION_COMPLETED");
        sagaInstanceRepository.save(saga);

        Order order = saga.getOrder();
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);

        OrderCancelledEvent event = OrderCancelledEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .orderNumber(order.getOrderNumber())
                .reason(order.getCancelledReason() != null ? order.getCancelledReason() : "Payment failure and stock released")
                .build();
        event.initDefaults("OrderCancelled", order.getId().toString(), "Order", "order-service", correlationId);

        saveOutbox("Order", order.getId(), "OrderCancelled", event, correlationId);
    }

    private void saveOutbox(String aggregateType, UUID aggregateId, String eventType, Object event, String correlationId) {
        OutboxEvent outbox = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(JsonUtil.toJson(event))
                .correlationId(correlationId)
                .published(false)
                .build();
        outboxEventRepository.save(outbox);
    }
}

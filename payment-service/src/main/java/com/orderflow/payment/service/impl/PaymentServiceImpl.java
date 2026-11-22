package com.orderflow.payment.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.BadRequestException;
import com.orderflow.common.exception.ConflictException;
import com.orderflow.common.exception.ForbiddenException;
import com.orderflow.common.exception.ResourceNotFoundException;
import com.orderflow.common.util.JsonUtil;
import com.orderflow.payment.dto.request.RefundRequest;
import com.orderflow.payment.dto.response.PaymentResponse;
import com.orderflow.payment.dto.response.RefundResponse;
import com.orderflow.payment.entity.OutboxEvent;
import com.orderflow.payment.entity.Payment;
import com.orderflow.payment.entity.PaymentEvent;
import com.orderflow.payment.entity.Refund;
import com.orderflow.payment.enums.PaymentStatus;
import com.orderflow.payment.enums.RefundStatus;
import com.orderflow.payment.messaging.event.PaymentFailedEvent;
import com.orderflow.payment.messaging.event.PaymentSucceededEvent;
import com.orderflow.payment.messaging.event.RefundCompletedEvent;
import com.orderflow.payment.provider.PaymentProvider;
import com.orderflow.payment.repository.OutboxEventRepository;
import com.orderflow.payment.repository.PaymentEventRepository;
import com.orderflow.payment.repository.PaymentRepository;
import com.orderflow.payment.repository.RefundRepository;
import com.orderflow.payment.security.WebhookSignatureValidator;
import com.orderflow.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final RefundRepository refundRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final PaymentProvider paymentProvider;
    private final WebhookSignatureValidator webhookSignatureValidator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void processPayment(UUID orderId, UUID userId, BigDecimal amount, String currency, String idempotencyKey, String correlationId) {
        log.info("[{}] Initiating payment processing for orderId: {}, amount: {} {}", correlationId, orderId, amount, currency);

        // 1. Idempotency check
        Optional<Payment> existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            log.info("Payment already processed for idempotency key: {}", idempotencyKey);
            return;
        }

        Payment payment = Payment.builder()
                .orderId(orderId)
                .userId(userId)
                .idempotencyKey(idempotencyKey)
                .amount(amount)
                .currency(currency != null ? currency : "USD")
                .status(PaymentStatus.PROCESSING)
                .provider("SANDBOX")
                .build();
        payment = paymentRepository.save(payment);

        // 2. Call provider
        PaymentProvider.PaymentResult result = paymentProvider.charge(orderId, userId, amount, currency, idempotencyKey);

        if (result.isSuccess()) {
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setProviderPaymentId(result.getProviderPaymentId());
            payment.setProviderResponse(result.getRawResponse());
            payment.setPaidAt(Instant.now());
            paymentRepository.save(payment);

            PaymentSucceededEvent succeededEvent = PaymentSucceededEvent.builder()
                    .paymentId(payment.getId())
                    .orderId(orderId)
                    .userId(userId)
                    .amount(amount)
                    .providerPaymentId(result.getProviderPaymentId())
                    .build();
            succeededEvent.initDefaults("PaymentSucceeded", orderId.toString(), "Payment", "payment-service", correlationId);

            saveOutbox("Payment", payment.getId(), "PaymentSucceeded", succeededEvent, correlationId);
            log.info("[{}] Payment succeeded for order: {}", correlationId, orderId);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setProviderPaymentId(result.getProviderPaymentId());
            payment.setProviderResponse(result.getRawResponse());
            payment.setFailureReason(result.getErrorMessage());
            paymentRepository.save(payment);

            PaymentFailedEvent failedEvent = PaymentFailedEvent.builder()
                    .paymentId(payment.getId())
                    .orderId(orderId)
                    .userId(userId)
                    .amount(amount)
                    .reason(result.getErrorMessage())
                    .build();
            failedEvent.initDefaults("PaymentFailed", orderId.toString(), "Payment", "payment-service", correlationId);

            saveOutbox("Payment", payment.getId(), "PaymentFailed", failedEvent, correlationId);
            log.warn("[{}] Payment failed for order: {}. Reason: {}", correlationId, orderId, result.getErrorMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(UUID orderId, UUID userId, boolean isAdmin) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));

        if (!isAdmin && !payment.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied: You cannot view payment details for this order");
        }

        return toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public RefundResponse processRefund(UUID paymentId, RefundRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if (payment.getStatus() != PaymentStatus.SUCCEEDED) {
            throw new BadRequestException("Cannot refund payment in status: " + payment.getStatus());
        }

        if (refundRepository.findByIdempotencyKey(request.getIdempotencyKey()).isPresent()) {
            throw new ConflictException("Refund with idempotency key already processed: " + request.getIdempotencyKey());
        }

        PaymentProvider.RefundResult result = paymentProvider.refund(
                payment.getProviderPaymentId(), request.getAmount(), request.getIdempotencyKey());

        Refund refund = Refund.builder()
                .payment(payment)
                .idempotencyKey(request.getIdempotencyKey())
                .amount(request.getAmount())
                .reason(request.getReason())
                .status(result.isSuccess() ? RefundStatus.COMPLETED : RefundStatus.FAILED)
                .providerRefundId(result.getProviderRefundId())
                .build();
        refund = refundRepository.save(refund);

        if (result.isSuccess()) {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            RefundCompletedEvent event = RefundCompletedEvent.builder()
                    .refundId(refund.getId())
                    .paymentId(payment.getId())
                    .orderId(payment.getOrderId())
                    .userId(payment.getUserId())
                    .amount(request.getAmount())
                    .reason(request.getReason())
                    .build();
            event.initDefaults("RefundCompleted", refund.getId().toString(), "Refund", "payment-service", UUID.randomUUID().toString());

            saveOutbox("Refund", refund.getId(), "RefundCompleted", event, UUID.randomUUID().toString());
            log.info("Processed refund for payment: {}, amount: {}", paymentId, request.getAmount());
        }

        return toRefundResponse(refund);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getAllPayments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Payment> paymentPage = paymentRepository.findAll(pageable);

        List<PaymentResponse> content = paymentPage.getContent().stream()
                .map(this::toPaymentResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, paymentPage.getTotalElements());
    }

    @Override
    @Transactional
    public void handleWebhook(String payload, String signature) {
        log.info("Received payment webhook callback");
        boolean verified = webhookSignatureValidator.isValidSignature(payload, signature);

        if (!verified) {
            log.warn("Invalid webhook signature received");
            throw new BadRequestException("Invalid webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String paymentIdStr = root.hasNonNull("paymentId") ? root.get("paymentId").asText() : null;
            if (paymentIdStr != null) {
                UUID paymentId = UUID.fromString(paymentIdStr);
                paymentRepository.findById(paymentId).ifPresent(payment -> {
                    PaymentEvent event = PaymentEvent.builder()
                            .payment(payment)
                            .eventType(root.hasNonNull("eventType") ? root.get("eventType").asText() : "WEBHOOK")
                            .eventData(payload)
                            .webhookSignature(signature)
                            .webhookVerified(true)
                            .build();
                    paymentEventRepository.save(event);
                });
            }
        } catch (Exception e) {
            log.error("Failed to parse webhook JSON payload: {}", e.getMessage());
            throw new BadRequestException("Invalid JSON payload");
        }
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

    private PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .idempotencyKey(payment.getIdempotencyKey())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .provider(payment.getProvider())
                .providerPaymentId(payment.getProviderPaymentId())
                .failureReason(payment.getFailureReason())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    private RefundResponse toRefundResponse(Refund refund) {
        return RefundResponse.builder()
                .id(refund.getId())
                .paymentId(refund.getPayment().getId())
                .idempotencyKey(refund.getIdempotencyKey())
                .amount(refund.getAmount())
                .reason(refund.getReason())
                .status(refund.getStatus())
                .providerRefundId(refund.getProviderRefundId())
                .createdAt(refund.getCreatedAt())
                .updatedAt(refund.getUpdatedAt())
                .build();
    }
}

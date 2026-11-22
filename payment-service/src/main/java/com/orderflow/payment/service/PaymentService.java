package com.orderflow.payment.service;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.payment.dto.request.RefundRequest;
import com.orderflow.payment.dto.response.PaymentResponse;
import com.orderflow.payment.dto.response.RefundResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentService {
    void processPayment(UUID orderId, UUID userId, BigDecimal amount, String currency, String idempotencyKey, String correlationId);
    PaymentResponse getPaymentByOrderId(UUID orderId, UUID userId, boolean isAdmin);
    RefundResponse processRefund(UUID paymentId, RefundRequest request);
    PageResponse<PaymentResponse> getAllPayments(int page, int size);
    void handleWebhook(String payload, String signature);
}

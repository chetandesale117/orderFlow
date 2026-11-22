package com.orderflow.payment.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.UnauthorizedException;
import com.orderflow.payment.dto.request.RefundRequest;
import com.orderflow.payment.dto.response.PaymentResponse;
import com.orderflow.payment.dto.response.RefundResponse;
import com.orderflow.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Payment tracking and administrative refund operations")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/payments/order/{orderId}")
    @Operation(summary = "Get payment details for an order")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Role", required = false) String userRoleHeader,
            @PathVariable UUID orderId) {
        UUID userId = validateAndExtractUserId(userIdHeader);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userRoleHeader);
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/admin/payments/{id}/refund")
    @Operation(summary = "Admin: Issue refund for payment")
    public ResponseEntity<ApiResponse<RefundResponse>> refundPayment(
            @PathVariable UUID id,
            @Valid @RequestBody RefundRequest request) {
        RefundResponse response = paymentService.processRefund(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Refund processed successfully", response));
    }

    @GetMapping("/admin/payments")
    @Operation(summary = "Admin: List all payments (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<PaymentResponse> response = paymentService.getAllPayments(page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private UUID validateAndExtractUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            throw new UnauthorizedException("Missing authentication context");
        }
        try {
            return UUID.fromString(userIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid user ID in authentication context");
        }
    }
}

package com.orderflow.payment.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Webhook", description = "Inbound webhook callbacks from payment processors")
public class WebhookController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    @Operation(summary = "Handle payment provider webhook callback (HMAC verified)")
    public ResponseEntity<ApiResponse<Void>> handleWebhook(
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature,
            @RequestBody String payload) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok(ApiResponse.ok("Webhook processed successfully"));
    }
}

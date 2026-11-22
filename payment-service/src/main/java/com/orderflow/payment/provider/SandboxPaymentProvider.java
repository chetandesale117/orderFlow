package com.orderflow.payment.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Component
public class SandboxPaymentProvider implements PaymentProvider {

    @Value("${payment.sandbox.success-rate-percentage:80}")
    private int successRatePercentage;

    private final Random random = new Random();

    @Override
    public PaymentResult charge(UUID orderId, UUID userId, BigDecimal amount, String currency, String idempotencyKey) {
        log.info("Processing sandbox charge for orderId: {}, amount: {} {}", orderId, amount, currency);

        int roll = random.nextInt(100);
        boolean success = roll < successRatePercentage;

        String providerPaymentId = "sbx_txn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        if (success) {
            log.info("Sandbox charge SUCCEEDED for order: {}. Provider txn: {}", orderId, providerPaymentId);
            return PaymentResult.builder()
                    .success(true)
                    .providerPaymentId(providerPaymentId)
                    .rawResponse("{\"status\":\"approved\",\"auth_code\":\"SANDBOX_OK\",\"providerId\":\"" + providerPaymentId + "\"}")
                    .build();
        } else {
            log.warn("Sandbox charge DECLINED for order: {}. Roll: {}, SuccessThreshold: {}", orderId, roll, successRatePercentage);
            return PaymentResult.builder()
                    .success(false)
                    .providerPaymentId(providerPaymentId)
                    .rawResponse("{\"status\":\"declined\",\"decline_code\":\"insufficient_funds\"}")
                    .errorMessage("Payment declined by issuer: Insufficient funds in sandbox account")
                    .build();
        }
    }

    @Override
    public RefundResult refund(String providerPaymentId, BigDecimal amount, String idempotencyKey) {
        log.info("Processing sandbox refund for provider txn: {}, amount: {}", providerPaymentId, amount);
        String providerRefundId = "sbx_ref_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        return RefundResult.builder()
                .success(true)
                .providerRefundId(providerRefundId)
                .rawResponse("{\"status\":\"refunded\",\"providerRefundId\":\"" + providerRefundId + "\"}")
                .build();
    }
}

package com.orderflow.order.messaging.event;

import com.orderflow.common.event.BaseEvent;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PaymentInitiatedEvent extends BaseEvent {

    private UUID orderId;
    private UUID userId;
    private BigDecimal amount;
    private String currency;
    private String idempotencyKey;
}

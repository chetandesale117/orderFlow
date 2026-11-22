package com.orderflow.product.messaging.event;

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
public class ProductCreatedEvent extends BaseEvent {

    private UUID productId;
    private String sku;
    private String name;
    private BigDecimal price;
}

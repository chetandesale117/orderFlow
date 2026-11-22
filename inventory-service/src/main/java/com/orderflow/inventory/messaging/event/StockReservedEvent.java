package com.orderflow.inventory.messaging.event;

import com.orderflow.common.event.BaseEvent;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class StockReservedEvent extends BaseEvent {

    private UUID orderId;
    private List<ItemReservation> reservations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemReservation {
        private UUID productId;
        private UUID reservationId;
        private int quantity;
    }
}

package com.orderflow.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAvailabilityResponse {
    private UUID productId;
    private String sku;
    private int availableQuantity;
    private int totalQuantity;
    private int reservedQuantity;
    private boolean inStock;
}

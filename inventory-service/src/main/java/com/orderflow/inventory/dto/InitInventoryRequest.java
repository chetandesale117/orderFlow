package com.orderflow.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitInventoryRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "Initial quantity is required")
    @Min(value = 0, message = "Initial quantity cannot be negative")
    @Builder.Default
    private Integer initialQuantity = 0;
}

package com.orderflow.product.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String slug;

    private String description;

    @Size(max = 500)
    private String shortDescription;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private BigDecimal compareAtPrice;

    @NotBlank(message = "SKU is required")
    @Size(max = 50)
    private String sku;

    @Size(max = 500)
    private String imageUrl;

    @Builder.Default
    private Boolean isActive = true;

    private BigDecimal weight;

    @Size(max = 100)
    private String brand;

    private Set<UUID> categoryIds;
}

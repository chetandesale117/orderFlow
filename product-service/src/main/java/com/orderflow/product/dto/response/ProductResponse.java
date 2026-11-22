package com.orderflow.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private String sku;
    private String imageUrl;
    private Boolean isActive;
    private BigDecimal weight;
    private String brand;
    private Set<CategoryResponse> categories;
    private Instant createdAt;
    private Instant updatedAt;
}

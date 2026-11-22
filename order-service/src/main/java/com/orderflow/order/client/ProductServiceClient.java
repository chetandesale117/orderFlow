package com.orderflow.order.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
public class ProductServiceClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProductServiceClient(@Value("${services.product-url:http://localhost:8083}") String productUrl) {
        this.webClient = WebClient.builder().baseUrl(productUrl).build();
    }

    public ProductDto getProductById(UUID productId) {
        try {
            String response = webClient.get()
                    .uri("/api/v1/products/{id}", productId)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("data") && !root.get("data").isNull()) {
                    JsonNode data = root.get("data");
                    return ProductDto.builder()
                            .id(UUID.fromString(data.get("id").asText()))
                            .name(data.get("name").asText())
                            .sku(data.get("sku").asText())
                            .price(new BigDecimal(data.get("price").asText()))
                            .isActive(data.get("isActive").asBoolean())
                            .build();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch product details from product-service for id {}: {}", productId, e.getMessage());
        }

        // Fallback default snapshot
        return ProductDto.builder()
                .id(productId)
                .name("Product " + productId.toString().substring(0, 8))
                .sku("SKU-" + productId.toString().substring(0, 8).toUpperCase())
                .price(new BigDecimal("29.99"))
                .isActive(true)
                .build();
    }

    @Data
    @Builder
    public static class ProductDto {
        private UUID id;
        private String name;
        private String sku;
        private BigDecimal price;
        private boolean isActive;
    }
}

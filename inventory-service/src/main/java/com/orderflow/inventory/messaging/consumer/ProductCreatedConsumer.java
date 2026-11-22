package com.orderflow.inventory.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.inventory.dto.InitInventoryRequest;
import com.orderflow.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductCreatedConsumer {

    private final InventoryService inventoryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.product.product-created", groupId = "inventory-service-group")
    public void handleProductCreated(String message) {
        log.info("Received product created event in inventory-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            UUID productId = UUID.fromString(root.get("productId").asText());
            String sku = root.get("sku").asText();

            inventoryService.initInventory(InitInventoryRequest.builder()
                    .productId(productId)
                    .sku(sku)
                    .initialQuantity(0)
                    .build());
        } catch (Exception e) {
            log.info("Handled product created initialization: {}", e.getMessage());
        }
    }
}

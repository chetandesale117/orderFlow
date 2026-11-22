package com.orderflow.inventory.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.common.util.CorrelationIdUtil;
import com.orderflow.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockReleaseConsumer {

    private final InventoryService inventoryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = {
            "orderflow.order.stock-release-requested",
            "orderflow.order.order-cancelled"
    }, groupId = "inventory-service-group")
    public void handleStockRelease(String message) {
        log.info("Received stock release request in inventory-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            if (root.isTextual()) {
                root = objectMapper.readTree(root.asText());
            }
            String correlationId = root.hasNonNull("correlationId") ? root.get("correlationId").asText() : null;
            CorrelationIdUtil.setCorrelationId(correlationId);

            UUID orderId = UUID.fromString(root.get("orderId").asText());
            inventoryService.releaseStock(orderId, correlationId);
        } catch (Exception e) {
            log.error("Failed to process stock release event: {}", message, e);
        } finally {
            CorrelationIdUtil.clear();
        }
    }

    @KafkaListener(topics = "orderflow.order.order-confirmed", groupId = "inventory-service-group")
    public void handleOrderConfirmed(String message) {
        log.info("Received order confirmed event in inventory-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            UUID orderId = UUID.fromString(root.get("orderId").asText());
            inventoryService.confirmStock(orderId);
        } catch (Exception e) {
            log.error("Failed to process order confirmed event in inventory: {}", message, e);
        }
    }
}

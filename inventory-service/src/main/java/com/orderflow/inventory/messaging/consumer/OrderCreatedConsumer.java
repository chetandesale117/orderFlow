package com.orderflow.inventory.messaging.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.common.util.CorrelationIdUtil;
import com.orderflow.inventory.dto.OrderItemDto;
import com.orderflow.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCreatedConsumer {

    private final InventoryService inventoryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "orderflow.order.order-created", groupId = "inventory-service-group")
    public void handleOrderCreated(String message) {
        log.info("Received order-created event in inventory-service: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String correlationId = root.hasNonNull("correlationId") ? root.get("correlationId").asText() : null;
            CorrelationIdUtil.setCorrelationId(correlationId);

            UUID orderId = UUID.fromString(root.get("orderId").asText());
            List<OrderItemDto> items = new ArrayList<>();

            if (root.has("items") && root.get("items").isArray()) {
                for (JsonNode itemNode : root.get("items")) {
                    items.add(OrderItemDto.builder()
                            .productId(UUID.fromString(itemNode.get("productId").asText()))
                            .sku(itemNode.hasNonNull("sku") ? itemNode.get("sku").asText() : "")
                            .quantity(itemNode.get("quantity").asInt())
                            .build());
                }
            }

            inventoryService.reserveStock(orderId, items, correlationId);
        } catch (Exception e) {
            log.error("Failed to process order-created event in inventory: {}", message, e);
        } finally {
            CorrelationIdUtil.clear();
        }
    }
}

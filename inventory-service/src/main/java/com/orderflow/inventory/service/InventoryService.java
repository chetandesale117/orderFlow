package com.orderflow.inventory.service;

import com.orderflow.inventory.dto.InitInventoryRequest;
import com.orderflow.inventory.dto.OrderItemDto;
import com.orderflow.inventory.dto.StockAvailabilityResponse;
import com.orderflow.inventory.dto.UpdateStockRequest;

import java.util.List;
import java.util.UUID;

public interface InventoryService {
    StockAvailabilityResponse getStockAvailability(UUID productId);
    List<StockAvailabilityResponse> getBatchAvailability(List<UUID> productIds);
    StockAvailabilityResponse updateStock(UUID productId, UpdateStockRequest request);
    StockAvailabilityResponse initInventory(InitInventoryRequest request);
    void reserveStock(UUID orderId, List<OrderItemDto> items, String correlationId);
    void releaseStock(UUID orderId, String correlationId);
    void confirmStock(UUID orderId);
}

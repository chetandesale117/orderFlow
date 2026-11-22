package com.orderflow.inventory.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.inventory.dto.InitInventoryRequest;
import com.orderflow.inventory.dto.StockAvailabilityResponse;
import com.orderflow.inventory.dto.UpdateStockRequest;
import com.orderflow.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Inventory Management", description = "Stock availability check and administration")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/inventory/{productId}")
    @Operation(summary = "Check stock availability for a product")
    public ResponseEntity<ApiResponse<StockAvailabilityResponse>> getStock(@PathVariable UUID productId) {
        StockAvailabilityResponse response = inventoryService.getStockAvailability(productId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/inventory/batch")
    @Operation(summary = "Batch check stock availability for multiple products")
    public ResponseEntity<ApiResponse<List<StockAvailabilityResponse>>> getBatchStock(
            @RequestParam List<UUID> productIds) {
        List<StockAvailabilityResponse> response = inventoryService.getBatchAvailability(productIds);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/admin/inventory/{productId}")
    @Operation(summary = "Admin: Update total stock quantity for a product")
    public ResponseEntity<ApiResponse<StockAvailabilityResponse>> updateStock(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateStockRequest request) {
        StockAvailabilityResponse response = inventoryService.updateStock(productId, request);
        return ResponseEntity.ok(ApiResponse.ok("Stock updated successfully", response));
    }

    @PostMapping("/admin/inventory")
    @Operation(summary = "Admin: Initialize inventory for a new product")
    public ResponseEntity<ApiResponse<StockAvailabilityResponse>> initInventory(
            @Valid @RequestBody InitInventoryRequest request) {
        StockAvailabilityResponse response = inventoryService.initInventory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Inventory initialized successfully", response));
    }
}

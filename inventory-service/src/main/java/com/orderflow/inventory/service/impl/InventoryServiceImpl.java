package com.orderflow.inventory.service.impl;

import com.orderflow.common.exception.BadRequestException;
import com.orderflow.common.exception.ConflictException;
import com.orderflow.common.exception.ResourceNotFoundException;
import com.orderflow.common.util.JsonUtil;
import com.orderflow.inventory.dto.InitInventoryRequest;
import com.orderflow.inventory.dto.OrderItemDto;
import com.orderflow.inventory.dto.StockAvailabilityResponse;
import com.orderflow.inventory.dto.UpdateStockRequest;
import com.orderflow.inventory.entity.Inventory;
import com.orderflow.inventory.entity.OutboxEvent;
import com.orderflow.inventory.entity.StockReservation;
import com.orderflow.inventory.enums.ReservationStatus;
import com.orderflow.inventory.messaging.event.StockReleasedEvent;
import com.orderflow.inventory.messaging.event.StockReservationFailedEvent;
import com.orderflow.inventory.messaging.event.StockReservedEvent;
import com.orderflow.inventory.repository.InventoryRepository;
import com.orderflow.inventory.repository.OutboxEventRepository;
import com.orderflow.inventory.repository.StockReservationRepository;
import com.orderflow.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockReservationRepository stockReservationRepository;
    private final OutboxEventRepository outboxEventRepository;

    @Override
    @Transactional(readOnly = true)
    public StockAvailabilityResponse getStockAvailability(UUID productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));
        return toAvailabilityResponse(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockAvailabilityResponse> getBatchAvailability(List<UUID> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyList();
        }
        return inventoryRepository.findAllByProductIdIn(productIds).stream()
                .map(this::toAvailabilityResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StockAvailabilityResponse updateStock(UUID productId, UpdateStockRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));

        if (request.getQuantity() < inventory.getReservedQuantity()) {
            throw new BadRequestException("Total quantity cannot be less than reserved quantity (" + inventory.getReservedQuantity() + ")");
        }

        inventory.setTotalQuantity(request.getQuantity());
        inventory = inventoryRepository.save(inventory);
        log.info("Updated stock for product {}: new total = {}", productId, request.getQuantity());
        return toAvailabilityResponse(inventory);
    }

    @Override
    @Transactional
    public StockAvailabilityResponse initInventory(InitInventoryRequest request) {
        if (inventoryRepository.existsByProductId(request.getProductId())) {
            throw new ConflictException("Inventory already exists for product: " + request.getProductId());
        }

        Inventory inventory = Inventory.builder()
                .productId(request.getProductId())
                .sku(request.getSku().toUpperCase().trim())
                .totalQuantity(request.getInitialQuantity() != null ? request.getInitialQuantity() : 0)
                .reservedQuantity(0)
                .reorderLevel(10)
                .build();

        inventory = inventoryRepository.save(inventory);
        log.info("Initialized inventory for product {} with sku {}", request.getProductId(), request.getSku());
        return toAvailabilityResponse(inventory);
    }

    @Override
    @Transactional
    public void reserveStock(UUID orderId, List<OrderItemDto> items, String correlationId) {
        log.info("Processing stock reservation for order: {}", orderId);

        // Check if already reserved (idempotency check)
        List<StockReservation> existing = stockReservationRepository.findByOrderId(orderId);
        if (!existing.isEmpty()) {
            log.info("Stock already processed for order: {}", orderId);
            return;
        }

        boolean allAvailable = true;
        String failureReason = null;
        Map<UUID, Inventory> inventoryMap = new HashMap<>();

        for (OrderItemDto item : items) {
            Optional<Inventory> invOpt = inventoryRepository.findByProductId(item.getProductId());
            if (invOpt.isEmpty()) {
                allAvailable = false;
                failureReason = "Product not found in inventory: " + item.getProductId();
                break;
            }
            Inventory inv = invOpt.get();
            if (inv.getAvailableQuantity() < item.getQuantity()) {
                allAvailable = false;
                failureReason = String.format("Insufficient stock for SKU %s. Requested: %d, Available: %d",
                        inv.getSku(), item.getQuantity(), inv.getAvailableQuantity());
                break;
            }
            inventoryMap.put(item.getProductId(), inv);
        }

        if (!allAvailable) {
            log.warn("Stock reservation failed for order {}: {}", orderId, failureReason);

            StockReservationFailedEvent failedEvent = StockReservationFailedEvent.builder()
                    .orderId(orderId)
                    .reason(failureReason)
                    .build();
            failedEvent.initDefaults("StockReservationFailed", orderId.toString(), "Inventory", "inventory-service", correlationId);

            saveOutboxEvent("Inventory", orderId, "StockReservationFailed", failedEvent, correlationId);
            return;
        }

        // All items available - perform reservation atomically
        List<StockReservedEvent.ItemReservation> reservations = new ArrayList<>();
        Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

        for (OrderItemDto item : items) {
            Inventory inv = inventoryMap.get(item.getProductId());
            inv.setReservedQuantity(inv.getReservedQuantity() + item.getQuantity());
            inventoryRepository.save(inv);

            StockReservation reservation = StockReservation.builder()
                    .orderId(orderId)
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .status(ReservationStatus.RESERVED)
                    .expiresAt(expiresAt)
                    .build();
            reservation = stockReservationRepository.save(reservation);

            reservations.add(StockReservedEvent.ItemReservation.builder()
                    .productId(item.getProductId())
                    .reservationId(reservation.getId())
                    .quantity(item.getQuantity())
                    .build());
        }

        StockReservedEvent reservedEvent = StockReservedEvent.builder()
                .orderId(orderId)
                .reservations(reservations)
                .build();
        reservedEvent.initDefaults("StockReserved", orderId.toString(), "Inventory", "inventory-service", correlationId);

        saveOutboxEvent("Inventory", orderId, "StockReserved", reservedEvent, correlationId);
        log.info("Successfully reserved stock for order {}", orderId);
    }

    @Override
    @Transactional
    public void releaseStock(UUID orderId, String correlationId) {
        log.info("Processing stock release for order: {}", orderId);
        List<StockReservation> activeReservations = stockReservationRepository.findByOrderIdAndStatus(orderId, ReservationStatus.RESERVED);

        for (StockReservation res : activeReservations) {
            inventoryRepository.findByProductId(res.getProductId()).ifPresent(inv -> {
                int newReserved = Math.max(0, inv.getReservedQuantity() - res.getQuantity());
                inv.setReservedQuantity(newReserved);
                inventoryRepository.save(inv);
            });
            res.setStatus(ReservationStatus.RELEASED);
            stockReservationRepository.save(res);
        }

        StockReleasedEvent releasedEvent = StockReleasedEvent.builder()
                .orderId(orderId)
                .build();
        releasedEvent.initDefaults("StockReleased", orderId.toString(), "Inventory", "inventory-service", correlationId);

        saveOutboxEvent("Inventory", orderId, "StockReleased", releasedEvent, correlationId);
        log.info("Successfully released stock reservations for order {}", orderId);
    }

    @Override
    @Transactional
    public void confirmStock(UUID orderId) {
        log.info("Finalizing stock consumption for confirmed order: {}", orderId);
        List<StockReservation> reservations = stockReservationRepository.findByOrderIdAndStatus(orderId, ReservationStatus.RESERVED);

        for (StockReservation res : reservations) {
            inventoryRepository.findByProductId(res.getProductId()).ifPresent(inv -> {
                int newTotal = Math.max(0, inv.getTotalQuantity() - res.getQuantity());
                int newReserved = Math.max(0, inv.getReservedQuantity() - res.getQuantity());
                inv.setTotalQuantity(newTotal);
                inv.setReservedQuantity(newReserved);
                inventoryRepository.save(inv);
            });
            res.setStatus(ReservationStatus.CONFIRMED);
            stockReservationRepository.save(res);
        }
    }

    private void saveOutboxEvent(String aggregateType, UUID aggregateId, String eventType, Object event, String correlationId) {
        OutboxEvent outbox = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(JsonUtil.toJson(event))
                .correlationId(correlationId)
                .published(false)
                .build();
        outboxEventRepository.save(outbox);
    }

    private StockAvailabilityResponse toAvailabilityResponse(Inventory inventory) {
        return StockAvailabilityResponse.builder()
                .productId(inventory.getProductId())
                .sku(inventory.getSku())
                .availableQuantity(inventory.getAvailableQuantity())
                .totalQuantity(inventory.getTotalQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .inStock(inventory.getAvailableQuantity() > 0)
                .build();
    }
}

package com.orderflow.inventory.repository;

import com.orderflow.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findByProductId(UUID productId);
    Optional<Inventory> findBySku(String sku);
    List<Inventory> findAllByProductIdIn(Collection<UUID> productIds);
    boolean existsByProductId(UUID productId);
    boolean existsBySku(String sku);
}

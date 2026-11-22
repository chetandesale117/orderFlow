package com.orderflow.inventory.repository;

import com.orderflow.inventory.entity.StockReservation;
import com.orderflow.inventory.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, UUID> {
    List<StockReservation> findByOrderId(UUID orderId);
    List<StockReservation> findByOrderIdAndStatus(UUID orderId, ReservationStatus status);
}

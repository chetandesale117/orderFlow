package com.orderflow.payment.repository;

import com.orderflow.payment.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {
    Optional<Refund> findByIdempotencyKey(String idempotencyKey);
    List<Refund> findByPaymentId(UUID paymentId);
}

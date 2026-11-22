package com.orderflow.order.repository;

import com.orderflow.order.entity.SagaInstance;
import com.orderflow.order.enums.SagaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SagaInstanceRepository extends JpaRepository<SagaInstance, UUID> {
    Optional<SagaInstance> findByOrderId(UUID orderId);
    List<SagaInstance> findByStatusAndTimeoutAtBefore(SagaStatus status, Instant now);
}

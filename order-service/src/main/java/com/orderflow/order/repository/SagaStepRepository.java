package com.orderflow.order.repository;

import com.orderflow.order.entity.SagaStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SagaStepRepository extends JpaRepository<SagaStep, UUID> {
    List<SagaStep> findBySagaId(UUID sagaId);
    Optional<SagaStep> findBySagaIdAndStepName(UUID sagaId, String stepName);
}

package com.orderflow.notification.repository;

import com.orderflow.notification.document.Notification;
import com.orderflow.notification.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    Page<Notification> findByUserId(UUID userId, Pageable pageable);
    Optional<Notification> findByNotificationId(UUID notificationId);
    List<Notification> findByStatus(NotificationStatus status);
}

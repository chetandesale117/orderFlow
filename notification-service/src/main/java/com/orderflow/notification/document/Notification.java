package com.orderflow.notification.document;

import com.orderflow.notification.enums.NotificationStatus;
import com.orderflow.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private UUID notificationId;
    private UUID userId;

    @Builder.Default
    private NotificationType type = NotificationType.EMAIL;

    @Builder.Default
    private String channel = "email";

    private String templateName;
    private String subject;
    private String recipientEmail;
    private String body;

    @Builder.Default
    private NotificationStatus status = NotificationStatus.PENDING;

    @Builder.Default
    private int retryCount = 0;

    @Builder.Default
    private int maxRetries = 3;

    private String errorMessage;
    private Map<String, Object> metadata;

    private Instant sentAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

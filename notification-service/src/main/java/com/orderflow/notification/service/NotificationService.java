package com.orderflow.notification.service;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.notification.document.Notification;

import java.util.Map;
import java.util.UUID;

public interface NotificationService {
    void sendNotification(UUID userId, String recipientEmail, String templateName, String subject, Map<String, Object> variables);
    PageResponse<Notification> getNotificationsForUser(UUID userId, int page, int size);
    Notification getNotificationById(String id);
    PageResponse<Notification> getAllNotifications(int page, int size);
}

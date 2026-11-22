package com.orderflow.notification.service.impl;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.ResourceNotFoundException;
import com.orderflow.notification.document.Notification;
import com.orderflow.notification.enums.NotificationStatus;
import com.orderflow.notification.enums.NotificationType;
import com.orderflow.notification.repository.NotificationRepository;
import com.orderflow.notification.service.EmailService;
import com.orderflow.notification.service.NotificationService;
import com.orderflow.notification.template.TemplateRenderer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final TemplateRenderer templateRenderer;

    @Override
    public void sendNotification(UUID userId, String recipientEmail, String templateName, String subject, Map<String, Object> variables) {
        log.info("Preparing notification for user: {}, email: {}, template: {}", userId, recipientEmail, templateName);

        String htmlBody;
        try {
            htmlBody = templateRenderer.render(templateName, variables);
        } catch (Exception e) {
            log.error("Failed to render template {}: {}", templateName, e.getMessage());
            htmlBody = "<html><body><h3>" + subject + "</h3><p>" + variables.toString() + "</p></body></html>";
        }

        Notification notification = Notification.builder()
                .notificationId(UUID.randomUUID())
                .userId(userId)
                .type(NotificationType.EMAIL)
                .channel("email")
                .templateName(templateName)
                .subject(subject)
                .recipientEmail(recipientEmail)
                .body(htmlBody)
                .status(NotificationStatus.PENDING)
                .retryCount(0)
                .maxRetries(3)
                .metadata(variables)
                .build();

        notification = notificationRepository.save(notification);

        try {
            emailService.sendHtmlEmail(recipientEmail, subject, htmlBody);
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(Instant.now());
        } catch (Exception e) {
            log.warn("Failed to dispatch notification {} via email: {}", notification.getNotificationId(), e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        }

        notificationRepository.save(notification);
    }

    @Override
    public PageResponse<Notification> getNotificationsForUser(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findByUserId(userId, pageable);

        return PageResponse.of(
                notificationPage.getContent(),
                page,
                size,
                notificationPage.getTotalElements()
        );
    }

    @Override
    public Notification getNotificationById(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
    }

    @Override
    public PageResponse<Notification> getAllNotifications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findAll(pageable);

        return PageResponse.of(
                notificationPage.getContent(),
                page,
                size,
                notificationPage.getTotalElements()
        );
    }
}

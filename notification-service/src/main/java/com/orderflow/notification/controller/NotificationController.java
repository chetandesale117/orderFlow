package com.orderflow.notification.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.UnauthorizedException;
import com.orderflow.notification.document.Notification;
import com.orderflow.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "Customer notification history and delivery logs")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/notifications")
    @Operation(summary = "Get notification history for current user")
    public ResponseEntity<ApiResponse<PageResponse<Notification>>> getMyNotifications(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID userId = validateAndExtractUserId(userIdHeader);
        PageResponse<Notification> response = notificationService.getNotificationsForUser(userId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/notifications/{id}")
    @Operation(summary = "Get notification details by ID")
    public ResponseEntity<ApiResponse<Notification>> getNotificationById(@PathVariable String id) {
        Notification response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/admin/notifications")
    @Operation(summary = "Admin: List all dispatched notifications (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<Notification>>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<Notification> response = notificationService.getAllNotifications(page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private UUID validateAndExtractUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            throw new UnauthorizedException("Missing authentication context");
        }
        try {
            return UUID.fromString(userIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid user ID in authentication context");
        }
    }
}

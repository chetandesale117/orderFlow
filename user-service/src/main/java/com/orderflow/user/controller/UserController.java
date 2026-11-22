package com.orderflow.user.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.UnauthorizedException;
import com.orderflow.user.dto.request.UpdateProfileRequest;
import com.orderflow.user.dto.response.UserProfileResponse;
import com.orderflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Customer profile management and admin user lookup")
public class UserController {

    private final UserService userService;

    @GetMapping("/users/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        UUID authUserId = validateAndExtractUserId(userIdHeader);
        UserProfileResponse response = userService.getProfileByAuthUserId(authUserId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/users/me")
    @Operation(summary = "Update current authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID authUserId = validateAndExtractUserId(userIdHeader);
        UserProfileResponse response = userService.updateProfile(authUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", response));
    }

    @GetMapping("/admin/users")
    @Operation(summary = "Admin: List all user profiles (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<UserProfileResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<UserProfileResponse> response = userService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/admin/users/{id}")
    @Operation(summary = "Admin: Get user profile by profile ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable UUID id) {
        UserProfileResponse response = userService.getUserById(id);
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

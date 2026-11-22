package com.orderflow.user.controller;

import com.orderflow.common.dto.ApiResponse;
import com.orderflow.common.exception.UnauthorizedException;
import com.orderflow.user.dto.request.AddressRequest;
import com.orderflow.user.dto.response.AddressResponse;
import com.orderflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/me/addresses")
@RequiredArgsConstructor
@Tag(name = "Address Management", description = "Customer address book operations")
public class AddressController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List current user addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        UUID authUserId = validateAndExtractUserId(userIdHeader);
        List<AddressResponse> addresses = userService.getAddresses(authUserId);
        return ResponseEntity.ok(ApiResponse.ok(addresses));
    }

    @PostMapping
    @Operation(summary = "Add address to current user profile")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody AddressRequest request) {
        UUID authUserId = validateAndExtractUserId(userIdHeader);
        AddressResponse address = userService.addAddress(authUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Address added successfully", address));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update address by ID")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequest request) {
        UUID authUserId = validateAndExtractUserId(userIdHeader);
        AddressResponse address = userService.updateAddress(authUserId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Address updated successfully", address));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete address by ID")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable UUID id) {
        UUID authUserId = validateAndExtractUserId(userIdHeader);
        userService.deleteAddress(authUserId, id);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted successfully"));
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

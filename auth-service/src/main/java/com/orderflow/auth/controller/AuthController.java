package com.orderflow.auth.controller;

import com.orderflow.auth.dto.request.CreateAdminRequest;
import com.orderflow.auth.dto.request.LoginRequest;
import com.orderflow.auth.dto.request.RefreshTokenRequest;
import com.orderflow.auth.dto.request.RegisterRequest;
import com.orderflow.auth.dto.response.AuthResponse;
import com.orderflow.auth.dto.response.UserInfoResponse;
import com.orderflow.auth.service.AuthService;
import com.orderflow.auth.util.KeyPairUtil;
import com.orderflow.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, token refresh and management")
public class AuthController {

    private final AuthService authService;
    private final KeyPairUtil keyPairUtil;

    @PostMapping("/register")
    @Operation(summary = "Register new customer")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login customer / admin")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate tokens")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getCurrentUser(
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader,
            Authentication authentication) {
        String email = (emailHeader != null && !emailHeader.isBlank())
                ? emailHeader
                : (authentication != null ? authentication.getName() : null);
        UserInfoResponse response = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create an admin user")
    public ResponseEntity<ApiResponse<UserInfoResponse>> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        UserInfoResponse response = authService.createAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Admin user created successfully", response));
    }

    @GetMapping("/public-key")
    @Operation(summary = "Retrieve RSA public key in PEM format")
    public ResponseEntity<String> getPublicKey() {
        return ResponseEntity.ok(keyPairUtil.getPublicKeyAsPem());
    }
}

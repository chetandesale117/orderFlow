package com.orderflow.auth.service;

import com.orderflow.auth.dto.request.CreateAdminRequest;
import com.orderflow.auth.dto.request.LoginRequest;
import com.orderflow.auth.dto.request.RefreshTokenRequest;
import com.orderflow.auth.dto.request.RegisterRequest;
import com.orderflow.auth.dto.response.AuthResponse;
import com.orderflow.auth.dto.response.UserInfoResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String authHeader);
    UserInfoResponse getCurrentUser(String email);
    UserInfoResponse createAdmin(CreateAdminRequest request);
}

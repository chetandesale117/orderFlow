package com.orderflow.auth.service.impl;

import com.orderflow.auth.dto.request.CreateAdminRequest;
import com.orderflow.auth.dto.request.LoginRequest;
import com.orderflow.auth.dto.request.RefreshTokenRequest;
import com.orderflow.auth.dto.request.RegisterRequest;
import com.orderflow.auth.dto.response.AuthResponse;
import com.orderflow.auth.dto.response.UserInfoResponse;
import com.orderflow.auth.entity.AuthCredential;
import com.orderflow.auth.entity.RefreshToken;
import com.orderflow.auth.enums.Role;
import com.orderflow.auth.messaging.event.UserRegisteredEvent;
import com.orderflow.auth.messaging.producer.AuthEventProducer;
import com.orderflow.auth.repository.AuthCredentialRepository;
import com.orderflow.auth.repository.RefreshTokenRepository;
import com.orderflow.auth.security.JwtTokenProvider;
import com.orderflow.auth.service.AuthService;
import com.orderflow.common.exception.ConflictException;
import com.orderflow.common.exception.ResourceNotFoundException;
import com.orderflow.common.exception.UnauthorizedException;
import com.orderflow.common.util.CorrelationIdUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthCredentialRepository authCredentialRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthEventProducer authEventProducer;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (authCredentialRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered: " + email);
        }

        AuthCredential credential = AuthCredential.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .isEnabled(true)
                .isLocked(false)
                .failedAttempts(0)
                .build();

        credential = authCredentialRepository.save(credential);
        log.info("Registered new user with id: {} and email: {}", credential.getId(), credential.getEmail());

        // Create initial refresh token family
        String rawRefreshToken = jwtTokenProvider.generateRefreshTokenString();
        UUID familyId = UUID.randomUUID();
        saveRefreshToken(credential, rawRefreshToken, familyId, null);

        // Generate access token
        String accessToken = jwtTokenProvider.generateAccessToken(credential);

        // Publish UserRegisteredEvent
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(credential.getId())
                .email(credential.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();
        event.initDefaults(
                "UserRegistered",
                credential.getId().toString(),
                "AuthCredential",
                "auth-service",
                CorrelationIdUtil.getCorrelationId()
        );
        authEventProducer.publishUserRegistered(event);

        return buildAuthResponse(credential, accessToken, rawRefreshToken);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        AuthCredential credential = authCredentialRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!credential.getIsEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }
        if (credential.getIsLocked()) {
            throw new UnauthorizedException("Account is locked. Please try again later");
        }

        if (!passwordEncoder.matches(request.getPassword(), credential.getPasswordHash())) {
            int attempts = credential.getFailedAttempts() + 1;
            credential.setFailedAttempts(attempts);
            if (attempts >= 5) {
                credential.setIsLocked(true);
                credential.setLockedUntil(Instant.now().plus(Duration.ofMinutes(15)));
                log.warn("Account locked due to 5 consecutive failed login attempts: {}", email);
            }
            authCredentialRepository.save(credential);
            throw new UnauthorizedException("Invalid email or password");
        }

        // Reset failed attempts on success
        credential.setFailedAttempts(0);
        credential.setIsLocked(false);
        credential.setLockedUntil(null);
        authCredentialRepository.save(credential);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(credential);
        String rawRefreshToken = jwtTokenProvider.generateRefreshTokenString();
        saveRefreshToken(credential, rawRefreshToken, UUID.randomUUID(), null);

        return buildAuthResponse(credential, accessToken, rawRefreshToken);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String rawToken = request.getRefreshToken();
        String tokenHash = jwtTokenProvider.hashToken(rawToken);

        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        // Rotation & Reuse detection: If revoked token is used again, revoke its whole family!
        if (Boolean.TRUE.equals(token.getRevoked())) {
            log.warn("SECURITY ALERT: Refresh token reuse detected for family: {}. Revoking family.", token.getFamilyId());
            refreshTokenRepository.revokeFamily(token.getFamilyId(), Instant.now());
            throw new UnauthorizedException("Invalid refresh token: Token reuse detected");
        }

        if (token.isExpired()) {
            token.setRevoked(true);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
            throw new UnauthorizedException("Refresh token has expired");
        }

        AuthCredential credential = token.getUser();
        if (!credential.getIsEnabled() || credential.getIsLocked()) {
            throw new UnauthorizedException("Account is disabled or locked");
        }

        // Revoke the used token and link replacement
        token.setRevoked(true);
        token.setRevokedAt(Instant.now());

        String newRawRefreshToken = jwtTokenProvider.generateRefreshTokenString();
        RefreshToken nextToken = saveRefreshToken(credential, newRawRefreshToken, token.getFamilyId(), null);
        token.setReplacedBy(nextToken.getId());
        refreshTokenRepository.save(token);

        String newAccessToken = jwtTokenProvider.generateAccessToken(credential);
        return buildAuthResponse(credential, newAccessToken, newRawRefreshToken);
    }

    @Override
    @Transactional
    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                Claims claims = jwtTokenProvider.extractClaims(token);
                String jti = claims.getId();
                Date expiration = claims.getExpiration();
                long remainingMillis = expiration.getTime() - System.currentTimeMillis();

                if (jti != null && remainingMillis > 0) {
                    try {
                        redisTemplate.opsForValue().set("auth:blacklist:" + jti, "revoked", Duration.ofMillis(remainingMillis));
                        log.info("Blacklisted JWT jti: {}", jti);
                    } catch (Exception e) {
                        log.warn("Redis unavailable for blacklisting token: {}", e.getMessage());
                    }
                }

                String userIdStr = claims.get("userId", String.class);
                if (userIdStr != null) {
                    refreshTokenRepository.revokeAllForUser(UUID.fromString(userIdStr), Instant.now());
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserInfoResponse getCurrentUser(String email) {
        AuthCredential credential = authCredentialRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return toUserInfoResponse(credential);
    }

    @Override
    @Transactional
    public UserInfoResponse createAdmin(CreateAdminRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (authCredentialRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered: " + email);
        }

        AuthCredential credential = AuthCredential.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .isEnabled(true)
                .isLocked(false)
                .failedAttempts(0)
                .build();

        credential = authCredentialRepository.save(credential);
        log.info("Created new admin user with email: {}", email);
        return toUserInfoResponse(credential);
    }

    private RefreshToken saveRefreshToken(AuthCredential credential, String rawToken, UUID familyId, UUID replacedBy) {
        String tokenHash = jwtTokenProvider.hashToken(rawToken);
        Instant expiresAt = Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpirationMs());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(credential)
                .tokenHash(tokenHash)
                .familyId(familyId)
                .expiresAt(expiresAt)
                .revoked(false)
                .replacedBy(replacedBy)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(AuthCredential credential, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(toUserInfoResponse(credential))
                .build();
    }

    private UserInfoResponse toUserInfoResponse(AuthCredential credential) {
        return UserInfoResponse.builder()
                .id(credential.getId())
                .email(credential.getEmail())
                .role(credential.getRole())
                .isEnabled(credential.getIsEnabled())
                .build();
    }
}

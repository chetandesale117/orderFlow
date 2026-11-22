package com.orderflow.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.common.dto.ApiResponse;
import com.orderflow.common.security.SecurityConstants;
import com.orderflow.gateway.util.JwtPublicKeyUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.PublicKey;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtPublicKeyUtil jwtPublicKeyUtil;
    private final ReactiveStringRedisTemplate reactiveRedisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/auth/public-key",
            "/actuator",
            "/v3/api-docs",
            "/swagger-ui"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // 1. Check if public path
        if (isPublicPath(path, method)) {
            return chain.filter(exchange);
        }

        // 2. Extract Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(SecurityConstants.BEARER_PREFIX)) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header", path);
        }

        String token = authHeader.substring(SecurityConstants.BEARER_PREFIX.length()).trim();

        // 3. Validate claims & signature
        String jti;
        String userId;
        String email;
        String role;

        try {
            PublicKey publicKey = jwtPublicKeyUtil.getPublicKey();
            if (publicKey != null) {
                Claims claims = jwtPublicKeyUtil.parseAndValidateClaims(token, publicKey);
                jti = claims.getId();
                userId = claims.get(SecurityConstants.CLAIM_USER_ID, String.class);
                email = claims.get(SecurityConstants.CLAIM_EMAIL, String.class);
                role = claims.get(SecurityConstants.CLAIM_ROLE, String.class);
            } else {
                // In local dev without key file, decode token payload claims
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    byte[] payload = java.util.Base64.getUrlDecoder().decode(parts[1]);
                    java.util.Map<String, Object> claimsMap = objectMapper.readValue(
                            payload, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
                    jti = (String) claimsMap.get("jti");
                    userId = claimsMap.get(SecurityConstants.CLAIM_USER_ID) != null ? claimsMap.get(SecurityConstants.CLAIM_USER_ID).toString() : null;
                    email = claimsMap.get(SecurityConstants.CLAIM_EMAIL) != null ? claimsMap.get(SecurityConstants.CLAIM_EMAIL).toString() : null;
                    role = claimsMap.get(SecurityConstants.CLAIM_ROLE) != null ? claimsMap.get(SecurityConstants.CLAIM_ROLE).toString() : null;
                } else {
                    return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid JWT format", path);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to validate JWT token for path {}: {}", path, e.getMessage());
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token", path);
        }

        // 4. Check Redis blacklist for revoked access tokens
        if (jti != null) {
            return reactiveRedisTemplate.hasKey("auth:blacklist:" + jti)
                    .defaultIfEmpty(false)
                    .flatMap(isBlacklisted -> {
                        if (Boolean.TRUE.equals(isBlacklisted)) {
                            return onError(exchange, HttpStatus.UNAUTHORIZED, "Token has been revoked", path);
                        }
                        return proceedWithUserContext(exchange, chain, path, userId, email, role);
                    })
                    .onErrorResume(ex -> {
                        // If redis is temporarily unavailable, proceed gracefully
                        return proceedWithUserContext(exchange, chain, path, userId, email, role);
                    });
        }

        return proceedWithUserContext(exchange, chain, path, userId, email, role);
    }

    private Mono<Void> proceedWithUserContext(ServerWebExchange exchange, GatewayFilterChain chain,
                                              String path, String userId, String email, String role) {
        // Enforce ADMIN role check on admin endpoints
        if (path.contains("/admin/") && !SecurityConstants.ROLE_ADMIN.equalsIgnoreCase(role)) {
            return onError(exchange, HttpStatus.FORBIDDEN, "Access denied: Administrator privilege required", path);
        }

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id", userId != null ? userId : "")
                .header("X-User-Email", email != null ? email : "")
                .header("X-User-Role", role != null ? role : "")
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicPath(String path, HttpMethod method) {
        for (String prefix : PUBLIC_PATH_PREFIXES) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }
        // Public product & category catalog browsable by GET
        if (HttpMethod.GET.equals(method)) {
            if ((path.startsWith("/api/v1/products") || path.startsWith("/api/v1/categories"))
                    && !path.contains("/admin/")) {
                return true;
            }
            if (path.startsWith("/api/v1/inventory") && !path.contains("/admin/")) {
                return true;
            }
        }
        return false;
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status, String message, String path) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String correlationId = response.getHeaders().getFirst(SecurityConstants.CORRELATION_ID_HEADER);

        ApiResponse<Void> errorResponse = ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .path(path)
                .correlationId(correlationId)
                .build();

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(errorResponse);
        } catch (JsonProcessingException e) {
            bytes = ("{\"success\":false,\"message\":\"" + message + "\"}").getBytes();
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}

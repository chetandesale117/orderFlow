package com.orderflow.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orderflow.common.dto.ApiResponse;
import com.orderflow.common.security.SecurityConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter implements GlobalFilter, Ordered {

    private final ReactiveStringRedisTemplate reactiveRedisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int MAX_REQUESTS_PER_MINUTE = 1000;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip rate limiting for actuator endpoints
        if (path.startsWith("/actuator")) {
            return chain.filter(exchange);
        }

        String ip = request.getRemoteAddress() != null
                ? request.getRemoteAddress().getAddress().getHostAddress()
                : "unknown";

        String rateLimitKey = "gw:ratelimit:" + ip;

        return reactiveRedisTemplate.opsForValue().increment(rateLimitKey)
                .flatMap(currentCount -> {
                    if (currentCount == 1) {
                        return reactiveRedisTemplate.expire(rateLimitKey, Duration.ofMinutes(1))
                                .thenReturn(currentCount);
                    }
                    return Mono.just(currentCount);
                })
                .flatMap(count -> {
                    if (count > MAX_REQUESTS_PER_MINUTE) {
                        log.warn("Rate limit exceeded for IP: {} on path: {}", ip, path);
                        return onRateLimitExceeded(exchange, path);
                    }
                    return chain.filter(exchange);
                })
                .onErrorResume(ex -> {
                    // Fail open if Redis is down
                    return chain.filter(exchange);
                });
    }

    private Mono<Void> onRateLimitExceeded(ServerWebExchange exchange, String path) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String correlationId = response.getHeaders().getFirst(SecurityConstants.CORRELATION_ID_HEADER);

        ApiResponse<Void> errorResponse = ApiResponse.<Void>builder()
                .success(false)
                .message("Rate limit exceeded. Please try again later.")
                .path(path)
                .correlationId(correlationId)
                .build();

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(errorResponse);
        } catch (JsonProcessingException e) {
            bytes = "{\"success\":false,\"message\":\"Too Many Requests\"}".getBytes();
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 5;
    }
}

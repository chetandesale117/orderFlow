package com.orderflow.common.security;

public final class SecurityConstants {

    private SecurityConstants() {}

    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    // JWT Claims
    public static final String CLAIM_USER_ID = "userId";
    public static final String CLAIM_EMAIL = "email";
    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_TOKEN_TYPE = "tokenType";

    // Roles
    public static final String ROLE_CUSTOMER = "CUSTOMER";
    public static final String ROLE_ADMIN = "ADMIN";
}

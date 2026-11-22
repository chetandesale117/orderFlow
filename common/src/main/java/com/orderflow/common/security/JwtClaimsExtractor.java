package com.orderflow.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import java.security.PublicKey;
import java.util.UUID;

public class JwtClaimsExtractor {

    public static Claims extractAllClaims(String token, PublicKey publicKey) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static UserPrincipal extractUserPrincipal(Claims claims) {
        String userIdStr = claims.get(SecurityConstants.CLAIM_USER_ID, String.class);
        String email = claims.get(SecurityConstants.CLAIM_EMAIL, String.class);
        String role = claims.get(SecurityConstants.CLAIM_ROLE, String.class);

        return UserPrincipal.builder()
                .userId(userIdStr != null ? UUID.fromString(userIdStr) : null)
                .email(email != null ? email : claims.getSubject())
                .role(role)
                .build();
    }
}

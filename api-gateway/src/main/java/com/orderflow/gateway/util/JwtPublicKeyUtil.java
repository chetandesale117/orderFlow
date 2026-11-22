package com.orderflow.gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Slf4j
@Component
public class JwtPublicKeyUtil {

    @Value("${jwt.public-key-path:keys/public.pem}")
    private String publicKeyPath;

    private PublicKey cachedPublicKey;

    public PublicKey getPublicKey() {
        if (cachedPublicKey != null) {
            return cachedPublicKey;
        }

        try {
            InputStream is = getClass().getClassLoader().getResourceAsStream(publicKeyPath);
            if (is != null) {
                String pem = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                cachedPublicKey = parsePublicKeyFromPem(pem);
                return cachedPublicKey;
            }
        } catch (Exception e) {
            log.warn("Could not load RSA public key from {}: {}", publicKeyPath, e.getMessage());
        }

        return null;
    }

    public static PublicKey parsePublicKeyFromPem(String pem) {
        try {
            String publicKeyPEM = pem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");

            byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePublic(new X509EncodedKeySpec(encoded));
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse public key from PEM", e);
        }
    }

    public Claims parseAndValidateClaims(String token, PublicKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

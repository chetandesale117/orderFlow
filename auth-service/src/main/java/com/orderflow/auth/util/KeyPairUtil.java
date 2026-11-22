package com.orderflow.auth.util;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

@Slf4j
@Component
@Getter
public class KeyPairUtil {

    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;

    public KeyPairUtil() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KeyPair keyPair = generator.generateKeyPair();
            this.privateKey = (RSAPrivateKey) keyPair.getPrivate();
            this.publicKey = (RSAPublicKey) keyPair.getPublic();
            log.info("Initialized RSA 2048-bit keypair for RS256 JWT signing");
        } catch (NoSuchAlgorithmException e) {
            log.error("Failed to generate RSA key pair", e);
            throw new IllegalStateException("RSA algorithm not available", e);
        }
    }

    public String getPublicKeyAsPem() {
        return "-----BEGIN PUBLIC KEY-----\n" +
                Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(publicKey.getEncoded()) +
                "\n-----END PUBLIC KEY-----";
    }
}

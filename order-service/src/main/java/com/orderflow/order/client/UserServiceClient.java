package com.orderflow.order.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

@Slf4j
@Component
public class UserServiceClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public UserServiceClient(@Value("${services.user-url:http://localhost:8082}") String userUrl) {
        this.webClient = WebClient.builder().baseUrl(userUrl).build();
    }

    public String getAddressSnapshot(UUID authUserId, UUID addressId) {
        try {
            String response = webClient.get()
                    .uri("/api/v1/users/me/addresses")
                    .header("X-User-Id", authUserId.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("data") && root.get("data").isArray()) {
                    for (JsonNode addr : root.get("data")) {
                        if (addressId.toString().equalsIgnoreCase(addr.get("id").asText())) {
                            return addr.toString();
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch address snapshot for address {} of user {}: {}", addressId, authUserId, e.getMessage());
        }

        return "{\"addressId\":\"" + addressId + "\"}";
    }
}

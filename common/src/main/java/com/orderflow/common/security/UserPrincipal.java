package com.orderflow.common.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal {
    private UUID userId;
    private String email;
    private String role;

    public boolean isAdmin() {
        return SecurityConstants.ROLE_ADMIN.equalsIgnoreCase(role);
    }
}

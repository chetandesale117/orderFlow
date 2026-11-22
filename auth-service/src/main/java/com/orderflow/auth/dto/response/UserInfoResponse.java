package com.orderflow.auth.dto.response;

import com.orderflow.auth.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private UUID id;
    private String email;
    private Role role;
    private Boolean isEnabled;
}

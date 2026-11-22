package com.orderflow.user.dto.response;

import com.orderflow.user.enums.AddressLabel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private UUID id;
    private AddressLabel label;
    private String streetLine1;
    private String streetLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private Boolean isDefault;
    private Instant createdAt;
    private Instant updatedAt;
}

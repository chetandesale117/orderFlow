package com.orderflow.user.dto.request;

import com.orderflow.user.enums.AddressLabel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotNull(message = "Label is required")
    private AddressLabel label;

    @NotBlank(message = "Street Line 1 is required")
    @Size(max = 255)
    private String streetLine1;

    @Size(max = 255)
    private String streetLine2;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100)
    private String state;

    @NotBlank(message = "Postal Code is required")
    @Size(max = 20)
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100)
    private String country;

    @Builder.Default
    private Boolean isDefault = false;
}

package com.orderflow.user.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 100, message = "First name must be less than 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must be less than 100 characters")
    private String lastName;

    @Size(max = 20, message = "Phone number must be less than 20 characters")
    private String phoneNumber;

    private LocalDate dateOfBirth;

    @Size(max = 500, message = "Avatar URL must be less than 500 characters")
    private String avatarUrl;
}

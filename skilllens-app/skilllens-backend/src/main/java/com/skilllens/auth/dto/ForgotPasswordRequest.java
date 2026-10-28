package com.skilllens.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank @Email(message = "Enter a valid email address.")
    private String email;
}

package com.skilllens.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RefreshRequest {
    @NotBlank(message = "Refresh token is required.")
    private String refreshToken;
}

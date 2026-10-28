package com.skilllens.auth.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Returned after successful login or token refresh.
 * Never contains password hashes or reset tokens.
 */
@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private long accessTokenExpiresIn;   // seconds
    private String tokenType;            // always "Bearer"
    private UserSummary user;

    @Data @Builder
    public static class UserSummary {
        private Long id;
        private String email;
        private String role;
        private String firstName;
        private String lastName;
    }
}

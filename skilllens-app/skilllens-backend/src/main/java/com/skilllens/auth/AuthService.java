package com.skilllens.auth;

import com.skilllens.auth.dto.*;
import com.skilllens.common.exception.*;
import com.skilllens.config.SkillLensProperties;
import com.skilllens.security.JwtTokenProvider;
import com.skilllens.security.UserPrincipal;
import com.skilllens.student.StudentProfile;
import com.skilllens.student.StudentProfileRepository;
import com.skilllens.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Authentication service — registration, login, refresh, logout, and password reset.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final SkillLensProperties properties;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("An account with this email address already exists.");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)   // Role is ALWAYS server-assigned
                .enabled(true)
                .emailVerified(false)
                .build();
        user = userRepository.save(user);

        // Create an empty student profile
        StudentProfile profile = StudentProfile.builder()
                .userId(user.getId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();
        studentProfileRepository.save(profile);

        log.info("New student registered: userId={}", user.getId());
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found."));

            userRepository.updateLastLogin(user.getId(), Instant.now());

            log.info("User logged in: userId={}", user.getId());
            return buildAuthResponse(user);

        } catch (BadCredentialsException | DisabledException e) {
            // Generic message — do not reveal whether email exists or password is wrong
            throw new BadRequestException("Invalid credentials. Please check your email and password.");
        }
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String rawToken = request.getRefreshToken();

        if (!jwtTokenProvider.isTokenValid(rawToken) || !jwtTokenProvider.isRefreshToken(rawToken)) {
            throw new BadRequestException("Invalid or expired refresh token.");
        }

        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new BadRequestException("Refresh token not recognised."));

        if (stored.isRevoked() || stored.isExpired()) {
            // Revoke all tokens for this user (potential token theft)
            refreshTokenRepository.revokeAllForUser(stored.getUserId());
            throw new BadRequestException("Refresh token has expired or been revoked.");
        }

        // Rotate: revoke old, issue new
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String rawToken) {
        if (!StringUtils.hasText(rawToken)) return;
        refreshTokenRepository.findByToken(rawToken).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional
    public void initiatePasswordReset(ForgotPasswordRequest request) {
        // Always respond with the same message regardless of whether the email exists
        // to prevent account enumeration.
        userRepository.findByEmailIgnoreCase(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(Instant.now().plusSeconds(3600)); // 1 hour
            userRepository.save(user);
            // TODO: send email via MailService when configured
            log.info("Password reset token generated for userId={}", user.getId());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token."));

        if (user.getPasswordResetTokenExpiry() == null ||
                Instant.now().isAfter(user.getPasswordResetTokenExpiry())) {
            throw new BadRequestException("Invalid or expired reset token.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        // Invalidate all refresh tokens
        refreshTokenRepository.revokeAllForUser(user.getId());
        log.info("Password reset for userId={}", user.getId());
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        // Get profile for name
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);

        Map<String, Object> claims = Map.of(
                "role", user.getRole().name(),
                "type", "ACCESS"
        );
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), claims);
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user.getEmail());

        // Persist refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenStr)
                .userId(user.getId())
                .expiresAt(jwtTokenProvider.extractExpiration(refreshTokenStr).toInstant())
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .accessTokenExpiresIn(properties.getJwt().getAccessTokenExpiryMs() / 1000)
                .tokenType("Bearer")
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .firstName(profile != null ? profile.getFirstName() : null)
                        .lastName(profile != null ? profile.getLastName() : null)
                        .build())
                .build();
    }
}

package com.skilllens.security;

import com.skilllens.config.SkillLensProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * JWT token utilities — generation, validation, and claim extraction.
 * <p>
 * Uses HS512 with a secret key that MUST be at least 64 characters for adequate entropy.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final SkillLensProperties properties;

    private SecretKey secretKey() {
        byte[] keyBytes = properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(String subject, Map<String, Object> claims) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(subject)
                .claims(claims)
                .issuedAt(new Date(now))
                .expiration(new Date(now + properties.getJwt().getAccessTokenExpiryMs()))
                .signWith(secretKey(), Jwts.SIG.HS512)
                .compact();
    }

    public String generateRefreshToken(String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(subject)
                .claim("type", "REFRESH")
                .issuedAt(new Date(now))
                .expiration(new Date(now + properties.getJwt().getRefreshTokenExpiryMs()))
                .signWith(secretKey(), Jwts.SIG.HS512)
                .compact();
    }

    public Claims validateAndExtractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractSubject(String token) {
        return validateAndExtractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            validateAndExtractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            Claims claims = validateAndExtractClaims(token);
            return "REFRESH".equals(claims.get("type", String.class));
        } catch (JwtException e) {
            return false;
        }
    }

    public Date extractExpiration(String token) {
        return validateAndExtractClaims(token).getExpiration();
    }
}

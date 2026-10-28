package com.skilllens.auth;

import com.skilllens.config.SkillLensProperties;
import com.skilllens.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        SkillLensProperties properties = new SkillLensProperties();
        properties.getJwt().setSecret("0123456789012345678901234567890123456789012345678901234567890123456789");
        properties.getJwt().setAccessTokenExpiryMs(60000);
        properties.getJwt().setRefreshTokenExpiryMs(120000);
        jwtTokenProvider = new JwtTokenProvider(properties);
    }

    @Test
    void generateAccessToken_shouldProduceValidClaims() {
        String token = jwtTokenProvider.generateAccessToken("student@skilllens.com", Map.of("role", "ROLE_STUDENT", "uid", 42L));
        assertNotNull(token);

        Claims claims = jwtTokenProvider.validateAndExtractClaims(token);
        assertEquals("student@skilllens.com", claims.getSubject());
        assertEquals("ROLE_STUDENT", claims.get("role"));
        assertEquals(42, ((Number) claims.get("uid")).intValue());
    }

    @Test
    void generateRefreshToken_shouldSetRefreshClaim() {
        String token = jwtTokenProvider.generateRefreshToken("student@skilllens.com");
        assertNotNull(token);

        Claims claims = jwtTokenProvider.validateAndExtractClaims(token);
        assertEquals("student@skilllens.com", claims.getSubject());
        assertEquals("REFRESH", claims.get("type"));
    }
}

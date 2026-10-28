package com.skilllens.auth;

import com.skilllens.auth.dto.AuthResponse;
import com.skilllens.auth.dto.LoginRequest;
import com.skilllens.auth.dto.RegisterRequest;
import com.skilllens.common.exception.BadRequestException;
import com.skilllens.common.exception.ConflictException;
import com.skilllens.config.SkillLensProperties;
import com.skilllens.security.JwtTokenProvider;
import com.skilllens.security.UserPrincipal;
import com.skilllens.student.StudentProfile;
import com.skilllens.student.StudentProfileRepository;
import com.skilllens.user.Role;
import com.skilllens.user.User;
import com.skilllens.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private SkillLensProperties properties;

    @InjectMocks
    private AuthService authService;

    private SkillLensProperties.Jwt jwtProps;

    @BeforeEach
    void setUp() {
        jwtProps = new SkillLensProperties.Jwt();
        jwtProps.setAccessTokenExpiryMs(900_000L);
    }

    @Test
    void register_successfullyCreatesUserAndProfile_andReturnsTokens() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("alice@test.com");
        request.setPassword("SecurePassword123!");
        request.setFirstName("Alice");
        request.setLastName("Smith");

        when(userRepository.existsByEmailIgnoreCase("alice@test.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");

        User savedUser = User.builder()
                .id(100L)
                .email("alice@test.com")
                .passwordHash("hashed_password")
                .role(Role.STUDENT)
                .enabled(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(studentProfileRepository.findByUserId(100L)).thenReturn(Optional.of(
                StudentProfile.builder().userId(100L).firstName("Alice").lastName("Smith").build()
        ));

        when(jwtTokenProvider.generateAccessToken(eq("alice@test.com"), anyMap())).thenReturn("access_token_xyz");
        when(jwtTokenProvider.generateRefreshToken(eq("alice@test.com"))).thenReturn("refresh_token_abc");
        when(jwtTokenProvider.extractExpiration("refresh_token_abc")).thenReturn(new Date(System.currentTimeMillis() + 604800000L));
        when(properties.getJwt()).thenReturn(jwtProps);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access_token_xyz", response.getAccessToken());
        assertEquals("refresh_token_abc", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("alice@test.com", response.getUser().getEmail());
        assertEquals("STUDENT", response.getUser().getRole());
        assertEquals("Alice", response.getUser().getFirstName());

        verify(userRepository).save(any(User.class));
        verify(studentProfileRepository).save(any(StudentProfile.class));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void register_throwsConflictException_whenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@test.com");
        request.setPassword("SecurePassword123!");

        when(userRepository.existsByEmailIgnoreCase("existing@test.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_successfullyAuthenticates_andReturnsAuthResponse() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@test.com");
        request.setPassword("SecurePassword123!");

        UserPrincipal principal = UserPrincipal.builder()
                .id(100L)
                .email("alice@test.com")
                .password("hashed_password")
                .enabled(true)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        User user = User.builder()
                .id(100L)
                .email("alice@test.com")
                .passwordHash("hashed_password")
                .role(Role.STUDENT)
                .enabled(true)
                .build();
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(studentProfileRepository.findByUserId(100L)).thenReturn(Optional.empty());

        when(jwtTokenProvider.generateAccessToken(eq("alice@test.com"), anyMap())).thenReturn("mock_access_token");
        when(jwtTokenProvider.generateRefreshToken(eq("alice@test.com"))).thenReturn("mock_refresh_token");
        when(jwtTokenProvider.extractExpiration("mock_refresh_token")).thenReturn(new Date(System.currentTimeMillis() + 604800000L));
        when(properties.getJwt()).thenReturn(jwtProps);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_access_token", response.getAccessToken());
        assertEquals("mock_refresh_token", response.getRefreshToken());
        assertEquals("alice@test.com", response.getUser().getEmail());
    }

    @Test
    void login_throwsBadRequestException_onBadCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@test.com");
        request.setPassword("WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadRequestException.class, () -> authService.login(request));
    }
}

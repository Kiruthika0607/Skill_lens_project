package com.skilllens.security;

import com.skilllens.user.User;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security principal wrapping our {@link User} entity.
 * <p>
 * Immutable; rebuilt on each request from the JWT or session.
 */
@Getter
@Builder
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final boolean enabled;
    private final List<GrantedAuthority> authorities;

    public static UserPrincipal from(User user) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .enabled(user.isEnabled())
                .authorities(authorities)
                .build();
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public String getPassword()                                       { return password; }
    @Override public String getUsername()                                       { return email; }
    @Override public boolean isAccountNonExpired()                              { return true; }
    @Override public boolean isAccountNonLocked()                               { return enabled; }
    @Override public boolean isCredentialsNonExpired()                          { return true; }
    @Override public boolean isEnabled()                                        { return enabled; }
}

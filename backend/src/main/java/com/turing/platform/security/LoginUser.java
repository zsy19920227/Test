package com.turing.platform.security;

import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 登录用户主体（实现 UserDetails，作为 Authentication 的 principal）。
 * authorities = ROLE_{role} + 权限标识，@PreAuthorize 使用 hasAuthority('xxx') 匹配。
 */
@Getter
@Builder
public class LoginUser implements UserDetails {

    private final Long userId;
    private final String username;
    private final String nickname;
    private final String password;
    private final boolean enabled;
    /** 角色编码（库中存 admin/viewer） */
    private final List<String> roles;
    /** 权限标识，如 system:user:list */
    private final List<String> permissions;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (String role : roles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        }
        for (String permission : permissions) {
            authorities.add(new SimpleGrantedAuthority(permission));
        }
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}

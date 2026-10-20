package com.turing.platform.security;

import com.turing.platform.module.system.service.SysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * 按用户名加载登录用户（含角色与权限）。
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final SysUserService sysUserService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        LoginUser loginUser = sysUserService.loadLoginUserByUsername(username);
        if (loginUser == null) {
            throw new UsernameNotFoundException("用户不存在: " + username);
        }
        return loginUser;
    }
}

package com.turing.platform.module.system.controller;

import com.turing.platform.common.api.Result;
import com.turing.platform.common.constant.SecurityConstants;
import com.turing.platform.common.exception.BusinessException;
import com.turing.platform.module.system.dto.LoginRequest;
import com.turing.platform.module.system.dto.LoginResponse;
import com.turing.platform.module.system.dto.UserInfo;
import com.turing.platform.security.JwtTokenProvider;
import com.turing.platform.security.LoginUser;
import com.turing.platform.security.SecurityUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;

/**
 * 认证接口：登录 / 登出 / 当前用户。
 */
@Tag(name = "认证", description = "JWT 登录、登出（Redis 黑名单）、当前用户信息")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final StringRedisTemplate stringRedisTemplate;

    @Operation(summary = "登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException | DisabledException e) {
            throw new BusinessException("用户名或密码错误");
        }
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(
                loginUser.getUserId(), loginUser.getUsername(), loginUser.getRoles());
        return Result.success(new LoginResponse(token, "Bearer", jwtTokenProvider.getExpireSeconds()));
    }

    @Operation(summary = "登出", description = "将当前 token 的 jti 加入 Redis 黑名单，剩余有效期后自动过期")
    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        String header = request.getHeader(SecurityConstants.AUTHORIZATION_HEADER);
        if (header != null && header.startsWith(SecurityConstants.TOKEN_PREFIX)) {
            String token = header.substring(SecurityConstants.TOKEN_PREFIX.length());
            try {
                Jws<Claims> claims = jwtTokenProvider.parseToken(token);
                long ttl = Duration.between(Instant.now(),
                        claims.getPayload().getExpiration().toInstant()).getSeconds();
                if (ttl > 0) {
                    stringRedisTemplate.opsForValue().set(
                            SecurityConstants.REDIS_TOKEN_BLACKLIST_PREFIX + claims.getPayload().getId(),
                            "1", Duration.ofSeconds(ttl));
                }
            } catch (JwtException ignored) {
                // 无效 token 无需拉黑
            }
        }
        return Result.success();
    }

    @Operation(summary = "当前登录用户信息")
    @GetMapping("/me")
    public Result<UserInfo> me() {
        LoginUser user = SecurityUtils.requireLoginUser();
        return Result.success(new UserInfo(user.getUserId(), user.getUsername(),
                user.getNickname(), user.getRoles(), user.getPermissions()));
    }
}

package com.turing.platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * JWT 令牌提供者（HS256）。
 * 说明：userId/roles 写入 claims 仅作携带；每次请求仍从数据库实时加载用户权限，
 * 保证权限变更即时生效。登出通过 jti + Redis 黑名单实现。
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${turing.jwt.secret}")
    private String secret;

    @Value("${turing.jwt.expire-seconds}")
    private long expireSeconds;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String username, List<String> roles) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("roles", roles)
                .id(UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expireSeconds)))
                .signWith(signingKey())
                .compact();
    }

    /** 解析并验签 token；签名错误或过期抛出 JwtException */
    public Jws<Claims> parseToken(String token) {
        return Jwts.parser().verifyWith(signingKey()).build().parseSignedClaims(token);
    }

    public long getExpireSeconds() {
        return expireSeconds;
    }

    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

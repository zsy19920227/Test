package com.turing.platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * JWT 生成/验签纯单元测试：不启动 Spring 上下文，不需要 MySQL/Redis。
 */
class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "secret",
                "unit-test-secret-0123456789abcdef-0123456789abcdef");
        ReflectionTestUtils.setField(provider, "expireSeconds", 60L);
    }

    @Test
    void generateAndParseRoundTrip() {
        String token = provider.generateToken(1L, "admin", List.of("admin"));

        Jws<Claims> claims = provider.parseToken(token);
        assertThat(claims.getPayload().getSubject()).isEqualTo("admin");
        assertThat(claims.getPayload().getId()).isNotBlank();
        assertThat(claims.getPayload().get("roles", List.class))
                .containsExactly("admin");
        assertThat(provider.getExpireSeconds()).isEqualTo(60L);
        assertThat(provider.isTokenValid(token)).isTrue();
    }

    @Test
    void rejectsTamperedSignature() {
        String token = provider.generateToken(1L, "admin", List.of("admin"));
        // 篡改签名段（JWT 最后一段）
        String tampered = token.substring(0, token.length() - 4) + "AAAA";

        assertThatThrownBy(() -> provider.parseToken(tampered))
                .isInstanceOf(JwtException.class);
        assertThat(provider.isTokenValid(tampered)).isFalse();
    }

    @Test
    void rejectsGarbageToken() {
        assertThat(provider.isTokenValid("not-a-jwt")).isFalse();
        assertThat(provider.isTokenValid("")).isFalse();
    }
}

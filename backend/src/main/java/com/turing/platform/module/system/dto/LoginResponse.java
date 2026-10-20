package com.turing.platform.module.system.dto;

/**
 * 登录成功响应。
 */
public record LoginResponse(String token, String tokenType, long expiresIn) {
}

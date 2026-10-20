package com.turing.platform.common.constant;

/**
 * 安全相关常量。
 */
public final class SecurityConstants {

    /** 认证头 */
    public static final String AUTHORIZATION_HEADER = "Authorization";

    /** Token 前缀 */
    public static final String TOKEN_PREFIX = "Bearer ";

    /** Redis 中已登出 token 黑名单 key 前缀：auth:blacklist:{jti} */
    public static final String REDIS_TOKEN_BLACKLIST_PREFIX = "auth:blacklist:";

    private SecurityConstants() {
    }
}

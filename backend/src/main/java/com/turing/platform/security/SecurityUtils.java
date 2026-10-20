package com.turing.platform.security;

import com.turing.platform.common.api.ResultCode;
import com.turing.platform.common.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * 安全上下文工具：获取当前登录用户。
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /** 获取当前登录用户（未登录返回 null） */
    public static LoginUser getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof LoginUser loginUser) {
            return loginUser;
        }
        return null;
    }

    /** 获取当前登录用户（未登录抛出业务异常） */
    public static LoginUser requireLoginUser() {
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return loginUser;
    }
}

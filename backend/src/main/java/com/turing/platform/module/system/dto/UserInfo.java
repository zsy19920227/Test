package com.turing.platform.module.system.dto;

import java.util.List;

/**
 * 当前登录用户信息（对应前端 UserInfo 接口）。
 */
public record UserInfo(Long id, String username, String nickname,
                       List<String> roles, List<String> permissions) {
}

package com.turing.platform.module.system.vo;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户视图对象（不含密码），对应前端 SysUserItem 接口。
 */
public record SysUserVO(
        Long id,
        String username,
        String nickname,
        String email,
        Integer status,
        List<String> roleCodes,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createTime) {
}

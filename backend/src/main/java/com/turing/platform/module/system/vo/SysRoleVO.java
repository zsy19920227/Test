package com.turing.platform.module.system.vo;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 角色视图对象，对应前端 SysRoleItem 接口。
 */
public record SysRoleVO(
        Long id,
        String code,
        String name,
        Integer status,
        String remark,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createTime) {
}

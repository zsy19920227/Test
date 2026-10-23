package com.turing.platform.module.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户分页查询的扁平行对象（对应 SysUserMapper.xml 的 selectUserPage）。
 */
@Data
public class SysUserRow {

    private Long id;

    private String username;

    private String nickname;

    private String email;

    private Integer status;

    private LocalDateTime createTime;

    /** GROUP_CONCAT 聚合的角色编码串，如 "admin,viewer" */
    private String roleCodes;

    /** GROUP_CONCAT 聚合的角色 ID 串，如 "1,2" */
    private String roleIds;
}

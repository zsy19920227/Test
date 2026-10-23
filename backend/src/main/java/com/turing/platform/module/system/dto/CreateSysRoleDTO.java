package com.turing.platform.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateSysRoleDTO {

    @NotBlank(message = "角色编码不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9_]{2,32}$", message = "角色编码须为 2-32 位字母/数字/下划线")
    private String code;

    @NotBlank(message = "角色名称不能为空")
    @Size(max = 64, message = "角色名称最长 64 字符")
    private String name;

    @Size(max = 255, message = "备注最长 255 字符")
    private String remark;

    /** 关联的菜单/权限点 ID 列表（可为空） */
    private List<Long> menuIds;
}

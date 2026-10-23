package com.turing.platform.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateSysRoleDTO {

    @NotNull(message = "角色 ID 不能为空")
    private Long id;

    @NotBlank(message = "角色名称不能为空")
    @Size(max = 64, message = "角色名称最长 64 字符")
    private String name;

    @Size(max = 255, message = "备注最长 255 字符")
    private String remark;

    /** 1=启用 0=停用 */
    @NotNull(message = "状态不能为空")
    private Integer status;

    /** 关联的菜单/权限点 ID 列表；null 表示不调整权限 */
    private List<Long> menuIds;
}

package com.turing.platform.module.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSysMenuDTO {

    @NotNull(message = "父级 ID 不能为空（根节点传 0）")
    private Long parentId;

    /** M=目录 C=菜单 F=按钮/权限点 */
    @NotBlank(message = "类型不能为空")
    @Pattern(regexp = "^[MCF]$", message = "类型取值 M/C/F")
    private String type;

    @NotBlank(message = "名称不能为空")
    @Size(max = 64, message = "名称最长 64 字符")
    private String name;

    @Size(max = 128, message = "权限标识最长 128 字符")
    private String permission;

    @Size(max = 255, message = "路径最长 255 字符")
    private String path;

    private Integer sort;

    /** 1=启用 0=停用 */
    private Integer status;
}

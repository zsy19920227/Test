package com.turing.platform.module.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UpdateSysUserDTO {

    @NotNull(message = "用户 ID 不能为空")
    private Long id;

    @NotBlank(message = "昵称不能为空")
    private String nickname;

    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "状态不能为空")
    @Min(value = 0, message = "状态取值 0/1")
    @Max(value = 1, message = "状态取值 0/1")
    private Integer status;

    /** 重新分配的角色 ID 列表；null 表示不调整角色 */
    private List<Long> roleIds;
}

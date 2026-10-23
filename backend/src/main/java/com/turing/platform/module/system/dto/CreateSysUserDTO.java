package com.turing.platform.module.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class CreateSysUserDTO {

    @NotBlank(message = "用户名不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9_]{3,32}$", message = "用户名须为 3-32 位字母/数字/下划线")
    private String username;

    @NotBlank(message = "昵称不能为空")
    private String nickname;

    @Email(message = "邮箱格式不正确")
    private String email;

    /** 不填则使用默认密码 Turing@123 */
    private String password;

    /** 分配的角色 ID 列表（可为空） */
    private List<Long> roleIds;
}

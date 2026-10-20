package com.turing.platform.module.system.controller;

import com.turing.platform.common.api.PageResult;
import com.turing.platform.common.api.Result;
import com.turing.platform.module.system.dto.CreateSysUserDTO;
import com.turing.platform.module.system.dto.UpdateSysUserDTO;
import com.turing.platform.module.system.service.SysUserService;
import com.turing.platform.module.system.vo.SysUserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 系统用户管理：RBAC 方法级鉴权示例。
 * admin 角色拥有全部权限；viewer 角色仅 system:user:list。
 */
@Tag(name = "系统用户管理", description = "分页/新增/更新/删除，均需对应权限标识")
@RestController
@RequestMapping("/system/users")
@RequiredArgsConstructor
public class SysUserController {

    private final SysUserService sysUserService;

    @Operation(summary = "分页查询用户")
    @GetMapping("/page")
    @PreAuthorize("hasAuthority('system:user:list')")
    public Result<PageResult<SysUserVO>> page(@RequestParam(defaultValue = "1") long current,
                                              @RequestParam(defaultValue = "10") long size,
                                              @RequestParam(required = false) String keyword) {
        return Result.success(sysUserService.pageUsers(current, size, keyword));
    }

    @Operation(summary = "查询单个用户")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:list')")
    public Result<SysUserVO> get(@PathVariable Long id) {
        return Result.success(sysUserService.getUserById(id));
    }

    @Operation(summary = "新增用户", description = "密码缺省为 Turing@123")
    @PostMapping
    @PreAuthorize("hasAuthority('system:user:add')")
    public Result<Void> create(@Valid @RequestBody CreateSysUserDTO dto) {
        sysUserService.createUser(dto);
        return Result.success();
    }

    @Operation(summary = "更新用户")
    @PutMapping
    @PreAuthorize("hasAuthority('system:user:edit')")
    public Result<Void> update(@Valid @RequestBody UpdateSysUserDTO dto) {
        sysUserService.updateUser(dto);
        return Result.success();
    }

    @Operation(summary = "删除用户（逻辑删除）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:remove')")
    public Result<Void> remove(@PathVariable Long id) {
        sysUserService.deleteUser(id);
        return Result.success();
    }
}

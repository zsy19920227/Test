package com.turing.platform.module.system.controller;

import com.turing.platform.common.api.PageResult;
import com.turing.platform.common.api.Result;
import com.turing.platform.module.system.dto.CreateSysRoleDTO;
import com.turing.platform.module.system.dto.UpdateSysRoleDTO;
import com.turing.platform.module.system.service.SysRoleService;
import com.turing.platform.module.system.vo.SysRoleVO;
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

import java.util.List;

/**
 * 系统角色管理：CRUD + 权限（菜单/按钮）绑定。
 */
@Tag(name = "系统角色管理", description = "角色增删改查、启用停用、菜单/权限点绑定")
@RestController
@RequestMapping("/system/roles")
@RequiredArgsConstructor
public class SysRoleController {

    private final SysRoleService sysRoleService;

    @Operation(summary = "分页查询角色")
    @GetMapping("/page")
    @PreAuthorize("hasAuthority('system:role:list')")
    public Result<PageResult<SysRoleVO>> page(@RequestParam(defaultValue = "1") long current,
                                               @RequestParam(defaultValue = "10") long size,
                                               @RequestParam(required = false) String keyword) {
        return Result.success(sysRoleService.pageRoles(current, size, keyword));
    }

    @Operation(summary = "全部启用角色", description = "用户分配角色等下拉选择用")
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('system:role:list') or hasAuthority('system:user:list')")
    public Result<List<SysRoleVO>> all() {
        return Result.success(sysRoleService.listEnabled());
    }

    @Operation(summary = "新增角色", description = "可同时绑定菜单/权限点")
    @PostMapping
    @PreAuthorize("hasAuthority('system:role:add')")
    public Result<Void> create(@Valid @RequestBody CreateSysRoleDTO dto) {
        sysRoleService.createRole(dto);
        return Result.success();
    }

    @Operation(summary = "更新角色", description = "menuIds 非 null 时同步调整权限绑定")
    @PutMapping
    @PreAuthorize("hasAuthority('system:role:edit')")
    public Result<Void> update(@Valid @RequestBody UpdateSysRoleDTO dto) {
        sysRoleService.updateRole(dto);
        return Result.success();
    }

    @Operation(summary = "删除角色", description = "被用户引用时拒绝")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:role:remove')")
    public Result<Void> remove(@PathVariable Long id) {
        sysRoleService.deleteRole(id);
        return Result.success();
    }

    @Operation(summary = "查询角色已绑定的菜单/权限点 ID")
    @GetMapping("/{id}/menuIds")
    @PreAuthorize("hasAuthority('system:role:edit')")
    public Result<List<Long>> menuIds(@PathVariable Long id) {
        return Result.success(sysRoleService.getRoleMenuIds(id));
    }
}

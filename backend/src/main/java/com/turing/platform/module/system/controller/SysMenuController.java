package com.turing.platform.module.system.controller;

import com.turing.platform.common.api.Result;
import com.turing.platform.module.system.dto.CreateSysMenuDTO;
import com.turing.platform.module.system.dto.UpdateSysMenuDTO;
import com.turing.platform.module.system.service.SysMenuService;
import com.turing.platform.module.system.vo.MenuTreeNode;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 系统菜单/权限点管理：树形 CRUD。
 */
@Tag(name = "系统菜单管理", description = "目录/菜单/按钮三类节点的树形增删改查")
@RestController
@RequestMapping("/system/menus")
@RequiredArgsConstructor
public class SysMenuController {

    private final SysMenuService sysMenuService;

    @Operation(summary = "全量菜单树", description = "菜单管理页与角色分配权限抽屉共用")
    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('system:menu:list') or hasAuthority('system:role:edit')")
    public Result<List<MenuTreeNode>> tree() {
        return Result.success(sysMenuService.getMenuTree());
    }

    @Operation(summary = "新增菜单/权限点")
    @PostMapping
    @PreAuthorize("hasAuthority('system:menu:add')")
    public Result<Void> create(@Valid @RequestBody CreateSysMenuDTO dto) {
        sysMenuService.createMenu(dto);
        return Result.success();
    }

    @Operation(summary = "更新菜单/权限点")
    @PutMapping
    @PreAuthorize("hasAuthority('system:menu:edit')")
    public Result<Void> update(@Valid @RequestBody UpdateSysMenuDTO dto) {
        sysMenuService.updateMenu(dto);
        return Result.success();
    }

    @Operation(summary = "删除菜单/权限点", description = "存在子节点时拒绝")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:menu:remove')")
    public Result<Void> remove(@PathVariable Long id) {
        sysMenuService.deleteMenu(id);
        return Result.success();
    }
}

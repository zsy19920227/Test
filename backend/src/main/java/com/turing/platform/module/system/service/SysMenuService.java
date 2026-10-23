package com.turing.platform.module.system.service;

import com.baomidou.mybatisplus.spring.service.IService;
import com.turing.platform.module.system.dto.CreateSysMenuDTO;
import com.turing.platform.module.system.dto.UpdateSysMenuDTO;
import com.turing.platform.module.system.entity.SysMenu;
import com.turing.platform.module.system.vo.MenuTreeNode;

import java.util.List;

/**
 * 系统菜单/权限点服务。
 */
public interface SysMenuService extends IService<SysMenu> {

    /** 全量菜单树（目录/菜单/按钮，含停用项，管理页用） */
    List<MenuTreeNode> getMenuTree();

    /** 新增菜单/权限点 */
    void createMenu(CreateSysMenuDTO dto);

    /** 更新菜单/权限点（不允许把自己挂到自己的子树下） */
    void updateMenu(UpdateSysMenuDTO dto);

    /** 删除菜单/权限点（有子节点拒绝） */
    void deleteMenu(Long id);
}

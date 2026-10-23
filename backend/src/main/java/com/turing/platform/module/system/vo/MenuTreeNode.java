package com.turing.platform.module.system.vo;

import java.util.ArrayList;
import java.util.List;

/**
 * 菜单树节点，对应前端 SysMenuNode 接口（含 children 递归结构）。
 */
public record MenuTreeNode(
        Long id,
        Long parentId,
        String type,
        String name,
        String permission,
        String path,
        Integer sort,
        Integer status,
        List<MenuTreeNode> children) {

    public MenuTreeNode {
        children = children == null ? new ArrayList<>() : children;
    }
}

package com.turing.platform.module.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.spring.service.impl.ServiceImpl;
import com.turing.platform.common.exception.BusinessException;
import com.turing.platform.module.system.dto.CreateSysMenuDTO;
import com.turing.platform.module.system.dto.UpdateSysMenuDTO;
import com.turing.platform.module.system.entity.SysMenu;
import com.turing.platform.module.system.entity.SysRoleMenu;
import com.turing.platform.module.system.mapper.SysMenuMapper;
import com.turing.platform.module.system.mapper.SysRoleMenuMapper;
import com.turing.platform.module.system.service.SysMenuService;
import com.turing.platform.module.system.vo.MenuTreeNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysMenuServiceImpl extends ServiceImpl<SysMenuMapper, SysMenu> implements SysMenuService {

    private final SysRoleMenuMapper sysRoleMenuMapper;

    @Override
    public List<MenuTreeNode> getMenuTree() {
        List<SysMenu> all = lambdaQuery().orderByAsc(SysMenu::getSort).orderByAsc(SysMenu::getId).list();
        Map<Long, List<SysMenu>> byParent = all.stream()
                .collect(Collectors.groupingBy(SysMenu::getParentId));
        return buildChildren(0L, byParent);
    }

    /** 递归组装子树（MenuTreeNode 是不可变 record，构建时挂 children） */
    private static List<MenuTreeNode> buildChildren(Long parentId, Map<Long, List<SysMenu>> byParent) {
        return byParent.getOrDefault(parentId, List.of()).stream()
                .map(m -> new MenuTreeNode(m.getId(), m.getParentId(), m.getType(), m.getName(),
                        m.getPermission(), m.getPath(), m.getSort(), m.getStatus(),
                        buildChildren(m.getId(), byParent)))
                .toList();
    }

    @Override
    public void createMenu(CreateSysMenuDTO dto) {
        if (dto.getParentId() != 0 && getById(dto.getParentId()) == null) {
            throw new BusinessException("父级菜单不存在");
        }
        validateTypeRule(dto.getType(), dto.getPermission(), dto.getPath());
        SysMenu menu = new SysMenu();
        menu.setParentId(dto.getParentId());
        menu.setType(dto.getType());
        menu.setName(dto.getName());
        menu.setPermission(dto.getPermission());
        menu.setPath(dto.getPath());
        menu.setSort(dto.getSort() == null ? 0 : dto.getSort());
        menu.setStatus(dto.getStatus() == null ? 1 : dto.getStatus());
        save(menu);
        log.info("新增菜单: {} ({})", dto.getName(), menu.getId());
    }

    @Override
    public void updateMenu(UpdateSysMenuDTO dto) {
        SysMenu menu = getById(dto.getId());
        if (menu == null) {
            throw new BusinessException("菜单不存在");
        }
        if (dto.getParentId() != 0 && getById(dto.getParentId()) == null) {
            throw new BusinessException("父级菜单不存在");
        }
        if (dto.getParentId().equals(dto.getId())) {
            throw new BusinessException("父级不能是自己");
        }
        if (isDescendant(dto.getId(), dto.getParentId())) {
            throw new BusinessException("不能把自己的子节点设为父级");
        }
        validateTypeRule(dto.getType(), dto.getPermission(), dto.getPath());
        menu.setParentId(dto.getParentId());
        menu.setType(dto.getType());
        menu.setName(dto.getName());
        menu.setPermission(dto.getPermission());
        menu.setPath(dto.getPath());
        menu.setSort(dto.getSort() == null ? 0 : dto.getSort());
        menu.setStatus(dto.getStatus() == null ? 1 : dto.getStatus());
        updateById(menu);
        log.info("更新菜单: {} ({})", dto.getName(), dto.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMenu(Long id) {
        if (getById(id) == null) {
            throw new BusinessException("菜单不存在");
        }
        Long childCount = lambdaQuery().eq(SysMenu::getParentId, id).count();
        if (childCount != null && childCount > 0) {
            throw new BusinessException("存在子菜单/权限点，请先删除子节点");
        }
        removeById(id);
        sysRoleMenuMapper.delete(new LambdaQueryWrapper<SysRoleMenu>().eq(SysRoleMenu::getMenuId, id));
        log.info("删除菜单: {}", id);
    }

    /** F=按钮必须带权限标识；C=菜单必须带路由路径 */
    private static void validateTypeRule(String type, String permission, String path) {
        if ("F".equals(type) && !StringUtils.hasText(permission)) {
            throw new BusinessException("按钮/权限点必须填写权限标识");
        }
        if ("C".equals(type) && !StringUtils.hasText(path)) {
            throw new BusinessException("菜单必须填写路由路径");
        }
    }

    /** parentId 是否为 id 的后代节点 */
    private boolean isDescendant(Long id, Long parentId) {
        Long cursor = parentId;
        int guard = 0;
        while (cursor != null && cursor != 0 && guard < 100) {
            if (cursor.equals(id)) {
                return true;
            }
            SysMenu parent = getById(cursor);
            cursor = parent == null ? null : parent.getParentId();
            guard++;
        }
        return false;
    }
}
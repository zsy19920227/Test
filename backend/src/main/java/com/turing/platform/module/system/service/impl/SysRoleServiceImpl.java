package com.turing.platform.module.system.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.spring.service.impl.ServiceImpl;
import com.turing.platform.common.api.PageResult;
import com.turing.platform.common.exception.BusinessException;
import com.turing.platform.module.system.dto.CreateSysRoleDTO;
import com.turing.platform.module.system.dto.UpdateSysRoleDTO;
import com.turing.platform.module.system.entity.SysRole;
import com.turing.platform.module.system.entity.SysRoleMenu;
import com.turing.platform.module.system.entity.SysUserRole;
import com.turing.platform.module.system.mapper.SysRoleMapper;
import com.turing.platform.module.system.mapper.SysRoleMenuMapper;
import com.turing.platform.module.system.mapper.SysUserRoleMapper;
import com.turing.platform.module.system.service.SysRoleService;
import com.turing.platform.module.system.vo.SysRoleVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements SysRoleService {

    /** 内置超级管理员角色 ID（权限不可修改、不可删除） */
    public static final long BUILT_IN_ADMIN_ROLE_ID = 1L;

    private final SysUserRoleMapper sysUserRoleMapper;
    private final SysRoleMenuMapper sysRoleMenuMapper;

    @Override
    public PageResult<SysRoleVO> pageRoles(long current, long size, String keyword) {
        Page<SysRole> page = lambdaQuery()
                .and(StringUtils.hasText(keyword), w -> w
                        .like(SysRole::getCode, keyword)
                        .or()
                        .like(SysRole::getName, keyword))
                .orderByAsc(SysRole::getId)
                .page(new Page<>(current, size));
        List<SysRoleVO> records = page.getRecords().stream().map(SysRoleServiceImpl::toVO).toList();
        return new PageResult<>(records, page.getTotal(), page.getCurrent(), page.getSize());
    }

    @Override
    public List<SysRoleVO> listEnabled() {
        return lambdaQuery()
                .eq(SysRole::getStatus, 1)
                .orderByAsc(SysRole::getId)
                .list()
                .stream()
                .map(SysRoleServiceImpl::toVO)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createRole(CreateSysRoleDTO dto) {
        boolean exists = lambdaQuery().eq(SysRole::getCode, dto.getCode()).count() > 0;
        if (exists) {
            throw new BusinessException("角色编码已存在: " + dto.getCode());
        }
        SysRole role = new SysRole();
        role.setCode(dto.getCode());
        role.setName(dto.getName());
        role.setRemark(dto.getRemark());
        role.setStatus(1);
        save(role);
        saveRoleMenus(role.getId(), dto.getMenuIds());
        log.info("新增角色: {} ({})", dto.getCode(), role.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRole(UpdateSysRoleDTO dto) {
        SysRole role = getById(dto.getId());
        if (role == null) {
            throw new BusinessException("角色不存在");
        }
        role.setName(dto.getName());
        role.setRemark(dto.getRemark());
        role.setStatus(dto.getStatus());
        updateById(role);
        if (dto.getMenuIds() != null) {
            if (isBuiltInAdmin(role)) {
                throw new BusinessException("内置管理员角色的权限不可修改");
            }
            sysRoleMenuMapper.delete(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRoleMenu>()
                            .eq(SysRoleMenu::getRoleId, role.getId()));
            saveRoleMenus(role.getId(), dto.getMenuIds());
        }
        log.info("更新角色: {} ({})", role.getCode(), role.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRole(Long id) {
        SysRole role = getById(id);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }
        if (isBuiltInAdmin(role)) {
            throw new BusinessException("内置管理员角色不可删除");
        }
        Long userCount = sysUserRoleMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getRoleId, id));
        if (userCount != null && userCount > 0) {
            throw new BusinessException("角色已被 " + userCount + " 个用户使用，请先解除绑定");
        }
        removeById(id);
        sysRoleMenuMapper.delete(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRoleMenu>()
                        .eq(SysRoleMenu::getRoleId, id));
        log.info("删除角色: {} ({})", role.getCode(), id);
    }

    @Override
    public List<Long> getRoleMenuIds(Long id) {
        if (getById(id) == null) {
            throw new BusinessException("角色不存在");
        }
        return sysRoleMenuMapper.selectList(
                        new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysRoleMenu>()
                                .eq(SysRoleMenu::getRoleId, id))
                .stream()
                .map(SysRoleMenu::getMenuId)
                .toList();
    }

    private void saveRoleMenus(Long roleId, List<Long> menuIds) {
        if (CollectionUtils.isEmpty(menuIds)) {
            return;
        }
        for (Long menuId : menuIds) {
            SysRoleMenu rm = new SysRoleMenu();
            rm.setRoleId(roleId);
            rm.setMenuId(menuId);
            sysRoleMenuMapper.insert(rm);
        }
    }

    private static boolean isBuiltInAdmin(SysRole role) {
        return BUILT_IN_ADMIN_ROLE_ID == role.getId() || "admin".equals(role.getCode());
    }

    private static SysRoleVO toVO(SysRole role) {
        return new SysRoleVO(role.getId(), role.getCode(), role.getName(),
                role.getStatus(), role.getRemark(), role.getCreateTime());
    }
}

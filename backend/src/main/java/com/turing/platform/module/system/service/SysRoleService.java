package com.turing.platform.module.system.service;

import com.baomidou.mybatisplus.spring.service.IService;
import com.turing.platform.common.api.PageResult;
import com.turing.platform.module.system.dto.CreateSysRoleDTO;
import com.turing.platform.module.system.dto.UpdateSysRoleDTO;
import com.turing.platform.module.system.entity.SysRole;
import com.turing.platform.module.system.vo.SysRoleVO;

import java.util.List;

/**
 * 系统角色服务。
 */
public interface SysRoleService extends IService<SysRole> {

    /** 分页查询角色（关键字匹配编码/名称） */
    PageResult<SysRoleVO> pageRoles(long current, long size, String keyword);

    /** 全部启用角色（下拉选择用） */
    List<SysRoleVO> listEnabled();

    /** 新增角色（可同时绑定菜单/权限点） */
    void createRole(CreateSysRoleDTO dto);

    /** 更新角色（menuIds 非 null 时同步调整权限；编码不可修改） */
    void updateRole(UpdateSysRoleDTO dto);

    /** 删除角色（逻辑删除；有用户引用或内置角色拒绝） */
    void deleteRole(Long id);

    /** 查询角色已绑定的菜单/权限点 ID 列表 */
    List<Long> getRoleMenuIds(Long id);
}

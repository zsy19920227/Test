package com.turing.platform.module.system.service;

import com.baomidou.mybatisplus.spring.service.IService;
import com.turing.platform.common.api.PageResult;
import com.turing.platform.module.system.dto.CreateSysUserDTO;
import com.turing.platform.module.system.dto.UpdateSysUserDTO;
import com.turing.platform.module.system.entity.SysUser;
import com.turing.platform.module.system.vo.SysUserVO;
import com.turing.platform.security.LoginUser;

/**
 * 系统用户服务。
 */
public interface SysUserService extends IService<SysUser> {

    /** 按用户名加载登录用户（含角色/权限），不存在返回 null */
    LoginUser loadLoginUserByUsername(String username);

    /** 分页查询用户（含角色编码聚合） */
    PageResult<SysUserVO> pageUsers(long current, long size, String keyword);

    /** 按 ID 查询用户详情 */
    SysUserVO getUserById(Long id);

    /** 新增用户（密码 BCrypt 加密，缺省使用默认密码） */
    void createUser(CreateSysUserDTO dto);

    /** 更新用户基本信息 */
    void updateUser(UpdateSysUserDTO dto);

    /** 删除用户（逻辑删除） */
    void deleteUser(Long id);
}

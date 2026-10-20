package com.turing.platform.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.turing.platform.module.system.dto.SysUserRow;
import com.turing.platform.module.system.entity.SysUser;
import org.apache.ibatis.annotations.Param;

/**
 * 用户 Mapper：BaseMapper 提供 CRUD，selectUserPage 演示 XML 自定义分页查询。
 */
public interface SysUserMapper extends BaseMapper<SysUser> {

    /**
     * 分页查询用户（含角色编码聚合，一次查询避免 N+1）。
     *
     * @param page    分页参数（由 MyBatis Plus 分页插件注入 limit/count）
     * @param keyword 用户名/昵称模糊关键字，可空
     */
    IPage<SysUserRow> selectUserPage(IPage<SysUserRow> page, @Param("keyword") String keyword);
}

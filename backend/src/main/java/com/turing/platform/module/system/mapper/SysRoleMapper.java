package com.turing.platform.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.turing.platform.module.system.entity.SysRole;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysRoleMapper extends BaseMapper<SysRole> {

    /** 查询用户拥有的角色编码（启用状态） */
    List<String> selectCodesByUserId(@Param("userId") Long userId);
}

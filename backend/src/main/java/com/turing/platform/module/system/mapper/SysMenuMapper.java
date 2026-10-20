package com.turing.platform.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.turing.platform.module.system.entity.SysMenu;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface SysMenuMapper extends BaseMapper<SysMenu> {

    /** 查询用户拥有的权限标识（去重，启用状态） */
    List<String> selectPermissionsByUserId(@Param("userId") Long userId);
}

package com.turing.platform.module.system.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.spring.service.impl.ServiceImpl;
import com.turing.platform.common.api.PageResult;
import com.turing.platform.common.exception.BusinessException;
import com.turing.platform.module.system.dto.CreateSysUserDTO;
import com.turing.platform.module.system.dto.SysUserRow;
import com.turing.platform.module.system.dto.UpdateSysUserDTO;
import com.turing.platform.module.system.entity.SysUser;
import com.turing.platform.module.system.mapper.SysMenuMapper;
import com.turing.platform.module.system.mapper.SysRoleMapper;
import com.turing.platform.module.system.mapper.SysUserMapper;
import com.turing.platform.module.system.service.SysUserService;
import com.turing.platform.module.system.vo.SysUserVO;
import com.turing.platform.security.LoginUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    /** 新用户默认密码（首次登录后应修改） */
    public static final String DEFAULT_PASSWORD = "Turing@123";

    private final SysRoleMapper sysRoleMapper;
    private final SysMenuMapper sysMenuMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginUser loadLoginUserByUsername(String username) {
        SysUser user = lambdaQuery().eq(SysUser::getUsername, username).one();
        if (user == null) {
            return null;
        }
        List<String> roles = sysRoleMapper.selectCodesByUserId(user.getId());
        List<String> permissions = sysMenuMapper.selectPermissionsByUserId(user.getId());
        return LoginUser.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .password(user.getPassword())
                .enabled(user.getStatus() != null && user.getStatus() == 1)
                .roles(roles)
                .permissions(permissions)
                .build();
    }

    @Override
    public PageResult<SysUserVO> pageUsers(long current, long size, String keyword) {
        Page<SysUserRow> page = new Page<>(current, size);
        IPage<SysUserRow> result = baseMapper.selectUserPage(page, keyword);
        List<SysUserVO> records = result.getRecords().stream().map(SysUserServiceImpl::toVO).toList();
        return new PageResult<>(records, result.getTotal(), result.getCurrent(), result.getSize());
    }

    @Override
    public SysUserVO getUserById(Long id) {
        SysUser user = getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        List<String> roles = sysRoleMapper.selectCodesByUserId(id);
        return new SysUserVO(user.getId(), user.getUsername(), user.getNickname(),
                user.getEmail(), user.getStatus(), roles, user.getCreateTime());
    }

    @Override
    public void createUser(CreateSysUserDTO dto) {
        boolean exists = lambdaQuery().eq(SysUser::getUsername, dto.getUsername()).count() > 0;
        if (exists) {
            throw new BusinessException("用户名已存在: " + dto.getUsername());
        }
        SysUser user = new SysUser();
        user.setUsername(dto.getUsername());
        user.setNickname(dto.getNickname());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(
                StringUtils.hasText(dto.getPassword()) ? dto.getPassword() : DEFAULT_PASSWORD));
        user.setStatus(1);
        save(user);
        log.info("新增用户: {}", dto.getUsername());
    }

    @Override
    public void updateUser(UpdateSysUserDTO dto) {
        SysUser user = getById(dto.getId());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setNickname(dto.getNickname());
        user.setEmail(dto.getEmail());
        user.setStatus(dto.getStatus());
        updateById(user);
        log.info("更新用户: {} ({})", user.getUsername(), user.getId());
    }

    @Override
    public void deleteUser(Long id) {
        // @TableLogic 逻辑删除
        if (!removeById(id)) {
            throw new BusinessException("用户不存在");
        }
        log.info("删除用户: {}", id);
    }

    /** SysUserRow(roleCodes 逗号串) -> SysUserVO(roleCodes 列表) */
    private static SysUserVO toVO(SysUserRow row) {
        List<String> roleCodes = !StringUtils.hasText(row.getRoleCodes())
                ? List.of()
                : Arrays.stream(row.getRoleCodes().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();
        return new SysUserVO(row.getId(), row.getUsername(), row.getNickname(),
                row.getEmail(), row.getStatus(), roleCodes, row.getCreateTime());
    }
}

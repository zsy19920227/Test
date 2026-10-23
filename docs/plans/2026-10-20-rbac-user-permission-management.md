# 计划：基础用户权限管理系统（用户 CRUD + 角色管理 + 按钮级权限）

日期：2026-10-20 ｜ 类型：新功能 ｜ 状态：已完成（全部门槛通过，2026-10-20）

## 需求结论（brainstorming）

在既有 RBAC 表（sys_user / sys_role / sys_menu / sys_user_role / sys_role_menu）与 JWT 方法级鉴权基础上补全：

1. 用户增删改查（含给用户分配角色）——接口已有，前端缺失操作按钮。
2. 角色管理：角色 CRUD + 给角色分配权限（菜单/按钮树勾选）。
3. 菜单/权限点管理：树形 CRUD（目录/菜单/按钮三类）。
4. 按钮级权限控制：只读用户（viewer）在前端看不到（且后端 403 拦截）删除/编辑等操作按钮。

不引入新依赖；不改端口/主题/镜像等锁定项。

## 设计要点

- 权限点新增：`system:role:list/add/edit/remove`、`system:menu:list/add/edit/remove`，登记进 sys_menu（type=F）。
- 后端：SysRoleController/Service、SysMenuController/Service、SysUserRole/SysRoleMenu 关联实体；Create/UpdateSysUserDTO 增加 roleIds；SysUserVO 增加 roleIds；自我删除/内置 admin/内置角色保护。
- 菜单树接口同时服务「菜单管理页」和「角色分配权限抽屉」，鉴权 `or` 表达式。
- 前端：`src/hooks/usePermission.ts`（admin 角色视为全权限通配）；用户/角色/菜单三个管理页全部按钮按权限渲染；侧栏菜单按权限过滤；api/role.ts、api/menu.ts、types.ts 扩展。
- 既有库增量迁移 SQL（幂等），init.sql 同步更新。

## 任务分解与验证标准

| # | 任务 | 验证标准 |
|---|---|---|
| 1 | 后端：关联实体 + Mapper + 角色/菜单 DTO/VO/Service/Controller | `./mvnw.cmd clean package -DskipTests` BUILD SUCCESS |
| 2 | 后端：用户创建/更新支持 roleIds + 保护逻辑 | 同上；E2E 创建带角色用户 |
| 3 | init.sql 更新 + 运行库增量迁移 | mysql 查询 menu 数 = 16、admin 角色菜单数 = 16 |
| 4 | 前端：usePermission + api/role/menu + types | `npm run lint` 0/0，`npm run build` 成功 |
| 5 | 前端：用户管理 CRUD（角色分配、按钮权限） | 浏览器冒烟：admin 可增改删，viewer 无操作列 |
| 6 | 前端：角色管理页（CRUD + 权限树抽屉） | admin 分配权限后生效 |
| 7 | 前端：菜单管理页（树形 CRUD） | 新增权限点/菜单成功并可见 |
| 8 | E2E：admin 全流程 + viewer 只读（UI 隐藏 + API 403） | 浏览器 DOM 验证 + curl 403 |

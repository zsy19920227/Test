-- ============================================================
-- 增量迁移：权限管理系统（角色管理 / 菜单管理权限点）
-- 适用：已执行过旧版 init.sql 的库。幂等：可重复执行。
-- 日期：2026-10-20
-- ============================================================
USE turing_platform;

-- 角色管理 / 菜单管理 菜单与按钮权限点（显式 ID，与 init.sql 对齐）
INSERT IGNORE INTO sys_menu (id, parent_id, type, name, permission, path, sort, status) VALUES
(7, 1, 'C', '角色管理', NULL, '/system/roles', 2, 1),
(8, 7, 'F', '角色查询', 'system:role:list', NULL, 1, 1),
(9, 7, 'F', '角色新增', 'system:role:add', NULL, 2, 1),
(10, 7, 'F', '角色编辑', 'system:role:edit', NULL, 3, 1),
(11, 7, 'F', '角色删除', 'system:role:remove', NULL, 4, 1),
(12, 1, 'C', '菜单管理', NULL, '/system/menus', 3, 1),
(13, 12, 'F', '菜单查询', 'system:menu:list', NULL, 1, 1),
(14, 12, 'F', '菜单新增', 'system:menu:add', NULL, 2, 1),
(15, 12, 'F', '菜单编辑', 'system:menu:edit', NULL, 3, 1),
(16, 12, 'F', '菜单删除', 'system:menu:remove', NULL, 4, 1);

-- admin 角色绑定全部新权限点（viewer 保持仅查询）
INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES
(1, 7), (1, 8), (1, 9), (1, 10), (1, 11),
(1, 12), (1, 13), (1, 14), (1, 15), (1, 16);

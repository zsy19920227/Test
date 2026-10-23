-- ============================================================
-- 图灵测试平台 - 数据库初始化脚本（MySQL 8.0+）
-- 执行方式：mysql -uroot -p < init.sql
-- 演示账号：
--   admin  / Admin@123  （管理员，全部权限）
--   viewer / Viewer@123 （观察者，仅查询权限）
-- ============================================================

CREATE DATABASE IF NOT EXISTS turing_platform
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE turing_platform;

-- ------------------------------------------------------------
-- 用户表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    username    VARCHAR(32)  NOT NULL COMMENT '登录名',
    password    VARCHAR(100) NOT NULL COMMENT 'BCrypt 密码',
    nickname    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '昵称',
    email       VARCHAR(128)          DEFAULT NULL COMMENT '邮箱',
    status      TINYINT      NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删 1=已删',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='系统用户';

-- ------------------------------------------------------------
-- 角色表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    code        VARCHAR(32) NOT NULL COMMENT '角色编码',
    name        VARCHAR(64) NOT NULL COMMENT '角色名称',
    status      TINYINT     NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
    remark      VARCHAR(255)         DEFAULT NULL COMMENT '备注',
    deleted     TINYINT     NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='系统角色';

-- ------------------------------------------------------------
-- 菜单/权限表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS sys_menu;
CREATE TABLE sys_menu (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
    parent_id   BIGINT       NOT NULL DEFAULT 0 COMMENT '父级ID，0=根',
    type        CHAR(1)      NOT NULL COMMENT 'M=目录 C=菜单 F=按钮/权限点',
    name        VARCHAR(64)  NOT NULL COMMENT '名称',
    permission  VARCHAR(128)          DEFAULT NULL COMMENT '权限标识，如 system:user:list',
    path        VARCHAR(255)          DEFAULT NULL COMMENT '前端路由路径',
    sort        INT          NOT NULL DEFAULT 0 COMMENT '排序',
    status      TINYINT      NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='系统菜单/权限';

-- ------------------------------------------------------------
-- 用户-角色关联表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS sys_user_role;
CREATE TABLE sys_user_role (
    id      BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_role (user_id, role_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='用户-角色关联';

-- ------------------------------------------------------------
-- 角色-菜单关联表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS sys_role_menu;
CREATE TABLE sys_role_menu (
    id      BIGINT NOT NULL AUTO_INCREMENT,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    menu_id BIGINT NOT NULL COMMENT '菜单ID',
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_menu (role_id, menu_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='角色-菜单关联';

-- ============================================================
-- 初始化数据
-- ============================================================

-- 角色
INSERT INTO sys_role (id, code, name, status, remark) VALUES
(1, 'admin',  '管理员', 1, '拥有全部权限'),
(2, 'viewer', '观察者', 1, '仅查询权限');

-- 菜单与权限点
INSERT INTO sys_menu (id, parent_id, type, name, permission, path, sort, status) VALUES
(1, 0, 'M', '系统管理',   NULL,                 '/system',       1, 1),
(2, 1, 'C', '用户管理',   NULL,                 '/system/users', 1, 1),
(3, 2, 'F', '用户查询',   'system:user:list',   NULL,           1, 1),
(4, 2, 'F', '用户新增',   'system:user:add',    NULL,           2, 1),
(5, 2, 'F', '用户编辑',   'system:user:edit',   NULL,           3, 1),
(6, 2, 'F', '用户删除',   'system:user:remove', NULL,           4, 1),
(7, 1, 'C', '角色管理',   NULL,                 '/system/roles', 2, 1),
(8, 7, 'F', '角色查询',   'system:role:list',   NULL,           1, 1),
(9, 7, 'F', '角色新增',   'system:role:add',    NULL,           2, 1),
(10, 7, 'F', '角色编辑',   'system:role:edit',   NULL,           3, 1),
(11, 7, 'F', '角色删除',   'system:role:remove', NULL,           4, 1),
(12, 1, 'C', '菜单管理',   NULL,                 '/system/menus', 3, 1),
(13, 12, 'F', '菜单查询',  'system:menu:list',   NULL,          1, 1),
(14, 12, 'F', '菜单新增',  'system:menu:add',    NULL,          2, 1),
(15, 12, 'F', '菜单编辑',  'system:menu:edit',   NULL,          3, 1),
(16, 12, 'F', '菜单删除',  'system:menu:remove', NULL,          4, 1);

-- 用户（BCrypt 哈希由 bcryptjs cost=10 实际生成）
INSERT INTO sys_user (id, username, password, nickname, email, status) VALUES
(1, 'admin',  '$2b$10$5eC/IVDwep9rjxbmmiN98uqKuy0kdEDMtEqoR2dkAfKLIerAUvgxC', '平台管理员', 'admin@turing.example.com',  1),
(2, 'viewer', '$2b$10$hxQctZhYgcJMhEH.uOj0VOLLMHxadVrJgZUaPBQOgPqZtBeWMYdv6', '只读用户',   'viewer@turing.example.com', 1);

-- 用户-角色
INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1),
(2, 2);

-- 角色-权限：admin 全量，viewer 仅查询
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
(1, 7), (1, 8), (1, 9), (1, 10), (1, 11),
(1, 12), (1, 13), (1, 14), (1, 15), (1, 16),
(2, 1), (2, 2), (2, 3);

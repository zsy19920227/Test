# 后端工程（Spring Boot 3.5 + MyBatis Plus 3.5 + MySQL 8 + Redis）

## 命令

```bash
mvn spring-boot:run                # 开发运行（默认 dev profile，端口 8081，context-path=/api）
mvn package -DskipTests            # 打包 → target/turing-platform.jar
mvn test                           # 运行测试（需本地 MySQL/Redis 可用）
```

依赖解析走华为云 Maven 镜像（已写入 `D:\软件\apache-maven-3.9.16\conf\settings.xml`）。

## 配置

| 文件 | 用途 |
|---|---|
| `application.yml` | 公共配置：端口、context-path=/api、MyBatis Plus、JWT、SpringDoc |
| `application-dev.yml` | 本地 MySQL/Redis 连接（root/root、localhost:6379） |
| `application-prod.yml` | 生产配置，全部通过环境变量注入（MYSQL_*、REDIS_*、TURING_JWT_SECRET） |

> JWT 密钥 HS256 要求 ≥ 32 字节。dev 有默认值；**生产必须设置 `TURING_JWT_SECRET`**。

## 架构约定

- **统一响应**：所有接口返回 `Result<T>`（code/message/data）；分页返回 `PageResult<T>`。
- **异常**：业务错误抛 `BusinessException`，由 `GlobalExceptionHandler` 统一处理；
  `@Valid` 校验失败自动返回 400 提示。
- **认证**：`POST /api/auth/login` 换取 JWT；后续请求携带 `Authorization: Bearer {token}`。
  每次请求实时从数据库加载权限（权限变更即时生效）；登出将 jti 写入 Redis 黑名单。
- **鉴权**：RBAC（sys_user / sys_role / sys_menu 三表 + 两张关联表），
  Controller 方法上 `@PreAuthorize("hasAuthority('system:user:list')")`。
- **MyBatis Plus**：实体逻辑删除（`deleted`）、`createTime/updateTime` 自动填充；
  简单 CRUD 用 BaseMapper/IService，复杂查询写 XML（见 `resources/mapper/`，
  `SysUserMapper.selectUserPage` 演示了自定义分页 + GROUP_CONCAT 聚合角色）。
- **新增业务模块**：复制 `module/system` 的目录结构（entity/mapper/service/controller/dto/vo），
  Mapper 放 `module/<name>/mapper` 会被 `@MapperScan("com.turing.platform.**.mapper")` 自动扫描。

## 数据库

首次初始化：

```bash
mysql -uroot -p < sql/init.sql
```

种子账号：`admin / Admin@123`（全部权限）、`viewer / Viewer@123`（仅查询）。

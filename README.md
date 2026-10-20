# 图灵测试平台 · Turing Test Platform

前后端分离的 Web 工程脚手架，提供登录认证（JWT + RBAC）、统一响应/异常、分页查询、API 文档、日志等基础能力，可直接在此基础上开发业务功能。

## 技术栈

### 前端（frontend/）

| 分类 | 选型 |
|---|---|
| 框架 | React 18.2 + TypeScript 5.3 |
| 构建 | Vite 5 |
| UI | **Ant Design 6**（@ant-design/icons 6）+ Tailwind CSS 3 |
| 状态管理 | Redux Toolkit（业务/服务端状态）+ Zustand（轻量 UI 状态） |
| 图标 | Lucide React |
| 图表 | Recharts |
| 其他 | Monaco Editor、React Flow、Mermaid |
| 路由 | React Router 6 |
| 请求 | Axios（统一拦截：token 注入 / Result 解包 / 401 跳转） |

### 后端（backend/）

| 分类 | 选型 |
|---|---|
| 框架 | Spring Boot 3.5（Java 21） |
| ORM | MyBatis Plus 3.5（分页插件 + 逻辑删除 + 字段自动填充） |
| 数据库 | MySQL 8.0+ |
| 缓存 | Redis（Lettuce + 连接池；token 登出黑名单） |
| 日志 | Log4j2（控制台 + 按天/大小滚动归档） |
| 文档 | SpringDoc OpenAPI（Swagger UI） |
| 认证 | Spring Security + JWT（jjwt）无状态认证 |
| 权限 | RBAC（用户-角色-权限），`@PreAuthorize` 方法级鉴权 |

## 目录结构

```
turing-test-platform/
├── frontend/                  # 前端工程
│   └── src/
│       ├── api/               # axios 封装 + 接口定义（与后端 Result/分页结构对应）
│       ├── components/        # 通用组件（AuthGuard 路由守卫等）
│       ├── layouts/           # BasicLayout（侧栏 + 顶栏）
│       ├── pages/             # 页面（登录/工作台/推理性能/组件示例/用户管理）
│       ├── router/            # 路由（重型页面懒加载）
│       ├── store/             # Redux Toolkit + Zustand
│       └── styles/            # 全局样式 + 设计 tokens（浅色 Data-Dashboard v4）
├── backend/                   # 后端工程（Maven）
│   └── src/main/
│       ├── java/com/turing/platform/
│       │   ├── common/        # Result/ResultCode/PageResult、全局异常、常量
│       │   ├── config/        # Security/Auth/MybatisPlus/Redis/OpenApi/WebMvc 配置
│       │   ├── security/      # JWT 过滤器、LoginUser、401/403 处理器
│       │   └── module/system/ # 系统模块：entity/mapper/service/controller/dto/vo
│       └── resources/
│           ├── application*.yml
│           ├── log4j2.xml
│           └── mapper/        # MyBatis XML（自定义分页 + 权限查询）
│   └── sql/init.sql           # 建库建表 + 种子数据
└── docker-compose.yml         # 本地一键 MySQL 8 + Redis 7
```

## 快速开始

### 0. 环境要求

- Node.js ≥ 18（npm 镜像已锁华为云：`frontend/.npmrc`）
- JDK 21，且 `JAVA_HOME` 指向它（Maven **无需安装**：仓库自带 wrapper 与华为云镜像配置）
- MySQL 8.0+ 与 Redis 7（推荐仓库根目录 `docker compose up -d` 一键起，也可本地自装）

### 1. 初始化数据库

```bash
mysql -uroot -p < backend/sql/init.sql
```

或使用 docker compose（首次启动自动执行 init.sql）：

```bash
docker compose up -d
```

### 2. 启动后端（默认 8081，在 backend/ 目录下）

```bash
# Windows（git-bash / cmd）
./mvnw.cmd spring-boot:run
# Linux / macOS
./mvnw spring-boot:run
```

> 数据库连接、Redis 地址、JWT 密钥见 `src/main/resources/application-dev.yml`。
> 生产环境用 `application-prod.yml` 并通过环境变量覆盖（TURING_JWT_SECRET 等）。

### 3. 启动前端（默认 5173，已配置 /api 代理到 8081）

```bash
cd frontend
npm install     # .npmrc 已指向华为云 npm 镜像
npm run dev
```

### 4. 访问

| 入口 | 地址 |
|---|---|
| 前端 | http://localhost:5173 |
| API 文档 | http://localhost:8081/api/swagger-ui.html |

演示账号（init.sql 种子数据）：

| 账号 | 密码 | 权限 |
|---|---|---|
| admin | Admin@123 | 全部（system:user:list/add/edit/remove） |
| viewer | Viewer@123 | 仅查询 system:user:list |

## 生产构建

```bash
# 前端：输出 frontend/dist
cd frontend && npm run build

# 后端：输出 backend/target/turing-platform.jar（在 backend/ 目录下）
./mvnw.cmd -B -ntp package -DskipTests     # Windows
./mvnw -B -ntp package -DskipTests         # Linux / macOS
java -jar target/turing-platform.jar --spring.profiles.active=prod
```

前端产物建议由 Nginx 托管，并将 `/api` 反向代理到后端 8081（与开发代理同构）。

## AI 代理协作

团队成员使用 AI 编码代理（Claude Code、Codex CLI、Cursor、GitHub Copilot、Hermes 等）时，规则统一收敛在根目录 **[AGENTS.md](AGENTS.md)**：

- 标准命令、质量门槛（lint 0 error / BUILD SUCCESS / UI 浏览器冒烟）、架构铁律与代理行为规范，对所有代理一视同仁；
- **开发流程统一走 superpowers 阶段门**（brainstorming → writing-plans → executing-plans、systematic-debugging、TDD、verification-before-completion、requesting-code-review）；superpowers 7.0.0 技能已随仓库内置（`.claude/skills/`），Claude Code 用户开箱即用，其他工具按同等纪律执行；
- 各工具入口文件（`CLAUDE.md`、`.cursor/rules/`、`.github/copilot-instructions.md`）均为 AGENTS.md 的薄引用，冲突时以 AGENTS.md 为准；
- 个人本机差异（JDK 路径等）写入各自 gitignored 的 `CLAUDE.local.md`，不进仓库。

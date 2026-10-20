# AGENTS.md — 图灵测试平台 · AI 代理协作指南

本文件是所有 AI 编码代理（Claude Code、Codex CLI、Cursor、GitHub Copilot、Hermes 等）在本仓库工作的**唯一权威规则源**。

- 人类协作者请读 [CONTRIBUTING.md](CONTRIBUTING.md)，项目概览见 [README.md](README.md)。
- 各工具专属文件（`CLAUDE.md`、`.cursor/rules/`、`.github/copilot-instructions.md`）都是本文件的薄引用；**规则冲突时以本文件为准**。
- 改本文件需经团队评审 —— 它直接影响所有人（和所有代理）的行为。

## 项目概览

前后端分离的 Web 工程脚手架（图灵测试平台）：

| 端 | 技术栈 | 目录 |
|---|---|---|
| 前端 | React 18 + TypeScript 5.3（strict）+ Vite 5 + Ant Design 6 + Tailwind 3 + RTK/Zustand + Recharts/Monaco/ReactFlow/Mermaid | `frontend/` |
| 后端 | Spring Boot 3.5（Java 21）+ MyBatis Plus 3.5 + MySQL 8 + Redis 7 + Spring Security + JWT/RBAC | `backend/` |

演示账号（`backend/sql/init.sql` 种子数据）：`admin/Admin@123`（全部权限）、`viewer/Viewer@123`（只读）。**后端端口固定 8081**（勿改；前端 `/api` 代理、全部文档均基于此）。

## 标准命令（所有代理统一使用，禁止自造变体）

前端命令在 `frontend/` 下执行；后端命令在 `backend/` 下执行（项目级 Maven 配置 `.mvn/settings.xml` 依赖相对路径，**必须在 backend/ 目录下运行 wrapper**）。

### 前端（frontend/）

| 目的 | 命令 | 成功标准 |
|---|---|---|
| 安装依赖 | `npm install` | 退出码 0（镜像已锁华为云，见 `frontend/.npmrc`，勿改回官方源） |
| 代码检查 | `npm run lint` | **0 error 0 warning** |
| 生产构建 | `npm run build` | tsc + vite 成功 |
| 开发服务 | `npm run dev` | http://localhost:5173（`/api` 已代理到 8081） |
| 预览构建产物 | `npm run preview` | http://localhost:4173 |

### 后端（backend/，Maven Wrapper，无需预装 Maven）

前提：JDK 21 已安装且 `JAVA_HOME` 指向它（构建带 Enforcer 门槛，JDK/Maven 版本不符会直接失败）。

| 目的 | Windows（git-bash / cmd） | Linux / macOS | 成功标准 |
|---|---|---|---|
| 完整构建 | `./mvnw.cmd -B -ntp clean package -DskipTests` | `./mvnw -B -ntp clean package -DskipTests` | **BUILD SUCCESS**，产物 `target/turing-platform.jar` |
| 纯单元测试（无需数据库） | `./mvnw.cmd -B -ntp test -Dtest=JwtTokenProviderTest` | `./mvnw -B -ntp test -Dtest=JwtTokenProviderTest` | 3/3 通过 |
| 本地运行 | `./mvnw.cmd spring-boot:run` | `./mvnw spring-boot:run` | http://localhost:8081 |

说明：

- **Windows git-bash 一律用 `./mvnw.cmd`**；若本机另装了 Maven，git-bash 里的 Unix `mvn` 脚本可能报 `plexus-classworlds CNFE` —— 不要绕路排查，直接用 wrapper。
- Maven 依赖镜像（华为云）已内置于 `.mvn/settings.xml`，由 `.mvn/maven.config` 自动加载，**无需也不应修改全局 `~/.m2/settings.xml`**。
- 数据库：仓库根目录 `docker compose up -d`（MySQL 8 + Redis 7，首次启动自动执行 `init.sql`）。
- 已知坑：git-bash 下的 curl 发中文请求体会按 GBK 编码导致后端报 Invalid UTF-8 —— 联调测试请求体用 ASCII，或经浏览器/前端发送。

## 质量门槛（声称"完成/通过/修好"之前必须全绿）

**证据先于断言**：必须给出新鲜的命令输出（完整命令 + 退出码 + 结果计数），禁止"应该可以了"。

1. 前端改动：`npm run lint`（0 error）+ `npm run build`（成功）。
2. 后端改动：wrapper `clean package -DskipTests`（BUILD SUCCESS）；涉及认证/工具类时加跑 `JwtTokenProviderTest`。
3. UI 结构/视觉/交互改动：`npm run preview` 后浏览器逐页冒烟（页面渲染、图表、表格、无控制台报错）。
4. 每次提交保持可构建（小步提交，Conventional Commits：`feat/fix/docs/style/refactor/test/chore`）。

## 架构铁律

1. **状态管理分工**：Redux Toolkit = 业务/服务端全局状态（auth 等，异步用 thunk）；Zustand = 轻量 UI 偏好（persist）。同一份状态禁止两边都放。
2. **设计 tokens 唯一来源**：`frontend/src/styles/index.css` 的 `:root`（**浅色** Data-Dashboard 主题 v4：主色 `--primary: #1e40af`、强调 `--accent: #d97706`、底 `#f8fafc`、白卡片）。深色主题已被否决，**不要**引入深色样式或第二套色板；antd 用 ConfigProvider defaultAlgorithm + tokens v4；框架色 `--fw-*` 只做数据编码；禁止引入远程 webfont（内网不可达）。
3. **API 契约**：后端 `Result<T>` / `PageResult<T>` ↔ 前端 `src/api/types.ts` 一一对应；改字段先改类型；所有请求走 `src/api/client.ts` 的 axios 实例。
4. **后端统一约定**：返回 `Result`；业务错误抛 `BusinessException`；接口必须显式 `@PreAuthorize("hasAuthority('system:module:action')")`，新权限点同步登记 `sys_menu`；逻辑删除 `deleted` 字段；`createTime/updateTime` 自动填充；复杂 SQL 写 XML（`resources/mapper/`）。
5. **版本坑（踩过，勿重复）**：
   - antd 6：根模块无 `ColumnsType`，用 `import type { TableColumnsType } from 'antd'`；本地 interface 禁止命名 `Record`（遮蔽内置泛型）。
   - MyBatis Plus 3.5.9+：`IService/ServiceImpl` 在 `com.baomidou.mybatisplus.spring.service`（非旧 `extension` 包）；分页需额外引 `mybatis-plus-jsqlparser`。
   - 前端 TS 严格模式（noUnusedLocals/noUnusedParameters），未用导入会炸构建。
   - Maven wrapper 相关文件行尾必须保持 LF（`.gitattributes` 已锁定，勿改）。
6. **可访问性基线**（已达成，勿回退）：图标按钮 `aria-label`、skip-link、页面 sr-only h1、`prefers-reduced-motion`、登录表单 autocomplete。

## 代理行为规范

1. **规则先行**：任何任务开始前先通读本文件；涉及 UI/UX 的改动遵循 CONTRIBUTING.md 的最低要求清单。
2. **计划先行**：非平凡任务（新功能、跨模块改动）先产出简短计划再动手；有可用流程技能时优先用技能。
3. **根因修复**：修 bug 先定位根因（日志、最小复现），禁止表面补丁；禁止为过测试而改测试预期。
4. **最小改动**：不顺手重构无关代码；不引入新依赖，除非任务明确要求且经确认。
5. **锁定项勿动**：`frontend/.npmrc`（华为云源）、`backend/.mvn/*`（wrapper 与镜像）、8081 端口、设计 tokens 结构。
6. **敏感信息禁止入库**：JWT 密钥、数据库密码等生产配置走环境变量（`application-prod.yml` 的 `TURING_*` 占位）。
7. **本机个性化不进仓库**：个人路径/偏好写入各自被 gitignore 的本地文件（如 `CLAUDE.local.md`），不要提交，也不要把个人绝对路径写进 AGENTS.md / CLAUDE.md。
8. **诚实汇报**：做不到或验证不通过就明说，禁止编造输出。

# CLAUDE.md — 图灵测试平台 · AI 代理工作指南

本文件是 Claude Code 在本仓库工作时的**强制上下文**。人类协作流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 强制技能工作流（已安装 superpowers + ui-ux-pro-max）

- 任何任务开始前，先检查是否有适用技能（using-superpowers 规则：技能先行，1% 可能也必须调用；先流程技能，后实现技能）。
- 「构建 X」→ 先 `superpowers:brainstorming`，再 `superpowers:writing-plans` 产出计划，按 `superpowers:executing-plans` 执行。
- 「修 bug」→ 先 `superpowers:systematic-debugging`，理解根因后才动手。
- **任何 UI 结构/视觉/交互/图表改动 → 必须先查 ui-ux-pro-max 规则**：
  ```bash
  python "$HOME/.claude/skills/ui-ux-pro-max/scripts/search.py" "<语义结果>" --domain ux
  ```
  Windows 用 `python`（非 python3）。先查语义结果（如 "icon button accessible label"），需要实现细节时再查具体栈（`--stack react`）。
- **声称「完成/通过/修好」之前 → 必须执行 verification-before-completion**：跑出新鲜验证输出（完整命令 + 退出码 + 结果计数），证据先于断言。禁止「应该可以了」。
- 提交/PR 之前 → `superpowers:requesting-code-review`。

## 本机构建与验证命令（内网环境，均已在 2026-10-20 验证）

### 前端（frontend/）

```bash
cd frontend
npm install        # 源已锁华为云镜像（.npmrc），勿改回官方源
npm run lint       # ESLint 9 flat config，必须 0 error
npm run build      # tsc + vite，必须成功
npm run dev        # 5173，/api 代理到 8081
npm run preview    # 4173，验证生产构建
```

### 后端（backend/）

git-bash 下**必须用 mvn.cmd**（Unix mvn 脚本在此机器报 plexus-classworlds CNFE）：

```bash
cd backend
export JAVA_HOME='D:\软件\jdk-21.0.2'
'D:/软件/apache-maven-3.9.16/bin/mvn.cmd' -B -ntp package -DskipTests   # 必须 BUILD SUCCESS
'D:/软件/apache-maven-3.9.16/bin/mvn.cmd' -B -ntp test -Dtest=JwtTokenProviderTest  # 无需数据库
```

- Maven 镜像：华为云 central（已写入全局 settings.xml）。
- 联调环境：`docker compose up -d`（MySQL 8 + Redis 7，首次自动执行 backend/sql/init.sql）。
- 演示账号：admin/Admin@123（全权限）、viewer/Viewer@123（只读）。

## 项目铁律

1. **状态管理分工**：Redux Toolkit = 业务/服务端全局状态（auth 等，异步用 thunk）；Zustand = 轻量 UI 偏好（persist）。同一份状态禁止两边都放。
2. **设计 tokens 唯一来源**：`frontend/src/styles/index.css` 的 `:root`（深色工程风）。红色（--accent）只用于品牌与选中态；框架色（--fw-*）只做数据编码；禁止引入远程 webfont（内网不可达）；新页面禁止另起色板。
3. **API 契约**：后端 `Result<T>` / `PageResult<T>` ↔ 前端 `src/api/types.ts` 一一对应；改字段先改类型。所有请求走 `src/api/client.ts` 的 axios 实例。
4. **后端统一约定**：返回 `Result`；业务错误抛 `BusinessException`；接口必须显式 `@PreAuthorize("hasAuthority('system:module:action')")`；逻辑删除 `deleted` 字段；`createTime/updateTime` 自动填充；复杂 SQL 写 XML（`resources/mapper/`）。
5. **版本坑（踩过，勿重复）**：
   - antd 6：根模块无 `ColumnsType`，用 `import type { TableColumnsType } from 'antd'`；
   - MyBatis Plus 3.5.17：`IService/ServiceImpl` 在 `com.baomidou.mybatisplus.spring.service`（非 extension）；分页需 `mybatis-plus-jsqlparser`；
   - 前端 TS 严格模式（noUnusedLocals/noUnusedParameters），未用导入会炸构建。
6. **提交规范**：Conventional Commits（feat/fix/docs/style/refactor/test/chore），小步提交，每次提交保持可构建。

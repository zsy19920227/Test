# Copilot Instructions — 图灵测试平台

所有项目规则统一收敛在仓库根目录 **AGENTS.md**（标准命令、质量门槛、架构铁律、代理行为规范）。开始任务前先读它；本文件与其冲突时以 AGENTS.md 为准。

要点：

- 前端在 `frontend/` 下执行：`npm run lint`（必须 0 error）+ `npm run build`；后端在 `backend/` 下执行：`./mvnw.cmd -B -ntp clean package -DskipTests`（Linux/macOS 用 `./mvnw`），`JAVA_HOME` 需指向 JDK 21。
- UI 为浅色 Data-Dashboard 主题 v4：颜色只从 `frontend/src/styles/index.css` 的 `:root` tokens 取，禁止深色样式、远程 webfont 或第二套色板。
- API 契约：后端 `Result<T>`/`PageResult<T>` ↔ 前端 `src/api/types.ts` 一一对应，改字段先改类型。
- 完成前必须跑质量门槛并给出真实输出（命令 + 退出码 + 计数）；小步提交，Conventional Commits，每次提交保持可构建。
- 个人本机差异写入 gitignored 的 `CLAUDE.local.md`，不进仓库。

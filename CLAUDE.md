# CLAUDE.md — Claude Code 工作入口

**开始任何任务前，先读 [AGENTS.md](AGENTS.md)** —— 项目标准命令、质量门槛、架构铁律与代理行为规范的唯一权威来源，本文件不重复这些内容。规则冲突时以 AGENTS.md 为准。人类协作流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## Claude Code 专属工作流

若本机已安装 superpowers / ui-ux-pro-max 技能集，则以下工作流**强制**；未安装时，按 AGENTS.md「代理行为规范」执行同等纪律（计划先行、根因修复、证据先于断言）。

- 技能先行：任务开始前检查是否有适用技能（1% 可能也必须调用；先流程技能，后实现技能）。
- 「构建 X」→ 先 `superpowers:brainstorming`，再 `superpowers:writing-plans` 产出计划，按 `superpowers:executing-plans` 执行。
- 「修 bug」→ 先 `superpowers:systematic-debugging`，理解根因后才动手。
- 任何 UI 结构/视觉/交互/图表改动 → 先查 ui-ux-pro-max 规则：
  ```bash
  python "$HOME/.claude/skills/ui-ux-pro-max/scripts/search.py" "<语义结果>" --domain ux
  ```
  Windows 用 `python`（非 python3）。先查语义结果（如 "icon button accessible label"），需要实现细节再查具体栈（`--stack react`）。
- 声称「完成/通过/修好」之前 → 执行 verification-before-completion：跑出 AGENTS.md 质量门槛的新鲜输出（完整命令 + 退出码 + 结果计数），证据先于断言，禁止「应该可以了」。
- 提交/PR 之前 → `superpowers:requesting-code-review`。

## 构建命令速查

完整命令表见 AGENTS.md「标准命令」。摘要：前端 `npm run lint` / `npm run build`（frontend/ 下）；后端 `./mvnw.cmd -B -ntp clean package -DskipTests`（backend/ 下，git-bash 用 `mvnw.cmd` 而非 Unix `mvn` 脚本；`JAVA_HOME` 需指向 JDK 21，Maven 由 wrapper 提供、镜像由 `.mvn/settings.xml` 提供）。

## 本机个性化

个人本机差异（JDK 安装路径、私有端口偏好等）写入 `CLAUDE.local.md`（已 gitignore，Claude Code 会自动加载），**勿提交、勿写入本文件或 AGENTS.md**。

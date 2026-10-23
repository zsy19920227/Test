# SDD ledger — plan: docs/plans/2026-10-20-ui-style-consolidation.md

Setup: inline execution in current working tree (user forbade git commit); no frontend test framework — per-task gates are the plan's grep/lint/build checks.
Pre-flight: T2/T3/T4 all touch index.css :root and tailwind.config — must be edited in one consistent pass; T1 consumes T4's text-muted classes (apply after tokens exist); T6 whitelists styles/tokens.ts created in T3.

Task 2 (T2): complete — :root 新增 --radius-sm/4/--radius-lg 并注释；ConfigProvider 显式 borderRadiusLG:8；inline borderRadius 4/8 全部改 var（BasicLayout×2/FlowDemo/MermaidDemo/Login）。验证: grep borderRadius 仅剩变量引用+antd token 配置。
Task 3 (T3): complete — index.css 新增 --brand-grad/--page-grad/--shadow-card/--shadow-header；新建 src/styles/tokens.ts（与 :root 互链）；BasicLayout/Login 渐变阴影、FlowDemo #cbd5e1+mask、MermaidDemo palette 全部收敛。Ruling: main.tsx ConfigProvider hex 改引 tokens.ts（antd token 无法消费 CSS 变量，且使 T6 白名单仅剩 tokens.ts 成立）— 若错成本：一处 import 回退。验证: .tsx 零 hex/rgba，.ts 仅 tokens.ts。
Task 4 (T4): complete — tailwind colors 增 text.{DEFAULT,secondary,muted} 与 border.subtle；高频 inline color 换 text-text-muted/text-danger/text-fw-green 类；body font-size:14px。验证: src 内 style={{ 降至 21 处且均为多属性组合/动态值/图表场景（计划豁免）。
Task 1 (T1): complete — 新建 components/PageHeader.tsx（命名导出，对齐 FieldLabel 惯例，Ruling）；应用到 8 业务页，标题与侧栏一致，管理页主按钮移页头 extra，Card title 简化为区块语义（用户列表/角色列表/菜单树/代码示例/测试任务执行链路/图表编辑与预览）；sr-only h1 全部移除。执行顺序 Ruling: T2→T3→T4 先于 T1（PageHeader 消费 T4 类）。
Task 5 (T5): complete — kpis 增 goodDirection，trend 色=方向利好判断（绿 --fw-green/红 --danger），四卡同 map 渲染保持对称。
Task 6 (T6): complete — docs/ui-style-guide.md（tokens 总表/结构范式/组件约定/间距/圆角/阴影/Do-Don't/灰字示例/未来并入 AGENTS.md 说明）；scripts/check-style.mjs + package.json lint:style。RED→GREEN: 注入 __style_probe.ts(#ff0000) → 报错 exit 1 → 删除 → 通过 exit 0。
Final gates: npm run lint exit 0（0 error 0 warning）; npm run build exit 0（tsc+vite ✓ built in 39.68s）; npm run lint:style exit 0。
Final: self-review（无独立子代理评审，用户禁 commit/工作树含用户未提交改动）; AGENTS.md 门槛3 preview 逐页冒烟未执行（用户完成定义为三项命令），已如实告知。

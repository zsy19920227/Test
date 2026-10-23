# UI 风格审视 · 优化与固化计划（2026-10-20）

来源：Hermes 独立审计（代码扫描 + 逐页计算样式采集 + ui-ux-pro-max 知识库）。
审计证据：登录/工作台/推理/组件示例×3/系统管理×3 共 9 页截图与 style-audit.json。

## 审计结论

**现状良好项（保持，勿动）**：tokens v4 唯一来源（index.css :root ↔ tailwind.config ↔ ConfigProvider 三方一致）；页面节奏统一（筛选卡→图表卡→表格卡）；KPI 卡完全对称；图表只用 --fw-* 数据编码色；a11y 基线完整。

**发现的问题（本计划要修）**：

| # | 问题 | 证据 |
|---|------|------|
| 1 | 页面无可见标题层，全靠 sr-only h1 | 所有 8 个业务页 |
| 2 | 圆角三套并存：antd 6px / Card 8px / inline 4px | BasicLayout 用户按钮、收起侧栏按钮、FlowDemo、MermaidDemo 均 inline borderRadius:4 |
| 3 | 硬编码色绕过 tokens | Login 背景 #eff6ff、品牌渐变 #1e40af→#3b82f6（Login+BasicLayout 重复两处）、MermaidDemo 整套 palette、FlowDemo #cbd5e1、boxShadow rgba(15,23,42,…) |
| 4 | Tailwind 色板缺文字色映射，导致高频重复 `style={{color:'var(--text-muted)'}}`（每页 5–9 处 inline style） | Dashboard/Inference/管理页 |
| 5 | body font-size 16px（浏览器默认）与 antd 14px 不一致 | computed style 采集 |
| 6 | KPI trend 一律绿色，未区分「上升=好/下降=好」指标语义 | Dashboard.tsx |

## 任务分解（每项含验证标准）

### T1 新增 PageHeader 组件并应用到全部业务页
- 新建 `frontend/src/components/PageHeader.tsx`：props `{ title, description?, extra? }`。标题 16px/600（可见 h1，替换原 sr-only h1，a11y 不回退），说明文字 text-xs text-muted，extra 右对齐放主操作。
- 应用到 Dashboard / InferencePage / UserManagement / RoleManagement / MenuManagement / MonacoDemo / FlowDemo / MermaidDemo（登录页与 404 除外）。管理页的「新增用户」等主按钮从 Card extra 移到页头 extra；Card 保留搜索等工具栏。
- 验证：8 页可见页头，标题与侧栏一致，无双重标题（Card title 若与页头重复则简化为区块语义，如「用户列表」）。

### T2 圆角体系固化
- index.css :root 增 `--radius-sm:4px; --radius:6px; --radius-lg:8px;` 并注释用途（sm=小按钮/内嵌控件，默认=antd 组件，lg=卡片/浮层/登录卡）。
- ConfigProvider 显式 `borderRadius: 6, borderRadiusLG: 8`（消除隐式依赖）。
- 替换全部 inline `borderRadius: 4/8` 为对应变量。
- 验证：`grep -rn 'borderRadius:' src` 仅剩变量引用或 antd token 配置。

### T3 硬编码色全部收敛到 tokens
- index.css 新增：`--brand-grad: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)`、`--page-grad: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)`、`--shadow-card: 0 4px 16px rgba(15,23,42,0.08)`、`--shadow-header: 0 1px 2px rgba(15,23,42,0.04)`。
- 新建 `frontend/src/styles/tokens.ts`：导出 JS 侧色常量（供 Recharts/Mermaid/ReactFlow 等无法吃 CSS 变量的场景），值与 index.css :root 一一对应并注释互链。
- MermaidDemo palette、FlowDemo #cbd5e1、Login/BasicLayout 渐变与阴影全部改引变量/tokens.ts。
- 验证：`grep -rnE '#[0-9a-fA-F]{3,8}\b' src --include='*.tsx'` 结果仅剩 tokens.ts 与 index.css（白名单）；tailwind.config.js 保持既有 hex（与 :root 一致，注释互链）。

### T4 Tailwind 映射补全 + inline style 清理
- tailwind.config colors 增：`text: { DEFAULT:'#1e293b', secondary:'#475569', muted:'#64748b' }`、`border.subtle:'#e2e8f0'`（与 :root 对齐）。
- 将 `style={{color:'var(--text-muted)'}}` 等高频 inline 换成 `text-text-muted` 等类；保留 CSS 变量本身（单一来源不变，Tailwind 只是映射）。
- body 增 `font-size:14px`（与 antd 对齐）。
- 验证：lint 0 error 0 warning；`grep -rc 'style={{' pages/` 显著下降（图表 tick/Tooltip 等确实需变量的可保留）。

### T5 KPI trend 语义色
- kpis 数据结构加 `goodDirection: 'up'|'down'`；trend 颜色按「实际方向是否利好」判断（TTFT -18ms → 向下且好 → 绿）。
- 验证：四张卡数据语义正确，仍保持完全对称无强调差异。

### T6 风格固化（防回退）
- 新建 `docs/ui-style-guide.md`：tokens 总表（含用途列）、页面结构范式（PageHeader → 卡片区）、组件约定（Card size=small+title、工具栏进 extra、Table size=small、图表只用 --fw-*）、间距体系（页边距 20 / 卡片间 20 / 卡内 16）、圆角体系、阴影体系、Do/Don't 清单（禁止裸 hex、禁止第二色板、禁止远程 webfont、弹窗表单规范引用 FieldLabel 两列网格）、灰字示例。
- package.json 增 script `"lint:style"`：检查 src/**/*.{ts,tsx} 裸 hex（白名单 styles/tokens.ts、styles/index.css、tailwind.config.js），发现即非零退出。用 node 脚本实现（`scripts/check-style.mjs`），不引新依赖。
- 验证：`npm run lint:style` 通过；故意注入一个 hex 能被抓到（测完删）。

## 约束（全部任务）
- 只动 frontend/ 与 docs/，不动后端、不加依赖、不改 8081/.npmrc/.mvn。
- 不改既有色值（v4 tokens 数值冻结），只做收敛与映射。
- 质量门槛：`npm run lint`（0/0）+ `npm run build` + `npm run lint:style` 全绿后才算完成。
- AGENTS.md 不改（其修改需团队评审）；style guide 中写明未来可将其要点并入 AGENTS.md。

## 明确不做
- 深色主题、远程字体、表格 13px 压缩（保持 antd 14px）、管理页功能逻辑。

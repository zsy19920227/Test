# UI 风格指南（防回退固化）

> 适用范围：`frontend/` 全部页面与组件。本文件是 UI 风格的**执行细则**；
> 规则冲突时以 [AGENTS.md](../AGENTS.md)「架构铁律」为准。
> 本文档要点未来可经团队评审后并入 AGENTS.md（AGENTS.md 的修改需团队评审，故先固化于此）。
> 主题版本：浅色 Data-Dense Dashboard · tokens v4（2026-10-20 审计后固化）。

## 1. 设计 tokens 总表

唯一来源：`frontend/src/styles/index.css` 的 `:root`（CSS 侧）+ `frontend/src/styles/tokens.ts`（JS 侧，供 Recharts/Mermaid/ReactFlow 等无法消费 CSS 变量的场景）。**两处数值一一对应、互链维护：改一处必须同步另一处。**

| Token | 值 | 用途 |
|---|---|---|
| `--primary` | `#1e40af` | 品牌 / 主操作按钮 |
| `--accent` | `#d97706` | 强调 / 高亮（琥珀） |
| `--danger` | `#dc2626` | 危险 / 错误 / 不利趋势 |
| `--bg` | `#f8fafc` | 页面底色 |
| `--surface` / `--surface-raised` | `#ffffff` | 卡片 / 浮层 |
| `--surface-border` | `#e2e8f0` | 常规边框 |
| `--muted` | `#f1f5f9` | 弱化底色 |
| `--text` | `#1e293b` | 主文本 |
| `--text-secondary` | `#475569` | 次文本 |
| `--text-muted` | `#64748b` | 弱文本（说明文字、图标，白底对比 4.8:1） |
| `--fw-blue / --fw-amber / --fw-green / --fw-violet` | `#2563eb / #d97706 / #059669 / #7c3aed` | **框架数据编码色：只用于图表/图例/状态点，不做 UI 装饰** |
| `--radius-sm` | `4px` | 小按钮 / 内嵌控件（流程图容器等） |
| `--radius` | `6px` | antd 组件默认（ConfigProvider `borderRadius: 6`） |
| `--radius-lg` | `8px` | 卡片 / 浮层 / 登录卡（ConfigProvider `borderRadiusLG: 8`） |
| `--brand-grad` | `linear-gradient(135deg, #1e40af, #3b82f6)` | 品牌图标容器渐变（Login 与 BasicLayout 共用） |
| `--page-grad` | `linear-gradient(180deg, #eff6ff, #f8fafc)` | 登录页整页背景 |
| `--shadow-card` | `0 4px 16px rgba(15,23,42,.08)` | 卡片浮起阴影（登录卡） |
| `--shadow-header` | `0 1px 2px rgba(15,23,42,.04)` | 顶栏贴地阴影 |

tokens.ts 额外三个非 `:root` 值（数值冻结）：`borderStrong`（`#cbd5e1`，antd colorBorder / 滚动条 thumb）、`blueTint`（`#eff6ff`，page-grad 起点 / Mermaid 节点底）、`blueBorder`（`#93c5fd`，Mermaid 节点边框）。

Tailwind 映射（`tailwind.config.js`，只是映射不是第二来源）：`primary / accent / danger / base / surface / muted / fw.*`，以及文本映射 `text-text / text-text-secondary / text-text-muted`、`border-border-subtle`。

## 2. 页面结构范式

每个业务页（登录页与 404 除外）固定为：

```
PageHeader（可见 h1 16px/600 + text-xs 灰说明 + 右侧主操作）
  → 卡片区（flex flex-col gap-5，从上到下：筛选卡 → 图表卡 → 表格卡）
```

- PageHeader 组件：`src/components/PageHeader.tsx`，props `{ title, description?, extra? }`。
- 页头 title 必须与侧栏菜单文案一致；h1 可见（a11y 基线，替换历史 sr-only 方案，勿回退）。
- 主操作按钮（「新增用户」等）放页头 `extra`；搜索、刷新等工具栏放 Card `extra`。
- Card title 只做区块语义（「用户列表」「角色列表」「菜单树」），**不与页头重复**。

## 3. 组件约定

- Card：`size="small"` + `title`；KPI 卡 `styles={{ body: { padding: 16 } }}`，图表卡 `styles={{ body: { paddingTop: 8 } }}`。
- Table：一律 `size="small"`；数字列加 `className="tabular"`。
- 图表（Recharts）：线色只用 `--fw-*` 数据编码色；tick/Tooltip 等对象属性可用 `var(--text-muted)` 等 CSS 变量字符串。
- KPI trend：数据必须带 `goodDirection: 'up' | 'down'`，颜色按「实际方向是否利好」判断（利好绿 `--fw-green` / 不利红 `--danger`），杜绝一律绿。
- 弹窗表单：引用 `FieldLabel` 组件 + 两列网格（`grid grid-cols-2 gap-x-4`），见 UserManagement 等管理页。

## 4. 间距体系

| 场景 | 值 |
|---|---|
| 内容区页边距（Content padding） | 20（`p-5`） |
| 卡片之间 | 20（`gap-5`） |
| 卡内主间距 | 16 |

## 5. 圆角体系

`--radius-sm`(4) 小按钮/内嵌控件 · `--radius`(6) antd 组件（ConfigProvider 显式 `borderRadius: 6`） · `--radius-lg`(8) 卡片/浮层/登录卡（`borderRadiusLG: 8`）。inline 样式一律引变量，禁止写裸数字。

## 6. 阴影体系

卡片浮起 `--shadow-card`；顶栏 `--shadow-header`。禁止在组件里手写 `boxShadow: '0 … rgba(…)'`。

## 7. 排版

- `body` 字号 14px，与 antd `fontSize: 14` 对齐（勿回退到浏览器默认 16px）。
- 数字（KPI 值、表格数字列、Run 号）加 `tabular` 类（等宽数字）。
- 字体栈：本地中文栈 + 等宽栈，见 index.css / tailwind.config.js。

## 8. Do / Don't

**Do**

- 色值一律引 token：CSS 里 `var(--*)`，JS 里 `import { tokens } from '@/styles/tokens'`，ClassName 里用 Tailwind 映射（`text-text-muted` 等）。
- 图标按钮加 `aria-label`；页面用 PageHeader 的可见 h1。
- `npm run lint:style` 纳入提交前自查（与 lint / build 并列）。

**Don't（违反即 lint:style 或评审打回）**

- ❌ 禁止裸 hex：`src/**/*.{ts,tsx}` 中不得出现 `#1e40af` 这类字面量（唯一白名单 `src/styles/tokens.ts`）。
- ❌ 禁止第二套色板 / 深色主题（已被否决）。
- ❌ 禁止引入远程 webfont（内网不可达，字体只用本地栈）。
- ❌ 禁止 `--fw-*` 数据编码色做 UI 装饰（按钮、边框、文字）。
- ❌ 禁止绕过 PageHeader 自造页头 / 恢复 sr-only h1。
- ❌ 弹窗表单不要用 antd 默认松散布局，走 FieldLabel + 两列网格。

## 9. 灰字示例（何时用哪级灰）

```tsx
<div className="text-xs text-text-muted">说明性文字、单位、图标</div>      {/* 最弱：辅助信息 */}
<Typography.Text type="secondary">antd 组件内次级文本</Typography.Text>     {/* 次级 */}
<span style={{ color: 'var(--text-secondary)' }}>多属性组合样式中的次文本</span>
{/* 正文默认 var(--text)，勿主动降级 */}
```

---

*来源：2026-10-20 UI 风格独立审计（docs/plans/2026-10-20-ui-style-consolidation.md）执行后固化。*

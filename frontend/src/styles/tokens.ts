/*
 * JS 侧设计 tokens —— 供无法消费 CSS 变量的场景（Recharts / Mermaid / ReactFlow / lucide color 属性）。
 * 数值与 styles/index.css 的 :root 一一对应（互链：改一处必须同步另一处），
 * 额外三个非 :root 值各有注释说明来源。禁止在组件里书写裸 hex，一律引用本文件。
 */
export const tokens = {
  /* 品牌（↔ :root --primary / --accent / --danger） */
  primary: '#1e40af',
  accent: '#d97706',
  danger: '#dc2626',

  /* 表面（↔ --bg / --surface / --surface-border / --muted） */
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceBorder: '#e2e8f0',
  muted: '#f1f5f9',

  /* 文本（↔ --text / --text-secondary / --text-muted） */
  text: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#64748b',

  /* 框架数据编码色（↔ --fw-*，只做数据编码，不做 UI 装饰） */
  fwBlue: '#2563eb',
  fwAmber: '#d97706',
  fwGreen: '#059669',
  fwViolet: '#7c3aed',

  /* ---- 以下为 :root 之外的既有值（数值冻结，仅收敛存放） ---- */
  /** 强边框：antd colorBorder（main.tsx）与滚动条 thumb（index.css）共用 */
  borderStrong: '#cbd5e1',
  /** 浅蓝底纹：--page-grad 渐变起点，也是 Mermaid 节点底色 */
  blueTint: '#eff6ff',
  /** Mermaid 节点边框蓝（原 MermaidDemo palette，无 :root 对应） */
  blueBorder: '#93c5fd',
  /** ReactFlow MiniMap 遮罩：--bg 的 70% 透明版 */
  bgMask: 'rgba(248, 250, 252, 0.7)',
} as const

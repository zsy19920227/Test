/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 平台设计 tokens v4（浅色 · Data-Dense Dashboard），与 index.css :root 一致
        primary: '#1e40af',
        accent: '#d97706',
        danger: '#dc2626',
        base: '#f8fafc',
        surface: {
          DEFAULT: '#ffffff',
          raised: '#ffffff',
          border: '#e2e8f0',
        },
        muted: '#f1f5f9',
        // 框架数据编码色（只做数据编码，不做 UI 装饰）
        fw: {
          blue: '#2563eb',
          amber: '#d97706',
          green: '#059669',
          violet: '#7c3aed',
        },
      },
      fontFamily: {
        // 本地中文字体栈，禁止引入远程 webfont
        sans: ['HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

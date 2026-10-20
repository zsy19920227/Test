/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 平台设计 tokens（与原型 v3 :root 保持一致，勿另起一套色板）
        base: '#0c0e11',
        surface: {
          DEFAULT: '#13161b',
          raised: '#1e232b',
          border: '#262b33',
        },
        accent: '#e5484d',
        // 框架数据编码色（只做数据编码，不做 UI 装饰）
        fw: {
          cyan: '#5f9ec7',
          amber: '#c2a45e',
          green: '#5f9e6f',
          pink: '#bd8494',
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

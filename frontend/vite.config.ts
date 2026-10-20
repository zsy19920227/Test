import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      // 开发环境将 /api 代理到本地后端（Spring Boot 8081）
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      // 与 dev 一致：预览构建产物时同样将 /api 代理到后端
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 大体积依赖单独分包，避免单个 chunk 过大
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          antd: ['antd', '@ant-design/icons'],
          charts: ['recharts'],
          monaco: ['monaco-editor', '@monaco-editor/react'],
          flow: ['reactflow'],
          mermaid: ['mermaid'],
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1890ff',
          'layout-header-background': '#001529',
          'layout-body-background': '#f0f5ff',
          'border-radius-base': '6px',
        },
        javascriptEnabled: true,
      },
    },
  },
})

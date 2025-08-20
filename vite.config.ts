import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 为GitHub Pages设置基础路径
  base: '/MyMexicoStore/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 性能优化配置
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库打包到单独的chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将UI组件库打包到单独的chunk
          'ui-vendor': ['lucide-react'],
          // 将管理后台相关组件打包到单独的chunk
          'admin': [
            './src/pages/admin/Dashboard',
            './src/pages/admin/ProductManagement',
            './src/pages/admin/OrderManagement',
            './src/pages/admin/CustomerManagement'
          ]
        }
      }
    },
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true
      }
    },
    // 设置chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用源码映射（开发时）
    sourcemap: false
  },
  // 开发服务器优化
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/pages/Home.tsx',
        './src/pages/Products.tsx',
        './src/pages/ProductDetail.tsx'
      ]
    }
  },
  // 依赖预构建优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
})
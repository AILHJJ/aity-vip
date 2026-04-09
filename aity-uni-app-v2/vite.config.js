import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    // 使用esbuild替代terser（更快的压缩速度，更低的内存占用）
    minify: 'esbuild',
    target: 'es2015',
    // 代码分割优化
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          vendor: ['vue', 'pinia'],
        }
      }
    }
  }
})

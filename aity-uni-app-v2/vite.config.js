import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      uni(),
    ],
    // 编译时常量替换
    // 将 __APP_API_BASE_URL__ 替换为 .env 中的 VITE_APP_API_BASE_URL
    // 这样 config.js 中就不需要使用 import.meta.env，避免小程序中 require("url") 报错
    define: {
      __APP_API_BASE_URL__: env.VITE_APP_API_BASE_URL
        ? JSON.stringify(env.VITE_APP_API_BASE_URL)
        : 'undefined',
    },
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
  }
})

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
      // 关闭压缩（uni-app 3.0.0-4080720251210001 版本bug，
      // esbuild/terser 压缩均导致 addListener 错误，暂无法升级修复）
      minify: false,
      target: 'es2015',
      // 小程序 build 模式下不启用手动分包，避免破坏运行时依赖
      rollupOptions: {
        output: {
        }
      }
    }
  }
})

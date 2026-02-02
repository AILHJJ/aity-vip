/*
 * @Author: fuli fuli@example.com
 * @Date: 2026-01-29 19:09:02
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-01-29 21:33:24
 * @FilePath: \your-mcp-proxy\AITY_VIP\aity-uni-app-new\vite.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vite.dev/config/
export default defineConfig({
  plugins: [uni()],
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
  }
})

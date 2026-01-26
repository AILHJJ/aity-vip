                /*
 * @Author: fuli fuli@example.com
 * @Date: 2026-01-26 11:30:22
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-01-26 11:44:18
 * @FilePath: \your-mcp-proxy\aity-uni-app\vite.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
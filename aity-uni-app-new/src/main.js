/*
 * @Author: fuli fuli@example.com
 * @Date: 2026-01-26 11:30:52
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-01-26 11:44:56
 * @FilePath: \your-mcp-proxy\aity-uni-app\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setRouter } from './utils/navigation'
import './styles/index.scss'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  setRouter(router)

  const isH5 = typeof import.meta.env !== 'undefined' && import.meta.env.UNI_PLATFORM === 'h5'
  const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV

  if (isDev || isH5) {
    import('element-plus').then((ElementPlus) => {
      app.use(ElementPlus.default)
      import('element-plus/dist/index.css')
    })
    import('@element-plus/icons-vue').then((ElementPlusIconsVue) => {
      for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
      }
    })
  }

  app.use(pinia)
  app.use(router)

  return {
    app,
    pinia
  }
}
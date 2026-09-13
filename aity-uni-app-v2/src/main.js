import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// #ifdef H5
// 统一 H5 浏览器 tab 标题为品牌名（避免显示"消息中心""讨论详情"等 pages.json 里的 navigationBarTitleText）
// 通过劫持 document.title 的 setter 实现，uni-app 框架默认会写入页面 title
// 条件编译确保只编译到 H5，不影响小程序
;(function lockH5Title() {
  const BRAND = '投研图灵室'
  Object.defineProperty(document, 'title', {
    configurable: true,
    get() { return BRAND },
    set() { /* 忽略 uni-app 框架对 title 的设置 */ }
  })
  // 触发一次 setter 让初始 title 也被锁定为品牌名
  document.title = ''
})()
// #endif

export function createApp() {
	const app = createSSRApp(App)
	const pinia = createPinia()

	app.use(pinia)

	return {
		app,
	}
}

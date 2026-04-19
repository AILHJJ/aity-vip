/**
 * 全局配置文件
 * 统一管理 API 地址和基础配置
 *
 * 环境区分策略：
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 开发环境 (npm run dev:*)                                    │
 * │   → 连接本地后端 (localhost 或局域网IP)                      │
 * │   → 后端连接测试数据库 (投研图灵室_test)                     │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 生产构建 - 本地版 (npm run build:*:local)                    │
 * │   → 连接本地后端 (localhost:3001)                            │
 * │   → 后端连接测试数据库 (投研图灵室_test)                     │
 * ├─────────────────────────────────────────────────────────────┤
 * │ 生产构建 - 云端版 (npm run build:*:cloud)                    │
 * │   → 连接生产服务器 (https://aity88.online)                   │
 * │   → 后端连接生产数据库 (投研图灵室)                          │
 * └─────────────────────────────────────────────────────────────┘
 *
 * 重要：不能使用 import.meta.env！
 * Vite 编译小程序时会为 import.meta 生成 polyfill，
 * 其中包含 require("url")，而微信小程序不支持 Node.js 模块，
 * 会导致运行时报错：module 'utils/url.js' is not defined
 *
 * 解决方案：通过 Vite 的 define 配置，在编译时将
 * __APP_API_BASE_URL__ 替换为字符串常量
 */

// ============================================
// API 地址（编译时由 Vite define 注入）
// ============================================
// __APP_API_BASE_URL__ 在编译时会被替换为实际值
// 在 dev 环境下不会被替换，此时为 undefined（使用下面的默认值）

const envApiBaseUrl = typeof __APP_API_BASE_URL__ !== 'undefined' ? __APP_API_BASE_URL__ : undefined

// ============================================
// 生产环境配置（云端）
// ============================================
const PRODUCTION_CONFIG = {
  API_BASE_URL: envApiBaseUrl || 'https://aity88.online/api',
  BASE_URL: envApiBaseUrl ? envApiBaseUrl.replace(/\/api$/, '') : 'https://aity88.online',
  ENV: 'production'
}

// ============================================
// 开发环境配置（本地）
// ============================================
const DEVELOPMENT_CONFIG = {
  API_BASE_URL: envApiBaseUrl || 'http://localhost:3001/api',
  BASE_URL: envApiBaseUrl ? envApiBaseUrl.replace(/\/api$/, '') : 'http://localhost:3001',
  ENV: 'development'
}

// ============================================
// 环境判断
// ============================================

// 检测运行环境
const isProduction = process.env.NODE_ENV === 'production'

// 检测是否是小程序环境
// #ifdef MP-WEIXIN
const isMpWeixin = true
// #endif

// #ifndef MP-WEIXIN
const isMpWeixin = false
// #endif

// ============================================
// 配置选择策略
// ============================================

// 如果 .env 提供了 API 地址，直接使用（支持 build:local/cloud 切换）
// 否则根据 NODE_ENV 自动选择
export const CONFIG = envApiBaseUrl
  ? (isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG)
  : (isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG)

// 环境标识（方便其他模块判断）
export const IS_PRODUCTION = isProduction
export const IS_DEVELOPMENT = !isProduction

// 导出常用的配置项，方便使用
export const { API_BASE_URL, BASE_URL, ENV } = CONFIG

export default CONFIG

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
 * │ 生产环境 (npm run build:*)                                  │
 * │   → 连接生产服务器 (https://aity88.online:8443)             │
 * │   → 后端连接生产数据库 (投研图灵室)                          │
 * └─────────────────────────────────────────────────────────────┘
 */

// ============================================
// 生产环境配置
// ============================================
const PRODUCTION_CONFIG = {
  // API 基础地址（包含 /api 路径）
  API_BASE_URL: 'https://aity88.online:8443/api',
  // 服务器基础地址（不包含 /api 路径，用于图片等静态资源）
  BASE_URL: 'https://aity88.online:8443',
  // 环境标识
  ENV: 'production'
}

// ============================================
// 开发环境配置
// ============================================
const DEVELOPMENT_CONFIG = {
  // 本地开发时连接本地后端
  // 小程序必须使用局域网IP，不能使用localhost
  // 请根据实际情况修改为你的本机局域网IP
  API_BASE_URL: 'http://192.168.2.140:3001/api',
  BASE_URL: 'http://192.168.2.140:3001',
  // 环境标识
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

// 根据环境自动选择配置
// 生产构建 → 生产服务器 + 生产数据库
// 开发调试 → 本地后端 + 测试数据库
export const CONFIG = isProduction
  ? PRODUCTION_CONFIG
  : DEVELOPMENT_CONFIG

// 环境标识（方便其他模块判断）
export const IS_PRODUCTION = isProduction
export const IS_DEVELOPMENT = !isProduction

// 导出常用的配置项，方便使用
export const { API_BASE_URL, BASE_URL, ENV } = CONFIG

export default CONFIG

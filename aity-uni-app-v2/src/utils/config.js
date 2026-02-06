/**
 * 全局配置文件
 * 统一管理 API 地址和基础配置
 */

// ============================================
// 生产环境配置（正式发布使用）
// ============================================
const PRODUCTION_CONFIG = {
  // API 基础地址（包含 /api 路径）
  API_BASE_URL: 'https://aity88.online:8443/api',

  // 服务器基础地址（不包含 /api 路径，用于图片等静态资源）
  BASE_URL: 'https://aity88.online:8443'
}

// ============================================
// 开发环境配置（仅在本地开发时使用）
// ============================================
const DEVELOPMENT_CONFIG = {
  API_BASE_URL: 'http://192.168.2.140:3001/api',
  BASE_URL: 'http://192.168.2.140:3001'
}

// ============================================
// 环境判断
// ============================================
// 小程序编译后始终使用生产环境地址
// 真机预览和正式版都连接远程服务器
const isDevelopment = process.env.NODE_ENV === 'development' && false // 默认使用生产环境

// 如需本地调试，请将上方代码改为：
// const isDevelopment = process.env.NODE_ENV === 'development' && true

// 导出配置
export const CONFIG = isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG

// 导出常用的配置项，方便使用
export const { API_BASE_URL, BASE_URL } = CONFIG

export default CONFIG

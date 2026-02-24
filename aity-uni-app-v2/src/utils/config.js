/**
 * 全局配置文件
 * 统一管理 API 地址和基础配置
 *
 * 环境说明：
 * - 开发环境：前端本地运行，后端连接远程服务器（保持环境一致）
 * - 生产环境：前后端都在远程服务器
 */

// ============================================
// 远程服务器配置（开发 + 生产统一使用）
// ============================================
const REMOTE_CONFIG = {
  // API 基础地址（包含 /api 路径）
  // H5和小程序都使用8443端口（微信小程序支持带端口的request域名）
  API_BASE_URL: 'https://aity88.online:8443/api',

  // 服务器基础地址（不包含 /api 路径，用于图片等静态资源）
  BASE_URL: 'https://aity88.online:8443'
}

// ============================================
// 本地开发配置（仅用于特殊调试场景）
// ============================================
const LOCAL_CONFIG = {
  // 本地开发时连接本地后端
  // 小程序必须使用局域网IP，不能使用localhost
  API_BASE_URL: 'http://192.168.2.140:3001/api',
  BASE_URL: 'http://192.168.2.140:3001'
}

// ============================================
// 环境判断
// ============================================

// 检测运行环境
const isDevelopment = process.env.NODE_ENV === 'development'

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
//
// 专业实践：
// 1. 所有环境统一连接远程服务器，保持数据一致性
// 2. 避免本地和远程数据不一致导致的问题
// 3. 方便多人协作开发和测试
//
// 特殊场景（需要连接本地后端时）：
// - 修改 useLocalBackend 为 true
// - 适用于：后端本地调试、无需联网的开发场景
//

const useLocalBackend = false // ⚠️ 改为 true 可切换到本地后端

// 导出配置
export const CONFIG = useLocalBackend
  ? LOCAL_CONFIG                        // 本地后端（特殊调试用）
  : REMOTE_CONFIG                        // 远程后端（推荐，保持一致性）

// 导出常用的配置项，方便使用
export const { API_BASE_URL, BASE_URL } = CONFIG

export default CONFIG

/**
 * 认证相关 API
 */
import { post } from '../utils/request'

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @param {String} data.email 邮箱（可选）
 * @param {String} data.username 用户名（可选）
 * @param {String} data.password 密码
 * @param {Boolean} data.rememberMe 记住我
 * @returns {Promise}
 */
export function loginApi(data) {
  return post('/auth/login', data)
}

/**
 * 用户登出
 * @returns {Promise}
 */
export function logoutApi() {
  return post('/auth/logout')
}

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export function getCurrentUserApi() {
  return post('/auth/me')
}

export default {
  loginApi,
  logoutApi,
  getCurrentUserApi
}

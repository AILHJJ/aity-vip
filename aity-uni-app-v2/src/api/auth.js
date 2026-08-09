/**
 * 认证相关 API
 */
import { get, post } from '../utils/request'

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
  return get('/auth/me')
}

/**
 * 修改密码
 * @param {Object} data 密码数据
 * @param {String} data.currentPassword 当前密码
 * @param {String} data.newPassword 新密码
 * @returns {Promise}
 */
export function changePasswordApi(data) {
  return post('/auth/change-password', data)
}

/**
 * 修改邮箱
 * @param {Object} data 邮箱数据
 * @param {String} data.email 新邮箱
 * @returns {Promise}
 */
export function changeEmailApi(data) {
  return post('/auth/change-email', data)
}

export default {
  loginApi,
  logoutApi,
  getCurrentUserApi,
  changePasswordApi,
  changeEmailApi
}

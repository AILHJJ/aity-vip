/**
 * 用户管理相关 API
 */
import { get, post, put, del } from '../utils/request'

/**
 * 获取用户列表
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码
 * @param {Number} params.limit 每页数量
 * @param {String} params.role 用户角色
 * @param {String} params.status 用户状态
 * @returns {Promise}
 */
export function getUsersApi(params = {}) {
  return get('/users', params)
}

/**
 * 获取用户详情
 * @param {Number} id 用户ID
 * @returns {Promise}
 */
export function getUserDetailApi(id) {
  return get(`/users/${id}`)
}

/**
 * 创建用户
 * @param {Object} data 用户数据
 * @returns {Promise}
 */
export function createUserApi(data) {
  return post('/users', data)
}

/**
 * 更新用户
 * @param {Number} id 用户ID
 * @param {Object} data 用户数据
 * @returns {Promise}
 */
export function updateUserApi(id, data) {
  return put(`/users/${id}`, data)
}

/**
 * 删除用户
 * @param {Number} id 用户ID
 * @returns {Promise}
 */
export function deleteUserApi(id) {
  return del(`/users/${id}`)
}

/**
 * 停用用户（逻辑删除）
 * @param {Number} id 用户ID
 * @returns {Promise}
 */
export function deactivateUserApi(id) {
  return put(`/users/${id}/deactivate`)
}

/**
 * 启用用户
 * @param {Number} id 用户ID
 * @returns {Promise}
 */
export function activateUserApi(id) {
  return put(`/users/${id}/activate`)
}

/**
 * 获取分组列表
 * @returns {Promise}
 */
export function getGroupsApi() {
  return get('/groups')
}

/**
 * 创建分组
 * @param {Object} data 分组数据
 * @returns {Promise}
 */
export function createGroupApi(data) {
  return post('/groups', data)
}

/**
 * 更新分组
 * @param {Number} id 分组ID
 * @param {Object} data 分组数据
 * @returns {Promise}
 */
export function updateGroupApi(id, data) {
  return put(`/groups/${id}`, data)
}

/**
 * 删除分组
 * @param {Number} id 分组ID
 * @returns {Promise}
 */
export function deleteGroupApi(id) {
  return del(`/groups/${id}`)
}

/**
 * 重置用户密码
 * @param {Number} id 用户ID
 * @param {Object} data 密码数据
 * @param {String} data.newPassword 新密码
 * @param {String} data.adminPassword 管理员密码（可选）
 * @returns {Promise}
 */
export function resetUserPasswordApi(id, data) {
  return put(`/users/${id}/password`, data)
}

export default {
  getUsersApi,
  getUserDetailApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  deactivateUserApi,
  activateUserApi,
  getGroupsApi,
  createGroupApi,
  updateGroupApi,
  deleteGroupApi,
  resetUserPasswordApi
}

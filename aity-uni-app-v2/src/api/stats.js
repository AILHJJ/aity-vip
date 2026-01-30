/**
 * 统计数据相关 API
 */
import { get } from '../utils/request'

/**
 * 获取统计数据
 * @returns {Promise}
 */
export function getStatsApi() {
  return get('/stats')
}

/**
 * 获取用户增长趋势
 * @param {Object} params 查询参数
 * @param {Number} params.days 天数
 * @returns {Promise}
 */
export function getUserGrowthApi(params = {}) {
  return get('/stats/user-growth', params)
}

/**
 * 获取消息发布趋势
 * @param {Object} params 查询参数
 * @param {Number} params.days 天数
 * @returns {Promise}
 */
export function getMessageTrendApi(params = {}) {
  return get('/stats/message-trend', params)
}

/**
 * 获取活跃用户列表
 * @param {Object} params 查询参数
 * @param {Number} params.limit 数量限制
 * @returns {Promise}
 */
export function getActiveUsersApi(params = {}) {
  return get('/stats/active-users', params)
}

export default {
  getStatsApi,
  getUserGrowthApi,
  getMessageTrendApi,
  getActiveUsersApi
}

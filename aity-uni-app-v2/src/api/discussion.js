/**
 * 讨论相关 API
 */
import { get, post, put, del } from '../utils/request'

/**
 * 获取讨论列表
 * @param {Object} params 查询参数
 * @param {Number} params.messageId 消息ID（可选）
 * @param {String} params.status 讨论状态（可选）
 * @param {String} params.visibility 可见性（可选）
 * @returns {Promise}
 */
export function getDiscussionsApi(params = {}) {
  return get('/discussions', params)
}

/**
 * 获取讨论详情
 * @param {Number} id 讨论ID
 * @returns {Promise}
 */
export function getDiscussionDetailApi(id) {
  return get(`/discussions/${id}`)
}

/**
 * 创建讨论
 * @param {Object} data 讨论数据
 * @param {Number} data.messageId 消息ID
 * @param {String} data.title 讨论标题
 * @param {String} data.content 讨论内容
 * @returns {Promise}
 */
export function createDiscussionApi(data) {
  return post('/discussions', data)
}

/**
 * 更新讨论可见性
 * @param {Number} id 讨论ID
 * @param {Object} data 更新数据
 * @param {String} data.visibility 可见性
 * @returns {Promise}
 */
export function updateDiscussionVisibilityApi(id, data) {
  return put(`/discussions/${id}/visibility`, data)
}

/**
 * 删除讨论
 * @param {Number} id 讨论ID
 * @returns {Promise}
 */
export function deleteDiscussionApi(id) {
  return del(`/discussions/${id}`)
}

/**
 * 回复讨论
 * @param {Number} id 讨论ID
 * @param {Object} data 回复数据
 * @param {String} data.content 回复内容
 * @returns {Promise}
 */
export function replyDiscussionApi(id, data) {
  return post(`/discussions/${id}/replies`, data)
}

/**
 * 获取讨论回复列表
 * @param {Number} id 讨论ID
 * @returns {Promise}
 */
export function getDiscussionRepliesApi(id) {
  return get(`/discussions/${id}/replies`)
}

/**
 * 收藏讨论
 * @param {Number} id 讨论ID
 * @returns {Promise}
 */
export function favoriteDiscussionApi(id) {
  return post(`/discussions/${id}/favorite`)
}

/**
 * 取消收藏讨论
 * @param {Number} id 讨论ID
 * @returns {Promise}
 */
export function unfavoriteDiscussionApi(id) {
  return del(`/discussions/${id}/favorite`)
}

/**
 * 获取收藏的讨论列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getFavoriteDiscussionsApi(params = {}) {
  return get('/discussions/favorites', params)
}

/**
 * 获取我的讨论列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getMyDiscussionsApi(params = {}) {
  return get('/discussions/my', params)
}

export default {
  getDiscussionsApi,
  getDiscussionDetailApi,
  createDiscussionApi,
  updateDiscussionVisibilityApi,
  deleteDiscussionApi,
  replyDiscussionApi,
  getDiscussionRepliesApi,
  favoriteDiscussionApi,
  unfavoriteDiscussionApi,
  getFavoriteDiscussionsApi,
  getMyDiscussionsApi
}

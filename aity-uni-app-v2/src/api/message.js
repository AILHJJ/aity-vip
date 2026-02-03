/**
 * 消息相关 API
 */
import { get, post, put, del } from '../utils/request'

/**
 * 获取消息列表
 * @param {Object} params 查询参数
 * @param {Number} params.page 页码
 * @param {Number} params.limit 每页数量
 * @param {String} params.type 消息类型
 * @param {String} params.tag 消息标签
 * @param {String} params.keyword 搜索关键词
 * @returns {Promise}
 */
export function getMessagesApi(params = {}) {
  return get('/messages', params)
}

/**
 * 获取消息详情
 * @param {Number} id 消息ID
 * @returns {Promise}
 */
export function getMessageDetailApi(id) {
  return get(`/messages/${id}`)
}

/**
 * 创建消息
 * @param {Object} data 消息数据
 * @returns {Promise}
 */
export function createMessageApi(data) {
  return post('/messages', data)
}

/**
 * 更新消息
 * @param {Number} id 消息ID
 * @param {Object} data 消息数据
 * @returns {Promise}
 */
export function updateMessageApi(id, data) {
  return put(`/messages/${id}`, data)
}

/**
 * 删除消息
 * @param {Number} id 消息ID
 * @returns {Promise}
 */
export function deleteMessageApi(id) {
  return del(`/messages/${id}`)
}

/**
 * 标记消息为已读
 * @param {Number} id 消息ID
 * @returns {Promise}
 */
export function markMessageAsReadApi(id) {
  return post(`/messages/${id}/read`)
}

/**
 * 收藏消息
 * @param {Number} id 消息ID
 * @returns {Promise}
 */
export function favoriteMessageApi(id) {
  return post(`/messages/${id}/favorite`)
}

/**
 * 取消收藏消息
 * @param {Number} id 消息ID
 * @returns {Promise}
 */
export function unfavoriteMessageApi(id) {
  return del(`/messages/${id}/favorite`)
}

/**
 * 获取收藏的消息列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getFavoriteMessagesApi(params = {}) {
  return get('/favorites', params)
}

/**
 * 置顶消息
 * @param {Number} id 消息ID
 * @returns {Promise}
 */
export function pinMessageApi(id) {
  return post(`/messages/${id}/pin`)
}

/**
 * 取消置顶消息
 * @param {Number} id 消息ID
 * @returns {Promise}
 */
export function unpinMessageApi(id) {
  return del(`/messages/${id}/pin`)
}

export default {
  getMessagesApi,
  getMessageDetailApi,
  createMessageApi,
  updateMessageApi,
  deleteMessageApi,
  markMessageAsReadApi,
  favoriteMessageApi,
  unfavoriteMessageApi,
  getFavoriteMessagesApi,
  pinMessageApi,
  unpinMessageApi
}

/**
 * 消息类型管理 API
 */
import { get, post, put, del } from '../utils/request'

/**
 * 获取消息类型列表
 * @param {Boolean} activeOnly 是否只获取激活的类型
 * @returns {Promise}
 */
export function getMessageTypesApi(activeOnly = true) {
  return get('/message-types', { activeOnly })
}

/**
 * 获取单个消息类型详情
 * @param {Number} id 类型ID
 * @returns {Promise}
 */
export function getMessageTypeDetailApi(id) {
  return get(`/message-types/${id}`)
}

/**
 * 创建消息类型（管理员）
 * @param {Object} data 类型数据
 * @returns {Promise}
 */
export function createMessageTypeApi(data) {
  return post('/message-types', data)
}

/**
 * 更新消息类型（管理员）
 * @param {Number} id 类型ID
 * @param {Object} data 类型数据
 * @returns {Promise}
 */
export function updateMessageTypeApi(id, data) {
  return put(`/message-types/${id}`, data)
}

/**
 * 删除消息类型（管理员）
 * @param {Number} id 类型ID
 * @returns {Promise}
 */
export function deleteMessageTypeApi(id) {
  return del(`/message-types/${id}`)
}

/**
 * 初始化默认消息类型（管理员）
 * @returns {Promise}
 */
export function initMessageTypesApi() {
  return post('/message-types/init')
}

export default {
  getMessageTypesApi,
  getMessageTypeDetailApi,
  createMessageTypeApi,
  updateMessageTypeApi,
  deleteMessageTypeApi,
  initMessageTypesApi
}

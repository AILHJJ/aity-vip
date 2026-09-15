/**
 * 机器人渠道配置 API（管理员）
 */
import { get, put, post } from '../utils/request'

/**
 * 获取所有渠道配置（凭证脱敏）
 * @returns {Promise}
 */
export function getBotConfigsApi() {
  return get('/admin/bot-config')
}

/**
 * 更新某渠道配置（保存后后端自动热重载 bot）
 * @param {String} channel 渠道名：wecom / feishu
 * @param {Object} data { enabled, config: { botId, secret, bindCode } }
 * @returns {Promise}
 */
export function updateBotConfigApi(channel, data) {
  return put(`/admin/bot-config/${channel}`, data)
}

/**
 * 手动热重载 bot（不更新配置，仅重新连接）
 * @returns {Promise}
 */
export function reloadBotApi() {
  return post('/admin/bot-config/reload')
}

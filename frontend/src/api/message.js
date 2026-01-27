/*
 * @Author: fuli fuli@example.com
 * @Date: 2026-01-26 14:13:07
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-01-27 16:37:18
 * @FilePath: \your-mcp-proxy\AITY_VIP\frontend\src\api\message.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '../utils/request'

// 获取消息列表
export const getMessagesApi = (params) => {
  return request({
    url: '/messages',
    method: 'GET',
    params
  })
}

// 获取消息详情
export const getMessageDetailApi = (id) => {
  return request({
    url: `/messages/${id}`,
    method: 'GET'
  })
}

// 创建消息
export const createMessageApi = (data) => {
  return request({
    url: '/messages',
    method: 'POST',
    data
  })
}

// 更新消息
export const updateMessageApi = (id, data) => {
  return request({
    url: `/messages/${id}`,
    method: 'PUT',
    data
  })
}

// 删除消息
export const deleteMessageApi = (id) => {
  return request({
    url: `/messages/${id}`,
    method: 'DELETE'
  })
}

// 标记消息为已读
export const markMessageAsReadApi = (id) => {
  return request({
    url: `/messages/${id}/read`,
    method: 'POST'
  })
}

// 获取消息统计
export const getMessageStatsApi = (params) => {
  return request({
    url: '/messages/stats',
    method: 'GET',
    params
  })
}

// 导出别名，保持兼容性
export const getMessages = getMessagesApi
export const deleteMessage = deleteMessageApi
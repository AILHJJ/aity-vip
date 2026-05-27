import request from '../utils/request'

// 获取消息列表
export const getMessagesApi = (params) => {
  return request({
    url: '/api/messages',
    method: 'GET',
    params
  })
}

// 获取消息详情
export const getMessageDetailApi = (id) => {
  return request({
    url: `/api/messages/${id}`,
    method: 'GET'
  })
}

// 创建消息
export const createMessageApi = (data) => {
  return request({
    url: '/api/messages',
    method: 'POST',
    data
  })
}

// 更新消息
export const updateMessageApi = (id, data) => {
  return request({
    url: `/api/messages/${id}`,
    method: 'PUT',
    data
  })
}

// 删除消息
export const deleteMessageApi = (id) => {
  return request({
    url: `/api/messages/${id}`,
    method: 'DELETE'
  })
}

// 标记消息为已读
export const markMessageAsReadApi = (id) => {
  return request({
    url: `/api/messages/${id}/read`,
    method: 'POST'
  })
}

// 获取消息统计
export const getMessageStatsApi = (params) => {
  return request({
    url: '/api/messages/stats',
    method: 'GET',
    params
  })
}

// 导出别名，保持兼容性
export const getMessages = getMessagesApi
export const deleteMessage = deleteMessageApi
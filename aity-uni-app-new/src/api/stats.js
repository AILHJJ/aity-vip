import request from '../utils/request'

// 获取统计数据
export const getStats = (params) => {
  return request({
    url: '/stats/overview',
    method: 'GET',
    params
  })
}

// 获取用户统计
export const getUserStats = (params) => {
  return request({
    url: '/stats/users',
    method: 'GET',
    params
  })
}

// 获取消息统计
export const getMessageStats = (params) => {
  return request({
    url: '/stats/messages',
    method: 'GET',
    params
  })
}

// 获取讨论统计
export const getDiscussionStats = (params) => {
  return request({
    url: '/stats/discussions',
    method: 'GET',
    params
  })
}
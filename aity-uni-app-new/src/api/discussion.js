import request from '../utils/request'

// 获取讨论列表
export const getDiscussionsApi = (params) => {
  return request({
    url: '/api/discussions',
    method: 'GET',
    params
  })
}

// 获取讨论详情
export const getDiscussionDetailApi = (id) => {
  return request({
    url: `/api/discussions/${id}`,
    method: 'GET'
  })
}

// 创建讨论
export const createDiscussionApi = (data) => {
  return request({
    url: '/api/discussions',
    method: 'POST',
    data
  })
}

// 更新讨论
export const updateDiscussionApi = (id, data) => {
  return request({
    url: `/api/discussions/${id}`,
    method: 'PUT',
    data
  })
}

// 删除讨论
export const deleteDiscussionApi = (id) => {
  return request({
    url: `/api/discussions/${id}`,
    method: 'DELETE'
  })
}

// 回复讨论
export const replyDiscussionApi = (id, data) => {
  return request({
    url: `/api/discussions/${id}/replies`,
    method: 'POST',
    data
  })
}

// 更新讨论可见性
export const updateDiscussionVisibilityApi = (id, visibility) => {
  return request({
    url: `/api/discussions/${id}/visibility`,
    method: 'PUT',
    data: { visibility }
  })
}

// 获取讨论统计
export const getDiscussionStatsApi = (params) => {
  return request({
    url: '/api/discussions/stats',
    method: 'GET',
    params
  })
}
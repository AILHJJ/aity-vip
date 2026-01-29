import request from '../utils/request'

// 获取分组列表
export const getGroups = (params) => {
  return request({
    url: '/groups',
    method: 'GET',
    params
  })
}

// 获取分组详情
export const getGroup = (id) => {
  return request({
    url: `/groups/${id}`,
    method: 'GET'
  })
}

// 创建分组
export const createGroup = (data) => {
  return request({
    url: '/groups',
    method: 'POST',
    data
  })
}

// 更新分组
export const updateGroup = (id, data) => {
  return request({
    url: `/groups/${id}`,
    method: 'PUT',
    data
  })
}

// 删除分组
export const deleteGroup = (id) => {
  return request({
    url: `/groups/${id}`,
    method: 'DELETE'
  })
}
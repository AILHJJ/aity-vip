import request from '../utils/request'

// 获取用户列表
export const getUsers = (params) => {
  return request({
    url: '/users',
    method: 'GET',
    params
  })
}

// 获取用户详情
export const getUser = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'GET'
  })
}

// 创建用户
export const createUser = (data) => {
  return request({
    url: '/users',
    method: 'POST',
    data
  })
}

// 更新用户
export const updateUser = (id, data) => {
  return request({
    url: `/users/${id}`,
    method: 'PUT',
    data
  })
}

// 删除用户
export const deleteUser = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'DELETE'
  })
}

// 更新用户状态
export const updateUserStatus = (id, status) => {
  return request({
    url: `/users/${id}/status`,
    method: 'PUT',
    data: { status }
  })
}
import request from '../utils/request'

// 获取收藏列表
export const getFavorites = (params) => {
  return request({
    url: '/favorites',
    method: 'GET',
    params
  })
}

// 添加收藏
export const addFavorite = (data) => {
  return request({
    url: '/favorites',
    method: 'POST',
    data
  })
}

// 取消收藏
export const removeFavorite = (id) => {
  return request({
    url: `/favorites/${id}`,
    method: 'DELETE'
  })
}

// 检查是否已收藏
export const checkFavorite = (messageId) => {
  return request({
    url: `/favorites/check/${messageId}`,
    method: 'GET'
  })
}
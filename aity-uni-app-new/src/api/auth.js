/*
 * @Author: fuli fuli@example.com
 * @Date: 2026-01-26 11:32:01
 * @LastEditors: fuli fuli@example.com
 * @LastEditTime: 2026-01-26 12:32:53
 * @FilePath: \your-mcp-proxy\aity-uni-app\src\api\auth.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '../utils/request'

// 登录
export const loginApi = (data) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

// 登出
export const logoutApi = () => {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}

// 刷新token
export const refreshTokenApi = () => {
  return request({
    url: '/auth/refresh',
    method: 'POST'
  })
}

// 获取用户信息
export const getUserInfoApi = () => {
  return request({
    url: '/auth/info',
    method: 'GET'
  })
}

// 更新个人资料
export const updateProfile = (data) => {
  return request({
    url: '/auth/profile',
    method: 'PUT',
    data
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/auth/password',
    method: 'PUT',
    data
  })
}
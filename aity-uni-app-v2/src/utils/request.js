/**
 * 网络请求封装
 * 基于 uni.request 封装，支持 H5 和小程序
 *
 * ⚠️ 重要配置说明：
 * 1. 生产环境：小程序编译后始终连接远程服务器
 * 2. API地址：统一管理于 src/utils/config.js
 * 3. 后端更新：每次修改后端代码后，需更新服务器部署
 * 4. 本地开发：如需本地调试，请修改 config.js 中的 isDevelopment 配置
 */

import { API_BASE_URL } from './config.js'

// 友好的错误提示映射
const ERROR_MESSAGES = {
  'Network Error': '网络连接失败，请检查网络设置',
  'timeout': '请求超时，请稍后重试',
  '401': '登录已过期，请重新登录',
  '403': '您没有权限执行此操作',
  '404': '请求的内容不存在',
  '500': '服务器出错了，请稍后重试',
  '502': '网关错误，请稍后重试',
  '503': '服务暂时不可用，请稍后重试',
  '504': '网关超时，请稍后重试'
}

/**
 * 获取友好的错误提示
 */
function getErrorMessage(error) {
  if (error.response) {
    // 有响应的错误
    const { status, data } = error.response
    return data?.message || ERROR_MESSAGES[status] || ERROR_MESSAGES[status.toString()] || '请求失败，请稍后重试'
  }

  if (error.message) {
    // 无响应的错误
    return ERROR_MESSAGES[error.message] || ERROR_MESSAGES['Network Error']
  }

  return '操作失败，请稍后重试'
}

/**
 * 带重试的网络请求
 * @param {Object} options 请求配置
 * @param {Number} retryCount 重试次数（默认1次）
 * @returns {Promise}
 */
export function requestWithRetry(options, retryCount = 1) {
  return new Promise((resolve, reject) => {
    let retries = 0
    const maxRetries = retryCount

    const attemptRequest = () => {
      request(options)
        .then(resolve)
        .catch((err) => {
          // 只对网络错误或超时进行重试
          const shouldRetry =
            retries < maxRetries &&
            (err.errMsg?.includes('timeout') ||
             err.errMsg?.includes('fail') ||
             err.errMsg?.includes('network'))

          if (shouldRetry) {
            retries++
            console.log(`请求重试 ${retries}/${maxRetries}:`, options.url)
            // 延迟1秒后重试
            setTimeout(attemptRequest, 1000)
          } else {
            reject(err)
          }
        })
    }

    attemptRequest()
  })
}

/**
 * 发起网络请求
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
export function request(options) {
  return new Promise((resolve, reject) => {
    // 获取 token
    const token = uni.getStorageSync('token')

    // 构建请求配置
    const config = {
      url: API_BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.header
      },
      // 增加超时时间到90秒，考虑慢速网络和服务器响应时间
      // 小程序环境的网络请求可能比H5慢
      timeout: options.timeout || 90000
    }

    // 开发环境打印请求信息
    if (process.env.NODE_ENV === 'development') {
      console.log('=== 请求开始 ===')
      console.log('URL:', config.url)
      console.log('Method:', config.method)
      console.log('Data:', config.data)
    }

    // 发起请求
    uni.request({
      ...config,
      success: (res) => {
        // 开发环境打印响应信息
        if (process.env.NODE_ENV === 'development') {
          console.log('=== 响应成功 ===')
          console.log('Status:', res.statusCode)
          console.log('Data:', res.data)
        }

        // 请求成功 (200 OK, 201 Created, 204 No Content)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // token 过期，清除登录信息
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.showToast({
            title: ERROR_MESSAGES['401'],
            icon: 'none',
            duration: 2000
          })
          // 跳转到登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(new Error(ERROR_MESSAGES['401']))
        } else {
          // 其他错误
          const errorMsg = res.data?.message || ERROR_MESSAGES[res.statusCode] || '请求失败'
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          })
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        // 开发环境打印错误信息
        if (process.env.NODE_ENV === 'development') {
          console.error('=== 请求失败 ===')
          console.error('URL:', config.url)
          console.error('Method:', config.method)
          console.error('Error:', err)
        }

        // 请求失败 - 提供更详细的错误信息
        let errorMsg = ERROR_MESSAGES['Network Error']
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络后重试'
          } else if (err.errMsg.includes('fail')) {
            errorMsg = '网络连接失败，请检查网络设置'
          } else if (err.errMsg.includes('request:fail')) {
            errorMsg = '网络请求失败，请稍后重试'
          }
        }

        // 不在这里显示toast，让调用方处理
        reject({
          ...err,
          message: errorMsg,
          isNetworkError: true
        })
      }
    })
  })
}

/**
 * GET 请求
 */
export function get(url, params = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

/**
 * POST 请求
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求
 */
export function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

export default {
  request,
  get,
  post,
  put,
  del
}

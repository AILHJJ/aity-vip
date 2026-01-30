/**
 * 网络请求封装
 * 基于 uni.request 封装，支持 H5 和小程序
 */

// API 基础地址
const BASE_URL = process.env.NODE_ENV === 'development'
  ? '/api'  // 开发环境使用代理
  : 'https://aity88.online:8443/api'  // 生产环境使用实际地址

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
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.header
      },
      timeout: options.timeout || 30000
    }

    // 发起请求
    uni.request({
      ...config,
      success: (res) => {
        // 请求成功
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // token 过期，清除登录信息
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          // 跳转到登录页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(new Error('登录已过期'))
        } else {
          // 其他错误
          const errorMsg = res.data?.message || '请求失败'
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          })
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        // 请求失败
        console.error('请求失败:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
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

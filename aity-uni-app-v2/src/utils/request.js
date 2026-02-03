/**
 * 网络请求封装
 * 基于 uni.request 封装，支持 H5 和小程序
 */

// API 基础地址配置
// 开发环境：
//   - H5: 使用 '/api' 代理到本地后端
//   - 小程序: 使用本机 IP 地址（需要在微信开发者工具中勾选"不校验合法域名"）
// 生产环境：使用实际的 HTTPS 域名
const BASE_URL = process.env.NODE_ENV === 'development'
  ? (typeof window !== 'undefined' && window.location.protocol === 'http:'
      ? '/api'  // H5 开发环境使用代理
      : 'http://192.168.2.140:3001/api')  // 小程序开发环境使用本机 IP
  : 'https://aity88.online:8443/api'  // 生产环境使用实际地址

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

        // 请求成功
        if (res.statusCode === 200) {
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
          console.error('Error:', err)
        }

        // 请求失败
        const errorMsg = err.errMsg?.includes('timeout')
          ? ERROR_MESSAGES['timeout']
          : ERROR_MESSAGES['Network Error']

        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
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

/**
 * 网络请求封装
 * 基于 uni.request 封装，支持 H5 和小程序
 *
 * ⚠️ 重要配置说明：
 * 1. 生产环境：小程序编译后始终连接远程服务器
 * 2. API地址：https://aity88.online:8443/api
 * 3. 后端更新：每次修改后端代码后，需更新服务器部署
 * 4. 本地开发：如需本地调试，请临时修改API地址
 */

// ============================================
// 生产环境配置（正式发布使用）
// ============================================
const PRODUCTION_API_URL = 'https://aity88.online:8443/api'

// ============================================
// 开发环境配置（仅在本地开发时使用）
// ============================================
const DEVELOPMENT_API_URL = 'http://192.168.2.140:3001/api'  // 本地后端

// ============================================
// 环境判断
// ============================================
// 小程序编译后始终使用生产环境地址
// 真机预览和正式版都连接远程服务器
const API_BASE_URL = PRODUCTION_API_URL

// 如需本地调试，请临时注释上面的代码，使用下面的代码：
// const API_BASE_URL = DEVELOPMENT_API_URL

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
      url: API_BASE_URL + options.url,
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

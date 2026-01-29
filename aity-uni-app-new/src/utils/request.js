import axios from 'axios'

// 获取token的辅助函数
const getToken = () => {
  if (typeof uni !== 'undefined') {
    return uni.getStorageSync('token')
  } else if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// 获取API基础URL
const getBaseURL = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || ''
  }
  return ''
}

// 创建axios实例
const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    if (res.code !== 200) {
      if (typeof uni !== 'undefined') {
        uni.showToast({
          title: res.message || '请求失败',
          icon: 'none',
          duration: 2000
        })
      }
      
      if (res.code === 401) {
        if (typeof uni !== 'undefined') {
          uni.removeStorageSync('token')
          uni.redirectTo({
            url: '/pages/login/login'
          })
        } else if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      }
      
      return Promise.reject(new Error(res.message || 'Error'))
    }
    
    return res
  },
  error => {
    console.error('Response error:', error)
    
    if (typeof uni !== 'undefined') {
      uni.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    }
    
    return Promise.reject(error)
  }
)

// 适配小程序的请求方法
const request = (config) => {
  const isMiniProgram = typeof import.meta.env !== 'undefined' && import.meta.env.UNI_PLATFORM === 'mp-weixin'
  
  if (isMiniProgram && typeof uni !== 'undefined') {
    return new Promise((resolve, reject) => {
      uni.request({
        url: config.url,
        method: config.method || 'GET',
        data: config.data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = res.data
            if (data.code === 200) {
              resolve(data)
            } else {
              reject(data)
            }
          } else {
            reject(new Error(`Request failed with status ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
  
  return service(config)
}

export default request
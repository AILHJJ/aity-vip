/**
 * 上传相关 API
 */
import { post } from '../utils/request'
import { API_BASE_URL } from '../utils/config'

/**
 * 上传图片
 * @param {String} filePath 文件路径 (小程序) 或 blob URL (H5)
 * @param {Object} options 上传选项
 * @returns {Promise}
 */
export function uploadImageApi(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[upload] target API:', API_BASE_URL)
    }

    uni.uploadFile({
      url: API_BASE_URL + '/upload',
      filePath: filePath,
      name: 'file',
      formData: {
        type: 'image'
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[upload] success:', {
                apiBaseUrl: API_BASE_URL,
                url: data.data?.url,
                filename: data.data?.filename
              })
            }
            resolve(data.data)
          } else {
            console.error('[upload] failed response:', {
              apiBaseUrl: API_BASE_URL,
              message: data.message,
              response: data
            })
            reject(new Error(data.message || '上传失败'))
          }
        } catch (err) {
          console.error('[upload] parse failed:', {
            apiBaseUrl: API_BASE_URL,
            response: res.data,
            error: err
          })
          reject(new Error('响应解析失败'))
        }
      },
      fail: (err) => {
        console.error('[upload] request failed:', {
          apiBaseUrl: API_BASE_URL,
          error: err
        })
        reject(err)
      }
    })
  })
}

export default {
  uploadImageApi
}

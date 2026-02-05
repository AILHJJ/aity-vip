/**
 * 上传相关 API
 */
import { post } from '../utils/request'

/**
 * 上传图片
 * @param {String} filePath 文件路径 (小程序) 或 blob URL (H5)
 * @param {Object} options 上传选项
 * @returns {Promise}
 */
export function uploadImageApi(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://aity88.online:8443/api/upload',
      filePath: filePath,
      name: 'file',
      formData: {
        type: 'image'
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (err) {
          reject(new Error('响应解析失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export default {
  uploadImageApi
}

import request from '../utils/request'

/**
 * 管理员API
 */
export const adminApi = {
  // ==================== 图灵AI Token管理 ====================

  /**
   * 获取图灵AI Token状态
   */
  getAiTokenStatus() {
    return request({
      url: '/ai-advisor/token-status',
      method: 'GET'
    })
  },

  /**
   * 设置图灵AI Token（管理员接口）
   * @param {Object} data - { token: string }
   */
  setAiToken(data) {
    return request({
      url: '/ai-advisor/set-token',
      method: 'POST',
      data
    })
  },

  /**
   * 刷新图灵AI Token
   */
  refreshAiToken() {
    return request({
      url: '/ai-advisor/refresh-token',
      method: 'POST'
    })
  }
}

export default adminApi

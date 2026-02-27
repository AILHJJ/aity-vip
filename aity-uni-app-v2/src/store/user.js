/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { loginApi, logoutApi, getCurrentUserApi } from '../api/auth'
import { clearChatHistory } from '@/utils/ai-advisor-config'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
    unreadCount: uni.getStorageSync('unreadCount') || 0 // 未读消息数
  }),

  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.token,

    // 是否是管理员
    isAdmin: (state) => {
      return state.userInfo && ['super_admin', 'admin'].includes(state.userInfo.role)
    },

    // 是否是超级管理员
    isSuperAdmin: (state) => {
      return state.userInfo && state.userInfo.role === 'super_admin'
    },

    // 用户角色
    userRole: (state) => {
      return state.userInfo?.role || ''
    },

    // 用户名称
    userName: (state) => {
      return state.userInfo?.name || ''
    },

    // 用户邮箱
    userEmail: (state) => {
      return state.userInfo?.email || ''
    },

    // 是否有未读消息
    hasUnread: (state) => {
      return state.unreadCount > 0
    },

    // 用户ID（用于数据隔离）
    userId: (state) => {
      return state.userInfo?.id || state.userInfo?.userId || 'anonymous'
    }
  },

  actions: {
    /**
     * 登录
     * @param {Object} loginData 登录数据
     */
    async login(loginData) {
      try {
        const res = await loginApi(loginData)

        // 后端返回格式: { code: 200, message, data: { token, user } }
        if (res.code === 200 && res.data) {
          this.token = res.data.token
          this.userInfo = res.data.user

          // 保存到本地存储
          uni.setStorageSync('token', this.token)
          uni.setStorageSync('userInfo', this.userInfo)

          return res
        } else {
          return res
        }
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    /**
     * 登出
     */
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        // 清除AI对话历史（用户隔离，确保隐私）
        try {
          clearChatHistory()
        } catch (error) {
          console.error('清除对话历史失败:', error)
        }

        // 清除状态
        this.token = ''
        this.userInfo = null

        // 清除本地存储
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')

        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    },

    /**
     * 获取当前用户信息
     */
    async fetchUserInfo() {
      try {
        const res = await getCurrentUserApi()

        if (res.success || res.code === 200) {
          this.userInfo = res.data
          uni.setStorageSync('userInfo', this.userInfo)
          return { success: true, data: res.data }
        } else {
          return { success: false, message: res.message || '获取用户信息失败' }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return { success: false, message: error.message || '获取用户信息失败' }
      }
    },

    /**
     * 更新用户信息
     * @param {Object} userInfo 用户信息
     */
    updateUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      uni.setStorageSync('userInfo', this.userInfo)
    },

    /**
     * 设置未读消息数
     * @param {Number} count 未读数量
     */
    setUnreadCount(count) {
      this.unreadCount = count
      uni.setStorageSync('unreadCount', count)
    },

    /**
     * 清空未读消息数
     */
    clearUnreadCount() {
      this.unreadCount = 0
      uni.setStorageSync('unreadCount', 0)
    }
  }
})

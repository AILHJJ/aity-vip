/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { loginApi, logoutApi, getCurrentUserApi, changePasswordApi } from '../api/auth'
import { getUnreadCountApi } from '../api/message'

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
    },

    // 是否使用初始密码
    isInitialPassword: (state) => {
      return state.userInfo?.isInitialPassword ?? true
    },

    // 上次登录时间
    lastLoginAt: (state) => {
      return state.userInfo?.lastLoginAt || null
    }
  },

  actions: {
    /**
     * 验证 token 有效性并刷新用户信息
     * @returns {Promise<boolean>} token 是否有效
     */
    async validateAndRefresh() {
      if (!this.token) return false

      try {
        const res = await getCurrentUserApi()
        if (res.success || res.code === 200) {
          // token 有效，刷新用户信息
          this.userInfo = res.data
          uni.setStorageSync('userInfo', this.userInfo)
          return true
        } else {
          // token 无效，清除
          this.token = ''
          this.userInfo = null
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          return false
        }
      } catch (error) {
        // 请求失败（网络错误等），不清除 token，让用户继续用缓存
        console.error('验证 token 失败:', error)
        return !!this.token
      }
    },

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
          const userId = this.userId || 'anonymous'
          const historyKey = `ai_advisor_${userId}_chat_history`
          const threadKey = `ai_advisor_${userId}_thread_id`
          uni.removeStorageSync(historyKey)
          uni.removeStorageSync(threadKey)
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
      this.updateTabBarBadge()
    },

    /**
     * 从服务端获取未读消息数并同步
     */
    async fetchUnreadCount() {
      try {
        if (!this.isLoggedIn) return
        const res = await getUnreadCountApi()
        if (res.code === 200 || res.success) {
          this.unreadCount = res.data.unreadCount
          uni.setStorageSync('unreadCount', this.unreadCount)
          this.updateTabBarBadge()
        }
      } catch (error) {
        console.error('获取未读消息数失败:', error)
      }
    },

    /**
     * 更新 tabBar 消息角标
     * 注意：setTabBarBadge 只能在 tabBar 页面调用，非 tabBar 页面调用会报错
     * 所以这里用 fail 回调静默处理，不阻断业务
     */
    updateTabBarBadge() {
      if (this.unreadCount > 0) {
        uni.setTabBarBadge({
          index: 0, // 消息 tab 是第一个
          text: this.unreadCount > 99 ? '99+' : String(this.unreadCount),
          fail: () => {} // 非 tabBar 页面静默失败
        })
      } else {
        uni.removeTabBarBadge({
          index: 0,
          fail: () => {} // 非 tabBar 页面静默失败
        })
      }
    },

    /**
     * 修改密码
     * @param {Object} data 密码数据
     * @param {String} data.currentPassword 当前密码
     * @param {String} data.newPassword 新密码
     */
    async changePassword(data) {
      try {
        const res = await changePasswordApi(data)

        if (res.code === 200) {
          // 更新用户信息，标记为非初始密码
          this.userInfo = {
            ...this.userInfo,
            isInitialPassword: false,
            passwordChangedAt: res.data?.passwordChangedAt || new Date().toISOString()
          }
          uni.setStorageSync('userInfo', this.userInfo)
          return { success: true, message: '密码修改成功' }
        } else {
          return { success: false, message: res.message || '密码修改失败' }
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        return { success: false, message: error.message || '密码修改失败' }
      }
    },

    /**
     * 标记密码已修改（用于关闭初始密码提示）
     */
    markPasswordChanged() {
      this.userInfo = {
        ...this.userInfo,
        isInitialPassword: false
      }
      uni.setStorageSync('userInfo', this.userInfo)
    }
  }
})

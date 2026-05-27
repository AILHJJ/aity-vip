import { defineStore } from 'pinia'
import { getUserInfoApi } from '../api/auth'

// 获取存储中的token
export const getToken = () => {
  if (typeof uni !== 'undefined') {
    return uni.getStorageSync('token')
  } else if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// 设置存储中的token
export const setToken = (token) => {
  if (typeof uni !== 'undefined') {
    uni.setStorageSync('token', token)
  } else if (typeof localStorage !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

// 清除存储中的token
export const removeToken = () => {
  if (typeof uni !== 'undefined') {
    uni.removeStorageSync('token')
  } else if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token')
  }
}

// 用户角色定义
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VIP_MID: 'vip_mid',
  VIP_SHORT: 'vip_short',
  TRIAL: 'trial'
}

// 用户状态定义
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: null,
    isLoggedIn: !!getToken()
  }),
  
  getters: {
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo,
    getIsLoggedIn: (state) => state.isLoggedIn,
    
    // 角色判断
    isSuperAdmin: (state) => state.userInfo?.role === USER_ROLES.SUPER_ADMIN,
    isAdmin: (state) => state.userInfo?.role === USER_ROLES.SUPER_ADMIN || state.userInfo?.role === USER_ROLES.ADMIN,
    isVipMid: (state) => state.userInfo?.role === USER_ROLES.VIP_MID,
    isVipShort: (state) => state.userInfo?.role === USER_ROLES.VIP_SHORT,
    isTrial: (state) => state.userInfo?.role === USER_ROLES.TRIAL,
    isVip: (state) => state.userInfo?.role === USER_ROLES.VIP_MID || state.userInfo?.role === USER_ROLES.VIP_SHORT,
    
    // 用户状态判断
    isActive: (state) => state.userInfo?.status === USER_STATUS.ACTIVE,
    isExpired: (state) => {
      if (!state.userInfo?.expireDate) return false
      return new Date(state.userInfo.expireDate) < new Date()
    },
    
    // 权限判断
    canSendMessage: (state) => {
      const role = state.userInfo?.role
      return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN
    },
    canManageUsers: (state) => state.userInfo?.role === USER_ROLES.SUPER_ADMIN,
    canManageGroups: (state) => state.userInfo?.role === USER_ROLES.SUPER_ADMIN,
    canViewStats: (state) => {
      const role = state.userInfo?.role
      return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN
    },
    canViewPrivateDiscussions: (state) => {
      const role = state.userInfo?.role
      return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN
    },
    canManageDiscussions: (state) => {
      const role = state.userInfo?.role
      return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN
    },
    
    // 消息标签权限
    canViewMidTermMessages: (state) => {
      const role = state.userInfo?.role
      return role === USER_ROLES.SUPER_ADMIN || 
             role === USER_ROLES.ADMIN || 
             role === USER_ROLES.VIP_MID || 
             role === USER_ROLES.TRIAL
    },
    canViewShortTermMessages: (state) => {
      const role = state.userInfo?.role
      return role === USER_ROLES.SUPER_ADMIN || 
             role === USER_ROLES.ADMIN || 
             role === USER_ROLES.VIP_SHORT || 
             role === USER_ROLES.TRIAL
    }
  },
  
  actions: {
    setToken(token) {
      this.token = token
      setToken(token)
    },
    
    setUser(userInfo) {
      this.userInfo = userInfo
    },
    
    setLoggedIn(isLoggedIn) {
      this.isLoggedIn = isLoggedIn
    },
    
    getUsername() {
      if (typeof uni !== 'undefined') {
        return uni.getStorageSync('username')
      } else if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('username')
      }
      return null
    },
    
    async fetchUserInfo() {
      try {
        const response = await getUserInfoApi()
        this.userInfo = response.data
        return response.data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },
    
    // 登录
    login(token, userInfo) {
      this.token = token
      this.userInfo = userInfo
      this.isLoggedIn = true
      setToken(token)
    },
    
    // 登出
    logout() {
      this.token = null
      this.userInfo = null
      this.isLoggedIn = false
      removeToken()
    },
    
    // 初始化用户信息
    initUser() {
      const token = getToken()
      if (token) {
        this.token = token
        this.isLoggedIn = true
      }
    },
    
    // 更新用户信息
    updateUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    
    // 检查用户权限
    hasPermission(permission) {
      switch (permission) {
        case 'send_message':
          return this.canSendMessage
        case 'manage_users':
          return this.canManageUsers
        case 'manage_groups':
          return this.canManageGroups
        case 'view_stats':
          return this.canViewStats
        case 'view_private_discussions':
          return this.canViewPrivateDiscussions
        case 'manage_discussions':
          return this.canManageDiscussions
        default:
          return false
      }
    }
  }
})
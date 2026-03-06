/**
 * 主题状态管理
 * 支持浅色/深色模式切换，可跟随系统设置
 */
import { defineStore } from 'pinia'

// 主题模式枚举
export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system' // 跟随系统
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 当前主题模式：light | dark | system
    mode: uni.getStorageSync('themeMode') || ThemeMode.LIGHT,
    // 系统当前是否为深色模式（用于 system 模式）
    systemIsDark: false
  }),

  getters: {
    // 是否为深色模式（考虑 system 模式）
    isDark: (state) => {
      if (state.mode === ThemeMode.SYSTEM) {
        return state.systemIsDark
      }
      return state.mode === ThemeMode.DARK
    },

    // 当前实际主题（light 或 dark）
    currentTheme: (state) => {
      if (state.mode === ThemeMode.SYSTEM) {
        return state.systemIsDark ? 'dark' : 'light'
      }
      return state.mode
    },

    // 主题模式显示名称
    modeLabel: (state) => {
      const labels = {
        [ThemeMode.LIGHT]: '浅色模式',
        [ThemeMode.DARK]: '深色模式',
        [ThemeMode.SYSTEM]: '跟随系统'
      }
      return labels[state.mode] || '浅色模式'
    }
  },

  actions: {
    /**
     * 设置主题模式
     * @param {string} mode - 主题模式：light | dark | system
     */
    setMode(mode) {
      this.mode = mode
      uni.setStorageSync('themeMode', mode)
      this.applyTheme()
    },

    /**
     * 切换深色/浅色模式
     */
    toggleDarkMode() {
      if (this.mode === ThemeMode.SYSTEM) {
        // 如果当前是跟随系统，则切换到当前系统状态的相反模式
        this.setMode(this.systemIsDark ? ThemeMode.LIGHT : ThemeMode.DARK)
      } else {
        this.setMode(this.mode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK)
      }
    },

    /**
     * 更新系统深色模式状态
     * @param {boolean} isDark - 系统是否为深色模式
     */
    updateSystemTheme(isDark) {
      this.systemIsDark = isDark
      if (this.mode === ThemeMode.SYSTEM) {
        this.applyTheme()
      }
    },

    /**
     * 应用主题到页面
     */
    applyTheme() {
      const isDark = this.isDark

      // 设置页面根元素的 class
      // #ifdef H5
      const html = document.documentElement
      if (isDark) {
        html.classList.add('dark-mode')
        html.classList.remove('light-mode')
      } else {
        html.classList.add('light-mode')
        html.classList.remove('dark-mode')
      }
      // #endif

      // 小程序端通过 CSS 变量和页面 class 处理
      // 设置导航栏颜色
      uni.setNavigationBarColor({
        frontColor: isDark ? '#ffffff' : '#000000',
        backgroundColor: isDark ? '#020617' : '#ffffff',
        animation: {
          duration: 300,
          timingFunc: 'easeInOut'
        }
      }).catch(() => {
        // 某些页面可能没有导航栏，忽略错误
      })

      // 设置 TabBar 颜色
      uni.setTabBarStyle({
        color: isDark ? '#94a3b8' : '#666666',
        selectedColor: isDark ? '#60a5fa' : '#3b82f6',
        backgroundColor: isDark ? '#020617' : '#ffffff',
        borderStyle: isDark ? 'black' : 'white'
      }).catch(() => {
        // 忽略错误
      })

      console.log('[Theme] Applied theme:', isDark ? 'dark' : 'light')
    },

    /**
     * 初始化主题
     */
    init() {
      // 获取系统主题信息
      // #ifdef H5
      if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
        this.systemIsDark = darkModeQuery.matches

        // 监听系统主题变化
        darkModeQuery.addEventListener('change', (e) => {
          this.updateSystemTheme(e.matches)
        })
      }
      // #endif

      // #ifdef MP-WEIXIN
      // 小程序端获取系统信息
      const systemInfo = uni.getSystemInfoSync()
      // 微信小程序通过 theme 字段判断
      if (systemInfo.theme) {
        this.systemIsDark = systemInfo.theme === 'dark'
      }

      // 监听主题变化
      uni.onThemeChange((res) => {
        this.updateSystemTheme(res.theme === 'dark')
      })
      // #endif

      // 应用保存的主题设置
      this.applyTheme()
    }
  }
})

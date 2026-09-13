<script>
import { useThemeStore } from './store/theme'
import { useUserStore } from './store/user'

export default {
  onLaunch: function () {
    console.log('App Launch - 开始启动')

    // 初始化主题
    const themeStore = useThemeStore()
    themeStore.init()
    console.log('App Launch - 主题初始化完成')

    // 极简启动逻辑：完全不调用任何API
    const userStore = useUserStore()
    const hasToken = !!userStore.token

    console.log('App Launch - Token状态:', hasToken ? '存在' : '不存在')

    // 延迟跳转，确保框架完全初始化
    setTimeout(() => {
      if (hasToken) {
        console.log('App Launch - 跳转到消息页面')
        uni.switchTab({
          url: '/pages/messages/messages',
          success: () => {
            console.log('App Launch - 跳转成功')
          },
          fail: (err) => {
            console.log('App Launch - 跳转失败，使用reLaunch:', err)
            uni.reLaunch({ url: '/pages/messages/messages' })
          }
        })
      } else {
        console.log('App Launch - 跳转到登录页面')
        uni.reLaunch({ url: '/pages/login/login' })
      }
    }, 150)
  },
  onShow: function () {
    console.log('App Show')
    // 完全移除API调用
  },
  onHide: function () {
    console.log('App Hide')
  },
  computed: {
    themeClass() {
      const themeStore = useThemeStore()
      return themeStore.isDark ? 'dark-mode' : 'light-mode'
    }
  }
}
</script>

<style lang="scss">
/* 引入主题变量 */
@import './styles/theme-variables.scss';

/* 全局样式 */
page {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 确保所有页面继承主题 */
.container,
page > view {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* #ifdef H5 */
/* ========== PC 端全局适配（仅 H5，小程序不受影响） ========== */
/* 页面主体居中，避免撑满宽屏 */
uni-page-body {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 大屏下给页面加左右留白，内容居中更聚拢 */
@media (min-width: 769px) {
  uni-page-body {
    padding: 0 24px;
  }
}
/* #endif */
</style>

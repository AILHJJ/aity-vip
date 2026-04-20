<script>
import { useThemeStore } from './store/theme'
import { useUserStore } from './store/user'

export default {
  onLaunch: function () {
    console.log('App Launch')
    // 初始化主题
    const themeStore = useThemeStore()
    themeStore.init()

    // 初始化未读消息角标（已登录时从服务端同步）
    const userStore = useUserStore()
    if (userStore.isLoggedIn) {
      // token 存在，验证有效性后同步数据
      userStore.validateAndRefresh().then(valid => {
        if (!valid) {
          // token 无效/过期，跳登录
          uni.reLaunch({ url: '/pages/login/login' })
        } else {
          userStore.fetchUnreadCount()
        }
      })
    } else {
      // 无 token，跳登录页
      uni.reLaunch({ url: '/pages/login/login' })
    }
  },
  onShow: function () {
    console.log('App Show')
    // App 从后台恢复时刷新未读数
    const userStore = useUserStore()
    if (userStore.isLoggedIn) {
      userStore.fetchUnreadCount()
    }
  },
  onHide: function () {
    console.log('App Hide')
  },
  computed: {
    // 获取当前主题类名
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
</style>

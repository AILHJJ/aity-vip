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
      // #ifdef H5
      // 若通过通知卡片的 deep link（如 #/pages/discussion-detail/...）直接进入具体页面，
      // 则不要强制跳转到默认首页，否则会覆盖用户点击的目标页面
      const hash = window.location.hash
      const isDeepLink = hash && hash !== '#' && hash !== '#/'
      if (hasToken && isDeepLink) {
        console.log('App Launch - deep link 直达，保持当前页面:', hash)
        return
      }
      // #endif

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

/* 顶部导航条 uni-page-head 居中限制宽度，与 tabBar 一致 */
@media (min-width: 769px) {
	.uni-page-head {
		left: 0 !important;
		right: 0 !important;
		margin-left: auto !important;
		margin-right: auto !important;
		width: auto !important;
		max-width: 1280px !important;
	}

	/* PC 端去掉 uni-page-head 内置的返回箭头（浏览器原生后退即可） */
	.uni-page-head-hd,
	.uni-page-head .uni-btn-icon[onClick*='back'],
	.uni-page-head-hd .uni-page-head-btn {
		display: none !important;
	}

	/* 标题居中 */
	.uni-page-head .uni-page-head-bd {
		text-align: center;
		flex: 1;
	}
}

/* PC 大屏：隐藏底部 tabBar（由 pc-top-nav 顶部导航接管） */
@media (min-width: 769px) {
	.uni-tabbar-bottom,
	.uni-tabbar-top {
		display: none !important;
	}
}

/* PC 大屏：profile 页面的管理入口由 pc-top-nav 接管，隐藏冗余菜单项 */
@media (min-width: 769px) {
	.admin-only-mobile {
		display: none !important;
	}
}
/* #endif */
</style>

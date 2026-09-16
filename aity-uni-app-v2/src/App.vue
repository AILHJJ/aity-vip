<script>
import { useThemeStore } from './store/theme'
import { useUserStore } from './store/user'

export default {
  onLaunch: function () {
    console.log('App Launch - 开始启动')

    // #ifdef H5
    // iframe 嵌入模式检测：URL 加 ?embed=1 触发（如 ?embed=1#/pages/xxx）
    // 作用：消除双滚动条（iframe 外层滚动 + 页面内部滚动）
    if (typeof window !== 'undefined' && /[?&]embed=1(\b|&)/.test(window.location.search)) {
      document.body.classList.add('embed-mode')
      console.log('App Launch - iframe 嵌入模式已启用')
    }
    // #endif

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

/* ========== iframe 嵌入模式（解决双滚动条） ==========
   触发：URL 加 ?embed=1，例如 https://aity88.online/?embed=1#/pages/messages/messages
   效果：
     1. body 高度自适应内容（不占满 iframe 视口），消除 iframe 外层滚动
     2. 取消 touch 高亮（嵌入场景无意义）
     3. 隐藏 page-head fixed 偏移（嵌入场景通常不需要固定头）
   不影响正常浏览（用户不加 ?embed=1 一切照旧） */
body.embed-mode,
body.embed-mode html {
	height: auto !important;
	min-height: 100% !important;
	overflow: visible !important;
}

body.embed-mode {
	-webkit-tap-highlight-color: transparent !important;
}

/* ========== 内嵌窄面板缩放（通达信等客户端内嵌小视口） ==========
   问题：页面按手机屏（750rpx 设计稿）设计，嵌入 500~700px 宽的面板时
        rpx 换算出的尺寸观感巨大（fab/标签/字号），且面板宽 <769px，
        之前的 min-width:769px PC 适配段不会触发。
   方案：embed 模式下整体 zoom 缩放，等效于把设计稿宽度压到 ~520px，
        所有页面所有组件一次性缩小，无需逐个覆盖。
   通达信内嵌为 Chromium 内核，zoom 支持良好；触摸/点击坐标同步缩放。 */
body.embed-mode {
	zoom: 0.7;
}

/* ========== 窄面板自动缩放（不依赖 URL 参数） ==========
   通达信等客户端内嵌面板视口 500~768px（URL 未带 embed=1），
   手机竖屏为 320~430px，区间刚好错开，不会误伤真机。
   命中时整体缩小，等效设计稿宽度 ~750px 降至 ~1070px 观感协调。 */
@media (min-width: 500px) and (max-width: 768px) {
	body {
		zoom: 0.7;
	}
}
/* #endif */
</style>

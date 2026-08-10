import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

const [filterBar, marketPage, marketLadderPage, webviewPage, aiAdvisorPage, profilePage, navBar] = await Promise.all([
	read('src/components/message-filter-bar.vue'),
	read('src/pages/market/market.vue'),
	read('src/pages/market/market-ladder.vue'),
	read('src/pages/webview/webview.vue'),
	read('src/pages/ai-advisor/ai-advisor.vue'),
	read('src/pages/profile/profile.vue'),
	read('src/components/app-nav-bar.vue')
])

assert.match(filterBar, /v-if="expanded" class="filter-card"/, '消息高级筛选必须默认收起')
assert.match(filterBar, /未读\{\{ unreadCount/, '未读快捷入口必须保留在收起状态')
assert.match(navBar, /getMenuButtonBoundingClientRect/, '自定义导航必须读取微信胶囊位置')

assert.match(marketPage, /<app-nav-bar title="行情中心"/, '行情页必须展示安全区标题栏')
assert.doesNotMatch(marketPage, /class="fab-refresh"/, '行情页不得使用遮挡内容的悬浮刷新按钮')
assert.match(marketPage, /\{\{ updateTime \|\|/, '行情页必须展示真实数据更新时间')
assert.match(marketPage, /@click="handleRefresh"/, '行情页刷新入口必须复用现有刷新逻辑')
assert.match(marketLadderPage, /<app-nav-bar title="连板天梯" theme="dark" show-back/, '连板天梯必须使用深色安全区导航')
assert.match(webviewPage, /<app-nav-bar :title="title" show-back/, '行情图必须使用安全区导航')
assert.match(aiAdvisorPage, /<app-nav-bar title="AI图灵" show-back/, 'AI图灵必须使用安全区导航')

assert.doesNotMatch(profilePage, />行情中心</, '个人页不得重复展示底部已有的行情入口')
assert.doesNotMatch(profilePage, />消息中心</, '个人页不得重复展示底部已有的消息入口')
assert.match(profilePage, /class="menu-arrow">›</, '个人页菜单必须使用一致的方向箭头')
assert.match(profilePage, /v1\.6\.0/, '个人页版本号必须与前端包版本一致')

console.log('小程序 UI 结构契约检查通过')

# 问小达3.0 PC/Web版 - 实施设计方案

**文档版本**: V1.0
**创建日期**: 2026-03-13
**设计师**: Claude (AI Assistant)
**状态**: ✅ 已批准，正在实施

---

## 一、项目概述

### 1.1 项目目标

在问小达AI 3.0版本代码基础上，完整实现PC/Web版功能，包括三栏布局、AI对话、历史管理、详情面板等全部功能。

### 1.2 技术选型

- **框架**: Vue 2.6.10（与3.0版本保持一致）
- **路由**: Vue Router 3.x
- **构建**: Webpack 4.30.0（多入口配置）
- **样式**: SCSS（复用3.0版本样式系统）
- **API**: 真实后端API（复用现有API配置）

### 1.3 架构方案

**代码组织**: 方案B - 新建独立PC目录
- 新建 `tdx_wenda_ai_pc` 目录
- 复用 `tdx_wenda_ai_mobile/funcs/` 业务逻辑
- 复用核心UI组件（ui-markdown-chat、ui-think、ui-search等）
- 独立的路由配置和页面结构

**构建配置**: 方案A - 单Webpack多入口
- 移动端入口: `/mobile` → `page_main.vue`
- PC端入口: `/pc` → `page_main_pc.vue`
- 共享开发服务器: `http://localhost:3001`

---

## 二、项目结构

### 2.1 目录结构

```
tdx-wenda-ai/
├── src/
│   ├── pages/
│   │   ├── tdx_wenda_ai_mobile/        # 现有移动端（保持不变）
│   │   │   ├── page_main.vue
│   │   │   ├── components/
│   │   │   ├── funcs/                  # 共享业务逻辑
│   │   │   ├── css/
│   │   │   └── views/
│   │   │
│   │   └── tdx_wenda_ai_pc/            # 新建PC端
│   │       ├── page_main_pc.js         # PC入口文件
│   │       ├── page_main_pc.vue        # PC主组件
│   │       │
│   │       ├── views/                  # PC视图组件
│   │       │   ├── PCMain.vue          # PC主容器（三栏布局）
│   │       │   ├── SidebarLeft.vue     # 左侧栏
│   │       │   │   ├── SidebarHistory.vue   # 历史会话
│   │       │   │   ├── SidebarCollect.vue   # 收藏问句
│   │       │   │   └── SidebarUser.vue      # 用户信息
│   │       │   │
│   │       │   ├── ChatArea.vue        # 对话区域
│   │       │   │   ├── WelcomeScreen.vue    # 欢迎页面
│   │       │   │   ├── MessageList.vue      # 消息列表
│   │       │   │   └── InputBox.vue         # 输入框
│   │       │   │
│   │       │   └── SidebarRight.vue    # 右侧详情栏
│   │       │       ├── DetailHeader.vue     # 详情头部
│   │       │       ├── DetailTable.vue      # 数据表格
│   │       │       └── DetailPagination.vue # 分页
│   │       │
│   │       ├── router/                 # 路由配置
│   │       │   └── index.js
│   │       │
│   │       ├── components/             # PC专用组件
│   │       │   ├── UserAuth.vue        # 用户认证
│   │       │   └── VersionToggle.vue   # 版本切换
│   │       │
│   │       ├── css/                    # PC样式
│   │       │   ├── variables.scss      # CSS变量（复用3.0）
│   │       │   ├── layout.scss         # 布局样式
│   │       │   └── components.scss     # 组件样式
│   │       │
│   │       └── static/                 # PC静态资源
│   │
│   ├── router.js                       # 全局路由配置（新增）
│   └── ...
│
├── index.html                          # 移动端HTML模板
├── index_pc.html                       # PC端HTML模板（新增）
│
├── tg.config.js                        # Webpack配置（修改）
├── build.conf.js                       # 构建配置（保持）
└── package.json                        # 依赖管理（保持）
```

### 2.2 文件复用策略

**完全复用**（通过import）:
```
tdx_wenda_ai_pc/
├── funcs/ → 复用自 tdx_wenda_ai_mobile/funcs/
│   ├── ChatManager.js          # 对话管理
│   ├── StreamEventParser.js    # 流式解析
│   ├── aiUtils.js              # AI工具
│   ├── communicate.js          # PC版本通信
│   └── ...
│
├── components/ → 复用自 tdx_wenda_ai_mobile/components/
│   ├── ui-markdown-chat/       # Markdown渲染
│   ├── ui-think/               # 思考过程
│   ├── ui-welcome/             # 欢迎页面
│   ├── ui-hqchart/             # 行情图表
│   └── ...
│
└── css/ → 复用变量和基础样式
    └── default.scss            # CSS变量定义
```

**新建PC专用组件**:
- 三栏布局框架
- 侧边栏（历史、收藏、用户）
- 右侧详情面板
- PC端导航和交互

---

## 三、技术实施细节

### 3.1 Webpack多入口配置

**修改 `tg.config.js`**:

```javascript
module.exports = {
  entry: {
    // 移动端入口（现有）
    mobile: './src/pages/tdx_wenda_ai_mobile/page_main.js',

    // PC端入口（新增）
    pc: './src/pages/tdx_wenda_ai_pc/page_main_pc.js'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    // 移动端HTML模板
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html',
      chunks: ['mobile']
    }),

    // PC端HTML模板（新增）
    new HtmlWebpackPlugin({
      template: 'index_pc.html',
      filename: 'pc.html',
      chunks: ['pc']
    })
  ],

  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/pc/, to: '/pc.html' },
        { from: /^\/mobile/, to: '/index.html' },
        { from: '/', to: '/index.html' }  // 默认移动端
      ]
    }
  }
}
```

### 3.2 路由配置

**新建 `src/router.js`**:

```javascript
import Vue from 'vue';
import VueRouter from 'vue-router';
import PCMain from '@/pages/tdx_wenda_ai_pc/views/PCMain.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/pc',
    name: 'PCMain',
    component: PCMain,
    props: true
  },
  // 可以添加更多PC端路由
];

const router = new VueRouter({
  mode: 'hash',  // 使用hash模式避免服务器配置
  routes
});

export default router;
```

### 3.3 PC入口文件

**新建 `src/pages/tdx_wenda_ai_pc/page_main_pc.js`**:

```javascript
import Vue from 'vue';
import router from '@/router';
import PageMainPC from './page_main_pc.vue';
import Vant from 'vant';
import 'vant/lib/index.css';

// 复用移动端的全局样式
import '@/pages/tdx_wenda_ai_mobile/css/default.scss';
import '@/pages/tdx_wenda_ai_pc/css/layout.scss';

Vue.use(Vant);

// 复用全局混入
import mixin from '@/pages/tdx_wenda_ai_mobile/mixin';
Vue.mixin(mixin);

// 创建PC实例
new Vue({
  el: '#app-pc',
  router,
  render: h => h(PageMainPC)
});
```

### 3.4 PC主组件结构

**`page_main_pc.vue`**:

```vue
<template>
  <div id="app-pc" class="pc-app">
    <!-- 顶部导航栏 -->
    <top-header
      :user-info="userInfo"
      @toggle-sidebar="toggleSidebar"
      @version-switch="handleVersionSwitch"
    />

    <!-- 主容器 -->
    <div class="pc-container">
      <router-view />
    </div>

    <!-- 用户认证弹窗 -->
    <user-auth-modal
      v-if="showAuthModal"
      @close="showAuthModal = false"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script>
import TopHeader from './components/TopHeader.vue';
import UserAuthModal from './components/UserAuthModal.vue';
import { tryLoginWithTdxW, getIndiInfo } from '../../tdx_wenda_mobile/funcs/communicate';

export default {
  name: 'PageMainPC',
  components: { TopHeader, UserAuthModal },
  data() {
    return {
      userInfo: null,
      showAuthModal: false
    };
  },
  async created() {
    await this.initUser();
  },
  methods: {
    async initUser() {
      // 复用PC版本的登录逻辑
      const tdxid = await tryLoginWithTdxW();
      if (tdxid) {
        this.userInfo = await getIndiInfo();
      }
    },
    toggleSidebar() {
      // 侧边栏切换逻辑
    },
    handleVersionSwitch() {
      window.location.href = '/mobile';
    },
    handleLoginSuccess(userInfo) {
      this.userInfo = userInfo;
    }
  }
};
</script>
```

---

## 四、核心组件设计

### 4.1 PCMain 主容器（三栏布局）

```vue
<template>
  <div class="pc-main">
    <!-- 左侧栏 -->
    <sidebar-left
      :collapsed="sidebarCollapsed"
      :current-thread="threadId"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @new-chat="handleNewChat"
      @select-history="handleSelectHistory"
    />

    <!-- 中间对话区 -->
    <chat-area
      :thread-id="threadId"
      :messages="messages"
      :sidebar-collapsed="sidebarCollapsed"
      @send-message="handleSendMessage"
      @show-detail="handleShowDetail"
    />

    <!-- 右侧详情栏 -->
    <sidebar-right
      :visible="detailVisible"
      :detail-data="detailData"
      @close="detailVisible = false"
    />
  </div>
</template>

<script>
import SidebarLeft from './SidebarLeft.vue';
import ChatArea from './ChatArea.vue';
import SidebarRight from './SidebarRight.vue';
import ChatManager from '@/pages/tdx_wenda_ai_mobile/funcs/ChatManager';

export default {
  components: { SidebarLeft, ChatArea, SidebarRight },
  data() {
    return {
      sidebarCollapsed: false,
      detailVisible: false,
      threadId: null,
      messages: [],
      detailData: null
    };
  },
  created() {
    this.initChatManager();
  },
  methods: {
    initChatManager() {
      this.chatManager = new ChatManager({
        onThreadId: (id) => { this.threadId = id; },
        onMessage: (msg) => { this.messages.push(msg); }
      });
    },
    async handleSendMessage(content) {
      await this.chatManager.sendMessage(content);
    },
    handleNewChat() {
      this.messages = [];
      this.threadId = null;
    },
    async handleSelectHistory(threadId) {
      const history = await this.chatManager.loadHistory(threadId);
      this.messages = history.messages;
      this.threadId = threadId;
    },
    handleShowDetail(data) {
      this.detailData = data;
      this.detailVisible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.pc-main {
  display: flex;
  height: calc(100vh - 56px);
  overflow: hidden;
}
</style>
```

### 4.2 SidebarLeft 左侧栏

**功能**:
- 历史会话列表（调用 `ChatManager.fetchHistoryList()`）
- 收藏问句管理
- Tab切换（历史对话/收藏问句）
- 收起/展开动画
- 用户信息显示

**关键API**:
```javascript
// 获取历史会话列表
const historyList = await this.chatManager.fetchHistoryList();

// 加载历史对话
const history = await this.chatManager.loadHistory(threadId);

// 取消收藏
await this.chatManager.cancelCollect(questionId);
```

### 4.3 ChatArea 对话区域

**复用组件**:
- `ui-welcome`: 欢迎页面
- `ui-search`: 输入框（需适配PC尺寸）
- `ui-markdown-chat`: Markdown渲染
- `ui-think`: 思考过程展示

**关键修改**:
```vue
<!-- 输入框适配PC -->
<ui-search
  :max-width="1000"
  :max-height="120"
  placeholder="请输入您的问题..."
  @send="handleSend"
/>

<!-- 消息列表居中 -->
<div class="chat-messages" style="max-width: 1000px; margin: 0 auto;">
  <ui-markdown-chat
    v-for="msg in messages"
    :key="msg.id"
    :data="msg"
  />
</div>
```

### 4.4 SidebarRight 右侧详情栏

**功能**:
- 从边缘滑出动画
- 显示股票数据表格
- 条件标签展示
- "加自选"功能
- 分页加载

**数据来源**:
- AI回复中的"查看更多"按钮
- 解析股票数据和筛选条件

---

## 五、样式系统

### 5.1 复用3.0配色方案

**CSS变量** (`css/variables.scss`):

```scss
// 复用3.0版本的CSS变量
:root {
  // 主色调
  --primary-color: #4691f7;
  --accent-color: #7b5cff;

  // 涨跌色
  --up-color: #F01414;
  --down-color: #14A014;

  // 背景色
  --bg-main: linear-gradient(138deg, #e7ebfc 0%, #efe7f8 100%);
  --bg-sidebar: rgba(255, 255, 255, 0.95);
  --bg-card: rgba(255, 255, 255, 0.6);

  // 毛玻璃效果
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-blur: blur(3px);

  // 间距
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;

  // 圆角
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}
```

### 5.2 PC布局样式

**三栏布局** (`css/layout.scss`):

```scss
.pc-app {
  width: 100vw;
  height: 100vh;
  background: var(--bg-main);
  background-attachment: fixed;
  overflow: hidden;
}

.pc-container {
  display: flex;
  height: calc(100vh - 56px); // 减去顶部栏高度
}

// 左侧栏
.sidebar-left {
  width: 260px;
  min-width: 260px;
  background: var(--bg-sidebar);
  border-right: 1px solid #e5e5e5;
  transition: width 0.3s ease;

  &.collapsed {
    width: 60px;
    min-width: 60px;
  }
}

// 中间对话区
.chat-area {
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

// 右侧详情栏
.sidebar-right {
  width: 0;
  background: var(--bg-sidebar);
  border-left: 1px solid #e5e5e5;
  transition: width 0.3s ease;

  &.visible {
    width: 520px;
  }
}
```

---

## 六、实施步骤

### Phase 1: 布局框架（2-3小时）

- [ ] 创建PC目录结构
  - `tdx_wenda_ai_pc/` 及子目录
  - `page_main_pc.js` 和 `page_main_pc.vue`
  - `index_pc.html`
- [ ] 配置Webpack多入口
  - 修改 `tg.config.js`
  - 添加PC端入口和HTML模板
  - 配置devServer路由
- [ ] 创建PCMain主容器
  - 三栏布局框架
  - 响应式基础样式
- [ ] 集成路由系统
  - 安装Vue Router
  - 配置基础路由
  - 测试路由跳转
- [ ] 集成用户认证
  - 复用PC版本 `communicate.js`
  - 实现自动登录
  - 实现登录弹窗

**验收标准**:
- ✅ 访问 `http://localhost:3001/pc` 能看到PC布局
- ✅ 三栏结构正确显示
- ✅ 用户登录状态正常
- ✅ 路由切换正常

### Phase 2: 核心对话功能（3-4小时）

- [ ] 复用输入框组件
  - 引入 `ui-search`
  - 调整PC端尺寸
  - 适配多行输入
- [ ] 复用消息组件
  - 引入 `ui-markdown-chat`
  - 引入 `ui-think`
  - 调整消息宽度（max-width: 1000px）
- [ ] 集成ChatManager
  - 初始化对话管理器
  - 实现发送消息
  - 实现流式响应
  - 实现取消生成
- [ ] 实现欢迎页面
  - 复用 `ui-welcome`
  - 调整PC尺寸
- [ ] 测试完整对话流程
  - 发送消息 → AI回复 → 流式输出
  - 深度思考开关
  - 停止生成按钮

**验收标准**:
- ✅ 可以正常发送消息
- ✅ AI回复流式输出
- ✅ 思考过程正确显示
- ✅ Markdown渲染正常
- ✅ 深度思考功能正常

### Phase 3: 左侧侧边栏（2-3小时）

- [ ] 实现侧边栏框架
  - SidebarLeft组件
  - Tab切换（历史/收藏）
  - 收起/展开动画
- [ ] 历史会话列表
  - 调用 `ChatManager.fetchHistoryList()`
  - 显示历史对话列表
  - 点击切换对话
  - 当前会话高亮
- [ ] 收藏问句管理
  - 显示收藏列表
  - 点击填入输入框
  - 添加/取消收藏
- [ ] 用户信息显示
  - 显示用户头像和名称
  - VIP标识
  - 退出登录
- [ ] 新会话功能
  - 清空对话
  - 重置threadId

**验收标准**:
- ✅ 历史会话列表正常显示
- ✅ 点击历史能切换对话
- ✅ 收藏问句功能正常
- ✅ 侧边栏收起/展开动画流畅
- ✅ 用户信息正确显示

### Phase 4: 右侧详情栏（2小时）

- [ ] 实现详情栏框架
  - SidebarRight组件
  - 滑出/收起动画
  - 固定宽度520px
- [ ] 详情头部
  - 标题 + 数量
  - 加自选按钮
  - 关闭按钮
- [ ] 条件标签
  - 显示筛选条件
  - 移除"解析条件"标题
- [ ] 数据表格
  - 股票列表展示
  - 涨跌幅颜色（红涨绿跌）
  - 股票名称超链接
- [ ] 分页功能
  - "查看更多"按钮
  - 加载更多数据
- [ ] 集成AI消息
  - "查看更多"按钮
  - 触发详情栏展开

**验收标准**:
- ✅ 详情栏滑出动画流畅
- ✅ 股票数据正确显示
- ✅ 加自选功能正常
- ✅ 分页加载正常
- ✅ 关闭按钮正常

### Phase 5: 完善和测试（1-2小时）

- [ ] 应用3.0配色
  - 渐变背景
  - 毛玻璃效果
  - 半透明卡片
  - 蓝色调hover
- [ ] 响应式适配
  - 最小宽度1024px
  - 窗口缩放适配
- [ ] 动画优化
  - 侧边栏展开/收起
  - 详情栏滑出
  - 消息淡入
- [ ] 功能测试
  - 完整对话流程
  - 历史管理
  - 收藏管理
  - 详情查看
  - 用户登录
- [ ] Bug修复
  - 修复测试发现的问题
  - 边界情况处理

**验收标准**:
- ✅ 视觉效果符合3.0风格
- ✅ 所有核心功能正常
- ✅ 无明显bug
- ✅ 交互流畅自然

---

## 七、API复用清单

### 7.1 用户认证（复用PC版本）

| 方法 | 文件 | 功能 |
|------|------|------|
| `tryLoginWithTdxW()` | `communicate.js` | 自动登录 |
| `getTDXID()` | `communicate.js` | 获取用户ID |
| `getIndiInfo()` | `communicate.js` | 获取用户信息 |
| `ifLogin()` | `communicate.js` | 检查登录状态 |
| `jumpLogin()` | `communicate.js` | 弹出登录框 |

### 7.2 对话管理（复用3.0版本）

| 方法 | 文件 | 功能 |
|------|------|------|
| `ChatManager.sendMessage()` | `ChatManager.js` | 发送消息 |
| `ChatManager.cancelRun()` | `ChatManager.js` | 取消对话 |
| `ChatManager.fetchHistoryList()` | `ChatManager.js` | 获取历史列表 |
| `ChatManager.loadHistory()` | `ChatManager.js` | 加载历史对话 |
| `ChatManager.onThreadId()` | `ChatManager.js` | 会话ID回调 |
| `StreamEventParser.parse()` | `StreamEventParser.js` | 解析流式响应 |

### 7.3 UI组件（复用3.0版本）

| 组件 | 路径 | 功能 |
|------|------|------|
| `ui-markdown-chat` | `components/ui-markdown-chat/` | Markdown渲染 |
| `ui-think` | `components/ui-think/` | 思考过程 |
| `ui-welcome` | `components/ui-welcome/` | 欢迎页面 |
| `ui-search` | `views/ui-search/` | 输入框 |
| `ui-hqchart` | `components/ui-hqchart/` | 行情图表 |
| `ui-grid` | `components/ui-grid/` | 网格布局 |

---

## 八、风险控制

### 8.1 技术风险

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 组件尺寸不适配PC | UI显示异常 | ✅ 使用CSS变量统一管理尺寸 |
| 移动端触摸事件冲突 | 交互异常 | ✅ PC端使用鼠标事件 |
| API调用失败 | 功能不可用 | ✅ 复用已有错误处理机制 |
| 路由冲突 | 页面跳转错误 | ✅ 使用独立路由配置 |
| Webpack配置错误 | 构建失败 | ✅ 先配置后测试，分步验证 |

### 8.2 进度风险

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 开发时间估算不准 | 延期交付 | ✅ 分Phase实施，每Phase独立验收 |
| 需求变更 | 返工 | ✅ 按V4原型和需求文档严格执行 |
| 环境配置问题 | 无法启动 | ✅ 先在本地验证环境 |

### 8.3 回退方案

**每Phase完成后立即测试验证**：
- 发现问题立即回退到上一个稳定版本
- 修复后重新提交
- 确保每个Phase都是可用的里程碑

---

## 九、成功标准

### 9.1 功能完整性

- ✅ 用户登录/注册正常
- ✅ AI对话功能完整（发送、流式响应、停止生成）
- ✅ 深度思考功能正常
- ✅ 历史会话管理完整
- ✅ 收藏问句功能正常
- ✅ 右侧详情栏功能正常
- ✅ 加自选功能正常

### 9.2 视觉还原度

- ✅ 三栏布局符合V4原型
- ✅ 3.0配色方案100%还原
- ✅ 毛玻璃效果正确应用
- ✅ 组件尺寸符合PC端规范
- ✅ 动画效果流畅自然

### 9.3 性能标准

- ✅ 首屏加载时间 < 2秒
- ✅ 消息发送延迟 < 100ms
- ✅ AI首次响应延迟 < 500ms
- ✅ 流式输出延迟 < 50ms/字符
- ✅ 侧边栏展开/收起 < 300ms

### 9.4 兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ 分辨率 1024x768+

---

## 十、后续优化方向

### 10.1 功能增强

- [ ] 语音输入（PC端麦克风适配）
- [ ] 多轮对话优化
- [ ] 导出对话记录
- [ ] 自定义主题
- [ ] 快捷键支持

### 10.2 性能优化

- [ ] 虚拟滚动（历史列表）
- [ ] 懒加载（图片、图表）
- [ ] 缓存策略优化
- [ ] 代码分割

### 10.3 用户体验

- [ ] 暗黑模式
- [ ] 字体大小调节
- [ ] 布局自定义
- [ ] 快捷操作面板

---

**文档结束**

✅ 设计方案已完成并获得批准
⏳ 准备进入实施阶段

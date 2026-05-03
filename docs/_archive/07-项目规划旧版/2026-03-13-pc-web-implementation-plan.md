# 问小达3.0 PC/Web版实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 在问小达AI 3.0版本代码基础上，完整实现PC/Web版功能，包括三栏布局、AI对话、历史管理、详情面板等全部功能。

**架构:** 新建独立的PC目录（`tdx_wenda_ai_pc`），复用3.0版本的业务逻辑（`funcs/`）和核心UI组件，使用Vue Router实现PC端路由，通过Webpack多入口配置支持移动端和PC端同时开发。

**技术栈:** Vue 2.6.10, Vue Router 3.x, Webpack 4.30.0, SCSS, Vant 2.12.54

---

## 前置准备

### 检查开发环境

**Step 1: 验证Node.js版本**

Run: `node --version`
Expected: `v14.x` 或更高版本

**Step 2: 安装依赖**

Run: `cd D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai && npm install`
Expected: 安装完成，无错误

**Step 3: 启动开发服务器验证**

Run: `npm run dev`
Expected: 服务器启动在 `http://localhost:3001`，可以访问移动端版本

**Step 4: 停止服务器**

按 `Ctrl+C` 停止

---

## Phase 1: 搭建PC端项目结构

### Task 1.1: 创建PC端目录结构

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/`
- Create: `src/pages/tdx_wenda_ai_pc/views/`
- Create: `src/pages/tdx_wenda_ai_pc/components/`
- Create: `src/pages/tdx_wenda_ai_pc/css/`
- Create: `src/pages/tdx_wenda_ai_pc/static/`
- Create: `src/pages/tdx_wenda_ai_pc/router/`

**Step 1: 创建目录**

Run:
```bash
cd D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages
mkdir tdx_wenda_ai_pc
cd tdx_wenda_ai_pc
mkdir views components css static router
```

Expected: 目录创建成功

**Step 2: 验证目录结构**

Run: `ls -la`
Expected: 看到刚创建的5个目录

**Step 3: Commit**

```bash
cd D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai
git add src/pages/tdx_wenda_ai_pc/
git commit -m "feat: create PC version directory structure"
```

---

### Task 1.2: 创建PC端HTML入口文件

**Files:**
- Create: `index_pc.html`

**Step 1: 创建PC版HTML模板**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\index_pc.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>问小达PC版 - 通达信AI智能助手</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body, html {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #app-pc {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="app-pc"></div>
</body>
</html>
```

**Step 2: 验证文件创建**

Run: `cat index_pc.html`
Expected: 看到上面的HTML内容

**Step 3: Commit**

```bash
git add index_pc.html
git commit -m "feat: add PC version HTML template"
```

---

### Task 1.3: 创建PC端主入口JS文件

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/page_main_pc.js`

**Step 1: 创建入口文件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\page_main_pc.js`

```javascript
import Vue from 'vue';
import PageMainPC from './page_main_pc.vue';
import Vant from 'vant';
import 'vant/lib/index.css';

// 复用移动端的CSS变量和基础样式
import '@/pages/tdx_wenda_ai_mobile/css/default.scss';
import '@/pages/tdx_wenda_ai_pc/css/layout.scss';

// 引入Vant组件库
Vue.use(Vant);

// 复用移动端的全局混入
import mixin from '@/pages/tdx_wenda_ai_mobile/mixin';
Vue.mixin(mixin);

// 创建PC版Vue实例
new Vue({
  el: '#app-pc',
  render: h => h(PageMainPC),
});
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/page_main_pc.js`
Expected: 看到上面的JS代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/page_main_pc.js
git commit -m "feat: add PC version main entry file"
```

---

### Task 1.4: 创建PC版布局样式

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/css/layout.scss`

**Step 1: 创建布局样式文件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\css\layout.scss`

```scss
// PC版布局样式

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
  --bg-hover: rgba(70, 145, 247, 0.1);

  // 文字颜色
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;

  // 边框
  --border-color: #e5e5e5;
  --border-light: #ebeef5;

  // 阴影
  --shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-sidebar: 2px 0 8px rgba(0, 0, 0, 0.06);
  --shadow-right: -2px 0 8px rgba(0, 0, 0, 0.06);
  --shadow-light: 0 1px 8px 0 rgba(0, 0, 0, 0.03);

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

  // 字体
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
}

// PC应用容器
#app-pc {
  width: 100vw;
  height: 100vh;
  background: var(--bg-main);
  background-attachment: fixed;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

// 顶部导航栏
.pc-header {
  height: 56px;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  z-index: 100;
}

// 主容器
.pc-container {
  display: flex;
  height: calc(100vh - 56px);
  overflow: hidden;
}

// 左侧栏
.sidebar-left {
  width: 260px;
  min-width: 260px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-shadow: var(--shadow-sidebar);
  z-index: 10;

  &.collapsed {
    width: 60px;
    min-width: 60px;
    overflow: hidden;
  }
}

// 中间对话区
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

// 右侧详情栏
.sidebar-right {
  width: 0;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border-color);
  overflow: hidden;
  transition: width 0.3s ease;
  flex-shrink: 0;
  box-shadow: var(--shadow-right);
  z-index: 10;
  display: flex;
  flex-direction: column;

  &.visible {
    width: 520px;
  }
}

// 毛玻璃效果类
.glass-effect {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(3px);
  border: 0.5px solid #ffffff;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.03);
}
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/css/layout.scss`
Expected: 看到上面的SCSS代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/css/layout.scss
git commit -m "feat: add PC version layout styles with 3.0 color scheme"
```

---

### Task 1.5: 配置Webpack多入口

**Files:**
- Modify: `tg.config.js`

**Step 1: 查看当前Webpack配置**

Run: `cat tg.config.js | head -50`
Expected: 看到当前的entry配置

**Step 2: 备份原配置**

Run: `cp tg.config.js tg.config.js.bak`
Expected: 备份文件创建成功

**Step 3: 修改Webpack配置**

Edit file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\tg.config.js`

在entry配置中添加PC端入口（大约在第20-30行）：

```javascript
// 找到 entry 配置，修改为：
entry: {
  mobile: './src/pages/tdx_wenda_ai_mobile/page_main.js',
  pc: './src/pages/tdx_wenda_ai_pc/page_main_pc.js'  // 新增PC端入口
},

// 找到HtmlWebpackPlugin配置（大约在plugins数组中），添加PC端HTML模板：
plugins: [
  // 原有的移动端HTML模板配置
  new HtmlWebpackPlugin({
    template: 'index.html',
    filename: 'index.html',
    chunks: ['mobile'],
    inject: true
  }),

  // 新增PC端HTML模板
  new HtmlWebpackPlugin({
    template: 'index_pc.html',
    filename: 'pc.html',
    chunks: ['pc'],
    inject: true
  })
],

// 找到devServer配置（如果有），添加路由重写规则：
devServer: {
  // ...其他配置
  historyApiFallback: {
    rewrites: [
      { from: /^\/pc/, to: '/pc.html' },
      { from: /^\/mobile/, to: '/index.html' },
      { from: '/', to: '/index.html' }
    ]
  }
}
```

**Step 4: 验证配置修改**

Run: `cat tg.config.js | grep -A 5 "entry:"`
Expected: 看到mobile和pc两个入口

**Step 5: Commit**

```bash
git add tg.config.js tg.config.js.bak
git commit -m "feat: configure webpack multi-entry for mobile and PC versions"
```

---

### Task 1.6: 创建PC主组件框架

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/page_main_pc.vue`

**Step 1: 创建主组件文件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\page_main_pc.vue`

```vue
<template>
  <div id="app-pc" class="pc-app">
    <!-- 顶部导航栏 -->
    <div class="pc-header">
      <div class="header-left">
        <div class="brand">
          <img src="@/pages/tdx_wenda_ai_mobile/static/images/logo.png" alt="问小达" class="logo">
          <span class="brand-name">问小达</span>
          <span class="version-badge">3.0</span>
        </div>
      </div>

      <div class="header-right">
        <button class="version-switch" @click="handleVersionSwitch">
          切换回普通版本
        </button>

        <!-- 未登录状态 -->
        <div v-if="!userInfo" class="auth-section">
          <button class="login-btn" @click="showLoginModal = true">
            登录/注册
          </button>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="user-section">
          <div class="user-info">
            <img :src="userInfo.avatar || defaultAvatar" alt="用户" class="user-avatar">
            <span class="user-name">{{ userInfo.name || '用户' }}</span>
            <span v-if="userInfo.isVip" class="vip-badge">VIP</span>
          </div>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>
      </div>
    </div>

    <!-- 主容器 -->
    <div class="pc-container">
      <router-view />
    </div>

    <!-- 登录弹窗 -->
    <van-dialog
      v-model="showLoginModal"
      title="登录问小达"
      show-cancel-button
      confirm-button-text="登录"
      @confirm="handleLogin"
    >
      <div class="login-modal-content">
        <p>请使用通达信客户端账号登录</p>
      </div>
    </van-dialog>
  </div>
</template>

<script>
// 复用PC版本的通信工具
import { tryLoginWithTdxW, getIndiInfo, ifLogin } from '@/pages/tdx_wenda_mobile/funcs/communicate';

export default {
  name: 'PageMainPC',
  data() {
    return {
      userInfo: null,
      showLoginModal: false,
      defaultAvatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234691f7"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E'
    };
  },

  async created() {
    await this.initUser();
  },

  methods: {
    async initUser() {
      // 尝试自动登录
      const loggedIn = ifLogin();
      if (loggedIn) {
        await this.fetchUserInfo();
      }
    },

    async fetchUserInfo() {
      try {
        const tdxid = await tryLoginWithTdxW();
        if (tdxid) {
          this.userInfo = await getIndiInfo();
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },

    handleLogin() {
      // 这里应该弹出iframe登录
      // 暂时使用模拟登录
      this.userInfo = {
        name: '测试用户',
        avatar: '',
        isVip: false
      };
      this.showLoginModal = false;
      this.$toast.success('登录成功');
    },

    handleLogout() {
      this.$dialog.confirm({
        title: '退出登录',
        message: '确定要退出登录吗？'
      }).then(() => {
        this.userInfo = null;
        localStorage.removeItem('TDXID');
        this.$toast.success('已退出登录');
      }).catch(() => {
        // 取消退出
      });
    },

    handleVersionSwitch() {
      if (confirm('确定要切换到普通版本吗？')) {
        window.location.href = '/mobile';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.pc-app {
  width: 100%;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 32px;
  height: 32px;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.version-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.version-switch {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.auth-section {
  display: flex;
  align-items: center;
}

.login-btn {
  padding: 6px 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(70, 145, 247, 0.3);
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
}

.vip-badge {
  padding: 2px 6px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.logout-btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--up-color);
    color: var(--up-color);
  }
}

.login-modal-content {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/page_main_pc.vue | head -50`
Expected: 看到Vue组件代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/page_main_pc.vue
git commit -m "feat: add PC main component with header and user auth"
```

---

### Task 1.7: 安装并配置Vue Router

**Files:**
- Modify: `package.json`
- Create: `src/router.js`
- Modify: `src/pages/tdx_wenda_ai_pc/page_main_pc.js`

**Step 1: 安装Vue Router**

Run:
```bash
cd D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai
npm install vue-router@3 --save
```
Expected: 安装成功，package.json中添加了vue-router@3

**Step 2: 创建路由配置文件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\router.js`

```javascript
import Vue from 'vue';
import VueRouter from 'vue-router';

// 懒加载PC端页面组件
const PCMain = () => import('@/pages/tdx_wenda_ai_pc/views/PCMain.vue');

Vue.use(VueRouter);

const routes = [
  {
    path: '/pc',
    name: 'PCMain',
    component: PCMain,
    props: true
  },
  // 默认路由重定向到PC版
  {
    path: '*',
    redirect: '/pc'
  }
];

const router = new VueRouter({
  mode: 'hash',  // 使用hash模式避免服务器配置问题
  routes
});

export default router;
```

**Step 3: 修改PC入口文件引入路由**

Edit file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\page_main_pc.js`

在第4行后添加：
```javascript
import VueRouter from 'vue-router';
import router from '@/router';

// 注册Vue Router
Vue.use(VueRouter);
```

修改最后的Vue实例创建部分：
```javascript
// 创建PC版Vue实例
new Vue({
  el: '#app-pc',
  router,  // 添加router配置
  render: h => h(PageMainPC),
});
```

**Step 4: 验证安装**

Run: `cat package.json | grep vue-router`
Expected: 看到 `"vue-router": "^3.x"`

**Step 5: Commit**

```bash
git add package.json package-lock.json src/router.js src/pages/tdx_wenda_ai_pc/page_main_pc.js
git commit -m "feat: install and configure Vue Router for PC version"
```

---

### Task 1.8: 创建PCMain主容器组件

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/views/PCMain.vue`

**Step 1: 创建主容器组件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\views\PCMain.vue`

```vue
<template>
  <div class="pc-main">
    <!-- 左侧栏 -->
    <sidebar-left
      :collapsed="sidebarCollapsed"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      @new-chat="handleNewChat"
    />

    <!-- 中间对话区 -->
    <chat-area
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
import SidebarLeft from '../components/SidebarLeft.vue';
import ChatArea from './ChatArea.vue';
import SidebarRight from '../components/SidebarRight.vue';

export default {
  name: 'PCMain',
  components: {
    SidebarLeft,
    ChatArea,
    SidebarRight
  },

  data() {
    return {
      sidebarCollapsed: false,
      detailVisible: false,
      detailData: null
    };
  },

  methods: {
    handleNewChat() {
      console.log('创建新会话');
      // TODO: 清空对话，重置threadId
    },

    handleSendMessage(content) {
      console.log('发送消息:', content);
      // TODO: 调用ChatManager发送消息
    },

    handleShowDetail(data) {
      console.log('显示详情:', data);
      this.detailData = data;
      this.detailVisible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.pc-main {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/views/PCMain.vue`
Expected: 看到主容器组件代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/views/PCMain.vue
git commit -m "feat: add PC main container with three-column layout"
```

---

### Task 1.9: 创建SidebarLeft组件（占位）

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/components/SidebarLeft.vue`

**Step 1: 创建左侧栏组件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\components\SidebarLeft.vue`

```vue
<template>
  <div class="sidebar-left" :class="{ collapsed: collapsed }">
    <!-- 展开状态内容 -->
    <div v-if="!collapsed" class="sidebar-content">
      <button class="new-chat-btn" @click="$emit('new-chat')">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 18px; height: 18px;">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <span>开启新会话</span>
      </button>

      <div class="tab-nav">
        <div class="tab-item active">历史对话</div>
        <div class="tab-item">收藏问句</div>
      </div>

      <div class="history-list">
        <div class="placeholder-text">历史会话列表</div>
        <div class="placeholder-text">（待实现）</div>
      </div>
    </div>

    <!-- 收起状态图标按钮 -->
    <div v-else class="sidebar-collapsed-icons">
      <button class="icon-btn" @click="$emit('new-chat')" title="新会话">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>
      <button class="icon-btn" title="历史对话">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
        </svg>
      </button>
      <button class="icon-btn" title="收藏问句">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      </button>
    </div>

    <!-- 收起/展开按钮 -->
    <button class="sidebar-toggle" @click="$emit('toggle-collapse')">
      {{ collapsed ? '▶' : '◀' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'SidebarLeft',
  props: {
    collapsed: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.sidebar-left {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}

.new-chat-btn {
  margin-bottom: 12px;
  padding: 10px 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(70, 145, 247, 0.35);
  }
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  margin-bottom: 12px;
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    background: rgba(70, 145, 247, 0.1);
  }
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.placeholder-text {
  padding: 12px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}

.sidebar-collapsed-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(3px);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);

  &:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}

.sidebar-toggle {
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 40px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}
</style>
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/components/SidebarLeft.vue | head -50`
Expected: 看到左侧栏组件代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/components/SidebarLeft.vue
git commit -m "feat: add left sidebar component with collapse functionality"
```

---

### Task 1.10: 创建ChatArea组件（占位）

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/views/ChatArea.vue`

**Step 1: 创建对话区域组件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\views\ChatArea.vue`

```vue
<template>
  <div class="chat-area" :style="{ maxWidth: sidebarCollapsed ? '100%' : '1000px' }">
    <!-- 欢迎页面 / 消息列表占位 -->
    <div class="chat-content">
      <div class="placeholder">
        <h2>欢迎使用问小达3.0</h2>
        <p>AI智能对话区域（待实现）</p>
      </div>
    </div>

    <!-- 输入框占位 -->
    <div class="input-area">
      <div class="input-placeholder">请输入您的问题...</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatArea',
  props: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleSend() {
      this.$emit('send-message', '测试消息');
    }
  }
};
</script>

<style lang="scss" scoped>
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: var(--text-secondary);

  h2 {
    font-size: 24px;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  p {
    font-size: 16px;
  }
}

.input-area {
  padding: 0 20px 20px;
}

.input-placeholder {
  height: 120px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(3px);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/views/ChatArea.vue`
Expected: 看到对话区域组件代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/views/ChatArea.vue
git commit -m "feat: add chat area placeholder component"
```

---

### Task 1.11: 创建SidebarRight组件（占位）

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/components/SidebarRight.vue`

**Step 1: 创建右侧详情栏组件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\components\SidebarRight.vue`

```vue
<template>
  <div class="sidebar-right" :class="{ visible: visible }">
    <div v-if="visible" class="detail-content">
      <!-- 详情头部 -->
      <div class="detail-header">
        <h3>选股结果</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <!-- 详情内容占位 -->
      <div class="detail-body">
        <p class="placeholder-text">详情数据表格（待实现）</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarRight',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: null
    }
  }
};
</script>

<style lang="scss" scoped>
.sidebar-right {
  height: 100%;
}

.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

.detail-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.placeholder-text {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
  margin-top: 40px;
}
</style>
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/components/SidebarRight.vue`
Expected: 看到右侧详情栏组件代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/components/SidebarRight.vue
git commit -m "feat: add right sidebar placeholder component"
```

---

### Task 1.12: 测试Phase 1 - 验证基础布局

**Files:**
- Test: 整体布局和组件加载

**Step 1: 启动开发服务器**

Run:
```bash
cd D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai
npm run dev
```

Expected: 服务器启动在 `http://localhost:3001`

**Step 2: 测试PC版访问**

Run: 在浏览器中打开 `http://localhost:3001/pc.html`

Expected看到:
- ✅ 三栏布局正确显示（左侧栏260px、中间对话区、右侧栏隐藏）
- ✅ 顶部导航栏显示（品牌logo、登录按钮、版本切换）
- ✅ 左侧栏有"开启新会话"按钮、Tab切换
- ✅ 中间显示"欢迎使用问小达3.0"
- ✅ 侧边栏可以收起/展开
- ✅ 背景是3.0渐变色（紫蓝渐变）

**Step 3: 测试收起/展开功能**

Run: 点击左侧栏的◀按钮

Expected:
- ✅ 左侧栏宽度变为60px
- ✅ 显示3个图标按钮（新会话、历史、收藏）
- ✅ 点击▶按钮可以展开

**Step 4: 检查控制台**

Run: 打开浏览器开发者工具（F12），查看Console

Expected:
- ✅ 无JavaScript错误
- ✅ 无CSS加载错误
- ✅ Vue组件正常挂载

**Step 5: 测试响应式**

Run: 调整浏览器窗口大小

Expected:
- ✅ 最小宽度限制生效（不应低于1024px）
- ✅ 布局不会错乱

**Step 6: Commit验证结果**

如果测试通过:
```bash
git commit --allow-empty -m "test: Phase 1 completed - basic layout works"
```

---

## Phase 2: 核心对话功能

### Task 2.1: 复用ChatManager对话管理器

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/utils/chatManager.js`

**Step 1: 创建PC版ChatManager包装器**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\utils\chatManager.js`

```javascript
// PC版ChatManager包装器，复用移动端的ChatManager
import ChatManager from '@/pages/tdx_wenda_ai_mobile/funcs/ChatManager';

/**
 * PC版对话管理器
 * 复用移动端的ChatManager，提供PC端需要的接口
 */
class PCChatManager {
  constructor() {
    this.chatManager = null;
    this.currentThreadId = null;
    this.messages = [];
    this.callbacks = {
      onThreadId: null,
      onMessage: null,
      onError: null
    };
  }

  /**
   * 初始化对话管理器
   */
  init() {
    this.chatManager = new ChatManager({
      // 会话ID回调
      onThreadId: (threadId) => {
        this.currentThreadId = threadId;
        if (this.callbacks.onThreadId) {
          this.callbacks.onThreadId(threadId);
        }
      },

      // 消息回调
      onMessage: (message) => {
        this.messages.push(message);
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage(message);
        }
      },

      // 错误回调
      onError: (error) => {
        console.error('ChatManager error:', error);
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      }
    });
  }

  /**
   * 发送消息
   * @param {string} content - 用户输入内容
   * @param {object} options - 可选参数
   */
  async sendMessage(content, options = {}) {
    if (!this.chatManager) {
      this.init();
    }

    try {
      const result = await this.chatManager.sendMessage(content, options);
      return result;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  /**
   * 取消当前对话
   */
  async cancelRun() {
    if (this.chatManager) {
      await this.chatManager.cancelRun();
    }
  }

  /**
   * 获取历史会话列表
   */
  async fetchHistoryList() {
    if (!this.chatManager) {
      this.init();
    }

    try {
      const historyList = await this.chatManager.fetchHistoryList();
      return historyList;
    } catch (error) {
      console.error('获取历史列表失败:', error);
      throw error;
    }
  }

  /**
   * 加载历史对话
   * @param {string} threadId - 会话ID
   */
  async loadHistory(threadId) {
    if (!this.chatManager) {
      this.init();
    }

    try {
      const history = await this.chatManager.loadHistory(threadId);
      this.messages = history.messages || [];
      this.currentThreadId = threadId;
      return history;
    } catch (error) {
      console.error('加载历史对话失败:', error);
      throw error;
    }
  }

  /**
   * 清空当前对话
   */
  clearChat() {
    this.messages = [];
    this.currentThreadId = null;
  }

  /**
   * 注册回调
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  /**
   * 获取当前消息列表
   */
  getMessages() {
    return this.messages;
  }

  /**
   * 获取当前会话ID
   */
  getThreadId() {
    return this.currentThreadId;
  }
}

// 导出单例
export default new PCChatManager();
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/utils/chatManager.js | head -50`
Expected: 看到PCChatManager代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/utils/chatManager.js
git commit -m "feat: add PC chat manager wrapper"
```

---

### Task 2.2: 集成输入框组件（复用ui-search）

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/components/InputBox.vue`

**Step 1: 创建PC端输入框组件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\components\InputBox.vue`

```vue
<template>
  <div class="pc-input-box">
    <!-- 复用移动端ui-search组件，调整PC尺寸 -->
    <ui-search
      ref="searchBox"
      :max-width="1000"
      placeholder="请输入您的问题..."
      @send="handleSend"
    />
  </div>
</template>

<script>
// 复用移动端的ui-search组件
import UiSearch from '@/pages/tdx_wenda_ai_mobile/views/ui-search/ui-search.vue';

export default {
  name: 'InputBox',
  components: {
    UiSearch
  },

  methods: {
    handleSend(content) {
      if (content && content.trim()) {
        this.$emit('send', content.trim());
      }
    },

    // 聚焦输入框
    focus() {
      if (this.$refs.searchBox && this.$refs.searchBox.focus) {
        this.$refs.searchBox.focus();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.pc-input-box {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px 20px;

  // 覆盖移动端样式，适配PC
  ::v-deep .ui-search {
    background: linear-gradient(138deg, #e7ebfc 0%, #efe7f8 100%);
    border-radius: 8px;
  }

  ::v-deep .ui-search-main {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(3px);
    border-radius: 8px;
  }
}
</style>
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/components/InputBox.vue`
Expected: 看到输入框组件代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/components/InputBox.vue
git commit -m "feat: add PC input box component reusing ui-search"
```

---

### Task 2.3: 集成消息列表组件

**Files:**
- Create: `src/pages/tdx_wenda_ai_pc/components/MessageList.vue`

**Step 1: 创建消息列表组件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\components\MessageList.vue`

```vue
<template>
  <div class="message-list" ref="messageList">
    <!-- 欢迎页面（无消息时显示） -->
    <div v-if="messages.length === 0" class="welcome-section">
      <ui-welcome @select-question="handleSelectQuestion" />
    </div>

    <!-- 消息列表 -->
    <div v-else class="messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-item"
        :class="message.role"
      >
        <!-- 用户消息 -->
        <div v-if="message.role === 'user'" class="user-message">
          <div class="user-avatar">
            <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="用户">
            <svg v-else viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="message-bubble user-bubble">
            {{ message.content }}
          </div>
        </div>

        <!-- AI消息 -->
        <div v-else class="ai-message">
          <div class="ai-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div class="message-content">
            <!-- 思考过程 -->
            <ui-think
              v-if="message.thinking"
              :thinking="message.thinking"
            />

            <!-- Markdown内容 -->
            <ui-markdown-chat
              :data="message"
              :show-collect="true"
              @show-detail="handleShowDetail"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 复用移动端组件
import UiWelcome from '@/pages/tdx_wenda_ai_mobile/components/ui-welcome/ui-welcome.vue';
import UiThink from '@/pages/tdx_wenda_ai_mobile/components/ui-think/ui-think.vue';
import UiMarkdownChat from '@/pages/tdx_wenda_ai_mobile/components/ui-markdown-chat/ui-markdown-chat.vue';

export default {
  name: 'MessageList',
  components: {
    UiWelcome,
    UiThink,
    UiMarkdownChat
  },

  props: {
    messages: {
      type: Array,
      default: () => []
    },
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },

  methods: {
    handleSelectQuestion(question) {
      this.$emit('select-question', question);
    },

    handleShowDetail(data) {
      this.$emit('show-detail', data);
    },

    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messageList) {
          this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
        }
      });
    }
  },

  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
      },
      deep: true
    }
  },

  mounted() {
    this.scrollToBottom();
  }
};
</script>

<style lang="scss" scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  scroll-behavior: smooth;
}

.welcome-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.messages {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.message-item {
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease;

  &.user {
    display: flex;
    justify-content: flex-end;
  }

  &.assistant {
    display: flex;
    justify-content: flex-start;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 90%;
  margin-left: auto;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-bubble {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  padding: 10px 16px;
  border-radius: 12px 12px 4px 12px;
  box-shadow: 0 2px 8px rgba(70, 145, 247, 0.2);
  word-wrap: break-word;
}

.ai-message {
  display: flex;
  gap: 12px;
  max-width: calc(100% - 46px);
}

.ai-avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-color), #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: var(--shadow-sm);
}
</style>
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/components/MessageList.vue | head -100`
Expected: 看到消息列表组件代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/components/MessageList.vue
git commit -m "feat: add message list component reusing mobile components"
```

---

### Task 2.4: 更新ChatArea组件集成对话功能

**Files:**
- Modify: `src/pages/tdx_wenda_ai_pc/views/ChatArea.vue`

**Step 1: 替换ChatArea组件内容**

Edit file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\views\ChatArea.vue`

完全替换为:

```vue
<template>
  <div class="chat-area" :style="{ maxWidth: sidebarCollapsed ? '100%' : '1000px' }">
    <!-- 消息列表 -->
    <message-list
      :messages="messages"
      :user-info="userInfo"
      @select-question="handleSelectQuestion"
      @show-detail="handleShowDetail"
    />

    <!-- 输入框 -->
    <input-box
      ref="inputBox"
      @send="handleSend"
    />
  </div>
</template>

<script>
import MessageList from '../components/MessageList.vue';
import InputBox from '../components/InputBox.vue';
import chatManager from '../utils/chatManager';

export default {
  name: 'ChatArea',
  components: {
    MessageList,
    InputBox
  },

  props: {
    sidebarCollapsed: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      messages: [],
      userInfo: {
        name: '用户',
        avatar: ''
      }
    };
  },

  created() {
    this.initChatManager();
  },

  methods: {
    initChatManager() {
      // 监听消息回调
      chatManager.on('onMessage', (message) => {
        this.messages = [...chatManager.getMessages()];
      });

      // 监听会话ID回调
      chatManager.on('onThreadId', (threadId) => {
        console.log('当前会话ID:', threadId);
        this.$emit('thread-change', threadId);
      });

      // 初始化ChatManager
      chatManager.init();
    },

    async handleSend(content) {
      try {
        // 添加用户消息
        this.messages.push({
          role: 'user',
          content: content
        });

        // 发送到ChatManager
        await chatManager.sendMessage(content);
      } catch (error) {
        this.$toast.fail('发送失败: ' + error.message);
        // 移除失败的用户消息
        this.messages.pop();
      }
    },

    handleSelectQuestion(question) {
      // 从欢迎页选择问题
      this.$emit('send-message', question);
    },

    handleShowDetail(data) {
      // 显示详情面板
      this.$emit('show-detail', data);
    },

    focus() {
      if (this.$refs.inputBox) {
        this.$refs.inputBox.focus();
      }
    },

    clearMessages() {
      this.messages = [];
      chatManager.clearChat();
    }
  }
};
</script>

<style lang="scss" scoped>
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
</style>
```

**Step 2: 验证修改**

Run: `cat src/pages/tdx_wenda_ai_pc/views/ChatArea.vue`
Expected: 看到更新后的ChatArea代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/views/ChatArea.vue
git commit -m "feat: integrate chat functionality in ChatArea"
```

---

### Task 2.5: 更新PCMain组件集成对话管理

**Files:**
- Modify: `src/pages/tdx_wenda_ai_pc/views/PCMain.vue`

**Step 1: 更新PCMain的handleSendMessage方法**

Edit file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\views\PCMain.vue`

修改methods部分:

```javascript
methods: {
  handleNewChat() {
    console.log('创建新会话');
    // 清空ChatManager
    chatManager.clearChat();
    // 通知ChatArea清空消息
    this.$refs.chatArea.clearMessages();
  },

  handleSendMessage(content) {
    console.log('发送消息:', content);
    // ChatArea会自动调用ChatManager
    // 这里可以做额外的处理（如记录日志等）
  },

  handleShowDetail(data) {
    console.log('显示详情:', data);
    this.detailData = data;
    this.detailVisible = true;
  }
}
```

同时修改template部分，给chat-area添加ref:

```vue
<chat-area
  ref="chatArea"
  :sidebar-collapsed="sidebarCollapsed"
  @send-message="handleSendMessage"
  @show-detail="handleShowDetail"
/>
```

**Step 2: 验证修改**

Run: `grep -A 5 "ref=\"chatArea\"" src/pages/tdx_wenda_ai_pc/views/PCMain.vue`
Expected: 看到ref="chatArea"

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/views/PCMain.vue
git commit -m "feat: integrate chat manager in PCMain"
```

---

### Task 2.6: 测试Phase 2 - 验证对话功能

**Files:**
- Test: 对话流程

**Step 1: 重启开发服务器**

Run: 按 `Ctrl+C` 停止服务器，然后 `npm run dev` 重启

**Step 2: 测试对话功能**

Run: 在浏览器中打开 `http://localhost:3001/pc.html`

测试步骤:
1. 在输入框中输入问题：`你好`
2. 点击发送

Expected:
- ✅ 用户消息立即显示（蓝色气泡）
- ✅ AI开始回复（流式输出）
- ✅ Markdown格式正确渲染
- ✅ 思考过程可以展开/收起（如果启用了深度思考）
- ✅ 消息自动滚动到底部

**Step 3: 测试深度思考**

测试步骤:
1. 点击输入框上方的"深度思考"开关
2. 输入问题：`分析一下贵州茅台的投资价值`
3. 点击发送

Expected:
- ✅ 思考过程正确显示
- ✅ 可以点击展开/收起思考内容
- ✅ 最终回复内容完整

**Step 4: 测试欢迎页**

测试步骤:
1. 点击"开启新会话"
2. 清空对话后应显示欢迎页面

Expected:
- ✅ 欢迎页面正确显示（盘中点评卡片）
- ✅ 推荐问句可以点击
- ✅ 点击推荐问句自动发送

**Step 5: 检查控制台**

Run: 打开开发者工具Console

Expected:
- ✅ 无JavaScript错误
- ✅ 看到ChatManager的日志（如果有的话）
- ✅ API调用正常（查看Network标签）

**Step 6: Commit验证结果**

如果测试通过:
```bash
git commit --allow-empty -m "test: Phase 2 completed - chat functionality works"
```

---

## Phase 3: 左侧侧边栏功能

### Task 3.1: 实现历史会话列表

**Files:**
- Modify: `src/pages/tdx_wenda_ai_pc/components/SidebarLeft.vue`
- Create: `src/pages/tdx_wenda_ai_pc/components/SidebarHistory.vue`

**Step 1: 创建历史会话组件**

Create file: `D:\your-mcp-proxy\问小达网页代码\3.0版本\tdx-wenda-ai\src\pages\tdx_wenda_ai_pc\components\SidebarHistory.vue`

```vue
<template>
  <div class="history-list">
    <div
      v-for="item in historyList"
      :key="item.threadId"
      class="history-item"
      :class="{ active: item.threadId === currentThreadId }"
      @click="handleSelectHistory(item)"
    >
      <div class="history-title">
        <span class="dot"></span>
        {{ item.title }}
      </div>
      <div class="history-time">{{ formatTime(item.timestamp) }}</div>
    </div>

    <div v-if="historyList.length === 0" class="empty-state">
      <p>暂无历史对话</p>
    </div>
  </div>
</template>

<script>
import chatManager from '../utils/chatManager';

export default {
  name: 'SidebarHistory',
  data() {
    return {
      historyList: [],
      currentThreadId: null
    };
  },

  async created() {
    await this.fetchHistoryList();
  },

  methods: {
    async fetchHistoryList() {
      try {
        const list = await chatManager.fetchHistoryList();
        this.historyList = list || [];
      } catch (error) {
        console.error('获取历史列表失败:', error);
        this.$toast.fail('获取历史列表失败');
      }
    },

    async handleSelectHistory(item) {
      try {
        await chatManager.loadHistory(item.threadId);
        this.currentThreadId = item.threadId;
        this.$emit('history-selected', item);
      } catch (error) {
        console.error('加载历史对话失败:', error);
        this.$toast.fail('加载历史对话失败');
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      // 今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }

      // 昨天
      if (diff < 48 * 60 * 60 * 1000) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }

      // 更早
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    },

    refresh() {
      this.fetchHistoryList();
    }
  }
};
</script>

<style lang="scss" scoped>
.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
  border: 1px solid transparent;

  &:hover {
    background: rgba(70, 145, 247, 0.1);
    backdrop-filter: blur(3px);
    border-color: var(--border-light);
  }

  &.active {
    background: rgba(70, 145, 247, 0.15);
    backdrop-filter: blur(3px);
    border-color: rgba(70, 145, 247, 0.3);
  }
}

.history-title {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--primary-color);
  border-radius: 50%;
  flex-shrink: 0;
}

.history-time {
  font-size: 12px;
  color: var(--text-tertiary);
  padding-left: 14px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>
```

**Step 2: 验证文件创建**

Run: `cat src/pages/tdx_wenda_ai_pc/components/SidebarHistory.vue | head -50`
Expected: 看到历史会话组件代码

**Step 3: Commit**

```bash
git add src/pages/tdx_wenda_ai_pc/components/SidebarHistory.vue
git commit -m "feat: add history list component"
```

---

## 截止当前点（Task 3.1完成）

此时已完成Phase 1和Phase 2的全部工作，以及Phase 3的开始部分。剩余工作包括：

**Phase 3 剩余任务:**
- Task 3.2: 实现收藏问句组件
- Task 3.3: 更新SidebarLeft集成历史和收藏
- Task 3.4: 测试Phase 3

**Phase 4: 右侧详情栏**
- Task 4.1-4.5: 详情栏各组件实现

**Phase 5: 完善和测试**
- Task 5.1-5.4: 样式、响应式、动画、最终测试

由于计划已经非常详细，后续任务可以按照相同的粒度继续编写。是否需要我继续写完剩余的所有任务？

---

**计划完成情况:**
- ✅ Phase 1: 完整（12个任务）
- ✅ Phase 2: 完整（6个任务）
- ⏳ Phase 3: 进行中（1/6完成）
- ⏸️ Phase 4: 待编写
- ⏸️ Phase 5: 待编写

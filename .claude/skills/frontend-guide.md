# 前端开发指南

> 精简版 - uni-app + Vue 3 核心规范

---

## 项目结构

```
aity-uni-app-v2/
├── src/
│   ├── pages/           # 页面（在pages.json配置）
│   ├── components/      # 组件
│   ├── stores/          # Pinia状态管理
│   ├── utils/           # 工具函数
│   ├── static/          # 静态资源
│   └── pages.json       # 路由配置
├── dist/
│   ├── build/h5/        # H5编译输出
│   └── build/mp-weixin/ # 小程序编译输出
└── package.json
```

---

## 核心原则

1. **必须使用 uni-app 内置组件** - 确保多端兼容
2. **使用 pages.json 配置路由** - 不是 Vue Router
3. **使用 uni-app API** - 不是浏览器 API
4. **使用 rpx 单位** - 响应式布局

---

## 组件对照表

| 场景 | ✅ 正确（uni-app） | ❌ 错误（HTML） |
|------|-------------------|-----------------|
| 容器 | `<view>` | `<div>` |
| 文本 | `<text>` | `<span>` |
| 图片 | `<image>` | `<img>` |
| 链接 | `<navigator>` | `<a>` |
| 列表 | `<scroll-view>` | `<div overflow>` |

---

## 条件编译

### 模板条件编译
```vue
<template>
  <view>
    <!-- #ifdef H5 -->
    <el-button type="primary">Element按钮</el-button>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <button class="btn-primary">小程序按钮</button>
    <!-- #endif -->
  </view>
</template>
```

### 脚本条件编译
```javascript
// #ifdef H5
import axios from 'axios'
// #endif

// #ifdef MP-WEIXIN
// 使用 uni.request
// #endif
```

### 样式条件编译
```scss
.container {
  /* #ifdef H5 */
  padding: 20px;
  /* #endif */

  /* #ifdef MP-WEIXIN */
  padding: 40rpx;
  /* #endif */
}
```

---

## 路由配置 (pages.json)

```json
{
  "pages": [
    {
      "path": "pages/login/login",
      "style": { "navigationBarTitleText": "登录" }
    },
    {
      "path": "pages/messages/messages",
      "style": {
        "navigationBarTitleText": "消息中心",
        "enablePullDownRefresh": true
      }
    }
  ],
  "tabBar": {
    "list": [
      { "pagePath": "pages/messages/messages", "text": "消息" },
      { "pagePath": "pages/discussions/discussions", "text": "讨论" }
    ]
  }
}
```

---

## 路由跳转 API

```javascript
// 保留当前页，跳转新页面
uni.navigateTo({ url: '/pages/detail/detail?id=123' })

// 关闭当前页，跳转新页面
uni.redirectTo({ url: '/pages/login/login' })

// 返回上一页
uni.navigateBack({ delta: 1 })

// 切换 TabBar
uni.switchTab({ url: '/pages/messages/messages' })

// 关闭所有页面，打开某页
uni.reLaunch({ url: '/pages/login/login' })
```

---

## 网络请求

### 封装 request
```javascript
// src/utils/request.js
const API_BASE_URL = 'https://aity88.online:8443/api'

export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: API_BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + uni.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data)
        } else {
          uni.showToast({ title: res.data.message, icon: 'none' })
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

export const get = (url, data) => request({ url, method: 'GET', data })
export const post = (url, data) => request({ url, method: 'POST', data })
```

### 使用示例
```javascript
import { get, post } from '@/utils/request'

// 获取消息列表
const res = await get('/messages', { page: 1, limit: 20 })

// 发布消息
await post('/messages', { title: '...', content: '...' })
```

---

## 状态管理 (Pinia)

```javascript
// src/stores/user.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(null)

  function setToken(val) {
    token.value = val
    uni.setStorageSync('token', val)
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
  }

  return { token, userInfo, setToken, logout }
})
```

---

## 样式规范

### 使用 rpx 单位
```scss
.container {
  padding: 40rpx;      // 响应式单位

  .title {
    font-size: 36rpx;  // 标题
    font-weight: bold;
  }

  .content {
    font-size: 28rpx;  // 正文
    line-height: 1.6;
  }
}
```

### 常用颜色变量
```scss
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #f5222d;
$text-color: #333333;
$text-secondary: #666666;
$border-color: #e8e8e8;
$bg-color: #f5f5f5;
```

---

## 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 组件不显示 | 用了HTML标签 | 改用uni-app组件 |
| 路由跳转失败 | 用了Vue Router | 改用uni.navigateTo |
| API请求失败 | 用了axios | 改用uni.request |
| 样式不生效 | 用了px | 改用rpx |

---

## 编译命令

```bash
# 开发模式
npm run dev:h5           # H5热更新
npm run dev:mp-weixin    # 小程序热更新

# 生产编译
npm run build:h5         # 编译H5
npm run build:mp-weixin  # 编译微信小程序
```

---

## 开发检查清单

- [ ] 使用 uni-app 内置组件
- [ ] 在 pages.json 配置路由
- [ ] 使用 uni.navigateTo 跳转
- [ ] 使用 uni.request 请求
- [ ] 使用 rpx 单位
- [ ] 测试 H5 和小程序两端

---

**详细文档**: `docs/core/开发指南.md`
**更新**: 2026-02-28

# Uni-App 前端开发规范

> **适用范围**：AITY VIP 项目前端开发
> **技术栈**：Vue 3 (Composition API) + uni-app + Vite
> **核心目标**：同时支持 H5、微信小程序、支付宝小程序、百度小程序、字节跳动小程序多端部署
> **集成目标**：与字节跳动 Trae 编辑器无缝集成，支持 Skill 功能

## 🎯 核心原则

1. **必须使用 uni-app 内置组件**，确保多端兼容性
2. **使用条件编译**处理平台差异（H5端可以使用Element Plus）
3. **使用 pages.json** 配置路由，不是 Vue Router
4. **使用 uni-app 路由 API** 进行页面跳转
5. **使用 uni.request** 进行网络请求（小程序端）
6. **遵循 Trae 编辑器规范**，确保 Skill 功能正常运行
7. **统一代码风格**，使用 ESLint + Prettier 进行代码检查
8. **模块化开发**，提高代码复用性和可维护性

## ✅ 组件使用规范

### uni-app 内置组件（推荐）

这些组件在所有平台都可用：

```vue
<template>
  <view class="container">
    <!-- 布局组件 -->
    <view>容器</view>
    <scroll-view>滚动视图</scroll-view>
    <swiper>轮播</swiper>
    
    <!-- 表单组件 -->
    <button @click="handleClick">按钮</button>
    <input v-model="value" placeholder="请输入" />
    <textarea v-model="content" placeholder="请输入内容" />
    <checkbox v-model="checked">选项</checkbox>
    <radio v-model="selected">单选</radio>
    <switch v-model="enabled" />
    
    <!-- 媒体组件 -->
    <image src="/static/logo.png" mode="aspectFit" />
    <video src="/static/video.mp4" />
    
    <!-- 文本组件 -->
    <text>文本内容</text>
    <rich-text :nodes="htmlContent"></rich-text>
    
    <!-- 导航组件 -->
    <navigator url="/pages/detail/detail">跳转</navigator>
  </view>
</template>
```

### 条件编译（H5端使用Element Plus）

```vue
<template>
  <view class="container">
    <!-- #ifdef H5 -->
    <el-button type="primary" @click="handleClick">按钮</el-button>
    <el-input v-model="value" placeholder="请输入" />
    <el-checkbox v-model="checked">选项</el-checkbox>
    <el-select v-model="selected" placeholder="请选择">
      <el-option label="选项1" value="1" />
      <el-option label="选项2" value="2" />
    </el-select>
    <!-- #endif -->
    
    <!-- #ifdef MP-WEIXIN -->
    <button @click="handleClick">按钮</button>
    <input v-model="value" placeholder="请输入" />
    <checkbox v-model="checked">选项</checkbox>
    <picker @change="onPickerChange">
      <view>{{ selectedLabel }}</view>
    </picker>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
const checked = ref(false)
const selected = ref('1')
const selectedLabel = ref('选项1')

const handleClick = () => {
  console.log('按钮被点击')
}

const onPickerChange = (e) => {
  selected.value = e.detail.value
  selectedLabel.value = e.detail.label
}
</script>
```

## 🚀 路由配置规范

### pages.json（主要路由配置）

```json
{
  "pages": [
    {
      "path": "pages/login/login",
      "style": {
        "navigationBarTitleText": "登录"
      }
    },
    {
      "path": "pages/messages/messages",
      "style": {
        "navigationBarTitleText": "消息中心",
        "enablePullDownRefresh": true
      }
    },
    {
      "path": "pages/message-detail/message-detail",
      "style": {
        "navigationBarTitleText": "消息详情"
      }
    }
  ],
  "globalStyle": {
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "AITY VIP",
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#1890ff",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/messages/messages",
        "text": "消息",
        "iconPath": "static/icon-message.png",
        "selectedIconPath": "static/icon-message-active.png"
      },
      {
        "pagePath": "pages/discussions/discussions",
        "text": "讨论",
        "iconPath": "static/icon-discussion.png",
        "selectedIconPath": "static/icon-discussion-active.png"
      }
    ]
  }
}
```

### 路由跳转API

```javascript
// 跳转到新页面（保留当前页面）
uni.navigateTo({
  url: '/pages/messages/messages?id=123'
})

// 关闭当前页面，跳转到新页面
uni.redirectTo({
  url: '/pages/messages/messages'
})

// 返回上一页
uni.navigateBack({
  delta: 1
})

// 切换TabBar页面
uni.switchTab({
  url: '/pages/messages/messages'
})

// 关闭所有页面，打开到应用内的某个页面
uni.reLaunch({
  url: '/pages/login/login'
})
```

## 📡 API调用规范

### uni.request（推荐）

```javascript
// src/utils/request.js
export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: import.meta.env.VITE_API_BASE_URL + options.url,
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
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export function get(url, params) {
  return request({
    url,
    method: 'GET',
    data: params
  })
}

export function post(url, data) {
  return request({
    url,
    method: 'POST',
    data
  })
}
```

### H5端可选Axios

```javascript
// #ifdef H5
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const token = uni.getStorageSync('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default request
// #endif
```

## 🎨 样式规范

### 使用rpx单位（推荐）

```scss
.container {
  padding: 40rpx;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  
  .content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}
```

### 条件编译样式

```scss
.container {
  padding: 40rpx;
  
  /* #ifdef H5 */
  padding: 20px;
  /* #endif */
}
```

## 📱 平台特定API

### 小程序端API

```javascript
// 获取用户信息
uni.getUserInfo({
  success: (res) => {
    console.log('用户信息', res.userInfo)
  }
})

// 获取位置信息
uni.getLocation({
  type: 'wgs84',
  success: (res) => {
    console.log('位置信息', res)
  }
})

// 扫码
uni.scanCode({
  success: (res) => {
    console.log('扫码结果', res.result)
  }
})

// 分享
uni.share({
  provider: 'weixin',
  title: '分享标题',
  path: '/pages/index/index',
  success: () => {
    console.log('分享成功')
  }
})
```

### H5端API

```javascript
// #ifdef H5
// 使用浏览器API
window.localStorage.setItem('key', 'value')
window.localStorage.getItem('key')
window.open('https://example.com')
// #endif
```

## ⚠️ 常见错误和解决方案

### 1. 组件不显示

**错误**：使用了Element Plus组件，但在小程序端不显示

**原因**：Element Plus仅支持H5端

**解决方案**：使用条件编译
```vue
<!-- #ifdef H5 -->
<el-button>按钮</el-button>
<!-- #endif -->

<!-- #ifdef MP-WEIXIN -->
<button>按钮</button>
<!-- #endif -->
```

### 2. 路由跳转失败

**错误**：使用Vue Router跳转，但在小程序端失败

**原因**：小程序端不支持Vue Router

**解决方案**：使用uni-app路由API
```javascript
// ❌ 错误
router.push('/pages/messages/messages')

// ✅ 正确
uni.navigateTo({
  url: '/pages/messages/messages'
})
```

### 3. API请求失败

**错误**：使用axios，但在小程序端失败

**原因**：小程序端不支持axios

**解决方案**：使用uni.request
```javascript
// ❌ 错误
axios.get('/api/messages')

// ✅ 正确
uni.request({
  url: '/api/messages',
  method: 'GET',
  success: (res) => {
    console.log(res.data)
  }
})
```

### 4. 样式不生效

**错误**：使用px单位，但在小程序端显示不正常

**原因**：小程序端推荐使用rpx单位

**解决方案**：使用rpx单位
```scss
// ❌ 错误
.title {
  font-size: 18px;
}

// ✅ 正确
.title {
  font-size: 36rpx;
}
```

## 📋 开发检查清单

在开发uni-app页面时，请确认：

- [ ] 使用 uni-app 内置组件
- [ ] 使用条件编译处理平台差异
- [ ] 在 pages.json 中配置了页面路由
- [ ] 使用 uni-app 路由 API 进行跳转
- [ ] 使用 uni.request 进行网络请求
- [ ] 使用 rpx 单位设置样式
- [ ] 测试 H5 端运行效果
- [ ] 测试小程序端运行效果
- [ ] 代码符合 ESLint + Prettier 规范
- [ ] 组件命名和文件结构符合项目规范
- [ ] 已处理平台特定的API调用

## 🚀 Trae 编辑器集成指南

### Skill 功能支持

Trae 编辑器已经支持 Skill 功能，您可以通过以下方式使用：

1. **创建 Skill 文件**：在 `.claude/skills` 目录下创建 markdown 文件
2. **编写 Skill 内容**：使用标准 markdown 格式，包含代码示例和说明
3. **集成到 Trae**：Trae 会自动识别并加载这些 Skill 文件

### 最佳实践

- **使用清晰的标题层级**：便于 Trae 编辑器索引和展示
- **提供详细的代码示例**：使用代码块，包含注释说明
- **添加使用场景**：说明在什么情况下使用该 Skill
- **遵循统一的格式**：保持所有 Skill 文件的格式一致

### 示例：创建一个简单的 Skill

```markdown
# 网络请求封装

> **适用场景**：需要在多端进行网络请求时
> **技术栈**：uni-app + Vue 3

## 📋 功能说明

封装 uni.request，支持 Promise 语法，统一处理错误和认证。

## 💻 代码示例

```javascript
// src/utils/request.js
export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: import.meta.env.VITE_API_BASE_URL + options.url,
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
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}
```

## 🎯 使用方法

```javascript
// 导入
import { get, post } from '@/utils/request'

// 使用
async function fetchMessages() {
  try {
    const res = await get('/api/messages')
    console.log(res.data)
  } catch (error) {
    console.error(error)
  }
}
```

---

**文档维护者**：开发团队
**最后更新**：2026-01-30
**适用范围**：AITY VIP 项目前端开发

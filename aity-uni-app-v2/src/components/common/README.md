# 通用Input组件使用说明

## 组件简介

通用Input组件是VIP投研内部分享系统的基础表单组件，基于设计系统 `@/styles/tokens.scss` 构建，提供统一的输入框样式和交互体验。

## 组件路径

```
src/components/common/Input.vue
```

## 导入方式

```javascript
// 方式1: 单独导入
import { Input } from '@/components/common'

// 方式2: 在页面中直接使用
import Input from '@/components/common/Input.vue'
```

## 基础用法

### 1. 基本输入框

```vue
<template>
  <Input
    v-model="value"
    label="用户名"
    placeholder="请输入用户名"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Input } from '@/components/common'

const value = ref('')
</script>
```

### 2. 不同尺寸

组件支持三种尺寸：`small`、`medium`（默认）、`large`

```vue
<!-- 小尺寸 -->
<Input
  v-model="value"
  size="small"
  label="小尺寸输入框"
/>

<!-- 中尺寸（默认） -->
<Input
  v-model="value"
  size="medium"
  label="中尺寸输入框"
/>

<!-- 大尺寸 -->
<Input
  v-model="value"
  size="large"
  label="大尺寸输入框"
/>
```

### 3. 不同类型

支持所有HTML input类型：text、password、number、email、tel等

```vue
<!-- 文本输入 -->
<Input
  v-model="username"
  type="text"
  label="用户名"
/>

<!-- 密码输入 -->
<Input
  v-model="password"
  type="password"
  label="密码"
/>

<!-- 数字输入 -->
<Input
  v-model="age"
  type="number"
  label="年龄"
/>

<!-- 邮箱输入 -->
<Input
  v-model="email"
  type="email"
  label="邮箱"
/>
```

### 4. 错误状态

```vue
<template>
  <Input
    v-model="username"
    label="用户名"
    :error="errorMessage"
  />
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const errorMessage = ref('用户名不能为空')
</script>
```

### 5. 提示信息

```vue
<Input
  v-model="email"
  label="邮箱地址"
  placeholder="example@domain.com"
  hint="我们会向您发送验证邮件"
/>
```

### 6. 禁用状态

```vue
<Input
  v-model="value"
  label="禁用的输入框"
  disabled
/>
```

### 7. 限制输入长度

```vue
<Input
  v-model="title"
  label="标题"
  :maxlength="50"
/>
```

### 8. 事件监听

```vue
<template>
  <Input
    v-model="value"
    label="输入框"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup>
const handleFocus = (e) => {
  console.log('输入框获得焦点', e)
}

const handleBlur = (e) => {
  console.log('输入框失去焦点', e)
}
</script>
```

## Props参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | String/Number | '' | 输入框的值（v-model绑定） |
| type | String | 'text' | 输入框类型，支持text/password/number等 |
| label | String | '' | 输入框标签 |
| placeholder | String | '' | 占位符文本 |
| disabled | Boolean | false | 是否禁用 |
| error | String | '' | 错误提示信息（优先于hint） |
| hint | String | '' | 提示信息 |
| maxlength | Number | 140 | 最大输入长度 |
| size | String | 'medium' | 输入框尺寸：small/medium/large |

## Events事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 值变化时触发 | (value: string\|number) |
| focus | 获得焦点时触发 | (event: Event) |
| blur | 失去焦点时触发 | (event: Event) |

## 样式特性

### 1. 响应式状态

- **默认状态**：白色背景，灰色边框
- **焦点状态**：主色边框（#667eea），带阴影效果
- **错误状态**：红色边框（#ff5252），显示错误信息
- **禁用状态**：灰色背景（#f5f5f5），禁用光标

### 2. 平滑过渡动画

所有状态变化都使用 `cubic-bezier(0.4, 0, 0.2, 1)` 缓动函数，过渡时间为 0.3s

### 3. 设计Token

组件完全遵循设计系统规范：

```scss
// 使用的颜色变量
$primary-color: #667eea
$error-color: #ff5252
$text-primary: #333333
$text-tertiary: #999999
$text-disabled: #cccccc
$border-color: #e0e0e0
$bg-primary: #ffffff
$bg-secondary: #f5f5f5

// 使用的尺寸变量
$font-size-sm: 24rpx
$font-size-md: 28rpx
$radius-xs: 8rpx
$spacing-base: 24rpx
```

## 实际应用示例

### 示例1：登录表单

```vue
<template>
  <view class="login-form">
    <Input
      v-model="formData.account"
      label="用户名/邮箱"
      type="text"
      placeholder="请输入用户名或邮箱"
    />
    <Input
      v-model="formData.password"
      label="密码"
      type="password"
      placeholder="请输入密码"
      @confirm="handleLogin"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { Input } from '@/components/common'

const formData = ref({
  account: '',
  password: ''
})

const handleLogin = () => {
  console.log('登录', formData.value)
}
</script>
```

### 示例2：创建消息表单

```vue
<template>
  <view class="message-form">
    <Input
      v-model="formData.title"
      label="消息标题"
      placeholder="请输入消息标题"
      :maxlength="100"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { Input } from '@/components/common'

const formData = ref({
  title: ''
})
</script>
```

### 示例3：带验证的表单

```vue
<template>
  <view class="form">
    <Input
      v-model="email"
      label="邮箱地址"
      type="email"
      placeholder="example@domain.com"
      :error="emailError"
      hint="我们会向您发送验证邮件"
      @blur="validateEmail"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { Input } from '@/components/common'

const email = ref('')
const emailError = ref('')

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = '邮箱不能为空'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = '邮箱格式不正确'
  } else {
    emailError.value = ''
  }
}
</script>
```

## 注意事项

1. **v-model支持**：组件完全支持Vue 3的v-model语法
2. **错误优先级**：当同时设置 `error` 和 `hint` 时，只显示 `error`
3. ** maxlength限制**：默认最大长度为140，可根据需要调整
4. **尺寸选择**：建议根据使用场景选择合适的尺寸
   - small：紧凑场景，如表格内编辑
   - medium：默认尺寸，适用于大多数场景
   - large：重要信息，如标题、主内容
5. **类型选择**：根据输入内容选择合适的type，以获得更好的移动端键盘支持

## 更新日志

### v1.0.0 (2025-02-03)
- 初始版本发布
- 支持基础输入功能
- 支持三种尺寸
- 支持错误和提示状态
- 支持禁用状态
- 完整的设计系统集成

## 相关文件

- 组件源码：`src/components/common/Input.vue`
- 导出文件：`src/components/common/index.js`
- 设计系统：`src/styles/tokens.scss`
- 使用示例：
  - `src/pages/login/login.vue`
  - `src/pages/create-message/create-message.vue`
  - `src/pages/create-discussion/create-discussion.vue`

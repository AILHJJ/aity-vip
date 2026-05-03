<template>
  <div id="app">
    <!-- 条件编译：H5端使用Vue Router -->
    <template v-if="isH5">
      <router-view />
    </template>
    
    <!-- 条件编译：小程序端使用uni-app页面 -->
    <template v-else>
      <view class="app-container">
        <slot></slot>
      </view>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useUserStore } from './store/user'

const userStore = useUserStore()

const isH5 = computed(() => {
  if (typeof import.meta.env !== 'undefined' && import.meta.env.UNI_PLATFORM) {
    return import.meta.env.UNI_PLATFORM === 'h5'
  }
  if (typeof process !== 'undefined' && process.env && process.env.UNI_PLATFORM) {
    return process.env.UNI_PLATFORM === 'h5'
  }
  return true
})

onMounted(() => {
  // 初始化用户信息
  userStore.initUser()
  
  // 全局错误处理（仅在小程序环境）
  if (typeof uni !== 'undefined') {
    uni.onError((error) => {
      console.error('Global error:', error)
    })
    
    // 页面不存在处理（仅在小程序环境）
    uni.onPageNotFound((res) => {
      console.error('Page not found:', res)
      uni.redirectTo({
        url: '/pages/login/login'
      })
    })
  }
})
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
}

/* 通用样式 */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

.mt-1 {
  margin-top: 8px;
}

.mt-2 {
  margin-top: 16px;
}

.mt-3 {
  margin-top: 24px;
}

.mb-1 {
  margin-bottom: 8px;
}

.mb-2 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 24px;
}

.ml-1 {
  margin-left: 8px;
}

.ml-2 {
  margin-left: 16px;
}

.mr-1 {
  margin-right: 8px;
}

.mr-2 {
  margin-right: 16px;
}

.p-1 {
  padding: 8px;
}

.p-2 {
  padding: 16px;
}

.p-3 {
  padding: 24px;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

/* 输入框样式 */
.input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 加载动画 */
.loading {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state-text {
  font-size: 16px;
  color: #999;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  body {
    font-size: 28rpx;
  }
  
  .btn {
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
  
  .input {
    padding: 20rpx 32rpx;
    font-size: 28rpx;
  }
  
  .loading {
    width: 64rpx;
    height: 64rpx;
    border-width: 6rpx;
  }
  
  .empty-state-icon {
    font-size: 96rpx;
    margin-bottom: 32rpx;
  }
  
  .empty-state-text {
    font-size: 32rpx;
  }
}
</style>
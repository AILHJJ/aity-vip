<template>
  <view class="login-container">
    <view class="login-form">
      <view class="logo">
        <text class="logo-text">投研图灵室</text>
        <text class="logo-subtext">专业投研内部分享平台</text>
      </view>
      
      <view class="form-item">
        <text class="form-label">账号</text>
        <input 
          v-model="loginForm.username" 
          class="form-control" 
          placeholder="请输入用户名或邮箱"
          @keyup.enter="handleLogin"
          :class="{ 'error': error && !loginForm.username }"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">密码</text>
        <input 
          v-model="loginForm.password" 
          class="form-control" 
          type="password" 
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
          :class="{ 'error': error && !loginForm.password }"
        />
      </view>
      
      <view class="form-item remember">
        <checkbox v-model="loginForm.remember" />
        <text class="remember-text">记住我</text>
      </view>
      
      <button 
        class="btn btn-primary login-btn" 
        @click="handleLogin"
        :disabled="loading"
      >
        <view v-if="loading" class="loading"></view>
        <text v-else>登录</text>
      </button>
      
      <view v-if="error" class="message message-error">
        {{ error }}
      </view>
      
      <view class="form-footer">
        <text class="footer-text">© 2026 投研图灵室 - 专业投研内部分享平台</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { loginApi } from '../../api/auth'
import { navigateTo } from '../../utils/navigation'

const userStore = useUserStore()
const loading = ref(false)
const error = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  remember: true
})

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    error.value = '请输入账号和密码'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await loginApi(loginForm)
    
    if (response.code === 200) {
      userStore.setToken(response.data.token)
      userStore.setUser(response.data.user)
      userStore.setLoggedIn(true)
      
      navigateTo('/pages/messages/messages')
    } else {
      error.value = response.message || '登录失败'
    }
  } catch (err) {
    console.error('Login error:', err)
    
    if (err.response) {
      const { status, data } = err.response
      if (status === 401) {
        error.value = '账号或密码错误'
      } else if (data && data.message) {
        error.value = data.message
      } else {
        error.value = `登录失败 (${status})`
      }
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = '网络错误，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const savedUsername = userStore.getUsername()
  if (savedUsername) {
    loginForm.username = savedUsername
  }
  
  const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV
  if (isDev) {
    loginForm.username = 'admin'
    loginForm.password = '123456'
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmMjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iI2ZmZmZmZjIwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+') repeat;
  opacity: 0.3;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.login-form:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.logo {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.logo-text {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.logo-subtext {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: #fafafa;
}

.form-control:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  background-color: #fff;
}

.form-control.error {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.remember {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.remember-text {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.remember-text:hover {
  color: #1890ff;
}

.login-btn {
  width: 100%;
  height: 48px;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border: none;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.login-btn:hover {
  background: linear-gradient(90deg, #40a9ff, #69c0ff);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.login-btn:active {
  transform: translateY(1px);
}

.login-btn:disabled {
  background: #d9d9d9;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.message {
  margin-top: 16px;
  font-size: 14px;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.message-error {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.form-footer {
  margin-top: 32px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.footer-text {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.loading {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .login-form {
    padding: 80rpx;
    margin: 0 40rpx;
    border-radius: 24rpx;
  }
  
  .logo-text {
    font-size: 56rpx;
  }
  
  .logo-subtext {
    font-size: 28rpx;
  }
  
  .form-control {
    padding: 24rpx 32rpx;
    font-size: 28rpx;
    border-radius: 12rpx;
  }
  
  .login-btn {
    height: 80rpx;
    font-size: 32rpx;
    border-radius: 12rpx;
  }
  
  .message {
    font-size: 28rpx;
    padding: 24rpx;
  }
  
  .footer-text {
    font-size: 24rpx;
  }
}
</style>
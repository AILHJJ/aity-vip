<template>
  <view class="login-container">
    <view class="login-form">
      <view class="logo">
        <text class="logo-text">投研图灵室</text>
      </view>
      
      <view class="form-item">
        <text class="form-label">账号</text>
        <input 
          v-model="loginForm.username" 
          class="form-control" 
          placeholder="请输入用户名或邮箱"
          @keyup.enter="handleLogin"
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
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo-text {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
}

.logo-subtext {
  font-size: 14px;
  color: #666;
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
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.remember {
  display: flex;
  align-items: center;
}

.remember-text {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
}

.login-btn {
  width: 100%;
  height: 40px;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 500;
}

.message {
  margin-top: 16px;
  font-size: 14px;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .login-form {
    padding: 80rpx;
    margin: 0 40rpx;
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
  }
  
  .login-btn {
    height: 80rpx;
    font-size: 32rpx;
  }
}
</style>
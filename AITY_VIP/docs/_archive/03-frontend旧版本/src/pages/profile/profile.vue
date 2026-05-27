<template>
  <view class="profile-container">
    <view class="header">
      <text class="title">个人资料</text>
    </view>
    
    <view class="profile-card">
      <view class="profile-header">
        <view class="avatar">
          <text>{{ userInfo?.name?.charAt(0).toUpperCase() }}</text>
        </view>
        <view class="profile-info">
          <text class="profile-name">{{ userInfo?.name }}</text>
          <view class="role-tag" :class="'role-' + userInfo?.role">
            {{ getRoleLabel(userInfo?.role) }}
          </view>
        </view>
      </view>
      
      <view class="divider"></view>
      
      <view class="form">
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input 
            v-model="form.name" 
            class="form-input" 
            disabled
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input 
            v-model="form.email" 
            class="form-input" 
            placeholder="请输入邮箱"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input 
            v-model="form.phone" 
            class="form-input" 
            placeholder="请输入手机号"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input 
            v-model="form.realName" 
            class="form-input" 
            placeholder="请输入真实姓名"
          />
        </view>
        
        <button 
          class="btn btn-primary"
          :disabled="loading"
          @click="handleUpdateProfile"
        >
          {{ loading ? '保存中...' : '保存' }}
        </button>
      </view>
    </view>
    
    <view class="password-card">
      <view class="card-header">
        <text class="card-title">修改密码</text>
      </view>
      
      <view class="form">
        <view class="form-item">
          <text class="form-label">原密码</text>
          <input 
            v-model="passwordForm.oldPassword" 
            class="form-input" 
            type="password"
            placeholder="请输入原密码"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">新密码</text>
          <input 
            v-model="passwordForm.newPassword" 
            class="form-input" 
            type="password"
            placeholder="请输入新密码"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">确认密码</text>
          <input 
            v-model="passwordForm.confirmPassword" 
            class="form-input" 
            type="password"
            placeholder="请再次输入新密码"
          />
        </view>
        
        <button 
          class="btn btn-primary"
          :disabled="passwordLoading"
          @click="handleChangePassword"
        >
          {{ passwordLoading ? '修改中...' : '修改密码' }}
        </button>
      </view>
    </view>
    
    <button class="btn btn-danger logout-btn" @click="handleLogout">
      退出登录
    </button>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { updateProfile, changePassword } from '../../api/auth'

const router = useRouter()
const userStore = useUserStore()

const userInfo = ref(userStore.userInfo)
const loading = ref(false)
const passwordLoading = ref(false)

const form = reactive({
  name: userInfo.value?.name || '',
  email: userInfo.value?.email || '',
  phone: userInfo.value?.phone || '',
  realName: userInfo.value?.realName || ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

async function handleUpdateProfile() {
  if (!form.email) {
    console.error('请输入邮箱')
    return
  }
  
  if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(form.email)) {
    console.error('请输入正确的邮箱地址')
    return
  }
  
  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
    console.error('请输入正确的手机号')
    return
  }
  
  if (form.realName && (form.realName.length < 2 || form.realName.length > 20)) {
    console.error('真实姓名长度在2-20个字符')
    return
  }
  
  try {
    loading.value = true

    await updateProfile({
      email: form.email,
      phone: form.phone,
      real_name: form.realName
    })

    console.log('保存成功')
    await userStore.fetchUserInfo()
    userInfo.value = userStore.userInfo
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}

async function handleChangePassword() {
  if (!passwordForm.oldPassword) {
    console.error('请输入原密码')
    return
  }
  
  if (!passwordForm.newPassword) {
    console.error('请输入新密码')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    console.error('密码长度至少6位')
    return
  }
  
  if (passwordForm.confirmPassword !== passwordForm.newPassword) {
    console.error('两次输入的密码不一致')
    return
  }
  
  try {
    passwordLoading.value = true

    await changePassword({
      old_password: passwordForm.oldPassword,
      new_password: passwordForm.newPassword
    })

    console.log('密码修改成功，请重新登录')

    setTimeout(() => {
      userStore.logout()
      router.push('/login')
    }, 1500)
  } catch (error) {
    console.error('密码修改失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function getRoleLabel(role) {
  const roles = {
    super_admin: '超级管理员',
    admin: '管理员',
    vip_mid: 'VIP用户（中线）',
    vip_short: 'VIP用户（短线）',
    trial: '体验用户'
  }
  return roles[role] || role
}

onMounted(() => {
  userInfo.value = userStore.userInfo
  form.name = userInfo.value?.name || ''
  form.email = userInfo.value?.email || ''
  form.phone = userInfo.value?.phone || ''
  form.realName = userInfo.value?.realName || ''
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.profile-card,
.password-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-name {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.role-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
}

.role-super_admin {
  background: #fff1f0;
  color: #f5222d;
}

.role-admin {
  background: #fff7e6;
  color: #fa8c16;
}

.role-vip_mid,
.role-vip_short {
  background: #f6ffed;
  color: #52c41a;
}

.role-trial {
  background: #e6f7ff;
  color: #1890ff;
}

.divider {
  height: 1px;
  background: #e8e8e8;
  margin-bottom: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: #666;
}

.form-input {
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
}

.form-input:disabled {
  background: #f5f5f5;
  color: #999;
}

.card-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

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

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
}

.btn-danger:hover {
  background-color: #ff7875;
}

.logout-btn {
  width: 100%;
  margin-top: 20px;
}

@media screen and (max-width: 750rpx) {
  .profile-container {
    padding: 20rpx;
  }
  
  .title {
    font-size: 48rpx;
  }
  
  .avatar {
    width: 160rpx;
    height: 160rpx;
    font-size: 64rpx;
  }
  
  .profile-name {
    font-size: 48rpx;
  }
  
  .form-input {
    padding: 20rpx 32rpx;
    font-size: 28rpx;
  }
  
  .btn {
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
}
</style>
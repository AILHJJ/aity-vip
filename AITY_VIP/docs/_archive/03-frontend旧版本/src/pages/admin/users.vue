<template>
  <view class="users-container">
    <view class="header">
      <text class="title">用户管理</text>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        添加用户
      </button>
    </view>
    
    <view class="filter-bar">
      <input 
        v-model="searchKeyword" 
        class="search-input"
        placeholder="搜索用户名或邮箱"
        @input="handleSearch"
      />
      
      <view class="filter-select">
        <picker 
          :value="roleIndex" 
          :range="roleOptions" 
          range-key="label"
          @change="handleRoleChange"
        >
          <view class="picker">
            {{ roleIndex === -1 ? '用户角色' : roleOptions[roleIndex].label }}
          </view>
        </picker>
      </view>
      
      <view class="filter-select">
        <picker 
          :value="statusIndex" 
          :range="statusOptions" 
          range-key="label"
          @change="handleStatusChange"
        >
          <view class="picker">
            {{ statusIndex === -1 ? '用户状态' : statusOptions[statusIndex].label }}
          </view>
        </picker>
      </view>
    </view>
    
    <view v-if="loading" class="loading-container">
      <view class="loading"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else-if="users.length === 0" class="empty-state">
      <text class="empty-state-icon">👥</text>
      <text class="empty-state-text">暂无用户</text>
    </view>
    
    <view v-else class="users-list">
      <view 
        v-for="user in users" 
        :key="user.id"
        class="user-item"
      >
        <view class="user-header">
          <view class="user-avatar">
            <text>{{ user.name?.charAt(0).toUpperCase() }}</text>
          </view>
          <view class="user-info">
            <text class="user-name">{{ user.name }}</text>
            <text class="user-email">{{ user.email }}</text>
          </view>
        </view>
        
        <view class="user-meta">
          <view class="meta-item">
            <text class="meta-label">角色：</text>
            <view class="role-tag" :class="'role-' + user.role">
              {{ getRoleLabel(user.role) }}
            </view>
          </view>
          
          <view class="meta-item">
            <text class="meta-label">状态：</text>
            <view class="status-tag" :class="'status-' + user.status">
              {{ user.status === 'active' ? '活跃' : '未激活' }}
            </view>
          </view>
          
          <view class="meta-item">
            <text class="meta-label">创建时间：</text>
            <text class="meta-value">{{ formatTime(user.created_at) }}</text>
          </view>
        </view>
        
        <view class="user-actions">
          <button 
            class="btn btn-small btn-primary"
            @click="handleEdit(user)"
          >
            编辑
          </button>
          <button 
            v-if="user.role !== 'super_admin'"
            class="btn btn-small btn-danger"
            @click="handleDelete(user)"
          >
            删除
          </button>
        </view>
      </view>
    </view>
    
    <view v-if="total > pageSize" class="pagination">
      <button 
        class="btn btn-small" 
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        上一页
      </button>
      <text class="page-info">{{ currentPage }} / {{ Math.ceil(total / pageSize) }}</text>
      <button 
        class="btn btn-small" 
        :disabled="currentPage >= Math.ceil(total / pageSize)"
        @click="nextPage"
      >
        下一页
      </button>
    </view>
    
    <view v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">添加用户</text>
          <text class="dialog-close" @click="showCreateDialog = false">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">用户名</text>
            <input 
              v-model="userForm.name" 
              class="form-input" 
              placeholder="请输入用户名"
            />
          </view>
          <view class="form-item">
            <text class="form-label">邮箱</text>
            <input 
              v-model="userForm.email" 
              class="form-input" 
              placeholder="请输入邮箱"
            />
          </view>
          <view class="form-item">
            <text class="form-label">密码</text>
            <input 
              v-model="userForm.password" 
              class="form-input" 
              type="password"
              placeholder="请输入密码"
            />
          </view>
          <view class="form-item">
            <text class="form-label">角色</text>
            <picker 
              :value="formRoleIndex" 
              :range="roleOptions" 
              range-key="label"
              @change="handleFormRoleChange"
            >
              <view class="picker-input">
                {{ formRoleIndex === -1 ? '请选择角色' : roleOptions[formRoleIndex].label }}
              </view>
            </picker>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-secondary" @click="showCreateDialog = false">
            取消
          </button>
          <button 
            class="btn btn-primary" 
            :disabled="saving"
            @click="handleCreateUser"
          >
            {{ saving ? '保存中...' : '确定' }}
          </button>
        </view>
      </view>
    </view>
    
    <view v-if="showEditDialog" class="dialog-overlay" @click="showEditDialog = false">
      <view class="dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">编辑用户</text>
          <text class="dialog-close" @click="showEditDialog = false">×</text>
        </view>
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">用户名</text>
            <input 
              v-model="editForm.name" 
              class="form-input" 
              placeholder="请输入用户名"
            />
          </view>
          <view class="form-item">
            <text class="form-label">邮箱</text>
            <input 
              v-model="editForm.email" 
              class="form-input" 
              placeholder="请输入邮箱"
            />
          </view>
          <view class="form-item">
            <text class="form-label">角色</text>
            <picker 
              :value="editRoleIndex" 
              :range="roleOptions" 
              range-key="label"
              @change="handleEditRoleChange"
            >
              <view class="picker-input">
                {{ editRoleIndex === -1 ? '请选择角色' : roleOptions[editRoleIndex].label }}
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">状态</text>
            <picker 
              :value="editStatusIndex" 
              :range="statusOptions" 
              range-key="label"
              @change="handleEditStatusChange"
            >
              <view class="picker-input">
                {{ editStatusIndex === -1 ? '请选择状态' : statusOptions[editStatusIndex].label }}
              </view>
            </picker>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="btn btn-secondary" @click="showEditDialog = false">
            取消
          </button>
          <button 
            class="btn btn-primary" 
            :disabled="saving"
            @click="handleUpdateUser"
          >
            {{ saving ? '保存中...' : '确定' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUsers, createUser, updateUser, deleteUser } from '../../api/user'
import { formatRelativeTime } from '../../utils/time'

const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const roleIndex = ref(-1)
const statusIndex = ref(-1)
const loading = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const saving = ref(false)
const currentUser = ref(null)

const roleOptions = [
  { label: '超级管理员', value: 'super_admin' },
  { label: '管理员', value: 'admin' },
  { label: 'VIP用户（中线）', value: 'vip_mid' },
  { label: 'VIP用户（短线）', value: 'vip_short' },
  { label: '体验用户', value: 'trial' }
]

const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '未激活', value: 'inactive' }
]

const userForm = reactive({
  name: '',
  email: '',
  password: '',
  role: ''
})

const editForm = reactive({
  name: '',
  email: '',
  role: '',
  status: ''
})

const formRoleIndex = ref(-1)
const editRoleIndex = ref(-1)
const editStatusIndex = ref(-1)

async function fetchUsers() {
  try {
    loading.value = true
    const response = await getUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      role: roleIndex.value >= 0 ? roleOptions[roleIndex.value].value : '',
      status: statusIndex.value >= 0 ? statusOptions[statusIndex.value].value : ''
    })

    users.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchUsers()
}

function handleRoleChange(e) {
  roleIndex.value = e.detail.value
  fetchUsers()
}

function handleStatusChange(e) {
  statusIndex.value = e.detail.value
  fetchUsers()
}

function handleFormRoleChange(e) {
  formRoleIndex.value = e.detail.value
  userForm.role = roleOptions[e.detail.value].value
}

function handleEditRoleChange(e) {
  editRoleIndex.value = e.detail.value
  editForm.role = roleOptions[e.detail.value].value
}

function handleEditStatusChange(e) {
  editStatusIndex.value = e.detail.value
  editForm.status = statusOptions[e.detail.value].value
}

function handleEdit(user) {
  currentUser.value = user
  editForm.name = user.name
  editForm.email = user.email
  editForm.role = user.role
  editForm.status = user.status
  
  editRoleIndex.value = roleOptions.findIndex(r => r.value === user.role)
  editStatusIndex.value = statusOptions.findIndex(s => s.value === user.status)
  
  showEditDialog.value = true
}

async function handleCreateUser() {
  if (!userForm.name || !userForm.email || !userForm.password || !userForm.role) {
    console.error('请填写完整信息')
    return
  }
  
  try {
    saving.value = true
    await createUser(userForm)
    showCreateDialog.value = false
    resetUserForm()
    await fetchUsers()
  } catch (error) {
    console.error('创建用户失败:', error)
  } finally {
    saving.value = false
  }
}

async function handleUpdateUser() {
  if (!editForm.name || !editForm.email || !editForm.role || !editForm.status) {
    console.error('请填写完整信息')
    return
  }
  
  try {
    saving.value = true
    await updateUser(currentUser.value.id, editForm)
    showEditDialog.value = false
    await fetchUsers()
  } catch (error) {
    console.error('更新用户失败:', error)
  } finally {
    saving.value = false
  }
}

async function handleDelete(user) {
  try {
    await deleteUser(user.id)
    await fetchUsers()
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

function resetUserForm() {
  userForm.name = ''
  userForm.email = ''
  userForm.password = ''
  userForm.role = ''
  formRoleIndex.value = -1
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchUsers()
  }
}

function nextPage() {
  if (currentPage.value < Math.ceil(total.value / pageSize.value)) {
    currentPage.value++
    fetchUsers()
  }
}

function formatTime(time) {
  return formatRelativeTime(time)
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
  fetchUsers()
})
</script>

<style scoped>
.users-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.filter-select {
  min-width: 120px;
}

.picker {
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state-text {
  font-size: 16px;
  color: #999;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-email {
  font-size: 14px;
  color: #666;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 14px;
  color: #666;
}

.meta-value {
  font-size: 14px;
  color: #333;
}

.role-tag,
.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
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

.status-active {
  background: #f6ffed;
  color: #52c41a;
}

.status-inactive {
  background: #fff1f0;
  color: #f5222d;
}

.user-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
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

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
}

.btn-danger:hover {
  background-color: #ff7875;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  width: 90%;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.dialog-body {
  padding: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
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

.picker-input {
  padding: 10px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
  color: #666;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e8e8e8;
}

.dialog-footer .btn {
  flex: 1;
}

@media screen and (max-width: 750rpx) {
  .users-container {
    padding: 20rpx;
  }
  
  .title {
    font-size: 48rpx;
  }
  
  .search-input {
    padding: 20rpx 32rpx;
    font-size: 28rpx;
  }
  
  .btn {
    padding: 16rpx 32rpx;
    font-size: 28rpx;
  }
}
</style>
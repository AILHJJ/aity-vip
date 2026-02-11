<template>
  <view class="users-container">
    <!-- 顶部标题和操作 -->
    <view class="header">
      <text class="title">用户管理</text>
      <view class="header-actions">
        <text class="user-count">共 {{ total }} 位用户</text>
        <button class="btn btn-primary" @click="showCreateDrawer = true">
          + 添加用户
        </button>
      </view>
    </view>

    <!-- 角色筛选Tab -->
    <view class="role-tabs">
      <view
        v-for="(tab, index) in roleTabs"
        :key="index"
        class="tab-item"
        :class="{ active: currentRoleTab === tab.value }"
        @click="handleRoleTabChange(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-count">({{ tab.count }})</text>
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索用户名或邮箱"
          @input="handleSearch"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">×</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="filteredUsers.length === 0" class="empty-state">
      <text class="empty-icon">👥</text>
      <text class="empty-text">{{ searchKeyword ? '未找到匹配的用户' : '暂无用户数据' }}</text>
    </view>

    <!-- 用户列表 -->
    <view v-else class="users-list">
      <view
        v-for="user in filteredUsers"
        :key="user.id"
        class="user-card"
      >
        <!-- 用户基本信息 -->
        <view class="user-main">
          <view class="user-avatar">
            <text>{{ user.name?.charAt(0).toUpperCase() }}</text>
          </view>
          <view class="user-info">
            <view class="user-name-row">
              <text class="user-name">{{ user.name }}</text>
              <view class="role-badge" :class="'role-' + user.role">
                {{ getRoleLabel(user.role) }}
              </view>
            </view>
            <text class="user-email">{{ user.email }}</text>
            <view class="user-meta">
              <text class="meta-text">创建于 {{ formatDate(user.created_at) }}</text>
            </view>
          </view>
        </view>

        <!-- VIP到期信息 -->
        <view v-if="user.role === 'vip_short' || user.role === 'vip_long'" class="vip-info">
          <view class="expiry-info" :class="{ expiring: isExpiringSoon(user.expireDate) }">
            <text class="expiry-icon">{{ isExpiringSoon(user.expireDate) ? '⚠️' : '✓' }}</text>
            <text class="expiry-text">
              到期时间：{{ user.expireDate || '未设置' }}
            </text>
          </view>
          <text v-if="isExpiringSoon(user.expireDate)" class="expiry-days">
            {{ getDaysRemaining(user.expireDate) }}天后到期
          </text>
        </view>

        <!-- 快速操作 -->
        <view class="user-actions">
          <button class="action-btn" @click="handleEdit(user)">
            <text class="action-icon">✏️</text>
            <text class="action-text">编辑</text>
          </button>
          <button
            v-if="user.role === 'vip_short' || user.role === 'vip_long'"
            class="action-btn"
            @click="handleExtend(user)"
          >
            <text class="action-icon">📅</text>
            <text class="action-text">延期</text>
          </button>
          <button
            v-if="user.role !== 'super_admin'"
            class="action-btn danger"
            @click="handleDelete(user)"
          >
            <text class="action-icon">🗑️</text>
            <text class="action-text">删除</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
      <text class="load-more-text">加载更多</text>
    </view>

    <!-- 添加用户抽屉 -->
    <view v-if="showCreateDrawer" class="drawer-overlay" @click="showCreateDrawer = false">
      <view class="drawer" @click.stop>
        <view class="drawer-header">
          <text class="drawer-title">添加用户</text>
          <text class="drawer-close" @click="showCreateDrawer = false">×</text>
        </view>
        <view class="drawer-body">
          <view class="form-item">
            <text class="form-label">用户名 <text class="required">*</text></text>
            <input
              v-model="userForm.name"
              class="form-input"
              placeholder="请输入用户名"
            />
          </view>
          <view class="form-item">
            <text class="form-label">邮箱 <text class="required">*</text></text>
            <input
              v-model="userForm.email"
              class="form-input"
              placeholder="请输入邮箱"
            />
          </view>
          <view class="form-item">
            <text class="form-label">密码 <text class="required">*</text></text>
            <input
              v-model="userForm.password"
              class="form-input"
              type="password"
              placeholder="请输入密码（6-20位）"
            />
          </view>
          <view class="form-item">
            <text class="form-label">角色 <text class="required">*</text></text>
            <picker
              :value="formRoleIndex"
              :range="roleOptions"
              range-key="label"
              @change="handleFormRoleChange"
            >
              <view class="form-picker">
                {{ formRoleIndex === -1 ? '请选择角色' : roleOptions[formRoleIndex].label }}
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
          <view class="form-item" v-if="isVipRole">
            <text class="form-label">到期时间</text>
            <picker
              mode="date"
              :value="userForm.expireDate"
              @change="handleExpireDateChange"
            >
              <view class="form-picker">
                {{ userForm.expireDate || '请选择到期日期' }}
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="drawer-footer">
          <button class="btn btn-secondary" @click="showCreateDrawer = false">
            取消
          </button>
          <button
            class="btn btn-primary"
            :disabled="saving || !isFormValid"
            @click="handleCreateUser"
          >
            {{ saving ? '创建中...' : '创建' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 编辑用户抽屉 -->
    <view v-if="showEditDrawer" class="drawer-overlay" @click="showEditDrawer = false">
      <view class="drawer" @click.stop>
        <view class="drawer-header">
          <text class="drawer-title">编辑用户</text>
          <text class="drawer-close" @click="showEditDrawer = false">×</text>
        </view>
        <view class="drawer-body">
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
              <view class="form-picker">
                {{ editRoleIndex === -1 ? '请选择角色' : roleOptions[editRoleIndex].label }}
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
          <view class="form-item" v-if="isEditVipRole">
            <text class="form-label">到期时间</text>
            <picker
              mode="date"
              :value="editForm.expireDate"
              @change="handleEditExpireDateChange"
            >
              <view class="form-picker">
                {{ editForm.expireDate || '请选择到期日期' }}
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
          <view class="form-item" v-if="isEditVipRole && editForm.expireDate">
            <view class="quick-extend">
              <text class="quick-extend-label">快速延期：</text>
              <button class="quick-btn" @click="quickExtend(7)">+7天</button>
              <button class="quick-btn" @click="quickExtend(30)">+30天</button>
              <button class="quick-btn" @click="quickExtend(90)">+90天</button>
              <button class="quick-btn" @click="quickExtend(365)">+1年</button>
            </view>
          </view>
        </view>
        <view class="drawer-footer">
          <button class="btn btn-secondary" @click="showEditDrawer = false">
            取消
          </button>
          <button
            class="btn btn-primary"
            :disabled="saving"
            @click="handleUpdateUser"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/admin'

// 数据
const users = ref([])
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const currentRoleTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const hasMore = ref(false)

// 抽屉状态
const showCreateDrawer = ref(false)
const showEditDrawer = ref(false)

// 表单数据
const userForm = ref({
  name: '',
  email: '',
  password: '',
  role: '',
  expireDate: ''
})

const editForm = ref({
  name: '',
  email: '',
  role: '',
  status: '',
  expireDate: ''
})

const currentUser = ref(null)

// 角色相关
const formRoleIndex = ref(-1)
const editRoleIndex = ref(-1)

const roleTabs = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: 'VIP用户', value: 'vip', count: 0 },
  { label: '普通用户', value: 'user', count: 0 },
  { label: '管理员', value: 'admin', count: 0 }
])

const roleOptions = [
  { label: '普通用户', value: 'user' },
  { label: 'VIP短卡', value: 'vip_short' },
  { label: 'VIP长卡', value: 'vip_long' },
  { label: '管理员', value: 'admin' },
  { label: '超级管理员', value: 'super_admin' }
]

// 计算属性
const filteredUsers = computed(() => {
  let result = users.value

  // 角色筛选
  if (currentRoleTab.value !== 'all') {
    if (currentRoleTab.value === 'vip') {
      result = result.filter(u => u.role === 'vip_short' || u.role === 'vip_long')
    } else {
      result = result.filter(u => u.role === currentRoleTab.value)
    }
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(u =>
      u.name?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword)
    )
  }

  return result
})

const isVipRole = computed(() => {
  return userForm.value.role === 'vip_short' || userForm.value.role === 'vip_long'
})

const isEditVipRole = computed(() => {
  return editForm.value.role === 'vip_short' || editForm.value.role === 'vip_long'
})

const isFormValid = computed(() => {
  return userForm.value.name &&
         userForm.value.email &&
         userForm.value.password &&
         userForm.value.role &&
         userForm.value.password.length >= 6
})

// 获取用户列表
async function fetchUsers(reset = false) {
  if (reset) {
    currentPage.value = 1
    users.value = []
  }

  if (loading.value) return

  try {
    loading.value = true
    const response = await getUsers({
      page: currentPage.value,
      limit: pageSize.value
    })

    if (response.code === 200) {
      const newUsers = response.data.list || []
      if (reset) {
        users.value = newUsers
      } else {
        users.value = [...users.value, ...newUsers]
      }
      total.value = response.data.pagination?.total || newUsers.length
      hasMore.value = newUsers.length >= pageSize.value

      // 更新Tab计数
      updateTabCounts()
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    uni.showToast({
      title: '获取用户列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 更新Tab计数
function updateTabCounts() {
  roleTabs.value[0].count = users.value.length // 全部

  roleTabs.value[1].count = users.value.filter(u =>
    u.role === 'vip_short' || u.role === 'vip_long'
  ).length // VIP

  roleTabs.value[2].count = users.value.filter(u => u.role === 'user').length // 普通

  roleTabs.value[3].count = users.value.filter(u =>
    u.role === 'admin' || u.role === 'super_admin'
  ).length // 管理员
}

// 角色Tab切换
function handleRoleTabChange(role) {
  currentRoleTab.value = role
}

// 搜索
function handleSearch() {
  // 搜索是实时的，不需要额外处理
}

function clearSearch() {
  searchKeyword.value = ''
}

// 表单角色选择
function handleFormRoleChange(e) {
  formRoleIndex.value = e.detail.value
  userForm.value.role = roleOptions[e.detail.value].value
}

// 编辑角色选择
function handleEditRoleChange(e) {
  editRoleIndex.value = e.detail.value
  editForm.value.role = roleOptions[e.detail.value].value
}

// 到期日期选择
function handleExpireDateChange(e) {
  userForm.value.expireDate = e.detail.value
}

function handleEditExpireDateChange(e) {
  editForm.value.expireDate = e.detail.value
}

// 快速延期
function quickExtend(days) {
  if (!editForm.value.expireDate) return

  const currentDate = new Date(editForm.value.expireDate)
  currentDate.setDate(currentDate.getDate() + days)
  editForm.value.expireDate = currentDate.toISOString().split('T')[0]
}

// 创建用户
async function handleCreateUser() {
  if (!isFormValid.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  try {
    saving.value = true
    const response = await createUser(userForm.value)

    if (response.code === 200) {
      uni.showToast({
        title: '创建成功',
        icon: 'success'
      })

      showCreateDrawer.value = false
      resetUserForm()

      // 重新获取用户列表，重置到第一页
      await fetchUsers(true)

      // 如果新用户不符合当前筛选，切换到"全部"
      const newUser = response.data
      if (currentRoleTab.value !== 'all') {
        if (currentRoleTab.value === 'vip') {
          if (newUser.role !== 'vip_short' && newUser.role !== 'vip_long') {
            currentRoleTab.value = 'all'
          }
        } else if (newUser.role !== currentRoleTab.value) {
          currentRoleTab.value = 'all'
        }
      }
    }
  } catch (error) {
    console.error('创建用户失败:', error)
    uni.showToast({
      title: error.message || '创建失败',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}

// 编辑用户
function handleEdit(user) {
  currentUser.value = user
  editForm.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    expireDate: user.expireDate || ''
  }

  const roleIndex = roleOptions.findIndex(r => r.value === user.role)
  editRoleIndex.value = roleIndex

  showEditDrawer.value = true
}

// 更新用户
async function handleUpdateUser() {
  if (!editForm.value.name || !editForm.value.email || !editForm.value.role) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  try {
    saving.value = true
    await updateUser(currentUser.value.id, editForm.value)

    uni.showToast({
      title: '更新成功',
      icon: 'success'
    })

    showEditDrawer.value = false

    // 重新获取用户列表
    await fetchUsers(true)
  } catch (error) {
    console.error('更新用户失败:', error)
    uni.showToast({
      title: error.message || '更新失败',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}

// 延期快捷操作
function handleExtend(user) {
  handleEdit(user)
  showEditDrawer.value = true
}

// 删除用户
async function handleDelete(user) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除用户"${user.name}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteUser(user.id)

          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })

          // 重新获取用户列表
          await fetchUsers(true)
        } catch (error) {
          console.error('删除用户失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 重置表单
function resetUserForm() {
  userForm.value = {
    name: '',
    email: '',
    password: '',
    role: '',
    expireDate: ''
  }
  formRoleIndex.value = -1
}

// 获取角色标签
function getRoleLabel(role) {
  const option = roleOptions.find(r => r.value === role)
  return option ? option.label : role
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 判断是否快到期
function isExpiringSoon(dateStr) {
  if (!dateStr) return false

  const expireDate = new Date(dateStr)
  const today = new Date()
  const diffTime = expireDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays <= 30 && diffDays >= 0
}

// 获取剩余天数
function getDaysRemaining(dateStr) {
  if (!dateStr) return 0

  const expireDate = new Date(dateStr)
  const today = new Date()
  const diffTime = expireDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 加载更多
function loadMore() {
  currentPage.value++
  fetchUsers()
}

// 页面加载
onMounted(() => {
  fetchUsers(true)
})
</script>

<style lang="scss" scoped>
.users-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

/* 顶部 */
.header {
  background: #ffffff;
  padding: 32rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.user-count {
  font-size: 26rpx;
  color: #999;
}

/* 角色Tab */
.role-tabs {
  display: flex;
  background: #ffffff;
  padding: 16rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  gap: 16rpx;
  overflow-x: auto;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex-shrink: 0;
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
}

.tab-count {
  font-size: 24rpx;
  margin-left: 8rpx;
  opacity: 0.8;
}

/* 搜索栏 */
.search-bar {
  background: #ffffff;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.clear-icon {
  font-size: 40rpx;
  color: #999;
  padding: 0 8rpx;
}

/* 加载和空状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 用户列表 */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 20rpx;
}

.user-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.user-main {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
}

.role-badge {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.role-badge.role-user {
  background: #e8f5e9;
  color: #4caf50;
}

.role-badge.role-vip_short,
.role-badge.role-vip_long {
  background: #fff3e0;
  color: #ff9800;
}

.role-badge.role-admin {
  background: #e3f2fd;
  color: #2196f3;
}

.role-badge.role-super_admin {
  background: #fce4ec;
  color: #e91e63;
}

.user-email {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.user-meta {
  display: flex;
  gap: 20rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999;
}

/* VIP信息 */
.vip-info {
  background: #fff9e6;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 16rpx;
  border-left: 4rpx solid #ff9800;
}

.expiry-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.expiry-info.expiring {
  color: #f57c00;
}

.expiry-icon {
  font-size: 24rpx;
}

.expiry-text {
  font-size: 26rpx;
  color: #666;
}

.expiry-days {
  font-size: 24rpx;
  color: #f57c00;
  font-weight: 500;
}

/* 操作按钮 */
.user-actions {
  display: flex;
  gap: 12rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: none;
  font-size: 26rpx;
  transition: all 0.2s ease;
}

.action-btn:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.action-btn.danger {
  background: #fff5f5;
  color: #f44336;
}

.action-btn.danger:active {
  background: #ffe0e0;
}

.action-icon {
  font-size: 28rpx;
}

.action-text {
  font-size: 26rpx;
  color: #666;
}

/* 加载更多 */
.load-more {
  padding: 32rpx;
  text-align: center;
}

.load-more-text {
  font-size: 28rpx;
  color: #667eea;
}

/* 抽屉 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.drawer {
  width: 100%;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.drawer-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a1a1a;
}

.drawer-close {
  font-size: 48rpx;
  color: #999;
  padding: 0 16rpx;
}

.drawer-body {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.drawer-footer {
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  gap: 16rpx;
}

/* 表单 */
.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.required {
  color: #f44336;
}

.form-input {
  width: 100%;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;
}

.form-input:focus {
  background: #ffffff;
  border-color: #667eea;
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  font-size: 32rpx;
  color: #999;
}

.quick-extend {
  margin-top: 16rpx;
}

.quick-extend-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.quick-btn {
  display: inline-block;
  padding: 12rpx 20rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
  background: #f0f2ff;
  color: #667eea;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.quick-btn:active {
  background: #e0e7ff;
}

/* 按钮 */
.btn {
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-primary:active {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-secondary:active {
  background: #e0e0e0;
}
</style>

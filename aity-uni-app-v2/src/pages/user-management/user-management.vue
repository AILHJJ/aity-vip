<template>
	<view class="user-management-container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<input
					class="search-input"
					v-model="searchKeyword"
					type="text"
					placeholder="搜索用户名或邮箱"
					placeholder-style="color: #999999"
					@confirm="handleSearch"
				/>
				<text class="search-icon" @click="handleSearch">🔍</text>
			</view>
			<button class="add-user-btn" @click="handleAddUser">
				<text class="add-icon">+</text>
				<text class="add-text">新增用户</text>
			</button>
		</view>

		<!-- 用户列表 -->
		<scroll-view
			class="users-scroll"
			scroll-y
			@scrolltolower="loadMore"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 加载中 -->
			<view v-if="loading && users.length === 0" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 空状态 -->
			<view v-else-if="users.length === 0" class="empty-state">
				<text class="empty-icon">👥</text>
				<text class="empty-text">暂无用户</text>
			</view>

			<!-- 用户列表 -->
			<view v-else class="users-list">
				<view
					v-for="user in users"
					:key="user.id"
					class="user-item"
				>
					<view class="user-info">
						<view class="user-header">
							<text class="user-name">{{ user.username }}</text>
							<view class="role-badge" :class="'role-' + user.role">
								{{ getRoleLabel(user.role) }}
							</view>
						</view>
						<text class="user-email">{{ user.email }}</text>
						<view class="user-meta">
							<text class="meta-item">状态: {{ user.status === 'active' ? '正常' : '禁用' }}</text>
							<text class="meta-item">到期: {{ user.expiresAt ? formatDate(user.expiresAt) : '永久' }}</text>
						</view>
					</view>
					<view class="user-actions">
						<view class="action-btn edit-btn" @click="handleEdit(user)">
							<text class="action-text">编辑</text>
						</view>
						<view class="action-btn delete-btn" @click="handleDelete(user.id)">
							<text class="action-text">删除</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view v-if="hasMore && !loading" class="load-more">
				<text class="load-more-text">加载更多...</text>
			</view>

			<!-- 没有更多 -->
			<view v-if="!hasMore && users.length > 0" class="no-more">
				<text class="no-more-text">没有更多了</text>
			</view>
		</scroll-view>

		<!-- 编辑弹窗 -->
		<view v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">编辑用户</text>
					<text class="modal-close" @click="closeEditModal">×</text>
				</view>

				<view class="modal-body">
					<!-- 角色 -->
					<view class="form-item">
						<text class="form-label">角色</text>
						<picker
							mode="selector"
							:range="roleOptions"
							range-key="label"
							:value="getRoleIndex(editForm.role)"
							@change="handleRoleChange"
						>
							<view class="picker-view">
								<text class="picker-text">{{ getRoleLabel(editForm.role) }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>

					<!-- 状态 -->
					<view class="form-item">
						<text class="form-label">状态</text>
						<picker
							mode="selector"
							:range="statusOptions"
							range-key="label"
							:value="editForm.status === 'active' ? 0 : 1"
							@change="handleStatusChange"
						>
							<view class="picker-view">
								<text class="picker-text">{{ editForm.status === 'active' ? '正常' : '禁用' }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>

					<!-- 到期时间 -->
					<view class="form-item">
						<text class="form-label">到期时间</text>
						<picker
							mode="date"
							:value="editForm.expiresAt"
							@change="handleDateChange"
						>
							<view class="picker-view">
								<text class="picker-text">{{ editForm.expiresAt || '选择日期' }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
				</view>

				<view class="modal-footer">
					<button class="modal-btn cancel-btn" @click="closeEditModal">取消</button>
					<button class="modal-btn confirm-btn" :disabled="submitting" @click="handleSave">
						{{ submitting ? '保存中...' : '保存' }}
					</button>
				</view>
			</view>
		</view>

		<!-- 新增用户弹窗 -->
		<view v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">新增用户</text>
					<text class="modal-close" @click="closeAddModal">×</text>
				</view>

				<view class="modal-body">
					<!-- 用户名 -->
					<view class="form-item">
						<text class="form-label">用户名 *</text>
						<input
							class="form-input"
							v-model="addForm.username"
							placeholder="请输入用户名"
						/>
					</view>

					<!-- 邮箱 -->
					<view class="form-item">
						<text class="form-label">邮箱 *</text>
						<input
							class="form-input"
							v-model="addForm.email"
							type="email"
							placeholder="请输入邮箱"
						/>
					</view>

					<!-- 密码 -->
					<view class="form-item">
						<text class="form-label">初始密码 *</text>
						<input
							class="form-input"
							v-model="addForm.password"
							type="password"
							placeholder="请输入初始密码"
						/>
						<text class="form-hint">建议使用6位以上包含字母和数字的密码</text>
					</view>

					<!-- 角色 -->
					<view class="form-item">
						<text class="form-label">角色 *</text>
						<picker
							mode="selector"
							:range="roleOptions"
							range-key="label"
							:value="getRoleIndex(addForm.role)"
							@change="handleAddRoleChange"
						>
							<view class="picker-view">
								<text class="picker-text">{{ getRoleLabel(addForm.role) || '选择角色' }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>

					<!-- 到期时间 -->
					<view class="form-item">
						<text class="form-label">到期时间</text>
						<picker
							mode="date"
							:value="addForm.expiresAt"
							@change="handleAddDateChange"
						>
							<view class="picker-view">
								<text class="picker-text">{{ addForm.expiresAt || '永久有效' }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
				</view>

				<view class="modal-footer">
					<button class="modal-btn cancel-btn" @click="closeAddModal">取消</button>
					<button class="modal-btn confirm-btn" :disabled="submitting" @click="handleAddSave">
						{{ submitting ? '创建中...' : '创建用户' }}
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getUsersApi, updateUserApi, deleteUserApi } from '../../api/user'
import { USER_ROLES, USER_ROLE_LABELS } from '../../utils/constants'
import { formatDate } from '../../utils/time'

const userStore = useUserStore()

// 数据
const users = ref([])
const searchKeyword = ref('')
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const limit = ref(20)
const hasMore = ref(true)

// 编辑相关
const showEditModal = ref(false)
const editForm = ref({
	id: null,
	role: '',
	status: '',
	expiresAt: ''
})
const submitting = ref(false)

// 新增用户相关
const showAddModal = ref(false)
const addForm = ref({
	username: '',
	email: '',
	password: '',
	role: 'trial',
	expiresAt: ''
})

// 角色选项
const roleOptions = computed(() => {
	return Object.keys(USER_ROLES).map(key => ({
		value: USER_ROLES[key],
		label: USER_ROLE_LABELS[USER_ROLES[key]]
	}))
})

// 状态选项
const statusOptions = [
	{ label: '正常', value: 'active' },
	{ label: '禁用', value: 'inactive' }
]

// 获取角色标签
const getRoleLabel = (role) => {
	return USER_ROLE_LABELS[role] || role
}

// 获取角色索引
const getRoleIndex = (role) => {
	return roleOptions.value.findIndex(item => item.value === role)
}

// 加载用户列表
const loadUsers = async (isRefresh = false) => {
	if (loading.value) return

	if (isRefresh) {
		page.value = 1
		hasMore.value = true
	}

	loading.value = true

	try {
		const params = {
			page: page.value,
			limit: limit.value
		}

		if (searchKeyword.value) {
			params.keyword = searchKeyword.value
		}

		const res = await getUsersApi(params)

		if (res.success) {
			const newData = res.data.users || res.data.list || []

			if (isRefresh) {
				users.value = newData
			} else {
				users.value = [...users.value, ...newData]
			}

			// 判断是否还有更多
			hasMore.value = users.value.length < res.data.total
		} else {
			uni.showToast({
				title: res.message || '加载失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('加载用户列表失败:', error)
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
		refreshing.value = false
	}
}

// 搜索
const handleSearch = () => {
	loadUsers(true)
}

// 下拉刷新
const onRefresh = () => {
	refreshing.value = true
	loadUsers(true)
}

// 加载更多
const loadMore = () => {
	if (!hasMore.value || loading.value) return
	page.value++
	loadUsers()
}

// 编辑用户
const handleEdit = (user) => {
	editForm.value = {
		id: user.id,
		role: user.role,
		status: user.status,
		expiresAt: user.expiresAt ? formatDate(user.expiresAt) : ''
	}
	showEditModal.value = true
}

// 关闭编辑弹窗
const closeEditModal = () => {
	showEditModal.value = false
	editForm.value = {
		id: null,
		role: '',
		status: '',
		expiresAt: ''
	}
}

// 处理角色选择
const handleRoleChange = (e) => {
	const index = e.detail.value
	editForm.value.role = roleOptions.value[index].value
}

// 处理状态选择
const handleStatusChange = (e) => {
	const index = e.detail.value
	editForm.value.status = statusOptions[index].value
}

// 处理日期选择
const handleDateChange = (e) => {
	editForm.value.expiresAt = e.detail.value
}

// 保存编辑
const handleSave = async () => {
	submitting.value = true

	try {
		const data = {
			role: editForm.value.role,
			status: editForm.value.status
		}

		if (editForm.value.expiresAt) {
			data.expiresAt = editForm.value.expiresAt
		}

		const res = await updateUserApi(editForm.value.id, data)

		if (res.success) {
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})

			// 更新列表中的用户信息
			const index = users.value.findIndex(u => u.id === editForm.value.id)
			if (index > -1) {
				users.value[index] = { ...users.value[index], ...data }
			}

			closeEditModal()
		} else {
			uni.showToast({
				title: res.message || '保存失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('保存失败:', error)
		uni.showToast({
			title: '保存失败',
			icon: 'none'
		})
	} finally {
		submitting.value = false
	}
}

// 删除用户
const handleDelete = async (id) => {
	try {
		uni.showModal({
			title: '提示',
			content: '确定要删除这个用户吗？删除后无法恢复。',
			success: async (res) => {
				if (res.confirm) {
					const result = await deleteUserApi(id)

					if (result.success) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						// 从列表中移除
						users.value = users.value.filter(user => user.id !== id)
					} else {
						uni.showToast({
							title: result.message || '删除失败',
							icon: 'none'
						})
					}
				}
			}
		})
	} catch (error) {
		console.error('删除用户失败:', error)
		uni.showToast({
			title: '删除失败',
			icon: 'none'
		})
	}
}

// 新增用户
const handleAddUser = () => {
	addForm.value = {
		username: '',
		email: '',
		password: '',
		role: 'trial',
		expiresAt: ''
	}
	showAddModal.value = true
}

// 关闭新增弹窗
const closeAddModal = () => {
	showAddModal.value = false
	addForm.value = {
		username: '',
		email: '',
		password: '',
		role: 'trial',
		expiresAt: ''
	}
}

// 处理新增用户角色选择
const handleAddRoleChange = (e) => {
	const index = e.detail.value
	addForm.value.role = roleOptions.value[index].value
}

// 处理新增用户日期选择
const handleAddDateChange = (e) => {
	addForm.value.expiresAt = e.detail.value
}

// 保存新增用户
const handleAddSave = async () => {
	// 验证必填项
	if (!addForm.value.username || !addForm.value.email || !addForm.value.password) {
		uni.showToast({
			title: '请填写必填项',
			icon: 'none'
		})
		return
	}

	// 验证邮箱格式
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(addForm.value.email)) {
		uni.showToast({
			title: '邮箱格式不正确',
			icon: 'none'
		})
		return
	}

	// 验证密码长度
	if (addForm.value.password.length < 6) {
		uni.showToast({
			title: '密码至少6位',
			icon: 'none'
		})
		return
	}

	submitting.value = true

	try {
		const data = {
			username: addForm.value.username,
			email: addForm.value.email,
			password: addForm.value.password,
			role: addForm.value.role
		}

		if (addForm.value.expiresAt) {
			data.expiresAt = addForm.value.expiresAt
		}

		const { createUserApi } = require('../../api/user')
		const res = await createUserApi(data)

		if (res.success || res.code === 200) {
			uni.showToast({
				title: '创建成功',
				icon: 'success'
			})

			closeAddModal()
			loadUsers(true) // 刷新列表
		} else {
			throw new Error(res.message || '创建失败')
		}
	} catch (error) {
		console.error('创建用户失败:', error)
		uni.showToast({
			title: error.message || '创建失败',
			icon: 'none'
		})
	} finally {
		submitting.value = false
	}
}

// 页面加载
onMounted(() => {
	// 检查管理员权限
	if (!userStore.isAdmin) {
		uni.showToast({
			title: '无权限访问',
			icon: 'none'
		})
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
		return
	}

	loadUsers(true)
})
</script>

<style lang="scss" scoped>
.user-management-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f5f5;
}

.search-bar {
	background: #ffffff;
	padding: 20rpx;
	border-bottom: 1rpx solid #e0e0e0;
}

.search-input-wrapper {
	display: flex;
	align-items: center;
	height: 70rpx;
	padding: 0 20rpx;
	background: #f5f5f5;
	border-radius: 35rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
}

.search-icon {
	font-size: 32rpx;
	margin-left: 10rpx;
}

.add-user-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx 24rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 35rpx;
	border: none;
	font-size: 26rpx;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	white-space: nowrap;
}

.add-icon {
	font-size: 32rpx;
	font-weight: bold;
}

.add-text {
	font-size: 26rpx;
}

.users-scroll {
	flex: 1;
	overflow-y: auto;
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #e0e0e0;
	border-top-color: #667eea;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	margin-top: 20rpx;
	font-size: 28rpx;
	color: #999999;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 150rpx 0;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
}

.users-list {
	padding: 20rpx;
}

.user-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.user-info {
	margin-bottom: 20rpx;
}

.user-header {
	display: flex;
	align-items: center;
	gap: 15rpx;
	margin-bottom: 15rpx;
}

.user-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.role-badge {
	padding: 6rpx 16rpx;
	font-size: 22rpx;
	border-radius: 12rpx;
}

.role-super_admin {
	color: #ff4d4f;
	background: #fff1f0;
}

.role-admin {
	color: #faad14;
	background: #fffbe6;
}

.role-vip_mid,
.role-vip_short {
	color: #1890ff;
	background: #e6f7ff;
}

.role-trial {
	color: #999999;
	background: #f5f5f5;
}

.user-email {
	display: block;
	font-size: 26rpx;
	color: #999999;
	margin-bottom: 15rpx;
}

.user-meta {
	display: flex;
	gap: 30rpx;
}

.meta-item {
	font-size: 24rpx;
	color: #666666;
}

.user-actions {
	display: flex;
	gap: 20rpx;
}

.action-btn {
	flex: 1;
	text-align: center;
	padding: 16rpx 0;
	border-radius: 8rpx;
}

.edit-btn {
	background: #e6f7ff;
}

.edit-btn .action-text {
	color: #1890ff;
	font-size: 26rpx;
}

.delete-btn {
	background: #fff1f0;
}

.delete-btn .action-text {
	color: #ff4d4f;
	font-size: 26rpx;
}

.load-more,
.no-more {
	text-align: center;
	padding: 30rpx 0;
}

.load-more-text,
.no-more-text {
	font-size: 26rpx;
	color: #999999;
}

.modal-overlay {
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

.modal-content {
	width: 600rpx;
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #e0e0e0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
}

.modal-close {
	font-size: 48rpx;
	color: #999999;
	line-height: 1;
}

.modal-body {
	padding: 30rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 15rpx;
	font-weight: 500;
}

.form-input {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	background: #f5f5f5;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333333;
	box-sizing: border-box;
}

.form-hint {
	display: block;
	font-size: 24rpx;
	color: #999999;
	margin-top: 8rpx;
}

.picker-view {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 80rpx;
	padding: 0 20rpx;
	background: #f5f5f5;
	border-radius: 8rpx;
}

.picker-text {
	font-size: 28rpx;
	color: #333333;
}

.picker-arrow {
	font-size: 20rpx;
	color: #999999;
}

.modal-footer {
	display: flex;
	gap: 20rpx;
	padding: 30rpx;
	border-top: 1rpx solid #e0e0e0;
}

.modal-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 28rpx;
	border-radius: 8rpx;
	border: none;
	text-align: center;
}

.cancel-btn {
	background: #f5f5f5;
	color: #666666;
}

.confirm-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-weight: bold;
}

.confirm-btn[disabled] {
	opacity: 0.6;
}
</style>

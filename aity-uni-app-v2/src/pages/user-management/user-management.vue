<template>
	<view class="user-management-container">
		<!-- 顶部搜索和创建按钮 -->
		<view class="top-bar">
			<view class="search-wrapper">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input
					class="search-input"
					v-model="searchKeyword"
					placeholder="搜索用户名或邮箱"
					placeholder-style="color: #999999"
					@confirm="handleSearch"
				/>
			</view>
			<button class="create-btn" @click="handleCreateUser">
				<text class="create-icon">+</text>
				<text>新建用户</text>
			</button>
		</view>

		<!-- 角色筛选标签 -->
		<view class="role-tabs">
			<view
				v-for="tab in roleTabs"
				:key="tab.value"
				class="role-tab"
				:class="{ active: currentRoleTab === tab.value }"
				@click="handleRoleTabChange(tab.value)"
			>
				<text class="tab-label">{{ tab.label }}</text>
				<text class="tab-count">({{ tab.count }})</text>
			</view>
		</view>

		<!-- 用户卡片列表 -->
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

			<!-- 用户卡片列表 -->
			<view v-else class="users-grid">
				<view
					v-for="user in users"
					:key="user.id"
					class="user-card"
					:class="{ 'user-inactive': user.status === 'inactive' }"
				>
					<!-- 卡片头部 -->
					<view class="card-header">
						<view class="user-avatar">
							<text class="avatar-text">{{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}</text>
						</view>
						<view class="user-basic-info">
							<text class="card-username">{{ user.name }}</text>
							<text class="card-email">{{ user.email }}</text>
						</view>
						<view class="role-badge" :class="'role-' + user.role">
							{{ getRoleLabel(user.role) }}
						</view>
					</view>

					<!-- 卡片内容 -->
					<view class="card-body">
						<view class="info-row">
							<text class="info-label">状态</text>
							<text class="info-value" :class="'status-' + user.status">
								{{ user.status === 'active' ? '✓ 正常' : '✗ 已禁用' }}
							</text>
						</view>
						<view class="info-row">
							<text class="info-label">到期时间</text>
							<text class="info-value" :class="{ expiring: isExpiringSoon(user.expiresAt) }">
								{{ user.expiresAt ? formatDate(user.expiresAt) : '永久有效' }}
							</text>
						</view>
						<view v-if="isExpiringSoon(user.expiresAt)" class="expiry-warning">
							<text class="warning-icon">⚠️</text>
							<text class="warning-text">VIP即将到期 ({{ getDaysRemaining(user.expiresAt) }}天)</text>
						</view>
					</view>

					<!-- 卡片底部操作 -->
					<view class="card-footer">
						<button class="action-btn edit-btn" @click="handleEdit(user)">
							<text>编辑</text>
						</button>
						<button class="action-btn reset-btn" @click="handleResetPassword(user)">
							<text>重置密码</text>
						</button>
						<button
							v-if="user.status === 'active'"
							class="action-btn deactivate-btn"
							@click="handleDeactivate(user)"
						>
							<text>停用</text>
						</button>
						<button
							v-else
							class="action-btn activate-btn"
							@click="handleActivate(user)"
						>
							<text>启用</text>
						</button>
						<button class="action-btn delete-btn" @click="handleDelete(user.id)">
							<text>删除</text>
						</button>
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

		<!-- 创建/编辑用户底部抽屉 -->
		<view v-if="showCreateDrawer || showEditDrawer" class="drawer-overlay" @click="closeAllDrawers">
			<view class="drawer-content" @click.stop>
				<!-- 抽屉头部 -->
				<view class="drawer-header">
					<text class="drawer-title">{{ showEditDrawer ? '编辑用户' : '新建用户' }}</text>
					<text class="drawer-close" @click="closeAllDrawers">×</text>
				</view>

				<!-- 抽屉表单 -->
				<scroll-view class="drawer-body" scroll-y>
					<!-- 用户名 -->
					<view class="form-item">
						<text class="form-label">用户名 *</text>
						<input
							class="form-input"
							v-model="userForm.name"
							placeholder="请输入用户名"
							:disabled="showEditDrawer"
						/>
					</view>

					<!-- 邮箱 -->
					<view class="form-item">
						<text class="form-label">邮箱（选填）</text>
						<input
							class="form-input"
							v-model="userForm.email"
							type="email"
							placeholder="留空则自动生成默认邮箱"
							:disabled="showEditDrawer"
						/>
						<text class="form-hint">如需邮箱功能（如密码重置），请填写真实邮箱</text>
					</view>

					<!-- 密码（仅创建时显示） -->
					<view v-if="!showEditDrawer" class="form-item">
						<text class="form-label">初始密码 *</text>
						<input
							class="form-input"
							v-model="userForm.password"
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
							:value="getRoleIndex(userForm.role)"
							@change="handleRoleChange"
						>
							<view class="picker-view">
								<text class="picker-text">{{ getRoleLabel(userForm.role) || '选择角色' }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>

					<!-- 到期时间 -->
					<view class="form-item">
						<text class="form-label">到期时间</text>
						<picker
							mode="date"
							:value="userForm.expireDate"
							@change="handleDateChange"
						>
							<view class="picker-view">
								<text class="picker-text">{{ userForm.expireDate || '永久有效' }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
						<text class="form-hint" v-if="!isAdminRole(userForm.role)">
							{{ userForm.role === 'trial' ? '体验用户默认7天' : 'VIP用户默认1个月' }}
						</text>
						<text class="form-hint" v-else>管理员无需设置到期时间</text>
					</view>

					<!-- VIP快速延期（仅编辑时显示） -->
					<view v-if="showEditDrawer && !isAdminRole(userForm.role)" class="form-item">
						<text class="form-label">快速延期</text>
						<view class="quick-extend-buttons">
							<!-- 体验用户：7天 -->
							<template v-if="userForm.role === 'trial'">
								<button
									v-for="days in trialExtendOptions"
									:key="days"
									class="extend-btn"
									@click="quickExtend(days)"
								>
									+{{ days }}天
								</button>
							</template>
							<!-- VIP用户：月度、季度、半年、年度 -->
							<template v-else>
								<button
									class="extend-btn"
									@click="quickExtend(30)"
								>
									+1月
								</button>
								<button
									class="extend-btn"
									@click="quickExtend(90)"
								>
									+3月
								</button>
								<button
									class="extend-btn"
									@click="quickExtend(180)"
								>
									+半年
								</button>
								<button
									class="extend-btn"
									@click="quickExtend(365)"
								>
									+1年
								</button>
							</template>
						</view>
					</view>
				</scroll-view>

				<!-- 抽屉底部按钮 -->
				<view class="drawer-footer">
					<button class="drawer-btn cancel-btn" @click="closeAllDrawers">取消</button>
					<button class="drawer-btn confirm-btn" :disabled="saving" @click="handleSave">
						{{ saving ? '保存中...' : '保存' }}
					</button>
				</view>
			</view>
		</view>

		<!-- 重置密码弹窗 -->
		<view v-if="showResetPasswordModal" class="modal-overlay" @click="closeResetPasswordModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">重置密码</text>
					<text class="modal-close" @click="closeResetPasswordModal">×</text>
				</view>

				<view class="modal-body">
					<view class="user-info">
						<text class="info-label">用户</text>
						<text class="info-value">{{ passwordResetForm.username }}</text>
					</view>
					<view class="user-info">
						<text class="info-label">邮箱</text>
						<text class="info-value">{{ passwordResetForm.email }}</text>
					</view>

					<view class="form-item">
						<text class="form-label">新密码 *</text>
						<input
							class="form-input"
							v-model="passwordResetForm.newPassword"
							type="password"
							placeholder="请输入新密码（至少6位）"
						/>
					</view>

					<view class="form-item">
						<text class="form-label">确认新密码 *</text>
						<input
							class="form-input"
							v-model="passwordResetForm.confirmPassword"
							type="password"
							placeholder="请再次输入新密码"
						/>
					</view>

					<view class="form-item">
						<text class="form-label">管理员密码（选填）</text>
						<input
							class="form-input"
							v-model="passwordResetForm.adminPassword"
							type="password"
							placeholder="填写管理员密码以增加安全性"
						/>
						<text class="form-hint">为了安全，建议输入管理员密码确认操作</text>
					</view>
				</view>

				<view class="modal-footer">
					<button class="modal-btn cancel-btn" @click="closeResetPasswordModal">取消</button>
					<button class="modal-btn confirm-btn" :disabled="resetting" @click="confirmResetPassword">
						{{ resetting ? '重置中...' : '确认重置' }}
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi, deactivateUserApi, activateUserApi, resetUserPasswordApi } from '../../api/user'
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
const currentRoleTab = ref('all')
const totalUsers = ref(0) // 总用户数

// Tab数量缓存（独立存储每个Tab的数量）
const tabCounts = ref({
	all: 0,
	vip_short: 0,
	vip_medium: 0,
	trial: 0,
	admin: 0
})

// 角色标签页（使用独立的tabCounts）
const roleTabs = computed(() => [
	{ label: '全部用户', value: 'all', count: tabCounts.value.all },
	{ label: 'VIP短线', value: 'vip_short', count: tabCounts.value.vip_short },
	{ label: 'VIP中线', value: 'vip_medium', count: tabCounts.value.vip_medium },
	{ label: '试用', value: 'trial', count: tabCounts.value.trial },
	{ label: '管理员', value: 'admin', count: tabCounts.value.admin }
])

// 加载各Tab的数量（独立请求）
const loadTabCounts = async () => {
	try {
		const countPromises = [
			// 全部用户
			getUsersApi({ page: 1, limit: 1 }).then(res => ({ tab: 'all', count: res.data?.pagination?.total || 0 })),
			// VIP短线
			getUsersApi({ page: 1, limit: 1, role: 'vip_short' }).then(res => ({ tab: 'vip_short', count: res.data?.pagination?.total || 0 })),
			// VIP中线
			getUsersApi({ page: 1, limit: 1, role: 'vip_mid' }).then(res => ({ tab: 'vip_medium', count: res.data?.pagination?.total || 0 })),
			// 试用
			getUsersApi({ page: 1, limit: 1, role: 'trial' }).then(res => ({ tab: 'trial', count: res.data?.pagination?.total || 0 })),
			// 管理员
			getUsersApi({ page: 1, limit: 1, role: 'super_admin,admin' }).then(res => ({ tab: 'admin', count: res.data?.pagination?.total || 0 }))
		]

		const results = await Promise.all(countPromises)
		results.forEach(result => {
			tabCounts.value[result.tab] = result.count
		})
	} catch (error) {
		console.error('加载Tab数量失败:', error)
	}
}

// 创建相关
const showCreateDrawer = ref(false)
const showEditDrawer = ref(false)
const saving = ref(false)

// 重置密码相关
const showResetPasswordModal = ref(false)
const resetting = ref(false)
const passwordResetForm = ref({
	userId: null,
	username: '',
	email: '',
	newPassword: '',
	confirmPassword: '',
	adminPassword: ''
})

// 用户表单
const userForm = ref({
	id: null,
	name: '',
	email: '',
	password: '',
	role: 'vip_short', // 默认短线VIP
	expireDate: ''
})

// 快速延期选项（月度、季度、半年、年度、体验7天）
const quickExtendOptions = [30, 90, 180, 365]
const trialExtendOptions = [7] // 体验用户专用

// 角色选项
const roleOptions = computed(() => {
	return Object.keys(USER_ROLES).map(key => ({
		value: USER_ROLES[key],
		label: USER_ROLE_LABELS[USER_ROLES[key]]
	}))
})

// 获取角色标签
const getRoleLabel = (role) => {
	return USER_ROLE_LABELS[role] || role
}

// 获取角色索引
const getRoleIndex = (role) => {
	return roleOptions.value.findIndex(item => item.value === role)
}

// 判断是否是VIP角色
const isVipRole = (role) => {
	return ['vip_short', 'vip_long', 'vip_mid'].includes(role)
}

// 判断是否是管理员角色
const isAdminRole = (role) => {
	return ['super_admin', 'admin'].includes(role)
}

// 判断是否即将到期（30天内）
const isExpiringSoon = (dateStr) => {
	if (!dateStr) return false

	const expireDate = new Date(dateStr)
	const today = new Date()
	const diffTime = expireDate - today
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	return diffDays <= 30 && diffDays >= 0
}

// 获取剩余天数
const getDaysRemaining = (dateStr) => {
	if (!dateStr) return 0

	const expireDate = new Date(dateStr)
	const today = new Date()
	const diffTime = expireDate - today
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	return diffDays > 0 ? diffDays : 0
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

		// 根据当前标签页添加筛选
		// 注意：对于管理员标签，需要传递多个角色，使用逗号分隔的字符串
		if (currentRoleTab.value === 'vip_short') {
			params.role = 'vip_short'
		} else if (currentRoleTab.value === 'vip_medium') {
			params.role = 'vip_mid'
		} else if (currentRoleTab.value === 'trial') {
			params.role = 'trial'
		} else if (currentRoleTab.value === 'admin') {
			// 管理员标签需要同时筛选 super_admin 和 admin
			// 后端需要支持 role 参数为逗号分隔的字符串或数组
			params.role = 'super_admin,admin'
		}

		const res = await getUsersApi(params)

		if (res.success || res.code === 200) {
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

// 角色标签切换
const handleRoleTabChange = (tab) => {
	currentRoleTab.value = tab
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

// 创建用户
const handleCreateUser = () => {
	// 默认角色是 vip_short，设置对应的默认到期时间（1个月）
	const defaultRole = 'vip_short'
	const today = new Date()
	today.setMonth(today.getMonth() + 1) // 默认1个月

	userForm.value = {
		id: null,
		name: '',
		email: '',
		password: '',
		role: defaultRole,
		groupId: userStore.userInfo?.groupId || '', // 自动继承当前管理员的分组
		expireDate: today.toISOString().split('T')[0]
	}
	showCreateDrawer.value = true
}

// 编辑用户
const handleEdit = (user) => {
	userForm.value = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		groupId: user.groupId || user.group_id || '',
		expireDate: user.expireDate || user.expire_date ? formatDate(user.expireDate || user.expire_date) : ''
	}
	showEditDrawer.value = true
}

// 关闭所有抽屉
const closeAllDrawers = () => {
	showCreateDrawer.value = false
	showEditDrawer.value = false
	resetUserForm()
}

// 重置表单
const resetUserForm = () => {
	userForm.value = {
		id: null,
		name: '',
		email: '',
		password: '',
		role: 'vip_short',
		groupId: '',
		expireDate: ''
	}
}

// 处理角色选择
const handleRoleChange = (e) => {
	const index = e.detail.value
	userForm.value.role = roleOptions.value[index].value

	// 根据角色自动设置默认到期时间
	if (!userForm.value.expireDate) {
		setDefaultExpireDate(userForm.value.role)
	}
}

// 根据角色设置默认到期时间
const setDefaultExpireDate = (role) => {
	const today = new Date()

	if (role === 'trial') {
		// 体验用户：默认7天
		today.setDate(today.getDate() + 7)
		userForm.value.expireDate = today.toISOString().split('T')[0]
	} else if (role === 'vip_short' || role === 'vip_mid') {
		// VIP用户：默认1个月（30天）
		today.setDate(today.getDate() + 30)
		userForm.value.expireDate = today.toISOString().split('T')[0]
	} else {
		// 管理员：永久有效（空）
		userForm.value.expireDate = ''
	}
}

// 处理日期选择
const handleDateChange = (e) => {
	userForm.value.expireDate = e.detail.value
}

// 快速延期
const quickExtend = (days) => {
	if (!userForm.value.expireDate) {
		const today = new Date()
		userForm.value.expireDate = today.toISOString().split('T')[0]
	}

	const currentDate = new Date(userForm.value.expireDate)
	currentDate.setDate(currentDate.getDate() + days)
	userForm.value.expireDate = currentDate.toISOString().split('T')[0]
}

// 保存（创建或编辑）
const handleSave = async () => {
	// 验证必填项（用户名必填，邮箱选填）
	if (!userForm.value.name) {
		uni.showToast({
			title: '请填写用户名',
			icon: 'none'
		})
		return
	}

	// 如果填写了邮箱，验证格式
	if (userForm.value.email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(userForm.value.email)) {
			uni.showToast({
				title: '邮箱格式不正确',
				icon: 'none'
			})
			return
		}
	}

	// 验证密码（仅创建时）
	if (!userForm.value.id && !userForm.value.password) {
		uni.showToast({
			title: '请输入密码',
			icon: 'none'
		})
		return
	}

	if (!userForm.value.id && userForm.value.password.length < 6) {
		uni.showToast({
			title: '密码至少6位',
			icon: 'none'
		})
		return
	}

	saving.value = true

	try {
		const data = {
			name: userForm.value.name,
			role: userForm.value.role
		}

		// 只有当邮箱不为空时才发送
		if (userForm.value.email) {
			data.email = userForm.value.email
		}

		// 分组ID（创建时自动继承，编辑时保留）
		if (userForm.value.groupId) {
			data.groupId = userForm.value.groupId
		}

		// 创建时需要密码
		if (!userForm.value.id) {
			data.password = userForm.value.password
		}

		// 到期时间（空字符串转为 null 表示永久有效）
		data.expireDate = userForm.value.expireDate || null

		let res
		if (userForm.value.id) {
			// 编辑
			res = await updateUserApi(userForm.value.id, data)
		} else {
			// 创建
			res = await createUserApi(data)
		}

		if (res.success || res.code === 200) {
			uni.showToast({
				title: userForm.value.id ? '保存成功' : '创建成功',
				icon: 'success'
			})

			closeAllDrawers()

			// 刷新列表和Tab计数
			await Promise.all([
				loadUsers(true),
				loadTabCounts()
			])

			// 如果创建的用户不符合当前筛选，切换到"全部"标签
			if (!userForm.value.id && currentRoleTab.value !== 'all') {
				const newUser = res.data
				let shouldSwitchTab = false

				if (currentRoleTab.value === 'vip_short') {
					shouldSwitchTab = newUser.role !== 'vip_short'
				} else if (currentRoleTab.value === 'vip_medium') {
					shouldSwitchTab = newUser.role !== 'vip_mid'
				} else if (currentRoleTab.value === 'trial') {
					shouldSwitchTab = newUser.role !== 'trial'
				} else if (currentRoleTab.value === 'admin') {
					shouldSwitchTab = newUser.role !== 'super_admin' && newUser.role !== 'admin'
				}

				if (shouldSwitchTab) {
					currentRoleTab.value = 'all'
					// 切换后重新加载
					await loadUsers(true)
				}
			}
		} else {
			throw new Error(res.message || '操作失败')
		}
	} catch (error) {
		console.error('保存失败:', error)
		uni.showToast({
			title: error.message || '保存失败',
			icon: 'none'
		})
	} finally {
		saving.value = false
	}
}

// 停用用户
const handleDeactivate = async (user) => {
	try {
		uni.showModal({
			title: '停用用户',
			content: `确定要停用用户 "${user.name}" 吗？停用后该用户将无法登录。`,
			success: async (res) => {
				if (res.confirm) {
					const result = await deactivateUserApi(user.id)

					if (result.success) {
						uni.showToast({
							title: '已停用',
							icon: 'success'
						})
						// 刷新列表和Tab计数
						await Promise.all([
							loadUsers(true),
							loadTabCounts()
						])
					} else {
						uni.showToast({
							title: result.message || '停用失败',
							icon: 'none'
						})
					}
				}
			}
		})
	} catch (error) {
		console.error('停用用户失败:', error)
		uni.showToast({
			title: '停用失败',
			icon: 'none'
		})
	}
}

// 启用用户
const handleActivate = async (user) => {
	try {
		const result = await activateUserApi(user.id)

		if (result.success) {
			uni.showToast({
				title: '已启用',
				icon: 'success'
			})
			// 刷新列表和Tab计数
			await Promise.all([
				loadUsers(true),
				loadTabCounts()
			])
		} else {
			uni.showToast({
				title: result.message || '启用失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('启用用户失败:', error)
		uni.showToast({
			title: '启用失败',
			icon: 'none'
		})
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
						// 刷新列表和Tab计数
						await Promise.all([
							loadUsers(true),
							loadTabCounts()
						])
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

// 打开重置密码弹窗
const handleResetPassword = (user) => {
	passwordResetForm.value = {
		userId: user.id,
		username: user.name,
		email: user.email,
		newPassword: '',
		confirmPassword: '',
		adminPassword: ''
	}
	showResetPasswordModal.value = true
}

// 关闭重置密码弹窗
const closeResetPasswordModal = () => {
	showResetPasswordModal.value = false
	passwordResetForm.value = {
		userId: null,
		username: '',
		email: '',
		newPassword: '',
		confirmPassword: '',
		adminPassword: ''
	}
}

// 确认重置密码
const confirmResetPassword = async () => {
	// 验证新密码
	if (!passwordResetForm.value.newPassword) {
		uni.showToast({
			title: '请输入新密码',
			icon: 'none'
		})
		return
	}

	if (passwordResetForm.value.newPassword.length < 6) {
		uni.showToast({
			title: '密码至少6位',
			icon: 'none'
		})
		return
	}

	// 验证确认密码
	if (passwordResetForm.value.newPassword !== passwordResetForm.value.confirmPassword) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		})
		return
	}

	resetting.value = true

	try {
		const data = {
			newPassword: passwordResetForm.value.newPassword
		}

		// 如果输入了管理员密码，添加到请求数据中
		if (passwordResetForm.value.adminPassword) {
			data.adminPassword = passwordResetForm.value.adminPassword
		}

		const res = await resetUserPasswordApi(passwordResetForm.value.userId, data)

		if (res.success || res.code === 200) {
			uni.showToast({
				title: '密码重置成功',
				icon: 'success'
			})
			closeResetPasswordModal()
		} else {
			throw new Error(res.message || '重置失败')
		}
	} catch (error) {
		console.error('重置密码失败:', error)
		uni.showToast({
			title: error.message || '重置失败',
			icon: 'none'
		})
	} finally {
		resetting.value = false
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

	// 加载各Tab的数量
	loadTabCounts()

	// 加载用户列表
	loadUsers(true)
})
</script>

<style lang="scss" scoped>
.user-management-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f5f7fa;
}

/* 顶部搜索栏 */
.top-bar {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 20rpx;
	background: #ffffff;
	border-bottom: 1rpx solid #e8eaed;
}

.search-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	height: 70rpx;
	padding: 0 24rpx;
	background: #f5f7fa;
	border-radius: 35rpx;
}

.search-input {
	flex: 1;
	margin-left: 12rpx;
	font-size: 28rpx;
	color: #333333;
}

.create-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 18rpx 28rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	border-radius: 35rpx;
	border: none;
	font-size: 28rpx;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	white-space: nowrap;
}

.create-icon {
	font-size: 32rpx;
	font-weight: bold;
	line-height: 1;
}

/* 角色筛选标签 */
.role-tabs {
	display: flex;
	gap: 16rpx;
	padding: 20rpx;
	background: #ffffff;
	border-bottom: 1rpx solid #e8eaed;
	overflow-x: auto;
	white-space: nowrap;
}

.role-tab {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx 28rpx;
	background: #f5f7fa;
	border-radius: 40rpx;
	transition: all 0.3s ease;
}

.role-tab.active {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
}

.tab-label {
	font-size: 28rpx;
	font-weight: 500;
}

.tab-count {
	font-size: 24rpx;
	opacity: 0.8;
}

/* 用户列表 */
.users-scroll {
	flex: 1;
	overflow-y: auto;
}

.users-grid {
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.user-card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
}

.user-card:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.user-card.user-inactive {
	background: #f5f5f5;
	opacity: 0.7;
}

.user-card.user-inactive .avatar-text {
	color: #999;
}

/* 卡片头部 */
.card-header {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 24rpx;
	padding-bottom: 24rpx;
	border-bottom: 1rpx solid #f0f2f5;
}

.user-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.avatar-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #ffffff;
}

.user-basic-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	min-width: 0;
}

.card-username {
	font-size: 32rpx;
	font-weight: bold;
	color: #1a1a1a;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-email {
	font-size: 26rpx;
	color: #8b95a5;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.role-badge {
	padding: 8rpx 20rpx;
	font-size: 24rpx;
	border-radius: 20rpx;
	font-weight: 500;
	flex-shrink: 0;
}

.role-super_admin {
	color: #ff4d4f;
	background: #fff1f0;
	border: 1rpx solid #ffccc7;
}

.role-admin {
	color: #faad14;
	background: #fffbe6;
	border: 1rpx solid #ffe58f;
}

.role-vip_mid,
.role-vip_short,
.role-vip_long {
	color: #1890ff;
	background: #e6f7ff;
	border: 1rpx solid #91d5ff;
}

.role-trial {
	color: #8b95a5;
	background: #f5f7fa;
	border: 1rpx solid #d9d9d9;
}

/* 卡片内容 */
.card-body {
	margin-bottom: 24rpx;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.info-label {
	font-size: 28rpx;
	color: #8b95a5;
}

.info-value {
	font-size: 28rpx;
	color: #1a1a1a;
	font-weight: 500;
}

.info-value.status-active {
	color: #52c41a;
}

.info-value.status-inactive {
	color: #ff4d4f;
}

.info-value.expiring {
	color: #faad14;
}

.expiry-warning {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx;
	background: #fffbe6;
	border-radius: 12rpx;
	border: 1rpx solid #ffe58f;
	margin-top: 16rpx;
}

.warning-icon {
	font-size: 28rpx;
}

.warning-text {
	font-size: 26rpx;
	color: #d48806;
	flex: 1;
}

/* 卡片底部操作 */
.card-footer {
	display: flex;
	gap: 16rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #f0f2f5;
}

.action-btn {
	flex: 1;
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12rpx;
	font-size: 28rpx;
	border: none;
}

.edit-btn {
	background: #e6f7ff;
	color: #1890ff;
}

.reset-btn {
	background: #fff7e6;
	color: #fa8c16;
}

.deactivate-btn {
	background: #f6f0ff;
	color: #722ed1;
}

.activate-btn {
	background: #f6ffed;
	color: #52c41a;
}

.delete-btn {
	background: #fff1f0;
	color: #ff4d4f;
}

/* 加载状态 */
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

/* 空状态 */
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

/* 底部抽屉 */
.drawer-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

.drawer-content {
	width: 100%;
	max-height: 85vh;
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
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	border-bottom: 1rpx solid #e8eaed;
}

.drawer-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #1a1a1a;
}

.drawer-close {
	font-size: 52rpx;
	color: #8b95a5;
	line-height: 1;
	padding: 0 8rpx;
}

.drawer-body {
	flex: 1;
	padding: 32rpx;
	overflow-y: auto;
}

.form-item {
	margin-bottom: 32rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #1a1a1a;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.form-input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	background: #f5f7fa;
	border-radius: 16rpx;
	font-size: 28rpx;
	color: #1a1a1a;
	box-sizing: border-box;
}

.form-hint {
	display: block;
	font-size: 24rpx;
	color: #8b95a5;
	margin-top: 12rpx;
}

.picker-view {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 24rpx;
	background: #f5f7fa;
	border-radius: 16rpx;
}

.picker-text {
	font-size: 28rpx;
	color: #1a1a1a;
}

.picker-arrow {
	font-size: 24rpx;
	color: #8b95a5;
}

.quick-extend-buttons {
	display: flex;
	gap: 16rpx;
	flex-wrap: wrap;
}

.extend-btn {
	padding: 16rpx 24rpx;
	background: #e6f7ff;
	color: #1890ff;
	border: 1rpx solid #91d5ff;
	border-radius: 12rpx;
	font-size: 26rpx;
}

.drawer-footer {
	display: flex;
	gap: 20rpx;
	padding: 32rpx;
	border-top: 1rpx solid #e8eaed;
}

.drawer-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 32rpx;
	border-radius: 16rpx;
	border: none;
	text-align: center;
	font-weight: 500;
}

.cancel-btn {
	background: #f5f7fa;
	color: #8b95a5;
}

.confirm-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
}

.confirm-btn[disabled] {
	opacity: 0.6;
}

/* 重置密码弹窗 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.modal-content {
	width: 100%;
	max-width: 600rpx;
	background: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
	animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
	from {
		opacity: 0;
		transform: scale(0.9);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	border-bottom: 1rpx solid #e8eaed;
}

.modal-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #1a1a1a;
}

.modal-close {
	font-size: 52rpx;
	color: #8b95a5;
	line-height: 1;
	padding: 0 8rpx;
}

.modal-body {
	padding: 32rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.user-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	margin-bottom: 20rpx;
	background: #f5f7fa;
	border-radius: 12rpx;
	padding: 20rpx;
}

.user-info .info-label {
	font-size: 28rpx;
	color: #8b95a5;
	font-weight: 500;
}

.user-info .info-value {
	font-size: 28rpx;
	color: #1a1a1a;
	font-weight: 500;
}

.modal-footer {
	display: flex;
	gap: 20rpx;
	padding: 32rpx;
	border-top: 1rpx solid #e8eaed;
}

.modal-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 32rpx;
	border-radius: 16rpx;
	border: none;
	text-align: center;
	font-weight: 500;
}

.modal-btn.cancel-btn {
	background: #f5f7fa;
	color: #8b95a5;
}

.modal-btn.confirm-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
}

.modal-btn.confirm-btn[disabled] {
	opacity: 0.6;
}
</style>

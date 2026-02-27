<template>
	<view class="ai-config-container">
		<!-- 顶部操作栏 -->
		<view class="top-actions">
			<button class="action-btn test-all-btn" :disabled="testingAll" @click="handleTestAllConnections">
				<text class="btn-icon">🔍</text>
				<text v-if="!testingAll">一键测试全部</text>
				<text v-else>测试中...</text>
			</button>
			<view class="summary-info" v-if="summary">
				<text class="summary-item available">✅ {{ summary.available }}可用</text>
				<text class="summary-item insufficient">⚠️ {{ summary.insufficientBalance }}欠费</text>
				<text class="summary-item error">❌ {{ summary.error }}异常</text>
			</view>
		</view>

		<!-- 当前默认模型 -->
		<view class="active-model-card" v-if="activeModel">
			<view class="card-header">
				<text class="card-title">当前默认模型</text>
				<view class="active-badge">已启用</view>
			</view>
			<view class="model-info">
				<text class="model-name">{{ activeModel.displayName }}</text>
				<text class="model-provider">{{ activeModel.providerName }}</text>
				<view class="model-features">
					<text class="feature-tag" v-for="(feature, idx) in activeModel.features" :key="idx">
						{{ feature }}
					</text>
				</view>
				<text class="model-desc">{{ activeModel.description }}</text>
			</view>
		</view>

		<!-- 厂商分组列表 -->
		<view class="provider-section" v-for="provider in providers" :key="provider.provider">
			<view class="provider-header">
				<view class="provider-title-row">
					<text class="provider-name">{{ provider.providerName }}</text>
					<text class="model-count">{{ provider.models.length }} 个模型</text>
				</view>
				<view class="provider-actions">
					<button class="small-btn" @click="showApiKeyModal(provider)">
						<text class="btn-icon-small">🔑</text> 更新Key
					</button>
				</view>
			</view>

			<!-- 模型卡片 -->
			<view class="model-card" v-for="model in provider.models" :key="model.id"
				:class="{ 'is-active': model.isActive }">
				<view class="model-card-header">
					<view class="model-title-area">
						<text class="model-display-name">{{ model.displayName }}</text>
						<view class="status-badge" :class="'status-' + model.status">
							{{ getStatusText(model.status) }}
						</view>
					</view>
					<view class="model-actions">
						<button class="icon-btn" @click="testSingleModel(model)" :disabled="model.testing">
							<text v-if="!model.testing">🧪</text>
							<text v-else>⏳</text>
						</button>
						<button class="icon-btn" @click="setDefaultModel(model)" v-if="!model.isActive">
							<text>⭐</text>
						</button>
						<button class="icon-btn" @click="showEditModal(model)">
							<text>✏️</text>
						</button>
					</view>
				</view>

				<view class="model-desc-text">{{ model.description }}</view>

				<view class="model-features-row">
					<text class="feature-chip" v-for="(feature, idx) in model.features" :key="idx">
						{{ feature }}
					</text>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 编辑模型弹窗 -->
		<view class="modal-overlay" v-if="editModalVisible" @click="closeEditModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">编辑模型配置</text>
					<text class="modal-close" @click="closeEditModal">✕</text>
				</view>
				<view class="modal-body">
					<view class="form-group">
						<text class="form-label">显示名称</text>
						<input class="form-input" v-model="editingModel.displayName" placeholder="模型显示名称" />
					</view>
					<view class="form-group">
						<text class="form-label">模型简介</text>
						<input class="form-input" v-model="editingModel.description" placeholder="模型简介描述" />
					</view>
					<view class="form-group">
						<text class="form-label">模型特点（用|分隔）</text>
						<input class="form-input" v-model="editingModel.featuresText" placeholder="快速响应|低成本|稳定可靠" />
					</view>
					<view class="form-group">
						<text class="form-label">API地址</text>
						<input class="form-input" v-model="editingModel.baseUrl" placeholder="API Base URL" />
					</view>
					<view class="form-group">
						<text class="form-label">API密钥</text>
						<input class="form-input" v-model="editingModel.apiKey" placeholder="API Key" type="password" />
					</view>
					<view class="form-group">
						<text class="form-label">提示词模板</text>
						<textarea class="form-textarea" v-model="editingModel.promptTemplate"
							placeholder="优化提示词模板，使用 {content} 作为内容占位符" />
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-btn cancel" @click="closeEditModal">取消</button>
					<button class="modal-btn confirm" @click="saveModelConfig" :disabled="saving">保存</button>
				</view>
			</view>
		</view>

		<!-- 更新API Key弹窗 -->
		<view class="modal-overlay" v-if="apiKeyModalVisible" @click="closeApiKeyModal">
			<view class="modal-content modal-small" @click.stop>
				<view class="modal-header">
					<text class="modal-title">更新 {{ editingProvider?.providerName }} API Key</text>
					<text class="modal-close" @click="closeApiKeyModal">✕</text>
				</view>
				<view class="modal-body">
					<view class="form-group">
						<text class="form-label">新的API Key</text>
						<input class="form-input" v-model="newApiKey" placeholder="输入新的API Key" type="password" />
					</view>
					<text class="form-hint">将更新该厂商下所有 {{ editingProvider?.models?.length }} 个模型</text>
				</view>
				<view class="modal-footer">
					<button class="modal-btn cancel" @click="closeApiKeyModal">取消</button>
					<button class="modal-btn confirm" @click="updateProviderKey" :disabled="saving">更新</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getAiConfigsApi, getActiveAiConfigApi, setActiveModelApi, updateAiConfigApi,
	testAiConnectionApi, testAllAiConnectionsApi, updateProviderApiKeyApi } from '../../api/ai'

const userStore = useUserStore()

// 数据
const loading = ref(false)
const saving = ref(false)
const testingAll = ref(false)
const providers = ref([])
const activeModel = ref(null)
const summary = ref(null)

// 编辑弹窗
const editModalVisible = ref(false)
const editingModel = ref({})

// API Key弹窗
const apiKeyModalVisible = ref(false)
const editingProvider = ref(null)
const newApiKey = ref('')

// 获取状态文本
const getStatusText = (status) => {
	const map = {
		'available': '✅ 可用',
		'insufficient_balance': '⚠️ 欠费',
		'error': '❌ 异常',
		'unknown': '❓ 未知'
	}
	return map[status] || status
}

// 加载所有配置
const loadConfigs = async () => {
	loading.value = true
	try {
		const res = await getAiConfigsApi()
		if (res.code === 200 || res.success) {
			providers.value = res.data || []
		}
	} catch (error) {
		console.error('加载配置失败:', error)
		uni.showToast({ title: '加载配置失败', icon: 'none' })
	} finally {
		loading.value = false
	}
}

// 加载默认模型
const loadActiveModel = async () => {
	try {
		const res = await getActiveAiConfigApi()
		if (res.code === 200 || res.success) {
			activeModel.value = res.data || null
		}
	} catch (error) {
		console.error('加载默认模型失败:', error)
	}
}

// 一键测试全部
const handleTestAllConnections = async () => {
	testingAll.value = true
	summary.value = null
	try {
		const res = await testAllAiConnectionsApi()
		if (res.code === 200 || res.success) {
			summary.value = res.data.summary
			// 刷新列表
			await loadConfigs()
			uni.showToast({ title: '测试完成', icon: 'success' })
		}
	} catch (error) {
		console.error('批量测试失败:', error)
		uni.showToast({ title: '测试失败', icon: 'none' })
	} finally {
		testingAll.value = false
	}
}

// 测试单个模型
const testSingleModel = async (model) => {
	model.testing = true
	try {
		const res = await testAiConnectionApi(model.id)
		if (res.code === 200 || res.success) {
			model.status = res.data.status
			uni.showToast({ title: res.data.message, icon: res.data.available ? 'success' : 'none' })
		}
	} catch (error) {
		console.error('测试失败:', error)
		uni.showToast({ title: '测试失败', icon: 'none' })
	} finally {
		model.testing = false
	}
}

// 设置默认模型
const setDefaultModel = async (model) => {
	try {
		const res = await setActiveModelApi(model.id)
		if (res.code === 200 || res.success) {
			// 更新本地状态
			providers.value.forEach(p => {
				p.models.forEach(m => {
					m.isActive = m.id === model.id
				})
			})
			await loadActiveModel()
			uni.showToast({ title: '已设为默认', icon: 'success' })
		}
	} catch (error) {
		console.error('设置默认失败:', error)
		uni.showToast({ title: '设置失败', icon: 'none' })
	}
}

// 显示编辑弹窗
const showEditModal = (model) => {
	editingModel.value = {
		...model,
		featuresText: (model.features || []).join('|'),
		promptTemplate: model.promptTemplate || ''
	}
	editModalVisible.value = true
}

// 关闭编辑弹窗
const closeEditModal = () => {
	editModalVisible.value = false
	editingModel.value = {}
}

// 保存模型配置
const saveModelConfig = async () => {
	saving.value = true
	try {
		const updateData = {
			displayName: editingModel.value.displayName,
			description: editingModel.value.description,
			features: editingModel.value.featuresText,
			baseUrl: editingModel.value.baseUrl,
			apiKey: editingModel.value.apiKey,
			promptTemplate: editingModel.value.promptTemplate
		}
		const res = await updateAiConfigApi(editingModel.value.id, updateData)
		if (res.code === 200 || res.success) {
			await loadConfigs()
			closeEditModal()
			uni.showToast({ title: '保存成功', icon: 'success' })
		}
	} catch (error) {
		console.error('保存失败:', error)
		uni.showToast({ title: '保存失败', icon: 'none' })
	} finally {
		saving.value = false
	}
}

// 显示API Key弹窗
const showApiKeyModal = (provider) => {
	editingProvider.value = provider
	newApiKey.value = ''
	apiKeyModalVisible.value = true
}

// 关闭API Key弹窗
const closeApiKeyModal = () => {
	apiKeyModalVisible.value = false
	editingProvider.value = null
	newApiKey.value = ''
}

// 更新厂商API Key
const updateProviderKey = async () => {
	if (!newApiKey.value.trim()) {
		uni.showToast({ title: '请输入API Key', icon: 'none' })
		return
	}
	saving.value = true
	try {
		const res = await updateProviderApiKeyApi(editingProvider.value.provider, newApiKey.value)
		if (res.code === 200 || res.success) {
			await loadConfigs()
			closeApiKeyModal()
			uni.showToast({ title: `已更新 ${res.data.updatedCount} 个模型`, icon: 'success' })
		}
	} catch (error) {
		console.error('更新失败:', error)
		uni.showToast({ title: '更新失败', icon: 'none' })
	} finally {
		saving.value = false
	}
}

// 页面加载
onMounted(() => {
	// 检查管理员权限
	if (!userStore.isAdmin) {
		uni.showToast({ title: '无权限访问', icon: 'none' })
		setTimeout(() => uni.navigateBack(), 1500)
		return
	}

	loadConfigs()
	loadActiveModel()
})
</script>

<style lang="scss" scoped>
.ai-config-container {
	min-height: 100vh;
	background: #f5f7fa;
	padding: 20rpx;
	padding-bottom: 40rpx;
}

/* 顶部操作栏 */
.top-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
	flex-wrap: wrap;
	gap: 16rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 20rpx 32rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border-radius: 16rpx;
	font-size: 28rpx;
	font-weight: 500;
	border: none;
}

.action-btn[disabled] {
	opacity: 0.6;
}

.test-all-btn {
	background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.btn-icon {
	font-size: 32rpx;
}

.summary-info {
	display: flex;
	gap: 16rpx;
	flex-wrap: wrap;
}

.summary-item {
	font-size: 24rpx;
	padding: 8rpx 16rpx;
	background: #fff;
	border-radius: 8rpx;

	&.available { color: #52c41a; }
	&.insufficient { color: #faad14; }
	&.error { color: #ff4d4f; }
}

/* 当前默认模型卡片 */
.active-model-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	color: #fff;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.card-title {
	font-size: 28rpx;
	opacity: 0.9;
}

.active-badge {
	background: rgba(255, 255, 255, 0.2);
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.model-info {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.model-name {
	font-size: 36rpx;
	font-weight: bold;
}

.model-provider {
	font-size: 26rpx;
	opacity: 0.8;
}

.model-features {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin: 8rpx 0;
}

.feature-tag {
	background: rgba(255, 255, 255, 0.2);
	padding: 6rpx 16rpx;
	border-radius: 12rpx;
	font-size: 22rpx;
}

.model-desc {
	font-size: 24rpx;
	opacity: 0.8;
	line-height: 1.5;
}

/* 厂商分组 */
.provider-section {
	margin-bottom: 24rpx;
}

.provider-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #fff;
	padding: 24rpx;
	border-radius: 16rpx 16rpx 0 0;
	border-bottom: 2rpx solid #f0f2f5;
}

.provider-title-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.provider-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #1a1a1a;
}

.model-count {
	font-size: 24rpx;
	color: #8b95a5;
	background: #f5f7fa;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
}

.provider-actions {
	display: flex;
	gap: 12rpx;
}

.small-btn {
	display: flex;
	align-items: center;
	gap: 4rpx;
	padding: 12rpx 20rpx;
	background: #f0f5ff;
	color: #667eea;
	border-radius: 12rpx;
	font-size: 24rpx;
	border: none;
}

.btn-icon-small {
	font-size: 24rpx;
}

/* 模型卡片 */
.model-card {
	background: #fff;
	padding: 24rpx;
	border-bottom: 2rpx solid #f5f7fa;
	transition: all 0.3s ease;

	&:last-child {
		border-radius: 0 0 16rpx 16rpx;
		border-bottom: none;
	}

	&.is-active {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
		border-left: 6rpx solid #667eea;
	}
}

.model-card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.model-title-area {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex: 1;
}

.model-display-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.status-badge {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;

	&.status-available {
		background: #f6ffed;
		color: #52c41a;
	}

	&.status-insufficient_balance {
		background: #fffbe6;
		color: #faad14;
	}

	&.status-error {
		background: #fff2f0;
		color: #ff4d4f;
	}

	&.status-unknown {
		background: #f5f7fa;
		color: #8b95a5;
	}
}

.model-actions {
	display: flex;
	gap: 8rpx;
}

.icon-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f7fa;
	border-radius: 12rpx;
	font-size: 28rpx;
	border: none;
	transition: all 0.2s;

	&:active {
		transform: scale(0.95);
	}

	&[disabled] {
		opacity: 0.5;
	}
}

.model-desc-text {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 12rpx;
	line-height: 1.5;
}

.model-features-row {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.feature-chip {
	font-size: 22rpx;
	color: #667eea;
	background: #f0f5ff;
	padding: 4rpx 14rpx;
	border-radius: 10rpx;
}

/* 加载状态 */
.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 60rpx;
}

.loading-text {
	font-size: 28rpx;
	color: #8b95a5;
}

/* 弹窗样式 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal-content {
	width: 90%;
	max-width: 600rpx;
	max-height: 80vh;
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.modal-small {
	max-width: 500rpx;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx;
	border-bottom: 2rpx solid #f0f2f5;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #1a1a1a;
}

.modal-close {
	font-size: 36rpx;
	color: #8b95a5;
	padding: 8rpx;
}

.modal-body {
	padding: 32rpx;
	overflow-y: auto;
	flex: 1;
}

.form-group {
	margin-bottom: 28rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #1a1a1a;
	margin-bottom: 12rpx;
	font-weight: 500;
}

.form-input {
	width: 100%;
	height: 80rpx;
	padding: 0 24rpx;
	background: #f5f7fa;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #1a1a1a;
	box-sizing: border-box;
}

.form-textarea {
	width: 100%;
	min-height: 200rpx;
	padding: 20rpx;
	background: #f5f7fa;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #1a1a1a;
	box-sizing: border-box;
	line-height: 1.5;
}

.form-hint {
	font-size: 24rpx;
	color: #8b95a5;
	margin-top: 12rpx;
}

.modal-footer {
	display: flex;
	gap: 20rpx;
	padding: 24rpx 32rpx;
	border-top: 2rpx solid #f0f2f5;
}

.modal-btn {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	border: none;

	&.cancel {
		background: #f5f7fa;
		color: #666;
	}

	&.confirm {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
	}

	&[disabled] {
		opacity: 0.6;
	}
}
</style>

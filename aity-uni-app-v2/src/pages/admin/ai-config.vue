<template>
	<view class="ai-config-container">
		<!-- Tab切换 -->
		<view class="tab-container">
			<view class="tab-item" :class="{ active: activeTab === 'models' }" @click="switchTab('models')">
				<text class="tab-icon">🤖</text>
				<text class="tab-text">模型管理</text>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'prompts' }" @click="switchTab('prompts')">
				<text class="tab-icon">📝</text>
				<text class="tab-text">提示词管理</text>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'test' }" @click="switchTab('test')">
				<text class="tab-icon">🔍</text>
				<text class="tab-text">连接测试</text>
			</view>
		</view>

		<!-- Tab内容区域 -->
		<view class="tab-content">
			<!-- 模型管理Tab -->
			<view v-if="activeTab === 'models'" class="models-tab">
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

				<!-- 厂商横向标签选择器 -->
				<view class="provider-tabs" v-if="providers.length > 0">
					<view class="provider-tab-item"
						v-for="(provider, index) in providers"
						:key="provider.provider"
						:class="{ active: selectedProviderIndex === index }"
						@click="selectedProviderIndex = index">
						<text class="provider-tab-text">{{ provider.providerName }}</text>
						<text class="provider-tab-count">{{ provider.models.length }}</text>
					</view>
				</view>

				<!-- 当前厂商的模型列表 -->
				<view class="provider-section" v-if="currentProvider">
					<view class="provider-header">
						<view class="provider-title-row">
							<text class="provider-name">{{ currentProvider.providerName }}</text>
							<text class="model-count">{{ currentProvider.models.length }} 个模型</text>
						</view>
						<view class="provider-actions">
							<button class="small-btn" @click="showApiKeyModal(currentProvider)">
								<text class="btn-icon-small">🔑</text> 更新Key
							</button>
						</view>
					</view>

					<!-- 模型卡片 -->
					<view class="model-card" v-for="model in currentProvider.models" :key="model.id"
						:class="{ 'is-active': model.isActive }">
						<view class="model-card-header">
							<view class="model-title-area">
								<text class="model-display-name">{{ model.displayName }}</text>
								<view class="status-badge" :class="'status-' + model.status">
									{{ getStatusText(model.status) }}
								</view>
							</view>
						</view>

						<view class="model-desc-text">{{ model.description }}</view>

						<view class="model-features-row">
							<text class="feature-chip" v-for="(feature, idx) in model.features" :key="idx">
								{{ feature }}
							</text>
						</view>

						<view class="model-actions-row">
							<button class="action-text-btn test-btn" @click="testSingleModel(model)" :disabled="model.testing">
								<text v-if="!model.testing">🧪 测试</text>
								<text v-else>⏳ 测试中</text>
							</button>
							<button class="action-text-btn set-btn" @click="setDefaultModel(model)"
								v-if="!model.isActive" :disabled="model.testing">
								<text>⭐ 设为默认</text>
							</button>
							<button class="action-text-btn edit-btn" @click="showEditModal(model)" :disabled="model.testing">
								<text>✏️ 编辑</text>
							</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 提示词管理Tab -->
			<view v-if="activeTab === 'prompts'" class="prompts-tab">
				<view class="prompt-manager-layout">
					<!-- 可折叠的提示信息 -->
					<view class="prompt-info-collapsible">
						<view class="info-header" @click="togglePromptInfo">
							<text class="info-title">ℹ️ 使用说明</text>
							<text class="info-toggle">{{ promptInfoExpanded ? '▼' : '▶' }}</text>
						</view>
						<view class="info-content" v-if="promptInfoExpanded">
							<text class="info-text">编辑提示词将应用到所有AI模型。系统会自动在末尾追加要优化的消息内容。</text>
						</view>
					</view>

					<!-- 可拉伸的编辑区域 -->
					<view class="prompt-editor-area">
						<text class="editor-label">优化提示词</text>
						<textarea
							class="prompt-textarea-resizable"
							v-model="currentPrompt"
							placeholder="输入AI优化提示词，例如：&#10;1. 使用Markdown格式输出&#10;2. 核心内容置顶&#10;3. 保留原文关键信息&#10;4. 突出操作建议"
							auto-height
							:maxlength="5000"
						/>
						<view class="char-count">{{ currentPrompt.length }}/5000</view>
					</view>

					<!-- 固定底部按钮 -->
					<view class="prompt-footer-actions">
						<button class="footer-action-btn reset-btn" @click="resetToDefault" :disabled="resetting">
							<text>{{ resetting ? '恢复中...' : '恢复默认' }}</text>
						</button>
						<button class="footer-action-btn save-btn" @click="savePromptToAll" :disabled="savingPrompt">
							<text>{{ savingPrompt ? '保存中...' : '应用全部' }}</text>
						</button>
					</view>
				</view>
			</view>

			<!-- 连接测试Tab -->
			<view v-if="activeTab === 'test'" class="test-tab">
				<view class="test-content">
					<view class="test-header">
						<text class="test-title">连接测试</text>
						<text class="test-subtitle">测试所有模型的API连接状态</text>
					</view>

					<view class="test-summary" v-if="summary">
						<text class="summary-item available">✅ {{ summary.available }}可用</text>
						<text class="summary-item insufficient">⚠️ {{ summary.insufficientBalance }}欠费</text>
						<text class="summary-item error">❌ {{ summary.error }}异常</text>
					</view>

					<button class="test-all-btn-large" :disabled="testingAll" @click="handleTestAllConnections">
						<text v-if="!testingAll">🔍 开始测试全部</text>
						<text v-else>⏳ 测试中...</text>
					</button>

					<!-- 测试结果列表 -->
					<view class="test-results" v-if="summary || testingAll">
						<text class="results-title">测试结果</text>
						<view class="result-item" v-for="provider in providers" :key="provider.provider">
							<text class="result-provider">{{ provider.providerName }}</text>
							<view class="result-models">
								<text class="result-model" v-for="model in provider.models" :key="model.id"
									:class="'result-' + model.status">
									{{ model.displayName }} - {{ getStatusShort(model.status) }}
								</text>
							</view>
						</view>
					</view>
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
						<textarea class="form-textarea form-textarea-large" v-model="editingModel.promptTemplate"
							placeholder="输入AI优化提示词，系统会自动在末尾追加要优化的内容" />
						<text class="form-hint">💡 提示：要求AI使用Markdown格式输出，结构化呈现核心观点、分析、操作建议</text>
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

		<!-- 选择提示词来源弹窗 -->
		<view class="modal-overlay" v-if="showPromptSelectModal" @click="showPromptSelectModal = false">
			<view class="modal-content modal-small" @click.stop>
				<view class="modal-header">
					<text class="modal-title">选择提示词来源</text>
					<text class="modal-close" @click="showPromptSelectModal = false">✕</text>
				</view>
				<view class="modal-body">
					<view class="reset-options">
						<view class="reset-option" :class="{ active: selectingPromptType === 'default' }" @click="selectingPromptType = 'default'">
							<text class="option-icon">📝</text>
							<view class="option-content">
								<text class="option-title">通用默认提示词</text>
								<text class="option-desc">所有模型通用的基础提示词</text>
							</view>
						</view>
						<view class="reset-option" :class="{ active: selectingPromptType === 'specific' }" @click="selectingPromptType = 'specific'">
							<text class="option-icon">🎯</text>
							<view class="option-content">
								<text class="option-title">{{ selectingModel?.displayName || '模型' }} 专属提示词</text>
								<text class="option-desc">针对该模型特点优化的提示词</text>
							</view>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-btn cancel" @click="showPromptSelectModal = false">取消</button>
					<button class="modal-btn confirm" @click="confirmPromptSelection">确认</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { getAiConfigsApi, getActiveAiConfigApi, setActiveModelApi, updateAiConfigApi,
	testAiConnectionApi, testAllAiConnectionsApi, updateProviderApiKeyApi,
	getDefaultPromptApi, updateAllPromptsApi, resetAllPromptsApi, applyModelSpecificPromptsApi,
	getPromptOptionsApi } from '../../api/ai'

const userStore = useUserStore()

// Tab状态
const activeTab = ref('models')

// 数据
const loading = ref(false)
const saving = ref(false)
const testingAll = ref(false)
const providers = ref([])
const activeModel = ref(null)
const summary = ref(null)
const selectedProviderIndex = ref(0)

// 当前选中的厂商
const currentProvider = computed(() => {
	if (providers.value.length === 0) return null
	return providers.value[selectedProviderIndex.value]
})

// 厂商选项（用于下拉选择器）
const providerOptions = computed(() => {
	return providers.value.map(p => ({
		label: p.providerName,
		value: p.provider
	}))
})

// 切换Tab
const switchTab = (tab) => {
	activeTab.value = tab
	// 切换到提示词Tab时加载当前提示词
	if (tab === 'prompts' && !currentPrompt.value) {
		loadCurrentPrompt()
	}
}

// 厂商切换
const onProviderChange = (e) => {
	selectedProviderIndex.value = e.detail.value
}

// 加载当前提示词
const loadCurrentPrompt = async () => {
	try {
		const res = await getDefaultPromptApi()
		if (res.code === 200 || res.success) {
			currentPrompt.value = res.data.prompt || ''
		}
	} catch (error) {
		console.error('获取默认提示词失败:', error)
	}
}

// 获取状态简短文本
const getStatusShort = (status) => {
	const map = {
		'testing': '测试中',
		'available': '可用',
		'insufficient_balance': '欠费',
		'auth_failed': '鉴权失败',
		'model_not_found': '模型不存在',
		'rate_limited': '请求限流',
		'server_error': '服务异常',
		'timeout': '连接超时',
		'network_error': '网络异常',
		'error': '异常',
		'unknown': '未知'
	}
	return map[status] || status
}

// 编辑弹窗
const editModalVisible = ref(false)
const editingModel = ref({})

// API Key弹窗
const apiKeyModalVisible = ref(false)
const editingProvider = ref(null)
const newApiKey = ref('')

// 提示词选择弹窗（切换默认模型时)
const showPromptSelectModal = ref(false)
const selectingModel = ref(null)
const promptOptions = ref({ default: null, specific: null })
const selectingPromptType = ref('specific') // 默认选择专属提示词

// 切换提示信息展开/收起
const togglePromptInfo = () => {
	promptInfoExpanded.value = !promptInfoExpanded.value
}

// 获取状态文本
const getStatusText = (status) => {
	const map = {
		'testing': '⏳ 测试中',
		'available': '✅ 可用',
		'insufficient_balance': '⚠️ 余额不足',
		'auth_failed': '🔑 鉴权失败',
		'model_not_found': '❓ 模型不存在',
		'rate_limited': '⏱️ 请求限流',
		'server_error': '🔧 服务异常',
		'timeout': '⌛ 连接超时',
		'network_error': '🌐 网络异常',
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

	// 设置所有模型为测试中状态
	providers.value.forEach(p => {
		p.models.forEach(m => {
			m.testing = true
			m.status = 'testing'
		})
	})

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
		// 清除所有模型的测试中状态
		providers.value.forEach(p => {
			p.models.forEach(m => {
				m.testing = false
			})
		})
	}
}

// 测试单个模型
const testSingleModel = async (model) => {
	// 清除旧结果，显示测试中状态
	model.testing = true
	model.status = 'testing' // 临时状态，避免显示旧结果

	try {
		const res = await testAiConnectionApi(model.id)
		if (res.code === 200 || res.success) {
			model.status = res.data.status
			uni.showToast({ title: res.data.message, icon: res.data.available ? 'success' : 'none' })
		}
	} catch (error) {
		console.error('测试失败:', error)
		model.status = 'error'
		uni.showToast({ title: '测试失败', icon: 'none' })
	} finally {
		model.testing = false
	}
}

// 设置默认模型（显示选择提示词来源弹窗)
const setDefaultModel = async (model) => {
	selectingModel.value = model
	// 获取提示词选项
	try {
		const res = await getPromptOptionsApi(model.id)
		if (res.code === 200 || res.success) {
			promptOptions.value = {
				default: res.data.defaultPrompt,
				specific: res.data.specificPrompt
			}
			showPromptSelectModal.value = true
		}
	} catch (error) {
		console.error('获取提示词选项失败:', error)
		// 如果获取失败，直接设置为默认模型（使用专属提示词）
		try {
			await setActiveModelApi(model.id)
			providers.value.forEach(p => {
				p.models.forEach(m => {
					m.isActive = m.id === model.id
				})
			})
			await loadActiveModel()
			uni.showToast({ title: '已设为默认', icon: 'success' })
		} catch (err) {
			console.error('设置默认失败:', err)
			uni.showToast({ title: '设置失败', icon: 'none' })
		}
	}
}

// 确认选择提示词来源
const confirmPromptSelection = async () => {
	if (!selectingModel.value) return

	const prompt = selectingPromptType.value === 'default'
		? promptOptions.value.default
		: promptOptions.value.specific

	try {
		// 1. 更新提示词
		const updateRes = await updateAiConfigApi(selectingModel.value.id, { promptTemplate: prompt })
		if (updateRes.code !== 200 && !updateRes.success) {
			throw new Error('更新提示词失败')
		}

		// 2. 设置为默认模型
		await setActiveModelApi(selectingModel.value.id)

		// 更新本地状态
		providers.value.forEach(p => {
			p.models.forEach(m => {
				m.isActive = m.id === selectingModel.value.id
			})
		})
		await loadActiveModel()

		const modeText = selectingPromptType.value === 'default' ? '通用默认' : '模型专属'
		uni.showToast({ title: `已设为默认（${modeText}提示词）`, icon: 'success' })
		showPromptSelectModal.value = false
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

// ========== 提示词管理 ==========
// 注：提示词管理已改为Tab页面，不再使用弹窗

// 关闭提示词管理弹窗（已废弃，保留兼容性）
const showPromptManager = () => {
	switchTab('prompts')
}

const closePromptManager = () => {
	// 不再需要，保留空函数避免报错
}

// 保存提示词到所有模型
const savePromptToAll = async () => {
	if (!currentPrompt.value.trim()) {
		uni.showToast({ title: '提示词不能为空', icon: 'none' })
		return
	}
	savingPrompt.value = true
	try {
		const res = await updateAllPromptsApi(currentPrompt.value.trim())
		if (res.code === 200 || res.success) {
			uni.showToast({ title: `已更新 ${res.data.updatedCount} 个模型`, icon: 'success' })
			await loadConfigs()
		}
	} catch (error) {
		console.error('保存提示词失败:', error)
		uni.showToast({ title: '保存失败', icon: 'none' })
	} finally {
		savingPrompt.value = false
	}
}

// 恢复默认提示词
const resetToDefault = async () => {
	// 显示模式选择弹窗
	 resetMode.value = ''
  showResetModal.value = true
}

// 确认恢复模式
const confirmReset = async () => {
  if (!resetMode.value) {
    uni.showToast({ title: '请选择恢复模式', icon: 'none' })
    return
  }

  resetting.value = true
  try {
    let res
    if (resetMode.value === 'unified') {
      // 统一默认：清空所有自定义提示词
      res = await resetAllPromptsApi()
    } else {
      // 模型专属：应用每个模型的专属提示词
      res = await applyModelSpecificPromptsApi()
    }

    if (res.code === 200 || res.success) {
      currentPrompt.value = res.data.defaultPrompt || ''
      currentPromptMode.value = resetMode.value === 'unified' ? '统一默认' : '模型专属'
      uni.showToast({
        title: `已恢复 ${res.data.resetCount || res.data.appliedCount || 0} 个模型`,
        icon: 'success'
      })
      await loadConfigs()
    }
  } catch (error) {
    console.error('恢复默认失败:', error)
    uni.showToast({ title: '恢复失败', icon: 'none' })
  } finally {
    resetting.value = false
    showResetModal.value = false
  }
}

// 页面加载
onMounted(async () => {
	// 检查管理员权限
	if (!userStore.isAdmin) {
		uni.showToast({ title: '无权限访问', icon: 'none' })
		setTimeout(() => uni.navigateBack(), 1500)
		return
	}

	loadConfigs()
	loadActiveModel()
	// 预加载提示词
	await loadCurrentPrompt()
})
</script>

<style lang="scss" scoped>
.ai-config-container {
	min-height: 100vh;
	background: #f5f7fa;
	padding: 20rpx;
	padding-bottom: 40rpx;
}

/* Tab容器 */
.tab-container {
	display: flex;
	background: #fff;
	border-radius: 16rpx;
	padding: 8rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20rpx 16rpx;
	border-radius: 12rpx;
	transition: all 0.3s ease;
	gap: 8rpx;

	&.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
	}
}

.tab-icon {
	font-size: 32rpx;
}

.tab-text {
	font-size: 26rpx;
	font-weight: 500;
}

/* Tab内容区域 */
.tab-content {
	min-height: 60vh;
}

/* 厂商横向标签选择器 */
.provider-tabs {
	display: flex;
	gap: 16rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 16rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	overflow-x: auto;
	flex-wrap: nowrap;
}

.provider-tab-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20rpx 32rpx;
	background: #f5f7fa;
	border-radius: 12rpx;
	min-width: 140rpx;
	transition: all 0.3s ease;
	flex-shrink: 0;

	&.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
	}
}

.provider-tab-text {
	font-size: 28rpx;
	font-weight: 600;
	margin-bottom: 4rpx;
}

.provider-tab-count {
	font-size: 22rpx;
	opacity: 0.7;
}

/* 操作文字按钮 */
.model-actions-row {
	display: flex;
	gap: 12rpx;
	margin-top: 16rpx;
	padding-top: 16rpx;
	border-top: 2rpx solid #f5f7fa;
}

.action-text-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 16rpx 20rpx;
	border-radius: 12rpx;
	font-size: 26rpx;
	font-weight: 500;
	border: none;
	transition: all 0.2s;

	&:active {
		transform: scale(0.98);
	}

	&[disabled] {
		opacity: 0.5;
	}
}

.test-btn {
	background: #f0f5ff;
	color: #667eea;
}

.set-btn {
	background: #fffbe6;
	color: #d48806;
}

.edit-btn {
	background: #f5f7fa;
	color: #666;
}

/* 提示词Tab样式 - 优化版 */
.prompts-tab {
	background: #fff;
	border-radius: 20rpx;
	padding: 0; /* 移除内边距，让布局撑满 */
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	height: calc(100vh - 180rpx); /* 固定高度，占据可用空间 */
	display: flex;
	flex-direction: column;
}

.prompt-manager-layout {
	display: flex;
	flex-direction: column;
	height: 100%;
}

/* 可折叠的提示信息 */
.prompt-info-collapsible {
	background: #f0f5ff;
	border-bottom: 2rpx solid #d9e2ff;
	flex-shrink: 0;
}

.info-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 32rpx;
	cursor: pointer;
	transition: background 0.2s;
}

.info-header:active {
	background: #e6efff;
}

.info-title {
	font-size: 26rpx;
	color: #667eea;
	font-weight: 500;
}

.info-toggle {
	font-size: 20rpx;
	color: #667eea;
	transition: transform 0.3s;
}

.info-content {
	padding: 0 32rpx 20rpx 32rpx;
}

.info-text {
	font-size: 24rpx;
	color: #5a6cb8;
	line-height: 1.6;
}

/* 编辑区域 */
.prompt-editor-area {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 32rpx;
	overflow: hidden;
	background: #fff;
}

.editor-label {
	font-size: 28rpx;
	color: #1a1a1a;
	font-weight: 600;
	margin-bottom: 16rpx;
	display: block;
}

.prompt-textarea-resizable {
	flex: 1;
	width: 100%;
	min-height: 400rpx; /* 最小高度 */
	max-height: none; /* 允许无限拉伸 */
	padding: 24rpx;
	background: #f8f9fc;
	border: 2rpx solid #e8eaed;
	border-radius: 16rpx;
	font-size: 28rpx;
	color: #1a1a1a;
	line-height: 1.6;
	box-sizing: border-box;
	transition: border-color 0.3s;
	resize: none; /* uni-app中textarea不支持resize，使用auto-height */
}

.prompt-textarea-resizable:focus {
	border-color: #667eea;
	background: #fff;
}

.char-count {
	text-align: right;
	font-size: 22rpx;
	color: #8b95a5;
	margin-top: 12rpx;
}

/* 固定底部按钮 */
.prompt-footer-actions {
	display: flex;
	gap: 16rpx;
	padding: 24rpx 32rpx;
	background: #fff;
	border-top: 2rpx solid #f0f2f5;
	flex-shrink: 0;
	box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.footer-action-btn {
	flex: 1;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 16rpx;
	font-size: 28rpx;
	font-weight: 600;
	border: none;
	transition: all 0.3s;

	&[disabled] {
		opacity: 0.5;
	}
}

.footer-action-btn.reset-btn {
	flex: 0.8;
	background: #fff;
	color: #ff6b6b;
	border: 2rpx solid #ff6b6b;
}

.footer-action-btn.reset-btn:active {
	background: #fff5f5;
}

.footer-action-btn.save-btn {
	flex: 1;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.footer-action-btn.save-btn:active {
	opacity: 0.9;
	transform: translateY(2rpx);
}

/* 连接测试Tab样式 */
.test-tab {
	background: #fff;
	border-radius: 20rpx;
	padding: 32rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.test-content {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.test-header {
	text-align: center;
	padding: 24rpx 0;
}

.test-title {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #1a1a1a;
	margin-bottom: 12rpx;
}

.test-subtitle {
	display: block;
	font-size: 26rpx;
	color: #8b95a5;
}

.test-summary {
	display: flex;
	justify-content: center;
	gap: 16rpx;
	flex-wrap: wrap;
	padding: 20rpx;
	background: #f5f7fa;
	border-radius: 12rpx;
}

.test-all-btn-large {
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
	color: #fff;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	border: none;

	&[disabled] {
		opacity: 0.6;
	}
}

.test-results {
	margin-top: 16rpx;
}

.results-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #1a1a1a;
	margin-bottom: 16rpx;
}

.result-item {
	background: #f5f7fa;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.result-provider {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #1a1a1a;
	margin-bottom: 12rpx;
}

.result-models {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.result-model {
	font-size: 26rpx;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	background: #fff;

	&.result-testing {
		color: #1890ff;
		animation: pulse 1.5s infinite;
	}

	&.result-available {
		color: #52c41a;
	}

	&.result-insufficient_balance {
		color: #faad14;
	}

	&.result-auth_failed {
		color: #cf1322;
	}

	&.result-model_not_found {
		color: #597ef7;
	}

	&.result-rate_limited {
		color: #d46b08;
	}

	&.result-server_error {
		color: #ff4d4f;
	}

	&.result-timeout {
		color: #2f54eb;
	}

	&.result-network_error {
		color: #13c2c2;
	}

	&.result-error {
		color: #ff4d4f;
	}

	&.result-unknown {
		color: #8b95a5;
	}
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

/* 模型卡片更新 */
.model-card {
	background: #fff;
	padding: 24rpx;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;

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
	border-radius: 16rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
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

	&.status-testing {
		background: #e6f7ff;
		color: #1890ff;
		animation: pulse 1.5s infinite;
	}

	&.status-available {
		background: #f6ffed;
		color: #52c41a;
	}

	&.status-insufficient_balance {
		background: #fffbe6;
		color: #faad14;
	}

	&.status-auth_failed {
		background: #fff1f0;
		color: #cf1322;
	}

	&.status-model_not_found {
		background: #f0f5ff;
		color: #597ef7;
	}

	&.status-rate_limited {
		background: #fff7e6;
		color: #d46b08;
	}

	&.status-server_error {
		background: #fff2f0;
		color: #ff4d4f;
	}

	&.status-timeout {
		background: #f0f5ff;
		color: #2f54eb;
	}

	&.status-network_error {
		background: #f0f5ff;
		color: #13c2c2;
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

.form-textarea-large {
	min-height: 350rpx;
	font-size: 26rpx;
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

/* 恢复模式选择弹窗样式 */
.reset-options {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.reset-option {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 20rpx;
	background: #f5f7fa;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s;

	&.active {
		background: #f0f5ff;
		border-color: #667eea;
	}

	&:active {
		transform: scale(0.98);
	}
}

.option-icon {
	font-size: 36rpx;
}

.option-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.option-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.option-desc {
	font-size: 24rpx;
	color: #8b95a5;
}

/* 动画 */
@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.6;
	}
}

</style>

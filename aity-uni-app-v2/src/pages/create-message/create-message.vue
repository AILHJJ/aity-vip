<template>
	<view class="create-message-container">
		<scroll-view class="form-scroll" scroll-y>
			<view class="form-container">
				<!-- 策略推送合并（标签按钮组） -->
				<view class="form-item quick-settings">
					<view class="setting-row">
						<text class="setting-label">策略推送</text>
						<view class="tag-group">
							<view 
								v-for="s in strategyOptions" 
								:key="s.value"
								class="tag-btn"
								:class="{ active: formData.strategy === s.value }"
								@click="handleStrategyChange(s.value)"
							>
								<text>{{ s.label }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 消息类型（标签按钮组，支持动态加载） -->
				<view class="form-item msg-type-section">
					<view class="form-label-row">
						<text class="form-label">消息类型</text>
						<text v-if="userStore.isAdmin" class="manage-types-btn" @click="showTypeManager = true">+ 管理</text>
					</view>
					<view class="tag-group tag-group-wrap">
						<view 
							v-for="t in messageTypeOptions" 
							:key="t.value"
							class="tag-btn"
							:class="{ active: formData.messageType === t.value }"
							@click="formData.messageType = t.value"
						>
							<text>{{ t.label }}</text>
						</view>
					</view>
				</view>


				<!-- 标题 -->
				<view class="form-item">
					<text class="form-label">消息标题 *</text>
					<input
						v-model="formData.title"
						type="text"
						placeholder="请输入消息标题"
						placeholder-style="color: #999999"
						class="form-input"
						:maxlength="100"
					/>
				</view>

			<!-- 内容 -->
			<view class="form-item content-item">
				<!-- 表头：标签 + 操作按钮（同一行） -->
				<view class="content-header">
					<text class="form-label">消息内容 *</text>
					<view class="content-actions">
						<!-- 编辑/预览切换 -->
						<view class="mode-switch">
							<text
								class="mode-btn"
								:class="{ active: !previewMode }"
								@click="previewMode = false"
							>
								编辑
							</text>
							<text
								class="mode-btn"
								:class="{ active: previewMode }"
								@click="previewMode = true"
							>
								预览
							</text>
						</view>
						<!-- 插入图片按钮（仅编辑模式显示） -->
						<view v-if="!previewMode" class="image-upload-btn-small" @click="handleUpload">
							<text>📷</text>
						</view>
					</view>
				</view>

				<!-- 编辑模式 -->
				<view v-if="!previewMode" class="editor-container">
					<textarea
						class="form-textarea markdown-editor"
						v-model="formData.content"
						placeholder="支持 Markdown 格式，点击右侧📷按钮插入图片"
						placeholder-style="color: #999999"
						:maxlength="5000"
						:show-confirm-bar="false"
						auto-height
					/>
					<view class="editor-footer">
						<text class="char-count">{{ formData.content.length }}/5000</text>
					</view>
					<view class="clipboard-image-tip">
						小程序暂不支持直接粘贴剪贴板图片，请点击相机按钮从相册、聊天图片或拍照选择。
					</view>
				</view>

				<!-- 预览模式 -->
				<view v-else class="preview-container">
					<scroll-view class="preview-scroll" scroll-y>
						<view class="markdown-preview" :class="'theme-' + formData.theme" v-html="renderedHtml"></view>
					</scroll-view>
					<view class="editor-footer">
						<text class="char-count">{{ formData.content.length }}/5000</text>
						<text class="theme-hint">主题: {{ themeOptions.find(t => t.value === formData.theme)?.label }}</text>
					</view>
				</view>
			</view>

				<!-- 主题选择和AI优化（内容下方） -->
				<view class="form-item theme-ai-row">
					<view class="theme-ai-left">
						<text class="theme-label">🎨 主题</text>
						<picker
							mode="selector"
							:range="themeOptions"
							range-key="label"
							:value="selectedThemeIndex"
							@change="handleThemePickerChange"
						>
							<view class="theme-picker">
								<view class="theme-color-preview" :style="{ background: currentThemePreviewColor }"></view>
								<text class="theme-picker-text">{{ themeOptions.find(t => t.value === formData.theme)?.label }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
					<button
						class="ai-optimize-btn-inline"
						:class="{ loading: isOptimizing }"
						:disabled="isOptimizing || !formData.content.trim()"
						@click="handleAiOptimize"
					>
						<text v-if="!isOptimizing" class="ai-icon">✨</text>
						<text v-else class="loading-icon">⏳</text>
						<text class="ai-text">{{ isOptimizing ? '优化中' : 'AI优化' }}</text>
					</button>
				</view>

				<!-- 关联股票（专业金融风格） -->
				<view class="form-item stock-section">
					<view class="stock-section-header">
						<text class="stock-section-title">📈 关联股票</text>
						<text class="stock-section-count">{{ formData.stockCodes.length }}/10</text>
					</view>

					<!-- 股票标签展示区 -->
					<view v-if="formData.stockCodes.length > 0" class="stock-tags-area">
						<view
							v-for="(code, index) in formData.stockCodes"
							:key="index"
							class="stock-chip"
							@click="handleViewStock(code)"
						>
							<text class="stock-chip-code">{{ code }}</text>
							<text class="stock-chip-market">{{ getMarketLabel(code) }}</text>
							<text class="stock-chip-close" @click.stop="handleRemoveStock(index)">×</text>
						</view>
					</view>

					<!-- 添加股票输入区 -->
					<view class="stock-add-area">
						<view class="stock-input-wrapper">
							<text class="stock-input-prefix">股票代码</text>
							<input
								v-model="stockCodeInput"
								type="number"
								placeholder="000001"
								placeholder-style="color: #bfbfbf"
								class="stock-code-input"
								maxlength="6"
								@confirm="handleAddStock"
							/>
						</view>
						<view class="stock-action-btns">
							<button class="stock-action-btn stock-lookup-btn" @click="handleSearchStock">
								<text class="action-icon">🔍</text>
								<text class="action-text">查询</text>
							</button>
							<button class="stock-action-btn stock-add-btn" @click="handleAddStock">
								<text class="action-icon">+</text>
								<text class="action-text">添加</text>
							</button>
						</view>
					</view>

					<view class="stock-hint">
						<text class="hint-icon">💡</text>
						<text class="hint-text">添加股票代码后，读者可直接点击查看实时行情</text>
					</view>
				</view>

				<!-- 已选图片预览 -->
				<view v-if="formData.attachments.length > 0" class="form-item attachment-item">
					<view class="upload-container">
						<view
							v-for="(file, index) in formData.attachments"
							:key="index"
							class="file-item"
						>
							<image v-if="file.path" :src="file.path" class="file-thumb" mode="aspectFill"></image>
							<text v-else class="file-name">{{ file.name }}</text>
							<text class="file-remove" @click="handleRemoveFile(index)">×</text>
						</view>
					</view>
				</view>

				<!-- 底部占位，防止内容被按钮遮挡 -->
				<view class="bottom-spacer"></view>
			</view>
		</scroll-view>

		<!-- 固定底部按钮 -->
		<view class="fixed-bottom-bar">
			<button class="cancel-btn" @click="handleCancel">取消</button>
			<button class="submit-btn" :disabled="submitting || isOptimizing" @click="handleSubmit">
				{{ submitting ? '发布中...' : '发布消息' }}
			</button>
		</view>

		<!-- AI优化预览弹窗 -->
		<view v-if="showOptimizePreview" class="optimize-preview-modal" @click.self="handleCloseOptimizePreview">
			<view class="optimize-preview-content">
				<view class="preview-header">
					<text class="preview-title">AI优化结果预览</text>
					<text class="preview-close" @click="handleCloseOptimizePreview">×</text>
				</view>

				<!-- 优化说明 -->
				<view v-if="optimizationNote" class="optimization-note-banner">
					<text class="note-icon">💡</text>
					<text class="note-text">{{ optimizationNote }}</text>
				</view>

				<view class="preview-tabs">
					<text
						class="preview-tab"
						:class="{ active: previewTab === 'original' }"
						@click="previewTab = 'original'"
					>
						原始版本
					</text>
					<text
						class="preview-tab"
						:class="{ active: previewTab === 'optimized' }"
						@click="previewTab = 'optimized'"
					>
						AI优化版
					</text>
				</view>

				<scroll-view class="preview-body" scroll-y>
					<view v-if="previewTab === 'original'" class="content-preview">
						<text class="preview-text">{{ originalContent }}</text>
					</view>
					<view v-else class="content-preview markdown-preview-wrapper">
						<!-- AI优化版使用Markdown渲染并应用主题 -->
						<view class="markdown-preview" :class="'theme-' + formData.theme" v-html="optimizedRenderedHtml"></view>
					</view>
				</scroll-view>

				<view class="preview-footer">
					<button class="preview-btn preview-btn-retry" :disabled="isOptimizing" @click="handleRegenerate">
						<text v-if="!isOptimizing">🔄</text>
						<text v-else>⏳</text>
						重试
					</button>
					<button class="preview-btn preview-btn-discard" @click="handleKeepOriginal">弃用</button>
					<button class="preview-btn preview-btn-adopt primary" @click="handleUseOptimized">采纳</button>
				</view>
			</view>
		</view>

		<!-- 消息类型管理弹窗 -->
		<view v-if="showTypeManager" class="optimize-preview-modal" @click.stop="showTypeManager = false">
			<view class="optimize-preview-content type-manager-content" @click.stop>
				<view class="preview-header">
					<text class="preview-title">消息类型管理</text>
					<text class="preview-close" @click="showTypeManager = false">×</text>
				</view>

				<scroll-view class="preview-body" scroll-y>
					<!-- 新增类型表单 -->
					<view class="type-add-form">
						<view class="type-add-title">新增消息类型</view>
						<view class="type-form-row">
							<input
								v-model="newType.label"
								class="type-input"
								placeholder="标签名称(如: 自定义类型)"
								placeholder-class="type-placeholder"
								@click.stop
							/>
						</view>
						<view class="type-form-row type-color-row">
							<text class="type-color-label">颜色:</text>
							<view class="type-color-options">
								<view
									v-for="c in typeColorOptions"
									:key="c"
									class="type-color-dot"
									:style="{ background: c }"
									:class="{ selected: newType.color === c }"
									@click.stop="newType.color = c"
								></view>
							</view>
						</view>
						<button class="type-add-btn" :disabled="isAddingType" @click.stop="handleAddType">
							{{ isAddingType ? '添加中...' : '添加类型' }}
						</button>
					</view>

					<!-- 现有类型列表（显示全部类型，含自定义） -->
					<view class="type-list-section">
						<view class="type-list-title">现有类型（共 {{ allMessageTypes.length }} 个）</view>
						<view class="type-list">
							<view v-for="t in allMessageTypes" :key="t.value" class="type-list-item">
								<view class="type-item-left">
									<view class="type-color-indicator" :style="{ background: t.color || '#667eea' }"></view>
									<text class="type-item-label">{{ t.label }}</text>
									<text v-if="t.isDefault" class="type-item-badge">默认</text>
								</view>
								<view class="type-item-right">
									<text class="type-item-value">{{ t.value }}</text>
									<text v-if="!t.isDefault" class="type-item-delete" :class="{ loading: isDeletingType }" @click.stop="handleDeleteType(t)">删除</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useUserStore } from '../../store/user'
import { createMessageApi, updateMessageApi, getMessageDetailApi } from '../../api/message'
import { uploadImageApi } from '../../api/upload'
import { optimizeContentApi } from '../../api/ai'
import { getMessageTypesApi, createMessageTypeApi, deleteMessageTypeApi } from '../../api/messageType'
import { MESSAGE_TYPES, MESSAGE_TAGS, MESSAGE_TYPE_LABELS, MESSAGE_TAG_LABELS, USER_ROLES } from '../../utils/constants'
import { BASE_URL } from '../../utils/config'

const userStore = useUserStore()

// localStorage key
const DRAFT_KEY = 'message_draft'
const STRATEGY_KEY = 'last_selected_strategy'
const THEME_KEY = 'last_selected_theme'

// 预览模式
const previewMode = ref(false)
// 表单数据
const formData = ref({
	strategy: MESSAGE_TAGS.SHORT_TERM, // 策略类型（默认：短线策略）
	pushTarget: MESSAGE_TAGS.SHORT_TERM, // 推送对象（默认：短线用户）
	messageType: MESSAGE_TYPES.MORNING_FOCUS, // 消息类型（默认：早盘关注）
	theme: 'default', // Markdown主题（默认：简约白）
	title: '',
	content: '',
	attachments: [],
	stockCodes: [] // 关联股票代码
})

const submitting = ref(false)
const editMode = ref(false)
const editMessageId = ref(0)
const draftTimer = ref(null)
const stockCodeInput = ref('') // 股票代码输入

// AI优化相关状态
const isOptimizing = ref(false)
const showOptimizePreview = ref(false)
const optimizedContent = ref('')
const optimizationNote = ref('') // 优化说明
const originalContent = ref('')
const previewTab = ref('optimized') // 'original' or 'optimized'
const hasUsedOptimization = ref(false) // 标记是否使用了AI优化

// 策略推送选项（合并策略和推送，短线->短线VIP，中线->全部用户）
const strategyOptions = [
	{ label: '短线推送', value: MESSAGE_TAGS.SHORT_TERM, pushTarget: MESSAGE_TAGS.SHORT_TERM },
	{ label: '中线推送', value: MESSAGE_TAGS.MID_TERM, pushTarget: MESSAGE_TAGS.ALL_USERS }
]

// 消息类型选项（简化版本：只显示主要类型）
const messageTypeOptions = ref([
	{ label: '盘中', value: MESSAGE_TYPES.MORNING_FOCUS, color: '#3498db' },
	{ label: '持仓', value: MESSAGE_TYPES.POSITION_HANDLE, color: '#9b59b6' },
	{ label: '风险', value: MESSAGE_TYPES.RISK_WARNING, color: '#e74c3c' },
	{ label: '点评', value: MESSAGE_TYPES.MORNING_COMMENT, color: '#f39c12' },
	{ label: '系统', value: MESSAGE_TYPES.SYSTEM, color: '#95a5a6' }
])

// ========== 消息类型管理 ==========
const showTypeManager = ref(false)
const newType = ref({ label: '', color: '#667eea' })
const isAddingType = ref(false)
const isDeletingType = ref(false)

// 默认5个主类型（与筛选栏一致）
const DEFAULT_TYPE_VALUES = [
	MESSAGE_TYPES.MORNING_FOCUS,
	MESSAGE_TYPES.POSITION_HANDLE,
	MESSAGE_TYPES.RISK_WARNING,
	MESSAGE_TYPES.MORNING_COMMENT,
	MESSAGE_TYPES.SYSTEM
]

// 管理弹窗中显示的所有类型（含自定义）
const allMessageTypes = ref([])

// 颜色选项
const typeColorOptions = [
	'#667eea', '#764ba2', '#f59e0b', '#10b981', '#06b6d4',
	'#8b5cf6', '#ec4899', '#ef4444', '#dc2626', '#64748b',
	'#6366f1', '#eab308'
]

// 加载消息类型列表
const loadMessageTypes = async () => {
	try {
		const res = await getMessageTypesApi()
		if (res.code === 200 || res.success) {
			const types = res.data || []
			// 全部类型
			allMessageTypes.value = types.map(t => ({
				label: MESSAGE_TYPE_LABELS[t.type] || t.label,
				value: t.type,
				id: t.id,
				color: t.color || '#667eea',
				isDefault: DEFAULT_TYPE_VALUES.includes(t.type)
			}))
			// 发布页面显示所有类型（含自定义新增的）
			messageTypeOptions.value = allMessageTypes.value
		}
	} catch (e) {
		console.error('加载消息类型失败:', e)
		allMessageTypes.value = [
			{ label: '盘中', value: MESSAGE_TYPES.MORNING_FOCUS, color: '#3498db', isDefault: true },
			{ label: '持仓', value: MESSAGE_TYPES.POSITION_HANDLE, color: '#9b59b6', isDefault: true },
			{ label: '风险', value: MESSAGE_TYPES.RISK_WARNING, color: '#e74c3c', isDefault: true },
			{ label: '点评', value: MESSAGE_TYPES.MORNING_COMMENT, color: '#f39c12', isDefault: true },
			{ label: '系统', value: MESSAGE_TYPES.SYSTEM, color: '#95a5a6', isDefault: true }
		]
		messageTypeOptions.value = allMessageTypes.value
	}
}

// 添加新消息类型
const handleAddType = async () => {
	if (!newType.value.label) {
		uni.showToast({ title: '请填写标签名称', icon: 'none' })
		return
	}

	// 自动生成type：中文标签使用自定义前缀
	let autoType = newType.value.label
		.toLowerCase()
		.replace(/\s+/g, '_')
		.replace(/[^a-z0-9_]/g, '')
		.replace(/^_+|_+$/g, '')

	// 如果type为空或纯数字，用时间戳作为前缀（兼容中文标签如"测试2"）
	if (!autoType || /^\d+$/.test(autoType)) {
		autoType = 'custom_' + (autoType || Math.floor(Date.now() / 1000))
	}

	// 检查是否已存在
	if (messageTypeOptions.value.some(t => t.value === autoType)) {
		uni.showToast({ title: '该类型已存在', icon: 'none' })
		return
	}

	isAddingType.value = true
	try {
		const res = await createMessageTypeApi({
			type: autoType,  // 使用自动生成的type
			label: newType.value.label,
			color: newType.value.color || '#667eea',
			icon: ''
		})

		if (res.success || res.code === 200) {
			uni.showToast({ title: '添加成功', icon: 'success' })
			// 重新加载类型列表后关闭弹窗
			await loadMessageTypes()
			newType.value = { label: '', color: '#667eea' }
			setTimeout(() => { showTypeManager.value = false }, 300)
		} else {
			uni.showToast({ title: res.message || '添加失败', icon: 'none' })
		}
	} catch (e) {
		console.error('添加消息类型失败:', e)
		uni.showToast({ title: '添加失败', icon: 'none' })
	} finally {
		isAddingType.value = false
	}
}

// 删除消息类型
const handleDeleteType = (type) => {
	if (type.isDefault) {
		uni.showToast({ title: '默认类型不可删除', icon: 'none' })
		return
	}

	// 获取可迁移到的目标类型列表（排除当前类型）
	const targetTypes = allMessageTypes.value.filter(t => t.value !== type.value && t.isDefault)

	// 构建操作菜单：直接删除 + 迁移选项
	const itemList = ['直接删除']
	let hasMigrateOption = false
	if (targetTypes.length > 0) {
		itemList.push('迁移消息到其他类型')
		hasMigrateOption = true
	}

	uni.showActionSheet({
		itemList: itemList,
		title: `"${type.label}" 删除方式`,
		success: (res) => {
			if (res.tapIndex === 0) {
				// 直接删除
				confirmDeleteType(type, null)
			} else if (hasMigrateOption && res.tapIndex === 1) {
				// 迁移后再删除
				showMigrationPicker(type, targetTypes)
			}
		}
	})
}

// 显示类型迁移选择器
const showMigrationPicker = (sourceType, targetTypes) => {
	const itemList = targetTypes.map(t => `${t.label}（${t.value}）`)
	uni.showActionSheet({
		itemList: itemList,
		title: `将"${sourceType.label}"的消息迁移到：`,
		success: (res) => {
			const target = targetTypes[res.tapIndex]
			confirmDeleteType(sourceType, target.value)
		}
	})
}

// 确认删除
const confirmDeleteType = async (type, replacementType) => {
	const msg = replacementType
		? `将"${type.label}"的现有消息迁移到新类型后删除，确定吗？`
		: `直接删除"${type.label}"，如果已有消息使用该类型将无法删除。确定吗？`

	uni.showModal({
		title: '删除类型',
		content: msg,
		confirmText: '确认删除',
		confirmColor: '#e74c3c',
		success: async (res) => {
			if (res.confirm) {
				isDeletingType.value = true
				try {
					const result = await deleteMessageTypeApi(type.id, replacementType ? { replacementType } : {})
					if (result.code === 200 || result.success) {
						uni.showToast({
							title: result.data?.migratedCount
								? `删除成功，已迁移${result.data.migratedCount}条消息`
								: '删除成功',
							icon: 'success'
						})
						await loadMessageTypes()
					} else {
						uni.showToast({ title: result.message || '删除失败', icon: 'none' })
					}
				} catch (e) {
					console.error('删除消息类型失败:', e)
					uni.showToast({ title: '删除失败', icon: 'none' })
				} finally {
					isDeletingType.value = false
				}
			}
		}
	})
}

// Markdown主题选项
const themeOptions = [
	{ label: '简约白', value: 'default', desc: '简洁清爽，适合日常阅读', previewColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ label: 'GitHub', value: 'github', desc: '开发者熟悉的风格', previewColor: 'linear-gradient(135deg, #24292e 0%, #58a6ff 100%)' },
	{ label: '翡翠绿', value: 'emerald', desc: '清新护眼，绿色主题', previewColor: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' },
	{ label: '蓝色海洋', value: 'ocean', desc: '深邃海洋，专业风格', previewColor: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)' },
	{ label: '暖阳橙', value: 'warm', desc: '温暖活力，橙色主题', previewColor: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)' },
	{ label: '暗夜模式', value: 'dark', desc: '护眼暗色，夜间阅读', previewColor: 'linear-gradient(135deg, #18191a 0%, #3a3b3c 100%)' },
	{ label: '紫罗兰', value: 'violet', desc: '优雅紫色，浪漫风格', previewColor: 'linear-gradient(135deg, #5b21b6 0%, #a78bfa 100%)' },
	{ label: '玫瑰红', value: 'rose', desc: '浪漫红粉，女性青睐', previewColor: 'linear-gradient(135deg, #be123c 0%, #fb7185 100%)' },
	{ label: '青柠绿', value: 'lime', desc: '明亮清新，活力主题', previewColor: 'linear-gradient(135deg, #365314 0%, #84cc16 100%)' },
	{ label: '科技蓝', value: 'tech', desc: '现代科技感，专业商务', previewColor: 'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)' },
	{ label: '石墨灰', value: 'slate', desc: '低调稳重，商务首选', previewColor: 'linear-gradient(135deg, #334155 0%, #94a3b8 100%)' },
	{ label: '日落金', value: 'sunset', desc: '温暖金色，财富寓意', previewColor: 'linear-gradient(135deg, #92400e 0%, #fbbf24 100%)' }
]

// 当前选中的主题索引
const selectedThemeIndex = computed(() => {
	return themeOptions.findIndex(t => t.value === formData.value.theme)
})

// 当前主题的预览颜色
const currentThemePreviewColor = computed(() => {
	const theme = themeOptions.find(t => t.value === formData.value.theme)
	return theme ? theme.previewColor : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
})

// 处理策略推送变化
const handleStrategyChange = (value) => {
	formData.value.strategy = value
	// 根据策略自动设置推送对象
	const option = strategyOptions.find(s => s.value === value)
	if (option) {
		formData.value.pushTarget = option.pushTarget
	}
	// 保存到localStorage
	uni.setStorageSync(STRATEGY_KEY, value)
}

// 处理主题选择（下拉选择器）
const handleThemePickerChange = (e) => {
	const index = e.detail.value
	formData.value.theme = themeOptions[index].value
	// 保存到 localStorage
	uni.setStorageSync(THEME_KEY, formData.value.theme)

	// 自动切换到预览模式，让用户立即看到主题效果
	if (formData.value.content.trim()) {
		previewMode.value = true
		uni.showToast({
			title: '已切换主题',
			icon: 'none',
			duration: 1000
		})
	}
}

// ========== 股票代码关联功能 ==========

// 判断市场代码（与 message-detail.vue 保持一致）
const getMarketCode = (stockCode) => {
	const code = String(stockCode)
	if (code.startsWith('6')) {
		return 1 // 上海交易所
	} else if (code.startsWith('0') || code.startsWith('3')) {
		return 0 // 深圳交易所
	} else if (code.startsWith('8') || code.startsWith('92')) {
		return 2 // 北京交易所
	} else {
		return 0 // 默认值
	}
}

// 获取市场标签
const getMarketLabel = (stockCode) => {
	const code = String(stockCode)
	if (code.startsWith('6')) {
		return '沪'
	} else if (code.startsWith('0') || code.startsWith('3')) {
		return '深'
	} else if (code.startsWith('8') || code.startsWith('92')) {
		return '京'
	} else {
		return 'A'
	}
}

// 查看股票行情
const handleViewStock = (code) => {
	const setcode = getMarketCode(code)
	const marketUrl = `https://txhq.icfqs.com:8005/site/hq-H5/h5/index.html#/page_detail/page-detail/page-detail?code=${code}&setcode=${setcode}&opentype=native`

	uni.navigateTo({
		url: `/pages/webview/webview?url=${encodeURIComponent(marketUrl)}`
	})
}

// 验证股票代码格式（根据股票代码开头规则验证）
const validateStockCode = (code) => {
	const codeStr = String(code).trim()
	// 必须是6位数字
	if (!/^\d{6}$/.test(codeStr)) {
		return false
	}
	// 根据股票代码开头验证：
	// 6 开头 - 上海交易所（主板、科创板60/61/62/68）
	// 0 开头 - 深圳交易所（主板00、中小板002）
	// 3 开头 - 深圳交易所（创业板30）
	// 8 开头 - 北京交易所（81/83/87等）
	// 92 开头 - 北京交易所
	const firstChar = codeStr.charAt(0)
	const firstTwoChars = codeStr.substring(0, 2)

	if (firstChar === '6') {
		return true // 上海交易所
	} else if (firstChar === '0' || firstChar === '3') {
		return true // 深圳交易所
	} else if (firstChar === '8') {
		return true // 北京交易所
	} else if (firstTwoChars === '92') {
		return true // 北京交易所
	}
	return false
}

// 添加股票代码
const handleAddStock = () => {
	const code = stockCodeInput.value.trim()

	if (!code) {
		uni.showToast({
			title: '请输入股票代码',
			icon: 'none'
		})
		return
	}

	// 验证格式
	if (!validateStockCode(code)) {
		uni.showToast({
			title: '请输入有效股票代码(6/0/3/8开头)',
			icon: 'none'
		})
		return
	}

	// 检查是否已存在
	if (formData.value.stockCodes.includes(code)) {
		uni.showToast({
			title: '该股票已添加',
			icon: 'none'
		})
		return
	}

	// 检查数量限制
	if (formData.value.stockCodes.length >= 10) {
		uni.showToast({
			title: '最多添加10只股票',
			icon: 'none'
		})
		return
	}

	// 添加股票代码
	formData.value.stockCodes.push(code)
	stockCodeInput.value = ''

	uni.showToast({
		title: '添加成功',
		icon: 'success',
		duration: 1500
	})
}

// 删除股票代码
const handleRemoveStock = (index) => {
	formData.value.stockCodes.splice(index, 1)
}

// 搜索股票（跳转到行情页面查看）
const handleSearchStock = () => {
	const code = stockCodeInput.value.trim()

	if (!code) {
		uni.showToast({
			title: '请输入股票代码',
			icon: 'none'
		})
		return
	}

	// 验证格式
	if (!validateStockCode(code)) {
		uni.showToast({
			title: '请输入有效股票代码(6/0/3/8开头)',
			icon: 'none'
		})
		return
	}

	// 生成行情URL并跳转
	const setcode = getMarketCode(code)
	const marketUrl = `https://txhq.icfqs.com:8005/site/hq-H5/h5/index.html#/page_detail/page-detail/page-detail?code=${code}&setcode=${setcode}&opentype=native`

	uni.navigateTo({
		url: `/pages/webview/webview?url=${encodeURIComponent(marketUrl)}`
	})
}



// 处理文件上传
const handleUpload = () => {
	// #ifdef MP-WEIXIN
	// 微信小程序使用 chooseImage
	uni.chooseImage({
		count: 9,
		sizeType: ['original', 'compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			const tempFilePaths = res.tempFilePaths

			tempFilePaths.forEach(filePath => {
				// 检查文件大小 - 使用新的API
				const fileInfo = uni.getFileSystemManager().getFileInfo({
					filePath: filePath,
					success: (res) => {
						if (res.size > 10 * 1024 * 1024) {
							uni.showToast({
								title: '文件大小不能超过 10MB',
								icon: 'none'
							})
							return
						}

						formData.value.attachments.push({
							name: filePath.split('/').pop(),
							path: filePath,
							size: res.size
						})
					},
					fail: (err) => {
						console.error('获取文件信息失败:', err)
						// 如果获取失败，仍然添加文件（跳过大校验）
						formData.value.attachments.push({
							name: filePath.split('/').pop(),
							path: filePath,
							size: 0
						})
					}
				})
			})
		},
		fail: (err) => {
			// 用户取消选择，不显示错误
			if (err.errMsg && !err.errMsg.includes('cancel')) {
				console.error('选择图片失败:', err)
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				})
			}
		}
	})
	// #endif

	// #ifndef MP-WEIXIN
	// 其他平台使用 chooseFile
	uni.chooseFile({
		count: 1,
		extension: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
		success: (res) => {
			const file = res.tempFiles[0]

			// 检查文件大小
			if (file.size > 10 * 1024 * 1024) {
				uni.showToast({
					title: '文件大小不能超过 10MB',
					icon: 'none'
				})
				return
			}

			formData.value.attachments.push({
				name: file.name,
				path: file.path,
				size: file.size
			})
		},
		fail: (err) => {
			// 用户取消选择，不显示错误
			if (err.errMsg && !err.errMsg.includes('cancel')) {
				console.error('选择文件失败:', err)
				uni.showToast({
					title: '选择文件失败',
					icon: 'none'
				})
			}
		}
	})
	// #endif
}

// 移除文件
const handleRemoveFile = (index) => {
	formData.value.attachments.splice(index, 1)
}

// 表单验证
const validateForm = () => {
	// 验证策略类型（必填）
	if (!formData.value.strategy) {
		uni.showToast({
			title: '请选择策略类型',
			icon: 'none'
		})
		return false
	}

	// 管理员必须选择推送对象
	if (userStore.isAdmin && !formData.value.pushTarget) {
		uni.showToast({
			title: '请选择推送对象',
			icon: 'none'
		})
		return false
	}

	// 验证标题（必填）
	if (!formData.value.title.trim()) {
		uni.showToast({
			title: '请输入消息标题',
			icon: 'none'
		})
		return false
	}

	// 验证内容（必填）
	if (!formData.value.content.trim()) {
		uni.showToast({
			title: '请输入消息内容',
			icon: 'none'
		})
		return false
	}

	return true
}

// 提交表单
const handleSubmit = async () => {
	if (!validateForm()) return

	submitting.value = true

	try {
		// 先上传图片附件
		let uploadedAttachments = []

		if (formData.value.attachments.length > 0) {
			console.log('开始上传', formData.value.attachments.length, '个附件')

			let hasShownLoading = false

			for (let i = 0; i < formData.value.attachments.length; i++) {
				const attach = formData.value.attachments[i]

				try {
					console.log(`上传第 ${i + 1} 个附件:`, attach.name, 'path:', attach.path)

					// 判断是否需要上传到服务器
					// 1. blob: (H5)
					// 2. wxfile:// (微信小程序)
					// 3. http://tmp/ (微信小程序临时文件)
					// 4. 不是完整http/https URL的路径
					const isLocalFile = attach.path && (
						attach.path.startsWith('blob:') ||
						attach.path.startsWith('wxfile://') ||
						attach.path.startsWith('http://tmp') ||
						attach.path.includes('_doc/uniappTemp') ||
						!attach.path.startsWith('http')
					)

					if (isLocalFile && !attach.url) {
						// 需要上传到服务器
						if (!hasShownLoading) {
							uni.showLoading({
								title: `上传图片 ${i + 1}/${formData.value.attachments.length}`,
								mask: true
							})
							hasShownLoading = true
						}

						const uploadResult = await uploadImageApi(attach.path)

						uploadedAttachments.push({
							name: attach.name,
							url: uploadResult.url, // 使用服务器返回的URL
							type: 'image',
							size: attach.size
						})

						console.log(`第 ${i + 1} 个附件上传成功:`, uploadResult)
					} else if (attach.url) {
						// 已经是服务器URL，直接使用
						uploadedAttachments.push({
							name: attach.name,
							url: attach.url,
							type: attach.type || 'image',
							size: attach.size
						})
						console.log(`第 ${i + 1} 个附件已有URL，跳过上传:`, attach.url)
					} else {
						console.warn(`第 ${i + 1} 个附件无法识别，跳过:`, attach)
					}
				} catch (uploadErr) {
					console.error(`第 ${i + 1} 个附件上传失败:`, uploadErr)
					uni.showToast({
						title: `图片 ${i + 1} 上传失败`,
						icon: 'none',
						duration: 2000
					})
					// 继续上传其他图片，不中断流程
				}
			}

			uni.hideLoading()
			console.log('所有附件上传完成，成功', uploadedAttachments.length, '个')
		}

		// 构建提交数据
		// 将新表单结构转换为后端API需要的格式
		const tags = []

		// 1. 添加策略标签（必填）
		if (formData.value.strategy) {
			tags.push(formData.value.strategy)
		}

		// 2. 添加推送对象标签（管理员）- 避免重复
		if (userStore.isAdmin && formData.value.pushTarget) {
			// 只有当推送对象标签与策略标签不同时才添加
			if (!tags.includes(formData.value.pushTarget)) {
				tags.push(formData.value.pushTarget)
			}
		}

		// 构建最终内容（如果有股票代码，附加到内容末尾）
		let finalContent = formData.value.content.trim()

		// 【方案B】自动扫描内容中的有效股票代码并转换为标签格式
		// 验证股票代码开头的函数
		const isValidStockCodePrefix = (code) => {
			const firstChar = code.charAt(0)
			if (firstChar === '6') return true // 上海
			if (firstChar === '0' || firstChar === '3') return true // 深圳
			if (firstChar === '8') return true // 北京
			if (code.startsWith('92')) return true // 北京
			return false
		}

		// 匹配内容中的6位数字股票代码（排除已经被$个股()$包裹的）
		const stockCodeRegex = /(?<!\$个股\()(?<![A-Z(])([0-9]{6})(?!\)\$)(?![)0-9])/g
		finalContent = finalContent.replace(stockCodeRegex, (match) => {
			// 验证是否是有效的股票代码开头
			if (isValidStockCodePrefix(match)) {
				return `$个股(${match})$`
			}
			return match // 不是有效股票代码，保持原样
		})

		// 如果有手动关联的股票代码，也转换为标签格式并附加到内容末尾（避免重复）
		if (formData.value.stockCodes.length > 0) {
			// 检查内容中是否已经包含这些股票代码的标签
			const existingTags = finalContent.match(/\$个股\(([0-9]{6})\)\$/g) || []
			const existingCodes = existingTags.map(tag => tag.match(/\$个股\(([0-9]{6})\)\$/)[1])

			// 只添加内容中还没有的股票代码
			const newCodes = formData.value.stockCodes.filter(code => !existingCodes.includes(code))
			if (newCodes.length > 0) {
				const stockTags = newCodes.map(code => `$个股(${code})$`).join('\n')
				finalContent = finalContent + '\n\n---\n\n' + stockTags
			}
		}

		// 将Vue的Proxy对象转换为纯JavaScript对象
		const data = {
			title: formData.value.title.trim(),
			type: formData.value.messageType || MESSAGE_TYPES.MORNING_FOCUS, // 使用选中的消息类型
			tags: tags,
			theme: formData.value.theme || 'default', // 添加主题字段
			content: finalContent,
			attachments: uploadedAttachments
		}

		// 如果使用了AI优化，添加原始内容和优化内容字段
		if (hasUsedOptimization.value && originalContent.value) {
			data.originalContent = originalContent.value.trim()
			data.aiOptimizedContent = optimizedContent.value.trim()
		}

		// 调试日志
		console.log('=== 提交消息数据 ===')
		console.log('完整数据:', JSON.stringify(data, null, 2))
		console.log('标题:', data.title)
		console.log('策略类型:', formData.value.strategy)
		console.log('推送对象:', formData.value.pushTarget)
		console.log('消息类型:', formData.value.messageType)
		console.log('最终tags:', data.tags)
		console.log('内容长度:', data.content.length)
		console.log('附件数量:', data.attachments.length)

		// 显示提交loading
		uni.showLoading({
			title: editMode.value ? '保存中...' : '发布中...',
			mask: true
		})

		let res
		if (editMode.value) {
			// 编辑模式
			console.log('编辑模式, messageId:', editMessageId.value)
			res = await updateMessageApi(editMessageId.value, data)
		} else {
			// 新建模式
			console.log('新建模式')
			res = await createMessageApi(data)
		}

		console.log('API响应:', res)

		// 判断响应是否成功 (code: 200 或 success: true)
		if (res.code === 200 || res.success) {
			// 清除草稿
			uni.removeStorageSync(DRAFT_KEY)

			// 如果是编辑模式,通知详情页刷新
			if (editMode.value) {
				const pages = getCurrentPages()
				if (pages.length > 1) {
					const prevPage = pages[pages.length - 2]
					// 检查上一页是否是详情页
					if (prevPage.route && prevPage.route.includes('message-detail')) {
						// 通知详情页刷新
						if (prevPage.$vm && prevPage.$vm.loadMessageDetail) {
							console.log('通知详情页刷新数据')
							prevPage.$vm.loadMessageDetail()
						}
					} else if (prevPage.$vm && prevPage.$vm.refreshList) {
						// 如果是列表页,刷新列表
						prevPage.$vm.refreshList()
					}
				}
			} else {
				// 新建模式,通知列表页刷新
				const pages = getCurrentPages()
				if (pages.length > 1) {
					const prevPage = pages[pages.length - 2]
					if (prevPage.$vm && prevPage.$vm.refreshList) {
						prevPage.$vm.refreshList()
					}
				}
			}

			uni.showToast({
				title: editMode.value ? '修改成功' : '发布成功',
				icon: 'success',
				duration: 1500
			})

			// 发布成功后自动返回消息中心并刷新
			setTimeout(() => {
				// 使用 reLaunch 返回消息中心，确保页面刷新
				uni.reLaunch({
					url: '/pages/messages/messages'
				})
			}, 500)
		} else {
			console.error('业务失败:', res)
			uni.showToast({
				title: res.message || (editMode.value ? '修改失败' : '发布失败'),
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('提交消息异常:')
		console.error('错误对象:', error)
		console.error('错误消息:', error.message)
		console.error('错误堆栈:', error.stack)
		if (error.response) {
			console.error('响应状态:', error.response.status)
			console.error('响应数据:', error.response.data)
		}
		uni.showToast({
			title: editMode.value ? '修改失败' : '发布失败',
			icon: 'none'
		})
	} finally {
		submitting.value = false
		uni.hideLoading()
	}
}

// 取消
const handleCancel = () => {
	uni.showModal({
		title: '提示',
		content: '确定要取消吗？草稿已自动保存。',
		success: (res) => {
			if (res.confirm) {
				uni.navigateBack()
			}
		}
	})
}

// 保存草稿
const saveDraft = () => {
	if (!editMode.value && (formData.value.title || formData.value.content)) {
		uni.setStorageSync(DRAFT_KEY, JSON.stringify(formData.value))
	}
}

// 恢复草稿
const restoreDraft = () => {
	const draft = uni.getStorageSync(DRAFT_KEY)
	if (draft && !editMode.value) {
		try {
			const draftData = JSON.parse(draft)
			if (draftData.title || draftData.content) {
				uni.showModal({
					title: '发现草稿',
					content: '是否恢复上次编辑的内容？',
					success: (res) => {
						if (res.confirm) {
							// 恢复草稿数据
							formData.value.strategy = draftData.strategy || MESSAGE_TAGS.SHORT_TERM
							formData.value.pushTarget = draftData.pushTarget || MESSAGE_TAGS.SHORT_TERM
							formData.value.messageType = draftData.messageType || MESSAGE_TYPES.MORNING_FOCUS
							formData.value.title = draftData.title || ''
							formData.value.content = draftData.content || ''
							formData.value.attachments = draftData.attachments || []
							uni.showToast({
								title: '草稿已恢复',
								icon: 'success'
							})
						} else {
							uni.removeStorageSync(DRAFT_KEY)
						}
					}
				})
			}
		} catch (error) {
			console.error('恢复草稿失败:', error)
		}
	}
}

// 恢复上次选择的策略类型
const restoreLastStrategy = () => {
	const lastStrategy = uni.getStorageSync(STRATEGY_KEY)
	if (lastStrategy) {
		formData.value.strategy = lastStrategy
		// 根据策略自动设置推送对象
		const option = strategyOptions.find(s => s.value === lastStrategy)
		if (option) {
			formData.value.pushTarget = option.pushTarget
		}
	}
}

// 恢复上次选择的主题
const restoreLastTheme = () => {
	const lastTheme = uni.getStorageSync(THEME_KEY)
	if (lastTheme) {
		formData.value.theme = lastTheme
	}
}

// 监听表单变化，自动保存草稿
watch(formData, () => {
	saveDraft()
}, { deep: true })

// 简单的Markdown解析器
const parseMarkdown = (text) => {
	if (!text) return ''

	let html = text
		// 转义HTML特殊字符
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')

		// 代码块（必须在一行开始处理）
		.replace(/```(\w*)([\s\S]*?)```/g, (match, lang, code) => {
			return `<pre><code class="code-block">${code.trim()}</code></pre>`
		})

		// 行内代码
		.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

		// 标题
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
		.replace(/^# (.*$)/gim, '<h1>$1</h1>')

		// 粗体和斜体
		.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')

		// 引用
		.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

		// 无序列表
		.replace(/^\- (.*$)/gim, '<li>$1</li>')

		// 有序列表
		.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

		// 链接
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link">$1</a>')

		// 换行
		.replace(/\n/g, '<br>')

	// 包装列表项
	html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
	// 合并相邻的ul标签
	html = html.replace(/<\/ul><br><ul>/g, '')

	return html
}

// 渲染后的HTML
const renderedHtml = computed(() => {
	return parseMarkdown(formData.value.content)
})

// AI优化内容的渲染HTML（用于预览弹窗）
const optimizedRenderedHtml = computed(() => {
	return parseMarkdown(optimizedContent.value)
})



// AI优化功能
const handleAiOptimize = async () => {
	// 验证内容
	if (!formData.value.content.trim()) {
		uni.showToast({
			title: '请先输入内容',
			icon: 'none',
			duration: 2000
		})
		return
	}

	// 保存原始内容
	originalContent.value = formData.value.content

	// 开始优化
	isOptimizing.value = true

	try {
		uni.showLoading({
			title: 'AI优化中，请稍候...',
			mask: true
		})

		// 调用AI优化API
		const response = await optimizeContentApi({
			content: formData.value.content
		})

		uni.hideLoading()

		// 检查响应
		if (response.code === 200 || response.success) {
			optimizedContent.value = response.data.optimized || response.data.optimizedContent || response.data.content || ''
			optimizationNote.value = response.data.optimizationNote || 'AI优化完成'

			if (!optimizedContent.value) {
				throw new Error('优化内容为空')
			}

			// 显示预览弹窗
			showOptimizePreview.value = true
			previewTab.value = 'optimized' // 默认显示优化版本

			uni.showToast({
				title: optimizationNote.value || '优化完成',
				icon: 'success',
				duration: 1500
			})
		} else {
			throw new Error(response.message || '优化失败')
		}
	} catch (error) {
		console.error('AI优化失败:', error)
		uni.hideLoading()

		// 显示友好的错误提示
		const errorMsg = error.message || error.response?.data?.message || '优化失败，请稍后重试'
		uni.showToast({
			title: errorMsg,
			icon: 'none',
			duration: 2000
		})
	} finally {
		isOptimizing.value = false
	}
}

// 使用优化版本
const handleUseOptimized = () => {
	if (optimizedContent.value) {
		// 保存原始内容（用于版本切换）
		// 如果还没有保存过原始内容，则保存当前内容
		if (!originalContent.value) {
			originalContent.value = formData.value.content
		}

		// 应用优化后的内容
		formData.value.content = optimizedContent.value

		// 标记已使用AI优化
		hasUsedOptimization.value = true

		// 自动切换到预览模式，展示markdown主题样式
		previewMode.value = true

		uni.showToast({
			title: '已应用优化内容',
			icon: 'success',
			duration: 1500
		})

		handleCloseOptimizePreview()
	}
}

// 保留原始版本
const handleKeepOriginal = () => {
	// 重置AI优化标记
	hasUsedOptimization.value = false
	originalContent.value = ''

	uni.showToast({
		title: '已保留原始内容',
		icon: 'success',
		duration: 1500
	})

	handleCloseOptimizePreview()
}

// 关闭优化预览弹窗
const handleCloseOptimizePreview = () => {
	showOptimizePreview.value = false
	previewTab.value = 'optimized'
	// 不清除optimizedContent，允许用户重新打开
}

// 重新生成AI优化
const handleRegenerate = async () => {
	// 开始优化
	isOptimizing.value = true

	try {
		uni.showLoading({
			title: 'AI重新优化中...',
			mask: true
		})

		// 调用AI优化API（使用原始内容）
		const response = await optimizeContentApi({
			content: originalContent.value || formData.value.content
		})

		uni.hideLoading()

		// 检查响应
		if (response.code === 200 || response.success) {
			optimizedContent.value = response.data.optimized || response.data.optimizedContent || response.data.content || ''
			optimizationNote.value = response.data.optimizationNote || 'AI优化完成'

			if (!optimizedContent.value) {
				throw new Error('优化内容为空')
			}

			// 切换到AI优化版标签
			previewTab.value = 'optimized'

			// 确保弹窗保持显示
			showOptimizePreview.value = true

			uni.showToast({
				title: '已重新生成',
				icon: 'success',
				duration: 1500
			})
		} else {
			throw new Error(response.message || 'AI优化失败')
		}
	} catch (error) {
		uni.hideLoading()
		console.error('AI重新优化失败:', error)
		uni.showToast({
			title: error.message || 'AI优化失败，请稍后重试',
			icon: 'none',
			duration: 2000
		})
	} finally {
		isOptimizing.value = false
	}
}

// 页面加载
onMounted(async () => {
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

	// 加载消息类型列表
	await loadMessageTypes()

	// 检查是否是编辑模式
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const messageId = currentPage.options.id
	const mode = currentPage.options.mode

	if (messageId && mode === 'edit') {
		// 编辑模式：加载消息详情
		editMode.value = true
		editMessageId.value = parseInt(messageId)

		try {
			const res = await getMessageDetailApi(editMessageId.value)
			// 兼容两种响应格式
			if ((res.success || res.code === 200) && res.data) {
				// 处理附件数据，转换path为统一格式
				const processedAttachments = (res.data.attachments || []).map(att => ({
					name: att.name,
					path: att.url.startsWith('/uploads/')
						? BASE_URL + att.url
						: att.url,
					url: att.url,
					type: att.type,
					size: att.size || 0
				}))

				// 确保tags是数组
				let tags = []
				if (Array.isArray(res.data.tags)) {
					tags = res.data.tags
				} else if (typeof res.data.tags === 'string') {
					try {
						tags = JSON.parse(res.data.tags)
					} catch (e) {
						console.warn('tags解析失败,使用默认值:', e)
						tags = [MESSAGE_TAGS.SHORT_TERM]
					}
				}

				console.log('编辑模式 - 加载的消息数据:', res.data)
				console.log('编辑模式 - 解析后的tags:', tags)

				// 解析tags到新的表单结构
				// 策略类型（从tags中提取）
				const strategyTag = tags.find(tag =>
					tag === MESSAGE_TAGS.SHORT_TERM ||
					tag === MESSAGE_TAGS.MID_TERM
				) || MESSAGE_TAGS.SHORT_TERM

				// 推送对象（从tags中提取，管理员）
				const pushTargetTag = tags.find(tag =>
					tag === MESSAGE_TAGS.SHORT_TERM ||
					tag === MESSAGE_TAGS.MID_TERM ||
					tag === MESSAGE_TAGS.ALL_USERS
				) || MESSAGE_TAGS.SHORT_TERM

				// 消息类型（从 type 字段获取，如果没有则使用默认值）
				const messageType = res.data.type || MESSAGE_TYPES.MORNING_FOCUS

				// Markdown主题（从 theme 字段获取，如果没有则使用默认值）
				const messageTheme = res.data.theme || 'default'

				// 从内容中解析股票代码
				const stockCodes = []
				const stockTagRegex = /\$个股\(([0-9]{6})\)\$/g
				let match
				while ((match = stockTagRegex.exec(res.data.content || '')) !== null) {
					stockCodes.push(match[1])
				}

				formData.value = {
					strategy: strategyTag,
					pushTarget: pushTargetTag,
					messageType: messageType,
					theme: messageTheme,
					title: res.data.title || '',
					content: res.data.content || '',
					attachments: processedAttachments,
					stockCodes: stockCodes
				}

				console.log('编辑模式 - formData已设置:', formData.value)
			} else {
				uni.showToast({
					title: '加载消息失败',
					icon: 'none'
				})
				setTimeout(() => uni.navigateBack(), 1500)
			}
		} catch (error) {
			console.error('加载消息详情失败:', error)
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
			setTimeout(() => uni.navigateBack(), 1500)
		}
	} else {
		// 新建模式：恢复上次选择的策略和主题
		restoreLastStrategy()
		restoreLastTheme()
		// 检查是否有草稿
		restoreDraft()
	}

	// 启动定时保存草稿（每30秒）
	draftTimer.value = setInterval(saveDraft, 30000)
})

// 页面卸载时清除定时器
onBeforeUnmount(() => {
	if (draftTimer.value) {
		clearInterval(draftTimer.value)
	}
})
</script>

<style lang="scss" scoped>
/* 微信小程序 button 组件样式重置 */
button {
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	line-height: normal;
	font-size: inherit;
}

button::after {
	border: none;
}

.create-message-container {
	height: 100vh;
	background-color: var(--bg-primary);
}

.form-scroll {
	height: 100%;
}

.form-container {
	padding: 30rpx;
}

.form-item {
	margin-bottom: 40rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: var(--text-primary);
	margin-bottom: 20rpx;
	font-weight: 500;
}

// 快捷设置区域（标签按钮组）
.quick-settings {
	background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
	padding: 20rpx 24rpx;
	border-radius: 12rpx;
	border: 2rpx solid #667eea;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.15);
}

.setting-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12rpx;
}

.setting-label {
	font-size: 26rpx;
	color: #667eea;
	font-weight: 600;
	min-width: 80rpx;
}

// 标签按钮组
.tag-group {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	justify-content: flex-start;
}

.tag-group-wrap {
	flex-wrap: wrap;
	gap: 16rpx;
}

.tag-btn {
	padding: 12rpx 32rpx;
	background: #ffffff;
	border: 2rpx solid #d0d7ff;
	border-radius: 28rpx;
	font-size: 26rpx;
	color: #666666;
	transition: all 0.2s;
	white-space: nowrap;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.08);
}

.tag-btn:active {
	transform: scale(0.95);
}

.tag-btn.active {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-color: transparent;
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	font-weight: 500;
}

.tag-btn:active {
	transform: scale(0.95);
}

.tag-btn.active {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-color: #667eea;
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

// 消息类型区域
.msg-type-section {
	margin-bottom: 24rpx;
}

.msg-type-section .form-label {
	margin-bottom: 16rpx;
}

/* 内容区域表头：标签 + 操作按钮 */
.content-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.content-actions {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

/* 插入图片小按钮 */
.image-upload-btn-small {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56rpx;
	height: 56rpx;
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
	border: 2rpx solid rgba(102, 126, 234, 0.3);
	border-radius: 8rpx;
	font-size: 28rpx;
	transition: all 0.2s;
}

.image-upload-btn-small:active {
	transform: scale(0.92);
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
}

.clipboard-image-tip {
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 1.5;
	color: #8a6d3b;
	background: #fff8e1;
	border: 1rpx solid #ffe0a3;
	border-radius: 12rpx;
	padding: 14rpx 18rpx;
}

.form-label-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.mode-switch {
	display: flex;
	background: var(--bg-tertiary);
	border-radius: 8rpx;
	padding: 4rpx;
}

.mode-btn {
	padding: 8rpx 24rpx;
	font-size: 24rpx;
	color: var(--text-secondary);
	border-radius: 6rpx;
	transition: all 0.3s;
	cursor: pointer;
}

.mode-btn.active {
	background: var(--bg-secondary);
	color: var(--color-primary);
	font-weight: 500;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.2);
}

.editor-container {
	position: relative;
}

.form-input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	color: var(--text-primary);
	background-color: var(--bg-secondary);
	border: 2rpx solid var(--border-primary);
	border-radius: 8rpx;
	box-sizing: border-box;
}

.picker-view {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 24rpx;
	background-color: var(--bg-secondary);
	border: 2rpx solid var(--border-primary);
	border-radius: 8rpx;
}

// 主题选择器特殊样式
.picker-view.theme-picker {
	height: auto;
	min-height: 88rpx;
	padding: 16rpx 24rpx;
}

.theme-preview-small {
	width: 60rpx;
	height: 60rpx;
	border-radius: 8rpx;
	flex-shrink: 0;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.theme-info-picker {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	padding: 0 16rpx;
}

.theme-desc-picker {
	font-size: 22rpx;
	color: #999999;
}

.picker-text {
	font-size: 28rpx;
	color: var(--text-primary);
}

.picker-placeholder {
	font-size: 28rpx;
	color: var(--text-placeholder);
}

.picker-arrow {
	font-size: 20rpx;
	color: var(--text-tertiary);
}

.form-textarea {
	width: 100%;
	min-height: 300rpx;
	padding: 24rpx;
	font-size: 28rpx;
	color: var(--text-primary);
	background-color: var(--bg-secondary);
	border: 2rpx solid var(--border-primary);
	border-radius: 8rpx;
	box-sizing: border-box;
	line-height: 1.6;
}



.form-textarea {
	border-radius: 0 0 8rpx 8rpx;
}

.preview-container {
	min-height: 400rpx;
	max-height: 800rpx;
	padding: 32rpx 28rpx;
	background-color: var(--bg-secondary);
	border: 2rpx solid var(--border-primary);
	border-radius: 8rpx;
	box-sizing: border-box;
	overflow-y: auto;
}

.markdown-preview {
	font-size: 30rpx;
	color: var(--text-primary);
	line-height: 1.9;
	word-wrap: break-word;
	overflow-wrap: break-word;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
/* Markdown渲染样式 - 参考mdnice */
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3 {
	margin: 48rpx 0 24rpx;
	font-weight: 700;
	line-height: 1.4;
	color: var(--text-primary);
}

.markdown-preview h1 {
	font-size: 52rpx;
	padding-bottom: 20rpx;
	border-bottom: 6rpx solid #667eea;
	margin-top: 0;
}

.markdown-preview h2 {
	font-size: 44rpx;
	padding-bottom: 16rpx;
	border-bottom: 3rpx solid #e8e8e8;
}

.markdown-preview h3 {
	font-size: 38rpx;
	color: #333;
}

.markdown-preview p {
	margin: 24rpx 0;
	line-height: 1.9;
	text-align: justify;
}

.markdown-preview strong {
	font-weight: 700;
	color: #1a1a1a;
	background: linear-gradient(180deg, transparent 65%, #ffd700 65%);
}

.markdown-preview em {
	font-style: italic;
	color: #555555;
}

.markdown-preview code.inline-code {
	padding: 6rpx 14rpx;
	font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace;
	font-size: 26rpx;
	color: #e74c3c;
	background: #fff5f5;
	border: 1rpx solid #fed7d7;
	border-radius: 6rpx;
	font-weight: 500;
}

.markdown-preview pre {
	margin: 28rpx 0;
	padding: 28rpx;
	background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
	border-radius: 12rpx;
	overflow-x: auto;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
	border: 2rpx solid #4a5568;
}

.markdown-preview pre code.code-block {
	display: block;
	font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace;
	font-size: 26rpx;
	color: #e2e8f0;
	line-height: 1.7;
	white-space: pre-wrap;
	word-wrap: break-word;
}

.markdown-preview blockquote {
	margin: 24rpx 0;
	padding: 24rpx 28rpx;
	font-size: 30rpx;
	color: #4a5568;
	background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
	border-left: 10rpx solid #667eea;
	border-radius: 8rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.markdown-preview blockquote p {
	margin: 0;
}

.markdown-preview ul,
.markdown-preview ol {
	margin: 24rpx 0;
	padding-left: 56rpx;
}

.markdown-preview li {
	margin: 16rpx 0;
	line-height: 1.9;
	list-style-position: outside;
}

.markdown-preview ul li {
	list-style-type: disc;
}

.markdown-preview ul ul {
	margin: 16rpx 0;
}

.markdown-preview ol li {
	list-style-type: decimal;
}

.markdown-preview a.md-link {
	color: #667eea;
	text-decoration: none;
	border-bottom: 2rpx solid #667eea;
	transition: all 0.2s;
	font-weight: 500;
}

.markdown-preview a.md-link:active {
	color: #764ba2;
	border-bottom-color: #764ba2;
}

.markdown-preview hr {
	border: none;
	border-top: 3rpx solid #e8e8e8;
	margin: 48rpx 0;
}

.markdown-preview table {
	width: 100%;
	border-collapse: collapse;
	margin: 24rpx 0;
	font-size: 28rpx;
}

.markdown-preview table th,
.markdown-preview table td {
	border: 2rpx solid #e8e8e8;
	padding: 16rpx;
	text-align: left;
}

.markdown-preview table th {
	background: #f7fafc;
	font-weight: 600;
}

.markdown-preview img {
	max-width: 100%;
	height: auto;
	border-radius: 8rpx;
	margin: 24rpx 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.char-count {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #999999;
	text-align: right;
}

.upload-container {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.file-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	background: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
}

.file-name {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-remove {
	font-size: 40rpx;
	color: #ff4d4f;
	margin-left: 20rpx;
}

.upload-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 160rpx;
	background: #ffffff;
	border: 2rpx dashed #d9d9d9;
	border-radius: 8rpx;
}

.upload-icon {
	font-size: 48rpx;
	color: #999999;
	margin-bottom: 10rpx;
}

.upload-text {
	font-size: 26rpx;
	color: #999999;
}

.form-hint {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #999999;
	line-height: 1.5;
}

.button-group {
	display: flex;
	gap: 20rpx;
	margin-top: 60rpx;
	padding-bottom: 40rpx;
}

.cancel-btn,
.submit-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 32rpx;
	border-radius: 8rpx;
	border: none;
	text-align: center;
}

.cancel-btn {
	background: #ffffff;
	color: #666666;
	border: 2rpx solid #e0e0e0;
}

.submit-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-weight: bold;
}

.submit-btn[disabled] {
	opacity: 0.6;
}

/* === 新增样式：固定底部按钮和编辑器优化 === */

/* 底部占位 */
.bottom-spacer {
	height: 180rpx;
}

/* 固定底部按钮栏 */
.fixed-bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	gap: 20rpx;
	padding: 20rpx 30rpx;
	background: #ffffff;
	border-top: 2rpx solid #e5e5e5;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
	z-index: 100;
	// 安全区域适配
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

/* 内容编辑区域优化 */
.content-item {
	margin-bottom: 40rpx;
}

/* 编辑器容器 */
.editor-container {
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	overflow: hidden;
	background: #ffffff;
}

/* Markdown编辑器 */
.markdown-editor {
	min-height: 400rpx;
	max-height: 800rpx;
	border: none;
	border-radius: 0;
	padding: 24rpx;
	font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	font-size: 28rpx;
	line-height: 1.8;
}

/* 编辑器底部 */
.editor-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 24rpx;
	background: #fafafa;
	border-top: 1rpx solid #e5e5e5;
	font-size: 24rpx;
	color: #999999;
}

.editor-footer-left {
	display: flex;
	align-items: center;
}

.image-upload-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 28rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 32rpx;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.35);
	transition: all 0.2s;
}

.image-upload-btn:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.2);
}

.image-upload-icon {
	font-size: 32rpx;
}

.image-upload-text {
	font-size: 26rpx;
	color: #ffffff;
	font-weight: 500;
}

.hint-text-mini {
	font-size: 24rpx;
	color: #667eea;
}

/* 预览容器 */
.preview-container {
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	overflow: hidden;
	background: #ffffff;
	min-height: 400rpx;
	max-height: 800rpx;
}

.preview-scroll {
	height: 100%;
	max-height: 750rpx;
	padding: 24rpx;
}

/* 附件区域 */
.attachment-item {
	margin-bottom: 40rpx;
}

/* 文件项优化 */
.file-item {
	position: relative;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	width: 160rpx;
	height: 160rpx;
	margin-right: 20rpx;
	margin-bottom: 20rpx;
	padding: 0;
	background: #f5f5f5;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	overflow: hidden;
}

.file-thumb {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.file-name {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 8rpx;
	font-size: 22rpx;
	color: #333333;
	background: rgba(255, 255, 255, 0.9);
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-remove {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #ffffff;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 50%;
	cursor: pointer;
	transition: all 0.2s;

	&:active {
		background: rgba(0, 0, 0, 0.8);
		transform: scale(0.95);
	}
}

/* 按钮组优化 */
.button-group {
	display: flex;
	gap: 20rpx;
}

.cancel-btn,
.submit-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	border: none;
}

/* Markdown预览增强 */
.markdown-preview {
	font-size: 30rpx;
	line-height: 1.8;
	color: #333333;
	word-wrap: break-word;
	word-break: break-all;
}

/* 滚动容器高度调整 */
.form-scroll {
	height: calc(100vh - 140rpx); // 减去底部按钮栏高度
/* 主题选择器样式 */.theme-selector {	padding: 20rpx;	background: #f8f9fa;	border-bottom: 2rpx solid #e5e5e5;}.theme-selector-label {	font-size: 28rpx;	color: #333;	font-weight: 500;	margin-bottom: 16rpx;	display: block;}.theme-list {	display: flex;	white-space: nowrap;	padding: 10rpx 0;}.theme-item {	display: inline-flex;	flex-direction: column;	align-items: center;	min-width: 100rpx;	margin-right: 20rpx;	padding: 12rpx;	border-radius: 12rpx;	background: #ffffff;	border: 2rpx solid #e0e0e0;	transition: all 0.3s ease;}.theme-item.active {	border-color: #667eea;	background: #f0f2ff;	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.2);}.theme-preview-color {	width: 64rpx;	height: 64rpx;	border-radius: 8rpx;	display: flex;	align-items: center;	justify-content: center;	margin-bottom: 8rpx;	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);}.theme-check-icon {	color: #ffffff;	font-size: 32rpx;	font-weight: bold;	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);}.theme-name {	font-size: 22rpx;	color: #666;}.theme-item.active .theme-name {	color: #667eea;	font-weight: 500;}.theme-hint {	font-size: 22rpx;	color: #667eea;}/* 主题预览样式 - 深色主题 */.markdown-preview.theme-dark {	background: #1a1a1a;	color: #e2e8f0;}.markdown-preview.theme-dark h1,.markdown-preview.theme-dark h2,.markdown-preview.theme-dark h3 {	color: #f1f5f9;}.markdown-preview.theme-dark strong {	color: #fbbf24;}.markdown-preview.theme-dark blockquote {	background: #2d3748;	border-left-color: #667eea;	color: #cbd5e0;}.markdown-preview.theme-dark code.inline-code {	background: #374151;	color: #f87171;	border-color: #4b5563;}
}

/* 主题和AI优化同行样式 */
.theme-ai-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	margin-bottom: 30rpx;
}

.theme-ai-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.theme-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.theme-picker {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 12rpx 20rpx;
	background: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	min-width: 200rpx;
}

.theme-color-preview {
	width: 40rpx;
	height: 40rpx;
	border-radius: 6rpx;
	flex-shrink: 0;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.theme-picker-text {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.picker-arrow {
	font-size: 20rpx;
	color: #999;
}

.ai-optimize-btn-inline {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx 28rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 10rpx;
	color: #ffffff;
	font-size: 28rpx;
	font-weight: 500;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s;

	&:active {
		transform: scale(0.95);
	}

	&[disabled] {
		opacity: 0.5;
		background: #ccc;
		box-shadow: none;
	}
}

/* AI优化区域样式 */
.ai-optimize-section {
	padding: 28rpx;
	background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
	border-radius: 16rpx;
	border: 2rpx solid #e8ecff;
	margin-bottom: 30rpx;
}

.ai-optimize-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.ai-label {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.style-picker {
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 12rpx 20rpx;
	background: #ffffff;
	border: 2rpx solid #d0d7ff;
	border-radius: 10rpx;
	min-width: 220rpx;
}

.style-icon {
	font-size: 28rpx;
}

.style-text {
	flex: 1;
	font-size: 26rpx;
	color: #667eea;
	font-weight: 500;
}

.ai-optimize-desc {
	margin-bottom: 20rpx;
}

.desc-text {
	font-size: 24rpx;
	color: #888;
}

.ai-optimize-btn {
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 12rpx;
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 600;
	box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.35);
	transition: all 0.3s;

	&:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	}

	&[disabled] {
		opacity: 0.6;
		background: linear-gradient(135deg, #a0a0a0 0%, #888888 100%);
		box-shadow: none;
	}
}

.btn-content {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.btn-icon {
	font-size: 32rpx;
}

.btn-icon.spinning {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.ai-optimize-btn-inline.loading {
	background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
}



/* AI优化按钮和编辑器底部样式 */
.footer-left {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.ai-optimize-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 20rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 8rpx;
	color: #ffffff;
	font-size: 26rpx;
	font-weight: 500;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s;

	&:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.2);
	}

	&[disabled] {
		opacity: 0.5;
		background: #e0e0e0;
		box-shadow: none;
	}
}

.ai-optimize-btn.loading {
	background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
}

.ai-icon {
	font-size: 28rpx;
}

.loading-icon {
	font-size: 28rpx;
	animation: rotate 1s linear infinite;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.ai-text {
	font-size: 26rpx;
}

/* AI优化预览弹窗 */
.optimize-preview-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 40rpx;
}

.optimize-preview-content {
	width: 100%;
	max-width: 700rpx;
	background: #ffffff;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.preview-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
}

.preview-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
}

.preview-close {
	font-size: 48rpx;
	color: #ffffff;
	cursor: pointer;
	line-height: 1;
}

/* 优化说明横幅 */
.optimization-note-banner {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 20rpx 32rpx;
	background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
	border-bottom: 2rpx solid #fbbf24;
}

.note-icon {
	font-size: 32rpx;
}

.note-text {
	flex: 1;
	font-size: 26rpx;
	color: #92400e;
	line-height: 1.5;
}

.preview-tabs {
	display: flex;
	background: #f5f5f5;
	border-bottom: 2rpx solid #e0e0e0;
}

.preview-tab {
	flex: 1;
	padding: 24rpx;
	text-align: center;
	font-size: 28rpx;
	color: #666666;
	border-bottom: 4rpx solid transparent;
	transition: all 0.3s;
	cursor: pointer;

	&.active {
		color: #667eea;
		border-bottom-color: #667eea;
		background: #ffffff;
		font-weight: 500;
	}
}

.preview-body {
	height: 600rpx;
	padding: 32rpx;
	background: #ffffff;
}

.content-preview {
	min-height: 100%;
}

.preview-text {
	font-size: 28rpx;
	line-height: 1.8;
	color: #333333;
	white-space: pre-wrap;
	word-wrap: break-word;
}

/* AI优化预览弹窗中的Markdown渲染 */
.markdown-preview-wrapper {
	overflow: hidden;
}

.markdown-preview-wrapper .markdown-preview {
	padding: 20rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	line-height: 1.8;
}

.preview-footer {
	display: flex;
	gap: 20rpx;
	padding: 24rpx 32rpx;
	background: #f8f9fa;
	border-top: 2rpx solid #e0e0e0;
}

.preview-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	font-size: 28rpx;
	border-radius: 12rpx;
	border: none;
	font-weight: 500;
	transition: all 0.3s;
}

.preview-btn-cancel {
	background: #ffffff;
	color: #666666;
	border: 2rpx solid #e0e0e0;
}

// 弃用按钮 - 灰色系
.preview-btn-discard {
	background: #ffffff;
	color: #6b7280;
	border: 2rpx solid #d1d5db;
}

// 采纳按钮 - 主色调渐变
.preview-btn-adopt {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

// 重试按钮 - 橙色渐变
.preview-btn-retry {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.3);
	display: flex;
	align-items: center;
	gap: 6rpx;

	&:disabled {
		opacity: 0.6;
	}
}

.preview-btn:active {
	transform: scale(0.95);
}
/* ========== 编辑页面预览主题样式 (v1.8.2修复) ========== *//* 简约白 */.markdown-preview.theme-default { background: #ffffff; color: #374151; }.markdown-preview.theme-default h1, .markdown-preview.theme-default h2, .markdown-preview.theme-default h3 { color: #1f2937; }.markdown-preview.theme-default strong { color: #667eea; }.markdown-preview.theme-default blockquote { background: #f3f4f6; border-left-color: #667eea; color: #4b5563; }/* GitHub */.markdown-preview.theme-github { background: #ffffff; color: #24292f; }.markdown-preview.theme-github h1, .markdown-preview.theme-github h2, .markdown-preview.theme-github h3 { color: #1f2328; }.markdown-preview.theme-github strong { color: #0550ae; }.markdown-preview.theme-github blockquote { background: #f6f8fa; border-left-color: #0366d6; color: #57606a; }/* 翡翠绿 */.markdown-preview.theme-emerald { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); color: #064e3b; }.markdown-preview.theme-emerald h1, .markdown-preview.theme-emerald h2, .markdown-preview.theme-emerald h3 { color: #065f46; }.markdown-preview.theme-emerald strong { color: #047857; }.markdown-preview.theme-emerald blockquote { background: rgba(16,185,129,0.15); border-left-color: #10b981; color: #065f46; }/* 蓝色海洋 */.markdown-preview.theme-ocean { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); color: #0c4a6e; }.markdown-preview.theme-ocean h1, .markdown-preview.theme-ocean h2, .markdown-preview.theme-ocean h3 { color: #075985; }.markdown-preview.theme-ocean strong { color: #0284c7; }.markdown-preview.theme-ocean blockquote { background: rgba(14,165,233,0.15); border-left-color: #0ea5e9; color: #0369a1; }/* 暖阳橙 */.markdown-preview.theme-warm { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); color: #78350f; }.markdown-preview.theme-warm h1, .markdown-preview.theme-warm h2, .markdown-preview.theme-warm h3 { color: #92400e; }.markdown-preview.theme-warm strong { color: #ea580c; }.markdown-preview.theme-warm blockquote { background: rgba(249,115,22,0.15); border-left-color: #f97316; color: #9a3412; }/* 紫罗兰 */.markdown-preview.theme-violet { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); color: #5b21b6; }.markdown-preview.theme-violet h1, .markdown-preview.theme-violet h2, .markdown-preview.theme-violet h3 { color: #6d28d9; }.markdown-preview.theme-violet strong { color: #7c3aed; }.markdown-preview.theme-violet blockquote { background: rgba(139,92,246,0.15); border-left-color: #8b5cf6; color: #6d28d9; }/* 玫瑰红 */.markdown-preview.theme-rose { background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); color: #9f1239; }.markdown-preview.theme-rose h1, .markdown-preview.theme-rose h2, .markdown-preview.theme-rose h3 { color: #be123c; }.markdown-preview.theme-rose strong { color: #e11d48; }.markdown-preview.theme-rose blockquote { background: rgba(251,113,133,0.15); border-left-color: #fb7185; color: #be123c; }/* 青柠绿 */.markdown-preview.theme-lime { background: linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%); color: #365314; }.markdown-preview.theme-lime h1, .markdown-preview.theme-lime h2, .markdown-preview.theme-lime h3 { color: #3f6212; }.markdown-preview.theme-lime strong { color: #65a30d; }.markdown-preview.theme-lime blockquote { background: rgba(132,204,22,0.15); border-left-color: #84cc16; color: #3f6212; }/* 科技蓝 */.markdown-preview.theme-tech { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); color: #1e3a8a; }.markdown-preview.theme-tech h1, .markdown-preview.theme-tech h2, .markdown-preview.theme-tech h3 { color: #1e40af; }.markdown-preview.theme-tech strong { color: #2563eb; }.markdown-preview.theme-tech blockquote { background: rgba(96,165,250,0.15); border-left-color: #60a5fa; color: #1d4ed8; }/* 石墨灰 */.markdown-preview.theme-slate { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); color: #334155; }.markdown-preview.theme-slate h1, .markdown-preview.theme-slate h2, .markdown-preview.theme-slate h3 { color: #1e293b; }.markdown-preview.theme-slate strong { color: #475569; }.markdown-preview.theme-slate blockquote { background: rgba(148,163,184,0.2); border-left-color: #94a3b8; color: #475569; }/* 日落金 */.markdown-preview.theme-sunset { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); color: #92400e; }.markdown-preview.theme-sunset h1, .markdown-preview.theme-sunset h2, .markdown-preview.theme-sunset h3 { color: #b45309; }.markdown-preview.theme-sunset strong { color: #d97706; }.markdown-preview.theme-sunset blockquote { background: rgba(251,191,36,0.2); border-left-color: #fbbf24; color: #92400e; }

/* ========== 股票关联区域 - 专业金融风格 ========== */
.stock-section {
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-radius: 16rpx;
	padding: 28rpx;
	border: 2rpx solid #e2e8f0;
	margin-bottom: 32rpx;
}

.stock-section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.stock-section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1e293b;
}

.stock-section-count {
	font-size: 24rpx;
	color: #94a3b8;
	background: #ffffff;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	border: 1rpx solid #e2e8f0;
}

/* 股票标签展示区 */
.stock-tags-area {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 24rpx;
}

/* 股票芯片样式 - 同花顺风格 */
.stock-chip {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border: 2rpx solid #3b82f6;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.15);
	transition: all 0.2s;
}

.stock-chip:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.25);
}

.stock-chip-code {
	font-size: 30rpx;
	font-weight: 600;
	color: #1e40af;
	font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
	letter-spacing: 1rpx;
}

.stock-chip-market {
	font-size: 20rpx;
	color: #ffffff;
	background: #3b82f6;
	padding: 2rpx 10rpx;
	border-radius: 6rpx;
	font-weight: 500;
}

.stock-chip-close {
	font-size: 32rpx;
	color: #ef4444;
	margin-left: 8rpx;
	opacity: 0.7;
	transition: opacity 0.2s;
}

.stock-chip-close:active {
	opacity: 1;
}

/* 添加股票输入区 */
.stock-add-area {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 20rpx;
}

.stock-input-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	background: #ffffff;
	border: 2rpx solid #cbd5e1;
	border-radius: 12rpx;
	padding: 0 20rpx;
	transition: border-color 0.2s;
}

.stock-input-wrapper:focus-within {
	border-color: #3b82f6;
	box-shadow: 0 0 0 4rpx rgba(59, 130, 246, 0.1);
}

.stock-input-prefix {
	font-size: 26rpx;
	color: #64748b;
	margin-right: 12rpx;
	white-space: nowrap;
}

.stock-code-input {
	flex: 1;
	height: 80rpx;
	font-size: 32rpx;
	font-weight: 500;
	color: #1e293b;
	font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
	letter-spacing: 2rpx;
}

/* 操作按钮组 */
.stock-action-btns {
	display: flex;
	gap: 12rpx;
}

.stock-action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6rpx;
	padding: 16rpx 24rpx;
	border-radius: 10rpx;
	border: none;
	font-size: 26rpx;
	font-weight: 500;
	transition: all 0.2s;
}

.stock-lookup-btn {
	background: #f1f5f9;
	color: #475569;
	border: 2rpx solid #cbd5e1;
}

.stock-lookup-btn:active {
	background: #e2e8f0;
}

.stock-add-btn {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
}

.stock-add-btn:active {
	transform: scale(0.98);
}

.action-icon {
	font-size: 28rpx;
}

.action-text {
	font-size: 26rpx;
}

/* 提示信息 */
.stock-hint {
	display: flex;
	align-items: center;
	gap: 10rpx;
	padding: 16rpx 20rpx;
	background: rgba(59, 130, 246, 0.08);
	border-radius: 10rpx;
	border: 1rpx solid rgba(59, 130, 246, 0.2);
}

.hint-icon {
	font-size: 28rpx;
}

.hint-text {
	font-size: 24rpx;
	color: #3b82f6;
	line-height: 1.5;
}

/* ========== 消息类型管理 ========== */
.form-label-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.manage-types-btn {
	font-size: 26rpx;
	color: #667eea;
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	background: rgba(102, 126, 234, 0.1);
}

.type-manager-content {
	max-height: 70vh;
}

.type-add-form {
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.type-add-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 20rpx;
}

.type-form-row {
	margin-bottom: 16rpx;
}

.type-input {
	width: 100%;
	height: 72rpx;
	padding: 0 20rpx;
	background: #ffffff;
	border: 2rpx solid #e5e7eb;
	border-radius: 12rpx;
	font-size: 28rpx;
}

.type-placeholder {
	color: #9ca3af;
}

.type-color-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.type-color-label {
	font-size: 26rpx;
	color: #6b7280;
}

.type-color-options {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.type-color-dot {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	border: 4rpx solid transparent;
	cursor: pointer;
	transition: all 0.2s;
}

.type-color-dot.selected {
	border-color: #1f2937;
	transform: scale(1.1);
}

.type-add-btn {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 500;
	border: none;
	border-radius: 12rpx;
	margin-top: 20rpx;
}

.type-list-section {
	padding: 20rpx;
}

.type-list-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #1f2937;
	margin-bottom: 16rpx;
}

.type-list {
	background: #ffffff;
	border-radius: 12rpx;
	overflow: hidden;
}

.type-list-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 24rpx;
	border-bottom: 1rpx solid #f3f4f6;
}

.type-list-item:last-child {
	border-bottom: none;
}

.type-item-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.type-color-indicator {
	width: 24rpx;
	height: 24rpx;
	border-radius: 6rpx;
}

.type-item-label {
	font-size: 28rpx;
	color: #374151;
}

.type-item-value {
	font-size: 24rpx;
	color: #9ca3af;
}

// 类型列表右侧
.type-item-right {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

// 默认标签
.type-item-badge {
	font-size: 20rpx;
	color: #10b981;
	background: rgba(16, 185, 129, 0.1);
	padding: 2rpx 10rpx;
	border-radius: 6rpx;
}

// 删除按钮（仅自定义类型显示）
.type-item-delete {
	font-size: 24rpx;
	color: #e74c3c;
	padding: 8rpx 12rpx;
	border-radius: 8rpx;
	background: rgba(231, 76, 60, 0.08);

	&:active {
		background: rgba(231, 76, 60, 0.2);
	}

	&.loading {
		opacity: 0.5;
	}
}
</style>

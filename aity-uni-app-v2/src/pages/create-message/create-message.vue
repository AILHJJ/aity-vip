<template>
	<view class="create-message-container">
		<scroll-view class="form-scroll" scroll-y>
			<view class="form-container">
				<!-- 标题 -->
				<view class="form-item">
					<Input
						v-model="formData.title"
						label="消息标题"
						placeholder="请输入消息标题"
						maxlength="100"
					/>
				</view>

				<!-- 类型 -->
				<view class="form-item">
					<text class="form-label">消息类型 *</text>
					<picker
						mode="selector"
						:range="messageTypes"
						range-key="label"
						@change="handleTypeChange"
					>
						<view class="picker-view">
							<text :class="formData.type ? 'picker-text' : 'picker-placeholder'">
								{{ formData.type ? getTypeLabel(formData.type) : '请选择消息类型' }}
							</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>

				<!-- 标签 -->
				<view class="form-item">
					<text class="form-label">目标用户 *</text>
					<view class="tags-container">
						<view
							v-for="tag in availableTags"
							:key="tag.value"
							class="tag-item"
							:class="{ active: formData.tags.includes(tag.value) }"
							@click="handleTagToggle(tag.value)"
						>
							{{ tag.label }}
						</view>
					</view>
				</view>

				<!-- 内容 -->
				<view class="form-item">
					<view class="form-label-row">
						<text class="form-label">消息内容 *</text>
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
					</view>

					<!-- 编辑模式 -->
					<view v-if="!previewMode" class="editor-container">
						<!-- Markdown工具栏 -->
						<view class="markdown-toolbar">
							<text class="toolbar-btn" @click="insertMarkdown('**', '**')" title="粗体">B</text>
							<text class="toolbar-btn" @click="insertMarkdown('*', '*')" title="斜体">I</text>
							<text class="toolbar-btn" @click="insertMarkdown('# ', '')" title="标题">H</text>
							<text class="toolbar-btn" @click="insertMarkdown('- ', '')" title="列表">≡</text>
							<text class="toolbar-btn" @click="insertMarkdown('`', '`')" title="代码">&lt;/&gt;</text>
							<text class="toolbar-btn" @click="insertMarkdown('[', '](url)')" title="链接">🔗</text>
							<text class="toolbar-btn" @click="insertMarkdown('> ', '')" title="引用">"</text>
						</view>
						<textarea
							class="form-textarea"
							v-model="formData.content"
							placeholder="支持 Markdown 格式，使用工具栏快速插入格式"
							placeholder-style="color: #999999"
							:maxlength="5000"
							:show-confirm-bar="false"
						/>
						<text class="char-count">{{ formData.content.length }}/5000</text>
					</view>

					<!-- 预览模式 -->
					<view v-else class="preview-container">
						<view class="markdown-preview" v-html="renderedHtml"></view>
						<text class="char-count">{{ formData.content.length }}/5000</text>
					</view>
				</view>

				<!-- 附件上传 -->
				<view class="form-item">
					<text class="form-label">附件（可选）</text>
					<view class="upload-container">
						<view
							v-for="(file, index) in formData.attachments"
							:key="index"
							class="file-item"
						>
							<text class="file-name">{{ file.name }}</text>
							<text class="file-remove" @click="handleRemoveFile(index)">×</text>
						</view>
						<view class="upload-btn" @click="handleUpload">
							<text class="upload-icon">+</text>
							<text class="upload-text">上传图片</text>
						</view>
					</view>
					<view class="form-hint">
						<text class="hint-text">💡 提示：支持选择或粘贴图片（Ctrl+V），单次最多9张，每张不超过10MB</text>
					</view>
				</view>

				<!-- 提交按钮 -->
				<view class="button-group">
					<button class="cancel-btn" @click="handleCancel">取消</button>
					<button class="submit-btn" :disabled="submitting" @click="handleSubmit">
						{{ submitting ? '发布中...' : '发布消息' }}
					</button>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useUserStore } from '../../store/user'
import { createMessageApi, updateMessageApi, getMessageDetailApi } from '../../api/message'
import { MESSAGE_TYPES, MESSAGE_TAGS, MESSAGE_TYPE_LABELS, MESSAGE_TAG_LABELS } from '../../utils/constants'
import { Input } from '@/components/common'

const userStore = useUserStore()

// 草稿存储key
const DRAFT_KEY = 'message_draft'

// 预览模式
const previewMode = ref(false)

// 表单数据
const formData = ref({
	title: '',
	type: '',
	tags: [],
	content: '',
	attachments: []
})

const submitting = ref(false)
const editMode = ref(false)
const editMessageId = ref(0)
const draftTimer = ref(null)

// 消息类型选项
const messageTypes = computed(() => {
	return Object.keys(MESSAGE_TYPES).map(key => ({
		value: MESSAGE_TYPES[key],
		label: MESSAGE_TYPE_LABELS[MESSAGE_TYPES[key]]
	}))
})

// 可用标签
const availableTags = [
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.ALL_USERS], value: MESSAGE_TAGS.ALL_USERS },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM], value: MESSAGE_TAGS.SHORT_TERM },
	{ label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM], value: MESSAGE_TAGS.MID_TERM }
]

// 获取类型标签
const getTypeLabel = (type) => {
	return MESSAGE_TYPE_LABELS[type] || type
}

// 处理类型选择
const handleTypeChange = (e) => {
	const index = e.detail.value
	formData.value.type = messageTypes.value[index].value
}

// 处理标签切换
const handleTagToggle = (tag) => {
	const index = formData.value.tags.indexOf(tag)
	if (index > -1) {
		formData.value.tags.splice(index, 1)
	} else {
		formData.value.tags.push(tag)
	}
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
	if (!formData.value.title.trim()) {
		uni.showToast({
			title: '请输入消息标题',
			icon: 'none'
		})
		return false
	}

	if (!formData.value.type) {
		uni.showToast({
			title: '请选择消息类型',
			icon: 'none'
		})
		return false
	}

	if (formData.value.tags.length === 0) {
		uni.showToast({
			title: '请选择目标用户',
			icon: 'none'
		})
		return false
	}

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
		const data = {
			title: formData.value.title.trim(),
			type: formData.value.type,
			tags: formData.value.tags,
			content: formData.value.content.trim(),
			attachments: formData.value.attachments
		}

		let res
		if (editMode.value) {
			// 编辑模式
			res = await updateMessageApi(editMessageId.value, data)
		} else {
			// 新建模式
			res = await createMessageApi(data)
		}

		if (res.success) {
			// 清除草稿
			uni.removeStorageSync(DRAFT_KEY)

			uni.showToast({
				title: editMode.value ? '修改成功' : '发布成功',
				icon: 'success'
			})

			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} else {
			uni.showToast({
				title: res.message || (editMode.value ? '修改失败' : '发布失败'),
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('提交消息失败:', error)
		uni.showToast({
			title: editMode.value ? '修改失败' : '发布失败',
			icon: 'none'
		})
	} finally {
		submitting.value = false
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
							formData.value = draftData
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

// 插入Markdown语法
const insertMarkdown = (before, after) => {
	const textarea = uni.createSelectorQuery().select('.form-textarea')

	// 获取当前光标位置（在小程序中可能无法获取，使用末尾）
	const content = formData.value.content
	const cursorPosition = content.length

	// 构建新内容
	let newContent = ''
	let newPosition = 0

	if (before === '# ') {
		// 标题：在行首插入
		const lines = content.split('\n')
		const currentLineIndex = content.substring(0, cursorPosition).split('\n').length - 1
		lines[currentLineIndex] = before + lines[currentLineIndex]
		newContent = lines.join('\n')
		newPosition = cursorPosition + before.length
	} else if (before === '- ' || before === '> ') {
		// 列表和引用：在行首插入
		const lines = content.split('\n')
		const currentLineIndex = content.substring(0, cursorPosition).split('\n').length - 1
		lines[currentLineIndex] = before + lines[currentLineIndex]
		newContent = lines.join('\n')
		newPosition = cursorPosition + before.length
	} else if (before === '[') {
		// 链接：插入链接模板
		const selectedText = '' // 在小程序中无法获取选中文本
		newContent = content.substring(0, cursorPosition) + before + selectedText + after + content.substring(cursorPosition)
		newPosition = cursorPosition + before.length
	} else {
		// 其他格式：包裹光标位置
		const selectedText = '' // 在小程序中无法获取选中文本
		newContent = content.substring(0, cursorPosition) + before + selectedText + after + content.substring(cursorPosition)
		newPosition = cursorPosition + before.length
	}

	formData.value.content = newContent

	// 在小程序中，焦点管理可能不太准确，但我们可以尝试
	// #ifndef MP-WEIXIN
	setTimeout(() => {
		// 尝试重新聚焦（仅在非小程序环境）
	}, 100)
	// #endif
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
			if (res.success && res.data) {
				formData.value = {
					title: res.data.title || '',
					type: res.data.type || '',
					tags: res.data.tags || [],
					content: res.data.content || '',
					attachments: res.data.attachments || []
				}
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
		// 新建模式：检查是否有草稿
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
.create-message-container {
	height: 100vh;
	background: #f5f5f5;
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
	color: #333333;
	margin-bottom: 20rpx;
	font-weight: 500;
}

.form-label-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.mode-switch {
	display: flex;
	background: #f0f0f0;
	border-radius: 8rpx;
	padding: 4rpx;
}

.mode-btn {
	padding: 8rpx 24rpx;
	font-size: 24rpx;
	color: #666666;
	border-radius: 6rpx;
	transition: all 0.3s;
	cursor: pointer;
}

.mode-btn.active {
	background: #ffffff;
	color: #667eea;
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
	color: #333333;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	box-sizing: border-box;
}

.picker-view {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 24rpx;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
}

.picker-text {
	font-size: 28rpx;
	color: #333333;
}

.picker-placeholder {
	font-size: 28rpx;
	color: #999999;
}

.picker-arrow {
	font-size: 20rpx;
	color: #999999;
}

.tags-container {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.tag-item {
	padding: 16rpx 32rpx;
	font-size: 28rpx;
	color: #666666;
	background: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	transition: all 0.3s;
}

.tag-item.active {
	color: #ffffff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-color: transparent;
}

.form-textarea {
	width: 100%;
	min-height: 300rpx;
	padding: 24rpx;
	font-size: 28rpx;
	color: #333333;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	box-sizing: border-box;
	line-height: 1.6;
}

.markdown-toolbar {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 20rpx;
	background: #fafafa;
	border: 2rpx solid #e0e0e0;
	border-bottom: none;
	border-radius: 8rpx 8rpx 0 0;
	margin-bottom: 0;
}

.toolbar-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 56rpx;
	height: 56rpx;
	padding: 0 16rpx;
	font-size: 28rpx;
	font-weight: 600;
	font-family: Arial, sans-serif;
	color: #666666;
	background: #ffffff;
	border: 2rpx solid #d9d9d9;
	border-radius: 6rpx;
	transition: all 0.2s;
	cursor: pointer;
}

.toolbar-btn:active {
	background: #667eea;
	color: #ffffff;
	border-color: #667eea;
	transform: scale(0.95);
}

.form-textarea {
	border-radius: 0 0 8rpx 8rpx;
}

.preview-container {
	min-height: 300rpx;
	padding: 24rpx;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	box-sizing: border-box;
}

.markdown-preview {
	font-size: 28rpx;
	color: #333333;
	line-height: 1.8;
	word-wrap: break-word;
	overflow-wrap: break-word;
}

/* Markdown渲染样式 */
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3 {
	margin: 30rpx 0 20rpx;
	font-weight: 600;
	line-height: 1.4;
}

.markdown-preview h1 {
	font-size: 48rpx;
	color: #1a1a1a;
	padding-bottom: 16rpx;
	border-bottom: 4rpx solid #e0e0e0;
}

.markdown-preview h2 {
	font-size: 40rpx;
	color: #2c2c2c;
}

.markdown-preview h3 {
	font-size: 34rpx;
	color: #3a3a3a;
}

.markdown-preview p {
	margin: 20rpx 0;
}

.markdown-preview strong {
	font-weight: 600;
	color: #1a1a1a;
}

.markdown-preview em {
	font-style: italic;
	color: #555555;
}

.markdown-preview code.inline-code {
	padding: 4rpx 12rpx;
	font-family: 'Courier New', Courier, monospace;
	font-size: 26rpx;
	color: #e74c3c;
	background: #f8f8f8;
	border: 1rpx solid #e0e0e0;
	border-radius: 4rpx;
}

.markdown-preview pre {
	margin: 24rpx 0;
	padding: 24rpx;
	background: #2d2d2d;
	border-radius: 8rpx;
	overflow-x: auto;
}

.markdown-preview pre code.code-block {
	display: block;
	font-family: 'Courier New', Courier, monospace;
	font-size: 24rpx;
	color: #f8f8f2;
	line-height: 1.6;
	white-space: pre-wrap;
	word-wrap: break-word;
}

.markdown-preview blockquote {
	margin: 20rpx 0;
	padding: 20rpx 24rpx;
	font-size: 28rpx;
	color: #666666;
	background: #f9f9f9;
	border-left: 8rpx solid #667eea;
	border-radius: 0 8rpx 8rpx 0;
}

.markdown-preview ul {
	margin: 20rpx 0;
	padding-left: 48rpx;
}

.markdown-preview li {
	margin: 12rpx 0;
	list-style-type: disc;
	line-height: 1.8;
}

.markdown-preview ul ul {
	margin: 12rpx 0;
}

.markdown-preview a.md-link {
	color: #667eea;
	text-decoration: underline;
}

.markdown-preview a.md-link:active {
	color: #764ba2;
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
</style>

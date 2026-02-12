<template>
	<view class="create-message-container">
		<scroll-view class="form-scroll" scroll-y>
			<view class="form-container">
				<!-- 快捷设置：策略类型和推送对象（优化为单行简洁布局） -->
				<view class="form-item quick-settings">
					<view class="quick-setting-row">
						<!-- 策略类型 -->
						<view class="quick-setting-item">
							<text class="quick-label">策略</text>
							<picker
								mode="selector"
								:range="strategyTypes"
								range-key="label"
								:value="strategyTypes.findIndex(s => s.value === formData.strategy)"
								@change="handleStrategyChange"
							>
								<view class="quick-picker">
									<text class="quick-value">{{ strategyTypes.find(s => s.value === formData.strategy)?.label }}</text>
									<text class="quick-arrow">▼</text>
								</view>
							</picker>
						</view>

						<!-- 推送对象（仅管理员可见） -->
						<view v-if="userStore.isAdmin" class="quick-setting-item">
							<text class="quick-label">推送</text>
							<picker
								mode="selector"
								:range="pushTargets"
								range-key="label"
								:value="pushTargets.findIndex(t => t.value === formData.pushTarget)"
								@change="handlePushTargetChange"
							>
								<view class="quick-picker">
									<text class="quick-value">{{ pushTargets.find(t => t.value === formData.pushTarget)?.label }}</text>
									<text class="quick-arrow">▼</text>
								</view>
							</picker>
						</view>
					</view>
				</view>

				<!-- 消息类型（单选下拉） -->
				<view class="form-item">
					<text class="form-label">消息类型</text>
					<picker
						mode="selector"
						:range="messageTypeOptions"
						range-key="label"
						:value="selectedMessageTypeIndex"
						@change="handleMessageTypeChange"
					>
						<view class="picker-view">
							<text class="picker-text" v-if="formData.messageType">{{ messageTypeOptions.find(t => t.value === formData.messageType)?.label }}</text>
							<text class="picker-placeholder" v-else>请选择消息类型</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
					<view class="form-hint">
						<text class="hint-text">选择消息类型（默认：早盘关注）</text>
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
							<text class="toolbar-btn" @click="insertMarkdown('## ', '')" title="标题">H</text>
							<text class="toolbar-btn" @click="insertMarkdown('- ', '')" title="列表">≡</text>
							<text class="toolbar-btn" @click="insertMarkdown('`', '`')" title="代码">&lt;/&gt;</text>
							<text class="toolbar-btn" @click="insertMarkdown('[', '](url)')" title="链接">🔗</text>
							<text class="toolbar-btn" @click="insertMarkdown('> ', '')" title="引用">"</text>
						</view>
						<textarea
							class="form-textarea markdown-editor"
							v-model="formData.content"
							placeholder="支持 Markdown 格式，支持粘贴图片"
							placeholder-style="color: #999999"
							:maxlength="5000"
							:show-confirm-bar="false"
							@paste="handlePaste"
							auto-height
						/>
						<view class="editor-footer">
							<text class="char-count">{{ formData.content.length }}/5000</text>
							<text class="hint-text-mini">💡 支持粘贴图片</text>
						</view>
					</view>

					<!-- 预览模式 -->
					<view v-else class="preview-container">
						<scroll-view class="preview-scroll" scroll-y>
							<view class="markdown-preview" v-html="renderedHtml"></view>
						</scroll-view>
						<view class="editor-footer">
							<text class="char-count">{{ formData.content.length }}/5000</text>
						</view>
					</view>
				</view>

				<!-- 附件上传 -->
				<view class="form-item attachment-item">
					<text class="form-label">附件（可选）</text>
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
						<view
							v-if="formData.attachments.length < 9"
							class="upload-btn"
							@click="handleUpload"
						>
							<text class="upload-icon">+</text>
							<text class="upload-text">上传图片</text>
						</view>
					</view>
					<view class="form-hint">
						<text class="hint-text">支持选择或粘贴图片，单次最多9张，每张不超过10MB</text>
					</view>
				</view>

				<!-- 底部占位，防止内容被按钮遮挡 -->
				<view class="bottom-spacer"></view>
			</view>
		</scroll-view>

		<!-- 固定底部按钮 -->
		<view class="fixed-bottom-bar">
			<button class="cancel-btn" @click="handleCancel">取消</button>
			<button class="submit-btn" :disabled="submitting" @click="handleSubmit">
				{{ submitting ? '发布中...' : '发布消息' }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useUserStore } from '../../store/user'
import { createMessageApi, updateMessageApi, getMessageDetailApi } from '../../api/message'
import { uploadImageApi } from '../../api/upload'
import { MESSAGE_TYPES, MESSAGE_TAGS, MESSAGE_TYPE_LABELS, MESSAGE_TAG_LABELS, USER_ROLES } from '../../utils/constants'
import { BASE_URL } from '../../utils/config'

const userStore = useUserStore()

// localStorage key
const DRAFT_KEY = 'message_draft'
const STRATEGY_KEY = 'last_selected_strategy'

// 预览模式
const previewMode = ref(false)

// 表单数据
const formData = ref({
	strategy: MESSAGE_TAGS.SHORT_TERM, // 策略类型（默认：短线策略）
	pushTarget: MESSAGE_TAGS.SHORT_TERM, // 推送对象（默认：短线用户）
	messageType: MESSAGE_TYPES.MORNING_FOCUS, // 消息类型（默认：早盘关注）
	title: '',
	content: '',
	attachments: []
})

const submitting = ref(false)
const editMode = ref(false)
const editMessageId = ref(0)
const draftTimer = ref(null)

// 策略类型选项
const strategyTypes = [
	{ label: '短线策略', value: MESSAGE_TAGS.SHORT_TERM },
	{ label: '中线策略', value: MESSAGE_TAGS.MID_TERM }
]

// 推送对象选项（仅管理员可见）
const pushTargets = [
	{ label: '短线VIP', value: MESSAGE_TAGS.SHORT_TERM },
	{ label: '中线VIP', value: MESSAGE_TAGS.MID_TERM },
	{ label: '全部用户', value: MESSAGE_TAGS.ALL_USERS }
]

// 消息类型选项（单选，10种标准类型）
const messageTypeOptions = [
	{ label: '盘前点评', value: MESSAGE_TYPES.PRE_MARKET_COMMENT },
	{ label: '早盘点评', value: MESSAGE_TYPES.MORNING_COMMENT },
	{ label: '早盘关注', value: MESSAGE_TYPES.MORNING_FOCUS },
	{ label: '尾盘点评', value: MESSAGE_TYPES.AFTERNOON_COMMENT },
	{ label: '尾盘关注', value: MESSAGE_TYPES.AFTERNOON_FOCUS },
	{ label: '收盘点评', value: MESSAGE_TYPES.CLOSE_COMMENT },
	{ label: '风险提示', value: MESSAGE_TYPES.RISK_WARNING },
	{ label: '系统消息', value: MESSAGE_TYPES.SYSTEM },
	{ label: '重要消息', value: MESSAGE_TYPES.IMPORTANT },
	{ label: '日常消息', value: MESSAGE_TYPES.DAILY }
]

// 当前选中的消息类型索引
const selectedMessageTypeIndex = computed(() => {
	return messageTypeOptions.findIndex(t => t.value === formData.value.messageType)
})

// 处理策略类型选择
const handleStrategyChange = (e) => {
	const index = e.detail.value
	const value = strategyTypes[index].value
	formData.value.strategy = value
	// 保存到localStorage
	uni.setStorageSync(STRATEGY_KEY, value)
	// 同时更新推送对象为默认值（短线策略对应短线VIP，中线策略对应中线VIP）
	if (value === MESSAGE_TAGS.SHORT_TERM && userStore.isAdmin) {
		formData.value.pushTarget = MESSAGE_TAGS.SHORT_TERM
	} else if (value === MESSAGE_TAGS.MID_TERM && userStore.isAdmin) {
		formData.value.pushTarget = MESSAGE_TAGS.MID_TERM
	}
}

// 处理推送对象选择
const handlePushTargetChange = (e) => {
	const index = e.detail.value
	const value = pushTargets[index].value
	formData.value.pushTarget = value
}

// 处理消息类型选择（单选）
const handleMessageTypeChange = (e) => {
	const index = e.detail.value
	formData.value.messageType = messageTypeOptions[index].value
}

// 处理粘贴事件
const handlePaste = (e) => {
	// #ifdef MP-WEIXIN
	// 微信小程序支持粘贴图片
	const clipboardData = e.detail || {}

	if (clipboardData.items && clipboardData.items.length > 0) {
		const items = clipboardData.items

		// 检查是否有图片
		let hasImage = false
		items.forEach((item) => {
			if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
				hasImage = true
				const file = item.getAsFile()

				if (file) {
					// 检查文件大小
					if (file.size > 10 * 1024 * 1024) {
						uni.showToast({
							title: '图片大小不能超过 10MB',
							icon: 'none'
						})
						return
					}

					// 检查图片数量限制
					if (formData.value.attachments.length >= 9) {
						uni.showToast({
							title: '最多只能上传9张图片',
							icon: 'none'
						})
						return
					}

					// 读取文件
					const reader = new FileReader()
					reader.onload = (event) => {
						const base64 = event.target.result

						// 转换为临时文件路径
						const fsm = uni.getFileSystemManager()
						const tempFilePath = `${wx.env.USER_DATA_PATH}/paste_${Date.now()}.jpg`

						fsm.writeFile({
							filePath: tempFilePath,
							data: base64.split(',')[1],
							encoding: 'base64',
							success: () => {
								formData.value.attachments.push({
									name: `粘贴图片_${formData.value.attachments.length + 1}.jpg`,
									path: tempFilePath,
									size: file.size
								})

								uni.showToast({
									title: '图片已添加',
									icon: 'success',
									duration: 1500
								})
							},
							fail: (err) => {
								console.error('保存粘贴图片失败:', err)
								uni.showToast({
									title: '图片保存失败',
									icon: 'none'
								})
							}
						})
					}
					reader.readAsDataURL(file)
				}
			}
		})

		if (hasImage) {
			// 如果有图片，阻止默认行为
			return false
		}
	}
	// #endif

	// 对于普通文本粘贴，不阻止默认行为
	return true
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

		// 将Vue的Proxy对象转换为纯JavaScript对象
		const data = {
			title: formData.value.title.trim(),
			type: formData.value.messageType || MESSAGE_TYPES.MORNING_FOCUS, // 使用选中的消息类型
			tags: tags,
			content: formData.value.content.trim(),
			attachments: uploadedAttachments
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
		// 同时更新推送对象
		if (lastStrategy === MESSAGE_TAGS.SHORT_TERM && userStore.isAdmin) {
			formData.value.pushTarget = MESSAGE_TAGS.SHORT_TERM
		} else if (lastStrategy === MESSAGE_TAGS.MID_TERM && userStore.isAdmin) {
			formData.value.pushTarget = MESSAGE_TAGS.MID_TERM
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

				formData.value = {
					strategy: strategyTag,
					pushTarget: pushTargetTag,
					messageType: messageType,
					title: res.data.title || '',
					content: res.data.content || '',
					attachments: processedAttachments
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
		// 新建模式：恢复上次选择的策略
		restoreLastStrategy()
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

// 快捷设置区域（优化后）
.quick-settings {
	background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
	padding: 32rpx;
	border-radius: 16rpx;
	border: 2rpx solid #667eea;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.15);
}

.quick-setting-row {
	display: flex;
	gap: 20rpx;
}

.quick-setting-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.quick-label {
	font-size: 26rpx;
	color: #667eea;
	font-weight: 500;
	margin-bottom: 4rpx;
}

.quick-picker {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 80rpx;
	padding: 0 24rpx;
	background: #ffffff;
	border: 2rpx solid #667eea;
	border-radius: 12rpx;
	transition: all 0.3s;
}

.quick-picker:active {
	background: #f0f0f0;
}

.quick-value {
	font-size: 30rpx;
	color: #333333;
	font-weight: 500;
}

.quick-arrow {
	font-size: 24rpx;
	color: #667eea;
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
	min-height: 400rpx;
	max-height: 800rpx;
	padding: 32rpx 28rpx;
	background-color: #ffffff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	box-sizing: border-box;
	overflow-y: auto;
}

.markdown-preview {
	font-size: 30rpx;
	color: #2c3e50;
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
	color: #1a1a1a;
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
}
</style>

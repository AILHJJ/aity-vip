# 统一API响应格式处理方案（P1优先级）

## 问题分析

在 `message-detail.vue` 文件中，发现不同操作的API响应格式检查不一致：

1. **loadMessageDetail** (行175): 检查 `res.success || res.code === 200`
2. **loadDiscussions** (行232): 只检查 `res.success`
3. **toggleFavorite** (行275): 检查 `res.success || res.code === 200`
4. **handleDelete** (行386): 检查 `result.success || result.code === 200`
5. **handleTogglePin** (行435): 只检查 `result.success`

这种不一致性导致：
- 代码维护困难
- 可能遗漏某些成功响应
- 错误处理不统一
- 代码可读性差

## 解决方案

### 1. 创建统一的响应处理工具函数

在文件顶部（script setup开始后，数据定义前）添加以下工具函数：

```javascript
// ============================================================================
// 统一API响应处理工具函数
// ============================================================================

/**
 * 检查API响应是否成功
 * 支持多种响应格式：
 * - { success: true, data: ... }
 * - { code: 200, data: ... }
 * - { success: true, code: 200, data: ... }
 * @param {Object} response - API响应对象
 * @returns {Boolean} - 是否成功
 */
const checkApiResponse = (response) => {
	if (!response) return false
	return response.success === true || response.code === 200 || response.code === '200'
}

/**
 * 获取响应消息
 * 优先级：message > msg > 默认消息
 * @param {Object} response - API响应对象
 * @param {String} defaultMsg - 默认消息
 * @returns {String} - 响应消息
 */
const getResponseMessage = (response, defaultMsg = '操作失败') => {
	if (!response) return defaultMsg
	return response.message || response.msg || defaultMsg
}

/**
 * 获取响应数据
 * 优先级：data > result > response本身
 * @param {Object} response - API响应对象
 * @returns {Any} - 响应数据
 */
const getResponseData = (response) => {
	if (!response) return null
	return response.data !== undefined ? response.data : (response.result !== undefined ? response.result : response)
}
```

### 2. 修改所有API调用位置

#### 2.1 修改 loadMessageDetail (行168-222)

**修改前：**
```javascript
const loadMessageDetail = async () => {
	loading.value = true

	try {
		const res = await getMessageDetailApi(messageId.value)

		// 兼容 success 和 code 两种格式
		if (res.success || res.code === 200) {
			const messageData = res.data
			// ... 处理逻辑
		} else {
			throw new Error(res.message || '加载失败')
		}
	} catch (error) {
		console.error('加载消息详情失败:', error)
		// ... 错误处理
	} finally {
		loading.value = false
	}
}
```

**修改后：**
```javascript
const loadMessageDetail = async () => {
	loading.value = true

	try {
		const res = await getMessageDetailApi(messageId.value)

		if (checkApiResponse(res)) {
			const messageData = getResponseData(res)

			// 处理附件数据：转换为images格式
			if (messageData.attachments && messageData.attachments.length > 0) {
				messageData.images = messageData.attachments
					.filter(att => att.type === 'image')
					.map(att => {
						// 如果是相对路径，补全服务器地址
						let url = att.url
						if (url.startsWith('/uploads/')) {
							url = 'https://aity88.online:8443' + url
						}
						return url
					})
			}

			message.value = messageData
			isFavorited.value = messageData.isFavorited || false

			// 标记为已读
			markMessageAsReadApi(messageId.value).catch(err => {
				console.warn('标记已读失败:', err)
				// 不影响用户体验，静默失败
			})

			// 加载相关讨论
			loadDiscussions()
		} else {
			throw new Error(getResponseMessage(res, '加载失败'))
		}
	} catch (error) {
		console.error('加载消息详情失败:', error)

		// 更友好的错误提示
		uni.showModal({
			title: '加载失败',
			content: error.message || '消息加载失败，请返回重试',
			showCancel: false,
			confirmText: '返回',
			success: () => {
				uni.navigateBack()
			}
		})
	} finally {
		loading.value = false
	}
}
```

#### 2.2 修改 loadDiscussions (行225-238)

**修改前：**
```javascript
const loadDiscussions = async () => {
	try {
		const res = await getDiscussionsApi({
			messageId: messageId.value,
			limit: 10
		})

		if (res.success) {
			discussions.value = res.data.discussions || []
		}
	} catch (error) {
		console.error('加载讨论失败:', error)
	}
}
```

**修改后：**
```javascript
const loadDiscussions = async () => {
	try {
		const res = await getDiscussionsApi({
			messageId: messageId.value,
			limit: 10
		})

		if (checkApiResponse(res)) {
			const data = getResponseData(res)
			discussions.value = data.discussions || []
		}
	} catch (error) {
		console.error('加载讨论失败:', error)
	}
}
```

#### 2.3 修改 toggleFavorite (行241-296)

**修改前：**
```javascript
const toggleFavorite = async () => {
	// 防止重复点击
	if (favoriteLoading.value) return

	// 登录检查
	if (!userStore.isLoggedIn) {
		uni.showModal({
			title: '提示',
			content: '请先登录',
			confirmText: '去登录',
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}
			}
		})
		return
	}

	favoriteLoading.value = true
	const oldValue = isFavorited.value
	isFavorited.value = !oldValue

	try {
		let res
		if (isFavorited.value) {
			res = await favoriteMessageApi(messageId.value)
		} else {
			res = await unfavoriteMessageApi(messageId.value)
		}

		// 兼容两种响应格式
		if (res.success || res.code === 200) {
			uni.showToast({
				title: isFavorited.value ? '已收藏' : '已取消收藏',
				icon: 'success',
				duration: 1500
			})
		} else {
			throw new Error(res.message || '操作失败')
		}
	} catch (error) {
		// 失败时回滚UI
		isFavorited.value = oldValue

		console.error('收藏操作失败:', error)
		uni.showToast({
			title: '操作失败，请稍后重试',
			icon: 'none'
		})
	} finally {
		favoriteLoading.value = false
	}
}
```

**修改后：**
```javascript
const toggleFavorite = async () => {
	// 防止重复点击
	if (favoriteLoading.value) return

	// 登录检查
	if (!userStore.isLoggedIn) {
		uni.showModal({
			title: '提示',
			content: '请先登录',
			confirmText: '去登录',
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}
			}
		})
		return
	}

	favoriteLoading.value = true
	const oldValue = isFavorited.value
	isFavorited.value = !oldValue

	try {
		let res
		if (isFavorited.value) {
			res = await favoriteMessageApi(messageId.value)
		} else {
			res = await unfavoriteMessageApi(messageId.value)
		}

		if (checkApiResponse(res)) {
			uni.showToast({
				title: isFavorited.value ? '已收藏' : '已取消收藏',
				icon: 'success',
				duration: 1500
			})
		} else {
			throw new Error(getResponseMessage(res, '操作失败'))
		}
	} catch (error) {
		// 失败时回滚UI
		isFavorited.value = oldValue

		console.error('收藏操作失败:', error)
		uni.showToast({
			title: getResponseMessage(error.response, '操作失败，请稍后重试'),
			icon: 'none'
		})
	} finally {
		favoriteLoading.value = false
	}
}
```

#### 2.4 修改 handleDelete (行371-426)

**修改前：**
```javascript
const handleDelete = () => {
	uni.showModal({
		title: '确认删除',
		content: '删除后无法恢复，是否继续？',
		confirmColor: '#ff5252',
		confirmText: '删除',
		cancelText: '取消',
		success: async (res) => {
			if (res.confirm) {
				uni.showLoading({ title: '删除中...', mask: true })

				try {
					const result = await deleteMessageApi(messageId.value)

					// 兼容两种响应格式
					if (result.success || result.code === 200) {
						uni.hideLoading()

						// 立即返回上一页，避免用户在等待时点击其他操作
						const pages = getCurrentPages()
						if (pages.length > 1) {
							// 通知列表页刷新
							const prevPage = pages[pages.length - 2]
							if (prevPage.$vm && prevPage.$vm.refreshList) {
								prevPage.$vm.refreshList()
							}
						}

						// 立即返回,不等待
						uni.navigateBack()

						// 返回后显示成功提示
						setTimeout(() => {
							uni.showToast({
								title: '删除成功',
								icon: 'success',
								duration: 1500
							})
						}, 100)
					} else {
						throw new Error(result.message || '删除失败')
					}
				} catch (error) {
					uni.hideLoading()
					console.error('删除消息失败:', error)

					uni.showToast({
						title: error.message || '删除失败，请稍后重试',
						icon: 'none',
						duration: 2000
					})
				}
			}
		}
	})
}
```

**修改后：**
```javascript
const handleDelete = () => {
	uni.showModal({
		title: '确认删除',
		content: '删除后无法恢复，是否继续？',
		confirmColor: '#ff5252',
		confirmText: '删除',
		cancelText: '取消',
		success: async (res) => {
			if (res.confirm) {
				uni.showLoading({ title: '删除中...', mask: true })

				try {
					const result = await deleteMessageApi(messageId.value)

					if (checkApiResponse(result)) {
						uni.hideLoading()

						// 立即返回上一页，避免用户在等待时点击其他操作
						const pages = getCurrentPages()
						if (pages.length > 1) {
							// 通知列表页刷新
							const prevPage = pages[pages.length - 2]
							if (prevPage.$vm && prevPage.$vm.refreshList) {
								prevPage.$vm.refreshList()
							}
						}

						// 立即返回,不等待
						uni.navigateBack()

						// 返回后显示成功提示
						setTimeout(() => {
							uni.showToast({
								title: '删除成功',
								icon: 'success',
								duration: 1500
							})
						}, 100)
					} else {
						throw new Error(getResponseMessage(result, '删除失败'))
					}
				} catch (error) {
					uni.hideLoading()
					console.error('删除消息失败:', error)

					uni.showToast({
						title: getResponseMessage(error.response, '删除失败，请稍后重试'),
						icon: 'none',
						duration: 2000
					})
				}
			}
		}
	})
}
```

#### 2.5 修改 handleTogglePin (行429-455)

**修改前：**
```javascript
const handleTogglePin = async () => {
	try {
		const api = message.value.isPinned ? unpinMessageApi : pinMessageApi
		const action = message.value.isPinned ? '取消置顶' : '置顶'

		const result = await api(messageId.value)
		if (result.success) {
			// 更新本地状态
			message.value.isPinned = !message.value.isPinned
			uni.showToast({
				title: `${action}成功`,
				icon: 'success'
			})
		} else {
			uni.showToast({
				title: result.message || `${action}失败`,
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('切换置顶失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}
```

**修改后：**
```javascript
const handleTogglePin = async () => {
	try {
		const api = message.value.isPinned ? unpinMessageApi : pinMessageApi
		const action = message.value.isPinned ? '取消置顶' : '置顶'

		const result = await api(messageId.value)
		if (checkApiResponse(result)) {
			// 更新本地状态
			message.value.isPinned = !message.value.isPinned
			uni.showToast({
				title: `${action}成功`,
				icon: 'success'
			})
		} else {
			throw new Error(getResponseMessage(result, `${action}失败`))
		}
	} catch (error) {
		console.error('切换置顶失败:', error)
		uni.showToast({
			title: getResponseMessage(error.response, '操作失败'),
			icon: 'none'
		})
	}
}
```

## 修改总结

### 创建的工具函数

1. **checkApiResponse(response)** - 检查API响应是否成功
   - 支持 `success: true`
   - 支持 `code: 200`
   - 支持 `code: '200'`

2. **getResponseMessage(response, defaultMsg)** - 获取响应消息
   - 优先获取 `response.message`
   - 其次获取 `response.msg`
   - 最后使用默认消息

3. **getResponseData(response)** - 获取响应数据
   - 优先获取 `response.data`
   - 其次获取 `response.result`
   - 最后返回response本身

### 修改的API调用位置

| 函数名 | 行号 | 修改内容 |
|--------|------|----------|
| loadMessageDetail | 168-222 | 使用 checkApiResponse 和 getResponseData |
| loadDiscussions | 225-238 | 使用 checkApiResponse 和 getResponseData |
| toggleFavorite | 241-296 | 使用 checkApiResponse 和 getResponseMessage |
| handleDelete | 371-426 | 使用 checkApiResponse 和 getResponseMessage |
| handleTogglePin | 429-455 | 使用 checkApiResponse 和 getResponseMessage |

### 优势

1. **统一性**：所有API调用使用相同的响应检查逻辑
2. **可维护性**：修改响应格式只需更新工具函数
3. **健壮性**：支持多种响应格式，降低错误率
4. **可读性**：代码更简洁，意图更明确
5. **可扩展性**：未来可以轻松添加更多响应格式支持

### 兼容性说明

这些工具函数支持以下所有响应格式：

```javascript
// 格式1
{ success: true, data: {...}, message: '成功' }

// 格式2
{ code: 200, data: {...}, message: '成功' }

// 格式3
{ success: true, code: 200, data: {...}, message: '成功' }

// 格式4
{ success: true, result: {...}, msg: '成功' }

// 格式5
{ code: '200', data: {...} }
```

## 实施建议

1. 将这些工具函数提取到独立的工具文件中（如 `src/utils/apiResponse.js`）
2. 在其他页面和组件中也使用这些工具函数
3. 考虑在项目级别统一API响应格式
4. 添加单元测试确保工具函数的正确性

## 下一步优化

1. 在全局层面统一后端API响应格式
2. 在API请求拦截器中统一处理响应格式
3. 添加响应日志记录，便于调试
4. 考虑使用TypeScript增强类型安全

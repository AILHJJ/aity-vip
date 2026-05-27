# 统一API响应格式处理 - 完整实施代码

## 文件信息

**目标文件**: `D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\src\pages\message-detail\message-detail.vue`

**实施日期**: 2026-02-06

## 修改说明

由于文件被外部工具（可能是格式化工具或Linter）回滚，以下是完整的修改代码，可以手动应用或使用Edit工具逐个应用。

## 步骤1: 添加工具函数

在 `<script setup>` 部分，在 `const userStore = useUserStore()` 之后，添加以下工具函数：

```javascript
const userStore = useUserStore()

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

// ============================================================================
// 数据定义
// ============================================================================
```

## 步骤2: 修改 loadMessageDetail 函数

找到 `loadMessageDetail` 函数（大约在第188-243行），替换为：

```javascript
// 加载消息详情
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
							url = BASE_URL + url
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

**关键变化**:
- `if (res.success || res.code === 200)` → `if (checkApiResponse(res))`
- `const messageData = res.data` → `const messageData = getResponseData(res)`
- `throw new Error(res.message || '加载失败')` → `throw new Error(getResponseMessage(res, '加载失败'))`

## 步骤3: 修改 loadDiscussions 函数

找到 `loadDiscussions` 函数（大约在第245-259行），替换为：

```javascript
// 加载相关讨论
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

**关键变化**:
- `if (res.success)` → `if (checkApiResponse(res))`
- `res.data.discussions` → 先 `const data = getResponseData(res)` 然后 `data.discussions`

## 步骤4: 修改 toggleFavorite 函数

找到 `toggleFavorite` 函数中的API响应处理部分（大约在第287-317行），找到以下代码段：

```javascript
// 原代码
if (res.success || res.code === 200) {
	uni.showToast({
		title: isFavorited.value ? '已收藏' : '已取消收藏',
		icon: 'success',
		duration: 1500
	})
} else {
	throw new Error(res.message || '操作失败')
}
```

替换为：

```javascript
// 新代码
if (checkApiResponse(res)) {
	uni.showToast({
		title: isFavorited.value ? '已收藏' : '已取消收藏',
		icon: 'success',
		duration: 1500
	})
} else {
	throw new Error(getResponseMessage(res, '操作失败'))
}
```

然后在错误处理部分找到：

```javascript
// 原代码
console.error('收藏操作失败:', error)
uni.showToast({
	title: '操作失败，请稍后重试',
	icon: 'none'
})
```

替换为：

```javascript
// 新代码
console.error('收藏操作失败:', error)
uni.showToast({
	title: getResponseMessage(error.response, '操作失败，请稍后重试'),
	icon: 'none'
})
```

## 步骤5: 修改 handleDelete 函数

找到 `handleDelete` 函数中的API响应处理部分（大约在第422-451行），找到以下代码段：

```javascript
// 原代码
if (result.success || result.code === 200) {
	// ... 成功处理逻辑
} else {
	throw new Error(result.message || '删除失败')
}
```

替换为：

```javascript
// 新代码
if (checkApiResponse(result)) {
	// ... 成功处理逻辑
} else {
	throw new Error(getResponseMessage(result, '删除失败'))
}
```

然后在错误处理部分找到：

```javascript
// 原代码
uni.showToast({
	title: error.message || '删除失败，请稍后重试',
	icon: 'none',
	duration: 2000
})
```

替换为：

```javascript
// 新代码
uni.showToast({
	title: getResponseMessage(error.response, '删除失败，请稍后重试'),
	icon: 'none',
	duration: 2000
})
```

## 步骤6: 修改 handleTogglePin 函数

找到 `handleTogglePin` 函数中的API响应处理部分（大约在第478-491行），找到以下代码段：

```javascript
// 原代码
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
```

替换为：

```javascript
// 新代码
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
```

然后在错误处理部分找到：

```javascript
// 原代码
console.error('切换置顶失败:', error)
uni.showToast({
	title: '操作失败',
	icon: 'none'
})
```

替换为：

```javascript
// 新代码
console.error('切换置顶失败:', error)
uni.showToast({
	title: getResponseMessage(error.response, '操作失败'),
	icon: 'none'
})
```

## 修改总结表

| 函数名 | 修改位置 | 主要变化 |
|--------|----------|----------|
| loadMessageDetail | 行188-243 | 使用统一工具函数检查响应和获取数据 |
| loadDiscussions | 行245-259 | 使用统一工具函数检查响应和获取数据 |
| toggleFavorite | 行305-360 | 使用统一工具函数，增强错误处理 |
| handleDelete | 行452-507 | 使用统一工具函数，增强错误处理 |
| handleTogglePin | 行509-540 | 使用统一工具函数，增强错误处理 |

## 验证方法

修改完成后，检查以下内容：

1. **工具函数存在性**
   - 搜索 `checkApiResponse`，应找到定义和5处使用
   - 搜索 `getResponseMessage`，应找到定义和5处使用
   - 搜索 `getResponseData`，应找到定义和2处使用

2. **代码一致性**
   - 所有API调用都使用 `checkApiResponse()` 检查响应
   - 所有数据提取都使用 `getResponseData()`
   - 所有错误消息都使用 `getResponseMessage()`

3. **测试场景**
   - 加载消息详情（成功/失败）
   - 收藏/取消收藏（成功/失败）
   - 删除消息（成功/失败）
   - 置顶/取消置顶（成功/失败）
   - 加载讨论列表（成功/失败）

## 回滚方法

如果需要回滚，使用备份文件：

```bash
cp "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\src\pages\message-detail\message-detail.vue.backup" \
   "D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\src\pages\message-detail\message-detail.vue"
```

## 优势

实施这些修改后，将获得以下优势：

1. **统一性**: 所有API调用使用相同的响应处理逻辑
2. **可维护性**: 修改响应格式只需更新工具函数
3. **健壮性**: 支持多种响应格式，降低错误率
4. **可读性**: 代码更简洁，意图更明确
5. **可扩展性**: 可以轻松添加更多响应格式支持

## 下一步建议

1. 将这些工具函数提取到独立文件 `src/utils/apiResponse.js`
2. 在项目中其他页面也使用这些工具函数
3. 考虑在全局API拦截器中统一处理响应格式
4. 添加单元测试确保工具函数的正确性

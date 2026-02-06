/**
 * Markdown渲染器 - 增强版
 * 参考问小达3.0版本实现优化
 */

/**
 * 数据格式化工具集 - 用于金融数据展示
 */
export const DataFormatter = {
	/**
	 * 格式化涨跌幅数据（添加颜色）
	 * @param {string|number} value 数值
	 * @param {number} compareValue 比较基准（可选）
	 * @param {string} unit 单位（如%）
	 * @returns {string} HTML字符串
	 */
	formatChange(value, compareValue = null, unit = '') {
		const num = parseFloat(value)
		if (isNaN(num)) return `<span class="text-neutral">${value}</span>`

		const compareNum = compareValue !== null ? parseFloat(compareValue) : num

		let colorClass = 'text-neutral'
		if (compareNum > 0) colorClass = 'text-up'
		else if (compareNum < 0) colorClass = 'text-down'

		const formattedValue = num.toFixed(2)
		return `<span class="${colorClass}">${formattedValue}${unit}</span>`
	},

	/**
	 * 格式化大数字（万、亿）
	 * @param {number} value 数值
	 * @param {number} precision 精度
	 * @returns {string} 格式化后的字符串
	 */
	formatBigNumber(value, precision = 2) {
		const num = parseFloat(value)
		if (isNaN(num)) return '--'

		const absNum = Math.abs(num)

		if (absNum >= 100000000) {
			return (num / 100000000).toFixed(precision) + '亿'
		} else if (absNum >= 10000) {
			return (num / 10000).toFixed(precision) + '万'
		}

		return num.toFixed(precision)
	},

	/**
	 * 格式化百分比
	 * @param {number} value 数值
	 * @param {number} precision 精度
	 * @returns {string} 格式化后的字符串
	 */
	formatPercent(value, precision = 2) {
		const num = parseFloat(value)
		if (isNaN(num)) return '--'

		const colorClass = num > 0 ? 'text-up' : num < 0 ? 'text-down' : 'text-neutral'
		const formattedValue = num.toFixed(precision)

		return `<span class="${colorClass}">${formattedValue}%</span>`
	},

	/**
	 * 格式化日期
	 * @param {string} dateStr 日期字符串
	 * @param {string} format 格式（1=YYYY-MM-DD, 2=MM-DD, 3=YYYY）
	 * @returns {string} 格式化后的日期
	 */
	formatDate(dateStr, format = 1) {
		if (!dateStr) return '--'

		// 处理YYYYMMDD格式
		if (dateStr.length === 8 && /^\d+$/.test(dateStr)) {
			const year = dateStr.substring(0, 4)
			const month = dateStr.substring(4, 6)
			const day = dateStr.substring(6, 8)

			if (format === 1) return `${year}-${month}-${day}`
			if (format === 2) return `${month}-${day}`
			if (format === 3) return year
		}

		// 已经包含分隔符
		if (dateStr.includes('-')) {
			const parts = dateStr.split('-')
			if (parts.length === 3) {
				const [year, month, day] = parts
				if (format === 1) return `${year}-${month}-${day}`
				if (format === 2) return `${month}-${day}`
				if (format === 3) return year
			}
		}

		return dateStr
	}
}

/**
 * Markdown渲染器类
 */
export class MarkdownRenderer {
	/**
	 * 渲染Markdown为HTML
	 * @param {string} content Markdown内容
	 * @returns {string} HTML内容
	 */
	static render(content) {
		if (!content) return ''

		// 过滤替换串
		content = content.replace(/@@.+?@@/g, '')

		// 转义HTML（但保留我们需要的标签）
		let html = this._escapeHtml(content)

		// 按顺序处理各种Markdown语法
		html = this._processCodeBlocks(html)
		html = this._processInlineCode(html)
		html = this._processHeadings(html)
		html = this._processBoldAndItalic(html)
		html = this._processStrikethrough(html)
		html = this._processTables(html)
		html = this._processLists(html)
		html = this._processBlockquotes(html)
		html = this._processLinks(html)
		html = this._processImages(html)
		html = this._processHorizontalRules(html)
		html = this._processLineBreaks(html)

		// 修复特定标签内的换行
		html = this._fixBreaksInSpecialTags(html)

		return html
	}

	/**
	 * 转义HTML特殊字符（但保留基本结构）
	 * @private
	 */
	static _escapeHtml(content) {
		return content
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
	}

	/**
	 * 处理代码块
	 * @private
	 */
	static _processCodeBlocks(html) {
		// 支持语言标识 ```language
		return html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
			const language = lang || ''
			const trimmedCode = code.trim()
			return `<pre class="code-block" data-language="${language}"><code class="language-${language}">${trimmedCode}</code></pre>\n`
		})
	}

	/**
	 * 处理行内代码
	 * @private
	 */
	static _processInlineCode(html) {
		return html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
	}

	/**
	 * 处理标题
	 * @private
	 */
	static _processHeadings(html) {
		html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
		html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
		html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
		html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
		html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
		html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
		return html
	}

	/**
	 * 处理粗体和斜体
	 * @private
	 */
	static _processBoldAndItalic(html) {
		// 粗体 **text** 或 __text__
		html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
		html = html.replace(/__([^_\n]+)__/g, '<strong>$1</strong>')

		// 斜体 *text* 或 _text_
		html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
		html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>')

		return html
	}

	/**
	 * 处理删除线
	 * @private
	 */
	static _processStrikethrough(html) {
		return html.replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
	}

	/**
	 * 处理表格
	 * @private
	 */
	static _processTables(html) {
		const lines = html.split('\n')
		let inTable = false
		let tableRows = []
		let headerProcessed = false
		const processedLines = []

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim()

			// 检测表格行
			if (line.startsWith('|') && line.endsWith('|')) {
				const cells = line.substring(1, line.length - 1)
					.split('|')
					.map(cell => cell.trim())

				// 检查是否是分隔行
				const isSeparator = cells.some(cell =>
					/^-+:?$|^:-+:?$|^:-+$/.test(cell)
				)

				if (!isSeparator) {
					if (!inTable) {
						inTable = true
						tableRows = []
						headerProcessed = false
					}

					const isHeader = !headerProcessed
					if (isHeader) {
						headerProcessed = true
					}

					const tag = isHeader ? 'th' : 'td'
					const rowHtml = cells.map(cell => `<${tag}>${cell}</${tag}>`).join('')
					tableRows.push(`<tr>${rowHtml}</tr>`)
				}
				continue
			}

			// 输出表格
			if (inTable) {
				if (tableRows.length > 0) {
					const tableHtml = `<table class="markdown-table">${tableRows.join('')}</table>`
					processedLines.push(tableHtml)
				}
				inTable = false
				tableRows = []
				headerProcessed = false
			}

			processedLines.push(line)
		}

		// 处理最后的表格
		if (inTable && tableRows.length > 0) {
			const tableHtml = `<table class="markdown-table">${tableRows.join('')}</table>`
			processedLines.push(tableHtml)
		}

		return processedLines.join('\n')
	}

	/**
	 * 处理列表
	 * @private
	 */
	static _processLists(html) {
		// 无序列表
		html = html.replace(/^[\s]*[-*]\s+(.+)$/gm, '<li class="list-item">$1</li>')

		// 合并连续的li为ul
		html = html.replace(/(<li class="list-item">.*<\/li>\n?)+/g, (match) => {
			return `<ul class="list-unstyled">${match}</ul>`
		})

		// 有序列表
		html = html.replace(/^[\s]*(\d+)\.\s+(.+)$/gm, '<li class="list-item-ordered" value="$1">$2</li>')

		// 合并连续的有序列表
		html = html.replace(/(<li class="list-item-ordered".*<\/li>\n?)+/g, (match) => {
			return `<ol class="list-ordered">${match}</ol>`
		})

		return html
	}

	/**
	 * 处理引用
	 * @private
	 */
	static _processBlockquotes(html) {
		return html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
	}

	/**
	 * 处理链接
	 * @private
	 */
	static _processLinks(html) {
		return html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" class="link" target="_blank">$1</a>')
	}

	/**
	 * 处理图片
	 * @private
	 */
	static _processImages(html) {
		return html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
			'<img src="$2" alt="$1" class="markdown-image">')
	}

	/**
	 * 处理水平分割线
	 * @private
	 */
	static _processHorizontalRules(html) {
		return html.replace(/^[-*]{3,}$/gm, '<hr class="divider">')
	}

	/**
	 * 处理换行
	 * @private
	 */
	static _processLineBreaks(html) {
		return html.replace(/\n/g, '<br>')
	}

	/**
	 * 修复特定标签内的换行符
	 * @private
	 */
	static _fixBreaksInSpecialTags(html) {
		// 修复pre标签
		html = html.replace(/<pre(?:\s[^>]*)?>(.*?)<\/pre>/gis, (match, content) => {
			return `<pre>${content.replace(/<br>/g, '\n')}</pre>`
		})

		// 修复table标签
		html = html.replace(/<table(?:\s[^>]*)?>(.*?)<\/table>/gis, (match, content) => {
			return `<table>${content.replace(/<br>/g, '')}</table>`
		})

		// 修复ul和ol标签
		html = html.replace(/<(ul|ol)([^>]*)>(.*?)<\/\1>/gis, (match, tag, attrs, content) => {
			return `<${tag}${attrs}>${content.replace(/<\/li><br>/g, '</li>')}</${tag}>`
		})

		return html
	}
}

/**
 * 金融表格解析器
 */
export class FinancialTableParser {
	/**
	 * 解析金融选股工具返回的JSON表格数据
	 * @param {string} content JSON字符串
	 * @returns {object|null} 解析后的表格数据
	 */
	static parse(content) {
		try {
			const data = JSON.parse(content)

			if (!Array.isArray(data) || data.length === 0) {
				return null
			}

			let headers = []
			let rows = []
			let total = 0

			// 提取总数（最后一行）
			if (data.length > 1) {
				const lastRow = data[data.length - 1]
				if (Array.isArray(lastRow) && lastRow.length >= 2) {
					total = parseInt(lastRow[1]) || 0
				}
			}

			// 解析表头和数据行（最多7行）
			const endIndex = data.length > 7 ? 7 : data.length - 1
			const tableData = data.slice(0, endIndex)

			tableData.forEach((row, index) => {
				if (index === 0) {
					// 第一行是表头
					headers = row.map(cell => {
						if (typeof cell === 'string') {
							// 移除HTML标签和日期
							return cell.replace(/<br>.*$/, '').trim()
						}
						return String(cell).trim()
					})
				} else {
					// 数据行
					rows.push(row)
				}
			})

			return { headers, rows, total }
		} catch (e) {
			return null
		}
	}

	/**
	 * 渲染金融表格HTML
	 * @param {object} tableData 表格数据
	 * @returns {string} HTML字符串
	 */
	static render(tableData) {
		if (!tableData || !tableData.headers || !tableData.rows) {
			return ''
		}

		const { headers, rows, total } = tableData

		let html = '<div class="financial-table-container">'

		// 总数提示
		if (total > 0) {
			html += `<div class="table-info">共找到 ${total} 条结果，显示前 ${rows.length} 条</div>`
		}

		html += '<table class="financial-table">'

		// 表头
		html += '<thead><tr>'
		headers.forEach(header => {
			html += `<th>${header}</th>`
		})
		html += '</tr></thead>'

		// 数据行
		html += '<tbody>'
		rows.forEach(row => {
			html += '<tr>'
			row.forEach((cell, index) => {
				// 判断是否需要特殊格式化
				const formattedCell = this._formatCell(cell, headers[index])
				html += `<td>${formattedCell}</td>`
			})
			html += '</tr>'
		})
		html += '</tbody>'

		html += '</table></div>'

		return html
	}

	/**
	 * 格式化单元格数据
	 * @private
	 */
	static _formatCell(cell, header) {
		// 检查是否是涨跌幅列
		if (header && (header.includes('涨跌幅') || header.includes('涨幅'))) {
			return DataFormatter.formatChange(cell, null, '%')
		}

		// 检查是否是价格列
		if (header && (header.includes('现价') || header.includes('价格'))) {
			const num = parseFloat(cell)
			if (!isNaN(num)) {
				return num.toFixed(2)
			}
		}

		// 检查是否是大数值列
		if (header && (header.includes('成交额') || header.includes('市值') || header.includes('资金'))) {
			return DataFormatter.formatBigNumber(cell)
		}

		return cell
	}
}

/**
 * 打字机效果工具类 - 用于流式输出
 */
export class TypewriterEffect {
	/**
	 * 启动打字机效果
	 * @param {object} options 配置选项
	 */
	static start(options) {
		const {
			fullText = '',
			id = '',
			speed = 20,
			currentState = null,
			onUpdate = null,
			onComplete = null
		} = options

		// 初始化状态
		let state = currentState || {
			displayedText: '',
			currentIndex: 0
		}

		// 如果已经完成，直接调用完成回调
		if (state.currentIndex >= fullText.length) {
			if (onComplete) onComplete(id)
			return
		}

		const processNext = () => {
			if (state.currentIndex < fullText.length) {
				// 检查是否是HTML标签的开始
				const nextChar = fullText.charAt(state.currentIndex)

				if (nextChar === '<') {
					// 找到标签的结束位置
					const tagEndIndex = fullText.indexOf('>', state.currentIndex)
					if (tagEndIndex !== -1) {
						// 一次性添加整个标签
						const tag = fullText.substring(state.currentIndex, tagEndIndex + 1)
						state.displayedText += tag
						state.currentIndex = tagEndIndex + 1
					} else {
						// 如果没有找到结束标签，按单个字符处理
						state.displayedText += nextChar
						state.currentIndex++
					}
				} else {
					// 普通字符逐个添加
					state.displayedText += nextChar
					state.currentIndex++
				}

				// 调用更新回调
				if (onUpdate) onUpdate(id, state)

				// 继续下一个字符
				setTimeout(processNext, speed)
			} else {
				// 完成回调
				if (onComplete) onComplete(id)
			}
		}

		// 开始处理
		processNext()

		// 返回当前状态
		return state
	}
}

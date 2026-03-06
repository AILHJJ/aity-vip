/**
 * 股票标记功能测试脚本
 * 测试股票标签解析和展示功能
 */

// 测试数据
const testCases = [
	{
		name: '标准股票标签',
		content: '今天$贵州茅台(SH600519)$大涨',
		expected: [
			{ name: '贵州茅台', code: 'SH600519' }
		]
	},
	{
		name: '多个股票标签',
		content: '$平安银行(SZ000001)$和$东方财富(SZ300059)$都涨了',
		expected: [
			{ name: '平安银行', code: 'SZ000001' },
			{ name: '东方财富', code: 'SZ300059' }
		]
	},
	{
		name: '混合格式（新+旧）',
		content: '$宁德时代(SZ300750)$推荐关注600036',
		expected: [
			{ name: '宁德时代', code: 'SZ300750' },
			{ name: '沪市股票', code: '600036' }
		]
	},
	{
		name: '纯数字格式（兼容旧版）',
		content: '看好000001和600519',
		expected: [
			{ name: '深市股票', code: '000001' },
			{ name: '沪市股票', code: '600519' }
		]
	}
]

// 股票标签解析函数（从message-detail.vue复制）
function parseStockTags(text) {
	if (!text) return []
	const stockTagRegex = /\$([^\(]+)\(([A-Z]{2}\d{6})\)\$/g
	const stocks = []
	let match

	while ((match = stockTagRegex.exec(text)) !== null) {
		stocks.push({
			name: match[1].trim(),
			code: match[2],
			fullTag: match[0]
		})
	}

	// 同时保留原有的6位数字股票代码提取（兼容旧格式）
	const stockCodeRegex = /(?<![A-Z(])([0-9]{6})(?![)0-9])/g
	let codeMatch
	while ((codeMatch = stockCodeRegex.exec(text)) !== null) {
		// 避免重复添加
		if (!stocks.find(s => s.code === codeMatch[1])) {
			stocks.push({
				name: getCodeName(codeMatch[1]),
				code: codeMatch[1],
				fullTag: codeMatch[1]
			})
		}
	}

	return stocks
}

function getCodeName(code) {
	const codeStr = String(code)
	if (codeStr.startsWith('6')) {
		return '沪市股票'
	} else if (codeStr.startsWith('0')) {
		return '深市股票'
	} else if (codeStr.startsWith('3')) {
		return '创业板'
	} else if (codeStr.startsWith('688')) {
		return '科创板'
	}
	return '股票'
}

// 运行测试
console.log('🧪 开始测试股票标记功能\n')
console.log('=' .repeat(60))

let passedCount = 0
let failedCount = 0

testCases.forEach((testCase, index) => {
	console.log(`\n测试 ${index + 1}: ${testCase.name}`)
	console.log('-'.repeat(60))
	console.log(`输入内容: ${testCase.content}`)

	const result = parseStockTags(testCase.content)
	console.log(`解析结果:`, result)

	const isPassed = result.length === testCase.expected.length &&
		result.every((stock, i) => {
			const expected = testCase.expected[i]
			return stock.name === expected.name && stock.code === expected.code
		})

	if (isPassed) {
		console.log('✅ 通过')
		passedCount++
	} else {
		console.log('❌ 失败')
		console.log(`预期:`, testCase.expected)
		failedCount++
	}
})

console.log('\n' + '='.repeat(60))
console.log(`\n测试结果: ${passedCount} 通过, ${failedCount} 失败`)

if (failedCount === 0) {
	console.log('🎉 所有测试通过！')
} else {
	console.log('⚠️  部分测试失败，请检查实现')
}

// 测试市场代码判断
console.log('\n' + '='.repeat(60))
console.log('\n📊 测试市场代码判断\n')

const marketTests = [
	{ code: '600519', expected: '上海交易所' },
	{ code: '000001', expected: '深圳交易所' },
	{ code: '300059', expected: '深圳交易所' },
	{ code: '688001', expected: '上海交易所' }
]

marketTests.forEach(test => {
	const setcode = getMarketCode(test.code)
	const market = setcode === 1 ? '上海交易所' : setcode === 0 ? '深圳交易所' : '北京交易所'
	const isCorrect = market === test.expected
	console.log(`${test.code}: ${market} ${isCorrect ? '✅' : '❌'}`)
})

function getMarketCode(stockCode) {
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

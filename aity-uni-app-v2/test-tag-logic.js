/**
 * 消息标签逻辑测试脚本
 * 用于验证 getDisplayTags 函数的逻辑是否正确
 */

// 模拟常量
const MESSAGE_TAGS = {
  SHORT_TERM: 'short_term',
  MID_TERM: 'mid_term',
  ALL_USERS: 'all_users'
}

const MESSAGE_TAG_LABELS = {
  [MESSAGE_TAGS.SHORT_TERM]: '短线策略',
  [MESSAGE_TAGS.MID_TERM]: '中线策略',
  [MESSAGE_TAGS.ALL_USERS]: '全部用户'
}

// 模拟 getDisplayTags 函数
function getDisplayTags(tags, isAdmin) {
  if (!tags || !Array.isArray(tags)) {
    return []
  }

  const displayTags = []
  const hasShortTerm = tags.includes(MESSAGE_TAGS.SHORT_TERM)
  const hasMidTerm = tags.includes(MESSAGE_TAGS.MID_TERM)

  // VIP用户：只显示策略标签（短线/中线），不显示推送对象标签
  if (!isAdmin) {
    // 如果同时有短线和中线标签，显示为"短线+中线"
    if (hasShortTerm && hasMidTerm) {
      displayTags.push({
        key: 'combined',
        label: '短线+中线',
        icon: '⚡📈',
        class: 'tag-short-term tag-mid-term tag-combined'
      })
    } else if (hasShortTerm) {
      displayTags.push({
        key: MESSAGE_TAGS.SHORT_TERM,
        label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM],
        icon: '⚡',
        class: 'tag-short-term'
      })
    } else if (hasMidTerm) {
      displayTags.push({
        key: MESSAGE_TAGS.MID_TERM,
        label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM],
        icon: '📈',
        class: 'tag-mid-term'
      })
    }
  } else {
    // 管理员：显示所有标签（除了all_users）
    for (const tag of tags) {
      // 跳过 all_users 标签
      if (tag === MESSAGE_TAGS.ALL_USERS) {
        continue
      }

      // 处理策略标签
      if (tag === MESSAGE_TAGS.SHORT_TERM) {
        displayTags.push({
          key: MESSAGE_TAGS.SHORT_TERM,
          label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.SHORT_TERM],
          icon: '⚡',
          class: 'tag-short-term'
        })
      } else if (tag === MESSAGE_TAGS.MID_TERM) {
        displayTags.push({
          key: MESSAGE_TAGS.MID_TERM,
          label: MESSAGE_TAG_LABELS[MESSAGE_TAGS.MID_TERM],
          icon: '📈',
          class: 'tag-mid-term'
        })
      }
    }
  }

  return displayTags
}

// 测试用例
console.log('=== 消息标签逻辑测试 ===\n')

// 测试用例1：VIP短线用户 - 只有短线标签
console.log('测试1: VIP短线用户 - 只有短线标签')
const result1 = getDisplayTags(['short_term'], false)
console.log('输入: ["short_term"]')
console.log('输出:', result1)
console.log('预期: 1个标签 - "短线策略"')
console.log('✅ 通过:', result1.length === 1 && result1[0].label === '短线策略')
console.log('')

// 测试用例2：VIP短线用户 - 短线+全部用户
console.log('测试2: VIP短线用户 - 短线+全部用户')
const result2 = getDisplayTags(['short_term', 'all_users'], false)
console.log('输入: ["short_term", "all_users"]')
console.log('输出:', result2)
console.log('预期: 1个标签 - "短线策略"（不显示全部用户）')
console.log('✅ 通过:', result2.length === 1 && result2[0].label === '短线策略' && !result2.find(t => t.label === '全部用户'))
console.log('')

// 测试用例3：VIP中线用户 - 只有中线标签
console.log('测试3: VIP中线用户 - 只有中线标签')
const result3 = getDisplayTags(['mid_term'], false)
console.log('输入: ["mid_term"]')
console.log('输出:', result3)
console.log('预期: 1个标签 - "中线策略"')
console.log('✅ 通过:', result3.length === 1 && result3[0].label === '中线策略')
console.log('')

// 测试用例4：VIP用户 - 短线+中线组合
console.log('测试4: VIP用户 - 短线+中线组合')
const result4 = getDisplayTags(['short_term', 'mid_term'], false)
console.log('输入: ["short_term", "mid_term"]')
console.log('输出:', result4)
console.log('预期: 1个标签 - "短线+中线"（组合标签）')
console.log('✅ 通过:', result4.length === 1 && result4[0].label === '短线+中线' && result4[0].key === 'combined')
console.log('')

// 测试用例5：VIP用户 - 短线+中线+全部用户
console.log('测试5: VIP用户 - 短线+中线+全部用户')
const result5 = getDisplayTags(['short_term', 'mid_term', 'all_users'], false)
console.log('输入: ["short_term", "mid_term", "all_users"]')
console.log('输出:', result5)
console.log('预期: 1个标签 - "短线+中线"（组合标签，不显示全部用户）')
console.log('✅ 通过:', result5.length === 1 && result5[0].label === '短线+中线' && !result5.find(t => t.label === '全部用户'))
console.log('')

// 测试用例6：管理员 - 只有短线标签
console.log('测试6: 管理员 - 只有短线标签')
const result6 = getDisplayTags(['short_term'], true)
console.log('输入: ["short_term"]')
console.log('输出:', result6)
console.log('预期: 1个标签 - "短线策略"')
console.log('✅ 通过:', result6.length === 1 && result6[0].label === '短线策略')
console.log('')

// 测试用例7：管理员 - 短线+中线
console.log('测试7: 管理员 - 短线+中线')
const result7 = getDisplayTags(['short_term', 'mid_term'], true)
console.log('输入: ["short_term", "mid_term"]')
console.log('输出:', result7)
console.log('预期: 2个标签 - "短线策略" 和 "中线策略"（不组合）')
console.log('✅ 通过:', result7.length === 2 && result7[0].label === '短线策略' && result7[1].label === '中线策略')
console.log('')

// 测试用例8：管理员 - 短线+全部用户
console.log('测试8: 管理员 - 短线+全部用户')
const result8 = getDisplayTags(['short_term', 'all_users'], true)
console.log('输入: ["short_term", "all_users"]')
console.log('输出:', result8)
console.log('预期: 1个标签 - "短线策略"（不显示全部用户）')
console.log('✅ 通过:', result8.length === 1 && result8[0].label === '短线策略' && !result8.find(t => t.label === '全部用户'))
console.log('')

// 测试用例9：管理员 - 短线+中线+全部用户
console.log('测试9: 管理员 - 短线+中线+全部用户')
const result9 = getDisplayTags(['short_term', 'mid_term', 'all_users'], true)
console.log('输入: ["short_term", "mid_term", "all_users"]')
console.log('输出:', result9)
console.log('预期: 2个标签 - "短线策略" 和 "中线策略"（不显示全部用户）')
console.log('✅ 通过:', result9.length === 2 && result9[0].label === '短线策略' && result9[1].label === '中线策略' && !result9.find(t => t.label === '全部用户'))
console.log('')

// 测试用例10：空标签数组
console.log('测试10: 空标签数组')
const result10 = getDisplayTags([], false)
console.log('输入: []')
console.log('输出:', result10)
console.log('预期: 0个标签')
console.log('✅ 通过:', result10.length === 0)
console.log('')

// 测试用例11：只有全部用户标签（VIP）
console.log('测试11: 只有全部用户标签（VIP）')
const result11 = getDisplayTags(['all_users'], false)
console.log('输入: ["all_users"]')
console.log('输出:', result11)
console.log('预期: 0个标签（VIP不显示全部用户）')
console.log('✅ 通过:', result11.length === 0)
console.log('')

// 测试用例12：null标签
console.log('测试12: null标签')
const result12 = getDisplayTags(null, false)
console.log('输入: null')
console.log('输出:', result12)
console.log('预期: 0个标签')
console.log('✅ 通过:', result12.length === 0)
console.log('')

console.log('=== 测试完成 ===')

<template>
  <view class="page">
    <view class="summary">
      <text class="title">Agent 管理</text>
      <text class="hint">{{ configured ? '服务已配置' : '服务暂未配置' }}</text>
    </view>

    <view class="section">
      <text class="section-title">默认 Agent</text>
      <view v-if="agents.length === 0" class="empty">暂无可用 Agent，请先检查服务配置和授权。</view>
      <view v-for="item in agents" :key="item.agentId" class="agent-row">
        <view class="agent-info">
          <text class="agent-name">{{ item.name || '未命名 Agent' }}</text>
          <text class="agent-desc">{{ item.description || '暂无简介' }}</text>
        </view>
        <button v-if="item.agentId === currentAgentId" class="selected" size="mini" disabled>当前默认</button>
        <button v-else class="select" size="mini" @click="setDefault(item)">设为默认</button>
      </view>
    </view>

    <view class="section">
      <text class="section-title">调用统计</text>
      <view class="metrics">
        <view><text class="metric-value">{{ usage.summary.total || 0 }}</text><text>总调用</text></view>
        <view><text class="metric-value">{{ usage.summary.success || 0 }}</text><text>成功</text></view>
        <view><text class="metric-value">{{ usage.summary.failed || 0 }}</text><text>失败</text></view>
      </view>
      <view v-for="user in usage.users" :key="user.userId" class="user-row">
        <text>{{ user.userName || `用户 ${user.userId}` }}</text><text>{{ user.usageCount }} 次</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAgentConfigApi, getAvailableAgentsApi, getAgentUsageApi, updateAgentConfigApi } from '@/api/ai-advisor'

const configured = ref(false)
const currentAgentId = ref('')
const agents = ref([])
const usage = ref({ summary: {}, users: [] })

async function load() {
  const [configResult, agentsResult, usageResult] = await Promise.allSettled([getAgentConfigApi(), getAvailableAgentsApi(), getAgentUsageApi()])
  if (configResult.status === 'fulfilled') { configured.value = Boolean(configResult.value.data?.configured); currentAgentId.value = configResult.value.data?.agent?.agentId || '' }
  if (agentsResult.status === 'fulfilled' && agentsResult.value.code === 200) agents.value = agentsResult.value.data || []
  if (usageResult.status === 'fulfilled' && usageResult.value.code === 200) usage.value = usageResult.value.data || usage.value
}

async function setDefault(agent) {
  try {
    const result = await updateAgentConfigApi(agent.agentId)
    if (result.code === 200) { currentAgentId.value = agent.agentId; uni.showToast({ title: '默认 Agent 已更新', icon: 'success' }) }
  } catch (error) { console.error('更新默认 Agent 失败:', error) }
}

onMounted(load)
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; padding: 24rpx; background: #f5f7fa; }
.summary, .section { padding: 28rpx; margin-bottom: 20rpx; background: #fff; border-radius: 8rpx; }
.title, .section-title, .agent-name, .metric-value { display: block; font-weight: 600; color: #1f2937; }
.title { font-size: 34rpx; }.hint, .agent-desc, .empty { display: block; margin-top: 10rpx; color: #6b7280; font-size: 26rpx; }.section-title { margin-bottom: 20rpx; font-size: 28rpx; }
.agent-row, .user-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; padding: 18rpx 0; border-top: 1rpx solid #edf0f3; }.agent-info { flex: 1; min-width: 0; }.agent-desc { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.selected, .select { margin: 0; font-size: 24rpx; }.selected { color: #0f766e; background: #d1fae5; }.select { color: #fff; background: #0f766e; }
.metrics { display: grid; grid-template-columns: repeat(3, 1fr); padding-bottom: 16rpx; }.metrics view { display: flex; flex-direction: column; align-items: center; color: #6b7280; font-size: 24rpx; }.metric-value { margin-bottom: 6rpx; color: #0f766e; font-size: 36rpx; }.user-row { color: #4b5563; font-size: 26rpx; }
</style>

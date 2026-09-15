<!--
  渠道配置（管理员）：IM 机器人渠道的可视化配置
  - 渠道：企业微信 / 飞书（后续可扩钉钉）
  - 凭证在对应开放平台获取后在此填写，保存后后端自动热重载（无需重启）
  - 凭证回显脱敏（前4位+****），不改即保留原值
-->
<template>
	<view class="bot-config-container">
		<!-- 当前状态卡片 -->
		<view class="status-card">
			<view class="status-row">
				<text class="status-label">当前活跃渠道</text>
				<view class="status-badge" :class="activeChannel ? 'on' : 'off'">
					{{ activeChannel ? channelLabel(activeChannel) : '未启用' }}
				</view>
			</view>
			<text class="status-hint">配置保存后自动热重载，无需重启服务</text>
		</view>

		<!-- 渠道 Tab -->
		<view class="tab-container">
			<view class="tab-item" :class="{ active: activeTab === 'wecom' }" @click="switchTab('wecom')">
				<text class="tab-icon">💬</text>
				<text class="tab-text">企业微信</text>
			</view>
			<view class="tab-item" :class="{ active: activeTab === 'feishu' }" @click="switchTab('feishu')">
				<text class="tab-icon">🐦</text>
				<text class="tab-text">飞书</text>
			</view>
		</view>

		<!-- 配置表单 -->
		<view class="form-card">
			<view class="form-row">
				<text class="form-label">{{ idLabel }}</text>
				<input class="form-input" v-model="form.id" :placeholder="idPlaceholder" />
			</view>
			<view class="form-row">
				<text class="form-label">{{ secretLabel }}</text>
				<input class="form-input" v-model="form.secret" :placeholder="'留空则保留原值'" />
			</view>
			<view class="form-row">
				<text class="form-label">绑定码</text>
				<input class="form-input" v-model="form.bindCode" placeholder="管理员群里「绑定 <码>」用" />
			</view>
			<view class="form-row switch-row">
				<text class="form-label">启用该渠道</text>
				<switch :checked="form.enabled" color="#667eea" @change="form.enabled = $event.detail.value" />
			</view>

			<view class="form-actions">
				<button class="save-btn" :disabled="saving" @click="handleSave">
					{{ saving ? '保存中...' : '保存并生效' }}
				</button>
				<button class="reload-btn" :disabled="reloading" @click="handleReload">
					{{ reloading ? '重载中...' : '仅重载连接' }}
				</button>
			</view>

			<view class="help-block">
				<text class="help-title">凭证获取方式</text>
				<text v-if="activeTab === 'wecom'" class="help-text">
					企微管理后台 → 应用管理 → 智能机器人 → 接入方式选「长连接模式」→ 获取 Bot ID 和 Secret
				</text>
				<text v-else class="help-text">
					飞书开放平台 → 自建应用 → 凭证与基础信息 → 获取 App ID 和 App Secret（需开通机器人能力 + 消息权限并发布）
				</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getBotConfigsApi, updateBotConfigApi, reloadBotApi } from '../../api/botConfig'

const activeTab = ref('wecom')
const activeChannel = ref('')
const saving = ref(false)
const reloading = ref(false)

// 各渠道的原始配置（含脱敏 secret，用于"留空保留原值"）
const rawConfigs = ref({}) // { wecom: {...}, feishu: {...} }

const form = ref({
	id: '',
	secret: '',
	bindCode: '',
	enabled: false
})

const channelLabel = (c) => ({ wecom: '企业微信', feishu: '飞书', dingtalk: '钉钉' }[c] || c)

const idLabel = computed(() => (activeTab.value === 'wecom' ? 'Bot ID' : 'App ID'))
const idPlaceholder = computed(() => (activeTab.value === 'wecom' ? '企微智能机器人 Bot ID' : '飞书开放平台 App ID（cli_ 开头）'))
const secretLabel = computed(() => (activeTab.value === 'wecom' ? 'Bot Secret' : 'App Secret'))

function fillForm(channel) {
	const raw = rawConfigs.value[channel] || {}
	form.value = {
		id: raw.botId || raw.appId || '',
		secret: raw.secret || raw.appSecret || '',
		bindCode: raw.bindCode || '',
		enabled: !!raw._enabled
	}
}

async function loadConfigs() {
	try {
		const res = await getBotConfigsApi()
		const list = res.data || []
		const map = {}
		for (const item of list) {
			const cfg = item.config || {}
			map[item.channel] = {
				...cfg,
				_enabled: item.enabled
			}
			if (item.enabled) activeChannel.value = item.channel
		}
		rawConfigs.value = map
		fillForm(activeTab.value)
	} catch (err) {
		uni.showToast({ title: '加载配置失败', icon: 'none' })
	}
}

function switchTab(tab) {
	activeTab.value = tab
	fillForm(tab)
}

async function handleSave() {
	const channel = activeTab.value
	const raw = rawConfigs.value[channel] || {}

	// secret 脱敏保护：留空或仍是脱敏值时保留原值
	let secret = (form.value.secret || '').trim()
	if (!secret || secret.includes('****')) {
		secret = raw.secret || raw.appSecret || ''
	}
	if (!secret) {
		uni.showToast({ title: '请填写 Secret', icon: 'none' })
		return
	}
	if (!form.value.id.trim()) {
		uni.showToast({ title: `请填写 ${idLabel.value}`, icon: 'none' })
		return
	}

	const config = channel === 'wecom'
		? { botId: form.value.id.trim(), secret, bindCode: form.value.bindCode.trim() }
		: { appId: form.value.id.trim(), appSecret: secret, bindCode: form.value.bindCode.trim() }

	saving.value = true
	try {
		const res = await updateBotConfigApi(channel, { enabled: form.value.enabled, config })
		uni.showToast({ title: res.message || '已保存并生效', icon: 'success' })
		await loadConfigs()
	} catch (err) {
		uni.showToast({ title: err.message || '保存失败', icon: 'none' })
	} finally {
		saving.value = false
	}
}

async function handleReload() {
	reloading.value = true
	try {
		const res = await reloadBotApi()
		uni.showToast({ title: res.message || '已重载', icon: 'none' })
		await loadConfigs()
	} catch (err) {
		uni.showToast({ title: err.message || '重载失败', icon: 'none' })
	} finally {
		reloading.value = false
	}
}

onMounted(loadConfigs)
onShow(loadConfigs)
</script>

<style lang="scss" scoped>
.bot-config-container {
	min-height: 100vh;
	background: var(--bg-page, #f5f6fa);
	padding: 24rpx;
	padding-bottom: 60rpx;
	box-sizing: border-box;
}

.status-card {
	background: var(--bg-card, #ffffff);
	border-radius: 16rpx;
	padding: 28rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.status-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.status-label {
	font-size: 28rpx;
	color: var(--text-primary, #333);
	font-weight: 600;
}

.status-badge {
	font-size: 24rpx;
	padding: 6rpx 20rpx;
	border-radius: 999rpx;

	&.on {
		background: #ecf7ef;
		color: #34a853;
	}

	&.off {
		background: #f2f3f5;
		color: #999;
	}
}

.status-hint {
	font-size: 22rpx;
	color: var(--text-tertiary, #999);
}

.tab-container {
	display: flex;
	gap: 16rpx;
	margin-bottom: 24rpx;
}

.tab-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	background: var(--bg-card, #ffffff);
	border-radius: 12rpx;
	padding: 20rpx 0;
	border: 2rpx solid transparent;

	&.active {
		border-color: #667eea;
		background: #f0f2ff;
	}
}

.tab-icon {
	font-size: 28rpx;
}

.tab-text {
	font-size: 26rpx;
	color: var(--text-primary, #333);
}

.form-card {
	background: var(--bg-card, #ffffff);
	border-radius: 16rpx;
	padding: 28rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.form-row {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	margin-bottom: 28rpx;
}

.form-label {
	font-size: 26rpx;
	color: var(--text-primary, #333);
	font-weight: 500;
}

.form-input {
	background: var(--bg-page, #f5f6fa);
	border-radius: 10rpx;
	padding: 20rpx 24rpx;
	font-size: 26rpx;
	color: var(--text-primary, #333);
}

.switch-row {
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.form-actions {
	display: flex;
	gap: 16rpx;
	margin-top: 8rpx;
}

.save-btn {
	flex: 2;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 28rpx;
	color: #fff;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 10rpx;
	border: none;

	&[disabled] {
		opacity: 0.6;
	}
}

.reload-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 26rpx;
	color: #4f5fd5;
	background: #f0f2ff;
	border-radius: 10rpx;
	border: none;

	&[disabled] {
		opacity: 0.6;
	}
}

.help-block {
	margin-top: 32rpx;
	padding-top: 24rpx;
	border-top: 2rpx solid var(--border-primary, #eee);
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.help-title {
	font-size: 24rpx;
	color: var(--text-secondary, #666);
	font-weight: 600;
}

.help-text {
	font-size: 22rpx;
	color: var(--text-tertiary, #999);
	line-height: 1.6;
}

/* PC 大屏适配 */
/* #ifdef H5 */
@media (min-width: 769px) {
	.bot-config-container {
		max-width: 720px;
		margin: 0 auto;
		padding: 24px 16px;
	}

	.form-input {
		padding: 10px 12px;
		font-size: 14px;
	}

	.save-btn,
	.reload-btn {
		height: 40px;
		line-height: 40px;
		font-size: 14px;
	}
}
/* #endif */
</style>

<template>
	<view v-if="visible" class="date-range-picker-mask" @click="handleMaskClick">
		<view class="date-range-picker" @click.stop>
			<view class="picker-header">
				<text class="picker-title">自定义时间范围</text>
			</view>

			<view class="picker-content">
				<view class="date-item">
					<text class="date-label">开始日期</text>
					<picker
						mode="date"
						:value="tempStartDate"
						:end="tempEndDate || currentDate"
						@change="handleStartDateChange"
					>
						<view class="date-value" :class="{ 'has-value': tempStartDate }">
							<text class="date-text">{{ tempStartDate || '请选择' }}</text>
							<text class="date-arrow">▼</text>
						</view>
					</picker>
				</view>

				<view class="date-item">
					<text class="date-label">结束日期</text>
					<picker
						mode="date"
						:value="tempEndDate"
						:start="tempStartDate"
						:end="currentDate"
						@change="handleEndDateChange"
					>
						<view class="date-value" :class="{ 'has-value': tempEndDate }">
							<text class="date-text">{{ tempEndDate || '请选择' }}</text>
							<text class="date-arrow">▼</text>
						</view>
					</picker>
				</view>

				<!-- 错误提示 -->
				<view v-if="errorMessage" class="error-message">
					<text class="error-icon">⚠️</text>
					<text class="error-text">{{ errorMessage }}</text>
				</view>
			</view>

			<view class="picker-footer">
				<button class="btn-cancel" @click="handleCancel">取消</button>
				<button class="btn-confirm" @click="handleConfirm">确定</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	startDate: {
		type: String,
		default: ''
	},
	endDate: {
		type: String,
		default: ''
	}
})

const emit = defineEmits(['confirm', 'cancel'])

// 临时存储选中的日期
const tempStartDate = ref('')
const tempEndDate = ref('')
const errorMessage = ref('')

// 当前日期（用于限制最大可选日期）
const currentDate = computed(() => {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
})

// 监听visible变化，控制弹窗显示
watch(() => props.visible, (newVal) => {
	if (newVal) {
		// 打开弹窗时，初始化临时日期
		tempStartDate.value = props.startDate
		tempEndDate.value = props.endDate
		errorMessage.value = ''
	}
})

// 监听开始日期变化
const handleStartDateChange = (e) => {
	tempStartDate.value = e.detail.value
	validateDates()
}

// 监听结束日期变化
const handleEndDateChange = (e) => {
	tempEndDate.value = e.detail.value
	validateDates()
}

// 验证日期
const validateDates = () => {
	errorMessage.value = ''

	// 如果两个日期都选择了，进行验证
	if (tempStartDate.value && tempEndDate.value) {
		const start = new Date(tempStartDate.value)
		const end = new Date(tempEndDate.value)

		// 验证结束日期必须大于或等于开始日期
		if (end < start) {
			errorMessage.value = '结束日期不能早于开始日期'
			return false
		}

		// 验证日期范围不能超过一年
		const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
		if (daysDiff > 365) {
			errorMessage.value = '日期范围不能超过一年'
			return false
		}
	}

	return true
}

// 处理确定按钮
const handleConfirm = () => {
	// 验证是否选择了日期
	if (!tempStartDate.value || !tempEndDate.value) {
		errorMessage.value = '请选择完整的日期范围'
		return
	}

	// 验证日期
	if (!validateDates()) {
		return
	}

	// 触发确认事件
	emit('confirm', {
		startDate: tempStartDate.value,
		endDate: tempEndDate.value
	})

	// 关闭弹窗
	closePopup()
}

// 处理取消按钮
const handleCancel = () => {
	emit('cancel')
	closePopup()
}

// 处理遮罩点击
const handleMaskClick = () => {
	emit('cancel')
	closePopup()
}

// 关闭弹窗
const closePopup = () => {
	errorMessage.value = ''
	emit('update:visible', false)
}

// 暴露打开方法
const open = () => {
	emit('update:visible', true)
}

// 暴露关闭方法
const close = () => {
	closePopup()
}

defineExpose({
	open,
	close
})
</script>

<style lang="scss" scoped>
.date-range-picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 999;
	display: flex;
	align-items: flex-end;
	animation: fadeIn 0.3s;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.date-range-picker {
	width: 100%;
	background: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	animation: slideUp 0.3s;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.picker-header {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.picker-content {
	padding: 40rpx 30rpx;
}

.date-item {
	margin-bottom: 30rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.date-label {
	display: block;
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 15rpx;
	font-weight: 500;
}

.date-value {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 80rpx;
	padding: 0 25rpx;
	background: #f5f5f5;
	border-radius: 12rpx;
	border: 2rpx solid transparent;
	transition: all 0.3s;

	&.has-value {
		background: #f0f2ff;
		border-color: #667eea;
	}
}

.date-text {
	font-size: 28rpx;
	color: #999999;

	.has-value & {
		color: #333333;
		font-weight: 500;
	}
}

.date-arrow {
	font-size: 20rpx;
	color: #999999;
}

.error-message {
	display: flex;
	align-items: center;
	gap: 10rpx;
	margin-top: 20rpx;
	padding: 15rpx 20rpx;
	background: #fff5f5;
	border-radius: 8rpx;
	border-left: 3rpx solid #ff5252;
}

.error-icon {
	font-size: 24rpx;
}

.error-text {
	flex: 1;
	font-size: 24rpx;
	color: #ff5252;
	line-height: 1.4;
}

.picker-footer {
	display: flex;
	gap: 20rpx;
	padding: 20rpx 30rpx 30rpx;
	border-top: 1rpx solid #f0f0f0;
}

.btn-cancel,
.btn-confirm {
	flex: 1;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	border: none;
	border-radius: 12rpx;
	font-weight: 500;
	transition: all 0.3s;

	&::after {
		border: none;
	}
}

.btn-cancel {
	background: #f5f5f5;
	color: #666666;

	&:active {
		background: #e0e0e0;
	}
}

.btn-confirm {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #ffffff;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);

	&:active {
		opacity: 0.9;
		transform: scale(0.98);
	}
}
</style>

<template>
	<view class="input-wrapper" :class="wrapperClass">
		<label v-if="label" class="input-label">{{ label }}</label>
		<input
			:type="type"
			:value="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			:maxlength="maxlength"
			@input="handleInput"
			@focus="handleFocus"
			@blur="handleBlur"
			class="input-field"
			:class="inputClass"
			:placeholder-style="placeholderStyle"
		/>
		<text v-if="error" class="input-error">{{ error }}</text>
		<text v-else-if="hint" class="input-hint">{{ hint }}</text>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	modelValue: {
		type: [String, Number],
		default: ''
	},
	type: {
		type: String,
		default: 'text'
	},
	label: {
		type: String,
		default: ''
	},
	placeholder: {
		type: String,
		default: ''
	},
	disabled: {
		type: Boolean,
		default: false
	},
	error: {
		type: String,
		default: ''
	},
	hint: {
		type: String,
		default: ''
	},
	maxlength: {
		type: Number,
		default: 140
	},
	size: {
		type: String,
		default: 'medium',
		validator: (value) => ['small', 'medium', 'large'].includes(value)
	}
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// 计算wrapper样式类
const wrapperClass = computed(() => {
	return {
		[`input-wrapper--${props.size}`]: props.size,
		'input-wrapper--disabled': props.disabled,
		'input-wrapper--error': props.error
	}
})

// 计算input样式类
const inputClass = computed(() => {
	return {
		'input-field--error': props.error,
		'input-field--disabled': props.disabled
	}
})

// 占位符样式
const placeholderStyle = 'color: #999999'

// 处理输入
const handleInput = (e) => {
	emit('update:modelValue', e.detail.value)
}

// 处理焦点
const handleFocus = (e) => {
	emit('focus', e)
}

// 处理失焦
const handleBlur = (e) => {
	emit('blur', e)
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.input-wrapper {
	margin-bottom: 40rpx;

	// 尺寸变体
	&--small {
		.input-field {
			height: 72rpx;
			font-size: $font-size-sm;
		}
	}

	&--medium {
		.input-field {
			height: 88rpx;
			font-size: $font-size-md;
		}
	}

	&--large {
		.input-field {
			height: 104rpx;
			font-size: $font-size-lg;
		}
	}

	// 禁用状态
	&--disabled {
		.input-field {
			background-color: $bg-secondary;
			color: $text-disabled;
			cursor: not-allowed;
		}

		.input-label {
			color: $text-disabled;
		}
	}

	// 错误状态
	&--error {
		.input-field {
			border-color: $error-color;

			&:focus {
				border-color: $error-color;
			}
		}
	}
}

.input-label {
	display: block;
	font-size: $font-size-md;
	color: $text-primary;
	margin-bottom: 20rpx;
	font-weight: $font-weight-medium;
	transition: color $transition-base $ease-in-out;
}

.input-field {
	width: 100%;
	padding: 0 24rpx;
	color: $text-primary;
	background-color: $bg-primary;
	border: 2rpx solid $border-color;
	border-radius: $radius-xs;
	box-sizing: border-box;
	transition: all $transition-base $ease-in-out;

	// 焦点状态
	&:focus {
		border-color: $primary-color;
		outline: none;
		box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
	}

	// 禁用状态
	&--disabled {
		background-color: $bg-secondary;
		color: $text-disabled;
		cursor: not-allowed;

		&:focus {
			border-color: $border-color;
			box-shadow: none;
		}
	}

	// 错误状态
	&--error {
		border-color: $error-color;

		&:focus {
			border-color: $error-color;
			box-shadow: 0 0 0 4rpx rgba(255, 82, 82, 0.1);
		}
	}

	// placeholder样式
	&::placeholder {
		color: $text-tertiary;
	}
}

.input-error {
	display: block;
	margin-top: 12rpx;
	font-size: $font-size-sm;
	color: $error-color;
	line-height: 1.5;
	animation: slideDown 0.3s $ease-out;
}

.input-hint {
	display: block;
	margin-top: 12rpx;
	font-size: $font-size-sm;
	color: $text-tertiary;
	line-height: 1.5;
}

// 动画
@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-8rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>

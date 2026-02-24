<template>
  <view class="ai-settings-container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">图灵AI设置</text>
    </view>

    <!-- Token状态卡片 -->
    <view class="card status-card">
      <view class="card-header">
        <text class="card-title">Token状态</text>
        <button class="btn-refresh" @click="refreshStatus">
          <text class="refresh-icon">🔄</text>
          <text>刷新</text>
        </button>
      </view>

      <view v-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>

      <view v-else class="status-content">
        <view class="status-row">
          <text class="status-label">Token状态</text>
          <view class="status-value" :class="tokenStatus.isValid ? 'valid' : 'invalid'">
            <text class="status-dot"></text>
            <text>{{ tokenStatus.isValid ? '有效' : '已过期' }}</text>
          </view>
        </view>

        <view class="status-row">
          <text class="status-label">上次更新</text>
          <text class="status-value">{{ formatDate(tokenStatus.lastRefresh) }}</text>
        </view>

        <view class="status-row">
          <text class="status-label">过期时间</text>
          <text class="status-value">{{ formatDate(tokenStatus.expiresAt) }}</text>
        </view>

        <view class="status-row">
          <text class="status-label">剩余时间</text>
          <text class="status-value" :class="{ warning: tokenStatus.expiresIn < 3600000 }">
            {{ formatDuration(tokenStatus.expiresIn) }}
          </text>
        </view>
      </view>
    </view>

    <!-- Token更新卡片 -->
    <view class="card update-card">
      <view class="card-header">
        <text class="card-title">更新Token</text>
      </view>

      <view class="update-content">
        <view class="instruction-box">
          <text class="instruction-title">获取Token步骤：</text>
          <view class="instruction-steps">
            <text class="step">1. 打开浏览器访问 pul.tdx.com.cn 登录通达信</text>
            <text class="step">2. 登录后访问问小达页面</text>
            <text class="step">3. 打开开发者工具 (F12) → 网络标签</text>
            <text class="step">4. 发送一条消息，在请求头中找到 tdx-auth</text>
            <text class="step">5. 复制tdx-auth的值粘贴到下方</text>
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">新的Token</text>
          <textarea
            v-model="newToken"
            class="token-input"
            placeholder="粘贴新的tdx-auth token..."
            :maxlength="200"
          ></textarea>
        </view>

        <view class="button-group">
          <button class="btn btn-primary" :disabled="!newToken || updating" @click="updateToken">
            <text v-if="updating">更新中...</text>
            <text v-else>更新Token</text>
          </button>
          <button class="btn btn-secondary" @click="testToken">
            <text>测试当前Token</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 操作结果提示 -->
    <view v-if="message" class="message-toast" :class="messageType">
      <text>{{ message }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '@/api/admin';

// 状态
const loading = ref(false);
const updating = ref(false);
const newToken = ref('');
const message = ref('');
const messageType = ref('success');

const tokenStatus = ref({
  hasToken: false,
  isValid: false,
  expiresAt: 0,
  lastRefresh: 0,
  expiresIn: 0
});

// 获取token状态
async function refreshStatus() {
  loading.value = true;
  try {
    const res = await adminApi.getAiTokenStatus();
    if (res.code === 200) {
      tokenStatus.value = res.data;
    }
  } catch (error) {
    showMessage('获取状态失败: ' + error.message, 'error');
  } finally {
    loading.value = false;
  }
}

// 更新token
async function updateToken() {
  if (!newToken.value.trim()) {
    showMessage('请输入Token', 'error');
    return;
  }

  updating.value = true;
  try {
    const res = await adminApi.setAiToken({ token: newToken.value.trim() });
    if (res.code === 200) {
      showMessage('Token更新成功！', 'success');
      newToken.value = '';
      await refreshStatus();
    } else {
      showMessage('更新失败: ' + (res.message || '未知错误'), 'error');
    }
  } catch (error) {
    showMessage('更新失败: ' + error.message, 'error');
  } finally {
    updating.value = false;
  }
}

// 测试token
async function testToken() {
  showMessage('正在测试Token...', 'info');
  try {
    const res = await adminApi.refreshAiToken();
    if (res.code === 200) {
      showMessage('Token测试通过，可以正常使用', 'success');
      await refreshStatus();
    } else {
      showMessage('Token测试失败: ' + (res.message || '未知错误'), 'error');
    }
  } catch (error) {
    showMessage('测试失败: ' + error.message, 'error');
  }
}

// 显示消息
function showMessage(msg, type = 'info') {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
}

// 格式化日期
function formatDate(timestamp) {
  if (!timestamp) return '未设置';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN');
}

// 格式化持续时间
function formatDuration(ms) {
  if (!ms || ms <= 0) return '已过期';

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}天 ${hours % 24}小时`;
  }

  return `${hours}小时 ${minutes}分钟`;
}

// 页面加载时获取状态
onMounted(() => {
  refreshStatus();
});
</script>

<style lang="scss" scoped>
.ai-settings-container {
  padding: 30rpx;
  max-width: 900rpx;
  margin: 0 auto;
}

.header {
  margin-bottom: 30rpx;

  .title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
  }
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;

  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;

  &:active {
    background: #e8e8e8;
  }
}

.status-content {
  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .status-label {
    font-size: 28rpx;
    color: #666;
  }

  .status-value {
    font-size: 28rpx;
    color: #333;

    &.valid {
      color: #52c41a;
    }

    &.invalid {
      color: #ff4d4f;
    }

    &.warning {
      color: #faad14;
    }
  }
}

.status-dot {
  display: inline-block;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 8rpx;

  .valid & {
    background: #52c41a;
  }

  .invalid & {
    background: #ff4d4f;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 40rpx;
  color: #999;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #e0e0e0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.instruction-box {
  background: #f6f8fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .instruction-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
  }

  .instruction-steps {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .step {
      font-size: 26rpx;
      color: #666;
      padding-left: 24rpx;
      position: relative;

      &::before {
        content: '•';
        position: absolute;
        left: 8rpx;
        color: #1890ff;
      }
    }
  }
}

.input-group {
  margin-bottom: 24rpx;

  .input-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
  }

  .token-input {
    width: 100%;
    min-height: 120rpx;
    padding: 20rpx;
    border: 1rpx solid #d9d9d9;
    border-radius: 8rpx;
    font-size: 28rpx;
    background: #fafafa;

    &:focus {
      border-color: #1890ff;
      background: #fff;
    }
  }
}

.button-group {
  display: flex;
  gap: 20rpx;

  .btn {
    flex: 1;
    padding: 20rpx 32rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;

    &.btn-primary {
      background: #1890ff;
      color: #fff;

      &:active {
        background: #096dd9;
      }

      &:disabled {
        background: #bae7ff;
        color: #fff;
      }
    }

    &.btn-secondary {
      background: #f5f5f5;
      color: #666;

      &:active {
        background: #e8e8e8;
      }
    }
  }
}

.message-toast {
  position: fixed;
  bottom: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  z-index: 1000;

  &.success {
    background: #f6ffed;
    color: #52c41a;
    border: 1rpx solid #b7eb8f;
  }

  &.error {
    background: #fff2f0;
    color: #ff4d4f;
    border: 1rpx solid #ffccc7;
  }

  &.info {
    background: #e6f7ff;
    color: #1890ff;
    border: 1rpx solid #91d5ff;
  }
}
</style>

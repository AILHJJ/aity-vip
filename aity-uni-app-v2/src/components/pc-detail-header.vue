<!--
  PC 端详情页顶部导航条（H5 大屏专用）
  - 仅在 H5 大屏（≥769px）显示，小屏/小程序/嵌入模式不渲染
  - 提供"返回"按钮 + 页面标题，让用户能离开深层次页面
-->
<template>
  <!-- #ifdef H5 -->
  <view v-if="showHeader" class="pc-detail-header">
    <view class="pc-detail-header-inner">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
      <view class="title">{{ title }}</view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script>
export default {
  name: 'PcDetailHeader',
  props: {
    title: { type: String, default: '' },
    fallbackUrl: { type: String, default: '/pages/messages/messages' }
  },
  computed: {
    showHeader() {
      // 嵌入模式隐藏（iframe 嵌入有自己的导航）
      if (typeof window !== 'undefined' && /[?&]embed=1(\b|&)/.test(window.location.search)) {
        return false;
      }
      // H5 大屏（≥769px）显示
      try {
        const query = uni.createSelectorQuery && uni.createSelectorQuery();
      } catch (e) { /* ignore */ }
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 769;
      }
      return false;
    }
  },
  methods: {
    goBack() {
      // #ifdef H5
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
        window.history.back();
      } else {
        uni.reLaunch({ url: this.fallbackUrl });
      }
      // #endif
    }
  }
};
</script>

<style lang="scss" scoped>
.pc-detail-header {
  display: none; // 小屏默认隐藏，H5 大屏下显示（CSS @media 控制）
}

@media (min-width: 769px) {
  .pc-detail-header {
    display: block; // 覆盖小屏的 display: none
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    background: var(--nav-bg);
    border-bottom: 1px solid var(--border-primary);
    z-index: 1000;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  // 内部容器：跟随主内容区域左对齐（PC 端页面 max-width 1280px 居中）
  .pc-detail-header-inner {
    max-width: 1280px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 16px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .back-btn:hover {
    background: var(--bg-hover);
  }

  .back-icon {
    font-size: 18px;
    color: var(--text-primary);
  }

  .back-text {
    font-size: 14px;
    color: var(--text-primary);
  }

  .title {
    margin-left: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}
</style>
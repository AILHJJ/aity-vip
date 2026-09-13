# H5 PC 端适配规划（投研图灵室 · AITY）

> 版本：v1.0（2026-09-13）
> 状态：阶段 1 完成，阶段 2/3 待规划
> 适用范围：浏览器访问 `https://aity88.online` 的所有页面（移动端访问视为窄屏走 mobile 布局）
> 关联：与小程序端 `#ifdef H5` / `mp-weixin` 严格隔离，互不影响

---

## 一、目标与原则

**目标**：让管理员（投研用户）日常在 PC 浏览器里像用 B 端后台一样高效看帖、回帖、看行情，而不只是"移动端页面的简单放大"。

**核心原则**：
1. **内容不撑满宽屏**：大屏下加 max-width 居中，左右留白（人眼聚焦舒适宽度 720~1280px）
2. **rpx 字号不失控**：uni-app 默认 750rpx 设计基准，在 1920px 屏上 32rpx ≈ 80px，必须用 `@media (min-width: 769px)` 限制
3. **结构组件居中**：uni-app 的内置 fixed 组件（tabBar / navBar）默认横跨视口，PC 端必须限制最大宽并居中
4. **小程序零影响**：所有 PC 适配都用 `#ifdef H5` 包裹，编译 mp-weixin 时整段丢弃
5. **浏览器原生优先**：PC 端不需要内置"返回按钮"（浏览器后退足够），减少多余 UI

---

## 二、阶段 1（已完成，2026-09-13）

### 改动文件
- `src/App.vue`：全局 H5 居中规则
- `src/pages/messages/messages.vue`：列表页容器 + 字号 cap
- `src/pages/message-detail/message-detail.vue`：详情页容器 + 字号 cap
- 其余 11 个页面：批量添加容器 max-width

### 已落地的能力

| 项 | 实现 | 说明 |
|---|---|---|
| 页面居中 | `uni-page-body { max-width: 1280px; margin: 0 auto }` | 全局 |
| 底部 tabBar 居中 | `.uni-tabbar-bottom { left:0; right:0; max-width: 1280px; margin: 0 auto }` | 大屏下限制在屏幕中央 1280px |
| 顶部导航条居中 | `.uni-page-head { max-width: 1280px; margin: 0 auto }` | 大屏下与 tabBar 视觉对称 |
| 顶部返回箭头去除 | H5 端 `@media (min-width: 769px)` 隐藏 `.uni-page-head-hd` | 浏览器后退按钮原生支持 |
| 各页面容器 | 11 个页面根容器加 `max-width: 720~1600px` | 视内容性质差异化 |

### 各页面 max-width 速查

| 页面 | max-width | 理由 |
|---|---|---|
| login / change-password / change-email | 480px | 表单窄列 |
| create-discussion | 800px | 长表单 |
| profile | 720px | 单列卡片 |
| create-message | 920px | markdown 编辑器 |
| ai-advisor | 960px | 对话界面 |
| discussions / discussion-detail / favorites / my-discussions | 1000px | 列表/详情 |
| stats / ai-config / user-management | 1000~1100px | 后台 |
| market | 1600px | 数据密集（行情/卡片） |
| messages / message-detail | 960~1000px | 列表/详情 |

---

## 三、阶段 2 待规划（本次未做）

### 2.1 PC 端独立后台布局（重）

**现状问题**：当前 H5 仍是"产品移动端布局硬撑到 PC"，只是居中+缩小字号，**本质还是单列堆叠**，不是真正的 B 端后台。

**目标**：

```
┌─────────────────────────────────────────────────────────────┐
│ 顶部水平导航：消息 | 讨论 | 行情 | 我的 | 用户管理 | AI 配置 │  ← #ifdef H5 重做
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│  左侧栏  │              主内容区（路由对应页面）                │
│  (二级   │                                                   │
│   菜单)  │                                                   │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

**实现路径**：用条件编译 + 自适应布局：
- `min-width: 769px` → 启用三栏布局（顶导 + 侧边栏 + 内容）
- 否则 → 当前单列堆叠（移动端）

**工作量**：1~2 天（含样式调整和导航逻辑）

### 2.2 全局字号/密度档位（重）

**现状**：当前每个页面单独 cap 字号，重复且不可维护。

**目标**：定义 3 档全局密度：
- `density=comfortable`（默认）：适合笔记本（1366~1920px）
- `density=compact`：适合 4K 大屏（2560px+），字号略小但信息密度高
- 写在 `theme-variables.scss`，页面引用变量

**工作量**：0.5 天

### 2.3 图片预览组件改造（中）

**现状问题**：H5 端 `<image>` 走 uni-app 编译后的 `uni-image`，对根路径 src 在 hash 路由下错误拼接 base，导致图片 404
（已通过 `fullUrl()` helper 修复），但**点击预览仍是 uni-app 原生 previewImage，H5 端体验简陋**（小弹窗 + 模拟按钮）。

**目标**：H5 端写一个全屏黑底图片预览组件（黑底、点击关闭、左右切换），小程序端继续用 `uni.previewImage`（原生支持好）。

**实现**：`components/H5ImagePreview.vue` + `#ifdef H5` 集成到 `message-detail`、`discussion-detail` 等含图片的页面。

**工作量**：半天

### 2.4 表格型组件 PC 化（中）

**现状**：用户管理、数据统计等页面用的是"卡片列表"，PC 端更适合表格。

**目标**：列表型页面 PC 端自动切换为表格布局（列对齐、可排序、可筛选），移动端保持卡片。

**工作量**：1~2 天

### 2.5 快捷键（中）

**目标**：PC 端管理员常用操作加键盘快捷键：
- `n`：新建帖子
- `r`：刷新当前页
- `Cmd/Ctrl+K`：全局搜索
- `Esc`：关闭弹窗/退出全屏预览

**工作量**：1 天

---

## 四、验证清单

### 每次发布 H5 前必跑

```powershell
# 1. 编译
cd aity-uni-app-v2
npm run build:h5

# 2. 编译产物隔离验证（小程序包绝不能有 H5 适配代码）
npm run build:mp-weixin
# 检查 dist/build/mp-weixin/**/*.wxss 不应包含 1280px / 769px / uni-page-head 等关键字
```

### 浏览器验证

- 强刷 `Ctrl+Shift+R`
- 1080p / 2K / 4K 三种分辨率各看一遍
- DevTools 切到手机模拟器，验证移动端布局没坏

---

## 五、暂不做（确认不实现）

- ❌ PC 端独立账号系统（H5 与小程序共用一套登录）
- ❌ 全文搜索 / Elasticsearch（量大，与产品整体规划冲突）
- ❌ 数据可视化大屏（除非专门要做 BI 看板）
- ❌ PWA / 桌面快捷方式（用户量小、ROI 低）

---

## 六、踩坑清单（必读）

1. **rpx 在大屏失控**：750rpx 设计基准，1920px 屏上 1rpx ≈ 2.56px，必须 cap
2. **fixed 元素居中**：`left:50% + transform:translateX(-50%)` 在某些场景会推出去，用 `left:0;right:0;margin:0 auto;max-width` 更稳
3. **uni-image 相对路径**：H5 端对根路径 src 在 hash 路由下错误拼接，必须用 `fullUrl()` 拼绝对 URL
4. **`#ifdef H5` 包裹**：所有 PC 适配都必须在媒体查询外面再包一层条件编译，否则小程序会带回去
5. **不要直接修改 `dist/`**：它是编译产物，改了无效，源码在 `src/`

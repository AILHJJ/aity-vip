# 迭代遗留问题 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** 修复 2026-05-02 迭代遗留问题中“互动交流”筛选语义错误，并补齐数据库迁移、上传环境可观测性和文档留痕。

**Architecture:** `status` 继续表示讨论处理状态，新增 `category` 表示讨论业务分类。前端“互动交流”传 `category=interaction`，后端查询和创建均支持该字段；图片上传问题通过日志暴露实际 API 环境，避免 local/cloud 混用。

**Tech Stack:** Node.js, Express, Sequelize, MySQL, Jest, uni-app, Vue 3.

---

### Task 1: 后端讨论分类行为测试

**Files:**
- Create: `backend/tests/discussion-controller.test.js`

**Steps:**
1. Mock `Discussion`、`DiscussionReply`、`User`、`Message` 等模型。
2. 测试 `getDiscussions` 对 `req.query.category` 写入 `where.category`。
3. 测试 `createDiscussion` 默认向 `Discussion.create` 写入 `category: 'interaction'`。
4. 运行 `npm test -- --runTestsByPath tests/discussion-controller.test.js`，先确认失败。

### Task 2: 后端实现

**Files:**
- Modify: `backend/src/models/Discussion.js`
- Modify: `backend/src/controllers/discussionController.js`

**Steps:**
1. `Discussion` 模型新增 `category` 字段。
2. `getDiscussions` 读取 query.category 并写入查询条件。
3. `createDiscussion` 接受 body.category，默认 `interaction`。
4. 列表、详情、我的讨论、收藏讨论响应包含 `category`。
5. 运行 discussion controller 测试。

### Task 3: 数据库迁移

**Files:**
- Create: `backend/migrations/20260502-add-discussion-category.sql`
- Create: `backend/migrations/20260502-message-type-varchar.sql`

**Steps:**
1. 新增 discussions.category 迁移。
2. 新增 messages.type VARCHAR 迁移。
3. 文档中标记：测试库先执行，生产库用户确认后执行。

### Task 4: 前端讨论筛选

**Files:**
- Modify: `aity-uni-app-v2/src/pages/discussions/discussions.vue`

**Steps:**
1. 将 filters 从纯 value 改为支持 `queryField`。
2. “互动交流”使用 `queryField: 'category', value: 'interaction'`。
3. “待回复/已回复”使用 `queryField: 'status'`。
4. 状态 badge 对未知值有明确兜底。

### Task 5: 上传环境可观测性

**Files:**
- Modify: `aity-uni-app-v2/src/api/upload.js`

**Steps:**
1. 上传前在开发环境输出 `API_BASE_URL`。
2. 上传成功时输出返回的 url 和 filename。
3. 上传失败时输出目标 API 和错误对象。

### Task 6: 文档留痕与验证

**Files:**
- Modify: `docs/08-项目规划/iterations/遗留问题解决方案确认-2026-05-02.md`
- Modify: `docs/08-项目规划/iterations/progress.md`

**Steps:**
1. 将方案文档状态从待确认更新为执行中/已实施。
2. 追加本次实施记录、测试结果和未执行项。
3. 运行可行的测试和构建命令。
4. 只 stage 本次相关文件并提交 Git。

# 自动化测试文档

> **文档类型**: 自动化测试文档索引
> **创建日期**: 2026-03-05
> **最后更新**: 2026-03-05
> **维护人员**: 测试团队
> **适用版本**: v2.0.0

---

## 文档概述

本目录包含VIP投研内部分享系统的自动化测试相关文档，涵盖DevBrowser、Playwright等测试工具的使用指南和最佳实践。

---

## 文档索引

### DevBrowser核心文档

| 文档 | 描述 | 优先级 | 适用于 |
|------|------|--------|--------|
| **[../DevBrowser使用指南](../DevBrowser使用指南.md)** | Dev Browser完整使用指南 | ⭐⭐⭐ | 所有测试人员 |
| **[../DevBrowser-入门实战指南](../DevBrowser-入门实战指南.md)** | Dev Browser快速入门教程 | ⭐⭐⭐ | 新手测试人员 |
| **[../DevBrowser-技术深度解析](../DevBrowser-技术深度解析.md)** | Dev Browser技术原理和架构 | ⭐⭐ | 高级用户 |
| **[../DevBrowser-常见问题解答](../DevBrowser-常见问题解答.md)** | Dev Browser常见问题和解决方案 | ⭐⭐⭐ | 所有用户 |
| **[../DevBrowser-测试用例示例](../DevBrowser-测试用例示例.md)** | Dev Browser测试脚本示例 | ⭐⭐⭐ | 测试人员 |

### uni-app自动化测试

| 文档 | 描述 | 优先级 | 适用于 |
|------|------|--------|--------|
| **[../uni-app自动化测试最佳实践](../uni-app自动化测试最佳实践.md)** | uni-app测试常见问题和解决方案 | ⭐⭐⭐ | 测试人员、开发者 |
| **[../自动化测试工作流程指南](../自动化测试工作流程指南.md)** | 完整的测试工作流程和策略 | ⭐⭐⭐ | 测试人员 |
| **[../自动化测试培训手册](../自动化测试培训手册.md)** | 自动化测试完整培训课程 | ⭐⭐ | 新人培训 |

### Playwright测试

| 文档 | 描述 | 优先级 | 适用于 |
|------|------|--------|--------|
| **[../自动化测试指南](../自动化测试指南.md)** | Playwright框架使用指南 | ⭐⭐ | 测试人员 |

---

## 快速开始

### DevBrowser快速入门

**第一步：了解DevBrowser**

DevBrowser是一个基于Playwright的浏览器自动化测试工具，提供了以下特性：

- AI驱动的元素定位（AI快照）
- 简洁的API设计
- 完整的类型支持
- 强大的调试功能

**第二步：连接浏览器**

```typescript
import { connect } from "@/client.js";

// 连接到已打开的Chrome浏览器
const client = await connect();
const page = await client.page("test-name");
```

**第三步：使用AI快照定位元素**

```typescript
// 获取页面AI快照
const snapshot = await client.getAISnapshot("page");

// 使用快照引用定位元素
const button = await client.selectSnapshotRef("page", "e30");
await button.click();
```

**第四步：运行测试**

详细步骤请参考 [DevBrowser-入门实战指南](../DevBrowser-入门实战指南.md)。

---

## 常见问题

### uni-app测试常见问题

| 问题 | 解决方案 | 详细文档 |
|------|----------|----------|
| **uni-mask遮罩层拦截点击** | 使用 `click({ force: true })` | [uni-app自动化测试最佳实践](../uni-app自动化测试最佳实践.md) |
| **组件选择器不兼容** | 使用AI快照定位元素 | [uni-app自动化测试最佳实践](../uni-app自动化测试最佳实践.md) |
| **页面加载时机不确定** | 使用 `waitForPageLoad` 等待 | [DevBrowser-常见问题解答](../DevBrowser-常见问题解答.md) |
| **元素定位失败** | 使用AI快照或等待元素可见 | [DevBrowser-常见问题解答](../DevBrowser-常见问题解答.md) |

### DevBrowser常见问题

| 问题 | 解决方案 | 详细文档 |
|------|----------|----------|
| **无法连接到浏览器** | 检查Chrome远程调试端口 | [DevBrowser-常见问题解答](../DevBrowser-常见问题解答.md) |
| **AI快照定位失败** | 确保页面已完全加载 | [DevBrowser-技术深度解析](../DevBrowser-技术深度解析.md) |
| **测试脚本执行慢** | 优化等待策略和选择器 | [uni-app自动化测试最佳实践](../uni-app自动化测试最佳实践.md) |

---

## 测试工具对比

### DevBrowser vs Playwright

| 特性 | DevBrowser | Playwright |
|------|-----------|------------|
| **学习曲线** | 低（AI辅助） | 中等 |
| **元素定位** | AI快照 + 选择器 | 选择器 |
| **API复杂度** | 简单 | 中等 |
| **调试功能** | 强大 | 良好 |
| **类型支持** | TypeScript | TypeScript |
| **适用场景** | uni-app、H5 | Web应用 |

### 测试方案选型

| 测试需求 | 推荐方案 | 理由 |
|---------|---------|------|
| **小程序测试** | DevBrowser | AI快照支持uni-app组件 |
| **H5测试** | DevBrowser或Playwright | 都支持，DevBrowser更简单 |
| **API测试** | Jest + Supertest | 更适合接口测试 |
| **性能测试** | Lighthouse | 专业性能测试工具 |

详细方案对比请参考 [测试方案选型指南](../测试方案选型指南.md)。

---

## 核心API参考

### DevBrowser核心API

#### 连接浏览器

```typescript
import { connect } from "@/client.js";

// 连接到Chrome
const client = await connect({
  headless: false  // 是否无头模式
});
```

#### 获取页面

```typescript
// 获取已打开的页面
const page = await client.page("page-name");
```

#### AI快照

```typescript
// 获取页面快照
const snapshot = await client.getAISnapshot("page-name");

// 使用快照引用定位元素
const element = await client.selectSnapshotRef("page-name", "e30");
await element.click();
```

#### 等待页面加载

```typescript
import { waitForPageLoad } from "@/client.js";

// 等待页面加载完成
await waitForPageLoad(page);
```

### Playwright核心API

#### 选择器

```typescript
// CSS选择器
const button = page.locator('button:has-text("提交")');

// XPath选择器
const element = page.locator('//div[@class="container"]');

// 文本选择器
const text = page.getByText('Hello World');
```

#### 操作

```typescript
// 点击
await element.click();

// 填写表单
await input.fill('test content');

// 选择下拉框
await select.selectOption('option1');
```

#### 等待

```typescript
// 等待元素可见
await element.waitFor({ state: 'visible' });

// 等待导航
await page.waitForURL('**/target');

// 等待响应
await page.waitForResponse(response => {
  return response.url().includes('/api/data');
});
```

---

## 测试最佳实践

### 1. 测试用例设计

**原则**：
- 每个测试用例只验证一个功能点
- 测试用例之间相互独立
- 使用有意义的测试名称
- 包含正向和负向测试

**示例**：

```typescript
test('用户登录 - 成功', async () => {
  // Given
  const email = 'test@example.com';
  const password = '123456';

  // When
  await login(email, password);

  // Then
  await expect(page).toHaveURL('/dashboard');
});
```

### 2. 选择器策略

**优先级**：
1. 使用data-testid（最稳定）
2. 使用AI快照（uni-app推荐）
3. 使用aria-label（可访问性好）
4. 使用CSS选择器（常见场景）
5. 避免使用XPath（脆弱）

**示例**：

```html
<!-- 推荐：使用data-testid -->
<button data-testid="submit-button">提交</button>

<!-- 推荐：使用aria-label -->
<button aria-label="提交表单">提交</button>
```

### 3. 等待策略

**原则**：
- 优先使用显式等待
- 避免使用固定延迟
- 等待具体条件而非时间

**示例**：

```typescript
// ❌ 不推荐：固定延迟
await page.waitForTimeout(3000);

// ✅ 推荐：等待元素可见
await element.waitFor({ state: 'visible' });

// ✅ 推荐：等待网络请求
await page.waitForResponse(response => {
  return response.url().includes('/api/data');
});
```

### 4. 测试数据管理

**原则**：
- 使用测试专用数据
- 每次测试前后清理数据
- 使用fixture管理测试数据

**示例**：

```typescript
beforeEach(async () => {
  // 准备测试数据
  await createTestData();
});

afterEach(async () => {
  // 清理测试数据
  await cleanupTestData();
});
```

---

## 测试报告

### 测试报告生成

使用Playwright内置的HTML报告：

```bash
# 运行测试并生成报告
npx playwright test --reporter=html

# 查看报告
npx playwright show-report
```

### 测试覆盖率

使用Istanbul生成覆盖率报告：

```bash
# 运行测试并收集覆盖率
npx playwright test --coverage

# 查看覆盖率报告
open coverage/index.html
```

---

## 相关文档

- [测试文档首页](../README.md) - 测试文档总览
- [开发指南](../../01-development/) - 开发规范和架构设计
- [API文档](../../04-api/) - API接口说明

---

## 目录结构

```
docs/07-testing/automation/
├── README.md                           # 本文档
└── (更多自动化测试相关文档请参考上级目录)
```

---

## 文档维护

**文档责任人**: 测试团队
**更新频率**: 每周或在工具升级后
**反馈渠道**: 提交Issue或联系测试团队

---

**最后更新**: 2026-03-05
**版本**: v1.0.0

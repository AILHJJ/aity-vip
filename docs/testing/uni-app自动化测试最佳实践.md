# uni-app 自动化测试最佳实践

## 常见问题与解决方案

### 1. uni-mask 遮罩层拦截点击

#### 问题描述

uni-app 的模态框、弹窗、action-sheet 等组件会生成 `<div class="uni-mask">` 遮罩层，该遮罩层会拦截所有点击事件，导致无法点击下方的按钮。

**错误日志示例**:
```
<div class="uni-mask"></div> from <div id="u-a-m"> subtree intercepts pointer events
```

#### 解决方案

##### 方案1: 使用 force 选项强制点击 (推荐)

```typescript
// 强制点击，绕过遮罩层检查
await locator.click({ force: true });
```

##### 方案2: 等待遮罩层消失

```typescript
// 等待遮罩层完全消失后再操作
await page.waitForSelector('.uni-mask', { state: 'hidden', timeout: 5000 });
await locator.click();
```

##### 方案3: 封装通用的弹窗处理函数

```typescript
/**
 * 处理uni-app弹窗确认
 * @param page Playwright页面对象
 * @param confirmText 确认按钮文本，默认"确定"
 */
async function handleUniModal(page: Page, confirmText: string = '确定'): Promise<void> {
  // 等待弹窗出现
  await page.waitForSelector('.uni-modal', { state: 'visible', timeout: 3000 }).catch(() => {});

  // 查找确认按钮（uni-app的确认按钮结构）
  const confirmBtn = page.locator(`.uni-modal__ft button:has-text("${confirmText}"), .uni-modal button:has-text("${confirmText}")`);

  if (await confirmBtn.count() > 0) {
    await confirmBtn.first().click({ force: true });
    // 等待弹窗消失
    await page.waitForSelector('.uni-modal', { state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}

/**
 * 安全点击 - 自动处理可能的遮罩层
 */
async function safeClick(locator: Locator): Promise<void> {
  try {
    // 先尝试普通点击
    await locator.click({ timeout: 2000 });
  } catch (e) {
    // 如果失败，使用强制点击
    await locator.click({ force: true });
  }
}
```

---

### 2. uni-app 组件选择器兼容性

#### 问题描述

uni-app 组件（如 `<uni-button>`, `<uni-input>`, `<uni-view>`）不会渲染为标准 HTML 元素，导致常规 CSS 选择器失效。

**错误日志示例**:
```
locator.click: Timeout 30000ms exceeded
- waiting for locator('button:has-text("登录")')
```

#### 解决方案

##### 方案1: 使用 AI 快照引用 (最推荐)

Dev Browser 提供的 AI 快照功能可以稳定定位元素：

```typescript
// 获取页面快照
const snapshot = await client.getAISnapshot();

// 使用快照中的元素引用
await client.selectSnapshotRef("page", "e17"); // e17是登录按钮的引用ID
```

##### 方案2: 使用通用选择器

```typescript
// 错误: 专门针对 button 元素
await page.click('button:has-text("登录")');

// 正确: 包含uni-button
await page.click('button, uni-button:has-text("登录")');

// 更通用: 按文本内容查找
await page.click('text=/登录|Login/i');
await page.click('[class*="login"] >> text=登录');
```

##### 方案3: 使用角色和文本选择器

```typescript
// Playwright 推荐的方式
await page.getByRole('button', { name: /登录/ }).click();

// 或使用文本选择器
await page.getByText(/登录/).first().click();
```

##### 方案4: 封装 uni-app 专用选择器

```typescript
/**
 * uni-app 按钮选择器
 */
function uniButton(text: string | RegExp): string {
  const pattern = typeof text === 'string' ? text : text.source;
  return `uni-button:has-text("${pattern}"), button:has-text("${pattern}"), [class*="btn"]:has-text("${pattern}")`;
}

/**
 * uni-app 输入框选择器
 */
function uniInput(placeholder?: string): string {
  if (placeholder) {
    return `uni-input[placeholder*="${placeholder}"], input[placeholder*="${placeholder}"], [class*="input"] input`;
  }
  return 'uni-input input, input[type="text"], input[type="password"]';
}

// 使用示例
await page.click(uniButton('登录'));
await page.fill(uniInput('请输入密码'), '123456');
```

---

## 完整测试工具类

```typescript
// uni-app-test-utils.ts

import { Page, Locator } from 'playwright';

export class UniAppTestHelper {
  constructor(private page: Page) {}

  /**
   * 等待页面加载完成
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // uni-app 特有的加载指示器
    await this.page.waitForSelector('.uni-loading', { state: 'hidden' }).catch(() => {});
  }

  /**
   * 安全点击按钮
   */
  async clickButton(text: string | RegExp): Promise<void> {
    const pattern = typeof text === 'string' ? new RegExp(text) : text;
    const locator = this.page.locator(
      `uni-button:has-text("${pattern.source}"), button:has-text("${pattern.source}"), [role="button"]:has-text("${pattern.source}")`
    ).first();

    await this.safeClick(locator);
  }

  /**
   * 填写输入框
   */
  async fillInput(placeholder: string, value: string): Promise<void> {
    const locator = this.page.locator(
      `input[placeholder*="${placeholder}"], uni-input [placeholder*="${placeholder}"]`
    ).first();

    await locator.fill(value);
  }

  /**
   * 安全点击 - 自动处理遮罩层
   */
  async safeClick(locator: Locator): Promise<void> {
    try {
      await locator.click({ timeout: 3000 });
    } catch (error) {
      // 检查是否有遮罩层
      const hasMask = await this.page.locator('.uni-mask').count() > 0;
      if (hasMask) {
        // 尝试点击遮罩层上的按钮
        await locator.click({ force: true });
      } else {
        throw error;
      }
    }
  }

  /**
   * 处理确认弹窗
   */
  async handleConfirm(action: 'confirm' | 'cancel' = 'confirm'): Promise<void> {
    const text = action === 'confirm' ? /确定|确认|是/ : /取消|否/;

    // 等待弹窗出现
    await this.page.waitForSelector('.uni-modal', { state: 'visible', timeout: 2000 }).catch(() => {});

    // 点击对应按钮
    const btn = this.page.locator(`.uni-modal button:has-text("${text.source}")`).first();
    if (await btn.count() > 0) {
      await btn.click({ force: true });
      await this.page.waitForSelector('.uni-modal', { state: 'hidden', timeout: 2000 }).catch(() => {});
    }
  }

  /**
   * 等待遮罩层消失
   */
  async waitForMaskGone(timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector('.uni-mask', { state: 'hidden', timeout }).catch(() => {});
  }

  /**
   * 检查是否已登录
   */
  async isLoggedIn(): Promise<boolean> {
    // 检查是否存在退出登录按钮或用户信息
    const logoutBtn = await this.page.locator('text=/退出|登出|logout/i').count();
    const userInfo = await this.page.locator('[class*="user"], [class*="profile"]').count();
    return logoutBtn > 0 || userInfo > 0;
  }

  /**
   * 登录操作
   */
  async login(username: string, password: string): Promise<boolean> {
    await this.fillInput('账号|用户名|手机', username);
    await this.fillInput('密码', password);
    await this.clickButton('登录');

    // 等待登录结果
    await this.page.waitForTimeout(1000);
    return await this.isLoggedIn();
  }

  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    await this.clickButton('退出');
    await this.handleConfirm('confirm');
    await this.waitForMaskGone();
  }
}
```

---

## 测试脚本模板

```typescript
// test-template.ts

import { chromium } from 'playwright';
import { UniAppTestHelper } from './uni-app-test-utils';

async function runTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: './videos' }
  });
  const page = await context.newPage();
  const helper = new UniAppTestHelper(page);

  try {
    // 1. 导航到页面
    await page.goto('http://localhost:5173');
    await helper.waitForPageReady();

    // 2. 登录
    const loginSuccess = await helper.login('admin', '123456');
    if (!loginSuccess) {
      throw new Error('登录失败');
    }

    // 3. 执行测试操作
    // ... 你的测试代码

    // 4. 退出登录
    await helper.logout();

    console.log('测试通过!');
  } catch (error) {
    console.error('测试失败:', error);
    await page.screenshot({ path: `error-${Date.now()}.png` });
  } finally {
    await browser.close();
  }
}

runTest();
```

---

## 常用选择器速查表

| 场景 | 推荐选择器 |
|------|-----------|
| 按钮 | `text=/按钮文本/` 或 AI快照引用 |
| 输入框 | `input[placeholder*="提示文本"]` |
| 弹窗确认 | `.uni-modal button:has-text("确定")` + `force: true` |
| 导航项 | `text=/导航文本/` |
| 列表项 | `.list-item:has-text("关键字")` |
| 带遮罩的元素 | 任何选择器 + `{ force: true }` |

---

## 注意事项清单

编写测试脚本时，请检查以下几点：

- [ ] 是否使用了 `force: true` 处理弹窗按钮？
- [ ] 是否避免了专门针对 `button` 元素的选择器？
- [ ] 是否在操作前等待了页面加载完成？
- [ ] 是否处理了可能的加载遮罩？
- [ ] 是否在关键步骤添加了截图保存？
- [ ] 是否设置了合理的超时时间？
- [ ] 是否优先使用 AI 快照引用？

---

**文档版本**: 1.0
**更新日期**: 2026-02-28
**适用项目**: AITY VIP (uni-app)

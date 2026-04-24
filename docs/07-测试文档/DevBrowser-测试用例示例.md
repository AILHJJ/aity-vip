# Dev Browser 测试用例示例

## 📋 文档概述

本文档提供了 Dev Browser 自动化测试的具体用例示例，涵盖了常见的测试场景和操作，帮助团队成员快速上手编写测试脚本，提高测试效率和质量。

**适用人群**：测试工程师、开发人员、质量保证人员
**文档版本**：v1.0
**更新日期**：2026-02-28

---

## 1. 基础测试用例

### 1.1 登录功能测试

**测试目标**：验证用户能够使用正确的用户名和密码登录系统

**测试脚本**：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到登录页面
    await page.goto('http://localhost:5173/#/pages/login/login');
  });

  test('成功登录', async ({ page }) => {
    // 填写用户名和密码
    await page.fill('[Input:用户名]', 'admin');
    await page.fill('[Input:密码]', '123456');
    
    // 点击登录按钮
    await page.click('[Button:登录]');
    
    // 验证登录成功，页面跳转到首页
    await expect(page).toHaveURL(/.*index/);
    await expect(page.locator('text=欢迎回来')).toBeVisible();
  });

  test('空用户名时显示错误提示', async ({ page }) => {
    // 不填写用户名，直接点击登录
    await page.click('[Button:登录]');
    
    // 验证显示错误提示
    await expect(page.locator('text=请输入用户名')).toBeVisible();
  });

  test('错误密码时显示错误提示', async ({ page }) => {
    // 填写正确的用户名和错误的密码
    await page.fill('[Input:用户名]', 'admin');
    await page.fill('[Input:密码]', 'wrongpassword');
    
    // 点击登录按钮
    await page.click('[Button:登录]');
    
    // 验证显示错误提示
    await expect(page.locator('text=用户名或密码错误')).toBeVisible();
  });

  test('记住密码功能', async ({ page }) => {
    // 填写用户名和密码
    await page.fill('[Input:用户名]', 'admin');
    await page.fill('[Input:密码]', '123456');
    
    // 勾选记住密码
    await page.check('[Checkbox:记住密码]');
    
    // 点击登录按钮
    await page.click('[Button:登录]');
    
    // 验证登录成功
    await expect(page).toHaveURL(/.*index/);
    
    // 退出登录
    await page.click('[Button:退出]');
    
    // 验证回到登录页面，且用户名已记住
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('[Input:用户名]')).toHaveValue('admin');
  });
});
```

### 1.2 注册功能测试

**测试目标**：验证用户能够成功注册新账号

**测试脚本**：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('注册功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到注册页面
    await page.goto('http://localhost:5173/#/pages/register/register');
  });

  test('成功注册', async ({ page }) => {
    // 生成随机用户名
    const username = `testuser_${Math.floor(Math.random() * 10000)}`;
    
    // 填写注册信息
    await page.fill('[Input:用户名]', username);
    await page.fill('[Input:邮箱]', `${username}@example.com`);
    await page.fill('[Input:密码]', 'Password123');
    await page.fill('[Input:确认密码]', 'Password123');
    
    // 勾选同意协议
    await page.check('[Checkbox:同意用户协议]');
    
    // 点击注册按钮
    await page.click('[Button:注册]');
    
    // 验证注册成功，页面跳转到登录页
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('text=注册成功，请登录')).toBeVisible();
  });

  test('密码不一致时显示错误提示', async ({ page }) => {
    // 填写注册信息，密码和确认密码不一致
    await page.fill('[Input:用户名]', 'testuser');
    await page.fill('[Input:邮箱]', 'test@example.com');
    await page.fill('[Input:密码]', 'Password123');
    await page.fill('[Input:确认密码]', 'DifferentPassword');
    
    // 点击注册按钮
    await page.click('[Button:注册]');
    
    // 验证显示错误提示
    await expect(page.locator('text=两次输入的密码不一致')).toBeVisible();
  });

  test('邮箱格式不正确时显示错误提示', async ({ page }) => {
    // 填写注册信息，使用不正确的邮箱格式
    await page.fill('[Input:用户名]', 'testuser');
    await page.fill('[Input:邮箱]', 'invalid-email');
    await page.fill('[Input:密码]', 'Password123');
    await page.fill('[Input:确认密码]', 'Password123');
    
    // 点击注册按钮
    await page.click('[Button:注册]');
    
    // 验证显示错误提示
    await expect(page.locator('text=请输入正确的邮箱格式')).toBeVisible();
  });
});
```

### 1.3 导航测试

**测试目标**：验证页面导航功能正常工作

**测试脚本**：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('导航测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到首页
    await page.goto('http://localhost:5173');
  });

  test('从首页导航到登录页面', async ({ page }) => {
    // 点击登录按钮
    await page.click('[Button:登录]');
    
    // 验证页面跳转到登录页
    await expect(page).toHaveURL(/.*login/);
  });

  test('从首页导航到注册页面', async ({ page }) => {
    // 点击注册按钮
    await page.click('[Button:注册]');
    
    // 验证页面跳转到注册页
    await expect(page).toHaveURL(/.*register/);
  });

  test('从首页导航到关于我们页面', async ({ page }) => {
    // 点击关于我们链接
    await page.click('[Link:关于我们]');
    
    // 验证页面跳转到关于我们页
    await expect(page).toHaveURL(/.*about/);
    await expect(page.locator('text=关于我们')).toBeVisible();
  });

  test('使用面包屑导航', async ({ page }) => {
    // 导航到深层页面
    await page.goto('http://localhost:5173/#/pages/products/detail/1');
    
    // 验证面包屑显示正确
    await expect(page.locator('text=首页 / 产品 / 产品详情')).toBeVisible();
    
    // 点击面包屑中的产品链接
    await page.click('[Link:产品]');
    
    // 验证页面跳转到产品列表页
    await expect(page).toHaveURL(/.*products/);
  });
});
```

---

## 2. 高级测试用例

### 2.1 表单提交测试

**测试目标**：验证复杂表单提交功能

**测试脚本**：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('表单提交测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到表单页面
    await page.goto('http://localhost:5173/#/pages/form/form');
  });

  test('成功提交表单', async ({ page }) => {
    // 填写表单信息
    await page.fill('[Input:姓名]', '测试用户');
    await page.fill('[Input:邮箱]', 'test@example.com');
    await page.selectOption('[Select:性别]', '男');
    await page.fill('[Input:年龄]', '30');
    await page.fill('[Textarea:地址]', '北京市朝阳区');
    await page.check('[Checkbox:同意协议]');
    
    // 点击提交按钮
    await page.click('[Button:提交]');
    
    // 验证提交成功
    await expect(page.locator('text=提交成功')).toBeVisible();
  });

  test('必填字段验证', async ({ page }) => {
    // 不填写任何信息，直接点击提交
    await page.click('[Button:提交]');
    
    // 验证显示多个错误提示
    await expect(page.locator('text=请输入姓名')).toBeVisible();
    await expect(page.locator('text=请输入邮箱')).toBeVisible();
    await expect(page.locator('text=请选择性别')).toBeVisible();
    await expect(page.locator('text=请输入年龄')).toBeVisible();
  });

  test('年龄范围验证', async ({ page }) => {
    // 填写表单信息，年龄超出范围
    await page.fill('[Input:姓名]', '测试用户');
    await page.fill('[Input:邮箱]', 'test@example.com');
    await page.selectOption('[Select:性别]', '男');
    await page.fill('[Input:年龄]', '10'); // 假设最小年龄为18
    await page.fill('[Textarea:地址]', '北京市朝阳区');
    await page.check('[Checkbox:同意协议]');
    
    // 点击提交按钮
    await page.click('[Button:提交]');
    
    // 验证显示年龄范围错误提示
    await expect(page.locator('text=年龄必须在18-60之间')).toBeVisible();
  });
});
```

### 2.2 数据表格测试

**测试目标**：验证数据表格的功能，包括排序、筛选、分页等

**测试脚本**：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('数据表格测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到数据表格页面
    await page.goto('http://localhost:5173/#/pages/table/table');
  });

  test('表格排序功能', async ({ page }) => {
    // 点击姓名列排序
    await page.click('[Button:姓名排序]');
    
    // 验证表格已排序
    const firstRowName = await page.locator('.table-row:first-child .name').textContent();
    const secondRowName = await page.locator('.table-row:nth-child(2) .name').textContent();
    expect(firstRowName.localeCompare(secondRowName)).toBeLessThanOrEqual(0);
  });

  test('表格筛选功能', async ({ page }) => {
    // 输入筛选条件
    await page.fill('[Input:搜索]', '测试');
    await page.click('[Button:搜索]');
    
    // 验证筛选结果
    const rows = await page.locator('.table-row').count();
    expect(rows).toBeGreaterThan(0);
    
    // 验证所有行都包含搜索关键词
    for (let i = 0; i < rows; i++) {
      const rowText = await page.locator(`.table-row:nth-child(${i + 1})`).textContent();
      expect(rowText).toContain('测试');
    }
  });

  test('表格分页功能', async ({ page }) => {
    // 点击第二页
    await page.click('[Button:第2页]');
    
    // 验证当前页码为2
    await expect(page.locator('text=当前第2页')).toBeVisible();
    
    // 验证表格显示第二页数据
    const firstRowId = await page.locator('.table-row:first-child .id').textContent();
    expect(parseInt(firstRowId)).toBeGreaterThan(10); // 假设每页10条数据
  });

  test('表格行操作功能', async ({ page }) => {
    // 点击第一行的编辑按钮
    await page.click('[Button:编辑]', { timeout: 10000 });
    
    // 验证弹出编辑对话框
    await expect(page.locator('text=编辑用户')).toBeVisible();
    
    // 修改用户名
    await page.fill('[Input:用户名]', '修改后的用户名');
    
    // 点击保存按钮
    await page.click('[Button:保存]');
    
    // 验证保存成功
    await expect(page.locator('text=保存成功')).toBeVisible();
  });
});
```

### 2.3 模态框测试

**测试目标**：验证模态框的功能，包括打开、关闭、表单提交等

**测试脚本**：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('模态框测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到模态框页面
    await page.goto('http://localhost:5173/#/pages/modal/modal');
  });

  test('打开和关闭模态框', async ({ page }) => {
    // 点击打开模态框按钮
    await page.click('[Button:打开模态框]');
    
    // 验证模态框已打开
    await expect(page.locator('text=模态框标题')).toBeVisible();
    
    // 点击关闭按钮
    await page.click('[Button:关闭]');
    
    // 验证模态框已关闭
    await expect(page.locator('text=模态框标题')).not.toBeVisible();
  });

  test('在模态框中提交表单', async ({ page }) => {
    // 点击打开模态框按钮
    await page.click('[Button:打开模态框]');
    
    // 填写模态框中的表单
    await page.fill('[Input:模态框输入]', '测试内容');
    
    // 点击提交按钮
    await page.click('[Button:提交]');
    
    // 验证提交成功
    await expect(page.locator('text=提交成功')).toBeVisible();
    
    // 验证模态框已关闭
    await expect(page.locator('text=模态框标题')).not.toBeVisible();
  });

  test('点击模态框外部关闭', async ({ page }) => {
    // 点击打开模态框按钮
    await page.click('[Button:打开模态框]');
    
    // 验证模态框已打开
    await expect(page.locator('text=模态框标题')).toBeVisible();
    
    // 点击模态框外部
    await page.click('.modal-overlay');
    
    // 验证模态框已关闭
    await expect(page.locator('text=模态框标题')).not.toBeVisible();
  });
});
```

---

## 3. 特殊场景测试

### 3.1 文件上传测试

**测试目标**：验证文件上传功能

**测试脚本**：

```javascript
const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('文件上传测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到文件上传页面
    await page.goto('http://localhost:5173/#/pages/upload/upload');
  });

  test('成功上传图片', async ({ page }) => {
    // 准备测试文件路径
    const testFile = path.join(__dirname, 'test-image.png');
    
    // 上传文件
    await page.setInputFiles('[Input:文件上传]', testFile);
    
    // 点击上传按钮
    await page.click('[Button:上传]');
    
    // 验证上传成功
    await expect(page.locator('text=上传成功')).toBeVisible();
    
    // 验证文件已显示
    await expect(page.locator('.uploaded-file')).toBeVisible();
  });

  test('上传文件类型验证', async ({ page }) => {
    // 准备测试文件路径（非图片文件）
    const testFile = path.join(__dirname, 'test-file.txt');
    
    // 上传文件
    await page.setInputFiles('[Input:文件上传]', testFile);
    
    // 点击上传按钮
    await page.click('[Button:上传]');
    
    // 验证显示文件类型错误提示
    await expect(page.locator('text=只能上传图片文件')).toBeVisible();
  });

  test('上传文件大小验证', async ({ page }) => {
    // 准备大文件（假设限制为1MB）
    // 注意：实际测试中需要创建一个大于1MB的文件
    const largeFile = path.join(__dirname, 'large-file.png');
    
    // 上传文件
    await page.setInputFiles('[Input:文件上传]', largeFile);
    
    // 点击上传按钮
    await page.click('[Button:上传]');
    
    // 验证显示文件大小错误提示
    await expect(page.locator('text=文件大小不能超过1MB')).toBeVisible();
  });
});
```

### 3.2 拖放测试

**测试目标**：验证拖放功能

**测试脚本**：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('拖放测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到拖放页面
    await page.goto('http://localhost:5173/#/pages/drag-drop/drag-drop');
  });

  test('拖放元素到目标区域', async ({ page }) => {
    // 获取可拖动元素和目标区域
    const draggable = page.locator('[Drag:可拖动元素]');
    const dropZone = page.locator('[Drop:目标区域]');
    
    // 执行拖放操作
    await draggable.dragTo(dropZone);
    
    // 验证拖放成功
    await expect(dropZone.locator('text=已放入元素')).toBeVisible();
    
    // 验证元素已移动到目标区域
    const draggableInDropZone = await dropZone.locator('[Drag:可拖动元素]').count();
    expect(draggableInDropZone).toBe(1);
  });

  test('拖放多个元素', async ({ page }) => {
    // 获取可拖动元素和目标区域
    const draggables = page.locator('[Drag:可拖动元素]');
    const dropZone = page.locator('[Drop:目标区域]');
    
    // 执行多次拖放操作
    for (let i = 0; i < await draggables.count(); i++) {
      await draggables.nth(i).dragTo(dropZone);
    }
    
    // 验证所有元素都已放入
    await expect(dropZone.locator('text=已放入3个元素')).toBeVisible();
  });
});
```

### 3.3 响应式布局测试

**测试目标**：验证响应式布局在不同设备尺寸下的表现

**测试脚本**：

```javascript
const { test, expect, devices } = require('@playwright/test');

test.describe('响应式布局测试', () => {
  test('桌面端布局', async ({ page }) => {
    // 设置桌面端视口
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 导航到测试页面
    await page.goto('http://localhost:5173');
    
    // 验证桌面端布局元素可见
    await expect(page.locator('[Desktop:桌面菜单]')).toBeVisible();
    await expect(page.locator('[Mobile:移动端菜单]')).not.toBeVisible();
  });

  test('平板端布局', async ({ page }) => {
    // 设置平板端视口
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 导航到测试页面
    await page.goto('http://localhost:5173');
    
    // 验证平板端布局元素可见
    await expect(page.locator('[Tablet:平板菜单]')).toBeVisible();
  });

  test('移动端布局', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 导航到测试页面
    await page.goto('http://localhost:5173');
    
    // 验证移动端布局元素可见
    await expect(page.locator('[Mobile:移动端菜单]')).toBeVisible();
    await expect(page.locator('[Desktop:桌面菜单]')).not.toBeVisible();
    
    // 点击移动端菜单按钮
    await page.click('[Button:菜单]');
    
    // 验证菜单展开
    await expect(page.locator('[Mobile:菜单展开]')).toBeVisible();
  });
});
```

---

## 4. 测试用例设计最佳实践

### 4.1 测试用例命名规范

- **清晰明确**：测试用例名称应清晰描述测试的功能和场景
- **使用动词**：使用动词开头，如 "成功登录"、"验证错误提示"
- **避免模糊**：避免使用"测试登录"这样模糊的名称
- **保持一致**：遵循统一的命名风格

### 4.2 测试用例结构

1. **测试前置条件**：使用 `test.beforeEach` 设置测试环境
2. **测试步骤**：清晰描述测试的每一个步骤
3. **断言**：使用 `expect` 验证测试结果
4. **测试后置条件**：使用 `test.afterEach` 清理测试环境

### 4.3 测试数据管理

- **使用测试数据文件**：将测试数据分离到单独的文件中
- **生成随机数据**：使用随机数据避免测试数据冲突
- **数据清理**：测试完成后清理测试数据
- **数据隔离**：确保测试之间数据隔离

### 4.4 错误处理

- **捕获异常**：使用 try-catch 捕获可能的异常
- **重试机制**：对不稳定的测试添加重试逻辑
- **降级策略**：当 AI 快照定位失败时，使用传统定位方法作为备份

---

## 5. 测试用例执行与管理

### 5.1 执行测试

```bash
# 运行所有测试
npx playwright test

# 运行特定测试文件
npx playwright test tests/e2e/login.spec.js

# 运行特定测试用例
npx playwright test -g "成功登录"

# 以调试模式运行
npx playwright test --debug
```

### 5.2 测试报告

```bash
# 生成测试报告
npx playwright test --reporter=html

# 查看测试报告
npx playwright show-report
```

### 5.3 测试用例管理工具

- **Jira**：用于管理测试用例和缺陷
- **TestRail**：专业的测试管理工具
- **GitHub Issues**：用于跟踪测试相关的问题
- **Excel/Google Sheets**：简单的测试用例管理

---

## 6. 总结

本文档提供了 Dev Browser 自动化测试的具体用例示例，涵盖了从基础到高级的各种测试场景。通过这些示例，团队成员可以快速上手编写测试脚本，提高测试效率和质量。

### 关键要点

1. **使用 AI 快照功能**：利用 `[Button:登录]` 这样的 AI 快照语法定位元素，提高测试的可靠性
2. **合理设计测试用例**：遵循测试用例设计原则，确保测试的有效性和可维护性
3. **处理边界情况**：测试各种边界情况和异常场景
4. **优化测试执行**：使用适当的等待策略，优化测试执行速度
5. **维护测试用例**：定期更新测试用例，确保与应用同步

通过实践这些测试用例示例，团队可以建立高效、可靠的自动化测试体系，为项目质量提供有力保障。

---

**文档维护**：[团队名称]
**最后更新**：2026-02-28
**文档版本**：v1.0
# Skill + Dev Browser 自动化测试方案

## 1. 方案概述

### 1.1 技术演进
- **Playwright MCP**：早期方案，通过工具调用控制浏览器，存在上下文容量限制和执行效率问题
- **Playwright Skill**：通过生成固定测试脚本，提高稳定性和可维护性
- **Dev Browser**：基于Chrome DevTools Protocol的插件，提供更高效的浏览器控制能力

### 1.2 推荐方案
**Skill + Dev Browser 组合**：
- ✅ Playwright Skill 生成可靠、可维护的测试代码
- ✅ Dev Browser 提供优雅的错误处理和调试能力
- ✅ 代码固化后可反复执行，避免AI幻觉
- ✅ 执行过程中的错误可以被精准捕获和修复

## 2. 环境搭建

### 2.1 安装 Dev Browser 插件
在 Claude Code 中执行以下命令：
```bash
# 通过 SSH 安装
/plugin marketplace add sawyerhood/dev-browser
/plugin install dev-browser@sawyerhood/dev-browser

# 或通过 HTTPS 安装
/plugin marketplace add https://github.com/SawyerHood/dev-browser.git
/plugin install dev-browser@sawyerhood/dev-browser
```

**安装后重启 Claude Code**，确保插件生效。

### 2.2 安装 Playwright Skill
- **GitHub 地址**：https://github.com/lackeyjb/playwright-skill
- **使用方法**：在 Claude Code 中加载该 Skill，用于生成 Playwright 测试代码

## 3. 使用方法

### 3.1 生成测试代码（Playwright Skill）

**提示语示例**：
```
使用 Playwright Skill 为 AITY VIP 项目生成登录测试代码
- 访问地址：http://localhost:5173/#/pages/login/login
- 输入账号：admin
- 输入密码：123456
- 点击登录按钮
- 验证是否跳转到首页
- 验证首页标题是否为"首页"
```

**生成的测试代码示例**：
```javascript
const { test, expect } = require('@playwright/test');

test('登录测试', async ({ page }) => {
  // 访问登录页面
  await page.goto('http://localhost:5173/#/pages/login/login');
  
  // 输入账号密码
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  
  // 点击登录按钮
  await page.click('button');
  
  // 验证是否跳转到首页
  await expect(page).toHaveURL('http://localhost:5173/#/pages/index/index');
  
  // 验证首页标题
  await expect(page.locator('.uni-page-head__title')).toHaveText('首页');
});
```

### 3.2 执行测试（Dev Browser）

**提示语示例**：
```
使用 Dev Browser 执行以下测试用例：
1. 打开链接 http://localhost:5173/#/pages/login/login
2. 输入账号：admin
3. 输入密码：123456
4. 点击登录按钮
5. 验证是否跳转到首页
6. 验证首页标题是否为"首页"
```

**执行模式**：
- **Standalone Mode（推荐）**：独立模式，更稳定可靠
- **Extension Mode**：插件模式，可能存在浏览器兼容性问题

## 4. 项目特有测试场景

### 4.1 登录功能测试
- **测试点**：账号密码登录、登录失败处理、记住密码
- **执行步骤**：
  1. 打开登录页面
  2. 输入账号密码
  3. 点击登录按钮
  4. 验证跳转和页面内容

### 4.2 消息功能测试
- **测试点**：消息列表加载、消息详情查看、消息筛选
- **执行步骤**：
  1. 登录系统
  2. 进入消息页面
  3. 验证消息列表加载
  4. 点击消息查看详情
  5. 测试消息筛选功能

### 4.3 讨论功能测试
- **测试点**：创建讨论、讨论详情、评论功能
- **执行步骤**：
  1. 登录系统
  2. 进入创建讨论页面
  3. 输入讨论标题和内容
  4. 提交讨论
  5. 验证讨论详情页面
  6. 测试评论功能

### 4.4 AI投顾测试
- **测试点**：AI投顾页面加载、功能交互
- **执行步骤**：
  1. 登录系统
  2. 进入AI投顾页面
  3. 验证页面加载
  4. 测试功能交互

## 5. 最佳实践

### 5.1 测试用例设计
- **精准描述**：用例描述要具体、明确，避免模糊表述
- **步骤清晰**：每个测试步骤要清晰可执行
- **预期结果明确**：明确验证点和预期结果

### 5.2 执行技巧
- **使用 Standalone Mode**：优先使用独立模式，避免插件兼容性问题
- **监控执行过程**：第一次执行时关注日志，及时发现问题
- **代码固化**：生成的测试代码保存为文件，便于反复执行
- **错误处理**：遇到错误时，分析日志并调整用例或代码

### 5.3 常见问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 页面加载慢导致操作失败 | 在测试代码中添加适当的等待时间 |
| 元素定位失败 | 使用更稳定的选择器，或通过Dev Browser的UID映射 |
| 测试用例执行失败 | 检查用例描述是否精准，调整测试步骤 |
| 上下文容量不足 | 分段执行测试，避免单次执行过多操作 |

## 6. 与传统方案对比

| 方案 | 优势 | 劣势 |
|------|------|------|
| Playwright MCP | 操作灵活 | 上下文占用高，执行慢 |
| Playwright Skill | 代码可维护性高 | 首次执行可能需要多次调整 |
| Dev Browser | 执行速度快，一次成功率高 | 对用例质量要求高 |
| Skill + Dev Browser | 结合两者优势，稳定高效 | 需要一定的学习成本 |

## 7. 应用建议

### 7.1 适合场景
- **系统学习自动化测试**：适合从功能测试转型自动化测试的人员
- **长期维护测试用例**：需要稳定运行的测试团队
- **追求稳定性和可扩展性**：对测试质量有较高要求的项目

### 7.2 实施步骤
1. **环境搭建**：安装Dev Browser插件和Playwright Skill
2. **用例设计**：编写精准的测试用例
3. **代码生成**：使用Playwright Skill生成测试代码
4. **测试执行**：使用Dev Browser执行测试
5. **代码固化**：保存测试代码，便于反复执行
6. **持续优化**：根据执行结果调整用例和代码

## 8. 结论

Skill + Dev Browser 组合是目前AI辅助自动化测试的最佳方案，它结合了Playwright Skill的代码生成能力和Dev Browser的高效执行能力，为AITY VIP项目的自动化测试提供了稳定、可靠的解决方案。

通过这种方案，可以：
- 大幅提高测试效率
- 减少人工测试成本
- 确保测试结果的一致性
- 为项目质量提供有力保障

随着AI技术的不断发展，自动化测试将变得更加智能和高效，为软件开发过程带来更多价值。
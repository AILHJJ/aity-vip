# Dev Browser 入门实战指南

## 1. Dev Browser 简介

### 1.1 什么是 Dev Browser？

Dev Browser 是一个基于 Claude Code 的浏览器自动化插件，它允许你通过自然语言指令控制浏览器，执行各种自动化任务。它的核心优势在于：

- **自然语言控制**：使用普通英语描述你想要执行的操作，无需编写复杂的代码
- **AI 智能定位**：通过 AI 快照功能，智能识别和定位页面元素
- **跨平台支持**：支持 Windows、macOS 和 Linux 系统
- **强大的自动化能力**：可以执行点击、填写表单、导航、截图等多种操作

### 1.2 Dev Browser 与其他测试工具的对比

| 特性 | Dev Browser | Playwright | Selenium |
|------|-------------|------------|----------|
| 学习曲线 | 低（自然语言） | 中（需要编程） | 高（需要编程） |
| 元素定位 | AI 智能定位 | 选择器定位 | 选择器定位 |
| 稳定性 | 高（自适应） | 中（需要维护） | 低（易受页面变化影响） |
| 安装复杂度 | 低（插件安装） | 中（需要配置） | 高（需要驱动） |
| 适用场景 | 快速原型、日常任务 | 专业测试、CI/CD | 传统测试、企业应用 |

## 2. 环境搭建

### 2.1 系统要求

- **操作系统**：Windows 10/11, macOS 10.15+, Linux
- **浏览器**：Google Chrome 90+ 或 Microsoft Edge 90+
- **Claude Code**：最新版本
- **网络连接**：稳定的互联网连接（用于插件安装和更新）

### 2.2 安装步骤

#### 步骤 1：安装 Chrome 浏览器

如果尚未安装 Chrome 浏览器，请从官方网站下载并安装：
[https://www.google.com/chrome/](https://www.google.com/chrome/)

#### 步骤 2：安装 Claude Code

从 Anthropic 官方网站下载并安装 Claude Code：
[https://www.anthropic.com/claude/code](https://www.anthropic.com/claude/code)

#### 步骤 3：安装 Dev Browser 插件

1. 打开 Claude Code
2. 进入插件市场（Plugin Marketplace）
3. 搜索 "dev-browser"
4. 选择 "sawyerhood/dev-browser"
5. 点击 "Install" 按钮进行安装

#### 步骤 4：验证安装

1. 打开 Claude Code
2. 输入 `/dev-browser:help` 命令
3. 如果看到帮助信息，则安装成功

## 3. 基本使用方法

### 3.1 启动 Dev Browser

在 Claude Code 中输入以下命令启动 Dev Browser：

```
/dev-browser:start
```

### 3.2 基本导航

```
/dev-browser:navigate https://www.example.com
```

### 3.3 点击元素

```
/dev-browser:click "登录按钮"
```

### 3.4 填写表单

```
/dev-browser:fill "用户名" "test@example.com"
/dev-browser:fill "密码" "password123"
```

### 3.5 使用自然语言指令生成测试脚本

除了使用具体的命令外，你还可以使用自然语言指令让 Dev Browser 自动生成测试脚本。例如：

```
帮我测试登录功能，输入用户名 admin 和密码 123456，然后点击登录按钮，验证是否登录成功
```

Dev Browser 会分析这个指令，自动生成并执行相应的测试脚本，然后返回测试结果。

### 3.6 截图

```
/dev-browser:screenshot
```

### 3.7 关闭 Dev Browser

```
/dev-browser:stop
```

## 4. 常见场景实战

### 4.1 登录测试

**任务**：测试登录功能

**操作步骤**：

```
/dev-browser:start
/dev-browser:navigate https://your-app.com/login
/dev-browser:fill "用户名" "test@example.com"
/dev-browser:fill "密码" "password123"
/dev-browser:click "登录"
/dev-browser:wait 3
/dev-browser:screenshot
/dev-browser:stop
```

### 4.2 数据采集

**任务**：采集商品列表数据

**操作步骤**：

```
/dev-browser:start
/dev-browser:navigate https://your-app.com/products
/dev-browser:wait 3
/dev-browser:execute "
  const products = Array.from(document.querySelectorAll('.product-item')).map(item => ({
    title: item.querySelector('.product-title').textContent,
    price: item.querySelector('.product-price').textContent,
    link: item.querySelector('a').href
  }));
  return products;
"
/dev-browser:stop
```

### 4.3 表单提交测试

**任务**：测试注册功能

**操作步骤**：

```
/dev-browser:start
/dev-browser:navigate https://your-app.com/register
/dev-browser:fill "用户名" "newuser"
/dev-browser:fill "邮箱" "newuser@example.com"
/dev-browser:fill "密码" "SecurePass123"
/dev-browser:fill "确认密码" "SecurePass123"
/dev-browser:click "同意条款"
/dev-browser:click "注册"
/dev-browser:wait 5
/dev-browser:screenshot
/dev-browser:stop
```

## 5. 故障排除

### 5.1 常见错误及解决方案

| 错误信息 | 可能原因 | 解决方案 |
|---------|---------|--------|
| "Dev Browser service failed to start" | 端口被占用 | 关闭其他可能占用端口的程序，或重启电脑 |
| "Element not found" | 元素尚未加载 | 使用 `/dev-browser:wait` 命令等待页面加载完成 |
| "Permission denied" | 权限不足 | 以管理员身份运行 Claude Code |
| "Connection timeout" | 网络问题 | 检查网络连接，确保可以正常访问目标网站 |

### 5.2 调试技巧

1. **使用截图功能**：在关键步骤后使用 `/dev-browser:screenshot` 查看当前页面状态
2. **使用执行命令**：使用 `/dev-browser:execute` 运行 JavaScript 代码查看页面信息
3. **查看日志**：在 Claude Code 中查看详细的执行日志

## 6. 最佳实践

### 6.1 编写高效的指令

- **具体明确**：提供详细的操作描述，避免模糊不清的指令
- **分步执行**：将复杂任务分解为多个简单步骤
- **添加等待**：在页面加载和操作之间添加适当的等待时间
- **使用AI快照**：利用 `[Button:登录]` 这样的AI快照语法定位元素

### 6.2 测试用例设计

1. **边界测试**：测试输入的边界情况
2. **负面测试**：测试错误输入和异常情况
3. **回归测试**：定期运行测试以确保功能正常
4. **性能测试**：测试页面加载和操作响应时间

### 6.3 团队协作

- **标准化指令**：制定团队统一的指令格式
- **共享测试用例**：将常用测试用例保存在团队知识库中
- **定期培训**：定期组织Dev Browser使用培训
- **反馈机制**：建立问题反馈和解决方案共享机制

## 7. 进阶技巧

### 7.1 自定义脚本

```
/dev-browser:execute "
  // 自定义脚本代码
  function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
  scrollToBottom();
  return 'Scrolled to bottom';
"
```

### 7.2 多步骤自动化

```
/dev-browser:start
// 步骤1: 登录
/dev-browser:navigate https://your-app.com/login
/dev-browser:fill "用户名" "test@example.com"
/dev-browser:fill "密码" "password123"
/dev-browser:click "登录"
/dev-browser:wait 3

// 步骤2: 访问用户中心
/dev-browser:click "用户中心"
/dev-browser:wait 2

// 步骤3: 修改个人信息
/dev-browser:click "编辑资料"
/dev-browser:fill "昵称" "New Nickname"
/dev-browser:click "保存"
/dev-browser:wait 2

// 步骤4: 截图验证
/dev-browser:screenshot
/dev-browser:stop
```

### 7.3 与其他工具集成

- **与 CI/CD 集成**：将 Dev Browser 测试添加到 CI/CD 流程中
- **与测试管理工具集成**：将测试结果同步到测试管理工具
- **与监控工具集成**：设置定期测试监控网站状态

## 8. 自然语言指令最佳实践

### 8.1 指令编写技巧

1. **清晰明确**：
   - 提供详细的测试步骤
   - 明确指定操作的元素和输入值
   - 说明预期的测试结果

2. **分步骤测试**：
   - 将复杂测试拆分为多个简单步骤
   - 每步测试一个具体功能
   - 逐步验证测试结果

3. **使用描述性语言**：
   - 使用元素的功能描述（如"登录按钮"）
   - 避免使用技术术语和CSS选择器
   - 保持指令简洁明了

4. **验证测试结果**：
   - 明确指定预期的测试结果
   - 要求Dev Browser验证页面状态
   - 检查关键元素是否可见

### 8.2 指令示例

#### 示例 1：登录功能测试

**指令**：
```
帮我测试登录功能，输入用户名 admin 和密码 123456，然后点击登录按钮，验证是否登录成功
```

**执行结果**：
- Dev Browser 会导航到登录页面
- 填写用户名和密码
- 点击登录按钮
- 验证页面是否跳转到首页
- 返回测试结果和截图

#### 示例 2：表单提交测试

**指令**：
```
测试表单提交功能，填写姓名为测试用户，邮箱为 test@example.com，选择性别为男，年龄为 30，地址为北京市朝阳区，勾选同意协议，然后点击提交按钮，验证提交成功
```

**执行结果**：
- Dev Browser 会导航到表单页面
- 填写所有表单字段
- 勾选同意协议
- 点击提交按钮
- 验证是否显示提交成功提示
- 返回测试结果和截图

#### 示例 3：数据采集测试

**指令**：
```
帮我采集商品列表页面的前5个商品信息，包括商品名称、价格和链接
```

**执行结果**：
- Dev Browser 会导航到商品列表页面
- 分析页面结构
- 提取前5个商品的信息
- 整理并返回采集结果

### 8.3 注意事项

1. **指令长度**：
   - 保持指令简洁明了
   - 避免过长的指令
   - 复杂测试拆分为多个指令

2. **元素描述**：
   - 使用唯一的元素描述
   - 避免使用模糊的描述
   - 当页面有多个相似元素时，提供更具体的描述

3. **测试环境**：
   - 确保测试环境稳定
   - 确保网络连接正常
   - 确保测试页面可访问

4. **错误处理**：
   - 当测试失败时，检查指令是否清晰
   - 检查页面是否有变化
   - 尝试使用更具体的元素描述

## 9. 资源与参考

### 9.1 官方资源

- [Dev Browser GitHub 仓库](https://github.com/SawyerHood/dev-browser)
- [Claude Code 官方文档](https://docs.anthropic.com/claude/code)
- [Chrome 开发者工具文档](https://developer.chrome.com/docs/devtools/)

### 9.2 学习资源

- [Dev Browser 技术深度解析](DevBrowser-技术深度解析.md)
- [Dev Browser 常见问题解答](DevBrowser-常见问题解答.md)
- [自动化测试培训手册](自动化测试培训手册.md)

### 9.3 社区支持

- [Claude Code 社区论坛](https://community.anthropic.com/)
- [Dev Browser GitHub Issues](https://github.com/SawyerHood/dev-browser/issues)
- [自动化测试社区](https://www.selenium.dev/community/)

## 10. 总结

Dev Browser 是一个强大的浏览器自动化工具，它通过自然语言控制和 AI 智能定位，大大简化了自动化测试的流程。通过本指南的学习，你应该能够：

1. 理解 Dev Browser 的核心概念和优势
2. 搭建完整的 Dev Browser 环境
3. 执行基本的浏览器自动化操作
4. 应对常见的故障和问题
5. 应用最佳实践提高测试效率
6. 使用进阶技巧扩展自动化能力
7. 利用自然语言指令生成测试脚本

随着你对 Dev Browser 的熟悉和使用，你将能够构建更加复杂和强大的自动化测试流程，为项目质量保驾护航。

---

**附录：常用命令速查表**

| 命令 | 功能 | 示例 |
|------|------|------|
| `/dev-browser:start` | 启动 Dev Browser | `/dev-browser:start` |
| `/dev-browser:stop` | 停止 Dev Browser | `/dev-browser:stop` |
| `/dev-browser:navigate` | 导航到指定 URL | `/dev-browser:navigate https://example.com` |
| `/dev-browser:click` | 点击元素 | `/dev-browser:click "登录按钮"` |
| `/dev-browser:fill` | 填写表单 | `/dev-browser:fill "用户名" "test@example.com"` |
| `/dev-browser:screenshot` | 截图 | `/dev-browser:screenshot` |
| `/dev-browser:wait` | 等待指定秒数 | `/dev-browser:wait 3` |
| `/dev-browser:execute` | 执行 JavaScript 代码 | `/dev-browser:execute "return document.title;"` |
| `/dev-browser:help` | 显示帮助信息 | `/dev-browser:help` |
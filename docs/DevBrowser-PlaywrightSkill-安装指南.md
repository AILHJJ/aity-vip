# 🛠️ Dev Browser + Playwright Skill 安装配置指南

## 1. 环境要求检查

### 1.1 系统要求
- **操作系统**: Windows 10/11, macOS, Linux
- **浏览器**: Chrome 90+ 或 Edge 90+
- **Node.js**: 16.0.0+
- **Claude Code**: 最新版本

### 1.2 检查现有环境

```bash
# 检查 Node.js 版本
node --version

# 检查 Chrome 版本
chrome --version

# 检查 Claude Code 是否已安装
# 打开 Claude Code 应用

# 检查 Playwright 安装状态
npm list playwright
```

### 1.3 现状检查结果

✅ **Playwright**: 已安装（版本 1.58.2）
❌ **Dev Browser 插件**: 未安装
❌ **Playwright Skill**: 未加载

## 2. Dev Browser 插件安装

### 2.1 通过 Claude Code 插件市场安装

1. **打开 Claude Code** 应用
2. **进入插件市场**：
   - 点击左侧边栏的 "插件" 图标
   - 或使用快捷键 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (macOS)，输入 "插件市场"
3. **搜索 Dev Browser**：
   - 在搜索框中输入 "dev-browser"
   - 找到 `sawyerhood/dev-browser` 插件
4. **安装插件**：
   - 点击 "添加" 按钮
   - 等待安装完成
5. **验证安装**：
   - 安装后会显示 "已安装" 状态
   - 重启 Claude Code 确保插件生效

### 2.2 手动安装（备用方法）

如果插件市场安装失败，可以使用手动安装方法：

```bash
# 通过 SSH 安装
/plugin marketplace add sawyerhood/dev-browser
/plugin install dev-browser@sawyerhood/dev-browser

# 或通过 HTTPS 安装
/plugin marketplace add https://github.com/SawyerHood/dev-browser.git
/plugin install dev-browser@sawyerhood/dev-browser
```

### 2.3 验证 Dev Browser 安装

在 Claude Code 中执行以下命令：

```bash
/dev-browser help
```

如果安装成功，会显示 Dev Browser 的帮助信息。

## 3. Playwright Skill 安装

### 3.1 从 GitHub 加载

1. **打开 Claude Code** 应用
2. **进入 Skills 管理**：
   - 点击左侧边栏的 "Skills" 图标
   - 或使用快捷键 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (macOS)，输入 "Skills"
3. **添加 Skill**：
   - 点击 "添加 Skill" 按钮
   - 选择 "从 GitHub 加载"
   - 输入 GitHub 仓库地址：`https://github.com/yourusername/playwright-skill`
   - 点击 "加载"
4. **配置 Skill**：
   - 为 Skill 命名："Playwright Skill"
   - 选择适当的分类
   - 保存配置

### 3.2 验证 Playwright Skill 安装

在 Claude Code 中执行以下命令：

```bash
/playwright-skill help
```

如果安装成功，会显示 Playwright Skill 的帮助信息。

## 4. 浏览器配置

### 4.1 检查 Chrome 安装

```bash
# Windows
where chrome

# macOS
which chrome

# Linux
which google-chrome
```

### 4.2 配置 Chrome 路径

如果 Chrome 不在默认路径，需要在 Playwright 配置中指定：

```javascript
// playwright.config.js
module.exports = {
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' // Windows 示例
        // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // macOS 示例
        // executablePath: '/usr/bin/google-chrome' // Linux 示例
      },
    },
  ],
};
```

### 4.3 验证浏览器可访问性

```bash
# 测试 Chrome 启动
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --version

# 测试 Playwright 能否启动浏览器
npx playwright test --headed
```

## 5. 环境验证测试

### 5.1 基本功能测试

创建一个测试文件 `test-dev-browser.js`：

```javascript
// test-dev-browser.js
const { chromium } = require('playwright');

async function testDevBrowser() {
  console.log('测试 Dev Browser 环境...');
  
  try {
    // 启动浏览器
    const browser = await chromium.launch({
      headless: false,
      executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' // 根据实际路径修改
    });
    
    const page = await browser.newPage();
    
    // 访问测试页面
    await page.goto('http://localhost:5173');
    console.log('成功访问本地服务器');
    
    // 截图
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('成功截图');
    
    // 关闭浏览器
    await browser.close();
    console.log('测试完成，环境配置正确！');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testDevBrowser();
```

执行测试：

```bash
node test-dev-browser.js
```

### 5.2 Dev Browser 功能测试

在 Claude Code 中执行以下命令：

```bash
/dev-browser open http://localhost:5173
```

如果 Dev Browser 正常工作，会打开浏览器并访问指定 URL。

### 5.3 Playwright Skill 功能测试

在 Claude Code 中执行以下命令：

```bash
/playwright-skill generate "为 AITY VIP 项目生成登录测试代码，访问 http://localhost:5173/#/pages/login/login，输入账号 admin，密码 123456，点击登录按钮，验证跳转到首页"
```

如果 Playwright Skill 正常工作，会生成测试代码。

## 6. 常见问题与解决方案

### 6.1 Dev Browser 安装失败

| 问题 | 解决方案 |
|------|----------|
| **插件市场访问失败** | 检查网络连接，使用 HTTPS 方式安装 |
| **权限不足** | 以管理员身份运行 Claude Code |
| **版本不兼容** | 更新 Claude Code 到最新版本 |

### 6.2 Playwright Skill 加载失败

| 问题 | 解决方案 |
|------|----------|
| **GitHub 访问失败** | 检查网络连接，使用代理或镜像 |
| **仓库不存在** | 确认 GitHub 仓库地址正确 |
| **权限不足** | 确保有 GitHub 访问权限 |

### 6.3 浏览器配置问题

| 问题 | 解决方案 |
|------|----------|
| **浏览器未找到** | 检查 Chrome 安装路径，更新配置 |
| **浏览器启动失败** | 检查 Chrome 版本，更新到最新版本 |
| **权限不足** | 以管理员身份运行测试 |

## 7. 环境配置完成验证

### 7.1 验证清单

- [ ] Dev Browser 插件已安装
- [ ] Playwright Skill 已加载
- [ ] Chrome 浏览器已安装并可访问
- [ ] Playwright 配置正确
- [ ] 基本功能测试通过
- [ ] Dev Browser 功能测试通过
- [ ] Playwright Skill 功能测试通过

### 7.2 验证命令

```bash
# 综合验证命令
node -e "
const { chromium } = require('playwright');
(async () => {
  console.log('=== 环境验证开始 ===');
  
  // 测试浏览器启动
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  });
  console.log('✅ 浏览器启动成功');
  
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  console.log('✅ 页面访问成功');
  
  const title = await page.title();
  console.log('✅ 页面标题:', title);
  
  await browser.close();
  console.log('✅ 浏览器关闭成功');
  
  console.log('=== 环境验证完成 ===');
  console.log('Dev Browser + Playwright Skill 环境配置正确！');
})();
"
```

## 8. 后续使用指南

### 8.1 基本使用流程

1. **生成测试代码**：使用 Playwright Skill 生成测试代码
2. **执行测试**：使用 Dev Browser 执行测试
3. **分析结果**：查看测试执行结果
4. **优化测试**：根据结果调整测试代码

### 8.2 推荐使用场景

- **新功能测试**：快速生成测试代码验证新功能
- **回归测试**：确保现有功能不受影响
- **Bug 修复验证**：验证 Bug 是否彻底修复
- **跨浏览器测试**：在不同浏览器中验证功能

### 8.3 最佳实践

- **定期更新**：保持 Dev Browser 和 Playwright Skill 为最新版本
- **代码固化**：将生成的测试代码保存为文件，便于重复执行
- **参数化测试**：使用数据驱动的测试方法
- **错误处理**：添加适当的错误处理和重试机制

## 9. 总结

通过本指南，您应该已经成功安装并配置了 Dev Browser 插件和 Playwright Skill，为 AITY VIP 项目的自动化测试做好了准备。

**核心步骤**：
1. 安装 Dev Browser 插件
2. 加载 Playwright Skill
3. 配置 Chrome 浏览器
4. 验证环境配置
5. 开始使用自动化测试

现在您可以使用 Skill + Dev Browser 组合进行高效的自动化测试，提高测试效率和质量！
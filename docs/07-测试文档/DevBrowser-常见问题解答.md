# Dev Browser 常见问题解答

## 📋 文档概述

本文档汇总了使用 Dev Browser 过程中常见的问题和解决方案，帮助团队成员快速排查和解决问题，提高自动化测试的效率和可靠性。

**适用人群**：测试工程师、开发人员、技术支持人员
**文档版本**：v1.0
**更新日期**：2026-02-28

---

## 1. 安装与配置问题

### 1.1 Dev Browser 安装失败

**症状**：
- 插件市场无法访问
- 安装过程中断
- 安装后无法使用

**解决方案**：

1. **检查网络连接**
   ```bash
   # 测试网络连接
   ping github.com
   ```

2. **使用 HTTPS 方式安装**
   ```bash
   /plugin marketplace add https://github.com/SawyerHood/dev-browser.git
   /plugin install dev-browser@sawyerhood/dev-browser
   ```

3. **以管理员身份运行 Claude Code**
   - 右键 Claude Code → 以管理员身份运行
   - 确认 UAC 提示

4. **更新 Claude Code**
   - 检查并更新到最新版本

### 1.2 Chrome 浏览器启动失败

**症状**：
- 测试执行时报错：`browserType.launch: Failed to launch chromium`
- Chrome 无法启动

**解决方案**：

1. **验证 Chrome 路径**
   ```bash
   Test-Path "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"
   ```

2. **检查 Chrome 版本**
   ```bash
   "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe" --version
   ```

3. **更新 Playwright 配置**
   ```javascript
   // playwright.config.js
   executablePath: 'D:\\your-mcp-proxy\\AITY_VIP\\chrome-win64\\chrome.exe'
   ```

4. **检查防火墙设置**
   - 确保 Chrome 可以访问网络
   - 添加 Chrome 到防火墙白名单

### 1.3 端口被占用

**症状**：
- 开发服务器启动失败
- 测试无法访问页面
- 错误信息：`Port 5173 is already in use`

**解决方案**：

1. **查找占用端口的进程**
   ```bash
   netstat -ano | findstr :5173
   ```

2. **停止占用进程**
   ```bash
   taskkill /F /PID [PID]
   ```

3. **修改端口配置**
   - 修改 `vite.config.js` 中的端口
   - 更新 `playwright.config.js` 中的 URL

### 1.4 权限不足

**症状**：
- 安装失败：权限错误
- 测试执行失败：访问被拒绝
- Chrome 启动失败：权限不足

**解决方案**：

1. **以管理员身份运行**
   - 右键 Claude Code → 以管理员身份运行
   - 右键终端 → 以管理员身份运行

2. **检查文件权限**
   ```bash
   # 检查目录权限
   icacls "D:\your-mcp-proxy\AITY_VIP\chrome-win64"
   
   # 如果需要，添加权限
   icacls "D:\your-mcp-proxy\AITY_VIP\chrome-win64" /grant Users:F
   ```

3. **检查 UAC 设置**
   - 确保允许管理员权限
   - 调整 UAC 级别

---

## 2. 元素定位问题

### 2.1 元素定位失败

**症状**：
- 测试报错：`element not found`
- AI 快照无法识别元素
- 元素引用无效

**解决方案**：

1. **检查页面加载状态**
   ```javascript
   // 等待页面完全加载
   await page.waitForLoadState('networkidle');
   ```

2. **使用更具体的引用**
   ```javascript
   // 原引用
   await page.click('[Button:登录]');
   
   // 更具体的引用
   await page.click('[Button:用户登录]');
   ```

3. **检查元素可见性**
   ```javascript
   // 等待元素可见
   await page.waitFor('[Button:登录]', { state: 'visible' });
   ```

4. **使用传统方法作为备份**
   ```javascript
   try {
     await page.click('[Button:登录]');
   } catch (error) {
     // 降级到传统方法
     await page.click('#login-button');
   }
   ```

### 2.2 元素识别准确率低

**症状**：
- 定位到错误的元素
- 元素识别不稳定
- 相同元素有时能识别有时不能

**解决方案**：

1. **提供更清晰的元素描述**
   ```javascript
   // 模糊描述
   await page.click('[Button:提交]');
   
   // 更清晰的描述
   await page.click('[Button:确认提交订单]');
   ```

2. **增加元素等待时间**
   ```javascript
   // 增加等待时间
   await page.waitFor('[Button:登录]', { timeout: 10000 });
   ```

3. **检查页面是否有遮挡**
   - 检查是否有弹窗、遮罩层等遮挡元素
   - 处理页面加载动画

4. **使用元素截图验证**
   ```javascript
   // 保存元素截图
   const element = await page.locator('[Button:登录]');
   await element.screenshot({ path: 'element.png' });
   ```

### 2.3 动态元素处理

**症状**：
- 动态生成的元素无法识别
- 元素在页面加载后才出现
- 元素位置或内容动态变化

**解决方案**：

1. **等待元素出现**
   ```javascript
   // 等待元素出现
   await page.waitFor('[Button:加载更多]');
   ```

2. **处理加载状态**
   ```javascript
   // 等待加载完成
   await page.waitFor('[Spinner:加载中]', { state: 'hidden' });
   ```

3. **使用重试机制**
   ```javascript
   // 重试定位元素
   async function retryLocator(page, selector, maxRetries = 3) {
     let retries = 0;
     while (retries < maxRetries) {
       try {
         await page.click(selector);
         return true;
       } catch (error) {
         retries++;
         await page.waitForTimeout(1000);
       }
     }
     return false;
   }
   ```

---

## 3. 执行性能问题

### 3.1 执行速度缓慢

**症状**：
- 测试执行时间过长
- 元素定位耗时高
- 页面加载缓慢

**解决方案**：

1. **减少截图次数**
   - 批量处理多个元素操作
   - 避免频繁的页面导航

2. **使用缓存**
   ```javascript
   // 启用缓存
   process.env.DEV_BROWSER_CACHE = 'true';
   ```

3. **优化测试脚本**
   - 减少不必要的页面刷新
   - 避免重复的元素定位

4. **使用并行执行**
   ```javascript
   // playwright.config.js
   workers: process.env.CI ? 1 : 4,
   ```

### 3.2 内存使用过高

**症状**：
- 测试过程中内存增长
- 浏览器崩溃
- 系统资源不足

**解决方案**：

1. **定期清理缓存**
   ```javascript
   // 清理缓存
   await page.context().clearCookies();
   ```

2. **限制并发数**
   ```javascript
   // 限制并发数
   workers: 2,
   ```

3. **优化截图大小**
   ```javascript
   // 限制截图大小
   await page.screenshot({ 
     path: 'screenshot.png',
     fullPage: false
   });
   ```

4. **使用无头模式**
   ```javascript
   // 使用无头模式
   headless: true,
   ```

---

## 4. 兼容性问题

### 4.1 跨浏览器兼容性

**症状**：
- 在某些浏览器中测试失败
- 元素定位在不同浏览器中表现不一致
- 视觉识别在不同浏览器中准确率不同

**解决方案**：

1. **使用浏览器特定配置**
   ```javascript
   // playwright.config.js
   projects: [
     {
       name: 'chromium',
       use: { ...devices['Desktop Chrome'] },
     },
     {
       name: 'firefox',
       use: { ...devices['Desktop Firefox'] },
     },
     {
       name: 'webkit',
       use: { ...devices['Desktop Safari'] },
     },
   ],
   ```

2. **针对不同浏览器使用不同定位策略**
   ```javascript
   async function login(page, browserName) {
     if (browserName === 'firefox') {
       // Firefox 特定处理
       await page.click('#login-button');
     } else {
       // 其他浏览器
       await page.click('[Button:登录]');
     }
   }
   ```

3. **建立浏览器兼容性测试矩阵**
   - 记录不同浏览器的测试结果
   - 针对特定浏览器的问题制定解决方案

### 4.2 响应式布局问题

**症状**：
- 在不同屏幕尺寸下测试失败
- 元素在移动设备上无法识别
- 布局变化导致元素定位失败

**解决方案**：

1. **测试不同设备尺寸**
   ```javascript
   // 测试移动设备
   use: {
     ...devices['iPhone 13'],
   },
   ```

2. **使用相对定位**
   - 避免依赖绝对位置
   - 使用元素关系定位

3. **处理响应式元素**
   ```javascript
   // 检查元素是否可见
   const isVisible = await page.isVisible('[Button:菜单]');
   if (isVisible) {
     await page.click('[Button:菜单]');
     await page.click('[Button:登录]');
   } else {
     await page.click('[Button:登录]');
   }
   ```

---

## 5. 技术问题

### 5.1 WebSocket 连接失败

**症状**：
- 与 Chrome 扩展通信失败
- 错误信息：`WebSocket connection failed`
- 无法控制浏览器

**解决方案**：

1. **检查网络设置**
   - 确保防火墙允许 WebSocket 连接
   - 检查网络代理设置

2. **重启 Chrome 扩展**
   - 关闭并重新打开 Chrome 浏览器
   - 重新加载扩展

3. **检查端口占用**
   ```bash
   netstat -ano | findstr :9222
   ```

4. **重新安装 Chrome 扩展**
   - 卸载现有扩展
   - 重新安装扩展

### 5.2 AI 模型加载失败

**症状**：
- 视觉识别功能不可用
- 错误信息：`AI model load failed`
- 元素定位退回到传统方法

**解决方案**：

1. **检查网络连接**
   - 确保可以访问模型服务器
   - 检查网络带宽

2. **清理模型缓存**
   ```bash
   # 清理模型缓存
   Remove-Item "~\.claude\skills\dev-browser\models" -Recurse
   ```

3. **重新安装 Dev Browser**
   - 卸载并重新安装 Dev Browser Skill
   - 重新下载模型

### 5.3 Playwright 依赖问题

**症状**：
- 测试执行失败
- 错误信息：`Playwright not installed`
- 缺少浏览器驱动

**解决方案**：

1. **安装 Playwright**
   ```bash
   npm install playwright
   ```

2. **安装浏览器驱动**
   ```bash
   npx playwright install
   ```

3. **检查依赖版本**
   ```bash
   npm list playwright
   ```

4. **更新依赖**
   ```bash
   npm update playwright
   ```

---

## 6. 最佳实践

### 6.1 测试脚本编写

1. **使用语义化引用**
   - 描述元素的功能和用途
   - 避免使用技术细节

2. **添加适当的等待**
   - 等待页面加载
   - 等待元素出现
   - 等待操作完成

3. **错误处理**
   - 捕获和处理异常
   - 提供降级方案
   - 记录详细日志

4. **模块化设计**
   - 封装常用操作
   - 使用页面对象模式
   - 分离测试数据和逻辑

### 6.2 性能优化

1. **减少网络请求**
   - 缓存测试数据
   - 避免重复请求

2. **优化截图策略**
   - 只在必要时截图
   - 限制截图大小

3. **并行执行**
   - 同时测试多个场景
   - 利用多核处理器

4. **资源管理**
   - 及时关闭浏览器
   - 清理临时文件

### 6.3 维护策略

1. **定期更新**
   - 更新 Dev Browser
   - 更新 Playwright
   - 更新 Chrome 浏览器

2. **测试维护**
   - 定期运行测试
   - 及时修复失败的测试
   - 更新元素引用

3. **文档维护**
   - 记录问题和解决方案
   - 更新测试文档
   - 分享经验和技巧

---

## 7. 高级故障排除

### 7.1 详细日志分析

1. **启用调试日志**
   ```bash
   # 设置环境变量
   $env:DEV_BROWSER_DEBUG = 'true'
   ```

2. **分析日志文件**
   - 查看 `~/.claude/skills/dev-browser/logs` 目录
   - 分析错误信息和堆栈跟踪

3. **网络抓包**
   ```bash
   # 使用 Fiddler 或 Wireshark 抓包
   # 分析网络请求和响应
   ```

### 7.2 远程调试

1. **启用 Chrome 远程调试**
   ```bash
   "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe" --remote-debugging-port=9222
   ```

2. **连接到调试端口**
   - 访问 `http://localhost:9222`
   - 检查浏览器状态和控制台错误

3. **使用 Playwright 调试器**
   ```bash
   npx playwright test --debug
   ```

### 7.3 性能分析

1. **使用 Chrome DevTools**
   - 分析页面加载性能
   - 检查 JavaScript 执行时间

2. **监控系统资源**
   ```bash
   # 监控内存使用
   Get-Process chrome | Select-Object Name, WorkingSet
   ```

3. **分析测试执行时间**
   ```javascript
   // 测量执行时间
   const startTime = Date.now();
   // 执行操作
   const endTime = Date.now();
   console.log(`执行时间: ${endTime - startTime}ms`);
   ```

---

## 8. 联系支持

### 8.1 技术支持

如果遇到无法解决的问题，可以通过以下方式获取支持：

- **团队技术支持**：[团队邮箱]
- **问题跟踪系统**：[问题跟踪链接]
- **GitHub Issues**：[Dev Browser GitHub 仓库]

### 8.2 问题报告

提交问题报告时，请提供以下信息：

1. **环境信息**：
   - 操作系统版本
   - Chrome 浏览器版本
   - Dev Browser 版本
   - Playwright 版本

2. **问题描述**：
   - 问题的详细描述
   - 复现步骤
   - 预期结果和实际结果

3. **日志和截图**：
   - 错误日志
   - 相关截图
   - 测试脚本

4. **已尝试的解决方案**：
   - 已尝试的解决方法
   - 结果如何

---

## 9. 总结

Dev Browser 是一个强大的浏览器自动化工具，通过 AI 快照功能提供了智能的元素定位能力。虽然在使用过程中可能会遇到各种问题，但通过本文档提供的解决方案，大多数问题都可以得到快速解决。

### 关键要点

1. **安装配置**：确保环境正确配置，包括 Chrome 浏览器、Playwright 和网络连接
2. **元素定位**：使用语义化引用，合理处理动态元素和响应式布局
3. **性能优化**：减少截图次数，使用缓存，优化测试脚本
4. **兼容性**：测试不同浏览器和设备，处理兼容性问题
5. **故障排除**：使用日志分析、远程调试等高级技术解决复杂问题

通过遵循最佳实践和及时解决问题，Dev Browser 可以成为自动化测试的有力工具，提高测试效率和质量。

---

**文档维护**：[团队名称]
**最后更新**：2026-02-28
**文档版本**：v1.0

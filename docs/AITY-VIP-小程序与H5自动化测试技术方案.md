# AITY VIP-小程序与H5自动化测试技术方案

## 1. 项目概述

### 1.1 项目信息
- **项目名称**：AITY VIP投研内部分享系统
- **技术栈**：uni-app（Vue 3 + Vite）
- **发布平台**：H5、微信小程序
- **项目目录**：`d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2`

### 1.2 核心功能模块
- **登录系统**：账号密码登录
- **消息中心**：消息列表、消息详情、消息筛选
- **讨论功能**：创建讨论、讨论详情、参与讨论
- **AI投顾**：AI投顾页面、功能交互
- **用户管理**：用户信息、权限管理
- **数据市场**：数据展示、筛选

## 2. 测试环境搭建

### 2.1 项目依赖

**已配置依赖**：
- `@playwright/test`：H5自动化测试
- `@dcloudio/uni-automator`：小程序自动化测试

**环境检查**：
```bash
# 进入项目目录
cd d:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2

# 检查依赖
npm list @playwright/test @dcloudio/uni-automator
```

### 2.2 H5测试环境

**配置文件**：
- 已存在 `playwright.config.js`，配置了测试目录、浏览器、报告等
- 测试目录：`../tests/e2e`

**启动方式**：
```bash
# 启动H5开发服务器
npm run dev:h5

# 运行Playwright测试
npx playwright test
```

### 2.3 小程序测试环境

**配置步骤**：
1. 安装微信开发者工具并登录
2. 开启服务端口：设置 → 安全设置 → 服务端口
3. 构建小程序：`npm run build:mp-weixin`
4. 运行测试：`npx uni-automator test --platform mp-weixin`

## 3. 测试用例设计

### 3.1 H5测试用例

**测试目录结构**：
```
tests/e2e/
├── specs/                 # 测试用例
│   ├── login/             # 登录相关测试
│   ├── messages/          # 消息相关测试
│   ├── discussions/       # 讨论相关测试
│   ├── ai-advisor/        # AI投顾相关测试
│   └── user-management/   # 用户管理相关测试
├── setup/                 # 测试设置
└── reports/               # 测试报告
```

**核心测试用例**：

1. **登录功能测试**
   - 账号密码登录
   - 登录失败处理
   - 记住密码功能

2. **消息功能测试**
   - 消息列表加载
   - 消息详情查看
   - 消息筛选功能（按类型、时间、标签）
   - 消息搜索功能

3. **讨论功能测试**
   - 创建讨论
   - 讨论列表查看
   - 讨论详情查看
   - 参与讨论（评论、点赞）

4. **AI投顾测试**
   - AI投顾页面加载
   - 功能交互测试
   - 响应式布局测试

5. **用户管理测试**
   - 用户信息查看
   - 权限验证
   - 个人设置修改

**示例测试用例**：
```javascript
// tests/e2e/specs/login/login.spec.js
const { test, expect } = require('@playwright/test');

test('用户登录成功测试', async ({ page }) => {
  // 访问登录页面
  await page.goto('http://localhost:5173/#/pages/login/login');
  
  // 输入账号密码
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  
  // 点击登录按钮
  await page.click('button');
  
  // 验证登录成功，跳转到首页
  await expect(page).toHaveURL('http://localhost:5173/#/pages/index/index');
});
```

### 3.2 小程序测试用例

**测试目录结构**：
```
tests/mini-program/
├── specs/                 # 测试用例
│   ├── login.test.js      # 登录测试
│   ├── messages.test.js   # 消息测试
│   └── discussions.test.js # 讨论测试
└── utils/                 # 工具函数
```

**核心测试用例**：

1. **小程序启动测试**
   - 小程序正常启动
   - 启动页显示
   - 权限申请处理

2. **页面导航测试**
   - 底部导航栏切换
   - 页面间跳转
   - 返回功能

3. **功能测试**
   - 与H5测试场景相同
   - 重点测试小程序特有功能

**示例测试用例**：
```javascript
// tests/mini-program/specs/login.test.js
const automator = require('@dcloudio/uni-automator');

describe('小程序登录测试', () => {
  let page;
  
  before(async () => {
    // 启动小程序
    page = await automator.launch({
      projectPath: 'd:\\your-mcp-proxy\\AITY_VIP\\aity-uni-app-v2',
      cliPath: 'C:\\Program Files (x86)\\Tencent\\WeChat Web Developer Tools\\cli.bat'
    });
  });
  
  it('登录功能测试', async () => {
    // 进入登录页面
    await page.navigateTo('/pages/login/login');
    
    // 输入账号密码
    await page.input('input[type="text"]', 'admin');
    await page.input('input[type="password"]', '123456');
    
    // 点击登录按钮
    await page.click('button');
    
    // 验证登录成功，跳转到首页
    await page.waitForNavigation();
    const currentPage = await page.getCurrentPage();
    expect(currentPage.path).toBe('/pages/index/index');
  });
  
  after(async () => {
    // 关闭小程序
    await page.close();
  });
});
```

## 4. 自动化测试执行

### 4.1 本地测试流程

**H5测试**：
1. 启动开发服务器：`npm run dev:h5`
2. 运行测试：`npx playwright test`
3. 查看测试报告：`npx playwright show-report`

**小程序测试**：
1. 构建小程序：`npm run build:mp-weixin`
2. 运行测试：`npx uni-automator test --platform mp-weixin`

### 4.2 CI/CD集成

**GitHub Actions配置**：
- 已存在 `.github/workflows/e2e-tests.yml` 文件
- 配置了H5测试和构建流程

**执行流程**：
1. 代码提交到 `main` 或 `develop` 分支时触发
2. 安装依赖和Playwright浏览器
3. 运行H5自动化测试
4. 构建小程序（可选）
5. 上传测试报告

## 5. 性能测试

### 5.1 H5性能测试

**使用Lighthouse**：
```bash
# 安装Lighthouse
npm install -g lighthouse

# 运行性能测试
lighthouse http://localhost:5173 --output=html --output-path=./tests/performance/report.html
```

**性能指标**：
- 首次内容绘制（FCP）
- 最大内容绘制（LCP）
- 累积布局偏移（CLS）
- 首次输入延迟（FID）
- 最大输入延迟（TTI）

### 5.2 小程序性能测试

**使用微信开发者工具**：
1. 打开微信开发者工具
2. 导入小程序项目
3. 进入性能面板
4. 运行性能分析

**性能指标**：
- 启动时间
- 页面加载时间
- 内存使用
- 网络请求

## 6. 测试数据管理

### 6.1 测试账号

**已配置测试账号**：
- 管理员账号：`admin` / `123456`
- 普通用户账号：`user` / `123456`

### 6.2 测试数据

**后端测试数据**：
- 已存在测试数据脚本：`backend/scripts/create-complete-test-data.js`
- 包含消息、讨论等测试数据

**前端测试数据**：
- 本地存储测试数据
- Mock数据（用于网络请求模拟）

## 7. 最佳实践

### 7.1 测试用例编写
- 使用页面对象模式封装页面操作
- 编写独立、可重复的测试用例
- 覆盖核心功能和边界情况
- 使用参数化测试提高覆盖率

### 7.2 测试执行
- 定期运行测试（本地和CI）
- 分析测试失败原因
- 及时修复测试用例
- 维护测试数据

### 7.3 性能优化
- 使用Lighthouse定期评估性能
- 优化首屏加载时间
- 减少网络请求
- 优化资源加载

## 8. 项目特有测试场景

### 8.1 Markdown渲染功能测试
- 测试Markdown编辑器
- 测试Markdown渲染效果
- 测试不同主题切换

### 8.2 消息筛选系统测试
- 测试三级筛选功能
- 测试筛选条件组合
- 测试筛选结果准确性

### 8.3 AI投顾功能测试
- 测试AI投顾页面加载
- 测试功能交互
- 测试响应式布局

## 9. 测试报告与监控

### 9.1 测试报告
- Playwright HTML报告
- JSON格式报告（用于CI集成）
- 性能测试报告

### 9.2 监控机制
- CI/CD构建状态监控
- 测试覆盖率监控
- 性能指标监控

## 10. 结论与后续计划

### 10.1 当前状态
- ✅ Playwright配置完成
- ✅ 基础测试用例框架搭建
- ✅ CI/CD集成

### 10.2 后续计划
1. **完善测试用例**：
   - 增加更多边界情况测试
   - 覆盖所有核心功能
   - 优化测试用例结构

2. **扩展测试类型**：
   - 增加视觉回归测试
   - 增加API测试
   - 增加性能测试

3. **团队协作**：
   - 培训团队成员使用自动化测试
   - 建立测试用例维护流程
   - 定期 review 测试代码

4. **持续优化**：
   - 优化测试执行速度
   - 提高测试稳定性
   - 减少测试维护成本

通过本方案的实施，可以确保AITY VIP项目在H5和小程序平台上的质量，提高发布效率，为用户提供更稳定、优质的产品体验。
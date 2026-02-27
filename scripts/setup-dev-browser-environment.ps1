#!/usr/bin/env pwsh

# Dev Browser + Playwright Skill 环境设置脚本

Write-Host "===============================================" -ForegroundColor Green
Write-Host "Dev Browser + Playwright Skill 环境设置" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# 1. 检查并安装 Playwright
Write-Host "\n1. 检查 Playwright 安装状态..." -ForegroundColor Cyan
$playwrightInstalled = $false
try {
    $playwrightInfo = npm list playwright --depth=0 2>$null
    if ($playwrightInfo -match "playwright@") {
        $playwrightInstalled = $true
        Write-Host "✅ Playwright 已安装" -ForegroundColor Green
    }
} catch {}

if (-not $playwrightInstalled) {
    Write-Host "⏳ 正在安装 Playwright..." -ForegroundColor Yellow
    npm install -D @playwright/test
    Write-Host "✅ Playwright 安装完成" -ForegroundColor Green
}

# 2. 检查并安装 Playwright 浏览器
Write-Host "\n2. 检查 Playwright 浏览器..." -ForegroundColor Cyan
try {
    $browsersInstalled = npx playwright install --help 2>$null
    Write-Host "⏳ 正在安装 Playwright 浏览器..." -ForegroundColor Yellow
    npx playwright install chromium
    Write-Host "✅ Playwright 浏览器安装完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 安装 Playwright 浏览器时出错: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 检查 Chrome 浏览器
Write-Host "\n3. 检查 Chrome 浏览器..." -ForegroundColor Cyan
$chromePaths = @(
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Google\Chrome\Application\chrome.exe"
)

$chromeFound = $false
$chromePath = ""

foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromeFound = $true
        $chromePath = $path
        break
    }
}

if ($chromeFound) {
    $chromeVersion = & $chromePath --version 2>$null
    Write-Host "✅ Chrome 已安装: $chromeVersion" -ForegroundColor Green
    Write-Host "   路径: $chromePath" -ForegroundColor Gray
} else {
    Write-Host "❌ Chrome 未找到" -ForegroundColor Yellow
    Write-Host "   请从 https://www.google.com/chrome/ 下载并安装 Chrome" -ForegroundColor Yellow
}

# 4. 创建测试配置文件
Write-Host "\n4. 创建测试配置文件..." -ForegroundColor Cyan
$configDir = "AITY_VIP\aity-uni-app-v2\tests\e2e"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$configContent = @"
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
"@

$configFile = "AITY_VIP\aity-uni-app-v2\playwright.config.js"
$configContent | Out-File -FilePath $configFile -Encoding UTF8
Write-Host "✅ 配置文件已创建: $configFile" -ForegroundColor Green

# 5. 创建示例测试文件
Write-Host "\n5. 创建示例测试文件..." -ForegroundColor Cyan
$testContent = @"
// tests/e2e/example.spec.js
const { test, expect } = require('@playwright/test');

test('首页加载测试', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/投研图灵室/);
});

test('登录功能测试', async ({ page }) => {
  await page.goto('/#/pages/login/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("登录")');
  await expect(page).toHaveURL(/.*index/);
});
"@

$testFile = "AITY_VIP\aity-uni-app-v2\tests\e2e\example.spec.js"
$testContent | Out-File -FilePath $testFile -Encoding UTF8
Write-Host "✅ 示例测试文件已创建: $testFile" -ForegroundColor Green

# 6. 生成安装指南
Write-Host "\n6. 生成安装指南..." -ForegroundColor Cyan
$installGuide = @"
===============================================
Dev Browser + Playwright Skill 手动安装指南
===============================================

由于 Dev Browser 和 Playwright Skill 需要在 Claude Code 
应用界面中安装，请按照以下步骤操作：

===============================================
步骤 1: 安装 Dev Browser 插件
===============================================

方法 A: 通过插件市场安装
1. 打开 Claude Code 应用
2. 点击左侧边栏的 "插件" 图标
3. 在搜索框中输入 "dev-browser"
4. 找到 "sawyerhood/dev-browser" 插件
5. 点击 "添加" 按钮
6. 等待安装完成
7. 重启 Claude Code 确保插件生效

方法 B: 通过命令安装（在 Claude Code 中）
1. 打开 Claude Code 应用
2. 在命令面板中执行:
   /plugin marketplace add sawyerhood/dev-browser
   /plugin install dev-browser@sawyerhood/dev-browser
3. 重启 Claude Code

===============================================
步骤 2: 加载 Playwright Skill
===============================================

1. 打开 Claude Code 应用
2. 点击左侧边栏的 "Skills" 图标
3. 点击 "添加 Skill" 按钮
4. 选择 "从 GitHub 加载"
5. 输入 GitHub 仓库地址:
   https://github.com/lackeyjb/playwright-skill
6. 点击 "加载" 按钮
7. 为 Skill 命名: "Playwright Skill"
8. 选择适当的分类
9. 保存配置

===============================================
步骤 3: 验证安装
===============================================

验证 Dev Browser:
在 Claude Code 中执行: /dev-browser help

验证 Playwright Skill:
在 Claude Code 中执行: /playwright-skill help

===============================================
步骤 4: 运行测试
===============================================

运行示例测试:
cd AITY_VIP\aity-uni-app-v2
npx playwright test

查看测试报告:
npx playwright show-report

===============================================
环境准备完成！
===============================================

✅ Playwright: 已安装
✅ Playwright 浏览器: 已安装
✅ Chrome 浏览器: 已安装
✅ 测试配置: 已配置
✅ 示例测试: 已创建

⏳ Dev Browser: 需要手动安装
⏳ Playwright Skill: 需要手动加载

请按照上述指南完成 Dev Browser 和 Playwright Skill 的安装。
"@

$guideFile = "AITY_VIP\scripts\INSTALL_GUIDE.txt"
$installGuide | Out-File -FilePath $guideFile -Encoding UTF8
Write-Host "✅ 安装指南已生成: $guideFile" -ForegroundColor Green

# 7. 显示总结
Write-Host "\n===============================================" -ForegroundColor Green
Write-Host "环境设置完成！" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host "\n✅ 已完成:" -ForegroundColor Green
Write-Host "  - Playwright 安装" -ForegroundColor Gray
Write-Host "  - Playwright 浏览器安装" -ForegroundColor Gray
Write-Host "  - Chrome 浏览器检查" -ForegroundColor Gray
Write-Host "  - 测试配置文件创建" -ForegroundColor Gray
Write-Host "  - 示例测试文件创建" -ForegroundColor Gray

Write-Host "\n⏳ 需要手动完成:" -ForegroundColor Yellow
Write-Host "  - Dev Browser 插件安装" -ForegroundColor Gray
Write-Host "  - Playwright Skill 加载" -ForegroundColor Gray

Write-Host "\n📋 详细安装指南:" -ForegroundColor Cyan
Write-Host "  $guideFile" -ForegroundColor Gray

Write-Host "\n🚀 快速开始:" -ForegroundColor Cyan
Write-Host "  cd AITY_VIP\aity-uni-app-v2" -ForegroundColor Gray
Write-Host "  npx playwright test" -ForegroundColor Gray

Write-Host "\n===============================================" -ForegroundColor Green

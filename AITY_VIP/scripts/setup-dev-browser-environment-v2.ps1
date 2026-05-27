#!/usr/bin/env pwsh

# Dev Browser + Playwright Skill 环境设置脚本（使用已下载的Chrome）

Write-Host "===============================================" -ForegroundColor Green
Write-Host "Dev Browser + Playwright Skill 环境设置" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# 1. 检查并安装 Playwright
Write-Host "`n1. 检查 Playwright 安装状态..." -ForegroundColor Cyan
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

# 2. 检查已下载的 Chrome
Write-Host "`n2. 检查已下载的 Chrome..." -ForegroundColor Cyan
$downloadedChromePath = "C:\Users\DELL\Downloads\chrome-win64\chrome.exe"
$chromePath = ""

# 检查已下载的 Chrome
if (Test-Path $downloadedChromePath) {
    $chromePath = $downloadedChromePath
    Write-Host "✅ 找到已下载的 Chrome: $downloadedChromePath" -ForegroundColor Green
} else {
    # 检查系统安装的 Chrome
    $systemChromePaths = @(
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Users\$env:USERNAME\AppData\Local\Google\Chrome\Application\chrome.exe"
    )
    
    foreach ($path in $systemChromePaths) {
        if (Test-Path $path) {
            $chromePath = $path
            break
        }
    }
    
    if ($chromePath) {
        Write-Host "✅ 找到系统 Chrome: $chromePath" -ForegroundColor Green
    } else {
        Write-Host "❌ Chrome 未找到" -ForegroundColor Yellow
        Write-Host "   请从 https://www.google.com/chrome/ 下载 Chrome" -ForegroundColor Yellow
    }
}

# 3. 创建测试配置文件
Write-Host "`n3. 创建测试配置文件..." -ForegroundColor Cyan
$configDir = "AITY_VIP\aity-uni-app-v2\tests\e2e"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

if ($chromePath) {
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
      use: { 
        ...devices['Desktop Chrome'],
        executablePath: '$($chromePath -replace '\\', '\\\\')'
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
"@
} else {
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
}

$configFile = "AITY_VIP\aity-uni-app-v2\playwright.config.js"
$configContent | Out-File -FilePath $configFile -Encoding UTF8
Write-Host "✅ 配置文件已创建: $configFile" -ForegroundColor Green

# 4. 创建示例测试文件
Write-Host "`n4. 创建示例测试文件..." -ForegroundColor Cyan
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

# 5. 创建快速测试脚本
Write-Host "`n5. 创建快速测试脚本..." -ForegroundColor Cyan
$quickTestContent = @"
// quick-test.js
const { chromium } = require('playwright');

async function quickTest() {
  console.log('开始快速测试...');
  
  try {
    const browser = await chromium.launch({
      headless: false,
      executablePath: '$($chromePath -replace '\\', '\\\\')'
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');
    
    console.log('✅ 成功访问本地服务器');
    
    const title = await page.title();
    console.log('✅ 页面标题:', title);
    
    await browser.close();
    console.log('✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

quickTest();
"@

$quickTestFile = "AITY_VIP\aity-uni-app-v2\quick-test.js"
$quickTestContent | Out-File -FilePath $quickTestFile -Encoding UTF8
Write-Host "✅ 快速测试脚本已创建: $quickTestFile" -ForegroundColor Green

# 6. 显示总结
Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "环境设置完成！" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host "`n✅ 已完成:" -ForegroundColor Green
Write-Host "  - Playwright 安装" -ForegroundColor Gray
Write-Host "  - Chrome 浏览器配置" -ForegroundColor Gray
Write-Host "  - 测试配置文件创建" -ForegroundColor Gray
Write-Host "  - 示例测试文件创建" -ForegroundColor Gray
Write-Host "  - 快速测试脚本创建" -ForegroundColor Gray

if ($chromePath) {
    Write-Host "`n🌐 Chrome 路径:" -ForegroundColor Cyan
    Write-Host "  $chromePath" -ForegroundColor Gray
}

Write-Host "`n🚀 快速开始:" -ForegroundColor Cyan
Write-Host "  cd AITY_VIP\aity-uni-app-v2" -ForegroundColor Gray
Write-Host "  node quick-test.js" -ForegroundColor Gray
Write-Host "  npx playwright test" -ForegroundColor Gray

Write-Host "`n📋 查看测试报告:" -ForegroundColor Cyan
Write-Host "  npx playwright show-report" -ForegroundColor Gray

Write-Host "`n===============================================" -ForegroundColor Green

#!/usr/bin/env pwsh

# Dev Browser + Playwright Skill 安装脚本

Write-Host "===============================================" -ForegroundColor Green
Write-Host "Dev Browser + Playwright Skill 安装脚本" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# 检查 Playwright 安装状态
Write-Host "\n1. 检查 Playwright 安装状态..." -ForegroundColor Cyan
try {
    $playwrightVersion = npm list playwright --json | ConvertFrom-Json
    if ($playwrightVersion.dependencies.playwright) {
        Write-Host "✅ Playwright 已安装: $($playwrightVersion.dependencies.playwright.version)" -ForegroundColor Green
    } else {
        Write-Host "❌ Playwright 未安装，正在安装..." -ForegroundColor Yellow
        npm install playwright
        Write-Host "✅ Playwright 安装完成" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ 检查 Playwright 时出错: $($_.Exception.Message)" -ForegroundColor Red
}

# 检查 Chrome 安装状态
Write-Host "\n2. 检查 Chrome 安装状态..." -ForegroundColor Cyan
try {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    if (Test-Path $chromePath) {
        $chromeVersion = & $chromePath --version
        Write-Host "✅ Chrome 已安装: $chromeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Chrome 未找到，请确保已安装 Chrome" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 检查 Chrome 时出错: $($_.Exception.Message)" -ForegroundColor Red
}

# 提供 Dev Browser 安装指南
Write-Host "\n3. Dev Browser 插件安装指南" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "请在 Claude Code 应用中执行以下步骤:" -ForegroundColor Yellow
Write-Host "1. 打开 Claude Code 应用"
Write-Host "2. 进入插件市场 (左侧边栏 '插件' 图标)"
Write-Host "3. 搜索 'dev-browser'"
Write-Host "4. 找到并安装 'sawyerhood/dev-browser' 插件"
Write-Host "5. 重启 Claude Code 确保插件生效"
Write-Host ""
Write-Host "或在 Claude Code 中执行命令:"
Write-Host "/plugin marketplace add sawyerhood/dev-browser"
Write-Host "/plugin install dev-browser@sawyerhood/dev-browser"
Write-Host "===============================================" -ForegroundColor Yellow

# 提供 Playwright Skill 安装指南
Write-Host "\n4. Playwright Skill 安装指南" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "请在 Claude Code 应用中执行以下步骤:" -ForegroundColor Yellow
Write-Host "1. 打开 Claude Code 应用"
Write-Host "2. 进入 Skills 管理 (左侧边栏 'Skills' 图标)"
Write-Host "3. 点击 '添加 Skill'"
Write-Host "4. 选择 '从 GitHub 加载'"
Write-Host "5. 输入 GitHub 仓库地址: https://github.com/lackeyjb/playwright-skill"
Write-Host "6. 为 Skill 命名: 'Playwright Skill'"
Write-Host "7. 保存配置"
Write-Host "===============================================" -ForegroundColor Yellow

# 验证安装
Write-Host "\n5. 验证安装步骤" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "安装完成后，请在 Claude Code 中执行以下命令验证:" -ForegroundColor Yellow
Write-Host "1. 验证 Dev Browser: /dev-browser help"
Write-Host "2. 验证 Playwright Skill: /playwright-skill help"
Write-Host "===============================================" -ForegroundColor Yellow

Write-Host "\n安装脚本执行完成！" -ForegroundColor Green
Write-Host "请按照上述指南手动完成 Dev Browser 和 Playwright Skill 的安装。" -ForegroundColor Green

# export-skills.ps1
# Skills 导出脚本（Windows）
# 用于将已安装的 Claude Skills 打包分享给同事

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Skills 导出脚本" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 检查 Node.js
Write-Host "[检查] Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "  ✓ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 未检测到 Node.js，请先安装 Node.js 16+" -ForegroundColor Red
    Write-Host "  下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 获取 npm 全局目录
$globalModules = npm root -g
Write-Host ""
Write-Host "[1/3] npm 全局目录: $globalModules" -ForegroundColor Yellow

# 进入目录
try {
    Set-Location $globalModules
    Write-Host "  ✓ 进入目录成功" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 无法进入目录: $globalModules" -ForegroundColor Red
    exit 1
}

# 检查 @anthropic-ai 目录
if (-not (Test-Path "@anthropic-ai")) {
    Write-Host ""
    Write-Host "[错误] 未找到 @anthropic-ai 目录" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "  1. 尚未安装任何 Skills" -ForegroundColor White
    Write-Host "  2. Skills 安装在不同的 npm 目录" -ForegroundColor White
    Write-Host ""
    Write-Host "解决方法：" -ForegroundColor Yellow
    Write-Host "  1. 先运行: npx skills add obra/superpowers@brainstorming -g -y" -ForegroundColor White
    Write-Host "  2. 检查其他 npm 目录: npm config get prefix" -ForegroundColor White
    exit 1
}

# 获取目录大小
$anthropicDir = Get-Item "@anthropic-ai"
$dirSize = (Get-ChildItem "@anthropic-ai" -Recurse | Measure-Object -Property Length -Sum).Sum
$dirSizeMB = [math]::Round($dirSize / 1MB, 2)

Write-Host ""
Write-Host "[2/3] 找到 Skills 目录" -ForegroundColor Yellow
Write-Host "  路径: $($anthropicDir.FullName)" -ForegroundColor White
Write-Host "  大小: $dirSizeMB MB" -ForegroundColor White
Write-Host ""
Write-Host "  开始打包..." -ForegroundColor Yellow

# 打包
$outputFile = "skills-backup.zip"
try {
    Compress-Archive -Path "@anthropic-ai" -DestinationPath $outputFile -Force
    Write-Host "  ✓ 打包完成" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 打包失败: $_" -ForegroundColor Red
    exit 1
}

# 获取文件大小
$fileInfo = Get-Item $outputFile
$sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "[3/3] 导出完成！" -ForegroundColor Green
Write-Host ""
Write-Host "文件信息:" -ForegroundColor Cyan
Write-Host "  名称: $outputFile" -ForegroundColor White
Write-Host "  大小: $sizeMB MB" -ForegroundColor White
Write-Host "  路径: $($fileInfo.FullName)" -ForegroundColor White
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  导出成功！请将文件分享给同事" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "同事导入方法:" -ForegroundColor Yellow
Write-Host "  1. 复制 skills-backup.zip 到同事电脑" -ForegroundColor White
Write-Host "  2. 运行: .\import-skills.ps1" -ForegroundColor White
Write-Host "  或手动解压到: $globalModules" -ForegroundColor White
Write-Host ""

# 列出已安装的 skills
Write-Host "已安装的 Skills 列表:" -ForegroundColor Cyan
try {
    $skills = npx skills ls -g 2>&1
    if ($skills -match "error|Error") {
        Write-Host "  (无法获取列表，但文件已导出)" -ForegroundColor Yellow
    } else {
        $skills | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    }
} catch {
    Write-Host "  (无法获取列表，但文件已导出)" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "按 Enter 键退出"

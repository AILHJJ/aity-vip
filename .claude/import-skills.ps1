# import-skills.ps1
# Skills 导入脚本（Windows）
# 用于从同事分享的备份文件导入 Claude Skills

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Skills 导入脚本" -ForegroundColor Green
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
Write-Host "[信息] npm 全局目录: $globalModules" -ForegroundColor Cyan

# 询问文件路径
Write-Host ""
$zipFile = Read-Host "请输入 skills-backup.zip 文件路径（直接回车使用当前目录）"

# 如果用户直接回车，使用默认路径
if ([string]::IsNullOrWhiteSpace($zipFile)) {
    $zipFile = Join-Path $PWD "skills-backup.zip"
    Write-Host "使用默认路径: $zipFile" -ForegroundColor Yellow
}

# 检查文件是否存在
if (-not (Test-Path $zipFile)) {
    Write-Host ""
    Write-Host "[错误] 文件不存在: $zipFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "请确认:" -ForegroundColor Yellow
    Write-Host "  1. 文件路径是否正确" -ForegroundColor White
    Write-Host "  2. 文件是否已复制到本机" -ForegroundColor White
    Write-Host ""
    Write-Host "示例路径:" -ForegroundColor Yellow
    Write-Host "  - C:\Users\用户名\Downloads\skills-backup.zip" -ForegroundColor White
    Write-Host "  - D:\共享文件\skills-backup.zip" -ForegroundColor White
    Write-Host "  - .\skills-backup.zip (当前目录)" -ForegroundColor White
    exit 1
}

# 获取文件信息
$fileInfo = Get-Item $zipFile
$sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "[1/3] 找到备份文件" -ForegroundColor Yellow
Write-Host "  路径: $($fileInfo.FullName)" -ForegroundColor White
Write-Host "  大小: $sizeMB MB" -ForegroundColor White

# 检查目标目录
Write-Host ""
Write-Host "[2/3] 准备导入..." -ForegroundColor Yellow
Write-Host "  目标目录: $globalModules" -ForegroundColor White

# 检查是否已存在 @anthropic-ai 目录
if (Test-Path (Join-Path $globalModules "@anthropic-ai")) {
    Write-Host ""
    Write-Host "[警告] 检测到已存在的 Skills 目录" -ForegroundColor Yellow
    $overwrite = Read-Host "是否覆盖? (y/N)"
    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
        Write-Host "已取消导入" -ForegroundColor Yellow
        exit 0
    }
    Write-Host "  将覆盖现有文件..." -ForegroundColor Yellow
}

# 解压
Write-Host ""
Write-Host "  开始解压..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipFile -DestinationPath $globalModules -Force
    Write-Host "  ✓ 解压完成" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 解压失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的解决方法:" -ForegroundColor Yellow
    Write-Host "  1. 使用 7-Zip 手动解压到: $globalModules" -ForegroundColor White
    Write-Host "  2. 右键 zip 文件 → 解压到指定文件夹" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "[3/3] 导入完成！" -ForegroundColor Green

# 验证
Write-Host ""
Write-Host "[验证] 检查安装的 Skills..." -ForegroundColor Yellow
try {
    $skills = npx skills ls -g 2>&1
    if ($skills -match "error|Error|not found") {
        throw "验证命令执行失败"
    }
    
    Write-Host ""
    Write-Host "✓ 验证成功！已安装的 Skills:" -ForegroundColor Green
    Write-Host ""
    
    # 美化输出
    $skills | ForEach-Object {
        if ($_ -match "^✓|^✗|^\s*[✓|✗]") {
            Write-Host "  $_" -ForegroundColor Green
        } elseif ($_ -match "error|Error|fail|Fail") {
            Write-Host "  $_" -ForegroundColor Red
        } else {
            Write-Host "  $_" -ForegroundColor White
        }
    }
} catch {
    Write-Host ""
    Write-Host "⚠ 验证命令执行失败，但文件可能已正确导入" -ForegroundColor Yellow
    Write-Host "请手动验证: npx skills ls -g" -ForegroundColor White
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  导入成功！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "现在你可以使用 Skills 了，例如:" -ForegroundColor Yellow
Write-Host "  - 使用 brainstorming skill 探索需求" -ForegroundColor White
Write-Host "  - 使用 writing-prds skill 编写 PRD" -ForegroundColor White
Write-Host ""
Write-Host "查看所有 Skills:" -ForegroundColor Yellow
Write-Host "  npx skills ls -g" -ForegroundColor White
Write-Host ""
Read-Host "按 Enter 键退出"

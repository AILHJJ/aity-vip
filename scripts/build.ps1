#!/usr/bin/env powershell
# 构建脚本 - 用于构建前后端项目

# 颜色输出函数
function Write-Green {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Yellow {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Red {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

# 开始构建
Write-Yellow "开始构建AITY VIP项目..."

# 获取脚本目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. 构建前端
Write-Yellow "\n1. 构建前端项目..."
$FrontendDir = Join-Path $ScriptDir "..\frontend"
Set-Location $FrontendDir

if (npm install) {
    Write-Green "前端依赖安装成功!"
} else {
    Write-Red "前端依赖安装失败!"
    exit 1
}

if (npm run build) {
    Write-Green "前端构建成功!"
} else {
    Write-Red "前端构建失败!"
    exit 1
}

# 2. 构建后端
Write-Yellow "\n2. 构建后端项目..."
$BackendDir = Join-Path $ScriptDir "..\backend"
Set-Location $BackendDir

if (npm install) {
    Write-Green "后端依赖安装成功!"
} else {
    Write-Red "后端依赖安装失败!"
    exit 1
}

Write-Green "\n🎉 AITY VIP项目构建完成!"
Write-Green "前端构建输出: $(Join-Path $FrontendDir "dist")"
Write-Green "后端构建输出: $BackendDir"

# AITY VIP 快速启动脚本 (Windows版本)
# 用于启动开发环境的前后端服务

$ErrorActionPreference = "Stop"

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

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Yellow "开始启动AITY VIP开发环境..."
Write-Yellow "项目路径: $ProjectRoot"

# 1. 启动后端服务
Write-Yellow "`n[1/2] 启动后端服务..."
$BackendDir = Join-Path $ProjectRoot "backend"
Set-Location $BackendDir

Write-Yellow "  安装后端依赖..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Red "后端依赖安装失败!"
    exit 1
}
Write-Green "  后端依赖安装成功!"

Write-Yellow "  启动后端服务..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; npm run dev"
Write-Green "  后端服务已在新窗口启动!"

# 等待后端启动
Write-Yellow "  等待后端服务启动..."
Start-Sleep -Seconds 3

# 2. 启动前端服务
Write-Yellow "`n[2/2] 启动前端服务..."
$FrontendDir = Join-Path $ProjectRoot "frontend"
Set-Location $FrontendDir

Write-Yellow "  安装前端依赖..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Red "前端依赖安装失败!"
    exit 1
}
Write-Green "  前端依赖安装成功!"

Write-Yellow "  启动前端服务..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev"
Write-Green "  前端服务已在新窗口启动!"

Write-Green "`n🎉 AITY VIP开发环境启动完成!"
Write-Green "前端开发服务器地址: http://localhost:5173"
Write-Green "后端开发服务器地址: http://localhost:3001"
Write-Yellow "`n提示: 关闭启动窗口不会停止服务，请关闭前后端服务窗口来停止服务"

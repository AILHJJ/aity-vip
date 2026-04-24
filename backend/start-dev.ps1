# AITY_VIP 一键启动脚本
# 同时启动后端服务和提醒前端编译

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AITY_VIP 本地开发环境启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到backend目录
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendPath

# 检查环境配置
Write-Host "📋 当前配置:" -ForegroundColor Yellow
Write-Host "   环境: $env:NODE_ENV"
Write-Host "   数据库: $env:DB_ENV"
Write-Host ""

# 启动后端服务
Write-Host "🚀 启动后端服务..." -ForegroundColor Green
Start-Job -ScriptBlock {
    cd 'd:\your-mcp-proxy\AITY_VIP\backend'
    npm run dev
} -Name "AITY_Backend" | Out-Null

# 等待后端启动
Start-Sleep 5

# 检查后端状态
$health = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue

if ($health.StatusCode -eq 200) {
    Write-Host "✅ 后端服务已启动" -ForegroundColor Green
    Write-Host "   地址: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "   数据库: 投研图灵室_test (测试库)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ 后端服务可能未完全启动，请检查日志" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ⚠️  小程序前端编译提醒" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果前端代码有更新，请重新编译小程序:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 打开 HBuilderX" -ForegroundColor White
Write-Host "2. 进入 aity-uni-app-v2 项目" -ForegroundColor White
Write-Host "3. 运行 → 运行到小程序模拟器 → 微信开发者工具" -ForegroundColor White
Write-Host ""
Write-Host "或者命令行编译:" -ForegroundColor White
Write-Host "   cd ../aity-uni-app-v2" -ForegroundColor Gray
Write-Host "   npm run dev:mp-weixin" -ForegroundColor Gray
Write-Host ""

# 打开HBuilderX（可选）
# Start-Process "D:\HBuilderX\HBuilderX.exe" -PassThru

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

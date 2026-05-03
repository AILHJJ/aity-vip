# 自动重启后端服务脚本
Write-Host "正在重启后端服务..." -ForegroundColor Yellow

# 停止所有 node 进程（除了当前 PowerShell 进程）
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $PID } | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# 设置环境变量并启动后端
$env:NODE_ENV = "development"
$env:DB_NAME = "投研图灵室_test"

Set-Location -Path "d:\your-mcp-proxy\AITY_VIP\backend"

# 使用 nodemon 启动（支持热重载）
Start-Process -FilePath "npx.exe" -ArgumentList "nodemon", "src/index.js" -WorkingDirectory "d:\your-mcp-proxy\AITY_VIP\backend" -WindowStyle Normal

Start-Sleep -Seconds 3

# 检查服务是否正常启动
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "✅ 后端服务启动成功！" -ForegroundColor Green
    Write-Host "API 地址: http://localhost:3001" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ 后端服务可能未完全启动，请检查终端窗口" -ForegroundColor Yellow
}

Write-Host "`n按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

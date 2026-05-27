# ============================================
# AITY_VIP 一键部署脚本 (Windows PowerShell)
# 
# 功能：部署后端到腾讯云生产环境
# 
# 使用方式：
#   .\deploy.ps1          # 正常部署
#   .\deploy.ps1 -Force  # 强制部署（跳过确认）
# ============================================

param(
    [switch]$Force
)

# 颜色函数
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $colors = @{
        "Red" = [ConsoleColor]::Red
        "Green" = [ConsoleColor]::Green
        "Yellow" = [ConsoleColor]::Yellow
        "Blue" = [ConsoleColor]::Cyan
    }
    Write-Host $Message -ForegroundColor $colors[$Color]
}

# 配置
$SERVER_HOST = "124.221.119.134"
$SERVER_USER = "root"
$PROJECT_PATH = "C:\path\to\AITY_VIP\backend"  # 请修改为实际路径

Write-ColorOutput "==============================================" "Cyan"
Write-ColorOutput "  🚀 AITY_VIP 部署工具" "Cyan"
Write-ColorOutput "==============================================" "Cyan"
Write-Host ""

# 本地检查
Write-ColorOutput "📋 本地检查..." "Cyan"

# 检查Git
if (Test-Path ".git") {
    Write-ColorOutput "  • Git仓库: ✅" "Green"
} else {
    Write-ColorOutput "  • Git仓库: ❌ 未找到" "Red"
    exit 1
}

# 检查node_modules
if (Test-Path "node_modules") {
    Write-ColorOutput "  • 依赖安装: ✅" "Green"
} else {
    Write-ColorOutput "  • 依赖未安装，运行 npm install..." "Yellow"
    npm install
}

Write-Host ""

# 确认部署
if (-not $Force) {
    Write-ColorOutput "⚠️  即将部署到生产服务器: $SERVER_HOST" "Yellow"
    Write-ColorOutput "⚠️  这将重启后端服务，请确认！" "Yellow"
    $confirm = Read-Host "是否继续? (y/n)"
    
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-ColorOutput "部署已取消" "Red"
        exit 0
    }
}

Write-Host ""
Write-ColorOutput "📤 开始部署..." "Cyan"
Write-Host ""

# 1. 推送到远程仓库
Write-ColorOutput "📤 推送到远程仓库..." "Cyan"
$branch = git rev-parse --abbrev-ref HEAD
git push origin $branch

# 2. SSH到服务器执行部署
Write-ColorOutput "🖥️  连接服务器执行部署..." "Cyan"

$deployCommands = @"
cd /www/wwwroot/AITY_VIP/backend
echo '📥 拉取最新代码...'
git pull origin develop
echo ''
echo '📦 安装依赖...'
npm install
echo ''
echo '🔄 重启后端服务...'
pm2 stop ecosystem.config.js || true
pm2 start ecosystem.config.js --env production
sleep 3
echo ''
echo '📊 服务状态:'
pm2 status
echo ''
echo '📋 最近日志 (最后10行):'
pm2 logs ecosystem.config.js --nostream --lines 10 || true
echo ''
echo '=============================================='
echo '  ✅ 部署完成!'
echo '=============================================='
"@

# 使用SSH执行远程命令
echo $deployCommands | ssh ${SERVER_USER}@${SERVER_HOST} "bash -s"

Write-Host ""
Write-ColorOutput "==============================================" "Green"
Write-ColorOutput "  ✅ 部署成功!" "Green"
Write-ColorOutput "==============================================" "Green"
Write-Host ""
Write-ColorOutput "🎉 您的更改已部署到生产环境" "Green"
Write-Host ""
Write-ColorOutput "💡 后续验证:" "Cyan"
Write-ColorOutput "   1. 访问 https://aity88.online:8443/api/health 检查服务" "White"
Write-ColorOutput "   2. 在小程序中测试相关功能" "White"
Write-Host ""

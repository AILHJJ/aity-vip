@echo off
echo 正在停止旧的后端进程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 正在启动后端服务...
cd /d "d:\your-mcp-proxy\AITY_VIP\backend"
set NODE_ENV=development
set DB_NAME=投研图灵室_test
start "AITY-VIP-Backend" cmd /k "npm run dev"
echo 后端服务正在启动中...
timeout /t 3 /nobreak >nul

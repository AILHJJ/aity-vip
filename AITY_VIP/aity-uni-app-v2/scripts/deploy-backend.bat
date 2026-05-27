@echo off
REM AITY快速更新后端脚本
REM 功能: 仅更新后端，不编译前端

echo ========================================
echo AITY 后端快速更新
echo ========================================
echo.

set SERVER_IP=111.48.74.245
set SERVER_USER=root

echo 正在更新后端代码并重启服务...
echo 请输入服务器密码:

ssh %SERVER_USER%@%SERVER_IP% "cd /tmp/AITY/backend && git reset --hard && git pull origin feature/iteration-1 && pm2 restart aity-backend -f"

if errorlevel 1 (
    echo.
    echo [错误] 后端更新失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 后端更新完成！
echo ========================================
echo.
echo API地址: https://aity88.online:8443/
echo ========================================
echo.

timeout /t 3 /nobreak > nul

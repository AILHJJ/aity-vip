@echo off
chcp 65001 >nul
echo ========================================
echo 投研图灵室 - 快速构建脚本（仅构建不上传）
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist "aity-uni-app-v2" (
    echo [错误] 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo 开始构建小程序...
echo.

REM 进入项目目录
cd aity-uni-app-v2

call npm run build:mp-weixin
if errorlevel 1 (
    echo [错误] 构建失败
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo ✅ 构建完成！
echo ========================================
echo.
echo 构建目录: aity-uni-app-v2\dist\build\mp-weixin
echo.
echo 你可以:
echo 1. 使用微信开发者工具打开构建目录进行预览
echo 2. 运行 quick-update.bat 上传到微信平台
echo ========================================
echo.
pause

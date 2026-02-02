@echo off
chcp 65001 >nul
echo ========================================
echo 投研图灵室 - 快速更新脚本
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist "aity-uni-app-v2" (
    echo [错误] 请在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 获取版本号和描述
set /p VERSION="请输入版本号 (例如: 1.0.1): "
set /p DESC="请输入版本描述 (例如: 修复登录问题): "

if "%VERSION%"=="" (
    echo [错误] 版本号不能为空
    pause
    exit /b 1
)

if "%DESC%"=="" (
    echo [错误] 版本描述不能为空
    pause
    exit /b 1
)

echo.
echo ========================================
echo 开始更新流程...
echo ========================================
echo 版本号: %VERSION%
echo 描述: %DESC%
echo ========================================
echo.

REM 进入项目目录
cd aity-uni-app-v2

echo [1/2] 正在构建小程序...
call npm run build:mp-weixin
if errorlevel 1 (
    echo [错误] 构建失败
    cd ..
    pause
    exit /b 1
)

echo.
echo [2/2] 正在上传到微信平台...
set VERSION=%VERSION%
set DESC=%DESC%
call npm run upload:weixin
if errorlevel 1 (
    echo [错误] 上传失败
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo ✅ 更新完成！
echo ========================================
echo.
echo 下一步操作:
echo 1. 登录微信公众平台: https://mp.weixin.qq.com/
echo 2. 进入 开发管理 → 版本管理
echo 3. 在 开发版本 中找到刚上传的版本
echo 4. 点击 提交审核
echo ========================================
echo.
pause

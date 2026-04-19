@echo off
chcp 65001 >nul
echo 开始启动AITY VIP开发环境...
echo.

REM 定义服务端口
set BACKEND_PORT=3001
set FRONTEND_PORT=5173

REM 检查并杀死占用端口的进程
echo [0/2] 检查端口占用情况...

REM 检查后端端口
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT% ^| findstr LISTENING') do (
    echo   后端端口 %BACKEND_PORT% 被占用，正在杀死进程 %%a...
    taskkill /F /PID %%a >nul 2>&1
)

REM 检查前端端口
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT% ^| findstr LISTENING') do (
    echo   前端端口 %FRONTEND_PORT% 被占用，正在杀死进程 %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo   端口检查完成！
echo.

REM 1. 启动后端服务
echo [1/2] 启动后端服务...
cd /d "%~dp0..\backend"

REM 检查是否需要安装依赖
if not exist "node_modules" (
    echo   安装后端依赖...
    call npm install
    if errorlevel 1 (
        echo   后端依赖安装失败！
        pause
        exit /b 1
    )
    echo   后端依赖安装成功！
)

echo   启动后端服务...
start "AITY VIP Backend" cmd /k "npm run dev"
echo   后端服务已在新窗口中启动！
echo.

REM 等待后端启动
echo   等待后端服务启动...
timeout /t 5 /nobreak >nul

REM 2. 启动前端服务
echo [2/2] 启动前端服务...
cd /d "%~dp0..\aity-uni-app-v2"

REM 检查是否需要安装依赖
if not exist "node_modules" (
    echo   安装前端依赖...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo   前端依赖安装失败！
        pause
        exit /b 1
    )
    echo   前端依赖安装成功！
)

echo   启动前端服务...
echo   注意: 如果前端服务启动失败，请手动检查 uni-app 配置
start "AITY VIP Frontend" cmd /k "npm run dev"
echo   前端服务已在新窗口中启动！
echo.

echo.
echo ========================================
echo   AITY VIP 开发环境启动完成！
echo ========================================
echo   后端开发服务器地址: http://localhost:%BACKEND_PORT%
echo   前端开发服务器地址: http://localhost:%FRONTEND_PORT%
echo.
echo   测试页面: %~dp0..\test-backend.html
echo.
echo   注意: 
echo   1. 关闭此窗口不会停止服务，请手动关闭前后端服务窗口来停止服务
echo   2. 如果前端服务启动失败，请检查 uni-app 配置文件
echo   3. 后端服务已验证正常工作
echo ========================================
echo.
pause
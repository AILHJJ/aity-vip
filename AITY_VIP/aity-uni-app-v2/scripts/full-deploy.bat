@echo off
REM AITY完整部署脚本 - Windows本地执行
REM 功能: 编译前端 + 上传到服务器 + 触发服务器统一部署

echo ========================================
echo AITY 完整部署流程
echo ========================================
echo.

set SERVER_IP=111.48.74.245
set SERVER_USER=root
set PROJECT_PATH=D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2

REM 步骤1: 编译H5前端
echo 步骤1: 编译H5前端...
cd /d %PROJECT_PATH%
call npm run build:h5
if errorlevel 1 (
    echo [错误] H5编译失败
    pause
    exit /b 1
)
echo [成功] H5编译完成
echo.

REM 步骤2: 压缩H5文件
echo 步骤2: 压缩H5文件...
cd dist\build
if exist h5-upload.zip del h5-upload.zip
powershell -Command "Compress-Archive -Path h5\* -DestinationPath h5-upload.zip -Force"
if errorlevel 1 (
    echo [错误] 压缩失败
    pause
    exit /b 1
)
echo [成功] 压缩完成: h5-upload.zip
echo.

REM 步骤3: 上传到服务器
echo 步骤3: 上传H5到服务器...
echo 请输入服务器密码:
scp h5-upload.zip %SERVER_USER%@%SERVER_IP%:/tmp/
if errorlevel 1 (
    echo [错误] 上传失败
    pause
    exit /b 1
)
echo [成功] 上传完成
echo.

REM 步骤4: 触发服务器统一部署
echo 步骤4: 在服务器上执行统一部署...
echo （这将自动更新后端并部署前端）
echo 请再次输入服务器密码:
ssh %SERVER_USER%@%SERVER_IP% "bash /tmp/AITY/deploy.sh"
if errorlevel 1 (
    echo [错误] 服务器部署失败
    pause
    exit /b 1
)
echo.

echo ========================================
echo 部署成功完成！
echo ========================================
echo 后端: 已更新并重启
echo 前端: 已编译并部署
echo.
echo 访问地址:
echo   H5: http://%SERVER_IP%/h5/
echo   API: https://aity88.online:8443/
echo ========================================
echo.

REM 清理本地临时文件
cd /d %PROJECT_PATH%\dist\build
del h5-upload.zip

echo 按任意键退出...
pause > nul

@echo off
REM H5部署到腾讯云脚本 (Windows)
REM 使用前请确保已安装SSH客户端或使用Git Bash

echo ========================================
echo H5自动部署脚本 - 腾讯云
echo 服务器: 111.48.74.245
echo ========================================
echo.

set SERVER_IP=111.48.74.245
set SERVER_USER=root
set DEPLOY_PATH=/var/www/html/h5
set LOCAL_PATH=aity-uni-app-v2\dist\build\h5
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%

echo 步骤1: 检查本地编译产物...
if not exist "%LOCAL_PATH%\index.html" (
    echo [错误] 未找到编译产物，请先运行: npm run build:h5
    pause
    exit /b 1
)
echo [成功] 找到编译产物
echo.

echo 步骤2: 创建临时压缩文件...
cd aity-uni-app-v2\dist\build
powershell -Command "Compress-Archive -Path h5\* -DestinationPath h5-deploy.zip -Force"
if errorlevel 1 (
    echo [错误] 压缩失败
    pause
    exit /b 1
)
echo [成功] 压缩完成
echo.

echo 步骤3: 上传到服务器...
echo 请输入服务器密码:
scp h5-deploy.zip %SERVER_USER%@%SERVER_IP%:/tmp/
if errorlevel 1 (
    echo [错误] 上传失败
    pause
    exit /b 1
)
echo [成功] 上传完成
echo.

echo 步骤4: 在服务器上部署...
echo 请再次输入服务器密码:
ssh %SERVER_USER%@%SERVER_IP% "cd %DEPLOY_PATH%/.. && if [ -d h5 ]; then cp -r h5 h5-backup-%TIMESTAMP%; fi && mkdir -p h5 && unzip -o /tmp/h5-deploy.zip -d h5 && chown -R www-data:www-data h5 && chmod -R 755 h5 && echo [成功] 部署完成"
if errorlevel 1 (
    echo [错误] 部署失败
    pause
    exit /b 1
)
echo.

echo ========================================
echo 部署成功！
echo 访问地址: http://%SERVER_IP%/h5/
echo ========================================
echo.

REM 清理临时文件
del h5-deploy.zip

pause

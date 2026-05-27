@echo off
REM H5上传到腾讯云服务器脚本 (Windows本地执行)
REM 将本地已编译的H5文件上传到服务器

echo ========================================
echo H5上传部署脚本 - 本地到服务器
echo 目标服务器: 111.48.74.245
echo ========================================
echo.

set SERVER_IP=111.48.74.245
set SERVER_USER=root
set LOCAL_BUILD_PATH=D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\dist\build\h5
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%

echo 步骤1: 检查本地编译产物...
if not exist "%LOCAL_BUILD_PATH%\index.html" (
    echo [错误] 未找到编译产物，请先执行: cd aity-uni-app-v2 ^&^& npm run build:h5
    pause
    exit /b 1
)
echo [成功] 找到编译产物: %LOCAL_BUILD_PATH%
echo.

echo 步骤2: 压缩H5文件...
cd /d D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\dist\build
if exist h5-upload.zip del h5-upload.zip
powershell -Command "Compress-Archive -Path h5\* -DestinationPath h5-upload.zip -Force"
if errorlevel 1 (
    echo [错误] 压缩失败
    pause
    exit /b 1
)
echo [成功] 压缩完成: h5-upload.zip
echo.

echo 步骤3: 上传到服务器...
echo 请输入服务器密码 (或使用SSH密钥):
scp h5-upload.zip %SERVER_USER%@%SERVER_IP%:/tmp/
if errorlevel 1 (
    echo [错误] 上传失败，请检查网络连接和服务器密码
    pause
    exit /b 1
)
echo [成功] 上传完成
echo.

echo 步骤4: 在服务器上部署...
echo 请再次输入服务器密码:
ssh %SERVER_USER%@%SERVER_IP% "bash -s" << REMOTE_SCRIPT_EOF
set -e
echo "开始在服务器上部署..."

# 备份旧版本
if [ -d /var/www/html/h5 ]; then
    echo "备份旧版本..."
    cp -r /var/www/html/h5 /var/www/html/h5-backup-%TIMESTAMP%
    echo "备份完成: h5-backup-%TIMESTAMP%"
else
    echo "首次部署，创建目录..."
fi

# 创建部署目录
mkdir -p /var/www/html/h5

# 解压新版本
echo "解压新版本..."
unzip -o /tmp/h5-upload.zip -d /var/www/html/h5/

# 设置权限
echo "设置权限..."
chown -R www-data:www-data /var/www/html/h5
chmod -R 755 /var/www/html/h5

# 清理临时文件
rm -f /tmp/h5-upload.zip

echo "========== 部署完成！ =========="
echo "部署路径: /var/www/html/h5/"
echo "访问地址: http://%SERVER_IP%/h5/"
echo ""
echo "文件列表:"
ls -la /var/www/html/h5/

REMOTE_SCRIPT_EOF

if errorlevel 1 (
    echo [错误] 服务器部署失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 部署成功完成！
echo 请访问: http://%SERVER_IP%/h5/
echo ========================================
echo.

REM 清理本地临时文件
cd /d D:\your-mcp-proxy\AITY_VIP\aity-uni-app-v2\dist\build
del h5-upload.zip

echo 按任意键退出...
pause > nul

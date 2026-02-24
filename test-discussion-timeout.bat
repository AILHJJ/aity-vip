@echo off
REM 创建讨论超时问题诊断脚本 (Windows版本)
REM 用于测试API端点的响应时间和性能

set API_BASE_URL=https://aity88.online:8443/api
set TEST_USER_EMAIL=test@example.com
set TEST_USER_PASSWORD=123456

echo ========================================
echo 创建讨论超时问题诊断
echo ========================================
echo.

REM 步骤1: 测试服务器连接
echo 步骤1: 测试服务器连接...
curl -X GET "%API_BASE_URL%/health" -H "Content-Type: application/json" -s
echo.
echo.

REM 步骤2: 用户登录获取token
echo 步骤2: 用户登录...
curl -X POST "%API_BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"%TEST_USER_EMAIL%\",\"password\":\"%TEST_USER_PASSWORD%\"}" -s
echo.
echo.

REM 注意: Windows批处理文件无法轻松提取JSON中的token
REM 请手动复制上面的token，然后设置环境变量TOKEN
echo.
echo 如果需要测试创建讨论，请手动执行以下命令（替换YOUR_TOKEN）：
echo curl -X POST "%API_BASE_URL%/discussions" ^
echo   -H "Content-Type: application/json" ^
echo   -H "Authorization: Bearer YOUR_TOKEN" ^
echo   -d "{\"messageId\":1,\"title\":\"测试讨论\",\"content\":\"这是一个测试内容\"}" ^
echo   -w "响应时间: %%{time_total}s" -s
echo.
echo ========================================
echo 诊断完成
echo ========================================
pause

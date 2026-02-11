@echo off
setlocal enabledelayedexpansion

REM 测试创建讨论API响应时间的脚本（Windows版本）
REM 用于诊断超时问题

set API_URL=https://aity88.online:8443/api/discussions
set TOKEN=

echo =========================================
echo 创建讨论API响应时间测试
echo =========================================
echo.

REM 测试1: 基础连接测试
echo 测试1: 基础连接测试
echo ----------------------------------------
curl -w "\n\n时间统计:\n总时间: %%{time_total}s\n连接时间: %%{time_connect}s\n开始传输: %%{time_starttransfer}s\n" ^
  -X POST "%API_URL%" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"messageId\":1,\"title\":\"测试标题\",\"content\":\"测试内容\",\"visibility\":\"private\"}" ^
  -v ^
  -m 60 ^
  2>&1 | findstr /C:"HTTP" /C:"时间统计" /C:"总时间" /C:"连接时间"

echo.
echo =========================================
echo.

REM 测试2: 多次请求测试稳定性
echo 测试2: 多次请求测试稳定性（5次）
echo ----------------------------------------

for /L %%i in (1,1,5) do (
  echo 第 %%i 次请求:
  for /f "tokens=*" %%a in ('curl -w "%%{time_total}" ^
    -X POST "%API_URL%" ^
    -H "Content-Type: application/json" ^
    -H "Authorization: Bearer %TOKEN%" ^
    -d "{\"messageId\":1,\"title\":\"测试标题\",\"content\":\"测试内容\",\"visibility\":\"private\"}" ^
    -m 60 ^
    -s -o nul') do set time_result=%%a

  echo 响应时间: !time_result!s
  timeout /t 1 >nul
)

echo.
echo =========================================
echo.
echo 测试完成
echo =========================================
echo.
echo 说明：
echo - 如果所有测试的响应时间都^< 1秒，说明后端性能正常
echo - 如果偶尔出现^> 5秒的响应，说明存在网络波动
echo - 如果经常超时，可能是网络连接问题
echo.
echo 已实施的修复方案：
echo 1. 小程序设置60秒超时
echo 2. 添加自动重试机制
echo 3. 优化错误提示
echo.
pause

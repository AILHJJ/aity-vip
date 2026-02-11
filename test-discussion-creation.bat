@echo off
REM ============================================
REM 测试创建讨论API
REM ============================================

set API_URL=https://aity88.online:8443/api/discussions

echo ========================================
echo 测试创建讨论API
echo ========================================
echo URL: %API_URL%
echo.

REM 第一步：登录获取token
echo [步骤1] 登录获取token...
curl -k -X POST "https://aity88.online:8443/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"password\":\"test123\"}" ^
  --max-time 90

echo.
echo.

REM 如果有token，替换下面的 YOUR_TOKEN
set TOKEN=YOUR_TOKEN

REM 第二步：测试创建讨论（带token）
echo [步骤2] 测试创建讨论...
echo 注意：请先在上面的登录响应中复制token，替换YOUR_TOKEN
echo.
pause

curl -k -X POST "%API_URL%" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"title\":\"测试讨论\",\"content\":\"这是一个测试讨论内容\",\"visibility\":\"private\",\"messageId\":1}" ^
  --max-time 90 ^
  -v

echo.
echo.
echo ========================================
echo 测试完成
echo ========================================
pause

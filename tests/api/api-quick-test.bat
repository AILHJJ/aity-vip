@echo off
REM API自动化测试脚本 - Windows版本
REM 用法: api-quick-test.bat

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:3001
set TOKEN=

echo ==========================================
echo    AITY VIP - API自动化测试
echo ==========================================
echo.

REM 测试1: 健康检查
echo 📋 测试1: 后端健康检查
echo ----------------------------------------
curl -s "%BASE_URL%/api/health"
echo.
echo.

REM 测试2: 用户登录
echo 📋 测试2: 用户登录
echo ----------------------------------------
curl -s -X POST "%BASE_URL%/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
echo.
echo.

REM 测试3: 获取用户信息（需要先手动设置TOKEN）
echo 📋 测试3: 获取用户列表（需要管理员权限）
echo ----------------------------------------
echo 提示: 需要有效的TOKEN才能访问
echo.
echo.

REM 测试4: 测试收藏API（修复后）
echo 📋 测试4: 测试收藏消息API
echo ----------------------------------------
echo 提示: 这个API之前返回500错误，现在应该返回200
echo.
echo.

echo ==========================================
echo    ✅ 基础API测试完成
echo ==========================================
echo.
echo 提示: 完整的API测试需要有效的认证TOKEN
echo 请参考 api-quick-test.sh 获取完整测试流程
echo.

pause

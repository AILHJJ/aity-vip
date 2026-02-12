@echo off
REM 测试讨论详情页修复
echo ========================================
echo 测试讨论详情页修复
echo ========================================
echo.

echo 1. 测试获取讨论详情 API
echo    URL: http://localhost:3000/api/discussions/1
curl -X GET "http://localhost:3000/api/discussions/1" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczOTUyMjIwMCwiZXhwIjoxNzQ1NzA0MjAwfQ.test" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 2. 测试获取讨论回复列表 API
echo    URL: http://localhost:3000/api/discussions/1/replies
curl -X GET "http://localhost:3000/api/discussions/1/replies" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczOTUyMjIwMCwiZXhwIjoxNzQ1NzA0MjAwfQ.test" ^
  -H "Content-Type: application/json"
echo.
echo.

echo ========================================
echo 检查要点：
echo ========================================
echo 1. 响应格式应该是: { code: 200, message: "Success", data: {...} }
echo 2. 讨论详情应包含: creatorName, userName 字段
echo 3. 回复列表应包含: userName 字段
echo 4. 前端判断应该使用: res.code === 200 (而不是 res.success)
echo ========================================
pause

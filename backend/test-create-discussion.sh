#!/bin/bash
# 测试创建讨论功能

echo "=========================================="
echo "  测试创建讨论 API"
echo "=========================================="

# 先登录获取token
echo -e "\n1. 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}')

echo "登录响应: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取token"
  exit 1
fi

echo "✅ Token: ${TOKEN:0:50}..."

# 创建讨论
echo -e "\n2. 创建讨论..."
echo "开始时间: $(date '+%H:%M:%S')"

CREATE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME_TOTAL:%{time_total}s\n" \
  -X POST http://localhost:3001/api/discussions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "messageId": 93,
    "title": "测试讨论",
    "content": "这是一个测试讨论内容",
    "visibility": "private"
  }')

echo "结束时间: $(date '+%H:%M:%S')"
echo -e "\n响应:"
echo "$CREATE_RESPONSE"

echo -e "\n=========================================="

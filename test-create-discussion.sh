#!/bin/bash

echo "========================================="
echo "测试创建讨论 API"
echo "========================================="
echo ""

# 步骤1: 登录获取token
echo "步骤1: 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST "https://aity88.online:8443/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"fl","password":"123456"}' \
  --max-time 30)

echo "登录响应: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，无法获取token"
  exit 1
fi

echo "✅ 登录成功，获取到token: ${TOKEN:0:50}..."
echo ""

# 步骤2: 获取消息列表
echo "步骤2: 获取消息列表..."
MESSAGES_RESPONSE=$(curl -s -X GET "https://aity88.online:8443/api/messages?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  --max-time 30)

echo "消息列表响应: $MESSAGES_RESPONSE"
MESSAGE_ID=$(echo $MESSAGES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$MESSAGE_ID" ]; then
  echo "❌ 无法获取消息ID"
  MESSAGE_ID=98  # 使用默认ID
else
  echo "✅ 获取到消息ID: $MESSAGE_ID"
fi
echo ""

# 步骤3: 创建讨论（详细测试）
echo "步骤3: 创建讨论..."
echo "  URL: https://aity88.online:8443/api/discussions"
echo "  Token: ${TOKEN:0:50}..."
echo "  Data: {\"title\":\"测试讨论\",\"content\":\"测试讨论内容\",\"visibility\":\"private\",\"messageId\":$MESSAGE_ID}"
echo ""

START_TIME=$(date +%s)
CREATE_RESPONSE=$(curl -v -X POST "https://aity88.online:8443/api/discussions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"测试讨论\",\"content\":\"测试讨论内容\",\"visibility\":\"private\",\"messageId\":$MESSAGE_ID}" \
  --max-time 90 \
  -w "\n\nHTTP_CODE:%{http_code}\nTIME_TOTAL:%{time_total}\n" 2>&1)
END_TIME=$(date +%s)

DURATION=$((END_TIME - START_TIME))

echo ""
echo "========================================="
echo "创建讨论响应详情："
echo "========================================="
echo "$CREATE_RESPONSE"
echo ""
echo "========================================="
echo "统计信息："
echo "========================================="
echo "总耗时: $DURATION 秒"
echo ""

# 检查是否成功
if echo "$CREATE_RESPONSE" | grep -q '"code":200\|"success":true'; then
  echo "✅ 创建讨论成功！"
  exit 0
elif echo "$CREATE_RESPONSE" | grep -q "timeout\|Timed out"; then
  echo "❌ 请求超时！"
  echo "   可能的原因："
  echo "   1. 数据库查询太慢"
  echo "   2. 网络连接问题"
  echo "   3. 服务器负载过高"
  exit 1
elif echo "$CREATE_RESPONSE" | grep -q '"code":403'; then
  echo "❌ Token无效或已过期"
  exit 1
else
  echo "❌ 创建讨论失败（其他错误）"
  exit 1
fi

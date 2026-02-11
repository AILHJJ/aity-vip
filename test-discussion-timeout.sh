#!/bin/bash

# 创建讨论超时问题诊断脚本
# 用于测试API端点的响应时间和性能

API_BASE_URL="https://aity88.online:8443/api"
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="123456"

echo "========================================"
echo "创建讨论超时问题诊断"
echo "========================================"
echo ""

# 步骤1: 测试服务器连接
echo "步骤1: 测试服务器连接..."
curl -X GET "${API_BASE_URL}/health" \
  -H "Content-Type: application/json" \
  -w "\n响应时间: %{time_total}s\n" \
  -o /dev/null -s
echo ""

# 步骤2: 用户登录获取token
echo "步骤2: 用户登录..."
LOGIN_RESPONSE=$(curl -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_USER_EMAIL}\",\"password\":\"${TEST_USER_PASSWORD}\"}" \
  -s)

echo "登录响应: ${LOGIN_RESPONSE}"

# 提取token (使用简单的字符串提取)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo "错误: 无法获取token，请先创建测试用户"
    exit 1
fi

echo "获取到token: ${TOKEN:0:20}..."
echo ""

# 步骤3: 获取消息列表（用于关联）
echo "步骤3: 获取消息列表..."
MESSAGES_RESPONSE=$(curl -X GET "${API_BASE_URL}/messages?page=1&limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\n响应时间: %{time_total}s" \
  -s)

echo "${MESSAGES_RESPONSE}"
echo ""

# 提取第一个消息ID
MESSAGE_ID=$(echo $MESSAGES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$MESSAGE_ID" ]; then
    echo "警告: 没有找到消息，使用默认ID=1"
    MESSAGE_ID=1
fi

echo "使用消息ID: ${MESSAGE_ID}"
echo ""

# 步骤4: 测试创建讨论API（带详细计时）
echo "步骤4: 测试创建讨论API（多次测试）..."
for i in {1..5}; do
    echo ""
    echo "测试 #${i}:"
    START_TIME=$(date +%s%N)

    RESPONSE=$(curl -X POST "${API_BASE_URL}/discussions" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "{\"messageId\":${MESSAGE_ID},\"title\":\"测试讨论 ${i}\",\"content\":\"这是一个测试讨论内容，用于测试API响应时间。测试时间: $(date +%H:%M:%S)\"}" \
      -w "\n\n=== 性能统计 ===\n总时间: %{time_total}s\n连接时间: %{time_connect}s\nSSL握手时间: %{time_appconnect}s\n开始传输时间: %{time_starttransfer}s\n下载速度: %{speed_download} bytes/sec\n" \
      -s)

    END_TIME=$(date +%s%N)
    DURATION=$(( (END_TIME - START_TIME) / 1000000 ))

    echo "响应内容: ${RESPONSE}"
    echo "客户端计算耗时: ${DURATION}ms"
    echo "--------------------"
done

echo ""
echo "========================================"
echo "诊断完成"
echo "========================================"
echo ""
echo "可能的问题分析："
echo "1. 如果curl测试很快（<1秒），但小程序超时，说明是小程序端问题"
echo "2. 如果curl测试很慢（>30秒），说明是后端或数据库问题"
echo "3. 检查网络连接稳定性"
echo "4. 检查数据库查询性能"
echo "5. 检查后端日志是否有错误"

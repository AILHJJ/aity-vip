#!/bin/bash

# API自动化测试脚本
# 用法: bash api-quick-test.sh

BASE_URL="http://localhost:3001"
TOKEN=""

echo "=========================================="
echo "   AITY VIP - API自动化测试"
echo "=========================================="
echo ""

# 测试1: 健康检查
echo "📋 测试1: 后端健康检查"
echo "----------------------------------------"
curl -s "$BASE_URL/api/health" | python -m json.tool
echo ""
echo ""

# 测试2: 用户登录
echo "📋 测试2: 用户登录"
echo "----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "$LOGIN_RESPONSE" | python -m json.tool
TOKEN=$(echo "$LOGIN_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")
echo ""
echo ""

# 测试3: 获取用户信息
if [ -n "$TOKEN" ]; then
  echo "📋 测试3: 获取当前用户信息"
  echo "----------------------------------------"
  curl -s "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN" | python -m json.tool
  echo ""
  echo ""
fi

# 测试4: 获取消息列表
if [ -n "$TOKEN" ]; then
  echo "📋 测试4: 获取消息列表"
  echo "----------------------------------------"
  curl -s "$BASE_URL/api/messages?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN" | python -m json.tool
  echo ""
  echo ""
fi

# 测试5: 获取收藏消息（修复后）
if [ -n "$TOKEN" ]; then
  echo "📋 测试5: 获取收藏消息列表"
  echo "----------------------------------------"
  curl -s "$BASE_URL/api/favorites?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN" | python -m json.tool
  echo ""
  echo ""
fi

# 测试6: 获取收藏讨论（新功能）
if [ -n "$TOKEN" ]; then
  echo "📋 测试6: 获取收藏讨论列表"
  echo "----------------------------------------"
  curl -s "$BASE_URL/api/discussions/favorites?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN" | python -m json.tool
  echo ""
  echo ""
fi

# 测试7: 获取讨论列表
if [ -n "$TOKEN" ]; then
  echo "📋 测试7: 获取讨论列表"
  echo "----------------------------------------"
  curl -s "$BASE_URL/api/discussions?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN" | python -m json.tool
  echo ""
  echo ""
fi

echo "=========================================="
echo "   ✅ API测试完成"
echo "=========================================="

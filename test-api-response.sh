#!/bin/bash

# 测试创建讨论API响应时间的脚本
# 用于诊断超时问题

API_URL="https://aity88.online:8443/api/discussions"
TOKEN=""  # 如果需要，填写实际的token

echo "========================================="
echo "创建讨论API响应时间测试"
echo "========================================="
echo ""

# 测试1: 基础连接测试
echo "测试1: 基础连接测试"
echo "----------------------------------------"
curl -w "\
    \n\n时间统计:\n\
    总时间: %{time_total}s\n\
    连接时间: %{time_connect}s\n\
    开始传输: %{time_starttransfer}s\n\
    DNS解析: %{time_namelookup}s\n\
    SSL握手: %{time_appconnect}s\n\
    下载速度: %{speed_download} bytes/s\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"messageId":1,"title":"测试标题","content":"测试内容","visibility":"private"}' \
  -v \
  -m 60 \
  2>&1 | grep -E "(HTTP|时间统计|总时间|连接时间|SSL|total)"

echo ""
echo "========================================="
echo ""

# 测试2: 模拟慢速网络
echo "测试2: 模拟慢速网络（限制速度为10KB/s）"
echo "----------------------------------------"
curl -w "\n\n总时间: %{time_total}s\n" \
  --limit-rate 10240 \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"messageId":1,"title":"测试标题","content":"测试内容","visibility":"private"}' \
  -m 60 \
  2>&1 | grep -E "(HTTP|总时间)"

echo ""
echo "========================================="
echo ""

# 测试3: 多次请求测试稳定性
echo "测试3: 多次请求测试稳定性（5次）"
echo "----------------------------------------"
for i in {1..5}; do
  echo "第 $i 次请求:"
  time_result=$(curl -w "%{time_total}" \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"messageId":1,"title":"测试标题","content":"测试内容","visibility":"private"}' \
    -m 60 \
    -s -o /dev/null)

  echo "响应时间: ${time_result}s"
  sleep 1
done

echo ""
echo "========================================="
echo ""

# 测试4: 测试不同的payload大小
echo "测试4: 测试不同的payload大小"
echo "----------------------------------------"

echo "小payload (100字节):"
curl -w "\n响应时间: %{time_total}s\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"messageId":1,"title":"测试","content":"测试","visibility":"private"}' \
  -s -o /dev/null

echo ""
echo "中等payload (1KB):"
curl -w "\n响应时间: %{time_total}s\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"messageId":1,"title":"测试标题","content":"这是一段中等长度的测试内容，用于测试中等大小的payload对响应时间的影响。这段内容大约有100多个字符，加上其他字段，总体大小应该在1KB左右。","visibility":"private"}' \
  -s -o /dev/null

echo ""
echo "大payload (10KB):"
large_content=$(python3 -c "print('这是测试内容。' * 500)")
curl -w "\n响应时间: %{time_total}s\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"messageId\":1,\"title\":\"测试标题\",\"content\":\"$large_content\",\"visibility\":\"private\"}" \
  -s -o /dev/null

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="
echo ""
echo "说明："
echo "- 如果所有测试的响应时间都< 1秒，说明后端性能正常"
echo "- 如果偶尔出现> 5秒的响应，说明存在网络波动"
echo "- 如果经常超时，可能是网络连接问题"
echo ""
echo "建议的修复方案："
echo "1. 小程序设置60秒超时（已实施）"
echo "2. 添加自动重试机制（已实施）"
echo "3. 优化错误提示（已实施）"

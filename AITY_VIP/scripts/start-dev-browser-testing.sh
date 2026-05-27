#!/bin/bash

# Dev Browser 自动化测试启动脚本
# 用于 AITY_VIP 项目

set -e  # 遇到错误立即退出

echo "======================================"
echo "  Dev Browser 自动化测试启动"
echo "======================================"
echo ""

# 配置变量
CHROME_PATH="D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe"
DEV_BROWSER_DIR="C:/Users/DELL/.claude/skills/dev-browser"
PROJECT_DIR="D:/your-mcp-proxy/AITY_VIP"
VIDEO_DIR="$PROJECT_DIR/test-results/videos"
SCREENSHOT_DIR="$PROJECT_DIR/test-results/screenshots"

# 1. 检查环境
echo "📋 步骤 1: 检查环境..."

# 检查 Chrome
if [ ! -f "$CHROME_PATH" ]; then
    echo "❌ Chrome 不存在: $CHROME_PATH"
    exit 1
fi
echo "✅ Chrome 已找到: $CHROME_PATH"

# 检查 dev-browser
if [ ! -d "$DEV_BROWSER_DIR" ]; then
    echo "❌ dev-browser 目录不存在: $DEV_BROWSER_DIR"
    exit 1
fi
echo "✅ dev-browser 已找到: $DEV_BROWSER_DIR"

# 检查端口
if netstat -ano | findstr :9222 > /dev/null; then
    echo "⚠️  端口 9222 已被占用"
    echo "正在尝试停止占用进程..."
    PID=$(netstat -ano | findstr :9222 | awk '{print $5}' | head -1)
    if [ ! -z "$PID" ]; then
        taskkill //F //PID $PID 2>/dev/null || true
        sleep 2
    fi
fi
echo "✅ 端口 9222 可用"

# 2. 创建必要的目录
echo ""
echo "📁 步骤 2: 创建测试结果目录..."

mkdir -p "$VIDEO_DIR"
mkdir -p "$SCREENSHOT_DIR"

echo "✅ 视频目录: $VIDEO_DIR"
echo "✅ 截图目录: $SCREENSHOT_DIR"

# 3. 启动 dev-browser 服务器
echo ""
echo "🚀 步骤 3: 启动 dev-browser 服务器..."

export CHROME_PATH
cd "$DEV_BROWSER_DIR"

# 在后台启动服务器
./server.sh > /tmp/dev-browser.log 2>&1 &
SERVER_PID=$!

echo "✅ 服务器已启动 (PID: $SERVER_PID)"
echo "⏳ 等待服务器就绪..."

# 等待 "Ready" 消息
for i in {1..30}; do
    if grep -q "Ready" /tmp/dev-browser.log 2>/dev/null; then
        echo "✅ 服务器已就绪!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 服务器启动超时"
        cat /tmp/dev-browser.log
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# 4. 显示服务器信息
echo ""
echo "📊 服务器信息:"
echo "  - WebSocket: ws://127.0.0.1:9223"
echo "  - HTTP API: http://127.0.0.1:9222"
echo "  - 日志文件: /tmp/dev-browser.log"
echo ""

# 5. 提示如何使用
echo "======================================"
echo "  服务器已启动成功!"
echo "======================================"
echo ""
echo "使用方法:"
echo "  1. 运行测试脚本:"
echo "     cd $DEV_BROWSER_DIR"
echo "     npx tsx tmp/your-test.ts"
echo ""
echo "  2. 查看测试结果:"
echo "     视频位置: $VIDEO_DIR"
echo "     截图位置: $SCREENSHOT_DIR"
echo ""
echo "  3. 停止服务器:"
echo "     kill $SERVER_PID"
echo ""
echo "按 Ctrl+C 停止服务器..."
echo ""

# 保持脚本运行
wait $SERVER_PID

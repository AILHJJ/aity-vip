#!/bin/bash

# 腾讯云后端服务诊断脚本
# 使用方法：bash diagnose-server.sh

echo "=========================================="
echo "  AITY 后端服务诊断工具"
echo "=========================================="

# 1. 检查PM2进程状态
echo -e "\n[1] 检查PM2进程状态..."
pm2 status

# 2. 查看最近的错误日志
echo -e "\n[2] 查看最近的错误日志（最后50行）..."
pm2 logs aity-backend --err --lines 50 --nostream

# 3. 查看最近的输出日志
echo -e "\n[3] 查看最近的输出日志（最后50行）..."
pm2 logs aity-backend --out --lines 50 --nostream

# 4. 检查端口占用
echo -e "\n[4] 检查端口3001占用情况..."
netstat -tlnp | grep 3001 || echo "端口3001未被占用"

# 5. 检查Node.js进程
echo -e "\n[5] 检查Node.js进程..."
ps aux | grep node | grep -v grep

# 6. 测试后端健康检查
echo -e "\n[6] 测试后端健康检查..."
curl -s http://localhost:3001/health || echo "健康检查失败"

# 7. 检查系统资源
echo -e "\n[7] 检查系统资源..."
echo "CPU使用率："
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//'
echo "内存使用情况："
free -h

# 8. 检查磁盘空间
echo -e "\n[8] 检查磁盘空间..."
df -h

# 9. 查看PM2进程详细信息
echo -e "\n[9] 查看PM2进程详细信息..."
pm2 show aity-backend

echo -e "\n=========================================="
echo "  诊断完成"
echo "=========================================="

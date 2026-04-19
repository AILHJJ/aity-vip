# 如何在腾讯云服务器上找到项目目录

## 🚀 快速方法

### 方法1: 使用查找脚本（推荐）

```bash
cd /root/aity-vip/backend
bash find-project-dir.sh
```

### 方法2: 查看PM2进程

```bash
pm2 status
pm2 show aity-backend
```

### 方法3: 搜索目录

```bash
find /root /home /opt -maxdepth 5 -name "package.json" -path "*/backend/*" 2>/dev/null
```

## ✅ 确认找到正确目录

```bash
cd /root/aity-vip/backend
git remote -v  # 应显示 aity-vip.git
ls src/index.js package.json  # 文件应存在
```

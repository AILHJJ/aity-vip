# 🚀 腾讯云服务器快速操作指南

> 推荐使用 `腾讯云部署指南.md`，本文档作为快速参考保留。

## 第一步：登录服务器

```bash
ssh root@124.221.119.134
```

---

## 第二步：进入项目目录

```bash
cd /root/aity-vip/backend
pwd  # 确认在 /root/aity-vip/backend
ls src/index.js package.json  # 确认文件存在
```

---

## 第三步：拉取最新代码

```bash
git pull origin feature/iteration-1
```

---

## 第四步：安装依赖并重启服务

```bash
npm install --production
pm2 restart aity-backend
pm2 status
```

---

## 第五步：验证服务运行

```bash
curl http://localhost:3001/health
# 应该返回: {"status":"ok",...}
```

---

## 🎯 一键操作

```bash
cd /root/aity-vip/backend && \
git pull origin feature/iteration-1 && \
npm install --production && \
pm2 restart aity-backend && \
pm2 status && \
curl http://localhost:3001/health
```

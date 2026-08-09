# 腾讯云后端 `releases/current` 迁移与回滚方案

> 更新时间：2026-08-09  
> 目标读者：开发、运维  
> 目的：把当前“直接运行目录”迁移为可回滚、可追踪的 `releases/current` 结构。

## 一、先回答两个核心问题

### 1. 新文件夹部署会不会引起域名问题

通常不会。

域名是否正常，主要取决于：

- Nginx 代理是否仍指向同一个后端端口
- H5 静态站点的 `root/alias` 是否仍指向正确目录
- 上传文件路径是否仍可访问

对后端 API 来说，目录从 `/root/aity-vip/backend` 换到 `/root/aity-vip/releases/<版本>/backend` 本身不会改域名。  
真正要同步的是：

- PM2 启动目录
- `.env` 的位置
- `uploads` 的持久化位置
- 日志文件位置

### 2. 163 客户端授权码如何获取

按 163 网页端的常规步骤：

1. 登录 `mail.163.com`
2. 进入 `设置`
3. 打开 `POP3/SMTP/IMAP`
4. 开启 `IMAP/SMTP服务`
5. 按提示完成短信验证
6. 重新生成 16 位客户端授权码

这个授权码不是网页登录密码，必须作为 SMTP 密码使用。

## 二、当前线上问题

当前线上后端还是直接运行：

- 运行目录：`/root/aity-vip/backend`
- 入口文件：`/root/aity-vip/backend/src/index.js`
- PM2：`aity-backend`

当前没有 `releases` 目录，因此还不是可平滑回滚的标准发布结构。

当前 `ecosystem.config.js` 里还写死了：

- `cwd: '/root/aity-vip/backend'`
- 日志目录：`/root/aity-vip/logs/...`

另外，上传目录在代码里是相对路径，实际会落到当前运行目录下的 `uploads`。

## 三、建议目录结构

```text
/root/aity-vip/
  current -> /root/aity-vip/releases/20260809-001
  releases/
    20260809-001/
      backend/
      aity-uni-app-v2/
  shared/
    backend.env
    logs/
    uploads/
  deploy/
    releases/
      20260809-001/
        aity-backend-20260809-001.tar.gz
        sha256.txt
```

## 四、迁移原则

- 代码进 `releases`
- 配置进 `shared`
- 运行态数据进 `shared`
- `current` 只负责指向当前版本

## 五、迁移步骤

### 第 1 步：备份当前线上目录

```bash
cp -a /root/aity-vip/backend /root/aity-vip/backend_backup_$(date +%Y%m%d_%H%M%S)
cp -a /root/aity-vip/backend/.env /root/aity-vip/shared/backend.env
```

### 第 2 步：创建标准目录

```bash
mkdir -p /root/aity-vip/releases
mkdir -p /root/aity-vip/shared/logs
mkdir -p /root/aity-vip/shared/uploads
```

### 第 3 步：部署新版本到 releases

把新包解压到：

```text
/root/aity-vip/releases/20260809-001
```

本地发布包建议同步保存在：

```text
<项目根>/deploy/releases/20260809-001/
```

### 第 4 步：接入共享配置

把新版本里的：

- `backend/.env` 指向 `/root/aity-vip/shared/backend.env`
- `backend/logs` 指向 `/root/aity-vip/shared/logs`
- `backend/uploads` 指向 `/root/aity-vip/shared/uploads`

建议用软链，不要复制多份。

### 第 5 步：切换 current

```bash
ln -sfn /root/aity-vip/releases/20260809-001 /root/aity-vip/current
```

### 第 6 步：更新 PM2

PM2 应改为从 `current` 启动，例如：

```bash
cd /root/aity-vip/current/backend
pm2 restart aity-backend --update-env
```

如果首次改为 `current` 结构，建议先重建 PM2 配置，避免仍然引用旧绝对路径。

## 六、回滚方案

### 快速回滚

1. 找到上一个稳定版本目录
2. 把 `current` 软链切回去
3. `pm2 restart aity-backend --update-env`

```bash
ln -sfn /root/aity-vip/releases/20260808-xxx /root/aity-vip/current
pm2 restart aity-backend --update-env
```

### 紧急回滚

如果新结构出问题：

1. 直接切回 `/root/aity-vip/backend_backup_...`
2. 恢复原 `.env`
3. `pm2 restart aity-backend --update-env`

## 七、发布检查清单

- `current` 软链指向正确版本
- `.env` 已加载邮件配置
- `PM2` 进程在线
- `uploads` 可读写
- `/api/health` 正常
- `notification_outbox` 能写入
- 本地归档目录已有对应版本的 tar 包和 sha256

## 八、一键脚本

本地脚本入口：

```powershell
# 查看线上状态
.\scripts\腾讯云后端发布管理.ps1 -Action status

# 服务器准备 release，要求 /tmp/aity-backend-<版本号>.tar.gz 已存在
.\scripts\腾讯云后端发布管理.ps1 -Action prepare -Version c11ff54

# 切换线上 current 到指定版本
.\scripts\腾讯云后端发布管理.ps1 -Action switch -Version c11ff54

# 回滚到指定版本
.\scripts\腾讯云后端发布管理.ps1 -Action rollback -Version 上一个版本号
```

说明：

- `prepare` 只解压、安装依赖和做语法检查，不切流量
- `switch` 会重启 PM2，属于生产发布动作
- `rollback` 会重启 PM2，属于生产回滚动作
- 脚本不会写入密钥，真实密钥仍由服务器 `/root/aity-vip/shared/backend.env` 维护
- 如果只是查看当前版本和健康状态，使用 `status`，不会改动线上服务

## 九、邮件配置提示

首次发布建议：

- `MAIL_DRY_RUN=true`
- 先确认 outbox 记录正常
- 再切 `MAIL_DRY_RUN=false`
- 默认保留 `MAIL_NOTIFY_COOLDOWN_MINUTES=10`，避免短时间连续提醒打扰用户

真实发信需要：

- 发件人邮箱：`lhdms88@163.com`
- 收件人测试邮箱：`625668823@qq.com`
- 163 客户端授权码
- 邮件标题和正文只提示有更新，引导用户回到微信小程序查看，不写具体投研内容

## 十、来源链接

- `https://mail.163.com/`
- `https://help.mail.163.com/faqDetail.do?code=d7a5dc8471cd0c0e8b4b8f4f8e49998b374173cfe9171305fa1ce630d7f67ac24aac98d1012d23f2`

# SSL证书目录说明

## 用途

此目录用于存放手动购买的SSL证书文件。

## 文件说明

- `aity88.online.key` - SSL私钥文件（绝密）
- `aity88.online_bundle.crt` - SSL证书文件
- `deploy-ssl.sh` - 一键部署脚本

## 使用方法

### 1. 准备证书文件

将从证书提供商处获取的证书文件重命名并放入此目录：

```
your-domain.key → aity88.online.key
your-domain.crt → aity88.online_bundle.crt
```

### 2. 提交到Git（私有仓库）

```bash
git add ssl-certs/
git commit -m "添加SSL证书"
git push origin feature/iteration-1
```

### 3. 在服务器部署

```bash
ssh root@your_server_ip
cd /root/aity-vip
git pull origin feature/iteration-1
bash ssl-certs/deploy-ssl.sh
```

## 安全提示

⚠️ **重要**：
- 这是私有仓库，证书相对安全
- 不要将此仓库设为公开
- 定期检查访问权限
- 证书到期后及时更新

## 证书更新流程

当证书即将到期时（30天内）：

1. 从证书提供商处购买/申请新证书
2. 替换此目录中的证书文件
3. 提交到Git
4. 在服务器执行 `bash ssl-certs/deploy-ssl.sh`

## 证书有效期检查

在服务器上运行：

```bash
bash /root/aity-vip/scripts/check-cert-expiry.sh
```

或添加到定时任务（每周检查）：

```bash
crontab -e
# 添加：每周一上午9点检查
0 9 * * 1 /root/aity-vip/scripts/check-cert-expiry.sh
```

## 推荐方案

如果还没有购买证书，建议使用Let's Encrypt免费证书：

```bash
# 在服务器上执行
bash /root/aity-vip/scripts/deploy-with-ssl.sh
```

Let's Encrypt的优势：
- 完全免费
- 自动续期
- 广泛支持
- 安全可靠

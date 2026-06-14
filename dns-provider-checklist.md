# DNS 服务商确认指南

## 快速检查方法

### 方法1: 查看域名 WHOIS 信息（推荐）

在终端/命令行执行:
```bash
# Windows PowerShell
nslookup -type=NS aity88.online

# 或使用在线工具
# 访问 https://who.is/whois/aity88.online
```

**查找关键字**:
- `Name Server: *.dnspod.net` → 腾讯云 DNSPod ✅ 最可能
- `Name Server: *.alidns.com` → 阿里云 DNS
- `Name Server: *.cloudflare.com` → Cloudflare
- 其他 → 请告诉我具体内容

### 方法2: 检查腾讯云控制台（如果账号方便登录）

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **DNS 解析 DNSPod**
3. 查找域名列表中是否有 `aity88.online`
4. 如果有 → 就是腾讯云 DNSPod

### 方法3: 检查阿里云控制台

1. 登录 [阿里云控制台](https://dns.console.aliyun.com/)
2. 查找域名列表
3. 如果有 `aity88.online` → 就是阿里云 DNS

---

## 常见 DNS 服务商 API 密钥获取方法

### 如果是腾讯云 DNSPod（最可能）

**申请步骤**:
1. 登录 [腾讯云 API 密钥管理](https://console.cloud.tencent.com/cam/capi)
2. 点击 **新建密钥**
3. 记录:
   - SecretId: `AKIDxxxxxxxxxxxxxxxxxxxx`
   - SecretKey: `xxxxxxxxxxxxxxxxxxxxxxxx`
4. ⚠️ **立即保存！关闭页面后无法再次查看 SecretKey**

**权限要求**:
- 需要 `QcloudDNSPodFullAccess` 权限
- 或者自定义权限：`dnspod:DescribeRecords`, `dnspod:CreateRecord`, `dnspod:DeleteRecord`

### 如果是阿里云 DNS

**申请步骤**:
1. 登录 [阿里云 RAM 控制台](https://ram.console.aliyun.com/users)
2. 创建子账号或使用主账号
3. 创建 AccessKey
4. 记录 AccessKey ID 和 AccessKey Secret
5. 授权 DNS 权限: `aliyundns:fullaccess`

### 如果是 Cloudflare

**申请步骤**:
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 选择模板: **Edit zone DNS**
4. 选择域名权限: `All zones`
5. 创建并记录 API Token

---

## 安全提醒

⚠️ **API 密钥是敏感信息！**

- 不要提交到 Git 仓库
- 不要在聊天工具中明文发送
- 使用后及时删除本地临时文件
- 定期轮换密钥（建议每90天）

---

## 下一步

请告诉我:

1. **DNS 服务商是哪个？**
   - [ ] 腾讯云 DNSPod
   - [ ] 阿里云 DNS
   - [ ] Cloudflare
   - [ ] 其他：_________

2. **是否已有 API 密钥？**
   - [ ] 是，已准备好
   - [ ] 否，需要指导如何申请

3. **切换时间偏好？**
   - [ ] 立即切换（现在）
   - [ ] 本周末（低峰期）
   - [ ] 等当前证书到期前（约85天后）

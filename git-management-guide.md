# Git 操作建议 - SSL 证书自动化项目

## 推荐的 Git 工作流程

### 方案1: 只提交有用的工具和文档 (推荐)

**提交的文件**:
```
AITY_VIP/
├── deploy-ssl-auto.js              # ✅ 自动部署脚本（核心）
├── install-acme-fixed.js            # ✅ acme.sh 安装脚本（核心）
├── DEPLOYMENT_SUCCESS_REPORT.md     # ✅ 部署报告
├── FINAL_STATUS_REPORT.md           # ✅ 状态报告
└── acme.sh-production-deployment-plan.md  # ✅ 完整方案文档

99-个人探索/AITY_VIP/
├── deploy-ssl-certificate.sh        # ✅ 服务器端部署脚本
├── deploy-rollback.sh               # ✅ 回滚脚本
└── SSL证书管理与自动续期完整方案.md   # ✅ 知识库文档
```

**不提交的文件** (添加到 .gitignore):
```
# 敏感信息/临时文件
diagnose-dns.js                      # ❌ 含API密钥引用
install-acme-server.js              # ❌ 已被替代
install-acme-auto.js                # ❌ 已被替代
check-dns-provider.ps1              # ❌ 临时脚本（已删除）
test-api.ps1                         # ❌ 临时脚本（已删除）
final-verify.ps1                     # ❌ 临时脚本（已删除）
diagnose-website.ps1                 # ❌ 临时脚本（已删除）
```

### 方案2: 创建新分支管理 (更规范)

```bash
# 创建特性分支
git checkout -b feature/ssl-automation

# 添加文件
git add deploy-ssl-auto.js install-acme-fixed.js *.md deploy-*.sh

# 提交
git commit -m "feat: add SSL certificate auto-deployment tools

- Add automated deployment script using node-ssh
- Add acme.sh installation and configuration scripts  
- Add comprehensive documentation for SSL management
- Add server-side deployment and rollback scripts"

# 推送到远程
git push origin feature/ssl-automation
```

---

## .gitignore 建议添加的内容

在项目根目录的 `.gitignore` 中添加:

```bash
# SSL Automation - Temporary/Sensitive files
diagnose-*.js
install-acme-server.js
install-acme-auto.js
check-*.ps1
test-*.ps1
final-verify.ps1
diagnose-website.ps1

# Credentials (NEVER commit!)
*.pem
*credentials*
dnspod_credentials
.env.production
```

---

## 快速执行命令

如果你想现在就提交，我可以帮你运行这些命令。或者你可以稍后手动处理。

**你想现在处理 Git 吗？还是先继续配置 DNSPod 权限？**

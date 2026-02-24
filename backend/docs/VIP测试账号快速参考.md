# VIP测试账号快速参考

## 快速登录信息

### VIP测试账号 (新创建)
```
邮箱: vip_test@example.com
密码: 123456
角色: VIP中线用户 (vip_mid)
```

### 所有可用测试账号

| 账号类型 | 邮箱 | 密码 | 角色 |
|---------|------|------|------|
| 超级管理员 | admin@example.com | 123456 | super_admin |
| 管理员 | subadmin@example.com | 123456 | admin |
| **VIP中线用户** | **vip_mid@example.com** | 123456 | vip_mid |
| **VIP短线用户** | **vip_short@example.com** | 123456 | vip_short |
| **VIP测试账号** | **vip_test@example.com** | 123456 | **vip_mid** |
| 体验用户 | trial@example.com | 123456 | trial (7天) |

---

## 常用命令

### 创建VIP测试账号
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node scripts/create-vip-test-user.js
```

### 验证VIP账号
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node scripts/verify-vip-account.js
```

### 查看所有用户
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node -e "require('dotenv').config(); const sequelize = require('./src/config/db'); const User = require('./src/models/User'); (async () => { const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'status'] }); users.forEach(u => console.log(u.id, u.name, u.email, u.role, u.status)); await sequelize.close(); process.exit(0); })();"
```

---

## 验证VIP身份

### 1. 登录后检查响应
登录成功后，响应中的 `data.user.role` 应该显示为 `vip_mid` 或 `vip_short`

### 2. 查看个人资料
在前端应用的个人资料页面，应该能看到VIP用户标识

### 3. 访问VIP内容
VIP用户应该能够看到带有对应标签的专属消息内容

---

## 文件位置

- 用户模型: `D:\your-mcp-proxy\AITY_VIP\backend\src\models\User.js`
- 认证控制器: `D:\your-mcp-proxy\AITY_VIP\backend\src\controllers\authController.js`
- 创建脚本: `D:\your-mcp-proxy\AITY_VIP\backend\scripts\create-vip-test-user.js`
- 验证脚本: `D:\your-mcp-proxy\AITY_VIP\backend\scripts\verify-vip-account.js`
- 完整报告: `D:\your-mcp-proxy\AITY_VIP\backend\docs\VIP测试账号完整报告.md`

---

## 测试检查清单

- [ ] 使用vip_test账号登录
- [ ] 验证返回的角色为vip_mid
- [ ] 查看消息列表
- [ ] 查看消息详情
- [ ] 测试收藏功能
- [ ] 测试发起讨论
- [ ] 验证权限控制

---

**重要提示:**
- 所有测试账号的密码都是: 123456
- VIP测试账号是vip_mid类型（VIP中线用户）
- 账号状态都是active（激活状态）

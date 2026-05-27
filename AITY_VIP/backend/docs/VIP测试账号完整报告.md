# VIP测试账号完整报告

## 一、用户系统结构

### 1.1 数据库用户模型 (User Model)

文件位置: `D:\your-mcp-proxy\AITY_VIP\backend\src\models\User.js`

用户表结构:
```javascript
{
  id: INTEGER (主键，自增)
  name: STRING(100) (用户名)
  email: STRING(100) (邮箱，唯一)
  password: STRING(255) (密码，加密存储)
  role: ENUM (用户角色)
  groupId: STRING(50) (组ID)
  avatar: STRING(100) (头像)
  status: ENUM (状态，默认: active)
  expireDate: DATE (过期日期)
}
```

### 1.2 用户角色类型 (User Roles)

系统支持5种用户角色:

1. **super_admin** - 超级管理员
   - 拥有所有权限
   - 可以管理所有用户和内容

2. **admin** - 管理员
   - 拥有管理权限
   - 可以管理特定组的用户和内容

3. **vip_mid** - VIP中线用户
   - 可以查看中线相关的消息内容
   - 对应标签: mid_term

4. **vip_short** - VIP短线用户
   - 可以查看短线相关的消息内容
   - 对应标签: short_term

5. **trial** - 体验用户
   - 7天体验期
   - 有expireDate限制

### 1.3 消息标签系统

消息标签与用户角色的对应关系:
- `short_term` - 短线标签 (vip_short用户可查看)
- `mid_term` - 中线标签 (vip_mid用户可查看)
- `all_users` - 所有用户标签 (所有用户可查看)

---

## 二、VIP测试账号创建过程

### 2.1 创建脚本

创建位置: `D:\your-mcp-proxy\AITY_VIP\backend\scripts\create-vip-test-user.js`

执行命令:
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node scripts/create-vip-test-user.js
```

### 2.2 创建结果

✓ VIP测试账号创建成功
- 创建时间: 2026-02-06 12:03:36
- 数据库ID: 14
- 状态: 激活

---

## 三、完整测试账号信息

### 3.1 VIP测试账号 (新创建)

```
用户名: vip_test
邮箱: vip_test@example.com
密码: 123456
角色: vip_mid (VIP中线用户)
状态: active (激活)
用户ID: 14
组ID: vip_mid
```

### 3.2 所有可用的测试账号

#### 超级管理员账号
```
用户名: Admin
邮箱: admin@example.com
密码: 123456
角色: super_admin
用户ID: 9
```

#### 管理员账号
```
用户名: SubAdmin
邮箱: subadmin@example.com
密码: 123456
角色: admin
用户ID: 10
```

#### VIP中线用户
```
用户名: VIP中线用户
邮箱: vip_mid@example.com
密码: 123456
角色: vip_mid
用户ID: 11
```

#### VIP短线用户
```
用户名: VIP短线用户
邮箱: vip_short@example.com
密码: 123456
角色: vip_short
用户ID: 12
```

#### 体验用户
```
用户名: 体验用户
邮箱: trial@example.com
密码: 123456
角色: trial
用户ID: 13
过期时间: 7天后
```

---

## 四、如何使用VIP测试账号登录

### 4.1 方式一：使用邮箱登录

1. 打开前端应用的登录页面
2. 输入邮箱: `vip_test@example.com`
3. 输入密码: `123456`
4. 点击登录按钮

### 4.2 方式二：使用用户名登录

1. 打开前端应用的登录页面
2. 输入用户名: `vip_test`
3. 输入密码: `123456`
4. 点击登录按钮

### 4.3 登录API示例

请求:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "vip_test@example.com",
  "password": "123456"
}
```

响应:
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 14,
      "name": "vip_test",
      "email": "vip_test@example.com",
      "role": "vip_mid",
      "groupId": "vip_mid",
      "avatar": null,
      "status": "active"
    }
  }
}
```

---

## 五、如何验证账号是否为VIP用户

### 5.1 通过数据库直接查询

```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node -e "
require('dotenv').config();
const sequelize = require('./src/config/db');
const User = require('./src/models/User');
(async () => {
  const user = await User.findOne({
    where: { email: 'vip_test@example.com' }
  });
  console.log('用户信息:');
  console.log('ID:', user.id);
  console.log('用户名:', user.name);
  console.log('邮箱:', user.email);
  console.log('角色:', user.role);
  console.log('状态:', user.status);
  await sequelize.close();
  process.exit(0);
})();
"
```

### 5.2 使用验证脚本

运行验证脚本:
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node scripts/verify-vip-account.js
```

验证内容:
- ✓ 检查账号是否存在
- ✓ 验证账号信息
- ✓ 验证密码正确性
- ✓ 验证VIP角色
- ✓ 验证账号状态

### 5.3 通过登录响应验证

1. 登录成功后，检查返回的用户信息
2. 确认 `role` 字段为 `vip_mid` 或 `vip_short`
3. 确认 `status` 字段为 `active`
4. 确认收到有效的 JWT token

### 5.4 通过前端界面验证

1. 登录后查看用户个人资料页面
2. 检查显示的用户角色是否为VIP用户
3. 尝试访问VIP专属的消息内容
4. 验证是否能正常查看带有 `mid_term` 标签的消息

---

## 六、VIP权限验证测试

### 6.1 消息访问权限测试

VIP中线用户 (vip_mid) 应该能够:
- ✓ 查看带有 `mid_term` 标签的消息
- ✓ 查看带有 `all_users` 标签的消息
- ✓ 收藏消息
- ✓ 发起讨论
- ✓ 回复讨论
- ✗ 不能查看仅限 `short_term` 的消息

### 6.2 API权限测试

使用获取到的token访问受保护的API:

```http
GET /api/auth/current
Authorization: Bearer <token>

响应应该返回:
{
  "code": 200,
  "data": {
    "id": 14,
    "name": "vip_test",
    "email": "vip_test@example.com",
    "role": "vip_mid",
    "status": "active"
  }
}
```

### 6.3 前端功能测试

测试以下功能是否正常:
1. ✓ 消息列表加载
2. ✓ 消息详情查看
3. ✓ 消息收藏功能
4. ✓ 讨论功能
5. ✓ 个人资料显示

---

## 七、相关文件位置

### 7.1 数据库和模型
- User模型: `D:\your-mcp-proxy\AITY_VIP\backend\src\models\User.js`
- 数据库配置: `D:\your-mcp-proxy\AITY_VIP\backend\src\config\db.js`

### 7.2 认证和控制器
- 认证控制器: `D:\your-mcp-proxy\AITY_VIP\backend\src\controllers\authController.js`
- 用户控制器: `D:\your-mcp-proxy\AITY_VIP\backend\src\controllers\userController.js`
- JWT工具: `D:\your-mcp-proxy\AITY_VIP\backend\src\utils\jwtUtils.js`

### 7.3 测试和初始化脚本
- VIP用户创建脚本: `D:\your-mcp-proxy\AITY_VIP\backend\scripts\create-vip-test-user.js`
- VIP账号验证脚本: `D:\your-mcp-proxy\AITY_VIP\backend\scripts\verify-vip-account.js`
- 完整测试数据初始化: `D:\your-mcp-proxy\AITY_VIP\backend\init-complete-test-data.js`

---

## 八、常见问题

### Q1: 如何修改VIP账号的密码？

A: 可以通过以下SQL或脚本修改:
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node -e "
require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/db');
const User = require('./src/models/User');
(async () => {
  const user = await User.findOne({
    where: { email: 'vip_test@example.com' }
  });
  const hashedPassword = await bcrypt.hash('新密码', 10);
  await user.update({ password: hashedPassword });
  console.log('密码修改成功');
  await sequelize.close();
})();
"
```

### Q2: 如何切换VIP用户的类型？

A: 可以通过修改role字段来切换:
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node -e "
require('dotenv').config();
const sequelize = require('./src/config/db');
const User = require('./src/models/User');
(async () => {
  const user = await User.findOne({
    where: { email: 'vip_test@example.com' }
  });
  await user.update({ role: 'vip_short' });
  console.log('角色已修改为 vip_short');
  await sequelize.close();
})();
"
```

### Q3: 如何查看所有VIP用户？

A: 运行以下命令:
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node -e "
require('dotenv').config();
const sequelize = require('./src/config/db');
const User = require('./src/models/User');
(async () => {
  const users = await User.findAll({
    where: {
      role: ['vip_mid', 'vip_short']
    }
  });
  console.log('VIP用户列表:');
  users.forEach(u => {
    console.log('-', u.name, '(' + u.email + ') -', u.role);
  });
  await sequelize.close();
})();
"
```

---

## 九、总结

✓ VIP测试账号创建成功
✓ 账号验证通过
✓ 所有测试信息已整理
✓ 提供了完整的登录和使用指南

现在可以使用以下账号进行测试:
- 邮箱: vip_test@example.com
- 密码: 123456
- 角色: vip_mid (VIP中线用户)

如需重新创建账号，可以运行:
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node scripts/create-vip-test-user.js
```

如需验证账号状态，可以运行:
```bash
cd D:\your-mcp-proxy\AITY_VIP\backend
node scripts/verify-vip-account.js
```

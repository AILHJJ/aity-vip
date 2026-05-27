# AITY VIP 测试数据SQL脚本使用指南

## 一、脚本说明

本SQL脚本提供了AITY VIP项目的完整测试数据，覆盖所有功能测试场景。

### 脚本位置
```
D:\your-mcp-proxy\AITY_VIP\backend\scripts\complete-test-data.sql
```

## 二、测试数据概览

### 1. 测试用户（6个账号）

| 序号 | 用户名 | 邮箱 | 密码 | 角色 | 状态 | 过期时间 | 说明 |
|-----|--------|------|------|------|------|----------|------|
| 1 | 超级管理员 | admin@aity.com | 123456 | super_admin | active | 永不过期 | 拥有所有权限 |
| 2 | 管理员 | manager@aity.com | 123456 | admin | active | 永不过期 | 普通管理员权限 |
| 3 | 中线VIP用户 | vip_mid@aity.com | 123456 | vip_mid | active | +365天 | VIP中线订阅用户 |
| 4 | 短线VIP用户 | vip_short@aity.com | 123456 | vip_short | active | +365天 | VIP短线订阅用户 |
| 5 | 试用用户 | trial@aity.com | 123456 | trial | active | 已过期1天 | 体验期已过期 |
| 6 | 测试用户 | vip_test@aity.com | 123456 | vip_mid | active | +180天 | 新测试账号 |

**注意**：密码`123456`需要使用bcrypt加密后才能用于登录。请使用下方的Node.js脚本生成正确的密码哈希值。

### 2. 消息数据（19+条）

#### 按标签分类
- **全部用户消息（5条）**：所有用户可见
  - 盘前点评、早盘点评、风险提示、系统消息、重要消息

- **中线策略消息（4条）**：仅VIP中线用户可见
  - 新能源板块、医药板块、收盘点评、消费板块

- **短线策略消息（3条）**：仅VIP短线用户可见
  - 早盘关注、尾盘关注、尾盘点评

- **混合标签消息（4条）**：多标签组合
  - 市场风格切换、本周展望等

#### 按消息类型分类（10种类型）
- pre_market_comment（盘前点评）
- morning_comment（早盘点评）
- morning_focus（早盘关注）
- afternoon_comment（尾盘点评）
- afternoon_focus（尾盘关注）
- close_comment（收盘点评）
- risk_warning（风险提示）
- system（系统消息）
- important（重要消息）
- daily（日常消息）

#### 按状态分类
- published（已发布）：19条
- scheduled（定时发布）：1条
- draft（草稿）：1条

### 3. 消息附件（8个）
- 图片附件：PNG格式，各类市场分析图表
- PDF附件：政策文档等

### 4. 讨论数据（10条）
- 公开讨论（7条）：所有用户可见
- 私密讨论（3条）：仅管理员和发起者可见
- 已回复（6条）
- 待回复（4条）

### 5. 讨论回复（16条）
- 管理员回复：专业的投资建议
- 用户回复：追问和感谢

### 6. 用户收藏（14条）
- 不同用户收藏了不同的消息

### 7. 已读记录（53条）
- 模拟真实的阅读行为

## 三、执行步骤

### 方式一：使用MySQL命令行（推荐）

#### 1. 连接数据库
```bash
mysql -u root -p
```

#### 2. 选择数据库
```sql
USE `投研图灵室`;
-- 或者使用您的数据库名
```

#### 3. 执行SQL脚本
```sql
source D:/your-mcp-proxy/AITY_VIP/backend/scripts/complete-test-data.sql;
```

或者：
```bash
mysql -u root -p 投研图灵室 < D:/your-mcp-proxy/AITY_VIP/backend/scripts/complete-test-data.sql
```

### 方式二：使用Navicat或其他数据库工具

1. 打开Navicat，连接到MySQL数据库
2. 选择数据库`投研图灵室`
3. 点击"查询" → "新建查询"
4. 打开`complete-test-data.sql`文件
5. 点击"运行"按钮

### 方式三：使用Node.js脚本（需要先生成密码哈希）

先创建一个辅助脚本来生成正确的密码哈希：

```javascript
// generate-password-hash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash for 123456:', hash);
}

generateHash();
```

运行：
```bash
node generate-password-hash.js
```

然后将生成的哈希值替换SQL脚本中的`$2a$10$YourHashedPasswordHere`。

## 四、注意事项

### 1. 密码加密
脚本中的密码哈希值`$2a$10$YourHashedPasswordHere`是占位符，请：
- 使用上述Node.js脚本生成实际的bcrypt哈希值
- 或者使用现有的测试数据创建脚本`create-test-data.js`

### 2. 清理旧数据（可选）
如果需要清理现有测试数据，取消脚本开头注释部分的注释：
```sql
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM discussion_replies;
DELETE FROM discussions;
DELETE FROM user_favorites;
DELETE FROM user_message_reads;
DELETE FROM message_attachments;
DELETE FROM messages;
DELETE FROM users;
DELETE FROM groups_table;
SET FOREIGN_KEY_CHECKS = 1;
```

**警告**：这将删除所有现有数据，请谨慎操作！

### 3. 外键约束
脚本已按照正确的顺序插入数据，避免外键约束问题。

### 4. 重复执行
脚本使用了`ON DUPLICATE KEY UPDATE`子句，可以安全地重复执行而不会报错。

## 五、功能测试场景

使用这些测试数据可以进行以下功能测试：

### 1. 用户认证和授权
- ✅ 不同角色的登录测试
- ✅ 权限验证（超级管理员、普通管理员、VIP用户、试用用户）
- ✅ 过期用户访问控制
- ✅ Token验证

### 2. 消息功能
- ✅ 消息列表（按标签过滤）
- ✅ 消息详情
- ✅ 消息类型筛选（10种类型）
- ✅ 消息搜索（标题、内容）
- ✅ 已读/未读状态
- ✅ 消息收藏/取消收藏
- ✅ 消息附件查看
- ✅ 定时发布功能
- ✅ 草稿功能

### 3. 讨论功能
- ✅ 创建讨论（公开/私密）
- ✅ 讨论列表（按消息筛选）
- ✅ 讨论详情
- ✅ 回复讨论
- ✅ 讨论可见性控制
- ✅ 讨论状态（待回复/已回复）

### 4. 管理功能（仅管理员）
- ✅ 用户管理（查看、编辑、删除用户）
- ✅ 消息管理（创建、编辑、删除、发布消息）
- ✅ 讨论管理（查看所有讨论）
- ✅ 数据统计
  - 用户统计
  - 消息统计
  - 讨论统计
  - 收藏统计

### 5. 边界情况测试
- ✅ 过期用户访问VIP内容
- ✅ 无权限访问
- ✅ 数据分页
- ✅ 空数据处理
- ✅ 并发操作

## 六、测试用例示例

### 测试用例1：用户登录和权限验证
```bash
# 超级管理员登录
POST /api/auth/login
{
  "email": "admin@aity.com",
  "password": "123456"
}

# 验证可以访问所有消息
GET /api/messages

# 验证可以访问用户管理
GET /api/admin/users
```

### 测试用例2：VIP用户访问控制
```bash
# 中线VIP用户登录
POST /api/auth/login
{
  "email": "vip_mid@aity.com",
  "password": "123456"
}

# 验证只能看到中线策略和全部用户消息
GET /api/messages

# 验证看不到短线策略消息
# messageId: 10, 11, 12 应该不在列表中
```

### 测试用例3：过期用户访问
```bash
# 试用用户登录（已过期）
POST /api/auth/login
{
  "email": "trial@aity.com",
  "password": "123456"
}

# 验证只能看到系统消息
GET /api/messages
# 应该只返回 group_id='all' 的消息
```

### 测试用例4：讨论功能
```bash
# 创建讨论
POST /api/discussions
{
  "messageId": 1,
  "title": "测试讨论标题",
  "content": "测试讨论内容",
  "visibility": "public"
}

# 回复讨论
POST /api/discussions/:id/replies
{
  "content": "这是回复内容"
}

# 验证讨论状态更新
GET /api/discussions/:id
```

## 七、数据验证

执行完脚本后，可以运行以下SQL验证数据：

```sql
-- 验证用户数据
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- 验证消息数据
SELECT type, COUNT(*) as count FROM messages GROUP BY type;

-- 验证讨论数据
SELECT status, visibility, COUNT(*) as count FROM discussions GROUP BY status, visibility;

-- 验证已读状态
SELECT m.title, COUNT(r.user_id) as read_count
FROM messages m
LEFT JOIN user_message_reads r ON m.id = r.message_id
GROUP BY m.id, m.title;
```

## 八、常见问题

### Q1: 执行SQL时报密码错误
A: 需要先生成bcrypt密码哈希值，参考上述"方式三"。

### Q2: 外键约束错误
A: 确保按照正确的顺序执行SQL，不要跳过任何部分。

### Q3: 中文乱码
A: 确保数据库字符集为utf8mb4：
```sql
ALTER DATABASE `投研图灵室` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

### Q4: 无法使用试用用户登录
A: 试用用户已过期（`expire_date` = 当前时间-1天），这是正常的测试数据设计。

## 九、补充说明

### 现有测试数据脚本
项目中已有Node.js版本的测试数据脚本：
- `backend/scripts/create-test-data.js`：基础测试数据
- `backend/scripts/create-vip-test-user.js`：VIP测试用户创建
- `backend/scripts/verify-vip-account.js`：VIP账号验证

本SQL脚本是对这些脚本的补充和完善，提供更完整的测试数据覆盖。

### 推荐使用方式
1. 开发环境：使用Node.js脚本（`create-test-data.js`）
2. 测试环境：使用SQL脚本（`complete-test-data.sql`）
3. 生产环境：禁止使用任何测试数据脚本！

## 十、维护和更新

如需更新测试数据，请：
1. 修改SQL脚本
2. 更新本说明文档
3. 同步更新Node.js版本的测试数据脚本
4. 记录版本号和修改日期

---

**脚本版本**：v1.0
**创建日期**：2026-02-06
**最后更新**：2026-02-06
**维护者**：AITY VIP Team

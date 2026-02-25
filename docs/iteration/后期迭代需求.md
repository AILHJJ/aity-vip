# 后期迭代需求

> 本文档记录已规划但暂未实现的功能需求，供后续迭代参考。
> 创建日期：2026-02-25
> 最后更新：2026-02-25

---

## 1. 分组管理员功能 ✅ 已实现

### 需求背景
当前系统中所有 `admin` 角色的管理员可以管理所有用户。随着团队规模扩大，需要让不同的管理员只管理自己分组的用户。

### 功能描述
- 每个 `admin` 管理员属于一个特定分组（group）
- `admin` 只能管理自己分组内的用户（查看、创建、编辑、删除）
- `super_admin` 可以管理所有用户，可以调整管理员的分组
- 创建用户时自动继承管理员的分组

### 技术实现

#### 后端变更（已实现）
```javascript
// userController.js - getAllUsers
// 分组管理员权限过滤：admin 只能管理自己分组的用户
if (currentUserRole === 'admin') {
  const currentUser = await User.findByPk(currentUserId);
  if (currentUser && currentUser.group_id) {
    whereClause.group_id = currentUser.group_id;
  }
}

// userController.js - createUser
// admin 只能创建自己分组的用户
if (currentUserRole === 'admin') {
  const currentUser = await User.findByPk(currentUserId);
  finalGroupId = currentUser?.group_id || null;
}
```

#### 前端变更（已实现）
- 创建用户时自动继承 `userStore.userInfo?.groupId`
- 编辑用户时保留原有 `groupId`
- 保存时发送 `groupId` 到后端

### 权限矩阵

| 操作 | super_admin | admin（有分组） | admin（无分组） |
|------|-------------|----------------|----------------|
| 查看所有用户 | ✅ | ❌ 只看本分组 | ❌ 空列表 |
| 创建任意分组用户 | ✅ | ❌ 只能本分组 | ❌ |
| 编辑任意用户 | ✅ | ❌ 只能本分组 | ❌ |
| 删除任意用户 | ✅ | ❌ 只能本分组 | ❌ |

### 拓展难度
**低** - 数据库结构已支持，后端权限过滤逻辑已实现。

---

## 2. VIP会员周期体系 ✅ 已实现

### 需求背景
系统需要支持多种VIP会员周期，包括月度、季度、半年、年度等，方便管理员灵活配置用户有效期。

### 功能描述
- VIP用户默认1个月（30天）
- 体验用户默认7天
- 快速延期选项：月度、季度、半年、年度
- 管理员可手动调整任意有效期

### 默认配置

| 角色 | 默认到期时间 | 快速延期选项 |
|------|-------------|-------------|
| **vip_short** | 1个月（30天） | +1月, +3月, +半年, +1年 |
| **vip_mid** | 1个月（30天） | +1月, +3月, +半年, +1年 |
| **trial** | 7天 | +7天 |
| **admin/super_admin** | 永久有效 | 无 |

### 技术实现
```javascript
// 前端 - 快速延期按钮
const quickExtendOptions = [30, 90, 180, 365]  // VIP
const trialExtendOptions = [7]  // 体验用户

// 后端 - 默认角色
role: role || 'vip_short'  // 创建用户时默认短线VIP
```

---

## 3. 其他待规划功能

（后续可在此添加其他迭代需求）

---

## 变更记录

| 日期 | 内容 | 作者 |
|------|------|------|
| 2026-02-25 | 创建文档，添加分组管理员功能需求 | 开发团队 |
| 2026-02-25 | 实现分组管理员功能，更新权限矩阵 | 开发团队 |
| 2026-02-25 | 实现VIP会员周期体系，默认角色改为vip_short | 开发团队 |

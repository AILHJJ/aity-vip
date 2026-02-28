# VIP测试账号快速参考

> 最后更新：2026-02-28

---

## 快速登录信息

### 管理员账号（推荐测试使用）
```
用户名: admin
邮箱: admin@example.com
密码: 123456
角色: super_admin
```

### VIP测试账号
```
用户名: 等风来
邮箱: 625668823@qq.com
密码: 112044
角色: vip_short
```

### VIP中线测试账号
```
用户名: vip_test
邮箱: vip_test@example.com
密码: 123456
角色: vip_mid
```

---

## 所有测试账号一览

| 用户名 | 邮箱 | 密码 | 角色 | 环境 |
|--------|------|------|------|------|
| Admin | admin@example.com | 123456 | super_admin | 生产+测试 |
| SubAdmin | subadmin@example.com | 123456 | admin | 生产+测试 |
| 体验用户 | trial@example.com | 123456 | trial | 生产 |
| vip_test | vip_test@example.com | 123456 | vip_mid | 生产 |
| 等风来 | 625668823@qq.com | 112044 | vip_short | 生产+测试 |
| VIP中线用户 | vip_mid@example.com | 123456 | vip_mid | 测试 |
| 妮儿 | 123456@qq.com | 123456 | vip_short | 测试 |

---

## 数据库环境

| 环境 | 数据库名 | 说明 |
|------|----------|------|
| 生产 | 投研图灵室 | 真实用户数据 |
| 测试 | 投研图灵室_test | 开发测试数据 |

---

## 登录API示例

```bash
# 管理员登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# VIP用户登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"等风来","password":"112044"}'
```

---

## 注意事项

1. **体验用户** trial 账户可能已过期，需延期后使用
2. **生产环境** 请勿执行破坏性测试
3. **Token有效期** 24小时

---

**完整文档**: `docs/testing/测试账户参考.md`

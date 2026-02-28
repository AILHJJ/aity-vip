# AITY VIP 快速参考卡

> 精简版核心信息，用于快速上下文加载

---

## 项目结构

```
D:\your-mcp-proxy\AITY_VIP\
├── backend/              # 后端 (Express + MySQL)
├── aity-uni-app-v2/      # 前端 (uni-app + Vue3)
└── docs/                 # 文档
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + uni-app + Vite + Pinia |
| 后端 | Node.js + Express + Sequelize |
| 数据库 | MySQL 5.7+ |
| 部署 | PM2 + Nginx |

---

## 用户角色

| 角色 | 权限 |
|------|------|
| `super_admin` | 全部权限 |
| `admin` | 管理本分组 + 发布消息 |
| `vip_mid` | 查看中线策略消息 |
| `vip_short` | 查看短线策略消息 |
| `trial` | 查看所有消息（7天试用） |

---

## 消息标签规则

| 标签 | 可见用户 |
|------|----------|
| 短线策略 | vip_short, trial, admin |
| 中线策略 | vip_mid, trial, admin |
| 全部用户 | 所有用户 |
| 无标签 | 所有用户 |

---

## API 响应格式

```javascript
// 成功
{ code: 200, message: "Success", data: {...} }

// 失败
{ code: 400/401/403/404/500, message: "错误信息" }
```

---

## 前端组件规范

### 必须使用 uni-app 组件
```vue
<!-- ✅ 正确 -->
<view>, <text>, <image>, <button>, <input>

<!-- ❌ 错误（小程序不支持） -->
<div>, <span>, <img>
```

### 条件编译
```vue
<!-- #ifdef H5 -->
<el-button>Element Plus组件</el-button>
<!-- #endif -->

<!-- #ifdef MP-WEIXIN -->
<button>uni-app组件</button>
<!-- #endif -->
```

### 路由跳转
```javascript
// ✅ 正确
uni.navigateTo({ url: '/pages/detail/detail' })

// ❌ 错误（小程序不支持）
router.push('/pages/detail')
```

### 网络请求
```javascript
// ✅ 正确
uni.request({ url: '...', method: 'GET' })

// ❌ 错误（小程序不支持）
axios.get('...')
```

---

## 后端规范

### 统一响应
```javascript
const { success, error, unauthorized, forbidden } = require('../utils/responseUtils');

// 成功
res.json(success(data, '操作成功'));

// 失败
res.status(401).json(unauthorized('未授权'));
```

### 认证中间件
```javascript
const { authenticateToken, checkAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, controller.getList);
router.post('/', authenticateToken, checkAdmin, controller.create);
```

---

## 端口配置

| 服务 | 开发环境 | 生产环境 |
|------|----------|----------|
| 前端 | localhost:5173 | aity88.online:8443 |
| 后端 | localhost:3001 | aity88.online:8443/api |
| 数据库 | localhost:3306 | 124.221.119.134:3306 |

---

## 常用命令速查

```bash
# 启动开发环境
cd backend && npm run dev
cd aity-uni-app-v2 && npm run dev:h5

# 编译
npm run build:h5          # H5版本
npm run build:mp-weixin   # 微信小程序

# 部署
cd scripts && full-deploy.bat   # 完整部署

# Git
git add . && git commit -m "feat: 描述" && git push
```

---

## 测试账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | 123456 | 管理员 |
| 等风来 | 112044 | VIP用户 |

---

**更新**: 2026-02-28

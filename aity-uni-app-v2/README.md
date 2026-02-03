# VIP投研内部分享系统

> 一个面向内部用户的私密投研分享平台，支持多端运行（H5、微信小程序、支付宝小程序）

## 项目简介

VIP投研内部分享系统是一个高端的金融知识学习平台，提供系统的研究方法论与案例分析，帮助建立知识体系与分析能力。内容为学术交流，不构成任何投资建议。

### 核心功能

- **消息管理** - 管理员发布盘前点评、早盘关注、风险提示等各类投研消息
- **权限控制** - 支持5级用户角色（超级管理员、管理员、VIP中线、VIP短线、体验用户）
- **讨论互动** - 用户可发起讨论、回复讨论，支持公开/私密讨论
- **数据统计** - 用户增长、消息发布、活跃用户等多维度数据统计
- **收藏功能** - 收藏重要消息，便于后续查看

## 技术栈

### 前端
- **框架**: uni-app 3.0
- **Vue版本**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **UI组件**: 自定义组件 + uni-ui
- **时间处理**: dayjs
- **代码规范**: ESLint + Prettier

### 后端
- **框架**: Express.js
- **数据库**: MySQL
- **ORM**: Sequelize
- **认证**: JWT (JSON Web Token)
- **文件上传**: Multer

## 项目结构

```
aity-uni-app-v2/
├── docs/                   # 项目文档
│   ├── REQUIREMENTS.md     # 需求文档
│   ├── OPTIMIZATION.md     # 优化方案
│   ├── DESIGN.md          # 设计规范
│   ├── ISSUES.md          # 问题追踪
│   └── DEVELOPMENT.md     # 开发指南
├── public/                 # 静态资源
├── scripts/               # 构建脚本
├── src/
│   ├── api/               # API接口
│   │   ├── auth.js        # 认证接口
│   │   ├── message.js     # 消息接口
│   │   ├── discussion.js  # 讨论接口
│   │   ├── user.js        # 用户管理接口
│   │   └── stats.js       # 统计接口
│   ├── pages/             # 页面组件
│   │   ├── login/         # 登录页
│   │   ├── messages/      # 消息列表
│   │   ├── message-detail/# 消息详情
│   │   ├── discussions/   # 讨论列表
│   │   ├── profile/       # 个人中心
│   │   └── ...
│   ├── store/             # 状态管理
│   │   └── user.js        # 用户状态
│   ├── utils/             # 工具函数
│   │   ├── request.js     # 请求封装
│   │   ├── constants.js   # 常量定义
│   │   └── time.js        # 时间处理
│   ├── App.vue            # 应用入口
│   ├── main.js            # 主文件
│   ├── pages.json         # 页面配置
│   └── manifest.json      # 应用配置
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 微信开发者工具（小程序开发）
- HBuilderX 或 VS Code（推荐）

### 安装依赖

```bash
npm install
```

### 本地开发

#### H5开发
```bash
npm run dev:h5
# 访问 http://localhost:5173
```

#### 微信小程序开发
```bash
# 1. 启动后端服务（确保后端运行在 http://192.168.2.140:3001）
cd ../backend
npm start

# 2. 编译小程序
npm run dev:mp-weixin

# 3. 使用微信开发者工具打开 dist/dev/mp-weixin 目录
```

### 生产构建

```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# 支付宝小程序
npm run build:mp-alipay
```

## 配置说明

### API配置

在 `src/utils/request.js` 中配置API基础地址：

```javascript
// 开发环境
const BASE_URL = process.env.NODE_ENV === 'development'
  ? (typeof window !== 'undefined' ? '/api' : 'http://192.168.2.140:3001/api')
  : 'https://aity88.online:8443/api'  // 生产环境
```

### 小程序配置

在 `src/manifest.json` 中配置小程序AppID：

```json
{
  "mp-weixin": {
    "appid": "wxb16a33cdd58f05d3",
    "setting": {
      "urlCheck": false  // 开发环境关闭域名检查
    }
  }
}
```

## 用户角色与权限

| 角色 | 代码 | 权限说明 |
|------|------|---------|
| 超级管理员 | `super_admin` | 所有权限，包括用户管理、数据统计 |
| 管理员 | `admin` | 发布消息、查看数据统计 |
| VIP中线用户 | `vip_mid` | 查看中线策略和全部用户消息 |
| VIP短线用户 | `vip_short` | 查看短线策略和全部用户消息 |
| 体验用户 | `trial` | 查看所有消息，有时间限制 |

## 测试账号

```
超级管理员: admin@example.com / 123456
管理员: subadmin@example.com / 123456
VIP中线用户: vip_mid@example.com / 123456
VIP短线用户: vip_short@example.com / 123456
体验用户: trial@example.com / 123456
```

## 常见问题

### 1. 小程序请求失败

**原因**: 域名未配置或网络不通

**解决**:
- 确保后端服务正常运行
- 微信开发者工具勾选"不校验合法域名"
- 确认手机和电脑在同一局域网

### 2. 管理员功能不可见

**解决**:
- 使用管理员账号登录
- 检查控制台用户信息是否正确加载
- 查看 `docs/ISSUES.md` 详细排查步骤

### 3. 数据显示为空

**解决**:
- 确认后端数据库已初始化测试数据
- 检查API请求是否成功
- 使用管理员账号查看所有消息

## 文档导航

- [需求文档](./docs/需求文档.md) - 产品需求与功能说明
- [优化方案](./docs/优化方案.md) - UI/UX/功能优化计划
- [设计规范](./docs/设计规范.md) - UI设计规范与组件标准
- [问题追踪](./docs/问题追踪.md) - 已知问题与解决方案
- [开发指南](./docs/开发指南.md) - 开发规范与最佳实践

## 版本历史

### v1.0.0 (2024-01-30)
- 初始版本发布
- 实现核心功能：消息、讨论、用户管理
- 支持H5和微信小程序

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目仅供内部使用，未经授权不得外传。

## 联系方式

- 项目地址: [GitHub](https://github.com/your-org/aity-vip)
- 问题反馈: [Issues](https://github.com/your-org/aity-vip/issues)

---

**⚠️ 免责声明**: 本平台内容为学术交流，不构成任何投资建议。投资有风险，入市需谨慎。

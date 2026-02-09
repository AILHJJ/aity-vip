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
├── docs/                   # 📚 项目文档（按类别组织）
│   ├── README.md          # 文档导航索引
│   ├── 00-核心规范/        # AI编程规范
│   ├── 01-部署指南/        # 部署方案和指南
│   ├── 02-功能文档/        # 功能详细文档
│   ├── 03-版本记录/        # 版本历史
│   ├── 04-技术文档/        # 技术规范
│   └── 05-归档文档/        # 历史归档
├── scripts/               # 构建和部署脚本
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

**📚 完整文档索引**: [docs/README.md](./docs/README.md)

### 核心文档
- **[AI编程交互关键规范](./docs/00-核心规范/AI编程交互关键规范.md)** - 核心概念澄清（必读！）
- **[AI编码交互规范与最佳实践](./docs/00-核心规范/AI编码交互规范与最佳实践.md)** - 完整开发规范
- **[三种部署方案完整指南](./docs/01-部署指南/三种部署方案完整指南.md)** - 部署方案选择（必读！）

### 快速链接
- **[需求文档](./docs/00-核心规范/需求文档.md)** - 产品需求与功能说明
- **[需求文档更新说明](./docs/00-核心规范/需求文档更新说明-v1.6.0.md)** - 需求与实现对比
- **[优化方案](./docs/05-归档文档/优化方案.md)** - UI/UX/功能优化计划
- **[设计规范](./docs/04-技术文档/设计规范.md)** - UI设计规范与组件标准
- **[问题追踪](./docs/04-技术文档/问题追踪.md)** - 已知问题与解决方案
- **[开发指南](./docs/04-技术文档/开发指南.md)** - 开发规范与最佳实践

## 版本历史

### v1.5.1 (2025-02-03) - 正式发布版本
- 优化标签UI显示，添加语义图标（⚡短线策略、📈中线策略、👥全部用户）
- 增强标签视觉效果（渐变背景、细边框、改进间距）
- 修复标签值格式兼容性问题
- 完善设计系统应用

### v1.5.0 (2025-02-03) - UI全面升级
- 建立完整设计系统（`src/styles/tokens.scss`）
- 实现10种消息类型独特配色方案
- 优化用户标签样式，3种清晰区分
- 添加阴影效果和过渡动画
- 统一间距、圆角、字体层级

### v1.4.3 (2025-02-02)
- 修复MESSAGE_TAG_LABELS未定义错误
- 优化消息创建页面标签导入

### v1.4.2 (2025-02-02)
- 修复微信小程序chooseFile不兼容问题
- 更新getFileInfo API为最新版本
- 优化用户取消操作体验
- 添加图片粘贴功能UI提示

### v1.4.0 (2025-02-01)
- 实现消息已读/未读状态管理
- 添加骨架屏加载效果
- 优化搜索历史记录功能
- 改进视觉层次和空状态设计
- 实现P0-P3级全面优化

### v1.3.0 (2025-01-31)
- 优化消息列表性能
- 改进下拉刷新和上拉加载体验
- 统一组件样式

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

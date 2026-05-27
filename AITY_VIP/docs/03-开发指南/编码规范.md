# VIP投研内部分享系统 - 开发指南

> **元数据**
> - 文档版本：v2.0.0
> - 更新日期：2026-01-30
> - 适用人群：开发人员
> - 文档分类：开发规范

---

## 技术栈说明

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **基础框架** | Vue 3 (Composition API) | 前端框架 |
| **构建工具** | Vite 4.x | 构建工具 |
| **UI组件库** | Element Plus 2.x | UI组件 |
| **状态管理** | Pinia 2.x | 状态管理 |
| **路由管理** | Vue Router 4.x | 路由管理 |
| **HTTP客户端** | Axios 1.x | HTTP请求 |
| **富文本渲染** | Marked 11.x + DOMPurify 3.x | Markdown渲染 |
| **图表库** | ECharts 5.x | 数据可视化 |
| **日期处理** | Day.js 1.x | 日期处理 |
| **表单验证** | VeeValidate 4.x + Yup 1.x | 表单验证 |
| **样式方案** | SCSS 1.x | CSS预处理器 |
| **代码规范** | ESLint 8.x + Prettier 3.x | 代码质量 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **运行环境** | Node.js v20.20.0+ | 运行时环境 |
| **Web框架** | Express.js | Web框架 |
| **数据库** | MySQL 5.7.0+ | 关系型数据库 |
| **ORM框架** | Sequelize | ORM框架 |
| **身份认证** | JWT | 身份认证 |
| **进程管理** | PM2 6.x | 进程管理 |
| **文件上传** | Multer | 文件上传 |
| **安全防护** | Helmet, CORS, Express Rate Limit | 安全防护 |

---

## 架构设计

### 前端架构

```
┌─────────────────────────────────────────────────────────┐
│                     前端应用                            │
├─────────────────┬─────────────────┬─────────────────────┤
│   页面层        │   组件层        │   服务层            │
├─────────────────┼─────────────────┼─────────────────────┤
│ 登录/注册页     │ 消息卡片组件    │ API服务             │
│ 消息列表页      │ 讨论组件        │ 缓存服务            │
│ 消息详情页      │ 富文本编辑器    │ 认证服务            │
│ 讨论页         │ 用户头像组件    │ 工具函数            │
│ 用户管理页      │ 统计图表组件    │ 状态管理            │
│ 统计分析页      │ 表单组件        │                     │
└─────────────────┴─────────────────┴─────────────────────┘
```

### 后端架构

```
┌─────────────────────────────────────────────────────────┐
│                     后端服务                            │
├─────────────────┬─────────────────┬─────────────────────┤
│   路由层        │   控制器层      │   服务层            │
├─────────────────┼─────────────────┼─────────────────────┤
│ 认证路由        │ 认证控制器      │ 数据库服务          │
│ 消息路由        │ 消息控制器      │ 缓存服务            │
│ 讨论路由        │ 讨论控制器      │ 邮件服务            │
│ 用户路由        │ 用户控制器      │ 文件服务            │
│ 分组路由        │ 分组控制器      │ 统计服务            │
│ 统计路由        │ 统计控制器      │ 安全服务            │
└─────────────────┴─────────────────┴─────────────────────┘
```

---

## 代码风格规范

### JavaScript/TypeScript

- **缩进**：2个空格
- **分号**：使用分号
- **引号**：单引号优先
- **变量命名**：
  - 常量：`UPPER_SNAKE_CASE`
  - 变量/函数：`camelCase`
  - 类名：`PascalCase`
- **最大行宽**：100个字符
- **空行**：函数之间、逻辑块之间使用空行
- **注释**：关键逻辑添加注释

### Vue组件

- **组件命名**：
  - 文件名：`kebab-case`
  - 组件名：`PascalCase`
- **Props**：
  - 命名：`camelCase`
  - 类型：明确类型定义
  - 默认值：合理设置默认值
- **事件**：
  - 命名：`kebab-case`
  - 传递参数：使用对象形式
- **样式**：
  - 组件样式使用scoped
  - 全局样式放在公共目录

### SCSS

- **缩进**：2个空格
- **命名**：`kebab-case`
- **嵌套**：最多3层嵌套
- **变量**：使用`$`前缀
- **混合器**：使用`@mixin`和`@include`
- **导入**：使用`@import`导入公共样式

---

## 文件结构规范

### 前端文件结构

```
aity-uni-app-v2/
├── public/            # 静态资源
├── src/
│   ├── assets/        # 资源文件
│   ├── components/    # 公共组件
│   ├── pages/         # 页面
│   ├── services/      # 服务
│   ├── store/         # 状态管理
│   ├── utils/         # 工具函数
│   ├── router/        # 路由
│   ├── styles/        # 样式文件
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── .eslintrc.js       # ESLint配置
├── .prettierrc        # Prettier配置
├── vite.config.js     # Vite配置
└── package.json       # 依赖管理
```

### 后端文件结构

```
backend/
├── src/
│   ├── controllers/   # 控制器
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── middleware/    # 中间件
│   ├── services/      # 服务
│   ├── utils/         # 工具函数
│   ├── config/        # 配置
│   └── app.js         # 应用入口
├── .env               # 环境变量
├── .eslintrc.js       # ESLint配置
└── package.json       # 依赖管理
```

---

## 命名规范

### 变量命名

- **布尔变量**：使用`is`、`has`、`can`等前缀
  - 示例：`isLoggedIn`、`hasPermission`、`canEdit`
- **数组变量**：使用复数形式
  - 示例：`users`、`messages`、`discussions`
- **函数命名**：
  - 动词+名词形式
  - 示例：`getUser`、`createMessage`、`updateDiscussion`
- **常量命名**：全部大写，下划线分隔
  - 示例：`MAX_PAGE_SIZE`、`TOKEN_EXPIRES_IN`

### 组件命名

- **基础组件**：`Base`前缀
  - 示例：`BaseButton`、`BaseInput`
- **业务组件**：使用业务名称
  - 示例：`MessageCard`、`DiscussionItem`
- **页面组件**：使用页面名称
  - 示例：`LoginPage`、`MessageListPage`

### API命名

- **路由路径**：使用小写，连字符分隔
  - 示例：`/api/users`、`/api/messages`
- **HTTP方法**：
  - `GET`：获取资源
  - `POST`：创建资源
  - `PUT`：更新资源
  - `DELETE`：删除资源
- **参数命名**：使用`camelCase`
  - 示例：`pageSize`、`startDate`

---

## 开发流程

### 1. 环境搭建

1. **克隆仓库**：
   ```bash
   git clone https://github.com/AILHJJ/aity-vip.git
   cd AITY_VIP
   ```

2. **安装依赖**：
   ```bash
   # 后端
   cd backend
   npm install

   # 前端
   cd ../aity-uni-app-v2
   npm install
   ```

3. **配置环境变量**：
   - 复制`.env.example`为`.env`
   - 填写相关配置

4. **启动服务**：
   ```bash
   # 后端
   cd backend
   npm start

   # 前端
   cd ../aity-uni-app-v2
   npm run dev
   ```

### 2. 开发规范

1. **代码提交**：
   - 遵循Git分支管理规范
   - 使用语义化提交信息
   - 提交前运行lint和测试

2. **代码审查**：
   - 提交PR前进行自我审查
   - 团队成员进行代码审查
   - 确保代码质量和一致性

3. **测试规范**：
   - 编写单元测试
   - 进行集成测试
   - 确保测试覆盖率

### 3. 发布流程

1. **构建项目**：
   ```bash
   # 前端H5版本
   cd aity-uni-app-v2
   npm run build:h5

   # 前端小程序版本
   npm run build:mp-weixin
   ```

2. **部署项目**：
   - 上传构建产物到服务器
   - 配置Nginx
   - 重启服务

3. **验证部署**：
   - 访问应用
   - 测试核心功能
   - 监控系统状态

---

## 最佳实践

### 前端最佳实践

1. **组件设计**：
   - 单一职责原则
   - 可复用性
   - 可测试性

2. **状态管理**：
   - 合理使用Pinia
   - 避免过度使用全局状态
   - 状态命名清晰

3. **性能优化**：
   - 组件懒加载
   - 图片优化
   - 减少HTTP请求
   - 使用缓存

4. **安全性**：
   - 防止XSS攻击
   - 防止CSRF攻击
   - 敏感信息加密

### 后端最佳实践

1. **API设计**：
   - RESTful风格
   - 统一响应格式
   - 合理的错误处理

2. **数据库设计**：
   - 合理的表结构
   - 索引优化
   - 事务管理

3. **性能优化**：
   - 缓存使用
   - 数据库查询优化
   - 并发处理

4. **安全性**：
   - 密码加密
   - 权限验证
   - 防止SQL注入
   - 防止暴力破解

### 小程序开发最佳实践

1. **代码适配**：
   - 使用条件编译处理平台差异
   - 遵循各平台的开发规范

2. **性能优化**：
   - 减少首屏加载时间
   - 合理使用缓存
   - 避免频繁更新UI

3. **用户体验**：
   - 响应迅速
   - 操作流畅
   - 界面美观

4. **安全性**：
   - 遵循小程序平台的安全规范
   - 防止敏感信息泄露

---

## 开发资源

### 官方文档

- [Vue 3官方文档](https://cn.vuejs.org/)
- [Element Plus官方文档](https://element-plus.org/zh-CN/)
- [Vite官方文档](https://vitejs.dev/guide/)
- [Pinia官方文档](https://pinia.vuejs.org/zh/)
- [Vue Router官方文档](https://router.vuejs.org/zh/)
- [Axios官方文档](https://axios-http.com/zh/docs/intro)
- [Express.js官方文档](https://expressjs.com/zh-cn/)
- [Sequelize官方文档](https://sequelize.org/docs/v6/)
- [uni-app官方文档](https://uniapp.dcloud.net.cn/)

### 工具推荐

- **VS Code**：代码编辑器
- **微信开发者工具**：小程序开发和调试
- **Postman**：API测试
- **MySQL Workbench**：数据库管理
- **Git**：版本控制

### 插件推荐

- **ESLint**：代码质量检查
- **Prettier**：代码格式化
- **Vetur**：Vue.js 工具
- **uni-app 插件**：uni-app 开发支持
- **GitLens**：Git增强工具

---

**项目维护者：** 开发团队
**最后更新：** 2026-01-30
**版本：** v2.0.0

# 5分钟快速开始

> **元数据**
> - 文档版本：v2.0.0
> - 更新日期：2026-01-30
> - 适用人群：新加入项目的开发者
> - 文档分类：入门指南
> - 预计耗时：5分钟

---

## 前置条件

确保你的开发环境已安装以下软件：

- **Node.js** v20.20.0+ ([下载地址](https://nodejs.org/))
- **Git** 2.0.0+ ([下载地址](https://git-scm.com/))
- **MySQL** 5.7.0+ ([下载地址](https://dev.mysql.com/downloads/))
- **VS Code** ([下载地址](https://code.visualstudio.com/))

---

## 快速开始（5步）

### 步骤1：克隆项目

```bash
git clone https://github.com/AILHJJ/aity-vip.git
cd AITY_VIP
```

### 步骤2：安装后端依赖

```bash
cd backend
npm install
```

### 步骤3：安装前端依赖

```bash
cd ../aity-uni-app-v2
npm install
```

### 步骤4：配置数据库

1. 创建数据库：
   ```sql
   CREATE DATABASE private_sharing_app;
   ```

2. 导入数据库脚本：
   ```bash
   mysql -u root -p private_sharing_app < database.sql
   ```

3. 配置后端数据库连接（编辑 `backend/.env`）：
   ```
   DB_NAME=private_sharing_app
   DB_USER=root
   DB_PASS=your_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

### 步骤5：启动项目

**启动后端服务**（在 `backend` 目录）：
```bash
npm start
```

**启动前端服务**（在 `aity-uni-app-v2` 目录）：
```bash
# H5版本
npm run dev:h5

# 微信小程序版本
npm run dev:mp-weixin
```

---

## 访问应用

| 环境 | 访问地址 | 说明 |
|------|----------|------|
| **本地H5** | http://localhost:5173 | 浏览器访问 |
| **生产环境** | https://aity88.online:8443 | 云服务器 |

---

## 验证安装

1. **后端服务**：访问 http://localhost:3000/api/health
2. **前端页面**：打开浏览器访问 http://localhost:5173
3. **小程序**：使用微信开发者工具打开 `aity-uni-app-v2` 目录

---

## 常见问题

### Q1: npm install 失败？

**解决方案**：切换npm镜像源
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q2: 数据库连接失败？

**解决方案**：检查MySQL服务是否启动
```bash
# Windows
net start MySQL

# macOS/Linux
sudo systemctl start mysql
```

### Q3: 端口被占用？

**解决方案**：修改端口配置
- 后端端口：编辑 `backend/.env` 中的 `PORT`
- 前端端口：编辑 `aity-uni-app-v2/vite.config.js`

### Q4: 小程序开发工具报错？

**解决方案**：
1. 确保已安装微信开发者工具
2. 在工具中导入 `aity-uni-app-v2` 目录
3. 点击"编译"按钮

---

## 下一步

- 📖 阅读 [项目概述](./project-overview.md) 了解项目详情
- 🔧 查看 [开发指南](../03-development/coding-standards.md) 学习开发规范
- 📋 参考 [Git工作流](../03-development/git-workflow.md) 了解代码提交流程

---

**需要帮助？**
- 📧 联系项目负责人
- 📚 查看 [完整文档](../)
- 💬 在项目Issue中提问

---

**项目维护者：** 开发团队
**最后更新：** 2026-01-30
**版本：** v2.0.0

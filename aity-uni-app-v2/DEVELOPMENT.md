# AITY Uni-App V2 开发规范

## 📋 开发流程规范

### 标准迭代流程

1. **本地开发阶段 (dev版本)**
   - 修改代码后，先编译 dev 版本
   - dev版本连接：本地后台 (192.168.2.140:3001) + test数据库
   - 在微信开发者工具中测试功能
   - 确保本地测试通过

2. **验收阶段**
   - 开发者完成本地测试后，提示验收
   - 等待验收通过确认

3. **远程部署阶段 (build版本)**
   - 验收通过后，询问是否更新远程环境
   - build版本连接：腾讯云远程后端 + 正式环境数据库
   - 编译并部署到生产环境

## 🔧 环境配置

### 开发环境 (.env / .env.development.local)
```
VITE_APP_API_BASE_URL=http://192.168.2.140:3001/api
VITE_APP_STORAGE_PREFIX=aity_vip_local_
VITE_APP_DEBUG=true
```
- 连接本地后台
- 使用 test 数据库
- 开启调试模式

### 生产环境 (.env.production)
```
VITE_APP_API_BASE_URL=https://your-tencent-cloud-api.com/api
VITE_APP_STORAGE_PREFIX=aity_vip_prod_
VITE_APP_DEBUG=false
```
- 连接腾讯云远程后端
- 使用正式环境数据库
- 关闭调试模式

## 📦 编译命令

### 开发版本编译
```bash
# 编译微信小程序开发版本
npm run dev:mp-weixin

# 或者指定环境变量
VITE_ENV=development npm run dev:mp-weixin
```

### 生产版本编译
```bash
# 编译微信小程序生产版本
npm run build:mp-weixin

# 或者指定环境变量
VITE_ENV=production npm run build:mp-weixin
```

## ⚠️ 重要注意事项

1. **禁止直接修改生产环境**
   - 所有修改必须先经过本地 dev 版本测试
   - 验收通过后才能部署到生产环境

2. **数据库操作规范**
   - 本地开发使用 test 数据库
   - 生产环境使用正式数据库
   - 数据库结构变更需要同步更新两个环境

3. **回滚机制**
   - 如果生产环境出现问题，立即回滚到上一个稳定版本
   - 排查问题在本地 dev 环境进行

4. **CodeBuddy AI 协助规范**
   - AI 协助修改代码后，必须先进行本地测试
   - AI 不应该直接修改生产环境配置
   - 所有生产环境变更需要人工确认

## 🚀 部署流程

### 本地开发部署
1. 修改代码
2. 运行 `npm run dev:mp-weixin`
3. 在微信开发者工具中导入 dist/dev/mp-weixin 目录
4. 测试功能
5. 验收通过

### 生产环境部署
1. 验收通过后，运行 `npm run build:mp-weixin`
2. 将 dist/build/mp-weixin 目录上传到微信小程序后台
3. 提交审核
4. 发布正式版本

## 📝 版本管理

- dev 版本：用于本地开发和测试
- build 版本：用于生产环境部署
- 建议每次部署前打上 git tag 标记版本号

## 🔒 安全规范

1. **API 地址管理**
   - 开发和生产环境使用不同的 API 地址
   - 生产环境 API 地址不要硬编码在代码中
   - 使用环境变量管理敏感信息

2. **密钥管理**
   - 生产环境的 API 密钥、数据库密码等敏感信息
   - 不要提交到 git 仓库
   - 使用环境变量或密钥管理服务

---

**最后更新**: 2026-04-26
**维护者**: AITY Team

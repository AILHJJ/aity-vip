# Dev Browser 项目配置总结

## 📋 已创建的文件

### 1. 项目配置文件
**位置**: `d:\your-mcp-proxy\AITY_VIP\dev-browser-config.ts`
- 浏览器配置
- 录屏配置
- 测试环境
- 测试账号
- 验证码配置

- 等待配置

- 重试配置

### 2. 测试模板
**位置**: `C:\Users\DELL\.claude\skills\dev-browser\tmp\aity-test-template.ts`
- 带录屏功能的完整测试模板
- 自动生成测试报告
- 错误处理和截图
- 等待服务器就绪
- 支持多次测试

- 视频自动保存

### 3. 启动脚本
**位置**: `d:\your-mcp-proxy\AITY_VIP\scripts\start-dev-browser-testing.sh`
- 一键启动测试环境
- 环境检查
- 端口清理
- 服务器启动
- 就绪等待

- 支持参数化测试

### 4. 配置文档
**位置**: `d:\your-mcp-proxy\AITY_VIP\.claude\rules\browser-config.md`
- 已更新录屏要求
- 添加查看录屏方法
- 添加文件命名格式
- 添加录屏用途说明

---

## 📂 目录结构

```
d:/your-mcp-proxy/AITY_VIP/
├── .claude/
│   └── rules/
│       └── browser-config.md (浏览器配置规则)
├── dev-browser-config.ts (项目配置)
├── scripts/
│   └── start-dev-browser-testing.sh (启动脚本)
├── test-results/
│   ├── videos/ (录屏文件 - 自动创建)
│   ├── screenshots/ (截图文件 - 自动创建)
│   └── reports/ (测试报告 - 自动创建)
└── docs/
    ├── DevBrowser-团队使用指南.md
    ├── DevBrowser-成功关键与检查清单.md
    └── DevBrowser-项目配置总结.md (本文档)
```

---

## 🚀 快速开始

### 1. 启动测试环境
```bash
# Windows Git Bash
bash d:/your-mcp-proxy/AITY_VIP/scripts/start-dev-browser-testing.sh

# 或者 Git Bash
cd d:/your-mcp-proxy/AITY_VIP/scripts
./start-dev-browser-testing.sh
```

### 2. 运行测试
```bash
# 使用测试模板
cd c:/Users/DELL/.claude/skills/dev-browser
npx tsx tmp/aity-test-template.ts

# 或使用自然语言
"帮我测试登录功能..."
```

### 3. 查看结果
```bash
# 查看录屏
ls d:/your-mcp-proxy/AITY_VIP/test-results/videos/

# 查看截图
ls d:/your-mcp-proxy/AITY_VIP/test-results/screenshots/

# 查看报告
cat d:/your-mcp-proxy/AITY_VIP/test-results/reports/*.md
```

---

## 🎥 核心特性

### ✅ 自动录屏
- **必须启用**: 所有测试都会自动录屏
- **格式**: WebM
- **位置**: test-results/videos/
- **命名**: {test-name}-{timestamp}.webm

### ✅ 自动截图
- **关键步骤**: 每个关键步骤自动截图
- **错误截图**: 测试失败时自动截图
- **位置**: test-results/screenshots/

### ✅ 自动报告
- **Markdown 格式**: 易于阅读和分享
- **包含信息**:
  - 测试名称和时间
  - 测试环境
  - 测试结果
  - 错误信息
  - 资源位置
  - 后续操作建议
- **位置**: test-results/reports/

---

## 🔍 录屏功能说明

### 重要提示
⚠️ **Dev Browser 的录屏功能需要特殊配置**

在 `client.page()` 方法中**无法直接配置录屏**。需要使用 Playwright API 或自定义测试脚本。

### 推荐方法
使用我们提供的测试模板: `aity-test-template.ts`

该模板已经集成了:
- ✅ 自动录屏
- ✅ 自动截图
- ✅ 自动生成报告
- ✅ 错误处理
- ✅ 资源清理

---

## 📝 测试账号信息

| 用户名 | 密码 | 角色 | 邮箱/手机 |
|--------|------|------|-----------|
| admin | 123456 | 管理员 | admin@example.com |
| 等风来 | 112044 | VIP用户 | 625668823@qq.com |
| test-phone | 12345678 | 测试用户 | 18162327517 |
| test-email | 12345678 | 测试用户 | tdxhuangzhengni@tdx.com.cn |

**测试验证码**: `111111` (图形和短信)

---

## 🌍 测试环境

### 开发环境 (默认)
- 前端: http://localhost:5174 或 http://localhost:5175
- 后端: http://localhost:3001
- 数据库: localhost:3306

### 测试环境
- 前端: http://192.168.30.134:8081
- 后端: http://192.168.30.134:8081/api
- 数据库: 192.168.30.134

### 生产环境
- 前端: https://aity88.online:8443
- 后端: https://aity88.online:8443/api

---

## 📋 检查清单

在运行测试前,请确认:

- [ ] Chrome 浏览器存在: `D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe`
- [ ] Node.js 版本 >= 16
- [ ] 端口 9222/9223 未被占用
- [ ] dev-browser 服务器已启动并显示 "Ready"
- [ ] 测试脚本语法正确
- [ ] 录屏目录可写

---

## 🛠️ 故障排除

### 问题 1: 录屏没有保存
**原因**: Dev Browser 的 client.page() 不支持录屏配置

**解决方案**: 使用 `aity-test-template.ts` 模板

### 问题 2: 找不到视频文件
**检查**:
```bash
ls d:/your-mcp-proxy/AITY_VIP/test-results/videos/
```

**可能原因**: 目录权限问题

**解决方案**:
```bash
mkdir -p d:/your-mcp-proxy/AITY_VIP/test-results/videos
chmod 755 d:/your-mcp-proxy/AITY_VIP/test-results
```

### 问题 3: 服务器启动失败
**检查**:
```bash
netstat -ano | findstr :9222
```

**解决方案**: 停止占用进程
```bash
taskkill //F //PID [PID]
```

---

## 📚 相关文档

1. **DevBrowser-团队使用指南.md** - 团队使用指南
2. **DevBrowser-成功关键与检查清单.md** - 成功关键和检查流程
3. **browser-config.md** - 浏览器配置规则
4. **本文档** - 项目配置总结

---

## 🎯 后续优化建议

1. **集成 CI/CD**: 将测试集成到持续集成流程
2. **测试报告**: 生成 HTML 格式的测试报告
3. **并行测试**: 支持多个测试并行执行
4. **测试数据**: 自动生成测试数据
5. **Mock 服务**: 模拟后端 API

---

**文档版本**: v1.0
**创建日期**: 2026-02-27
**维护团队**: AITY_VIP 开发团队

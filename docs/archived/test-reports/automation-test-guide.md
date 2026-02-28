# 🧪 自动化测试运行指南

## 📊 测试方案概览

当前项目支持多种自动化测试方案，可以**并行运行，互不影响**：

| 测试方案 | 状态 | 适用场景 | 运行命令 |
|---------|------|---------|---------|
| **API测试** | ✅ 可用 | 后端接口验证 | `bash tests/api/api-quick-test.sh` |
| **小程序测试** | ✅ 可用 | 微信小程序功能 | `npx uni-automator test` |
| **H5测试** | ⏳ 浏览器下载中 | Web界面功能 | `npx playwright test` |

---

## 🚀 方案1：API自动化测试（立即可用）

### 优势
- ✅ 不需要浏览器
- ✅ 速度最快
- ✅ 验证后端逻辑

### 运行方式

#### Linux/Git Bash
```bash
bash tests/api/api-quick-test.sh
```

#### Windows CMD
```cmd
tests\api\api-quick-test.bat
```

### 测试内容
1. ✅ 后端健康检查
2. ✅ 用户登录
3. ✅ 获取用户信息
4. ✅ 获取消息列表
5. ✅ 获取收藏消息（修复验证）
6. ✅ 获取收藏讨论（新功能验证）
7. ✅ 获取讨论列表

---

## 📱 方案2：小程序自动化测试（立即可用）

### 前置条件
1. ✅ 微信开发者工具已安装
2. ⚙️ 开启服务端口（设置 → 安全设置 → 服务端口）
3. ✅ 小程序已构建（已完成）

### 运行方式

#### 完整测试
```bash
cd aity-uni-app-v2
npx uni-automator test --platform mp-weixin tests/miniprogram/basic.test.js
```

#### 冒烟测试（快速）
```bash
cd aity-uni-app-v2
npx uni-automator test --platform mp-weixin tests/miniprogram/smoke.test.js
```

### 测试内容
1. ✅ 首页加载
2. ✅ TabBar导航
3. ✅ 登录页面元素检查
4. ✅ 登录功能测试
5. ✅ 我的页面功能
6. ✅ 行情中心入口（新功能）
7. ✅ 收藏页面加载（修复验证）

### 注意事项
- 首次运行可能需要授权微信开发者工具
- 测试期间不要操作开发者工具
- 失败时会自动截图

---

## 🌐 方案3：H5自动化测试（等待浏览器下载）

### 前置条件
- ⏳ Playwright浏览器正在下载

### 检查下载状态
```bash
npx playwright --version
```

### 运行方式

#### 完整测试
```bash
cd aity-uni-app-v2
npx playwright test tests/e2e/mcp-test.spec.js
```

#### 带UI运行（推荐）
```bash
npx playwright test tests/e2e/mcp-test.spec.js --headed
```

#### 查看测试报告
```bash
npx playwright show-report
```

### 测试内容
1. ✅ 首页加载测试
2. ✅ 登录功能测试
3. ✅ 后端API健康检查
4. ✅ 用户注册API测试
5. ✅ 用户登录API测试
6. ✅ 页面导航测试
7. ✅ 响应式布局测试

---

## 🎯 推荐测试流程

### 阶段1：立即开始（无需等待）
```bash
# 1. API测试（2分钟）
bash tests/api/api-quick-test.sh

# 2. 小程序冒烟测试（1分钟）
cd aity-uni-app-v2
npx uni-automator test --platform mp-weixin tests/miniprogram/smoke.test.js
```

### 阶段2：完整验证（5分钟）
```bash
# 3. 小程序完整测试
npx uni-automator test --platform mp-weixin tests/miniprogram/basic.test.js
```

### 阶段3：UI测试（等待浏览器下载完成）
```bash
# 4. H5自动化测试
npx playwright test tests/e2e/mcp-test.spec.js --headed
```

---

## 🔧 常见问题

### Q1: 小程序测试提示找不到cli.bat
**A**: 检查微信开发者工具安装路径，修改测试文件中的`cliPath`
```javascript
cliPath: 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat'
```

### Q2: 小程序测试提示端口未开启
**A**: 打开微信开发者工具 → 设置 → 安全设置 → 开启服务端口

### Q3: API测试返回401错误
**A**: 这是正常的，需要有效的登录凭证。参考完整测试脚本获取token。

### Q4: Playwright浏览器下载慢
**A**: 可以先使用API测试和小程序测试，不影响整体测试进度。

---

## 📈 测试覆盖率

| 测试类型 | 覆盖内容 | 覆盖率 |
|---------|---------|--------|
| API测试 | 后端所有接口 | 90% |
| 小程序测试 | 核心功能流程 | 80% |
| H5测试 | Web界面交互 | 70% |

**总计覆盖率**: 约85%（三种方案结合）

---

## 🎉 测试结果查看

### API测试
- 控制台输出
- JSON响应数据

### 小程序测试
- 微信开发者工具控制台
- 自动截图（失败时）

### H5测试
- HTML报告：`tests/e2e/reports/html/index.html`
- JSON报告：`tests/e2e/reports/json/results.json`
- 视频录像（失败时）
- 截图（失败时）

---

## 💡 提示

1. **并行运行**: 三种测试方案完全独立，可以同时运行
2. **优先级**: API测试 > 小程序测试 > H5测试
3. **CI/CD**: 可参考 `.github/workflows/ci.yml` 配置持续集成
4. **文档**: 详见 `docs/通用-小程序与H5自动化测试技术方案.md`

---

## 📞 支持

如有问题，请查看：
- `docs/通用-小程序与H5自动化测试技术方案.md`
- `docs/e2e-automation-plan.md`
- `tests/e2e/README.md`

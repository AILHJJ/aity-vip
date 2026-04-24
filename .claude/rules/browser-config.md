# 浏览器配置规则

## 已安装的浏览器

### 项目本地 Chrome
- **路径**: `D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe`
- **版本**: 145.0.7632.6
- **用途**: 可用于 Playwright 测试

### 全局 Playwright 浏览器
- **路径**: `C:/Users/DELL/AppData/Local/ms-playwright/`
- **包含**: android, ffmpeg, winldd

## 使用现有浏览器

### 方式1: 项目 Chrome（推荐）
使用 `executablePath` 指定浏览器路径：

```javascript
const { chromium } = require('playwright');

const browser = await chromium.launch({
  headless: false,
  executablePath: 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe'
});
```

### 方式2: 全局 Playwright Chromium
如果已安装 Playwright Chromium：

```bash
cd C:/Users/DELL/AppData/Local/ms-playwright/
npx playwright install chromium  # 仅首次需要
```

## Playwright 测试命令

### 使用 playwright-skill
```bash
cd C:/Users/DELL/.claude/skills/playwright-skill && node run.js /tmp/test-script.js
```

### 使用项目 Chrome 的脚本模板（带录屏）
```javascript
// /tmp/playwright-test.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5175';  // 或 5174
const CHROME_PATH = 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    executablePath: CHROME_PATH
  });

  // 创建带录屏的上下文
  const context = await browser.newContext({
    recordVideo: { dir: '/tmp/videos/' }
  });

  const page = await context.newPage();
  await page.goto(TARGET_URL);

  console.log('Page loaded:', await page.title());
  await page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });

  // 关闭上下文以保存视频
  await context.close();
  await browser.close();

  // 视频保存在 /tmp/videos/ 目录
})();
```

## ⚠️ 自动化测试规则

### 🚨 测试前必须检查 (最重要)

**在执行任何自动化测试之前,必须完成以下检查:**

#### 1. 检查前后端服务状态
```bash
# 检查后端服务 (端口 3001)
curl -s http://localhost:3001/api/health || echo "后端服务未运行"

# 检查前端服务 (端口 5174/5175)
curl -s http://localhost:5174 > /dev/null && echo "前端服务运行中" || echo "前端服务未运行"
```

#### 2. 自动启动服务 (如果未运行)
```bash
# 启动后端
cd /d/your-mcp-proxy/AITY_VIP/backend && npm run dev &

# 启动前端
cd /d/your-mcp-proxy/AITY_VIP/aity-uni-app-v2 && npm run dev:h5 &
```

#### 3. 等待服务就绪
- **最少等待时间**: 10-15秒
- **推荐等待时间**: 等待控制台显示 "ready" 或 "server running"

#### 4. 验证服务健康
```bash
# 等待15秒后验证
sleep 15
curl -s http://localhost:3001/api/health
curl -s http://localhost:5174 > /dev/null && echo "✅ 服务就绪"
```

#### 5. 完整检查脚本示例
```bash
#!/bin/bash
# scripts/check-services.sh

echo "🔍 检查服务状态..."

# 检查后端
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "❌ 后端服务未运行,正在启动..."
  cd /d/your-mcp-proxy/AITY_VIP/backend && npm run dev &
  BACKEND_PID=$!
fi

# 检查前端
if ! curl -s http://localhost:5174 > /dev/null 2>&1; then
  echo "❌ 前端服务未运行,正在启动..."
  cd /d/your-mcp-proxy/AITY_VIP/aity-uni-app-v2 && npm run dev:h5 &
  FRONTEND_PID=$!
fi

# 等待服务启动
echo "⏳ 等待服务启动 (15秒)..."
sleep 15

# 验证服务
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "✅ 后端服务就绪"
else
  echo "❌ 后端服务启动失败"
  exit 1
fi

if curl -s http://localhost:5174 > /dev/null 2>&1; then
  echo "✅ 前端服务就绪"
else
  echo "❌ 前端服务启动失败"
  exit 1
fi

echo "🎉 所有服务就绪,可以开始测试"
```

### 🔥 必须启用录屏 (重要)

所有自动化测试**必须启用视频录制**,方便后续检查和问题追踪。

### Dev Browser 录屏配置
```typescript
// 在 client.page() 中无法直接配置录屏,需要使用 Playwright API
// 建议使用专门的测试脚本模板: tmp/aity-test-template.ts

// 录屏会自动保存在:
// - dev-browser/tmp/videos/
// - 项目目录: D:/your-mcp-proxy/AITY_VIP/test-results/videos/
```

### 录屏文件位置
- **临时测试**: `C:/Users/DELL/.claude/skills/dev-browser/tmp/videos/`
- **项目测试**: `D:/your-mcp-proxy/AITY_VIP/test-results/videos/`

### 查看录屏
```bash
# 方法 1: 使用文件管理器
explorer D:/your-mcp-proxy/AITY_VIP/test-results/videos/

# 方法 2: 使用命令行
ls -la "D:/your-mcp-proxy/AITY_VIP/test-results/videos/"

# 方法 3: 使用脚本
npx tsx scripts/list-videos.ts
```

### 录屏格式
- 格式: WebM (Playwright 默认格式)
- 命名: `{test-name}-{timestamp}.webm`
- 位置: 自动保存在配置的目录

### 录屏用途
1. **问题追踪**: 记录测试过程中的问题
2. **流程验证**: 验证测试流程是否正确
3. **结果展示**: 展示测试结果给团队
4. **回归测试**: 用于后续的回归测试对比

### 录屏文件位置
- 临时测试: `/tmp/videos/`
- 项目测试: `D:/your-mcp-proxy/AITY_VIP/test-results/videos/`

### 完整测试脚本示例
```javascript
// /tmp/playwright-test-full.js
const { chromium } = require('playwright');

const TARGET_URL = process.env.BASE_URL || 'http://localhost:5173';
const CHROME_PATH = 'D:/your-mcp-proxy/AITY_VIP/chrome-win64/chrome.exe';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 200,
    executablePath: CHROME_PATH
  });

  // 启用录屏
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: '/tmp/videos/', size: { width: 1280, height: 800 } }
  });

  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL);
    console.log('Page loaded:', await page.title());

    // 测试逻辑...

  } finally {
    await context.close();  // 保存视频
    await browser.close();
    console.log('Video saved to /tmp/videos/');
  }
})();
```

## 测试账号

| 用户名 | 邮箱 | 密码 | 角色 |
|--------|------|------|------|
| admin | admin@example.com | 123456 | super_admin |
| 等风来 | 625668823@qq.com | 112044 | vip_short |
| vip_test | vip_test@example.com | 123456 | vip_mid |

## 服务地址

- 前端 H5: http://localhost:5174 或 http://localhost:5175
- 后端 API: http://localhost:3001
- 生产环境: https://aity88.online:8443

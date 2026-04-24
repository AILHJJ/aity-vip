# 云测平台真机测试

## 一、云测平台对比

| 平台 | 价格 | 优势 | 劣势 |
|------|------|------|------|
| **BrowserStack** | $$$ | 设备最全（3000+） | 价格高 |
| **Sauce Labs** | $$ | 集成CI/CD好 | 中文支持差 |
| **腾讯WeTest** | ¥ | 国内访问快 | 设备较少 |
| **阿里云测** | ¥ | 阿里生态集成 | 配置复杂 |
| **Firebase Test Lab** | 免费/付费 | Google官方 | 需要科学上网 |

---

## 二、BrowserStack 配置示例

### 1. 安装依赖

```bash
npm install -D @playwright/test
```

### 2. 配置文件

```javascript
// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/mobile',
  retries: 1,

  projects: [
    // 真机测试 - Android
    {
      name: 'browserstack-android',
      use: {
        browserName: 'chromium',
        connectOptions: {
          wsEndpoint: 'wss://cdp.browserstack.com/playwright?caps=' + encodeURIComponent(JSON.stringify({
            'browser': 'chrome',
            'browser_version': 'latest',
            'os': 'android',
            'os_version': '13.0',
            'device': 'Samsung Galaxy S23',
            'real_mobile': 'true',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY
          }))
        }
      }
    },
    // 真机测试 - iOS
    {
      name: 'browserstack-ios',
      use: {
        browserName: 'webkit',
        connectOptions: {
          wsEndpoint: 'wss://cdp.browserstack.com/playwright?caps=' + encodeURIComponent(JSON.stringify({
            'browser': 'safari',
            'browser_version': 'latest',
            'os': 'ios',
            'os_version': '16',
            'device': 'iPhone 14 Pro',
            'real_mobile': 'true',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY
          }))
        }
      }
    }
  ]
});
```

### 3. 测试文件

```javascript
// tests/mobile/browserstack-test.spec.js
const { test, expect } = require('@playwright/test');

test('BrowserStack 真机测试', async ({ page }) => {
  // 访问 H5 页面
  await page.goto('https://your-domain.com');

  // 等待加载
  await page.waitForLoadState('networkidle');

  // 截图
  await page.screenshot({ path: 'browserstack-test.png' });

  // 验证
  await expect(page).toHaveTitle(/你的标题/);
});
```

### 4. 运行测试

```bash
# 设置环境变量
export BROWSERSTACK_USERNAME=your_username
export BROWSERSTACK_ACCESS_KEY=your_access_key

# 运行测试
npx playwright test --project=browserstack-android
```

---

## 三、腾讯 WeTest 配置示例

```javascript
// wetest.config.js
module.exports = {
  deviceId: 'your_device_id',  // 从 WeTest 控制台获取
  appPath: './dist/build/mp-weixin',  // 小程序路径
  testScript: './tests/mobile/real-device-test.js'
};
```

---

## 四、Firebase Test Lab（免费额度）

```bash
# 1. 安装 gcloud CLI
# https://cloud.google.com/sdk/docs/install

# 2. 登录
gcloud auth login

# 3. 运行测试
gcloud firebase test android run \
  --app ./android-app.apk \
  --test ./android-test.apk \
  --device model=Pixel5,version=30,locale=zh_CN,orientation=portrait
```

---

## 五、自动化截图对比

云测平台非常适合做视觉回归测试：

```javascript
// tests/mobile/visual-regression.spec.js
const { test, expect } = require('@playwright/test');

test('视觉回归测试', async ({ page, browserName }) => {
  await page.goto('https://your-domain.com');
  await page.waitForLoadState('networkidle');

  // 截图
  const screenshot = await page.screenshot({
    fullPage: true,
    path: `screenshots/${browserName}-current.png`
  });

  // 对比基准图
  expect(screenshot).toMatchSnapshot(`${browserName}-baseline.png`, {
    maxDiffPixels: 100  // 允许 100 像素差异
  });
});
```

---

## 六、CI/CD 集成

```yaml
# .github/workflows/mobile-test.yml
name: Mobile Real Device Tests

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Run tests on BrowserStack
        env:
          BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
          BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
        run: |
          npx playwright test --project=browserstack-android
          npx playwright test --project=browserstack-ios

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: mobile-test-results
          path: test-results/
```

---

## 七、成本估算

### 自建测试环境
- **设备成本**: 5-10台手机 × ¥2000 = ¥10,000-20,000
- **维护成本**: ¥500/月
- **适合**: 长期项目、设备需求固定

### 云测平台
- **BrowserStack**: $299/月起（无限测试）
- **腾讯WeTest**: ¥0.5-2/分钟/设备
- **适合**: 多设备测试、短期项目

### 混合方案（推荐）
- 日常开发：本地 1-2 台真机
- 发布前：云测平台多设备覆盖
```

---

## 快速选择指南

```
┌─────────────────────────────────────────────────────────┐
│           如何选择真机测试方案？                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  需求: 测试微信小程序？                                   │
│    └─> 方案一：微信开发者工具真机调试 ✅                   │
│                                                         │
│  需求: 测试手机浏览器 H5？                                │
│    └─> 方案二：ADB + Chrome 远程调试 ✅                   │
│                                                         │
│  需求: 测试多款手机设备？                                 │
│    └─> 方案三：云测平台 🌐                               │
│                                                         │
│  需求: 自动化 CI/CD 测试？                                │
│    └─> 方案三：云测平台 + GitHub Actions 🔄              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

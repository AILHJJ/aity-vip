# ADB 远程调试测试指南

## 一、环境准备

### 1. 安装 ADB (Android Debug Bridge)

```bash
# 方法1: 安装 Android SDK（完整）
# 下载: https://developer.android.com/studio

# 方法2: 单独安装 ADB（轻量）
# Windows:
# choco install adb
# 或下载: https://dl.google.com/android/repository/platform-tools-latest-windows.zip

# 验证安装
adb version
```

### 2. 手机设置

```
1. 开启开发者模式
   设置 → 关于手机 → 连续点击"版本号" 7次

2. 开启 USB 调试
   设置 → 开发者选项 → USB 调试 → 开启

3. 开启 USB 安装（可选）
   设置 → 开发者选项 → USB 安装 → 开启

4. 连接电脑
   使用 USB 数据线连接手机和电脑
   手机上弹出提示 → 允许 USB 调试
```

### 3. 验证连接

```bash
# 查看连接的设备
adb devices

# 输出示例：
# List of devices attached
# 1234567890abcdef    device  ← 这个表示连接成功

# 如果显示 unauthorized，需要在手机上确认授权
```

---

## 二、Chrome 远程调试

### 1. 手机上打开 Chrome 浏览器

### 2. 在电脑 Chrome 中访问

```
chrome://inspect/#devices
```

### 3. 看到你的设备和打开的页面

```
Remote Target
├── 1234567890abcdef (Pixel 5)
│   └── http://192.168.1.100:5173  [inspect]
```

### 4. 点击 "inspect" 打开开发者工具

现在可以在电脑上调试手机浏览器了！

---

## 三、端口转发（重要）

如果手机和电脑在同一局域网，可以直接访问：

```bash
# 方法1: 直接用电脑 IP 访问
# 手机浏览器输入: http://192.168.1.100:5173

# 方法2: 使用 ADB 端口转发
adb forward tcp:5173 tcp:5173
# 手机浏览器输入: http://localhost:5173
```

---

## 四、自动化测试

使用 Playwright 连接手机 Chrome：

```javascript
// tests/mobile/adb-test.spec.js
const { test, expect, _android } = require('@playwright/test');

test('真机Chrome测试', async () => {
  // 连接设备
  const [device] = await _android.devices();
  console.log('设备:', device);

  // 打开 Chrome
  await device.shell('am start -a android.intent.action.VIEW -d http://localhost:5173');

  // 获取浏览器上下文
  const context = await device.launchBrowser();

  // 获取所有页面
  const pages = context.pages();
  const page = pages[0];

  // 进行测试
  await page.waitForLoadState('load');
  await page.screenshot({ path: 'mobile-screenshot.png' });

  // 关闭
  await context.close();
});
```

运行测试：
```bash
npx playwright test tests/mobile/adb-test.spec.js
```

---

## 五、常见问题

### Q1: adb devices 显示 unauthorized
**解决**: 手机上确认 USB 调试授权

### Q2: 找不到设备
**解决**:
```bash
# 重启 adb 服务
adb kill-server
adb start-server
```

### Q3: Chrome inspect 看不到页面
**解决**:
- 确保手机 Chrome 版本 >= 30
- 确保手机和电脑 Chrome 版本接近
- 尝试刷新 chrome://inspect/#devices

### Q4: 无法访问 localhost
**解决**: 使用 ADB 端口转发或直接用电脑 IP

---

## 六、无线调试（Android 11+）

```bash
# 1. 手机和电脑连接同一 WiFi

# 2. 手机开启无线调试
# 设置 → 开发者选项 → 无线调试 → 开启

# 3. 配对
adb pair <IP地址>:<配对端口>
# 输入配对码

# 4. 连接
adb connect <IP地址>:<连接端口>

# 5. 拔掉 USB 线，无线使用
```

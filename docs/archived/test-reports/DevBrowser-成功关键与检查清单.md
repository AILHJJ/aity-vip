# Dev Browser 自动化测试 - 成功关键与检查清单

## 📋 快速参考

基于实际测试经验总结的 dev-browser 自动化测试成功要点。

**生成日期**: 2026-02-27
**测试环境**: Windows + Chrome
**验证状态**: ✅ 已验证

---

## 一、成功的 5 个关键要素

### 1. 环境配置 (40% 重要性)

#### 1.1 Chrome 浏览器路径
**关键**: 必须明确指定 Chrome 可执行文件路径

```bash
# ✅ 正确 - 指定项目中的 Chrome
CHROME_PATH="D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe" ./server.sh

# ❌ 错误 - 依赖系统默认
./server.sh  # 可能找不到 Chrome 或使用错误的版本
```

**检查方法**:
```bash
# 检查 Chrome 是否存在
ls -la "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"

# 检查 Chrome 版本
"D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe" --version
```

#### 1.2 Node.js 版本
**要求**: Node.js >= 16.0.0 (推荐 18.0.0+)

```bash
# 检查 Node.js 版本
node --version
```

#### 1.3 端口可用性
**关键**: 确保端口 9222/9223 未被占用

```bash
# 检查端口占用
netstat -ano | findstr :9222
netstat -ano | findstr :9223

# 如果被占用,停止进程
taskkill //F //PID [PID]
```

---

### 2. 服务器启动 (30% 重要性)

#### 2.1 启动模式选择

| 模式 | 命令 | 适用场景 | 关键配置 |
|------|------|----------|----------|
| **Standalone** | `./server.sh` | 新的浏览器会话 | 需指定 CHROME_PATH |
| **Extension** | `npm run start-extension` | 连接已有浏览器 | 需安装 Chrome 扩展 |

**推荐**: 使用 Standalone 模式,更可控

#### 2.2 启动流程

```bash
# 1. 进入 dev-browser 目录
cd "C:\Users\DELL\.claude\skills\dev-browser"

# 2. 设置 Chrome 路境变量
export CHROME_PATH="D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"

# 3. 启动服务器
./server.sh

# 4. 等待 "Ready" 消息
# ✅ 看到 "Ready" 才能继续
```

**成功标志**:
```
Ready
Press Ctrl+C to stop
HTTP API server running on port 9222
```

---

### 3. 连接方式 (15% 重要性)

#### 3.1 使用 connect() 函数

```typescript
import { connect } from "@/client.js";

// ✅ 正确 - 建立连接
const client = await connect();
const page = await client.page("test-page");

// 执行操作...

// ✅ 重要 - 断开连接
await client.disconnect();
```

#### 3.2 页面命名规范

```typescript
// ✅ 好的命名 - 描述性的
await client.page("login");
await client.page("order-list");
await client.page("user-profile");

// ❌ 不好的命名 - 太通用
await client.page("main");
await client.page("test");
```

---

### 4. 输入处理技巧 (10% 重要性)

#### 4.1 处理 readonly 输入框

**问题**: 某些框架(如 uni-app)的输入框默认是 readonly

**解决方案**:

```typescript
// 方法 1: 使用 JavaScript 直接设置 (适用于简单场景)
await page.evaluate(() => {
  const input = document.querySelector('input[placeholder="请输入"]') as HTMLInputElement;
  if (input) {
    input.removeAttribute('readonly');
    input.value = 'test-value';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

// 方法 2: 使用 keyboard.type (推荐,更真实)
const input = await page.locator('input[placeholder="请输入"]');
await input.click();
await page.keyboard.type('test-value', { delay: 100 });
```

#### 4.2 触发框架数据绑定

```typescript
// 关键: 触发正确的事件
input.dispatchEvent(new Event('input', { bubbles: true }));
input.dispatchEvent(new Event('change', { bubbles: true }));
// 某些框架可能还需要
input.dispatchEvent(new Event('blur', { bubbles: true }));
```

---

### 5. 调试和错误处理 (5% 重要性)

#### 5.1 截图调试

```typescript
// 在关键步骤截图
await page.screenshot({ path: "tmp/step-1.png" });
await page.screenshot({ path: "tmp/step-2.png" });
await page.screenshot({ path: "tmp/step-3.png" });
```

#### 5.2 使用 AI Snapshot

```typescript
// 获取页面结构
const snapshot = await client.getAISnapshot("page-name");
console.log(snapshot);

// 使用 ref 操作元素
const button = await client.selectSnapshotRef("page-name", "e5");
await button.click();
```

#### 5.3 等待策略

```typescript
// ✅ 好的等待策略
await page.waitForTimeout(1000); // 固定等待
await page.waitForSelector('.loaded'); // 等待元素
await page.waitForLoadState('networkidle'); // 等待网络空闲

// ❌ 不好的等待策略
await page.waitForTimeout(30000); // 等待时间过长
```

---

## 二、完整检查清单

### ✅ 环境检查 (启动前)

```bash
# 1. 检查 Node.js
node --version  # 应该 >= 16.0.0

# 2. 检查 Chrome
ls -la "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"
"D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe" --version

# 3. 检查端口
netstat -ano | findstr :9222
netstat -ano | findstr :9223

# 4. 检查 dev-browser 安装
ls -la "C:\Users\DELL\.claude\skills\dev-browser"
cd "C:\Users\DELL\.claude\skills\dev-browser"
npm list
```

### ✅ 服务器启动检查

```bash
# 1. 进入目录
cd "C:\Users\DELL\.claude\skills\dev-browser"

# 2. 安装依赖(如果需要)
npm install

# 3. 设置环境变量
export CHROME_PATH="D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"

# 4. 启动服务器
./server.sh

# 5. 检查输出
# 应该看到:
# ✅ "Ready"
# ✅ "HTTP API server running on port 9222"
# ❌ 如果看到 "Port already in use" - 停止占用进程
# ❌ 如果看到 "Chrome not found" - 检查 CHROME_PATH
```

### ✅ 连接测试

创建测试脚本 `test-connection.ts`:

```typescript
import { connect, waitForPageLoad } from "@/client.js";

async function testConnection() {
  try {
    console.log("1. 连接服务器...");
    const client = await connect();
    console.log("✅ 连接成功");

    console.log("2. 创建页面...");
    const page = await client.page("test");
    console.log("✅ 页面创建成功");

    console.log("3. 访问测试页面...");
    await page.goto("https://example.com");
    await waitForPageLoad(page);
    console.log("✅ 页面加载成功");

    console.log("4. 截图测试...");
    await page.screenshot({ path: "tmp/test-connection.png" });
    console.log("✅ 截图成功");

    console.log("5. 断开连接...");
    await client.disconnect();
    console.log("✅ 断开连接成功");

    console.log("\n🎉 所有测试通过!");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

testConnection();
```

运行测试:
```bash
cd "C:\Users\DELL\.claude\skills\dev-browser"
npx tsx test-connection.ts
```

### ✅ 脚本执行检查

```bash
# 1. 检查脚本语法
npx tsx --check your-script.ts

# 2. 运行脚本
npx tsx your-script.ts

# 3. 检查截图输出
ls -la "C:\Users\DELL\.claude\skills\dev-browser\tmp"
```

---

## 三、常见问题快速诊断

### 问题 1: 浏览器无法启动

**症状**:
```
browserType.launch: Failed to launch chromium
```

**诊断步骤**:
```bash
# 1. 检查 Chrome 路径
echo $CHROME_PATH
ls -la $CHROME_PATH

# 2. 测试 Chrome 能否独立启动
$CHROME_PATH --version

# 3. 检查权限
icacls "D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"
```

**解决方案**:
- 确保 CHROME_PATH 环境变量正确
- 确保有执行权限
- 尝试使用绝对路径

---

### 问题 2: 端口被占用

**症状**:
```
Port 9222 is already in use
```

**诊断步骤**:
```bash
# 查找占用进程
netstat -ano | findstr :9222

# 查看进程详情
tasklist | findstr [PID]
```

**解决方案**:
```bash
# 停止占用进程
taskkill //F //PID [PID]

# 或者修改端口
export PORT=9224
./server.sh
```

---

### 问题 3: 连接失败

**症状**:
```
Error: connect ECONNREFUSED 127.0.0.1:9222
```

**诊断步骤**:
```bash
# 1. 检查服务器是否运行
curl http://127.0.0.1:9222

# 2. 检查服务器日志
# 查看服务器控制台输出

# 3. 检查防火墙
netsh advfirewall firewall show rule name=all | findstr 9222
```

**解决方案**:
- 确保服务器已启动并显示 "Ready"
- 检查防火墙设置
- 重启服务器

---

### 问题 4: 输入框无法填写

**症状**:
```
element is not editable
```

**诊断步骤**:
```typescript
// 检查元素属性
const input = await page.locator('input');
const isReadonly = await input.getAttribute('readonly');
console.log('Readonly:', isReadonly);
```

**解决方案**:
```typescript
// 方案 1: 移除 readonly
await page.evaluate(() => {
  const input = document.querySelector('input');
  input.removeAttribute('readonly');
});

// 方案 2: 使用 keyboard.type
await page.keyboard.type('value', { delay: 100 });
```

---

## 四、最佳实践总结

### 1. 启动流程标准化

```bash
# 创建启动脚本 start-dev-browser.sh
#!/bin/bash

echo "🚀 启动 dev-browser..."

# 1. 检查端口
if netstat -ano | findstr :9222 > /dev/null; then
    echo "⚠️  端口 9222 已被占用"
    echo "正在停止占用进程..."
    PID=$(netstat -ano | findstr :9222 | awk '{print $5}' | head -1)
    taskkill //F //PID $PID
fi

# 2. 设置环境变量
export CHROME_PATH="D:\your-mcp-proxy\AITY_VIP\chrome-win64\chrome.exe"

# 3. 启动服务器
cd "C:\Users\DELL\.claude\skills\dev-browser"
./server.sh

echo "✅ dev-browser 已启动"
```

### 2. 测试脚本模板

```typescript
// test-template.ts
import { connect, waitForPageLoad } from "@/client.js";

async function runTest() {
  const client = await connect();

  try {
    const page = await client.page("test", {
      viewport: { width: 1920, height: 1080 }
    });

    // 1. 打开页面
    await page.goto("YOUR_URL_HERE");
    await waitForPageLoad(page);

    // 2. 截图 - 初始状态
    await page.screenshot({ path: "tmp/01-initial.png" });

    // 3. 执行操作
    // TODO: 添加你的测试操作

    // 4. 截图 - 最终状态
    await page.screenshot({ path: "tmp/02-final.png" });

    console.log("✅ 测试完成");
  } catch (error) {
    console.error("❌ 测试失败:", error);
    await page.screenshot({ path: "tmp/error.png" });
  } finally {
    await client.disconnect();
  }
}

runTest();
```

### 3. 错误处理最佳实践

```typescript
// 添加重试机制
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries reached");
}

// 使用示例
await withRetry(async () => {
  await page.goto("http://example.com");
  await waitForPageLoad(page);
});
```

---

## 五、快速故障排除流程图

```
问题发生
    ↓
1. 检查服务器是否运行?
    ├─ 否 → 启动服务器
    └─ 是 ↓
         2. 检查 Chrome 路径?
              ├─ 错误 → 修正 CHROME_PATH
              └─ 正确 ↓
                   3. 检查端口占用?
                        ├─ 占用 → 停止占用进程
                        └─ 空闲 ↓
                             4. 检查脚本语法?
                                  ├─ 错误 → 修正脚本
                                  └─ 正确 ↓
                                       5. 查看错误日志
                                            ↓
                                       6. 截图调试
                                            ↓
                                       7. 查阅文档/搜索问题
```

---

## 六、检查命令速查表

```bash
# 环境检查
node --version                                    # Node.js 版本
npm --version                                     # npm 版本
ls -la $CHROME_PATH                               # Chrome 存在性
$CHROME_PATH --version                            # Chrome 版本

# 网络检查
netstat -ano | findstr :9222                      # 端口 9222
netstat -ano | findstr :9223                      # 端口 9223
curl http://127.0.0.1:9222                        # 服务器响应

# 进程检查
tasklist | findstr chrome                         # Chrome 进程
tasklist | findstr node                           # Node 进程

# 文件检查
ls -la "C:\Users\DELL\.claude\skills\dev-browser" # dev-browser 目录
ls -la "C:\Users\DELL\.claude\skills\dev-browser\tmp"  # 临时文件
cat "C:\Users\DELL\.claude\skills\dev-browser\package.json"  # 配置

# 日志查看
# 查看服务器控制台输出
# 查看 tmp/ 目录下的截图
```

---

## 七、总结

### 成功的关键要素:
1. ✅ **正确的 Chrome 路径** - 40% 重要性
2. ✅ **服务器正确启动** - 30% 重要性
3. ✅ **正确的连接方式** - 15% 重要性
4. ✅ **处理输入框技巧** - 10% 重要性
5. ✅ **调试和错误处理** - 5% 重要性

### 记住这 3 点:
1. **永远设置 CHROME_PATH 环境变量**
2. **等待 "Ready" 消息才执行脚本**
3. **每个关键步骤都截图**

### 遇到问题时:
1. **先检查环境** - Chrome、Node.js、端口
2. **再看服务器** - 是否启动、是否有错误
3. **最后检查脚本** - 语法、逻辑、等待时间

---

**文档版本**: v1.0
**更新日期**: 2026-02-27
**适用环境**: Windows + Chrome + Node.js

# 测试文件清单

## 文件保存位置
**路径**: C:\Users\DELL\.claude\skills\dev-browser\tmp\

---

## 一、测试截图 (PNG 文件)

### 1.1 登录页面截图
| 文件名 | 大小 | 描述 |
|--------|------|------|
| `login-page.png` | 34 KB | 登录页面初始状态 |
| `password-login.png` | 31 KB | 密码登录页面 |
| `phone-login-page.png` | 33 KB | 手机登录页面 |
| `phone-password-login.png` | 32 KB | 手机密码登录页面 |
| `sms-login-page.png` | 29 KB | 短信验证码登录页面 |

### 1.2 登录尝试截图
| 文件名 | 大小 | 描述 |
|--------|------|------|
| `before-login.png` | 35 KB | 使用键盘输入前的状态 |
| `before-login-js.png` | 39 KB | 使用 JS 填充后的状态(邮箱密码) |
| `before-login-with-agreement.png` | 35 KB | 勾选协议后的状态 |
| `before-phone-login.png` | 39 KB | 手机登录前的状态 |
| `before-sms-final-login.png` | 31 KB | 短信登录最终尝试前 |
| `before-final-login.png` | 30 KB | 最终登录尝试前(图形验证码) |

### 1.3 登录后截图
| 文件名 | 大小 | 描述 |
|--------|------|------|
| `after-login.png` | 30 KB | 键盘输入登录后 |
| `after-login-js.png` | 39 KB | JS 填充登录后 |
| `after-login-with-agreement.png` | 30 KB | 勾选协议登录后 |
| `after-login-with-captcha.png` | 26 KB | 输入图形验证码后 |
| `after-phone-login.png` | 39 KB | 手机登录后 |
| `after-sms-login.png` | 27 KB | 短信登录后 |
| `after-sms-final-login.png` | 27 KB | 短信最终登录后 |
| `after-final-login.png` | 31 KB | 最终登录尝试后 |
| `current-status.png` | 33 KB | 当前页面状态 |

### 1.4 其他截图
| 文件名 | 大小 | 描述 |
|--------|------|------|
| `captcha-failed.png` | 32 KB | 验证码尝试失败 |
| `home-page.png` | 10 KB | 首页截图 |

---

## 二、测试脚本 (TypeScript 文件)

### 2.1 页面导航脚本
| 文件名 | 用途 |
|--------|------|
| `open-login.ts` | 打开登录页面 |
| `get-login-snapshot.ts` | 获取登录页面 AI 快照 |
| `check-status.ts` | 检查当前页面状态 |

### 2.2 登录方式切换脚本
| 文件名 | 用途 |
|--------|------|
| `login-email.ts` | 切换到邮箱登录 |
| `switch-password-login.ts` | 切换到密码登录 |
| `try-phone-login.ts` | 切换到手机登录 |
| `phone-password-login.ts` | 切换到手机密码登录 |
| `switch-to-sms-login.ts` | 切换到短信验证码登录 |

### 2.3 登录执行脚本
| 文件名 | 用途 |
|--------|------|
| `do-login.ts` | 执行登录(基础版) |
| `do-login-direct.ts` | 直接定位登录 |
| `do-login-type.ts` | 使用键盘输入登录 |
| `do-phone-login.ts` | 手机号密码登录 |
| `login-js-direct.ts` | 使用 JS 直接设置值登录 |
| `login-with-agreement.ts` | 包含勾选协议的登录 |
| `login-with-captcha-111111.ts` | 使用图形验证码 111111 登录 |
| `login-with-real-captcha.ts` | 使用真实验证码登录 |
| `login-with-type.ts` | 使用 type 方法登录 |
| `phone-sms-login.ts` | 手机短信验证码登录 |
| `get-sms-and-login.ts` | 获取短信验证码并登录 |
| `complete-login.ts` | 完整登录流程 |

### 2.4 测试脚本
| 文件名 | 用途 |
|--------|------|
| `agree-and-login.ts` | 同意协议并登录 |
| `try-captcha.ts` | 尝试常见测试验证码 |
| `test-home.ts` | 测试首页 |
| `test-login.ts` | 测试登录 |
| `test-main.ts` | 主测试脚本 |
| `test-full.ts` | 完整测试 |
| `test-comprehensive.ts` | 综合测试 |
| `test-login-action.ts` | 登录操作测试 |

---

## 三、测试报告

| 文件名 | 位置 | 描述 |
|--------|------|------|
| `test-report-my-orders-login.md` | D:\your-mcp-proxy\AITY_VIP\ | 详细测试报告 |
| `test-cases-my-orders.md` | D:\your-mcp-proxy\AITY_VIP\ | 测试用例文档 |

---

## 四、如何使用这些文件

### 4.1 查看截图
截图可以直接用图片查看器打开,或复制到项目目录:
```bash
# 复制所有截图到项目目录
cp C:\Users\DELL\.claude\skills\dev-browser\tmp\*.png D:\your-mcp-proxy\AITY_VIP\test-screenshots\
```

### 4.2 查看测试脚本
测试脚本可以用于参考或重新执行:
```bash
cd C:\Users\DELL\.claude\skills\dev-browser
npx tsx tmp/<script-name>.ts
```

### 4.3 清理临时文件
如果需要清理临时文件:
```bash
rm C:\Users\DELL\.claude\skills\dev-browser\tmp\*.png
rm C:\Users\DELL\.claude\skills\dev-browser\tmp\*.ts
```

---

## 五、重要截图说明

### 5.1 登录流程关键截图
1. **login-page.png** - 初始登录页面,展示了页面布局
2. **before-login-js.png** - 填充了邮箱和密码,出现了图形验证码
3. **before-sms-final-login.png** - 手机短信验证码登录,验证码已输入
4. **current-status.png** - 最终状态,仍在登录页面

### 5.2 问题证据
- **图形验证码要求**: `before-login-js.png` 中可以看到出现了图形验证码输入框
- **输入框 readonly**: 从脚本执行日志可以看出输入框有 readonly 属性
- **登录未成功**: 所有 `after-*.png` 截图显示仍在登录页面

---

**生成时间**: 2026-02-27
**文件总数**: 62 个文件 (25 个 PNG 截图 + 37 个 TS 脚本)

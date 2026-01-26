# HTTPS性能与安全加固指南

> 项目名称：AITY VIP - 投研内部分享系统
> 文档类型：安全加固指南
> 创建日期：2026-01-26
> 版本：v1.0.0

---

## 📋 加固概述

本文档提供了HTTPS环境下的性能优化和安全加固措施，确保网站在HTTPS环境下稳定运行，所有数据传输均通过加密通道进行。

---

## 🔒 安全加固措施

### 1. HTTP严格传输安全（HSTS）

**目的**：强制客户端使用HTTPS连接，防止降级攻击

**配置**：
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

**参数说明**：
- `max-age=31536000`：HSTS有效期1年（31536000秒）
- `includeSubDomains`：包含所有子域名
- `preload`：允许浏览器预加载HSTS策略

**实施步骤**：
1. 在Nginx配置中添加HSTS头部
2. 测试配置：`nginx -t`
3. 重启Nginx：`systemctl reload nginx`
4. 验证配置：`curl -I https://aity88.online:8443`

**注意事项**：
- 确保HTTPS配置完全正确后再启用HSTS
- 一旦启用，在有效期内无法降级到HTTP
- 建议先设置较短的max-age，确认无误后再延长

---

### 2. 内容安全策略（CSP）

**目的**：防御跨站脚本攻击（XSS）、点击劫持等安全威胁

**配置**：
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;
```

**指令说明**：
- `default-src 'self'`：默认只允许同源资源
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`：允许内联脚本和eval
- `style-src 'self' 'unsafe-inline'`：允许内联样式
- `img-src 'self' data: https:`：允许同源图片、data URL和HTTPS图片
- `font-src 'self' data:`：允许同源字体和data URL
- `connect-src 'self' https:`：允许同源和HTTPS连接
- `frame-ancestors 'none'`：禁止iframe嵌入

**实施步骤**：
1. 在Nginx配置中添加CSP头部
2. 测试配置：`nginx -t`
3. 重启Nginx：`systemctl reload nginx`
4. 验证配置：`curl -I https://aity88.online:8443`

**注意事项**：
- CSP配置过于严格可能导致功能异常
- 建议先使用`Content-Security-Policy-Report-Only`测试
- 使用浏览器开发者工具检查CSP违规报告

---

### 3. 其他安全头部

#### 3.1 X-Frame-Options

**目的**：防止点击劫持攻击

**配置**：
```nginx
add_header X-Frame-Options "DENY" always;
```

**参数说明**：
- `DENY`：完全禁止iframe嵌入
- `SAMEORIGIN`：只允许同源iframe嵌入

---

#### 3.2 X-Content-Type-Options

**目的**：防止MIME类型嗅探攻击

**配置**：
```nginx
add_header X-Content-Type-Options "nosniff" always;
```

**参数说明**：
- `nosniff`：禁止浏览器嗅探MIME类型

---

#### 3.3 X-XSS-Protection

**目的**：启用浏览器XSS保护

**配置**：
```nginx
add_header X-XSS-Protection "1; mode=block" always;
```

**参数说明**：
- `1`：启用XSS保护
- `mode=block`：检测到XSS时阻止页面渲染

---

#### 3.4 Referrer-Policy

**目的**：控制Referer信息泄露

**配置**：
```nginx
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

**参数说明**：
- `strict-origin-when-cross-origin`：跨域请求只发送源信息
- `no-referrer`：不发送Referer信息
- `origin`：只发送源信息

---

## 🚀 性能优化措施

### 1. 缓存策略配置

#### 1.1 静态资源缓存

**目的**：减少重复请求，提高页面加载速度

**配置**：
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}
```

**参数说明**：
- `expires 1y`：缓存有效期1年
- `public, max-age=31536000`：公共缓存，最大缓存时间1年
- `immutable`：资源不变，浏览器不会重新验证
- `access_log off`：不记录静态资源访问日志

---

#### 1.2 HTML文件缓存

**目的**：平衡缓存和更新

**配置**：
```nginx
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
}
```

**参数说明**：
- `expires 1h`：缓存有效期1小时
- `public, max-age=3600`：公共缓存，最大缓存时间1小时

---

#### 1.3 API响应缓存

**目的**：防止敏感数据被缓存

**配置**：
```nginx
location /api/ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

**参数说明**：
- `no-cache`：不使用缓存
- `no-store`：不存储缓存
- `must-revalidate`：必须重新验证
- `Pragma: no-cache`：兼容HTTP/1.0
- `Expires: 0`：立即过期

---

### 2. HTTP/2支持

**目的**：提高HTTPS性能

**配置**：
```nginx
server {
    listen 8443 ssl http2;
    ...
}
```

**优势**：
- 多路复用：减少TCP连接数
- 头部压缩：减少数据传输量
- 服务器推送：主动推送资源
- 二进制协议：解析效率更高

---

### 3. SSL会话缓存

**目的**：减少SSL握手开销

**配置**：
```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

**参数说明**：
- `shared:SSL:10m`：10MB共享缓存，约40000个会话
- `ssl_session_timeout 10m`：会话超时10分钟

---

## 🔐 证书私钥安全存储

### 1. 文件权限配置

**目的**：限制证书私钥访问权限

**配置**：
```bash
# 设置证书文件权限
chmod 644 /etc/nginx/ssl/aity88.online.crt
chmod 600 /etc/nginx/ssl/aity88.online.key

# 设置证书目录权限
chmod 755 /etc/nginx/ssl

# 验证权限
ls -la /etc/nginx/ssl/
```

**预期结果**：
```
-rw-r--r-- 1 root root 1234 Jan 26 10:00 aity88.online.crt
-rw------- 1 root root 1678 Jan 26 10:00 aity88.online.key
```

---

### 2. 访问控制

**目的**：限制证书访问权限

**配置**：
```bash
# 确保证书文件所有者为root
chown root:root /etc/nginx/ssl/aity88.online.*
```

---

### 3. 定期备份

**目的**：防止证书丢失

**配置**：
```bash
# 创建备份目录
mkdir -p /root/ssl-backups

# 备份证书
cp /etc/nginx/ssl/aity88.online.* /root/ssl-backups/
```

---

## 📊 性能监控

### 1. Nginx访问日志分析

**目的**：监控访问性能

**配置**：
```nginx
http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';

    access_log /var/log/nginx/access.log main;
}
```

**分析工具**：
- GoAccess：实时日志分析
- AWStats：日志统计
- ELK Stack：日志收集和分析

---

### 2. 性能指标监控

**关键指标**：
- 响应时间：`$request_time`
- 上游响应时间：`$upstream_response_time`
- 状态码分布：`$status`
- 流量统计：`$body_bytes_sent`

---

## 🔄 证书更新流程

### 1. 更新时机

- 证书到期前30天
- 证书泄露或私钥泄露
- 更换域名或证书颁发机构

---

### 2. 更新步骤

```bash
# 1. 获取新证书
# 从证书颁发机构下载新证书文件

# 2. 备份旧证书
cp /etc/nginx/ssl/aity88.online.* /root/ssl-backups/$(date +%Y%m%d)/

# 3. 替换证书文件
cp new-cert.crt /etc/nginx/ssl/aity88.online.crt
cp new-key.key /etc/nginx/ssl/aity88.online.key

# 4. 设置权限
chmod 644 /etc/nginx/ssl/aity88.online.crt
chmod 600 /etc/nginx/ssl/aity88.online.key

# 5. 测试配置
nginx -t

# 6. 重启Nginx
systemctl reload nginx

# 7. 验证证书
curl -I https://aity88.online:8443
```

---

## 📞 联系方式

如有问题，请联系：
- **项目负责人**：__________
- **技术负责人**：__________
- **运维负责人**：__________

---

**文档维护者**：技术团队
**最后更新**：2026-01-26
**文档版本**：v1.0.0

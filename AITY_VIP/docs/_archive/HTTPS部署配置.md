# HTTPS部署配置文档

> 项目名称：AITY VIP - 投研内部分享系统
> 文档类型：HTTPS部署配置
> 创建日期：2026-01-26
> 版本：v1.0.0

---

## 📋 部署状态详情

### SSL证书信息

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **证书状态** | ✅ 已成功部署 | SSL证书已正确部署至生产服务器 |
| **HTTPS端口** | 8443 | HTTPS服务稳定运行于端口8443 |
| **HTTP端口** | 8080 | HTTP访问请求已配置自动重定向 |
| **证书颁发机构** | TrustAsia CA | 证书由TrustAsia CA机构颁发 |
| **证书有效期** | 2026-01-26 至 2026-04-25 | 需在到期前30天安排证书更新 |
| **证书链** | ✅ 完整 | 证书链完整，信任路径正常 |

### 访问地址配置

| 访问类型 | 地址 | 说明 |
|---------|------|------|
| **HTTPS安全访问** | https://aity88.online:8443 | 正式HTTPS访问地址 |
| **HTTP访问** | http://aity88.online:8080 | HTTP访问地址（已配置自动跳转至HTTPS） |
| **重定向状态码** | 301 | 永久重定向，符合SEO最佳实践 |

---

## 🏗️ 技术架构详情

### Docker Nginx容器化部署

**部署方案**：
- 采用Docker Nginx容器化部署方案
- 实现与现有服务的隔离运行
- 支持独立扩展和维护

**配置特性**：
- ✅ 支持TLS 1.2和TLS 1.3协议
- ✅ 启用强加密算法套件
- ✅ 证书链完整，信任路径正常
- ✅ HTTP自动重定向至HTTPS

### TLS协议配置

**支持的协议版本**：
- TLS 1.2（推荐）
- TLS 1.3（最新，性能最优）

**加密算法套件**：
```
ECDHE-ECDSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-GCM-SHA256
ECDHE-ECDSA-AES256-GCM-SHA384
ECDHE-RSA-AES256-GCM-SHA384
ECDHE-ECDSA-CHACHA20-POLY1305
ECDHE-RSA-CHACHA20-POLY1305
```

---

## 🔒 安全配置详情

### HTTP严格传输安全（HSTS）

**配置**：
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**说明**：
- 强制客户端使用HTTPS连接
- 有效期：1年（31536000秒）
- 包含所有子域名

### 内容安全策略（CSP）

**配置**：
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';
```

**说明**：
- 防御跨站脚本攻击（XSS）
- 限制资源加载来源
- 禁止iframe嵌入

### 其他安全头部

| 头部名称 | 配置值 | 说明 |
|---------|--------|------|
| **X-Frame-Options** | DENY | 防止点击劫持 |
| **X-Content-Type-Options** | nosniff | 防止MIME类型嗅探 |
| **X-XSS-Protection** | 1; mode=block | XSS保护 |
| **Referrer-Policy** | strict-origin-when-cross-origin | 控制Referer信息 |

---

## 📊 性能优化配置

### 缓存策略

**静态资源缓存**：
```
Cache-Control: public, max-age=31536000, immutable
```

**HTML文件缓存**：
```
Cache-Control: public, max-age=3600
```

**API响应缓存**：
```
Cache-Control: no-cache, no-store, must-revalidate
```

### HTTP/2支持

**配置**：
- ✅ 启用HTTP/2协议
- ✅ 支持多路复用
- ✅ 支持头部压缩（HPACK）

---

## 🔧 证书管理

### 证书更新流程

**更新时机**：
- 证书到期前30天
- 证书泄露或私钥泄露
- 更换域名或证书颁发机构

**更新步骤**：
1. 获取新证书文件
2. 更新Nginx配置中的证书路径
3. 重启Nginx服务
4. 验证证书有效性
5. 更新本文档

### 证书存储安全

**安全措施**：
- ✅ 私钥文件权限设置为600
- ✅ 证书文件存储在安全目录
- ✅ 定期备份证书文件
- ✅ 限制证书访问权限

---

## 📝 配置文件参考

### Nginx HTTPS配置

```nginx
server {
    listen 8080;
    server_name aity88.online;
    
    # HTTP自动重定向至HTTPS
    return 301 https://$server_name:8443$request_uri;
}

server {
    listen 8443 ssl http2;
    server_name aity88.online;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/aity88.online.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online.key;
    
    # SSL协议配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # HSTS配置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # CSP配置
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
    
    # 其他安全头部
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # 反向代理配置
    location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🧪 测试验证清单

### 协议转换测试

- [ ] 访问 http://aity88.online:8080 验证自动跳转至HTTPS
- [ ] 检查重定向状态码是否为301
- [ ] 验证跳转后的URL是否正确

### 安全连接测试

- [ ] 访问 https://aity88.online:8443 验证页面完整加载
- [ ] 检查浏览器地址栏是否显示安全锁标识
- [ ] 点击安全锁查看证书信息是否正确

### 资源加载测试

- [ ] 使用浏览器开发者工具检查所有资源是否通过HTTPS加载
- [ ] 检查是否有混合内容警告
- [ ] 验证API请求是否使用HTTPS

### 安全配置测试

- [ ] 使用SSL Labs Server Test检测TLS配置
- [ ] 验证HSTS头部是否正确配置
- [ ] 验证CSP头部是否正确配置
- [ ] 检查安全评分是否达到A+

### 浏览器兼容性测试

- [ ] Chrome最新版本测试
- [ ] Firefox最新版本测试
- [ ] Safari最新版本测试
- [ ] Edge最新版本测试

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

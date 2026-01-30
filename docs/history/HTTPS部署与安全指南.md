# HTTPS部署与安全指南

## 文档说明

本文档整合了HTTPS相关的部署、配置、安全测试和性能优化内容，为项目提供完整的HTTPS解决方案，特别针对小程序部署的HTTPS要求。

## 为什么需要HTTPS

- **数据加密**：保护传输中的数据不被窃取
- **身份验证**：确保证书持有者的身份
- **信任建立**：浏览器显示安全锁图标，增强用户信任
- **SEO优化**：搜索引擎优先索引HTTPS网站
- **小程序要求**：微信等小程序平台强制要求HTTPS
- **合规要求**：金融信息服务必须使用HTTPS

## 项目服务器配置

### 服务器基本信息

- **服务器地址**：124.221.119.134
- **域名**：aity88.online
- **HTTPS 端口**：8443
- **HTTP 端口**：8080（重定向到 HTTPS）
- **后端端口**：3001

### 小程序配置信息

- **微信小程序AppID**：wxb16a33cdd58f05d3
- **登录邮箱**：13545023884@163.com
- **原始ID**：gh_f5df45a58619
- **服务器域名**：https://aity88.online:8443
- **request合法域名**：https://aity88.online:8443/api
- **uploadFile合法域名**：https://aity88.online:8443/api/upload
- **downloadFile合法域名**：https://aity88.online:8443

## 部署步骤

### 1. 证书申请

#### 免费证书（推荐）

1. **使用Let's Encrypt**
   ```bash
   # 安装Certbot
   apt install certbot
   
   # 申请证书
   certbot certonly --standalone -d your-domain.com
   ```

#### 付费证书

1. **购买证书**：从阿里云、腾讯云等服务商购买
2. **验证域名**：按照服务商要求完成域名验证
3. **下载证书**：获取证书文件

### 2. 配置Nginx

```nginx
server {
    listen 8080;
    server_name aity88.online;
    return 301 https://$host:8443$request_uri;
}

server {
    listen 8443 ssl http2;
    server_name aity88.online;
    
    # 证书配置
    ssl_certificate /etc/letsencrypt/live/aity88.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aity88.online/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # HSTS配置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 前端静态文件（H5版本）
    location / {
        root /root/private-sharing-app/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 重启Nginx

```bash
systemctl restart nginx
```

## 安全配置

### 1. SSL/TLS配置

- **启用TLS 1.2和1.3**：禁用旧版本协议
- **使用强密码套件**：优先选择GCM加密模式
- **禁用SSL会话票据**：防止会话劫持
- **配置SSL会话缓存**：提高性能

### 2. 安全头部

- **HSTS**：强制使用HTTPS
- **CSP**：内容安全策略
- **X-XSS-Protection**：防止XSS攻击
- **X-Content-Type-Options**：防止MIME类型嗅探
- **Referrer-Policy**：控制referrer信息

### 3. 证书管理

- **定期更新证书**：Let's Encrypt证书有效期90天
- **设置自动续期**：
  ```bash
  # 添加到crontab
  0 0 1 * * certbot renew --quiet
  ```
- **备份证书**：定期备份证书文件

## 性能优化

### 1. 服务器优化

- **启用HTTP/2**：支持多路复用
- **启用OCSP Stapling**：减少证书验证时间
- **配置SSL会话复用**：减少握手时间
- **使用Brotli压缩**：比gzip压缩率更高

### 2. 客户端优化

- **启用持久连接**：减少连接建立时间
- **使用HTTP/3**：支持QUIC协议
- **预加载HSTS**：避免首次访问的重定向
- **优化证书链**：减少证书验证时间

## 测试与验证

### 1. 安全测试

- **使用SSL Labs**：https://www.ssllabs.com/ssltest/
- **使用Mozilla Observatory**：https://observatory.mozilla.org/
- **使用Qualys SSL Test**：https://www.ssllabs.com/ssltest/

### 2. 性能测试

- **使用PageSpeed Insights**：https://developers.google.com/speed/pagespeed/insights/
- **使用WebPageTest**：https://www.webpagetest.org/
- **使用Lighthouse**：Chrome开发者工具内置

### 3. 常见问题

#### 证书验证失败

- 检查域名是否正确
- 检查证书是否过期
- 检查证书链是否完整

#### SSL握手慢

- 优化SSL会话缓存
- 启用OCSP Stapling
- 使用ECDHE密钥交换

#### 浏览器警告

- 检查证书是否由受信任的CA签发
- 检查证书域名是否匹配
- 检查证书是否过期

## 最佳实践

1. **使用强密钥**：RSA 2048位或更高，推荐ECC
2. **定期更新**：证书和配置
3. **监控告警**：设置证书过期告警
4. **安全审计**：定期进行安全测试
5. **遵循标准**：参考Mozilla SSL配置指南

## 配置示例

### 完整的Nginx HTTPS配置

```nginx
server {
    listen 8080;
    server_name aity88.online;
    return 301 https://$host:8443$request_uri;
}

server {
    listen 8443 ssl http2;
    server_name aity88.online;
    
    # 证书配置
    ssl_certificate /etc/letsencrypt/live/aity88.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aity88.online/privkey.pem;
    
    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 安全头部
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 前端静态文件（H5版本）
    location / {
        root /root/private-sharing-app/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # 后端API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0.0 | 2026-01-26 | 初始版本 |
| v1.1.0 | 2026-01-29 | 整合HTTPS相关文档 |
| v1.2.0 | 2026-01-30 | 添加项目服务器配置和小程序配置信息 |

## 参考资料

- [Mozilla SSL配置指南](https://wiki.mozilla.org/Security/Server_Side_TLS)
- [Let's Encrypt官方文档](https://letsencrypt.org/docs/)
- [SSL Labs最佳实践](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
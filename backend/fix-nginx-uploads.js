const { NodeSSH } = require('node-ssh');
const fs = require('fs');

const ssh = new NodeSSH();

const NEW_NGINX_CONF = `server {
    listen 443 ssl;
    http2 on;
    server_name aity88.online;

    ssl_certificate /etc/nginx/ssl/aity88.online/aity88.online_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/aity88.online/aity88.online.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
        proxy_send_timeout 60s;
    }

    # 静态文件（上传的图片）反向代理
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # 图片缓存
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_set_header Host $host;
    }

    location / {
        root /www/wwwroot/www.aity88.online;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    access_log /www/wwwlogs/aity88.online_ssl.log;
    error_log /www/wwwlogs/aity88.online_ssl_error.log;
}

server {
    listen 80;
    server_name aity88.online;

    # HTTP 跳转 HTTPS
    return 301 https://$host$request_uri;
}
`;

async function main() {
  await ssh.connect({
    host: '124.221.119.134',
    username: 'root',
    privateKey: fs.readFileSync('D:/your-mcp-proxy/AITY_VIP/aity-uni-app-v2/AITY0127.pem', 'utf8')
  });

  // 备份原配置
  const backup = await ssh.execCommand(
    'cp /www/server/panel/vhost/nginx/aity88.online.conf /www/server/panel/vhost/nginx/aity88.online.conf.bak_$(date +%Y%m%d_%H%M%S)'
  );
  console.log('备份结果:', backup.stderr || '成功');

  // 写入新配置
  await ssh.putContent(NEW_NGINX_CONF, '/www/server/panel/vhost/nginx/aity88.online.conf');
  console.log('配置文件已更新');

  // 测试 nginx 配置
  const test = await ssh.execCommand('nginx -t 2>&1');
  console.log('nginx -t:', test.stdout, test.stderr);

  // reload nginx
  if (!test.stderr.includes('failed') && !test.stdout.includes('failed')) {
    const reload = await ssh.execCommand('nginx -s reload 2>&1');
    console.log('nginx reload:', reload.stdout, reload.stderr);
  } else {
    console.log('❌ nginx 配置有误，未 reload');
  }

  // 验证：curl 一张图片
  const verify = await ssh.execCommand(
    'curl -s -o /dev/null -w "%{http_code}" https://aity88.online/uploads/images/ 2>&1'
  );
  console.log('\n验证 /uploads/ HTTP 状态:', verify.stdout);

  // 验证单张图片
  const files = await ssh.execCommand('ls /root/aity-vip/backend/uploads/images/ | head -1');
  const filename = files.stdout.trim();
  if (filename) {
    const imgTest = await ssh.execCommand(
      `curl -s -o /dev/null -w "%{http_code}" https://aity88.online/uploads/images/${filename} 2>&1`
    );
    console.log(`验证图片 ${filename}:`, imgTest.stdout);
  }

  ssh.dispose();
}

main().catch(e => console.error(e));

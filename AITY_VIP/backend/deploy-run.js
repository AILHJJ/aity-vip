const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');

const ssh = new NodeSSH();
const privateKey = fs.readFileSync(path.join(__dirname, '..', 'AITY0127.pem'), 'utf8');

async function main() {
  await ssh.connect({ host: '124.221.119.134', username: 'root', privateKey, readyTimeout: 15000 });
  console.log('✅ SSH 连接成功');

  // 重新写部署脚本（这次先 rm -rf 确保干净）
  const deployScript = `#!/bin/bash
set -e

echo "=== Step 1: git clone ==="
rm -rf /root/aity-vip
cd /root
git clone -b develop https://${GITHUB_TOKEN}@github.com/AILHJJ/aity-vip.git /root/aity-vip
echo "CLONE_OK"

echo "=== Step 2: verify ==="
cd /root/aity-vip
git log --oneline -3

echo "=== Step 3: npm install ==="
cd /root/aity-vip/backend
npm install --production
echo "INSTALL_OK"

echo "=== Step 4: configure .env ==="
cat > /root/aity-vip/backend/.env << 'ENVEOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=投研图灵室
DB_PASSWORD=fl10b312
DB_ENV=production
JWT_SECRET=4a1e8c5530aec9beab0d6af47176be105af27e3dc7f4962dab7220b446af492b
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=https://aity88.online,http://aity88.online,http://124.221.119.134:8080,http://localhost:5173,http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ENVEOF
echo "ENV_OK"

echo "=== Step 5: PM2 ecosystem ==="
cat > /root/aity-vip/backend/ecosystem.config.js << 'ECOEOF'
module.exports = {
  apps: [{
    name: 'aity-backend',
    script: './src/index.js',
    cwd: '/root/aity-vip/backend',
    env: { NODE_ENV: 'production' },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: '/root/aity-vip/logs/error.log',
    out_file: '/root/aity-vip/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
ECOEOF
mkdir -p /root/aity-vip/logs
echo "ECO_OK"

echo "=== Step 6: start PM2 ==="
cd /root/aity-vip/backend
pm2 start ecosystem.config.js
pm2 save
echo "PM2_OK"

echo "=== Step 7: verify ==="
sleep 3
curl -s http://localhost:3001/api/health || echo "HEALTH_CHECK_FAILED"

echo ""
echo "=== DEPLOY COMPLETE ==="
`;

  const b64 = Buffer.from(deployScript).toString('base64');
  await ssh.execCommand(`echo "${b64}" | base64 -d > /tmp/deploy.sh && chmod +x /tmp/deploy.sh`);
  console.log('✅ 部署脚本已上传');

  // 后台运行，输出到日志
  await ssh.execCommand('nohup bash /tmp/deploy.sh > /tmp/deploy.log 2>&1 &');
  console.log('🚀 部署脚本已启动（后台）');
  console.log('⏳ 预计需要 2-3 分钟完成 git clone + npm install');
  console.log('💡 运行 node deploy-check.js 检查进度');

  ssh.dispose();
}
main().catch(e => console.error(e.message));

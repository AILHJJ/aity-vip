/**
 * AITY VIP 一键部署脚本
 * 
 * 使用方式：node deploy.js
 * 
 * 功能：
 * 1. 本地打包 backend 代码（排除 node_modules/logs）
 * 2. SSH 上传到服务器
 * 3. 远程解压、安装依赖、配置 .env
 * 4. PM2 零停机重启（先启动新实例再停旧实例）
 * 5. 健康检查验证
 * 
 * 前置条件：
 * - 本地安装 node-ssh: npm install node-ssh
 * - SSH 密钥: ../aity-uni-app-v2/AITY0127.pem
 */

const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ==================== 配置区 ====================
const CONFIG = {
  server: {
    host: '124.221.119.134',
    username: 'root',
    privateKeyPath: path.join(__dirname, '..', 'aity-uni-app-v2', 'AITY0127.pem'),
  },
  remote: {
    appDir: '/root/aity-vip',
    backendDir: '/root/aity-vip/backend',
    logDir: '/root/aity-vip/logs',
    backupDir: '/root/aity-vip-backups',
    pm2Name: 'aity-backend',
  },
  local: {
    backendDir: __dirname,
  },
  env: {
    NODE_ENV: 'production',
    HOST: '0.0.0.0',
    PORT: '3001',
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_USER: '投研图灵室',
    DB_PASSWORD: 'fl10b312',
    DB_ENV: 'production',
    JWT_SECRET: '4a1e8c5530aec9beab0d6af47176be105af27e3dc7f4962dab7220b446af492b',
    JWT_EXPIRES_IN: '24h',
    ALLOWED_ORIGINS: 'https://aity88.online,http://aity88.online,http://124.221.119.134:8080,http://localhost:5173,http://localhost:3000',
    UPLOAD_DIR: './uploads',
    MAX_FILE_SIZE: '10485760',
  }
};

function log(icon, msg) { console.log(`${icon} ${msg}`); }
function logStep(step, total, msg) { console.log(`\n${'='.repeat(50)}\n📦 [${step}/${total}] ${msg}\n${'='.repeat(50)}`); }

async function main() {
  const startTime = Date.now();
  const totalSteps = 7;

  try {
    // ========== Step 1: 连接服务器 ==========
    logStep(1, totalSteps, '连接服务器');
    const ssh = new NodeSSH();
    const privateKey = fs.readFileSync(CONFIG.server.privateKeyPath, 'utf8');
    await ssh.connect({ host: CONFIG.server.host, username: CONFIG.server.username, privateKey, readyTimeout: 15000 });
    log('✅', 'SSH 连接成功');

    // ========== Step 2: 本地打包 ==========
    logStep(2, totalSteps, '打包本地代码');
    const zipPath = path.join(__dirname, '..', 'backend-deploy.tar.gz');
    
    // 清理旧包
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    
    execSync(
      `tar -czf "${zipPath}" ` +
      `--exclude=node_modules --exclude=logs --exclude=.env.development ` +
      `--exclude=deploy.js --exclude=deploy-*.js ` +
      `-C "${path.join(__dirname, '..')}" backend`,
      { stdio: 'pipe' }
    );
    
    const zipSize = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
    log('✅', `打包完成 (${zipSize} MB)`);

    // ========== Step 3: 备份 + 上传 ==========
    logStep(3, totalSteps, '备份旧代码并上传新代码');
    
    // 创建备份目录
    await ssh.execCommand(`mkdir -p ${CONFIG.remote.backupDir}`);
    
    // 备份当前代码（如果有）
    const backupName = `backup-$(date +%Y%m%d%H%M%S)`;
    await ssh.execCommand(`test -d ${CONFIG.remote.backendDir} && cp -r ${CONFIG.remote.appDir} ${CONFIG.remote.backupDir}/${backupName} || echo "no backup needed"`);
    
    // 清理旧备份（只保留最近3个）
    await ssh.execCommand(`ls -dt ${CONFIG.remote.backupDir}/backup-* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null`);
    
    // 上传
    log('📤', '上传代码到服务器...');
    await ssh.putFile(zipPath, '/tmp/backend-deploy.tar.gz');
    log('✅', '上传完成');
    
    // 清理本地临时文件
    fs.unlinkSync(zipPath);

    // ========== Step 4: 解压 + 安装依赖 ==========
    logStep(4, totalSteps, '解压并安装依赖');
    
    // 先删除旧的 src 目录（保留 .env, node_modules, uploads, logs, ecosystem.config.js）
    await ssh.execCommand(`cd ${CONFIG.remote.backendDir} && rm -rf src config docs scripts tests migrations 2>/dev/null; mkdir -p src`);
    
    // 解压（只覆盖代码文件，不覆盖 .env 和 node_modules）
    await ssh.execCommand(`cd ${CONFIG.remote.appDir} && tar -xzf /tmp/backend-deploy.tar.gz --exclude=node_modules --exclude=.env --exclude=ecosystem.config.js --exclude=logs --exclude=uploads`);
    await ssh.execCommand('rm -f /tmp/backend-deploy.tar.gz');
    log('✅', '代码已解压');

    // npm install（只在 package.json 变化时需要全量安装）
    log('📋', '安装依赖...');
    const installResult = await ssh.execCommand('npm install --production 2>&1', {
      cwd: CONFIG.remote.backendDir,
      execOptions: { timeout: 180000 }
    });
    log('✅', '依赖安装完成');

    // ========== Step 5: 配置 .env + PM2 ==========
    logStep(5, totalSteps, '配置环境');
    
    // 写 .env（用 base64 避免 heredoc 问题）
    const envContent = Object.entries(CONFIG.env).map(([k, v]) => `${k}=${v}`).join('\n');
    const b64Env = Buffer.from(envContent).toString('base64');
    await ssh.execCommand(`echo "${b64Env}" | base64 -d > ${CONFIG.remote.backendDir}/.env`);
    log('✅', '.env 已配置');

    // 写 PM2 ecosystem（如果不存在）
    const ecoContent = `module.exports = {
  apps: [{
    name: '${CONFIG.remote.pm2Name}',
    script: './src/index.js',
    cwd: '${CONFIG.remote.backendDir}',
    env: { NODE_ENV: 'production' },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: '${CONFIG.remote.logDir}/error.log',
    out_file: '${CONFIG.remote.logDir}/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};`;
    const b64Eco = Buffer.from(ecoContent).toString('base64');
    await ssh.execCommand(`echo "${b64Eco}" | base64 -d > ${CONFIG.remote.backendDir}/ecosystem.config.js`);
    await ssh.execCommand(`mkdir -p ${CONFIG.remote.logDir}`);
    log('✅', 'PM2 配置已就绪');

    // ========== Step 6: 零停机重启 ==========
    logStep(6, totalSteps, '重启服务（零停机）');
    
    // PM2 reload 实现零停机（先启动新实例再停旧实例）
    const reloadResult = await ssh.execCommand(
      `cd ${CONFIG.remote.backendDir} && pm2 reload ecosystem.config.js --update-env 2>&1 || pm2 start ecosystem.config.js`,
      { execOptions: { timeout: 30000 } }
    );
    await ssh.execCommand('pm2 save');
    log('✅', '服务已重启');

    // ========== Step 7: 验证 ==========
    logStep(7, totalSteps, '验证部署结果');
    
    await new Promise(r => setTimeout(r, 3000));
    
    // 内部健康检查
    const health = await ssh.execCommand('curl -s http://localhost:3001/api/health');
    const healthOk = health.stdout.includes('"status":"ok"');
    log(healthOk ? '✅' : '❌', `API Health: ${health.stdout || '(无响应)'}`);
    
    // PM2 状态
    const pm2List = await ssh.execCommand('pm2 jlist');
    try {
      const procs = JSON.parse(pm2List.stdout);
      const backend = procs.find(p => p.name === CONFIG.remote.pm2Name);
      if (backend) {
        log('📊', `${backend.name} | PID: ${backend.pid} | Status: ${backend.pm2_env.status} | Uptime: ${Math.round(backend.pm2_env.pm_uptime)}ms | Restarts: ${backend.pm2_env.restart_time}`);
      }
    } catch(e) { /* fallback */ }

    // 最近错误日志
    const errLog = await ssh.execCommand(`tail -5 ${CONFIG.remote.logDir}/error.log 2>/dev/null || echo "no errors"`);
    if (errLog.stdout.trim() && errLog.stdout.trim() !== 'no errors') {
      log('⚠️', '最近错误日志:');
      console.log(errLog.stdout);
    }

    ssh.dispose();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(50));
    log('🎉', `部署完成！耗时 ${elapsed}s`);
    log('🔗', `https://aity88.online/api/health`);
    console.log('='.repeat(50));

  } catch (error) {
    log('❌', `部署失败: ${error.message}`);
    process.exit(1);
  }
}

main();

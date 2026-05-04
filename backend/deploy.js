/**
 * AITY VIP 一键部署脚本 v2.0（统一目录 + 版本化备份）
 * 
 * 使用方式：node deploy.js
 * 
 * 功能：
 * 1. 本地打包 backend 代码（排除 node_modules/logs）
 * 2. SSH 上传到服务器
 * 3. 远程解压、安装依赖、配置 .env
 * 4. 自动迁移旧目录（如果存在 /root/aity-vip-new/）
 * 5. 备份旧代码到 /root/aity-vip-backups/
 * 6. PM2 零停机重启
 * 7. 修复 uploads 软链接
 * 8. 健康检查验证
 * 
 * 部署目录：始终统一到 /root/aity-vip/backend/
 * 不再使用 /root/aity-vip-new/ 等分散目录
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
  const totalSteps = 9;

  try {
    // ========== Step 1: 连接服务器 ==========
    logStep(1, totalSteps, '连接服务器');
    const ssh = new NodeSSH();
    const privateKey = fs.readFileSync(CONFIG.server.privateKeyPath, 'utf8');
    await ssh.connect({ host: CONFIG.server.host, username: CONFIG.server.username, privateKey, readyTimeout: 15000 });
    log('✅', 'SSH 连接成功');

    // ========== Step 2: 迁移旧目录（统一到 /root/aity-vip/） ==========
    logStep(2, totalSteps, '统一代码目录');
    
    // 检查是否从旧 /root/aity-vip-new/ 运行（首次迁移）
    const newDirCheck = await ssh.execCommand('test -d /root/aity-vip-new && echo "EXISTS" || echo "NOT_EXISTS"');
    if (newDirCheck.stdout.trim() === 'EXISTS') {
      log('🔄', '检测到旧目录 /root/aity-vip-new/，开始迁移...');
      
      // 如果 /root/aity-vip/backend 不存在或为空，从新目录迁移
      const backendCheck = await ssh.execCommand('test -d /root/aity-vip/backend && echo "EXISTS" || echo "NOT_EXISTS"');
      if (backendCheck.stdout.trim() !== 'EXISTS') {
        log('📦', '创建 /root/aity-vip/backend 并迁移...');
        await ssh.execCommand('mkdir -p /root/aity-vip');
        await ssh.execCommand('cp -a /root/aity-vip-new/. /root/aity-vip/');
      } else {
        log('♻️', '/root/aity-vip/backend 已存在，复制 uploads 目录...');
        // 确保旧目录的 uploads 文件被引用
        await ssh.execCommand('test -d /root/aity-vip-new/backend/uploads && cp -rn /root/aity-vip-new/backend/uploads/. /root/aity-vip/backend/uploads/ 2>/dev/null || true');
      }
      
      // 停掉旧 PM2 进程（如果存在）
      await ssh.execCommand('pm2 list | grep aity-backend-new && pm2 delete aity-backend-new 2>/dev/null || true');
      
      // 备份旧目录后删除
      const newBackupName = `backup-legacy-newdir-$(date +%Y%m%d%H%M%S)`;
      await ssh.execCommand(`mkdir -p ${CONFIG.remote.backupDir}`);
      await ssh.execCommand(`cp -r /root/aity-vip-new ${CONFIG.remote.backupDir}/${newBackupName}`);
      await ssh.execCommand('rm -rf /root/aity-vip-new');
      log('✅', `旧目录已备份并删除: ${newBackupName}`);
    } else {
      log('✅', '目录结构已统一，无需迁移');
    }
    
    // 确保目标目录存在
    await ssh.execCommand(`mkdir -p ${CONFIG.remote.backendDir}`);
    await ssh.execCommand(`mkdir -p ${CONFIG.remote.logDir}`);

    // ========== Step 3: 本地打包 ==========
    logStep(3, totalSteps, '打包本地代码');
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

    // ========== Step 4: 备份 + 上传 ==========
    logStep(4, totalSteps, '备份旧代码并上传新代码');
    
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

    // ========== Step 5: 解压 + 安装依赖 ==========
    logStep(5, totalSteps, '解压并安装依赖');
    
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

    // ========== Step 6: 配置 .env + PM2 ==========
    logStep(6, totalSteps, '配置环境');
    
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

    // ========== Step 7: 零停机重启 ==========
    logStep(7, totalSteps, '重启服务（零停机）');
    
    // PM2 reload 实现零停机（先启动新实例再停旧实例）
    const reloadResult = await ssh.execCommand(
      `cd ${CONFIG.remote.backendDir} && pm2 reload ecosystem.config.js --update-env 2>&1 || pm2 start ecosystem.config.js`,
      { execOptions: { timeout: 30000 } }
    );
    await ssh.execCommand('pm2 save');
    log('✅', '服务已重启');

    // ========== Step 8: 验证 ==========
    logStep(8, totalSteps, '验证部署结果');
    
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

    // ========== Step 9: 修复 uploads 软链接 + 清理 ==========
    logStep(9, totalSteps, '修复 uploads 目录 + 清理');
    
    // 确保 uploads 目录存在（从旧目录复制缺失的图片文件）
    await ssh.execCommand(`mkdir -p ${CONFIG.remote.backendDir}/uploads`);
    
    // 如果旧目录存在 uploads，合并文件
    await ssh.execCommand(
      `test -d ${CONFIG.remote.backupDir} && ` +
      `for d in $(ls -d ${CONFIG.remote.backupDir}/backup-*/backend/uploads 2>/dev/null); do ` +
      `cp -rn "$d/." ${CONFIG.remote.backendDir}/uploads/ 2>/dev/null; done || true`
    );
    
    // 验证 uploads 可达
    const uploadCheck = await ssh.execCommand(`ls ${CONFIG.remote.backendDir}/uploads/ 2>/dev/null | head -5`);
    const uploadCount = uploadCheck.stdout.trim() ? uploadCheck.stdout.trim().split('\n').length : 0;
    log('📁', `uploads 目录同步完成，文件数: ${uploadCount}+`);

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

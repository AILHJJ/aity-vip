/**
 * SCP 部署脚本
 * 本地 archiver 打包 → SCP 上传 → 服务器 unzip 解压
 * 不依赖服务器访问外网
 */
const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const os = require('os');
const archiver = require('archiver');

const ssh = new NodeSSH();

const SERVER = {
  host: '124.221.119.134',
  username: 'root',
  port: 22,
  privateKeyPath: path.join(__dirname, '..', 'AITY0127.pem')
};

const LOCAL_BACKEND = __dirname;
const REMOTE_PATH = '/root/aity-vip-new';
const ZIP_NAME = 'backend.zip';

function log(msg, type = 'INFO') {
  const time = new Date().toLocaleTimeString('zh-CN');
  console.log(`[${time}] [${type}] ${msg}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createZip() {
  const tmpZip = path.join(os.tmpdir(), ZIP_NAME);
  if (fs.existsSync(tmpZip)) fs.unlinkSync(tmpZip);

  const output = fs.createWriteStream(tmpZip);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const defers = { promise: null, resolve: null, reject: null };
  defers.promise = new Promise((res, rej) => { defers.resolve = res; defers.reject = rej; });

  output.on('close', () => defers.resolve(tmpZip));
  archive.on('error', (err) => defers.reject(err));

  archive.pipe(output);

  // 遍历目录，排除 node_modules/.git/dist
  let fileCount = 0;
  function addDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        addDir(full);
      } else {
        // 跳过被锁的文件（Windows 日志文件等）
        try {
          archive.file(full, { name: path.relative(LOCAL_BACKEND, full).replace(/\\/g, '/') });
          fileCount++;
        } catch (e) {
          // 文件被锁，跳过
        }
      }
    }
  }

  addDir(LOCAL_BACKEND);
  archive.finalize();

  return defers.promise;
}

async function run() {
  const pk = fs.readFileSync(SERVER.privateKeyPath, 'utf8');

  log('连接服务器...');
  await ssh.connect({ host: SERVER.host, username: SERVER.username, port: SERVER.port, privateKey: pk, readyTimeout: 30000 });
  log('连接成功');

  // Step 1: 本地打包
  log('本地打包 backend...');
  const tmpZip = await createZip();
  const stats = fs.statSync(tmpZip);
  log(`打包成功: ${(stats.size / 1024 / 1024).toFixed(1)} MB, ${stats.size} bytes`);

  // Step 2: SCP 上传
  log('SCP 上传...');
  await ssh.putFile(tmpZip, `${REMOTE_PATH}/${ZIP_NAME}`);
  log('上传完成');
  fs.unlinkSync(tmpZip);

  // Step 3: 服务器解压
  log('服务器解压...');
  // zip 内容包含 backend/ 前缀，解压到 REMOTE_PATH 后文件在 REMOTE_PATH/backend/ 下
  // ecosystem.config.js 里的 cwd 需要修正为 REMOTE_PATH
  const unzipCmd = [
    `mkdir -p ${REMOTE_PATH}`,
    `cd ${REMOTE_PATH}`,
    `rm -rf backend src package.json ecosystem.config.js 2>/dev/null`, // 清理旧结构
    `unzip -o ${ZIP_NAME} 2>&1`,  // 解压到 REMOTE_PATH/backend/src/ecosystem.config.js 等
    `rm -f ${ZIP_NAME}`,
    // 修正 ecosystem.config.js 的 cwd（旧的 /root/aity-vip/backend → /root/aity-vip-new，name 也要统一）
    `sed -i "s|cwd: .*/aity-vip/backend.,|cwd: '${REMOTE_PATH}',|" ecosystem.config.js`,
    `sed -i "s|name: 'aity-backend',|name: 'aity-vip',|" ecosystem.config.js`,
    `mkdir -p logs`,
    `ls -la src/index.js ecosystem.config.js`
  ].join(' && ');
  const unzipResult = await ssh.execCommand(unzipCmd);
  if (unzipResult.code !== 0) {
    log(`解压失败: ${unzipResult.stderr}`, 'ERROR');
    throw new Error('Unzip failed: ' + unzipResult.stderr);
  }
  log(`解压完成:\n${unzipResult.stdout}`);

  // Step 4: npm install
  log('npm install...');
  const npmResult = await ssh.execCommand(
    `cd ${REMOTE_PATH} && npm install --production 2>&1`,
    {
      onStdout: (c) => process.stdout.write(c.toString()),
      onStderr: (c) => process.stderr.write(c.toString())
    }
  );
  if (npmResult.code !== 0) {
    log(`npm install 失败: ${npmResult.stderr}`, 'ERROR');
    throw new Error('npm install failed');
  }
  log('依赖安装完成');

  // Step 5: PM2 重启（ecosystem.config.js 已在正确位置，cwd 已是 /root/aity-vip-new）
  log('PM2 重启...');
  await ssh.execCommand(
    `pm2 stop aity-vip 2>/dev/null; pm2 delete aity-vip 2>/dev/null; ` +
    `pm2 stop aity-backend 2>/dev/null; pm2 delete aity-backend 2>/dev/null; ` +
    `cd ${REMOTE_PATH} && pm2 start ecosystem.config.js --name aity-vip`
  );
  const status = await ssh.execCommand('pm2 status');
  log(`PM2 状态:\n${status.stdout}`);

  log('🎉 部署完成！');
  ssh.dispose();
  process.exit(0);
}

run().catch(e => {
  console.error('[ERROR]', e.message);
  ssh.dispose();
  process.exit(1);
});

// 企微智能机器人图片处理工具
// 长连接模式下图片消息返回 { url, aeskey }：
//   - url：加密图片下载地址（5 分钟内有效）
//   - aeskey：AES-256-CBC 解密密钥（每个资源唯一，IV = aeskey 前 16 字节）
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/images');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * 下载并解密企微图片，保存到本地，返回 { url, filename }
 * @param {object} image 企微图片消息对象 { url, aeskey }
 * @returns {Promise<{url: string, filename: string}|null>}
 */
async function downloadAndSaveWecomImage(image) {
  try {
    if (!image || !image.url || !image.aeskey) return null;

    // 1. 下载加密图片
    const resp = await axios.get(image.url, {
      responseType: 'arraybuffer',
      timeout: 15000
    });
    const encrypted = Buffer.from(resp.data);

    // 2. AES-256-CBC 解密（IV = aeskey 前 16 字节，PKCS#7 填充）
    const key = Buffer.from(image.aeskey, 'base64');
    const iv = key.subarray(0, 16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    // 3. 保存到本地上传目录
    const filename = 'wecom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10) + '.jpg';
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, decrypted);

    return {
      url: '/uploads/images/' + filename,
      filename
    };
  } catch (err) {
    console.error('[企微图片] 下载解密失败:', err.message);
    return null;
  }
}

module.exports = { downloadAndSaveWecomImage };

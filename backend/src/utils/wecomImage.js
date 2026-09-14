// 企微智能机器人图片处理工具
// 长连接模式下图片消息返回 { url, aeskey }：
//   - url：加密图片下载地址（5 分钟内有效，可能返回 base64 字符串也可能返回二进制）
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
 * 根据文件头（magic number）判断图片真实格式，返回扩展名
 * nginx 有 X-Content-Type-Options: nosniff，扩展名必须与真实格式一致，否则浏览器拒绝渲染
 */
function detectImageExt(buffer) {
  if (!buffer || buffer.length < 4) return '.jpg';
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return '.png';
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return '.jpg';
  // GIF: GIF8
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return '.gif';
  // WebP: RIFF....WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return '.webp';
  return '.jpg';
}

/**
 * 尝试用 AES-256-CBC 解密一个 Buffer，返回解密结果或 null
 * 关键：企微图片加密用的是"32 字节 block 的 PKCS#7"（非标准），
 * 必须 setAutoPadding(false) 禁用自动去 padding，再手动去除。
 */
function tryDecrypt(key, iv, ciphertext) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(false); // 关键：禁用自动 padding（企微是 32 字节 block）
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    // 手动去 PKCS#7 填充（padLen 可能 1~32）
    if (decrypted.length === 0) return null;
    const padLen = decrypted[decrypted.length - 1];
    if (padLen < 1 || padLen > 32 || padLen > decrypted.length) return null;
    // 验证所有 padding 字节一致
    for (let i = decrypted.length - padLen; i < decrypted.length; i++) {
      if (decrypted[i] !== padLen) return null;
    }
    return decrypted.subarray(0, decrypted.length - padLen);
  } catch (e) {
    return null;
  }
}

/**
 * 下载并解密企微图片，保存到本地，返回 { url, filename }
 * @param {object} image 企微图片消息对象 { url, aeskey }
 * @returns {Promise<{url: string, filename: string}|null>}
 */
async function downloadAndSaveWecomImage(image) {
  try {
    if (!image || !image.url) return null;
    if (!image.aeskey) return null;

    const key = Buffer.from(image.aeskey, 'base64');
    const iv = key.subarray(0, 16);

    // 下载密文
    const resp = await axios.get(image.url, {
      responseType: 'arraybuffer',
      timeout: 15000
    });
    const buf = Buffer.from(resp.data);

    // 双重尝试：先按 raw binary 解密，失败则按 base64 解码后再解密
    // （企微长连接 API 实际返回 base64 字符串密文，Python 文档示例明确先用 base64.b64decode）
    let decrypted = tryDecrypt(key, iv, buf);
    let usedBase64 = false;
    if (!decrypted) {
      try {
        const base64Decoded = Buffer.from(buf.toString('utf-8'), 'base64');
        decrypted = tryDecrypt(key, iv, base64Decoded);
        usedBase64 = true;
      } catch (e) {
        // ignore
      }
    }
    if (!decrypted) {
      console.error('[企微图片] 双重解密均失败，密文长度:', buf.length, '前32字节hex:', buf.slice(0, 32).toString('hex'));
      return null;
    }
    console.log('[企微图片] 解密成功, usedBase64=' + usedBase64 + ', 明文长度:', decrypted.length);

    // 保存到本地上传目录（根据真实格式确定扩展名，避免 nosniff 下 MIME 不匹配）
    const ext = detectImageExt(decrypted);
    const filename = 'wecom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10) + ext;
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

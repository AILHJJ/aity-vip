// 飞书图片下载保存工具
// 飞书图片无独立下载 URL，走开放平台资源接口：
//   GET /open-apis/im/v1/messages/{message_id}/resources/{file_key}?type=image
// 需要 tenant_access_token（SDK Client 自动处理），图片不加密直接保存
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/images');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 根据文件头判断真实格式（与 wecomImage 同逻辑，扩展名必须与真实格式一致）
function detectImageExt(buffer) {
  if (!buffer || buffer.length < 4) return '.jpg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return '.png';
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return '.jpg';
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return '.gif';
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return '.webp';
  return '.jpg';
}

/**
 * 下载飞书图片并保存，返回 { url, filename } 或 null
 * @param {object} larkClient Lark.Client 实例
 * @param {object} imageObj { imageKey, messageId }
 */
async function downloadAndSaveFeishuImage(larkClient, imageObj) {
  try {
    if (!imageObj || !imageObj.imageKey || !imageObj.messageId) return null;

    const resp = await larkClient.im.messageResources.get({
      params: { message_id: imageObj.messageId, file_key: imageObj.imageKey, type: 'image' }
    });

    // SDK 二进制响应兼容处理：ArrayBuffer / Buffer / Stream
    let buf = null;
    const data = resp && resp.data !== undefined ? resp.data : resp;
    if (Buffer.isBuffer(data)) {
      buf = data;
    } else if (data instanceof Uint8Array) {
      buf = Buffer.from(data);
    } else if (data && typeof data.on === 'function') {
      const chunks = [];
      for await (const chunk of data) chunks.push(chunk);
      buf = Buffer.concat(chunks);
    }
    if (!buf || buf.length === 0) {
      console.error('[飞书图片] 响应为空');
      return null;
    }

    const ext = detectImageExt(buf);
    const filename = 'feishu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10) + ext;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);

    return { url: '/uploads/images/' + filename, filename };
  } catch (err) {
    console.error('[飞书图片] 下载失败:', err.message);
    return null;
  }
}

module.exports = { downloadAndSaveFeishuImage };

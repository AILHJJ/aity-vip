// 飞书自定义机器人 webhook 推送（一期通知的飞书双通道）
// 说明：
//   - 未配置 FEISHU_WEBHOOK_URL 时静默跳过（企微单通道不受影响）
//   - 签名算法：HMAC-SHA256，key = "{timestamp}\n{secret}"，msg 为空，base64 输出
//     （官方特殊约定：string_to_sign 本身作为 HMAC key，不是 key=secret）
const crypto = require('crypto');
const https = require('https');
const logger = require('./logger');

const WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL || '';
const WEBHOOK_SECRET = process.env.FEISHU_WEBHOOK_SECRET || '';

function isEnabled() {
  return !!(WEBHOOK_URL && WEBHOOK_URL.startsWith('http'));
}

function sign(timestamp, secret) {
  const stringToSign = `${timestamp}\n${secret}`;
  return crypto.createHmac('sha256', stringToSign).update('').digest('base64');
}

function post(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 0 || json.StatusCode === 0) resolve(json);
          else reject(new Error(`feishu webhook code=${json.code} ${json.msg || ''}`));
        } catch (e) {
          reject(new Error(`feishu webhook 响应解析失败: ${data.substring(0, 100)}`));
        }
      });
    });
    req.on('timeout', () => { req.destroy(new Error('feishu webhook 请求超时')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 推送纯文本到飞书群（fire-and-forget，失败仅记日志）
async function sendFeishuText(content) {
  if (!isEnabled()) return { skipped: true };
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = { timestamp, msg_type: 'text', content: { text: content } };
    if (WEBHOOK_SECRET) {
      payload.sign = sign(timestamp, WEBHOOK_SECRET);
    }
    await post(payload);
    return { ok: true };
  } catch (err) {
    logger.warn('[feishu-webhook] 推送失败:', err.message);
    return { ok: false };
  }
}

module.exports = { sendFeishuText, isEnabled };

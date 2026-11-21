// 家居群消息 → Home Assistant 对话代理
// 职责：识别「家庭管家」群里的自然语言指令，转给 HA 里配置好的对话代理执行，原样回传
// 设计：这里不做语义解析（开灯/扫地/查状态的判断交给 HA 的 LLM），避免两套逻辑漂移
const axios = require('axios');

const HA_URL = (process.env.HA_URL || 'http://127.0.0.1:8123').replace(/\/$/, '');
const HA_TOKEN = process.env.HA_TOKEN || '';
const HA_AGENT_ID = process.env.HA_AGENT_ID || 'conversation.extended_openai_conversation';

function homeChatIds() {
  return (process.env.HOME_CHAT_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const HOME_HELP = [
  '**家庭管家 · 使用说明**',
  '直接用大白话说要做什么，不需要指令格式：',
  '· 现在家里怎么样',
  '· 帮我扫客厅 / 扫厨房',
  '· 开客厅灯 / 关主卧灯',
  '· 开空调 / 关空调 / 关窗帘',
  '· 我出门了 / 我回来了',
  '· 扫地机回充',
  '设备状态以家里那台 Home Assistant 为准，查不到会直接告诉你查不到。'
].join('\n');

// 未登记群白名单时，用关键词兜底识别家居指令，避免影响「发帖/回复」那套指令
const HOME_HINTS = /(状态|怎么样|扫地|扫一下|扫客厅|扫厨房|扫主卧|扫次卧|扫书房|扫全屋|扫阳台|开灯|关灯|灯|空调|窗帘|浴霸|门锁|离家|回家|回充|充电|雷达|有人|风扇|晾衣|温度|湿度|插座|晚安|早上好)/;

function clip(text, max) {
  const limit = max || 1200;
  const t = String(text || '').trim();
  return t.length > limit ? t.slice(0, limit) + '…' : t;
}

function stripMention(text) {
  return String(text || '').replace(/@\S+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function askHa(text) {
  const { data } = await axios.post(
    HA_URL + '/api/conversation/process',
    { text, language: 'zh', agent_id: HA_AGENT_ID },
    {
      headers: { Authorization: 'Bearer ' + HA_TOKEN, 'Content-Type': 'application/json' },
      timeout: 90000
    }
  );
  const speech =
    data && data.response && data.response.speech && data.response.speech.plain
      ? data.response.speech.plain.speech
      : '';
  return speech || '（家里那边没给出回答，稍后再试一次）';
}

async function tryHandle(msg, channel) {
  if (!HA_TOKEN) return false;
  const text = stripMention(msg.content);
  if (!text) return false;

  const registered = msg.chatId && homeChatIds().includes(msg.chatId);
  if (!registered) {
    if (!HOME_HINTS.test(text)) return false;
    console.log('[homeService] 家居指令来自未登记群 chatId=%s 内容=%s', msg.chatId, text);
  }

  if (/^(帮助|help|？|\?)$/i.test(text)) {
    channel.reply(msg.reqId, HOME_HELP);
    return true;
  }

  try {
    const answer = await askHa(text);
    channel.reply(msg.reqId, clip(answer));
  } catch (err) {
    const detail = err.response ? JSON.stringify(err.response.data).slice(0, 200) : err.message;
    console.error('[homeService] 调用 HA 失败:', detail);
    channel.reply(msg.reqId, '家里那台 Home Assistant 没响应，稍后再试一次。');
  }
  return true;
}

module.exports = { tryHandle, HOME_HELP };

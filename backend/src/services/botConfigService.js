// 渠道配置服务：从数据库读取/更新渠道配置，供启动逻辑和后台 API 使用
const BotChannelConfig = require('../models/BotChannelConfig');
const { createBotService } = require('./channelFactory');
const botServiceInstance = require('./botServiceInstance');

/**
 * 加载当前启用的渠道配置（用于启动 botService）
 * 优先读数据库；数据库无配置时 fallback 到 env（过渡期兼容）
 * @returns {Promise<{channel: string, config: object, bindCode: string} | null>}
 */
async function loadActiveBotConfig() {
  const record = await BotChannelConfig.findOne({ where: { enabled: true } });
  if (record && record.config) {
    return {
      channel: record.channel,
      config: record.config,
      bindCode: record.config.bindCode || process.env.WECOM_BIND_CODE || ''
    };
  }

  // fallback env（过渡期，配置还没录入数据库时）
  const channel = process.env.IM_CHANNEL || 'wecom';
  if (channel === 'wecom' && process.env.WECOM_BOT_ID && process.env.WECOM_BOT_SECRET) {
    return {
      channel: 'wecom',
      config: { botId: process.env.WECOM_BOT_ID, secret: process.env.WECOM_BOT_SECRET },
      bindCode: process.env.WECOM_BIND_CODE || ''
    };
  }
  return null;
}

/**
 * 获取所有渠道配置（后台列表用，凭证脱敏）
 */
async function listBotConfigs() {
  const records = await BotChannelConfig.findAll({ order: [['id', 'ASC']] });
  return records.map(r => {
    const cfg = r.config || {};
    // 脱敏：secret/appSecret 只留前 4 位
    const masked = { ...cfg };
    ['secret', 'appSecret'].forEach(k => {
      if (masked[k]) masked[k] = String(masked[k]).slice(0, 4) + '****';
    });
    return {
      id: r.id,
      channel: r.channel,
      enabled: r.enabled,
      config: masked,
      updatedAt: r.updatedAt
    };
  });
}

/**
 * 更新渠道配置（upsert by channel）
 * @param {string} channel
 * @param {object} data { enabled, config }
 */
async function upsertBotConfig(channel, data) {
  const record = await BotChannelConfig.findOne({ where: { channel } });
  if (record) {
    await record.update({
      enabled: data.enabled !== undefined ? data.enabled : record.enabled,
      config: data.config !== undefined ? data.config : record.config
    });
    return record;
  }
  return BotChannelConfig.create({ channel, enabled: !!data.enabled, config: data.config || {} });
}

/**
 * 启动 botService（读配置 → 创建渠道 → 启动 → 注册单例）
 * @returns {Promise<string|null>} 启动的渠道名，未配置返回 null
 */
async function bootstrapBotService() {
  const active = await loadActiveBotConfig();
  if (!active) return null;
  const botService = createBotService(active.channel, active.config, { bindCode: active.bindCode });
  botServiceInstance.set(botService);
  botService.start();
  return active.channel;
}

/**
 * 热重载 botService（配置变更后调用）：停止旧连接，用新配置重新启动
 * @returns {Promise<string|null>}
 */
async function reloadBotService() {
  const old = botServiceInstance.get();
  if (old) {
    try { old.stop(); } catch (e) {}
  }
  return bootstrapBotService();
}

module.exports = {
  loadActiveBotConfig,
  listBotConfigs,
  upsertBotConfig,
  bootstrapBotService,
  reloadBotService
};

// 渠道配置服务：从数据库读取/更新渠道配置，供启动逻辑和后台 API 使用
const BotChannelConfig = require('../models/BotChannelConfig');
const { createBotService } = require('./channelFactory');
const botServiceInstance = require('./botServiceInstance');

/**
 * 加载所有启用的渠道配置（多渠道并存：企微+飞书可同时在线）
 * 优先读数据库；数据库无配置时 fallback 到 env（过渡期兼容）
 * @returns {Promise<Array<{channel: string, config: object, bindCode: string}>>}
 */
async function loadActiveBotConfigs() {
  const records = await BotChannelConfig.findAll({ where: { enabled: true } });
  const list = records
    .filter(r => r.config)
    .map(r => ({
      channel: r.channel,
      config: r.config,
      bindCode: r.config.bindCode || process.env.WECOM_BIND_CODE || ''
    }));
  if (list.length) return list;

  // fallback env（过渡期，配置还没录入数据库时）
  const result = [];
  const legacyChannel = process.env.IM_CHANNEL || 'wecom';
  if (legacyChannel === 'wecom' && process.env.WECOM_BOT_ID && process.env.WECOM_BOT_SECRET) {
    result.push({
      channel: 'wecom',
      config: { botId: process.env.WECOM_BOT_ID, secret: process.env.WECOM_BOT_SECRET },
      bindCode: process.env.WECOM_BIND_CODE || ''
    });
  }
  if (process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET) {
    result.push({
      channel: 'feishu',
      config: { appId: process.env.FEISHU_APP_ID, appSecret: process.env.FEISHU_APP_SECRET },
      bindCode: process.env.WECOM_BIND_CODE || ''
    });
  }
  return result;
}

// 兼容旧接口：返回单个（第一个启用渠道）
async function loadActiveBotConfig() {
  const list = await loadActiveBotConfigs();
  return list[0] || null;
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
  const newConfig = data.config !== undefined ? { ...data.config } : undefined;
  // 保留运行时学到的群会话 ID（前端不感知该字段，避免保存配置时被覆盖丢失）
  if (newConfig && record && record.config && record.config.groupChatId && !newConfig.groupChatId) {
    newConfig.groupChatId = record.config.groupChatId;
  }
  if (record) {
    await record.update({
      enabled: data.enabled !== undefined ? data.enabled : record.enabled,
      config: newConfig !== undefined ? newConfig : record.config
    });
    return record;
  }
  return BotChannelConfig.create({ channel, enabled: !!data.enabled, config: newConfig || {} });
}

/**
 * 启动 botService（读全部启用配置 → 逐渠道创建并启动 → 注册容器）
 * 多渠道并存：企微+飞书同时在线，通知推送到所有已连接群
 * @returns {Promise<string[]>} 启动的渠道名列表，未配置返回空数组
 */
async function bootstrapBotService() {
  const actives = await loadActiveBotConfigs();
  if (!actives.length) return [];
  const started = [];
  for (const active of actives) {
    try {
      const botService = createBotService(active.channel, active.config, { bindCode: active.bindCode });
      // 初始化群会话 ID（持久化：从数据库读取，重启不丢失）
      botService.channel.groupChatId = active.config.groupChatId || null;
      // 学到新群 ID 时回写数据库
      botService.setGroupChatIdPersist(async (chatId) => {
        const rec = await BotChannelConfig.findOne({ where: { channel: active.channel } });
        if (rec) {
          const cfg = { ...(rec.config || {}), groupChatId: chatId };
          await rec.update({ config: cfg });
        }
      });
      botServiceInstance.set(botService, active.channel);
      botService.start();
      started.push(active.channel);
    } catch (err) {
      console.error(`[botConfig] 渠道 ${active.channel} 启动失败:`, err.message);
    }
  }
  return started;
}

/**
 * 热重载 botService（配置变更后调用）：停止全部旧连接，用新配置重新启动
 * @returns {Promise<string[]>}
 */
async function reloadBotService() {
  await botServiceInstance.stopAll();
  return bootstrapBotService();
}

module.exports = {
  loadActiveBotConfig,
  loadActiveBotConfigs,
  listBotConfigs,
  upsertBotConfig,
  bootstrapBotService,
  reloadBotService
};

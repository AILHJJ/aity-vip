// 渠道配置控制器：后台管理 bot 渠道配置（读/写/热重载）
const { listBotConfigs, upsertBotConfig, reloadBotService } = require('../services/botConfigService');

// 获取所有渠道配置（凭证脱敏）
async function listConfigs(req, res) {
  try {
    const configs = await listBotConfigs();
    res.json({ code: 200, message: 'Success', data: configs });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 更新渠道配置（upsert by channel），并热重载 bot
async function updateConfig(req, res) {
  try {
    const { channel } = req.params;
    const { enabled, config } = req.body;
    if (!channel) {
      return res.status(400).json({ code: 400, message: 'channel 不能为空', data: null });
    }
    await upsertBotConfig(channel, { enabled, config });
    const activeChannel = await reloadBotService();
    res.json({ code: 200, message: `配置已更新，当前活跃渠道: ${activeChannel || '无'}`, data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// 手动热重载 bot（不更新配置，仅重新连接）
async function reload(req, res) {
  try {
    const channel = await reloadBotService();
    res.json({ code: 200, message: `已重载，当前活跃渠道: ${channel || '无'}`, data: null });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

module.exports = { listConfigs, updateConfig, reload };

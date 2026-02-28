// AI配置示例数据脚本
// 使用方法：node backend/scripts/seed-ai-config.js

require('dotenv').config();
const sequelize = require('../src/config/db');
const AiConfig = require('../src/models/AiConfig');

async function seedAiConfig() {
  try {
    console.log('开始同步数据库...');
    await sequelize.sync();
    console.log('数据库同步成功');

    console.log('\n检查是否已存在AI配置...');
    const existingConfig = await AiConfig.findOne();

    if (existingConfig) {
      console.log('已存在AI配置，跳过创建');
      console.log('现有配置：', existingConfig.toJSON());
      process.exit(0);
    }

    console.log('\n创建默认AI配置...');

    // 创建智谱AI配置
    const config = await AiConfig.create({
      modelName: 'glm-4-flash',
      displayName: '智谱AI GLM-4 Flash',
      apiKey: process.env.ZHIPU_API_KEY || 'your-api-key-here',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      promptTemplate: '请优化以下文案，使其更加专业和流畅：',
      isActive: true,
      defaultVersion: 'ai_optimized'
    });

    console.log('✅ AI配置创建成功：');
    console.log('  - 模型名称:', config.modelName);
    console.log('  - 显示名称:', config.displayName);
    console.log('  - Base URL:', config.baseUrl);
    console.log('  - 是否激活:', config.isActive);
    console.log('\n⚠️  请在数据库中更新实际的 API Key！');

    process.exit(0);
  } catch (error) {
    console.error('❌ 创建AI配置失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedAiConfig();

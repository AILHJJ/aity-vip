/**
 * 测试数据创建脚本
 * 用于填充数据库以便进行完整的功能测试
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || '投研图灵室',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// 导入模型
const User = require('../src/models/User');
const Message = require('../src/models/Message');
const Discussion = require('../src/models/Discussion');
const DiscussionReply = require('../src/models/DiscussionReply');
const UserFavorite = require('../src/models/UserFavorite');
const UserMessageRead = require('../src/models/UserMessageRead');

async function createTestData() {
  try {
    console.log('🔄 开始创建测试数据...\n');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 创建测试用户
    console.log('📝 创建测试用户...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = await Promise.all([
      User.findOrCreate({
        where: { email: 'admin@example.com' },
        defaults: {
          name: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'super_admin',
          groupId: 'all',
          status: 'active'
        }
      }),
      User.findOrCreate({
        where: { email: 'subadmin@example.com' },
        defaults: {
          name: 'subadmin',
          email: 'subadmin@example.com',
          password: hashedPassword,
          role: 'admin',
          groupId: 'all',
          status: 'active'
        }
      }),
      User.findOrCreate({
        where: { email: 'vip_mid@example.com' },
        defaults: {
          name: 'vip_mid_user',
          email: 'vip_mid@example.com',
          password: hashedPassword,
          role: 'vip_mid',
          groupId: 'vip_mid',
          status: 'active',
          expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年后过期
        }
      }),
      User.findOrCreate({
        where: { email: 'vip_short@example.com' },
        defaults: {
          name: 'vip_short_user',
          email: 'vip_short@example.com',
          password: hashedPassword,
          role: 'vip_short',
          groupId: 'vip_short',
          status: 'active',
          expireDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      }),
      User.findOrCreate({
        where: { email: 'trial@example.com' },
        defaults: {
          name: 'trial_user',
          email: 'trial@example.com',
          password: hashedPassword,
          role: 'trial',
          groupId: 'trial',
          status: 'active',
          expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
        }
      })
    ]);

    const [admin] = users[0];
    const [subadmin] = users[1];
    const [vipMidUser] = users[2];
    const [vipShortUser] = users[3];
    const [trialUser] = users[4];

    console.log(`✅ 创建了 ${users.length} 个用户\n`);

    // 2. 创建测试消息
    console.log('📝 创建测试消息...');
    const messages = [];

    // 全部用户可见的消息
    const allUserMessages = [
      {
        title: '盘前点评：市场情绪回暖，关注科技板块',
        content: '今日盘前分析：隔夜美股三大指数集体收涨，科技股表现强劲。A股市场预计将延续反弹态势，重点关注科技、新能源等板块机会。',
        type: 'pre_market_comment',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'all',
        tags: JSON.stringify(['全部用户']),
        status: 'published'
      },
      {
        title: '早盘点评：开盘平稳，科技股领涨',
        content: '早盘市场表现平稳，科技板块表现活跃，芯片、人工智能概念股涨幅居前。建议关注相关龙头股的交易机会。',
        type: 'morning_comment',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'all',
        tags: JSON.stringify(['全部用户']),
        status: 'published'
      },
      {
        title: '风险提示：注意市场波动风险',
        content: '近期市场波动加大，请各位投资者注意控制仓位，做好风险管理。建议设置止损位，避免追高。',
        type: 'risk_warning',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'all',
        tags: JSON.stringify(['全部用户']),
        status: 'published'
      },
      {
        title: '系统消息：平台维护通知',
        content: '系统将于本周六凌晨2:00-4:00进行例行维护，届时将暂停服务。请各位用户提前做好安排。',
        type: 'system',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'all',
        tags: JSON.stringify(['全部用户']),
        status: 'published'
      },
      {
        title: '重要消息：央行降准政策解读',
        content: '央行宣布降准0.5个百分点，释放长期资金约1万亿元。这将有利于降低实体经济融资成本，提振市场信心。',
        type: 'important',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'all',
        tags: JSON.stringify(['全部用户']),
        status: 'published'
      }
    ];

    // 中线策略消息
    const midTermMessages = [
      {
        title: '中线策略：新能源板块布局机会',
        content: '从中长期角度看，新能源行业仍处于高速发展期。建议关注光伏、储能、新能源汽车产业链的优质标的，适合中线布局。',
        type: 'important',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'vip_mid',
        tags: JSON.stringify(['中线策略']),
        status: 'published'
      },
      {
        title: '中线持仓：医药板块价值分析',
        content: '医药板块经过前期调整，估值已回到合理区间。创新药、医疗器械等细分领域具备中长期投资价值，建议逢低布局。',
        type: 'daily',
        sender: subadmin.name,
        senderId: subadmin.id,
        groupId: 'vip_mid',
        tags: JSON.stringify(['中线策略']),
        status: 'published'
      },
      {
        title: '收盘点评：中线持仓策略调整',
        content: '今日市场震荡整理，中线持仓建议保持耐心。重点关注业绩稳定、估值合理的优质标的，避免频繁交易。',
        type: 'close_comment',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'vip_mid',
        tags: JSON.stringify(['中线策略', '全部用户']),
        status: 'published'
      }
    ];

    // 短线策略消息
    const shortTermMessages = [
      {
        title: '早盘关注：热点题材短线机会',
        content: '今日关注AI概念、数字经济等热点题材。重点标的：XXX、YYY、ZZZ。建议快进快出，严格止损。',
        type: 'morning_focus',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'vip_short',
        tags: JSON.stringify(['短线策略']),
        status: 'published'
      },
      {
        title: '尾盘关注：短线强势股跟踪',
        content: '尾盘关注今日强势股的持续性。XXX股午后放量上涨，有望继续冲高。建议关注尾盘走势，择机介入。',
        type: 'afternoon_focus',
        sender: subadmin.name,
        senderId: subadmin.id,
        groupId: 'vip_short',
        tags: JSON.stringify(['短线策略']),
        status: 'published'
      },
      {
        title: '尾盘点评：短线操作总结',
        content: '今日短线操作回顾：AI概念股表现活跃，XXX涨停。明日继续关注板块轮动机会，保持灵活操作。',
        type: 'afternoon_comment',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'vip_short',
        tags: JSON.stringify(['短线策略']),
        status: 'published'
      }
    ];

    // 混合标签消息
    const mixedMessages = [
      {
        title: '重要提示：市场风格切换信号',
        content: '近期市场风格出现切换迹象，成长股表现强于价值股。中线投资者可适当调整持仓结构，短线投资者注意把握轮动机会。',
        type: 'important',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'all',
        tags: JSON.stringify(['全部用户', '中线策略', '短线策略']),
        status: 'published'
      },
      {
        title: '日常消息：本周市场展望',
        content: '本周市场预计将维持震荡格局，关注政策面和资金面变化。中线投资者保持耐心，短线投资者注意控制仓位。',
        type: 'daily',
        sender: admin.name,
        senderId: admin.id,
        groupId: 'all',
        tags: JSON.stringify(['全部用户', '中线策略', '短线策略']),
        status: 'published'
      }
    ];

    // 创建所有消息
    for (const msgData of [...allUserMessages, ...midTermMessages, ...shortTermMessages, ...mixedMessages]) {
      const [message] = await Message.findOrCreate({
        where: { title: msgData.title },
        defaults: msgData
      });
      messages.push(message);
    }

    console.log(`✅ 创建了 ${messages.length} 条消息\n`);

    // 3. 创建测试讨论
    console.log('📝 创建测试讨论...');
    const discussions = [];

    const discussionData = [
      {
        messageId: messages[0].id,
        userId: vipMidUser.id,
        userName: vipMidUser.name,
        title: '关于科技板块的投资疑问',
        content: '请问老师，当前科技板块的估值是否合理？是否适合中长期布局？',
        status: 'pending',
        visibility: 'public'
      },
      {
        messageId: messages[1].id,
        userId: vipShortUser.id,
        userName: vipShortUser.name,
        title: '芯片股短线操作建议',
        content: '今天芯片股涨幅较大，明天是否还有机会？',
        status: 'replied',
        visibility: 'public'
      },
      {
        messageId: messages[4].id,
        userId: trialUser.id,
        userName: trialUser.name,
        title: '降准政策对市场的影响',
        content: '请问降准政策会对哪些板块产生积极影响？',
        status: 'replied',
        visibility: 'public'
      },
      {
        messageId: messages[5].id,
        userId: vipMidUser.id,
        userName: vipMidUser.name,
        title: '新能源板块的投资时机',
        content: '新能源板块最近调整较多，现在是否是好的买入时机？',
        status: 'pending',
        visibility: 'private'
      },
      {
        messageId: messages[6].id,
        userId: vipMidUser.id,
        userName: vipMidUser.name,
        title: '医药股的选股思路',
        content: '医药板块标的众多，应该如何选择优质标的？',
        status: 'replied',
        visibility: 'public'
      },
      {
        messageId: messages[8].id,
        userId: vipShortUser.id,
        userName: vipShortUser.name,
        title: 'AI概念股操作策略',
        content: 'AI概念最近很火，但波动也大，如何把握短线机会？',
        status: 'replied',
        visibility: 'public'
      },
      {
        messageId: messages[10].id,
        userId: vipShortUser.id,
        userName: vipShortUser.name,
        title: '短线止损设置问题',
        content: '请问老师，短线操作的止损位应该如何设置？',
        status: 'pending',
        visibility: 'private'
      },
      {
        messageId: messages[11].id,
        userId: vipMidUser.id,
        userName: vipMidUser.name,
        title: '市场风格切换应对策略',
        content: '面对市场风格切换，应该如何调整投资策略？',
        status: 'replied',
        visibility: 'public'
      }
    ];

    for (const discData of discussionData) {
      const [discussion] = await Discussion.findOrCreate({
        where: {
          messageId: discData.messageId,
          userId: discData.userId,
          title: discData.title
        },
        defaults: discData
      });
      discussions.push(discussion);
    }

    console.log(`✅ 创建了 ${discussions.length} 个讨论\n`);

    // 4. 创建讨论回复
    console.log('📝 创建讨论回复...');
    const replies = [];

    const replyData = [
      // 讨论1的回复
      {
        discussionId: discussions[1].id,
        senderId: admin.id,
        senderName: admin.name,
        content: '芯片股短期涨幅较大，建议关注回调后的低吸机会。不建议追高，可以等待调整后再介入。'
      },
      {
        discussionId: discussions[1].id,
        senderId: vipShortUser.id,
        senderName: vipShortUser.name,
        content: '明白了，谢谢老师！我会等待回调机会。'
      },
      // 讨论2的回复
      {
        discussionId: discussions[2].id,
        senderId: admin.id,
        senderName: admin.name,
        content: '降准政策主要利好银行、地产、基建等板块。同时也会提振整体市场信心，对成长股也有积极影响。'
      },
      {
        discussionId: discussions[2].id,
        senderId: trialUser.id,
        senderName: trialUser.name,
        content: '感谢老师详细解答！'
      },
      // 讨论4的回复
      {
        discussionId: discussions[4].id,
        senderId: subadmin.id,
        senderName: subadmin.name,
        content: '医药股选股建议关注三个方向：1) 创新药企业 2) 医疗器械龙头 3) 医药流通企业。重点看研发能力和业绩增长。'
      },
      {
        discussionId: discussions[4].id,
        senderId: vipMidUser.id,
        senderName: vipMidUser.name,
        content: '非常感谢！这个思路很清晰。'
      },
      // 讨论5的回复
      {
        discussionId: discussions[5].id,
        senderId: admin.id,
        senderName: admin.name,
        content: 'AI概念短线操作要点：1) 选择龙头股 2) 控制仓位 3) 设置止损 4) 快进快出。不要贪心，见好就收。'
      },
      {
        discussionId: discussions[5].id,
        senderId: vipShortUser.id,
        senderName: vipShortUser.name,
        content: '记住了，谢谢老师提醒！'
      },
      // 讨论7的回复
      {
        discussionId: discussions[7].id,
        senderId: admin.id,
        senderName: admin.name,
        content: '市场风格切换时，建议：1) 中线投资者适当增加成长股配置 2) 短线投资者关注热点轮动 3) 保持灵活，及时调整。'
      },
      {
        discussionId: discussions[7].id,
        senderId: vipMidUser.id,
        senderName: vipMidUser.name,
        content: '明白了，我会根据市场变化及时调整。'
      },
      {
        discussionId: discussions[7].id,
        senderId: subadmin.id,
        senderName: subadmin.name,
        content: '补充一点：风格切换往往伴随着板块轮动，要注意资金流向的变化。'
      },
      {
        discussionId: discussions[7].id,
        senderId: vipMidUser.id,
        senderName: vipMidUser.name,
        content: '好的，我会密切关注资金动向。感谢两位老师！'
      }
    ];

    for (const repData of replyData) {
      const [reply] = await DiscussionReply.findOrCreate({
        where: {
          discussionId: repData.discussionId,
          senderId: repData.senderId,
          content: repData.content
        },
        defaults: repData
      });
      replies.push(reply);
    }

    console.log(`✅ 创建了 ${replies.length} 条讨论回复\n`);

    // 5. 创建收藏记录
    console.log('📝 创建收藏记录...');
    const favorites = [];

    const favoriteData = [
      { userId: vipMidUser.id, messageId: messages[0].id },
      { userId: vipMidUser.id, messageId: messages[4].id },
      { userId: vipMidUser.id, messageId: messages[5].id },
      { userId: vipMidUser.id, messageId: messages[11].id },
      { userId: vipShortUser.id, messageId: messages[0].id },
      { userId: vipShortUser.id, messageId: messages[2].id },
      { userId: vipShortUser.id, messageId: messages[8].id },
      { userId: trialUser.id, messageId: messages[0].id },
      { userId: trialUser.id, messageId: messages[4].id }
    ];

    for (const favData of favoriteData) {
      const [favorite] = await UserFavorite.findOrCreate({
        where: favData,
        defaults: favData
      });
      favorites.push(favorite);
    }

    console.log(`✅ 创建了 ${favorites.length} 条收藏记录\n`);

    // 6. 创建已读记录
    console.log('📝 创建已读记录...');
    const readRecords = [];

    const readData = [
      // vipMidUser 已读记录
      { userId: vipMidUser.id, messageId: messages[0].id },
      { userId: vipMidUser.id, messageId: messages[1].id },
      { userId: vipMidUser.id, messageId: messages[2].id },
      { userId: vipMidUser.id, messageId: messages[4].id },
      { userId: vipMidUser.id, messageId: messages[5].id },
      { userId: vipMidUser.id, messageId: messages[7].id },
      // vipShortUser 已读记录
      { userId: vipShortUser.id, messageId: messages[0].id },
      { userId: vipShortUser.id, messageId: messages[1].id },
      { userId: vipShortUser.id, messageId: messages[2].id },
      { userId: vipShortUser.id, messageId: messages[8].id },
      { userId: vipShortUser.id, messageId: messages[9].id },
      { userId: vipShortUser.id, messageId: messages[10].id },
      // trialUser 已读记录
      { userId: trialUser.id, messageId: messages[0].id },
      { userId: trialUser.id, messageId: messages[1].id },
      { userId: trialUser.id, messageId: messages[3].id },
      { userId: trialUser.id, messageId: messages[4].id }
    ];

    for (const readRec of readData) {
      const [record] = await UserMessageRead.findOrCreate({
        where: readRec,
        defaults: readRec
      });
      readRecords.push(record);
    }

    console.log(`✅ 创建了 ${readRecords.length} 条已读记录\n`);

    console.log('✅ 测试数据创建成功！\n');
    console.log('📊 数据统计：');
    console.log(`   - 用户数量: ${users.length}`);
    console.log(`   - 消息数量: ${messages.length}`);
    console.log(`   - 讨论数量: ${discussions.length}`);
    console.log(`   - 回复数量: ${replies.length}`);
    console.log(`   - 收藏数量: ${favorites.length}`);
    console.log(`   - 已读记录: ${readRecords.length}\n`);

    console.log('🔐 测试账号信息：');
    console.log('   1. 超级管理员: admin@example.com / 123456');
    console.log('   2. 子管理员: subadmin@example.com / 123456');
    console.log('   3. 中线VIP用户: vip_mid@example.com / 123456');
    console.log('   4. 短线VIP用户: vip_short@example.com / 123456');
    console.log('   5. 试用用户: trial@example.com / 123456\n');

    console.log('✨ 可以开始测试以下功能：');
    console.log('   ✓ 用户登录和权限控制');
    console.log('   ✓ 消息列表和权限过滤（根据用户标签）');
    console.log('   ✓ 消息详情和已读状态');
    console.log('   ✓ 消息收藏功能');
    console.log('   ✓ 讨论创建和回复');
    console.log('   ✓ 讨论可见性控制（公开/私密）');
    console.log('   ✓ 消息类型筛选（10种类型）');
    console.log('   ✓ 搜索功能');
    console.log('   ✓ 用户管理（管理员）');
    console.log('   ✓ 数据统计（管理员）\n');

  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
createTestData()
  .then(() => {
    console.log('🎉 脚本执行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });

/**
 * 完整测试数据初始化脚本
 * 创建用户、消息、讨论、回复、收藏和已读记录
 */

const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/db');
const User = require('./src/models/User');
const Message = require('./src/models/Message');
const Discussion = require('./src/models/Discussion');
const DiscussionReply = require('./src/models/DiscussionReply');
const UserFavorite = require('./src/models/UserFavorite');
const UserMessageRead = require('./src/models/UserMessageRead');

// 消息类型
const MESSAGE_TYPES = [
  'pre_market_comment',
  'morning_comment',
  'morning_focus',
  'afternoon_comment',
  'afternoon_focus',
  'close_comment',
  'risk_warning',
  'system',
  'important',
  'daily'
];

// 消息标签
const MESSAGE_TAGS = {
  SHORT_TERM: 'short_term',
  MID_TERM: 'mid_term',
  ALL_USERS: 'all_users'
};

// 生成随机日期（最近30天内）
function getRandomDate(daysAgo = 30) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);

  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes, 0, 0);

  return date;
}

// 生成随机标签组合
function getRandomTags() {
  const tagCombinations = [
    [MESSAGE_TAGS.SHORT_TERM],
    [MESSAGE_TAGS.MID_TERM],
    [MESSAGE_TAGS.ALL_USERS],
    [MESSAGE_TAGS.SHORT_TERM, MESSAGE_TAGS.MID_TERM]
  ];

  return tagCombinations[Math.floor(Math.random() * tagCombinations.length)];
}

// 主函数
async function initTestData() {
  try {
    console.log('开始初始化测试数据...\n');

    // 1. 清空相关表数据
    console.log('1. 清空现有数据...');
    await UserMessageRead.destroy({ where: {}, force: true });
    await UserFavorite.destroy({ where: {}, force: true });
    await DiscussionReply.destroy({ where: {}, force: true });
    await Discussion.destroy({ where: {}, force: true });
    await Message.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    console.log('   ✓ 数据清空完成\n');

    // 2. 创建用户
    console.log('2. 创建用户...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = await User.bulkCreate([
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'super_admin',
        groupId: 'all',
        status: 'active'
      },
      {
        name: 'SubAdmin',
        email: 'subadmin@example.com',
        password: hashedPassword,
        role: 'admin',
        groupId: 'all',
        status: 'active'
      },
      {
        name: 'VIP中线用户',
        email: 'vip_mid@example.com',
        password: hashedPassword,
        role: 'vip_mid',
        groupId: 'vip_mid',
        status: 'active'
      },
      {
        name: 'VIP短线用户',
        email: 'vip_short@example.com',
        password: hashedPassword,
        role: 'vip_short',
        groupId: 'vip_short',
        status: 'active'
      },
      {
        name: '体验用户',
        email: 'trial@example.com',
        password: hashedPassword,
        role: 'trial',
        groupId: 'trial',
        status: 'active',
        expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
      }
    ]);

    console.log(`   ✓ 创建了 ${users.length} 个用户\n`);

    // 3. 创建消息
    console.log('3. 创建消息...');
    const adminUser = users[0];
    const messages = [];

    // 为每种类型创建2条消息
    for (let i = 0; i < MESSAGE_TYPES.length; i++) {
      const type = MESSAGE_TYPES[i];

      for (let j = 0; j < 2; j++) {
        const tags = getRandomTags();
        const createdAt = getRandomDate(30);

        const message = await Message.create({
          title: `${getTypeLabel(type)} - 测试消息 ${i * 2 + j + 1}`,
          content: `这是一条${getTypeLabel(type)}的测试内容。包含详细的市场分析和投资建议。\n\n主要观点：\n1. 市场趋势分析\n2. 重点关注板块\n3. 风险提示\n\n请各位投资者注意风险控制。`,
          type: type,
          sender: adminUser.name,
          senderId: adminUser.id,
          groupId: 'all',
          tags: tags,
          status: 'published',
          readCount: Math.floor(Math.random() * 50),
          totalCount: 100,
          createdAt: createdAt
        });

        messages.push(message);
      }
    }

    console.log(`   ✓ 创建了 ${messages.length} 条消息\n`);

    // 4. 创建讨论
    console.log('4. 创建讨论...');
    const discussions = [];
    const discussionTypes = ['public', 'private'];

    for (let i = 0; i < 15; i++) {
      const message = messages[i % messages.length];
      const user = users[2 + (i % 3)]; // 使用非管理员用户
      const visibility = discussionTypes[i % 2];
      const status = i % 3 === 0 ? 'replied' : 'pending';
      const createdAt = new Date(message.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);

      const discussion = await Discussion.create({
        messageId: message.id,
        userId: user.id,
        userName: user.name,
        title: `关于"${message.title}"的讨论 ${i + 1}`,
        content: `我对这条消息有一些疑问和想法：\n\n1. 关于市场趋势的判断\n2. 具体的操作建议\n3. 风险控制措施\n\n希望能得到详细解答。`,
        status: status,
        visibility: visibility,
        createdAt: createdAt
      });

      discussions.push(discussion);
    }

    console.log(`   ✓ 创建了 ${discussions.length} 条讨论\n`);

    // 5. 创建讨论回复
    console.log('5. 创建讨论回复...');
    let replyCount = 0;

    for (const discussion of discussions) {
      const numReplies = Math.floor(Math.random() * 3) + 1; // 1-3条回复

      for (let i = 0; i < numReplies; i++) {
        const replier = i === 0 ? users[0] : users[Math.floor(Math.random() * users.length)];
        const replyCreatedAt = new Date(discussion.createdAt.getTime() + (i + 1) * 60 * 60 * 1000);

        await DiscussionReply.create({
          discussionId: discussion.id,
          senderId: replier.id,
          senderName: replier.name,
          content: i === 0
            ? `感谢您的提问。关于您提到的问题，我的看法是：\n\n1. 市场趋势确实如分析所示\n2. 建议采取稳健的投资策略\n3. 严格控制仓位和止损\n\n希望对您有帮助。`
            : `我也有类似的看法。补充一点：${['注意风险控制', '关注市场变化', '保持理性投资'][i % 3]}。`,
          createdAt: replyCreatedAt
        });

        replyCount++;
      }

      // 如果有回复，更新讨论状态为已回复
      if (numReplies > 0) {
        await discussion.update({ status: 'replied' });
      }
    }

    console.log(`   ✓ 创建了 ${replyCount} 条回复\n`);

    // 6. 创建收藏记录
    console.log('6. 创建收藏记录...');
    const favorites = [];

    for (let i = 0; i < 10; i++) {
      const user = users[2 + (i % 3)]; // 使用非管理员用户
      const message = messages[i % messages.length];

      try {
        await UserFavorite.create({
          userId: user.id,
          messageId: message.id
        });
        favorites.push({ userId: user.id, messageId: message.id });
      } catch (error) {
        // 忽略重复收藏错误
      }
    }

    console.log(`   ✓ 创建了 ${favorites.length} 条收藏记录\n`);

    // 7. 创建已读记录
    console.log('7. 创建已读记录...');
    const reads = [];

    for (const user of users) {
      // 每个用户随机阅读10-15条消息
      const numReads = Math.floor(Math.random() * 6) + 10;
      const shuffledMessages = [...messages].sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(numReads, messages.length); i++) {
        try {
          await UserMessageRead.create({
            userId: user.id,
            messageId: shuffledMessages[i].id
          });
          reads.push({ userId: user.id, messageId: shuffledMessages[i].id });
        } catch (error) {
          // 忽略重复阅读错误
        }
      }
    }

    console.log(`   ✓ 创建了 ${reads.length} 条已读记录\n`);

    // 8. 输出统计信息
    console.log('========================================');
    console.log('测试数据创建完成！\n');
    console.log('统计信息：');
    console.log(`  用户数量: ${users.length}`);
    console.log(`  消息数量: ${messages.length}`);
    console.log(`  讨论数量: ${discussions.length}`);
    console.log(`  回复数量: ${replyCount}`);
    console.log(`  收藏数量: ${favorites.length}`);
    console.log(`  已读记录: ${reads.length}`);
    console.log('\n用户账号信息：');
    console.log('  超级管理员: admin@example.com / 123456');
    console.log('  管理员: subadmin@example.com / 123456');
    console.log('  VIP中线用户: vip_mid@example.com / 123456');
    console.log('  VIP短线用户: vip_short@example.com / 123456');
    console.log('  体验用户: trial@example.com / 123456 (7天后过期)');
    console.log('========================================\n');

  } catch (error) {
    console.error('初始化测试数据失败:', error);
    throw error;
  }
}

// 获取消息类型标签
function getTypeLabel(type) {
  const labels = {
    'pre_market_comment': '盘前点评',
    'morning_comment': '早盘点评',
    'morning_focus': '早盘关注',
    'afternoon_comment': '尾盘点评',
    'afternoon_focus': '尾盘关注',
    'close_comment': '收盘点评',
    'risk_warning': '风险提示',
    'system': '系统消息',
    'important': '重要消息',
    'daily': '日常消息'
  };
  return labels[type] || type;
}

// 执行脚本
if (require.main === module) {
  initTestData()
    .then(() => {
      console.log('脚本执行成功！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = initTestData;

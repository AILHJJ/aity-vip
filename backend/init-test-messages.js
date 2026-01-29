// 初始化测试消息数据
require('dotenv').config({ path: '.env.test' });
const sequelize = require('./src/config/db');
const Message = require('./src/models/Message');
const User = require('./src/models/User');

async function initTestMessages() {
  try {
    console.log('开始初始化测试消息数据...');

    // 获取管理员用户
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!admin) {
      console.error('未找到管理员账号，请先运行 init-test-data.js');
      process.exit(1);
    }

    console.log('找到管理员账号:', admin.name);

    // 创建测试消息
    const testMessages = [
      {
        title: '盘前点评：市场情绪回暖，关注科技板块',
        content: '今日盘前，市场情绪有所回暖。建议关注科技板块的投资机会，特别是人工智能和半导体相关个股。',
        type: 'pre_market_comment',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['全部用户'],
        status: 'published'
      },
      {
        title: '早盘点评：沪指高开低走，注意风险控制',
        content: '早盘沪指高开后出现回落，成交量较昨日有所放大。建议投资者注意风险控制，不要追高。',
        type: 'morning_comment',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['短线策略', '全部用户'],
        status: 'published'
      },
      {
        title: '早盘关注：新能源汽车板块异动',
        content: '新能源汽车板块早盘异动，多只个股涨停。建议关注产业链上游的锂电池和电池材料相关标的。',
        type: 'morning_focus',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['中线策略', '全部用户'],
        status: 'published'
      },
      {
        title: '午盘点评：市场震荡整理，等待方向选择',
        content: '午盘市场呈现震荡整理态势，多空双方争夺激烈。下午需关注量能变化，等待市场方向选择。',
        type: 'afternoon_comment',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['全部用户'],
        status: 'published'
      },
      {
        title: '午盘关注：医药板块持续走强',
        content: '医药板块午盘持续走强，创新药和医疗器械板块表现突出。建议关注业绩确定性较高的龙头企业。',
        type: 'afternoon_focus',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['中线策略'],
        status: 'published'
      },
      {
        title: '收盘点评：三大指数集体收涨，市场信心恢复',
        content: '今日三大指数集体收涨，沪指涨1.2%，创业板指涨1.8%。成交量较昨日放大，市场信心有所恢复。',
        type: 'close_comment',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['全部用户'],
        status: 'published'
      },
      {
        title: '风险提示：某科技股业绩预警，建议规避',
        content: '某科技龙头股发布业绩预警，预计一季度净利润同比下降30%。建议持有该股的投资者注意风险，适当减仓。',
        type: 'risk_warning',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['全部用户'],
        status: 'published'
      },
      {
        title: '系统通知：平台将于本周末进行系统维护',
        content: '尊敬的用户，我们将于本周六晚上22:00-24:00进行系统维护升级，期间平台将暂停服务。给您带来不便，敬请谅解。',
        type: 'system',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['全部用户'],
        status: 'published'
      },
      {
        title: '重要消息：央行宣布降准0.5个百分点',
        content: '央行今日宣布，将于下周一起下调金融机构存款准备金率0.5个百分点，释放长期资金约1万亿元。这将有利于市场流动性改善。',
        type: 'important',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['全部用户'],
        status: 'published'
      },
      {
        title: '每日复盘：市场走势分析与明日策略',
        content: '今日市场整体表现良好，科技、新能源、医药三大板块领涨。技术面上，沪指站稳3200点，短期有望继续上攻。明日建议关注券商和银行板块的补涨机会。',
        type: 'daily',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['全部用户'],
        status: 'published'
      },
      {
        title: '短线机会：某芯片股突破关键压力位',
        content: '某芯片龙头股今日放量突破60日均线压力位，MACD金叉，短线有望继续上涨。建议短线投资者关注，止损位设在突破位下方3%。',
        type: 'morning_focus',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['短线策略'],
        status: 'published'
      },
      {
        title: '中线布局：新能源产业链投资机会分析',
        content: '从产业趋势看，新能源汽车渗透率持续提升，产业链中游的电池和上游的锂矿资源具有较好的中线投资价值。建议分批建仓，持有3-6个月。',
        type: 'daily',
        groupId: 'all',
        sender: admin.name,
        senderId: admin.id,
        tags: ['中线策略'],
        status: 'published'
      }
    ];

    // 批量创建消息
    for (const messageData of testMessages) {
      await Message.create(messageData);
      console.log(`创建测试消息: ${messageData.title}`);
    }

    console.log('\n测试消息数据初始化完成');
    console.log(`共创建 ${testMessages.length} 条测试消息`);
    console.log('\n消息类型分布:');
    console.log('- 盘前点评: 1条');
    console.log('- 早盘点评: 1条');
    console.log('- 早盘关注: 2条');
    console.log('- 午盘点评: 1条');
    console.log('- 午盘关注: 1条');
    console.log('- 收盘点评: 1条');
    console.log('- 风险提示: 1条');
    console.log('- 系统消息: 1条');
    console.log('- 重要消息: 1条');
    console.log('- 每日消息: 2条');
    console.log('\n标签分布:');
    console.log('- 全部用户: 10条');
    console.log('- 短线策略: 2条');
    console.log('- 中线策略: 3条');

    process.exit(0);
  } catch (error) {
    console.error('初始化测试消息数据失败:', error);
    process.exit(1);
  }
}

initTestMessages();

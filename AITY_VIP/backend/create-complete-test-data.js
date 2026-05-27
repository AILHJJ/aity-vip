/**
 * 创建完整的测试数据集
 * 确保有足够的测试消息，包含各种标签组合
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/db');
const User = require('./src/models/User');
const Message = require('./src/models/Message');

async function createCompleteTestData() {
  try {
    console.log('开始创建完整测试数据集...\n');

    // 1. 检查现有用户
    console.log('1. 检查用户数据...');
    const users = await User.findAll();
    console.log(`   找到 ${users.length} 个用户\n`);

    if (users.length === 0) {
      console.error('错误：数据库中没有用户！请先运行 init-complete-test-data.js 创建基础数据');
      process.exit(1);
    }

    const admin = users.find(u => u.role === 'super_admin') || users[0];
    console.log(`   使用管理员账号: ${admin.name} (${admin.email})\n`);

    // 2. 清空现有消息及相关数据
    console.log('2. 清空现有数据...');
    const Discussion = require('./src/models/Discussion');
    const DiscussionReply = require('./src/models/DiscussionReply');
    const UserFavorite = require('./src/models/UserFavorite');
    const UserMessageRead = require('./src/models/UserMessageRead');
    const MessageAttachment = require('./src/models/MessageAttachment');

    // 先删除关联数据
    await DiscussionReply.destroy({ where: {} });
    await Discussion.destroy({ where: {} });
    await UserFavorite.destroy({ where: {} });
    await UserMessageRead.destroy({ where: {} });
    await MessageAttachment.destroy({ where: {} });

    const deletedCount = await Message.destroy({ where: {} });
    console.log(`   删除了 ${deletedCount} 条旧消息\n`);

    // 3. 创建新的测试消息
    console.log('3. 创建测试消息...\n');

    const messages = [];

    // === 全部用户可见的消息 (all_users) ===
    const allUsersMessages = [
      {
        title: '【系统通知】平台服务升级公告',
        content: '尊敬的用户：\n\n为了提供更好的服务体验，我们将于本周六晚上22:00-24:00进行系统升级维护。升级期间平台将暂停服务，给您带来不便敬请谅解。\n\n升级内容：\n1. 优化消息推送速度\n2. 新增数据分析功能\n3. 提升系统安全性\n\n感谢您的支持！',
        type: 'system',
        tags: ['all_users']
      },
      {
        title: '【重要消息】市场重大政策解读',
        content: '今日市场重要政策消息：\n\n1. 央行宣布降准0.5个百分点，释放长期资金约1万亿元\n2. 证监会发布多项资本市场改革措施\n3. 科创板注册制改革稳步推进\n\n市场影响分析：\n- 银行、券商板块直接受益\n- 市场流动性得到改善\n- 投资者信心有望提升\n\n建议关注相关板块投资机会。',
        type: 'important',
        tags: ['all_users']
      },
      {
        title: '【盘前点评】市场情绪分析',
        content: '今日盘前市场情绪分析：\n\n外盘表现：\n- 美股三大指数集体收涨\n- 欧洲股市普遍上涨\n- 亚太股市开盘走高\n\n国内消息：\n- 政策面持续利好\n- 资金面相对宽松\n- 技术面有望突破\n\n操作建议：\n1. 控制仓位，稳健为主\n2. 关注政策受益板块\n3. 注意风险控制',
        type: 'pre_market_comment',
        tags: ['all_users']
      },
      {
        title: '【早盘点评】市场走势回顾',
        content: '早盘市场走势回顾：\n\n指数表现：\n- 沪指开盘涨0.5%\n- 深成指涨0.6%\n- 创业板指涨0.8%\n\n板块热点：\n1. 科技股表现强势\n2. 新能源汽车活跃\n3. 医药板块企稳回升\n\n成交量方面较昨日有所放大，市场参与度提升。建议继续关注优质标的的投资机会。',
        type: 'morning_comment',
        tags: ['all_users']
      },
      {
        title: '【尾盘点评】市场总结',
        content: '今日市场总结：\n\n收盘情况：\n- 沪指收涨1.2%\n- 深成指涨1.5%\n- 创业板指涨1.8%\n\n市场特征：\n1. 成交量明显放大\n2. 个股普涨格局\n3. 热点板块轮动良好\n\n明日策略：\n- 关注量能持续性\n- 留意板块轮动\n- 严格止损止盈',
        type: 'close_comment',
        tags: ['all_users']
      },
      {
        title: '【风险提示】市场波动加剧',
        content: '风险提示：\n\n近期市场波动加剧，请各位投资者注意：\n\n1. 控制仓位：建议控制在5-6成\n2. 分散投资：不要集中单一板块\n3. 设置止损：严格执行纪律\n4. 理性投资：不要追涨杀跌\n\n特别提醒：\n- 谨慎对待高位股\n- 关注业绩确定性\n- 避免题材炒作\n\n投资有风险，入市需谨慎！',
        type: 'risk_warning',
        tags: ['all_users']
      },
      {
        title: '【每日复盘】市场机会分析',
        content: '每日市场复盘：\n\n今日亮点：\n1. 科技板块全线走强\n2. 新能源产业链活跃\n3. 消费板块企稳\n\n资金流向：\n- 北向资金净流入50亿\n- 主力资金偏好科技股\n- 散户情绪回暖\n\n技术分析：\n- 沪指站稳3200点\n- 均线系统多头排列\n- MACD金叉确认\n\n明日关注：\n1. 券商板块机会\n2. 科技股持续性\n3. 量能变化情况',
        type: 'daily',
        tags: ['all_users']
      },
      {
        title: '【午盘点评】市场动态',
        content: '午盘市场动态：\n\n上午走势：\n- 指数震荡上行\n- 板块轮动明显\n- 人气逐步恢复\n\n午间消息：\n1. 政策利好持续\n2. 资金面相对宽松\n3. 外部环境改善\n\n下午策略：\n- 关注量能变化\n- 留意热点持续性\n- 严格风险控制',
        type: 'afternoon_comment',
        tags: ['all_users']
      }
    ];

    // === VIP短线用户可见的消息 (short_term) ===
    const shortTermMessages = [
      {
        title: '【短线机会】科技龙头突破信号',
        content: '短线机会分析：\n\n标的：某科技龙头股\n\n技术面：\n1. 放量突破60日均线\n2. MACD金叉确认\n3. RSI指标强势\n\n基本面：\n- 业绩持续增长\n- 行业景气度提升\n- 政策大力支持\n\n操作建议：\n- 短线参与\n- 目标收益：+10%\n- 止损位：-3%\n- 持仓周期：3-5天\n\n风险提示：\n严格止损，不要重仓单一标的。',
        type: 'morning_focus',
        tags: ['short_term']
      },
      {
        title: '【短线策略】热点题材捕捉',
        content: '短线热点题材分析：\n\n当前热点：\n1. 人工智能板块\n2. 芯片半导体\n3. 数字经济\n\n操作策略：\n\n仓位配置：\n- 单只标的：不超过2成\n- 总仓位：控制在5成内\n- 留有机动资金\n\n选股思路：\n1. 龙头优先\n2. 成交量放大\n3. 技术形态突破\n\n买卖点把握：\n- 买点：回调企稳\n- 卖点：放量滞涨\n- 止损：严格执行',
        type: 'afternoon_focus',
        tags: ['short_term']
      },
      {
        title: '【早盘关注】短线强势股',
        content: '早盘强势股关注：\n\n股票代码：XXXXXX\n\n入选理由：\n1. 昨日涨停\n2. 量能放大\n3. 热点题材\n\n今日策略：\n- 开盘观察\n- 回调介入\n- 不追高\n\n目标收益：+5-8%\n止损位：-3%\n\n注意：\n短线操作，快进快出，不要贪婪。',
        type: 'morning_focus',
        tags: ['short_term']
      },
      {
        title: '【尾盘关注】明日短线机会',
        content: '明日短线机会前瞻：\n\n关注方向：\n1. 今日强势股的延续\n2. 板块轮动机会\n3. 消息面催化\n\n备选标的池：\n- 科技龙头：3只\n- 新能源：2只\n- 医药：2只\n\n操作准备：\n1. 提前加入自选\n2. 设置价格提醒\n3. 制定交易计划\n\n纪律要求：\n- 不追涨杀跌\n- 严格止损\n- 控制仓位',
        type: 'afternoon_focus',
        tags: ['short_term']
      },
      {
        title: '【短线点评】盘面热点分析',
        content: '今日盘面热点分析：\n\n热点板块：\n1. AI人工智能：领涨\n2. 半导体芯片：跟随\n3. 5G通信：活跃\n\n资金流向：\n- 主力资金净流入\n- 游资活跃度提升\n- 散户情绪高涨\n\n操作建议：\n1. 关注龙头股\n2. 回调就是机会\n3. 不要盲目追高\n\n明日计划：\n- 继续跟踪热点\n- 寻找补涨机会\n- 严格风险控制',
        type: 'morning_comment',
        tags: ['short_term']
      },
      {
        title: '【短线风险】高位股风险提示',
        content: '短线风险提示：\n\n风险类型：\n1. 高位股回调风险\n2. 热点切换风险\n3. 获利盘回吐风险\n\n应对策略：\n\n持仓方面：\n- 降低仓位\n- 止盈部分获利标的\n- 保留核心持仓\n\n操作方面：\n- 不追高\n- 等待回调机会\n- 严格止损\n\n特别提醒：\n短线操作，纪律第一！',
        type: 'risk_warning',
        tags: ['short_term']
      },
      {
        title: '【短线复盘】今日操作总结',
        content: '今日短线操作总结：\n\n成功案例：\n1. XX股：+8%止盈\n2. XX股：+5%收益\n\n失败教训：\n1. XX股：止损-3%\n2. 未能及时止盈\n\n经验总结：\n\n做得好的：\n1. 严格执行止损\n2. 及时止盈\n3. 控制仓位\n\n需要改进：\n1. 买点把握\n2. 持仓耐心\n3. 止盈时机\n\n明日计划：\n继续完善交易系统，提高胜率。',
        type: 'daily',
        tags: ['short_term']
      },
      {
        title: '【短线策略】技术面分析',
        content: '短线技术面分析：\n\n技术指标：\n1. MACD：金叉，买入信号\n2. KDJ：超买，注意回调\n3. RSI：强势区间\n4. 成交量：放大\n\nK线形态：\n- 突破平台\n- 放量上涨\n- 多头排列\n\n支撑阻力：\n- 支撑位：XX元\n- 压力位：XX元\n\n操作建议：\n回调企稳后介入，目标收益10%，止损3%。',
        type: 'pre_market_comment',
        tags: ['short_term']
      }
    ];

    // === VIP中线用户可见的消息 (mid_term) ===
    const midTermMessages = [
      {
        title: '【中线布局】新能源汽车产业链',
        content: '中线投资机会：新能源汽车产业链\n\n投资逻辑：\n\n1. 行业趋势\n- 渗透率持续提升\n- 政策大力支持\n- 技术不断进步\n\n2. 产业链机会\n上游：\n- 锂矿资源\n- 电池材料\n中游：\n- 电池制造\n- 电机电控\n下游：\n- 整车制造\n- 充电设施\n\n3. 投资建议\n- 仓位：3-4成\n- 持有周期：3-6个月\n- 目标收益：20-30%\n- 分批建仓\n\n风险控制：\n- 设置止损-10%\n- 关注行业政策\n- 定期复盘',
        type: 'daily',
        tags: ['mid_term']
      },
      {
        title: '【中线策略】优质白马股配置',
        content: '中线白马股配置策略：\n\n选股标准：\n\n基本面：\n1. 业绩持续增长\n2. 行业地位领先\n3. 现金流稳定\n4. 分红稳定\n\n技术面：\n1. 趋势向上\n2. 成交量温和\n3. 均线多头排列\n\n估值水平：\n- PE合理（<30倍）\n- PB适中（<3倍）\n- PEG<1\n\n配置建议：\n- 单只标的：2-3成\n- 总仓位：6-7成\n- 持有周期：6-12个月\n\n目标收益：年化20%以上',
        type: 'important',
        tags: ['mid_term']
      },
      {
        title: '【中线分析】医药板块价值发现',
        content: '医药板块中线投资分析：\n\n投资逻辑：\n\n1. 政策环境\n- 集采常态化\n- 创新药支持\n- 医保目录调整\n\n2. 细分领域机会\n创新药：\n- 研发能力强\n- 管线丰富\n医疗器械：\n- 国产替代\n- 出口机会\n医疗服务：\n- 消费升级\n- 量价齐升\n\n3. 个股选择\n- 龙头企业优先\n- 业绩确定性高\n- 估值合理\n\n4. 操作策略\n- 逢低布局\n- 分批建仓\n- 长期持有\n- 目标收益30%',
        type: 'afternoon_focus',
        tags: ['mid_term']
      },
      {
        title: '【中线持仓】周度复盘',
        content: '中线持仓周度复盘：\n\n持仓情况：\n\n标的1：新能源龙头\n- 持仓收益：+15%\n- 持有时间：1个月\n- 操作计划：继续持有\n\n标的2：医药白马\n- 持仓收益：+8%\n- 持有时间：2周\n- 操作计划：逢低加仓\n\n标的3：科技成长\n- 持仓收益：-3%\n- 持有时间：3周\n- 操作计划：等待反弹\n\n市场环境：\n- 整体趋势向上\n- 板块轮动正常\n- 业绩预期良好\n\n下周计划：\n- 继续持有核心标的\n- 寻找加仓机会\n- 关注财报季',
        type: 'daily',
        tags: ['mid_term']
      },
      {
        title: '【中线机会】消费升级主题',
        content: '消费升级主题中线机会：\n\n投资主题：\n\n1. 高端消费\n- 奢侈品\n- 高端白酒\n- 医美美容\n\n2. 服务消费\n- 旅游酒店\n- 餐饮娱乐\n- 教育培训\n\n3. 新兴消费\n- 新能源汽车\n- 智能家居\n- 健康管理\n\n投资策略：\n\n配置比例：\n- 高端消费：30%\n- 服务消费：40%\n- 新兴消费：30%\n\n持有周期：\n6-12个月\n\n目标收益：\n年化25%以上\n\n风险控制：\n- 分散投资\n- 定期调仓\n- 关注消费数据',
        type: 'important',
        tags: ['mid_term']
      },
      {
        title: '【中线风险】持仓风险评估',
        content: '中线持仓风险评估：\n\n当前持仓：\n\n风险点分析：\n\n1. 系统性风险\n- 市场整体调整\n- 政策变化\n- 宏观经济\n\n2. 个股风险\n- 业绩不及预期\n- 行业景气度下降\n- 竞争加剧\n\n3. 仓位风险\n- 集中度偏高\n- 杠杆使用\n- 流动性\n\n应对措施：\n\n1. 降低仓位\n从8成降至6成\n\n2. 调整结构\n增加防御品种\n\n3. 设置止损\n单只-10%止损\n\n4. 分散投资\n不要超过5只标的',
        type: 'risk_warning',
        tags: ['mid_term']
      },
      {
        title: '【中线策略】建仓计划',
        content: '中线建仓计划：\n\n目标标的：\n\n标的1：科技龙头\n- 目标仓位：3成\n- 建仓方式：分3批\n- 间隔时间：1周\n- 目标收益：30%\n\n标的2：医药白马\n- 目标仓位：2成\n- 建仓方式：分2批\n- 间隔时间：1周\n- 目标收益：25%\n\n标的3：消费成长\n- 目标仓位：2成\n- 建仓方式：分2批\n- 间隔时间：2周\n- 目标收益：20%\n\n总体策略：\n- 总仓位控制7成\n- 预留机动资金\n- 根据市场情况调整\n- 严格执行纪律',
        type: 'pre_market_comment',
        tags: ['mid_term']
      },
      {
        title: '【中线分析】行业景气度分析',
        content: '行业景气度中线分析：\n\n高景气度行业：\n\n1. 新能源\n- 政策支持\n- 需求旺盛\n- 业绩增长\n\n2. 半导体\n- 国产替代\n- 需求提升\n- 技术突破\n\n3. 医药生物\n- 人口老龄化\n- 医保支出增加\n- 创新药放量\n\n中等景气度：\n- 消费\n- 银行\n- 地产\n\n低景气度：\n- 传统周期\n- 落后产能\n\n投资建议：\n重点配置高景气度行业，仓位占比60%以上。',
        type: 'afternoon_comment',
        tags: ['mid_term']
      }
    ];

    // === 短线+中线都可见的消息 ===
    const combinedMessages = [
      {
        title: '【综合策略】市场机会分析',
        content: '市场机会综合分析：\n\n短线机会：\n1. 科技龙头突破\n2. 新能源产业链\n3. AI概念股\n\n中线机会：\n1. 优质白马股\n2. 行业龙头\n3. 成长股\n\n操作策略：\n\n短线：\n- 快进快出\n- 严格止损\n- 控制仓位\n\n中线：\n- 分批建仓\n- 长期持有\n- 定期调仓\n\n仓位配置：\n- 短线：30%\n- 中线：50%\n- 现金：20%\n\n风险控制：\n严格执行交易纪律，做好风险管理。',
        type: 'important',
        tags: ['short_term', 'mid_term']
      },
      {
        title: '【综合分析】板块轮动规律',
        content: '板块轮动规律分析：\n\n轮动特征：\n\n1. 周期性\n- 科技→消费→周期→金融\n- 循环往复\n\n2. 资金驱动\n- 主力资金偏好\n- 热点题材催化\n- 政策导向\n\n当前阶段：\n- 科技板块强势\n- 消费企稳回升\n- 周期等待机会\n\n操作策略：\n\n短线：\n跟随热点，快进快出\n\n中线：\n提前布局，等待轮动\n\n重点关注：\n科技、医药、新能源、消费四大板块。',
        type: 'daily',
        tags: ['short_term', 'mid_term']
      }
    ];

    // 合并所有消息
    const allMessages = [
      ...allUsersMessages,
      ...shortTermMessages,
      ...midTermMessages,
      ...combinedMessages
    ];

    // 4. 创建消息
    console.log('开始创建消息...\n');
    let createdCount = 0;

    for (const msgData of allMessages) {
      try {
        const message = await Message.create({
          title: msgData.title,
          content: msgData.content,
          type: msgData.type,
          sender: admin.name,
          senderId: admin.id,
          groupId: 'all',
          tags: msgData.tags,
          status: 'published',
          readCount: 0,
          totalCount: 100
        });

        createdCount++;
        console.log(`✓ 创建消息 ${createdCount}/${allMessages.length}: ${message.title}`);
        console.log(`  标签: ${JSON.stringify(msgData.tags)}`);
        console.log(`  类型: ${msgData.type}\n`);
      } catch (error) {
        console.error(`✗ 创建消息失败: ${msgData.title}`, error.message);
      }
    }

    // 5. 输出统计信息
    console.log('========================================');
    console.log('测试数据创建完成！\n');
    console.log('统计信息：');
    console.log(`  总消息数: ${createdCount}`);
    console.log(`  全部用户可见: ${allUsersMessages.length}条`);
    console.log(`  VIP短线可见: ${shortTermMessages.length}条`);
    console.log(`  VIP中线可见: ${midTermMessages.length}条`);
    console.log(`  短线+中线可见: ${combinedMessages.length}条`);

    console.log('\n标签分布：');
    console.log(`  all_users: ${allUsersMessages.length + combinedMessages.length}条`);
    console.log(`  short_term: ${shortTermMessages.length + combinedMessages.length}条`);
    console.log(`  mid_term: ${midTermMessages.length + combinedMessages.length}条`);

    console.log('\n========================================');
    console.log('测试账号信息：');
    console.log('========================================\n');
    console.log('管理员账号：');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: 123456');
    console.log('  权限: 超级管理员，可以查看和管理所有内容\n');

    console.log('VIP短线用户账号：');
    console.log('  邮箱: vip_short@example.com');
    console.log('  密码: 123456');
    console.log('  权限: 只能查看带有 short_term 标签的消息\n');

    console.log('VIP中线用户账号：');
    console.log('  邮箱: vip_mid@example.com');
    console.log('  密码: 123456');
    console.log('  权限: 只能查看带有 mid_term 标签的消息\n');

    console.log('体验用户账号：');
    console.log('  邮箱: trial@example.com');
    console.log('  密码: 123456');
    console.log('  权限: 只能查看带有 all_users 标签的消息');
    console.log('  过期时间: 7天\n');

    console.log('========================================');
    console.log('标签权限说明：');
    console.log('========================================\n');
    console.log('1. all_users 标签：');
    console.log('   - 所有用户都可以查看（包括体验用户）');
    console.log('   - 用于系统通知、重要公告等\n');

    console.log('2. short_term 标签：');
    console.log('   - 只有VIP短线用户可以查看');
    console.log('   - 用于短线策略、热点分析等\n');

    console.log('3. mid_term 标签：');
    console.log('   - 只有VIP中线用户可以查看');
    console.log('   - 用于中线布局、价值投资等\n');

    console.log('4. 组合标签：');
    console.log('   - 消息可以有多个标签，如 ["short_term", "mid_term"]');
    console.log('   - 有任一标签权限的用户都能看到该消息\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('创建测试数据失败:', error);
    process.exit(1);
  }
}

createCompleteTestData();

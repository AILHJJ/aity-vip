// 诊断收藏功能问题
const User = require('./src/models/User');
const UserFavorite = require('./src/models/UserFavorite');
const Message = require('./src/models/Message');
const MessageAttachment = require('./src/models/MessageAttachment');
const Discussion = require('./src/models/Discussion');
const DiscussionFavorite = require('./src/models/DiscussionFavorite');

async function diagnose() {
  try {
    console.log('=== 开始诊断 ===\n');

    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    await User.sequelize.authenticate();
    console.log('   ✓ 数据库连接成功\n');

    // 2. 测试简单查询
    console.log('2. 测试简单查询...');
    const userCount = await User.count();
    console.log(`   ✓ 用户总数: ${userCount}`);

    const messageCount = await Message.count();
    console.log(`   ✓ 消息总数: ${messageCount}`);

    const favoriteCount = await UserFavorite.count();
    console.log(`   ✓ 收藏总数: ${favoriteCount}\n`);

    // 3. 测试UserFavorite关联查询（不带嵌套）
    console.log('3. 测试UserFavorite关联查询（简单）...');
    const simpleFavorites = await UserFavorite.findAll({
      limit: 2,
      include: [{
        model: Message,
        as: 'message'
      }]
    });
    console.log(`   ✓ 查询成功，返回 ${simpleFavorites.length} 条记录`);
    if (simpleFavorites.length > 0) {
      console.log(`   ✓ 第一条记录的message: ${simpleFavorites[0].message ? '存在' : 'null'}`);
    }
    console.log();

    // 4. 测试带嵌套的查询（修复后的版本）
    console.log('4. 测试UserFavorite关联查询（嵌套，不包含attachments）...');
    try {
      const nestedFavorites = await UserFavorite.findAll({
        limit: 2,
        include: [{
          model: Message,
          as: 'message',
          required: false,
          include: [{
            model: User,
            as: 'senderUser',
            attributes: ['id', 'name', 'email', 'role'],
            required: false
          }]
        }]
      });
      console.log(`   ✓ 查询成功，返回 ${nestedFavorites.length} 条记录`);
      if (nestedFavorites.length > 0 && nestedFavorites[0].message) {
        console.log(`   ✓ 第一条消息标题: ${nestedFavorites[0].message.title.substring(0, 20)}...`);
        console.log(`   ✓ 第一条消息senderUser: ${nestedFavorites[0].message.senderUser ? nestedFavorites[0].message.senderUser.name : 'null'}`);
      }
    } catch (error) {
      console.log('   ✗ 查询失败！');
      console.log(`   错误: ${error.message}`);
    }
    console.log();

    // 5. 测试DiscussionFavorite关联查询
    console.log('5. 测试DiscussionFavorite关联查询...');
    try {
      const discussionFavorites = await DiscussionFavorite.findAll({
        limit: 2,
        include: [{
          model: Discussion,
          as: 'discussion',
          required: false,
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
            required: false
          }]
        }]
      });
      console.log(`   ✓ 查询成功，返回 ${discussionFavorites.length} 条记录`);
    } catch (error) {
      console.log('   ✗ 查询失败！');
      console.log(`   错误: ${error.message}`);
    }
    console.log();

    console.log('=== 诊断完成 ===');
    process.exit(0);
  } catch (error) {
    console.error('诊断过程出错:', error);
    process.exit(1);
  }
}

diagnose();

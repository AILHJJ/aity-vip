// 企微机器人服务 集成测试（发帖/回帖实际落库，用测试库）
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });
process.env.WECOM_NOTIFY_DRY_RUN = 'true'; // 测试时不真实推群

const wecomBot = require('../src/services/wecomBotService');
const Discussion = require('../src/models/Discussion');
const DiscussionReply = require('../src/models/DiscussionReply');

const binding = { adminUserId: 1, adminName: 'admin', adminRole: 'super_admin' };

async function testPost() {
  const parsed = { cmd: 'post', visibility: 'public', content: '[测试] 群内发帖验证' };
  const images = [{ url: '/uploads/images/test.jpg', filename: 'test.jpg' }];
  await wecomBot.handlePost('test_req', binding, parsed, images);

  const discussion = await Discussion.findOne({
    where: { title: '[测试] 群内发帖验证' },
    order: [['id', 'DESC']]
  });
  if (!discussion) throw new Error('帖子未创建');
  if (JSON.stringify(discussion.images) !== JSON.stringify(images)) {
    throw new Error(`images 字段不符: ${JSON.stringify(discussion.images)}`);
  }
  if (discussion.visibility !== 'public') throw new Error('可见性不符');
  console.log(`✅ handlePost 通过：帖子ID=${discussion.id}, images=${JSON.stringify(discussion.images)}`);
  return discussion.id;
}

async function testReply(discussionId) {
  const parsed = { cmd: 'reply', raw: `${discussionId} 私密 测试回复内容` };
  await wecomBot.handleReply('test_req', binding, parsed, []);

  const reply = await DiscussionReply.findOne({ where: { discussionId }, order: [['id', 'DESC']] });
  if (!reply) throw new Error('回复未创建');
  if (reply.isPrivate !== 1) throw new Error(`私密标记不符: ${reply.isPrivate}`);
  if (reply.userName !== 'admin') throw new Error('回复人账号不符');
  console.log(`✅ handleReply 通过：回复ID=${reply.id}, isPrivate=${reply.isPrivate}, 回复人=${reply.userName}`);
}

async function cleanup(discussionId) {
  await DiscussionReply.destroy({ where: { discussionId } });
  await Discussion.destroy({ where: { id: discussionId } });
  console.log('✅ 测试数据已清理');
}

async function main() {
  let discussionId;
  try {
    discussionId = await testPost();
    await testReply(discussionId);
    await cleanup(discussionId);
    console.log('\n集成测试全部通过');
    process.exit(0);
  } catch (err) {
    console.error('❌ 集成测试失败:', err.message);
    if (discussionId) {
      await DiscussionReply.destroy({ where: { discussionId } }).catch(() => {});
      await Discussion.destroy({ where: { id: discussionId } }).catch(() => {});
    }
    process.exit(1);
  }
}

main();

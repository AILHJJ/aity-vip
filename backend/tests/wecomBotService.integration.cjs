// 企微机器人服务 集成测试（发帖到消息中心 + 回帖，用测试库）
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });
process.env.WECOM_NOTIFY_DRY_RUN = 'true'; // 测试时不真实推群

const BotService = require('../src/services/botService');
const Message = require('../src/models/Message');
const Discussion = require('../src/models/Discussion');
const DiscussionReply = require('../src/models/DiscussionReply');

const binding = { adminUserId: 1, adminName: 'admin', adminRole: 'super_admin' };

// mock 渠道（测试不真实连接 WebSocket）
const mockChannel = {
  reply(reqId, text) { console.log('  → 回执:', text.split('\n')[0]); },
  sendToGroup(text) { return true; },
  async downloadImage(img) { return null; }
};
const botService = new BotService(mockChannel, { bindCode: 'test' });

async function testPost() {
  const parsed = { cmd: 'post', title: '[测试] 群内发消息标题', content: '[测试] 群内发消息正文' };
  await botService.handlePost('test_req', binding, parsed, []);

  const message = await Message.findOne({
    where: { title: '[测试] 群内发消息标题' },
    order: [['id', 'DESC']]
  });
  if (!message) throw new Error('消息未创建');
  if (message.content !== '[测试] 群内发消息正文') throw new Error('正文不符');
  if (message.type !== 'daily') throw new Error(`类型不符: ${message.type}`);
  if (message.groupId !== 'all') throw new Error(`范围不符: ${message.groupId}`);
  console.log(`✅ handlePost 发消息通过：消息ID=${message.id}, type=${message.type}, groupId=${message.groupId}`);
  return message.id;
}

async function testReply() {
  // 先创建一个讨论用于回帖
  const discussion = await Discussion.create({
    messageId: null,
    userId: 1,
    userName: 'admin',
    title: '[测试] 群内回帖讨论',
    content: '测试内容',
    visibility: 'public',
    category: 'interaction',
    status: 'pending'
  });

  const parsed = { cmd: 'reply', raw: `${discussion.id} 测试回帖内容` };
  await botService.handleReply('test_req', binding, parsed, []);

  const reply = await DiscussionReply.findOne({ where: { discussionId: discussion.id }, order: [['id', 'DESC']] });
  if (!reply) throw new Error('回复未创建');
  if (reply.content !== '测试回帖内容') throw new Error('回复内容不符');
  console.log(`✅ handleReply 回帖通过：回复ID=${reply.id}`);
  return discussion.id;
}

async function cleanup(messageId, discussionId) {
  if (messageId) await Message.destroy({ where: { id: messageId } });
  if (discussionId) {
    await DiscussionReply.destroy({ where: { discussionId } });
    await Discussion.destroy({ where: { id: discussionId } });
  }
  console.log('✅ 测试数据已清理');
}

async function main() {
  let messageId, discussionId;
  try {
    messageId = await testPost();
    discussionId = await testReply();
    await cleanup(messageId, discussionId);
    console.log('\n集成测试全部通过');
    process.exit(0);
  } catch (err) {
    console.error('❌ 集成测试失败:', err.message);
    await cleanup(messageId, discussionId).catch(() => {});
    process.exit(1);
  }
}

main();

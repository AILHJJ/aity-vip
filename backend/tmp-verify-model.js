// 本地验证 Discussion 模型的 createdAt 属性映射与 order SQL 生成（不连接数据库）
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = process.env.DB_NAME || 'test';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';

const Discussion = require('./src/models/Discussion');
const DiscussionReply = require('./src/models/DiscussionReply');
const sequelize = require('./src/config/db');

console.log('=== Discussion.rawAttributes.createdAt ===');
console.log(JSON.stringify(Discussion.rawAttributes['createdAt'], null, 0));
console.log('=== Discussion.rawAttributes.lastReplyAt ===');
console.log(JSON.stringify(Discussion.rawAttributes['lastReplyAt'], null, 0));
console.log('=== Discussion.rawAttributes.stockCodes ===');
console.log(JSON.stringify(Discussion.rawAttributes['stockCodes'], null, 0));
console.log('=== DiscussionReply.rawAttributes.createdAt ===');
console.log(JSON.stringify(DiscussionReply.rawAttributes['createdAt'], null, 0));

const qg = sequelize.dialect.queryGenerator;
console.log('=== SELECT SQL (order by created_at) ===');
console.log(qg.selectQuery('discussions', {
  attributes: ['id', 'createdAt', 'lastReplyAt'],
  model: Discussion,
  order: [[sequelize.fn('ISNULL', sequelize.col('last_reply_at')), 'ASC'], [sequelize.col('last_reply_at'), 'DESC'], [sequelize.col('created_at'), 'DESC']]
}));

// toJSON 属性名验证
const inst = Discussion.build({ id: 1, title: 't', content: 'c', userId: 1, userName: 'x' });
inst.setDataValue('createdAt', new Date('2026-09-21T08:00:00Z'));
console.log('=== toJSON keys ===');
console.log(Object.keys(inst.toJSON()).join(','));
process.exit(0);

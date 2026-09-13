const assert = require('assert');
const path = require('path');

// 场景1：DRY_RUN 模式（配置了 webhook 但只打日志不真实发送）
process.env.WECOM_WEBHOOK_URL = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=test';
process.env.WECOM_NOTIFY_DRY_RUN = 'true';
process.env.WECOM_NOTIFY_ON_CREATE = 'true';
process.env.WECOM_NOTIFY_ON_REPLY = 'true';
process.env.WECOM_SITE_BASE = 'https://aity88.online';

const svc = require('../src/services/wecomNotifyService');

(async () => {
  // 1. DRY_RUN 下 sendText 应返回 dryRun 标记，不真实请求
  const r1 = await svc.sendText('测试消息');
  assert.strictEqual(r1.dryRun, true, 'DRY_RUN 模式应返回 dryRun');

  // 2. 通知函数 fire-and-forget 调用不应抛异常
  const discussion = {
    id: 123,
    title: '如何开通会员',
    category: 'interaction',
    visibility: 'private',
    userName: '测试用户',
    content: '请问如何开通会员？',
    createdAt: new Date('2026-09-13T10:00:00')
  };
  assert.doesNotThrow(
    () => svc.notifyNewDiscussion(discussion),
    '新帖通知调用不应抛异常'
  );

  const reply = {
    userName: '回帖用户',
    content: '我来帮你解答',
    createdAt: new Date('2026-09-13T10:05:00')
  };
  assert.doesNotThrow(
    () => svc.notifyNewReply(discussion, reply, false),
    '用户回帖通知调用不应抛异常'
  );

  console.log('wecomNotifyService unit tests passed (DRY_RUN)');
})().catch(err => {
  console.error(err);
  process.exit(1);
});

// 企微机器人服务 单元测试（指令解析逻辑）
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });

const wecomBot = require('../src/services/wecomBotService');

function testParseCommand() {
  const cases = [
    // 发帖（markdown # 标题，正文换行后，visibility 缺省 public）
    { input: '发帖 # 今日策略\n今天关注xxx', expected: { cmd: 'post', title: '今日策略', content: '今天关注xxx', visibility: 'public' } },
    { input: '发帖 # 今日策略\n今天关注xxx板块，注意风险', expected: { cmd: 'post', title: '今日策略', content: '今天关注xxx板块，注意风险', visibility: 'public' } },
    { input: '发帖 今天关注xxx', expected: { cmd: 'post', title: '', content: '今天关注xxx', visibility: 'public' } },
    { input: '发帖子 # 测试\n正文', expected: { cmd: 'post', title: '测试', content: '正文', visibility: 'public' } },
    { input: '发个帖子 # 测试\n正文', expected: { cmd: 'post', title: '测试', content: '正文', visibility: 'public' } },
    { input: '发一个帖子 # 测试\n正文', expected: { cmd: 'post', title: '测试', content: '正文', visibility: 'public' } },
    { input: '发个帖 # 测试\n正文', expected: { cmd: 'post', title: '测试', content: '正文', visibility: 'public' } },
    { input: '发帖 ## 测试\n正文', expected: { cmd: 'post', title: '测试', content: '正文', visibility: 'public' } },
    // 发帖可见性（公开/私密）
    { input: '发帖 私密 # 测试\n正文', expected: { cmd: 'post', title: '测试', content: '正文', visibility: 'private' } },
    { input: '发帖 公开 # 测试\n正文', expected: { cmd: 'post', title: '测试', content: '正文', visibility: 'public' } },

    // 回帖
    { input: '回复 1024 感谢反馈', expected: { cmd: 'reply', raw: '1024 感谢反馈' } },
    { input: '回复 1024 私密 私密内容', expected: { cmd: 'reply', raw: '1024 私密 私密内容' } },
    { input: '回帖 1024 内容', expected: { cmd: 'reply', raw: '1024 内容' } },
    { input: '回复帖子 1024 内容', expected: { cmd: 'reply', raw: '1024 内容' } },
    { input: '@AITY助手 回复 95 已处理', expected: { cmd: 'reply', raw: '95 已处理' } },

    // 绑定/帮助
    { input: '绑定 abc123', expected: { cmd: 'bind', code: 'abc123' } },
    { input: '帮助', expected: { cmd: 'help' } },

    // 无匹配
    { input: '乱七八糟的输入', expected: null }
  ];

  let pass = 0;
  for (const c of cases) {
    const result = wecomBot.parseCommand(c.input);
    const ok = JSON.stringify(result) === JSON.stringify(c.expected);
    if (ok) {
      pass++;
    } else {
      console.log(`  ✗ [${JSON.stringify(c.input)}]`);
      console.log(`    期望: ${JSON.stringify(c.expected)}`);
      console.log(`    实际: ${JSON.stringify(result)}`);
    }
  }
  console.log(`parseCommand: ${pass}/${cases.length} 通过`);
  return pass === cases.length;
}

async function main() {
  const ok = testParseCommand();
  process.exit(ok ? 0 : 1);
}

main();

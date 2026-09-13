// 企微机器人服务 单元测试（指令解析逻辑）
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });

const wecomBot = require('../src/services/wecomBotService');

function testParseCommand() {
  const cases = [
    { input: '发帖 公开 今天行情不错', expected: { cmd: 'post', visibility: 'public', content: '今天行情不错' } },
    { input: '发帖 私密 内部讨论', expected: { cmd: 'post', visibility: 'private', content: '内部讨论' } },
    { input: '发帖 默认私密', expected: { cmd: 'post', visibility: 'private', content: '默认私密' } },
    { input: '回复 1024 感谢反馈', expected: { cmd: 'reply', raw: '1024 感谢反馈' } },
    { input: '回复 1024 私密 私密内容', expected: { cmd: 'reply', raw: '1024 私密 私密内容' } },
    { input: '绑定 abc123', expected: { cmd: 'bind', code: 'abc123' } },
    { input: '帮助', expected: { cmd: 'help' } },
    { input: '@AITY回帖助手 发帖 测试', expected: { cmd: 'post', visibility: 'private', content: '测试' } },
    { input: '@AITY回帖助手 回复 95 已处理', expected: { cmd: 'reply', raw: '95 已处理' } },
    // 自然语言变体（用户实际用法的扩展）
    { input: '发帖 公开 测试', expected: { cmd: 'post', visibility: 'public', content: '测试' } },
    { input: '发帖子 公开 测试', expected: { cmd: 'post', visibility: 'public', content: '测试' } },
    { input: '发个帖子 测试', expected: { cmd: 'post', visibility: 'private', content: '测试' } },
    { input: '发一个帖子用于测试吧', expected: { cmd: 'post', visibility: 'private', content: '用于测试吧' } },
    { input: '发个帖 测试', expected: { cmd: 'post', visibility: 'private', content: '测试' } },
    { input: '回复 1024 内容', expected: { cmd: 'reply', raw: '1024 内容' } },
    { input: '回帖 1024 内容', expected: { cmd: 'reply', raw: '1024 内容' } },
    { input: '回复帖子 1024 内容', expected: { cmd: 'reply', raw: '1024 内容' } },
    { input: '乱七八糟的输入', expected: null }
  ];

  let pass = 0;
  for (const c of cases) {
    const result = wecomBot.parseCommand(c.input);
    const ok = JSON.stringify(result) === JSON.stringify(c.expected);
    if (ok) {
      pass++;
    } else {
      console.log(`  ✗ [${c.input}]`);
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

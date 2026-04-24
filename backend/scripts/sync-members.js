/**
 * 会员账号同步脚本
 *
 * 功能：
 * 1. 同步生产环境会员账号
 * 2. 创建测试账号
 * 3. 支持自定义密码或统一密码
 * 4. 支持指定目标数据库环境
 *
 * 运行方式：
 * cd backend
 * node scripts/sync-members.js                    # 同步到测试库，统一密码 tytls8888
 * node scripts/sync-members.js production         # 同步到生产库，统一密码 tytls8888
 * node scripts/sync-members.js test custom        # 同步到测试库，个性化密码
 * node scripts/sync-members.js production custom  # 同步到生产库，个性化密码
 */

// 从命令行参数获取环境和密码模式
const TARGET_ENV = process.argv[2] || 'test'; // test | production
const PASSWORD_MODE = process.argv[3] || 'uniform'; // uniform | custom

// 切换环境
if (TARGET_ENV === 'production') {
  // 从本地远程连接生产数据库
  require('dotenv').config({ path: '.env.production-remote' });
  console.log('⚠️  注意：正在操作【生产环境】数据库！');
} else {
  require('dotenv').config({ path: '.env.development' });
  console.log('🟢 操作【测试环境】数据库');
}

const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');
const User = require('../src/models/User');

// 统一初始密码（投研图灵室8888）
const UNIFORM_PASSWORD = 'tytls8888';

// 生成个性化密码（昵称拼音首字母小写 + 888888）
function getCustomPassword(name) {
  const pinyinMap = {
    '彼得': 'bd',
    '吴文文': 'www',
    '吴佳萍': 'wjp',
    '郭敏': 'gm',
    '罗序祥': 'lxx',
    'Niko': 'niko',
    '等风来': 'dfl',
    '妮儿': 'ne',
    '测试中线': 'cszx',
    '测试短线': 'csdx'
  };
  const prefix = pinyinMap[name] || name.toLowerCase().substring(0, 2);
  return prefix + '888888';
}

// 获取密码
function getPassword(name) {
  if (PASSWORD_MODE === 'custom') {
    return getCustomPassword(name);
  }
  return UNIFORM_PASSWORD;
}

// 计算过期时间
function getExpireDate(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

// 会员配置
const MEMBERS = [
  // ============ 正式会员 ============
  // 季度会员（3个月）
  { name: '彼得', email: 'bd@qq.com', role: 'vip_short', months: 3, groupId: 'vip_short', type: '季卡' },
  { name: '吴文文', email: '11222@qq.com', role: 'vip_short', months: 3, groupId: 'vip_short', type: '季卡' },
  { name: '吴佳萍', email: 'wjp@qq.com', role: 'vip_short', months: 3, groupId: 'vip_short', type: '季卡' },

  // 半年会员（6个月）
  { name: '郭敏', email: 'gm8888@qq.com', role: 'vip_short', months: 6, groupId: 'vip_short', type: '半年卡' },

  // 月卡会员（1个月）
  { name: '罗序祥', email: 'lxx@qq.com', role: 'vip_short', months: 1, groupId: 'vip_short', type: '月卡' },
  { name: 'Niko', email: '123456@qq.com', role: 'vip_short', months: 1, groupId: 'vip_short', type: '月卡' },

  // ============ 测试账号 ============
  // 等风来 - VIP中线测试（月卡）
  { name: '等风来', email: '625668823@qq.com', role: 'vip_mid', months: 1, groupId: 'vip_mid', type: '月卡', isTest: true },

  // 妮儿 - VIP短线测试（月卡）- 新邮箱
  { name: '妮儿', email: 'nier@test.com', role: 'vip_short', months: 1, groupId: 'vip_short', type: '月卡', isTest: true },

  // ============ 额外测试账号 ============
  // VIP中线测试（季卡）
  { name: '测试中线', email: 'test_mid@test.com', role: 'vip_mid', months: 3, groupId: 'vip_mid', type: '季卡', isTest: true },

  // VIP短线测试（季卡）
  { name: '测试短线', email: 'test_short@test.com', role: 'vip_short', months: 3, groupId: 'vip_short', type: '季卡', isTest: true },
];

async function syncMembers() {
  console.log('========================================');
  console.log('会员账号同步脚本');
  console.log('========================================');
  console.log('数据库:', process.env.DB_ENV === 'test' ? '投研图灵室_test' : '投研图灵室');
  console.log('密码模式:', PASSWORD_MODE === 'custom' ? '个性化密码' : '统一密码');
  if (PASSWORD_MODE === 'uniform') {
    console.log('统一密码:', UNIFORM_PASSWORD);
  }
  console.log('');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    const results = { created: [], updated: [] };

    for (const member of MEMBERS) {
      const expireDate = getExpireDate(member.months);
      const password = getPassword(member.name);
      const hashedPassword = await bcrypt.hash(password, 10);

      let user = await User.findOne({ where: { email: member.email } });

      if (user) {
        await user.update({
          name: member.name,
          role: member.role,
          groupId: member.groupId,
          status: 'active',
          expireDate: expireDate,
          password: hashedPassword
        });
        results.updated.push({
          ...member,
          id: user.id,
          password,
          expireDate: expireDate.toLocaleDateString('zh-CN')
        });
        console.log(`📝 更新: ${member.name} (${member.email}) - ${member.type}`);
      } else {
        user = await User.create({
          name: member.name,
          email: member.email,
          password: hashedPassword,
          role: member.role,
          groupId: member.groupId,
          status: 'active',
          expireDate: expireDate
        });
        results.created.push({
          ...member,
          id: user.id,
          password,
          expireDate: expireDate.toLocaleDateString('zh-CN')
        });
        console.log(`✨ 创建: ${member.name} (${member.email}) - ${member.type}`);
      }
    }

    console.log('\n========================================');
    console.log('同步结果 - 账号密码清单');
    console.log('========================================\n');

    console.log('正式会员:');
    console.log('-'.repeat(80));
    const formalMembers = [...results.created, ...results.updated].filter(m => !m.isTest);
    formalMembers.forEach(m => {
      console.log(`  ${m.name} | ${m.email} | ${m.type} | 密码: ${m.password} | 过期: ${m.expireDate}`);
    });

    console.log('\n测试账号:');
    console.log('-'.repeat(80));
    const testMembers = [...results.created, ...results.updated].filter(m => m.isTest);
    testMembers.forEach(m => {
      console.log(`  ${m.name} | ${m.email} | ${m.role} | ${m.type} | 密码: ${m.password} | 过期: ${m.expireDate}`);
    });

    // 生成Markdown表格
    console.log('\n========================================');
    console.log('Markdown 格式（可直接复制到文档）');
    console.log('========================================\n');

    console.log('### 正式会员');
    console.log('');
    console.log('| 昵称 | 邮箱 | 会员类型 | 密码 | 过期时间 |');
    console.log('|------|------|----------|------|----------|');
    formalMembers.forEach(m => {
      console.log(`| ${m.name} | ${m.email} | ${m.type} | ${m.password} | ${m.expireDate} |`);
    });

    console.log('');
    console.log('### 测试账号');
    console.log('');
    console.log('| 昵称 | 邮箱 | 角色 | 会员类型 | 密码 | 过期时间 |');
    console.log('|------|------|------|----------|------|----------|');
    testMembers.forEach(m => {
      console.log(`| ${m.name} | ${m.email} | ${m.role} | ${m.type} | ${m.password} | ${m.expireDate} |`);
    });

    console.log('\n========================================');
    console.log('✅ 同步完成！');
    console.log('========================================');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

syncMembers();

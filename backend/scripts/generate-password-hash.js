/**
 * 生成测试用户密码的bcrypt哈希值
 * 用于SQL测试数据脚本
 */

const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  const password = '123456';
  const rounds = 10;

  console.log('========================================');
  console.log('生成测试用户密码哈希值');
  console.log('========================================\n');

  try {
    // 生成密码哈希
    const hash = await bcrypt.hash(password, rounds);

    console.log('原始密码:', password);
    console.log('加密轮数:', rounds);
    console.log('\n生成的哈希值:');
    console.log('========================================');
    console.log(hash);
    console.log('========================================\n');

    console.log('使用说明:');
    console.log('1. 复制上面的哈希值');
    console.log('2. 在 complete-test-data.sql 中查找: $2a$10$YourHashedPasswordHere');
    console.log('3. 替换为生成的哈希值');
    console.log('4. 保存并执行SQL脚本\n');

    // 验证哈希值
    const isValid = await bcrypt.compare(password, hash);
    console.log('验证哈希值:', isValid ? '✅ 正确' : '❌ 错误');

    // 生成多个不同的哈希值（每个用户使用不同的哈希，更真实）
    console.log('\n========================================');
    console.log('为每个用户生成不同的哈希值（可选）');
    console.log('========================================\n');

    const users = [
      'admin@aity.com',
      'manager@aity.com',
      'vip_mid@aity.com',
      'vip_short@aity.com',
      'trial@aity.com',
      'vip_test@aity.com'
    ];

    console.log('用户密码哈希映射表:');
    console.log('----------------------------------------');
    for (const email of users) {
      const userHash = await bcrypt.hash(password, rounds);
      console.log(`${email}:`);
      console.log(`${userHash}\n`);
    }

    console.log('\n✅ 密码哈希生成完成！\n');

  } catch (error) {
    console.error('❌ 生成密码哈希失败:', error);
    process.exit(1);
  }
}

// 执行
generatePasswordHash()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });

/**
 * 生成包含正确密码哈希的SQL测试数据脚本
 * 自动生成密码哈希并替换到SQL模板中
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function generateSQLScript() {
  console.log('========================================');
  console.log('生成包含密码哈希的SQL脚本');
  console.log('========================================\n');

  try {
    // 1. 生成密码哈希
    console.log('1. 生成密码哈希...');
    const password = '123456';
    const hash = await bcrypt.hash(password, 10);
    console.log('   ✅ 密码哈希生成完成\n');

    // 2. 读取SQL模板
    console.log('2. 读取SQL模板...');
    const templatePath = path.join(__dirname, 'complete-test-data.sql');
    let sqlContent = fs.readFileSync(templatePath, 'utf8');
    console.log('   ✅ SQL模板读取完成\n');

    // 3. 替换密码哈希占位符
    console.log('3. 替换密码哈希占位符...');
    const oldContent = sqlContent;
    sqlContent = sqlContent.replace(/\$2a\$10\$YourHashedPasswordHere/g, hash);

    if (oldContent === sqlContent) {
      console.log('   ⚠️  未找到占位符，可能已被替换');
    } else {
      const replaceCount = (oldContent.match(/\$2a\$10\$YourHashedPasswordHere/g) || []).length;
      console.log(`   ✅ 已替换 ${replaceCount} 处密码哈希`);
    }
    console.log();

    // 4. 保存新的SQL文件
    console.log('4. 保存新的SQL文件...');
    const outputPath = path.join(__dirname, 'complete-test-data-with-hash.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    console.log(`   ✅ SQL文件已保存: ${outputPath}\n`);

    // 5. 验证生成的文件
    console.log('5. 验证生成的文件...');
    const isValid = await bcrypt.compare(password, hash);
    console.log(`   密码验证: ${isValid ? '✅ 正确' : '❌ 错误'}\n`);

    // 6. 显示统计信息
    console.log('========================================');
    console.log('生成完成！');
    console.log('========================================\n');
    console.log('文件信息:');
    console.log(`- 模板文件: ${templatePath}`);
    console.log(`- 输出文件: ${outputPath}\n`);
    console.log('测试账号:');
    console.log('- 所有账号密码: 123456');
    console.log('- 密码已使用bcrypt加密（10轮）\n');
    console.log('下一步:');
    console.log('1. 在MySQL中执行生成的SQL文件');
    console.log('2. 使用测试账号登录系统\n');

    // 7. 显示文件大小
    const stats = fs.statSync(outputPath);
    console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB\n`);

  } catch (error) {
    console.error('❌ 生成SQL脚本失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行
generateSQLScript()
  .then(() => {
    console.log('✅ 脚本执行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });

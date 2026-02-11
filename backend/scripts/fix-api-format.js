/**
 * API响应格式统一修复脚本
 *
 * 用途: 批量修复后端控制器的响应格式问题
 * 使用: node fix-api-format.js
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  API响应格式统一修复工具');
console.log('========================================\n');

// 修复方案配置
const fixPlans = [
  {
    name: '消息列表接口',
    file: 'src/controllers/messageController.js',
    description: '统一消息列表响应格式',
    searchPattern: /res\.json\(\{\s*success:\s*true,\s*data:\s*rows,\s*pagination:\s*\{[^}]*\}\s*\}\);/gs,
    replacePattern: `// 统一响应格式: { code, message, data: { list, pagination } }
      res.json(success({
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }));`,
    priority: 'HIGH'
  },
  {
    name: '统一成功响应格式',
    files: [
      'src/controllers/messageController.js',
      'src/controllers/userController.js',
      'src/controllers/groupController.js',
      'src/controllers/statsController.js'
    ],
    description: '确保所有接口使用统一的success()函数',
    priority: 'MEDIUM'
  }
];

// 分析函数
function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // 检查是否使用了不一致的响应格式
  if (content.includes('res.json({ success:')) {
    issues.push({
      type: 'INCONSISTENT_SUCCESS_FORMAT',
      description: '使用了 { success: true } 而非标准 { code: 200 }',
      severity: 'HIGH'
    });
  }

  // 检查列表接口是否返回了正确的格式
  if (content.match(/res\.json\(success\([^)]*\)\)/)) {
    // 需要进一步检查是否包装了 list
    const listMatches = content.match(/res\.json\(success\(\s*\[([^\]]*)\]\s*\)\)/g);
    if (listMatches) {
      issues.push({
        type: 'RAW_ARRAY_RESPONSE',
        description: '列表接口直接返回数组,应包装为 { list: [] }',
        severity: 'HIGH'
      });
    }
  }

  // 检查是否有未定义的success/error函数
  if (!content.includes('function success(') && !content.includes('const success =')) {
    issues.push({
      type: 'MISSING_SUCCESS_FUNCTION',
      description: '缺少统一的success()响应函数',
      severity: 'MEDIUM'
    });
  }

  return {
    file: filePath,
    issues,
    issueCount: issues.length
  };
}

// 扫描所有控制器
function scanAllControllers() {
  console.log('📂 扫描后端控制器文件...\n');

  const controllersDir = path.join(__dirname, '../src/controllers');
  const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('Controller.js'));

  const results = files.map(file => {
    const filePath = path.join(controllersDir, file);
    return analyzeFile(filePath);
  }).filter(r => r !== null);

  // 汇总报告
  console.log('📊 扫描结果汇总:');
  console.log('========================================\n');

  let totalIssues = 0;
  const issueTypes = {};

  results.forEach(result => {
    if (result.issueCount > 0) {
      console.log(`📄 ${path.basename(result.file)}`);
      console.log(`   问题数量: ${result.issueCount}`);

      result.issues.forEach(issue => {
        console.log(`   ⚠️  [${issue.severity}] ${issue.description}`);
        totalIssues++;
        issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
      });
      console.log('');
    } else {
      console.log(`✅ ${path.basename(result.file)} - 未发现问题\n`);
    }
  });

  console.log('========================================');
  console.log(`总计发现 ${totalIssues} 个问题\n`);

  if (Object.keys(issueTypes).length > 0) {
    console.log('问题类型统计:');
    Object.entries(issueTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} 个`);
    });
    console.log('');
  }

  return results;
}

// 生成修复建议
function generateFixSuggestions(results) {
  console.log('💡 修复建议:');
  console.log('========================================\n');

  const suggestions = [];

  results.forEach(result => {
    result.issues.forEach(issue => {
      switch (issue.type) {
        case 'INCONSISTENT_SUCCESS_FORMAT':
          suggestions.push({
            file: result.file,
            issue: issue.description,
            fix: '将 { success: true, data: ... } 改为 success({ ... })'
          });
          break;

        case 'RAW_ARRAY_RESPONSE':
          suggestions.push({
            file: result.file,
            issue: issue.description,
            fix: '将 success([...]) 改为 success({ list: [...] })'
          });
          break;

        case 'MISSING_SUCCESS_FUNCTION':
          suggestions.push({
            file: result.file,
            issue: issue.description,
            fix: '添加统一的响应函数: function success(data, message) { ... }'
          });
          break;
      }
    });
  });

  suggestions.forEach((s, i) => {
    console.log(`${i + 1}. ${path.basename(s.file)}`);
    console.log(`   问题: ${s.issue}`);
    console.log(`   修复: ${s.fix}\n`);
  });

  return suggestions;
}

// 主函数
function main() {
  try {
    // 1. 扫描所有控制器
    const results = scanAllControllers();

    // 2. 生成修复建议
    const suggestions = generateFixSuggestions(results);

    if (suggestions.length === 0) {
      console.log('✅ 所有控制器响应格式已统一,无需修复!');
    } else {
      console.log('========================================');
      console.log('⚠️  注意: 请手动应用以上修复建议');
      console.log('========================================\n');
      console.log('建议修复顺序:');
      console.log('1. 高优先级: 统一success()函数调用');
      console.log('2. 高优先级: 列表接口包装为 { list: [] }');
      console.log('3. 中优先级: 添加统一的响应格式函数\n');
    }

  } catch (error) {
    console.error('❌ 扫描失败:', error.message);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, scanAllControllers, generateFixSuggestions };

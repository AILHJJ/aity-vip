#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..');
const README_PATH = path.join(API_DIR, 'README.md');

// 扫描所有API文档
function scanApiDocs() {
  const files = fs.readdirSync(API_DIR);
  const apiDocs = [];

  for (const file of files) {
    if (!file.match(/^\d{2}-.*-api\.md$/) && !file.match(/^\d{2}-.*-events\.md$/)) continue;

    const filePath = path.join(API_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 提取文档信息 - 支持多种格式
    let moduleName = content.match(/^# (.+?)(?:\s|$)/m)?.[1] || '未知模块';
    // 移除 "API文档" 后缀
    moduleName = moduleName.replace(/\s*API文档$/, '').replace(/\s*文档$/, '');

    const version = content.match(/\*\*版本\*\*:\s*(.+)/m)?.[1] || 'v1.0.0';
    const lastUpdate = content.match(/\*\*最后更新\*\*:\s*(.+)/m)?.[1] || '未知';
    const maintainer = content.match(/\*\*维护人\*\*:\s*(.+)/m)?.[1] || '未分配';

    // 计算接口数量 - 统计"### X."开头的章节
    const sections = content.match(/^###\s+\d+\./gm) || [];
    const interfaceCount = sections.length;

    apiDocs.push({
      file,
      moduleName,
      version,
      lastUpdate,
      maintainer,
      interfaceCount: Math.max(0, Math.floor(interfaceCount))
    });
  }

  return apiDocs.sort((a, b) => a.file.localeCompare(b.file));
}

// 生成README内容
function generateReadme(apiDocs) {
  const today = new Date().toISOString().split('T')[0];

  let readme = `# API文档索引

> 最后更新：${today} | 维护人：后端团队

## 📚 文档列表

| 模块 | 文档 | 接口数量 | 最后更新 | 维护人 |
|------|------|----------|----------|--------|
`;

  for (const doc of apiDocs) {
    readme += `| ${doc.moduleName} | [${doc.file}](./${doc.file}) | ${doc.interfaceCount} | ${doc.lastUpdate} | ${doc.maintainer} |\n`;
  }

  readme += `
## 🔍 快速查找

### 按功能分类
`;

  // 根据模块名称生成快速查找（这里可以自定义）
  const categoryMap = {
    '金融数据': '市场概览、涨跌分布、指数行情、资金流向',
    '打板功能': '涨停池、跌停池、异动监控',
    'AI投顾': 'Dify工作流、AI对话',
    '核心业务': '用户管理、消息管理、认证',
    'SSE事件': '实时推送、事件流'
  };

  for (const doc of apiDocs) {
    const category = categoryMap[doc.moduleName] || '相关功能';
    readme += `- **${doc.moduleName}**: ${category} → [${doc.file}](./${doc.file})\n`;
  }

  readme += `
### 按场景分类
- **前端对接**: 查看各文档的"调用示例"章节
- **第三方集成**: 查看各文档的"接口概览"表格
- **自动化测试**: 查看各文档的"请求参数"和"响应示例"
`;

  return readme;
}

// 主函数
function main() {
  console.log('扫描API文档...');
  const apiDocs = scanApiDocs();

  console.log(`找到 ${apiDocs.length} 个API文档`);
  apiDocs.forEach(doc => {
    console.log(`  - ${doc.file}: ${doc.moduleName} (${doc.interfaceCount}个接口)`);
  });

  console.log('\n生成README.md...');
  const readmeContent = generateReadme(apiDocs);
  fs.writeFileSync(README_PATH, readmeContent, 'utf-8');

  console.log('✅ README.md已更新');
}

main();

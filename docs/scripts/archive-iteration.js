#!/usr/bin/env node

/**
 * 迭代归档工具
 *
 * 功能：
 * 1. 扫描迭代相关文档（根据tags或文件名模式）
 * 2. 生成迭代摘要（基于模板）
 * 3. 移动中间文档到archived/
 * 4. 更新迭代索引
 *
 * 使用方式：
 * node archive-iteration.js --name "2026-03-feature-name" --docs "doc1.md,doc2.md" [options]
 *
 * 选项：
 * --name <name>          迭代名称（必填）
 * --docs <files>         要归档的文档列表，用逗号分隔（必填）
 * --description <desc>   迭代描述（可选）
 * --tags <tags>          迭代标签，用逗号分隔（可选）
 * --dry-run             模拟运行，不实际移动文件（可选）
 * --skip-summary         跳过生成摘要（可选）
 *
 * 示例：
 * node archive-iteration.js --name "2026-03-market-center" --docs "market-center/实现报告.md,market-center/测试报告.md"
 * node archive-iteration.js --name "2026-03-ai-optimization" --docs "ai-advisor/*.md" --tags "ai,optimization" --dry-run
 */

const fs = require('fs');
const path = require('path');

// 配置项
const CONFIG = {
  docsRoot: __dirname, // docs目录
  archivedDir: path.join(__dirname, 'archived', 'iterations'),
  iterationIndexFile: path.join(__dirname, 'archived', 'iterations', 'INDEX.md'),
  dryRun: false,
  skipSummary: false
};

/**
 * 解析命令行参数
 * @returns {object} 参数对象
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const params = {
    name: null,
    docs: [],
    description: '',
    tags: []
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
        params.name = args[++i];
        break;
      case '--docs':
        params.docs = args[++i].split(',').map(d => d.trim());
        break;
      case '--description':
        params.description = args[++i];
        break;
      case '--tags':
        params.tags = args[++i].split(',').map(t => t.trim());
        break;
      case '--dry-run':
        CONFIG.dryRun = true;
        break;
      case '--skip-summary':
        CONFIG.skipSummary = true;
        break;
    }
  }

  return params;
}

/**
 * 验证参数
 * @param {object} params - 参数对象
 * @returns {object} 验证结果 {valid: boolean, error: string}
 */
function validateParams(params) {
  if (!params.name) {
    return { valid: false, error: '缺少必填参数: --name' };
  }

  if (params.docs.length === 0) {
    return { valid: false, error: '缺少必填参数: --docs' };
  }

  // 验证迭代名称格式
  if (!/^\d{4}-\d{2}-.+/.test(params.name)) {
    return {
      valid: false,
      error: '迭代名称格式不正确，应为: YYYY-MM-feature-name (例如: 2026-03-market-center)'
    };
  }

  return { valid: true };
}

/**
 * 扩展文件路径（支持通配符）
 * @param {array} patterns - 文件路径模式数组
 * @returns {array} 实际文件路径数组
 */
function expandFilePaths(patterns) {
  const files = [];

  patterns.forEach(pattern => {
    const fullPath = path.join(CONFIG.docsRoot, pattern);

    // 如果包含通配符，需要展开
    if (pattern.includes('*')) {
      const dir = path.dirname(fullPath);
      const basePattern = path.basename(fullPath);
      const regex = new RegExp('^' + basePattern.replace(/\*/g, '.*') + '$');

      try {
        if (fs.existsSync(dir)) {
          const entries = fs.readdirSync(dir);
          entries.forEach(entry => {
            if (regex.test(entry) && entry.endsWith('.md')) {
              files.push(path.join(dir, entry));
            }
          });
        }
      } catch (error) {
        console.error(`展开文件路径失败: ${pattern}`, error.message);
      }
    } else {
      // 普通路径
      if (fs.existsSync(fullPath)) {
        files.push(fullPath);
      } else {
        console.warn(`文件不存在: ${pattern}`);
      }
    }
  });

  return files;
}

/**
 * 读取文档元数据
 * @param {string} filePath - 文件路径
 * @returns {object} 元数据对象
 */
function readDocumentMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');

    // 提取元数据块
    const metaBlockMatch = content.match(/<!--\s*METADATA\s*([\s\S]*?)-->/);
    let metadata = { title };

    if (metaBlockMatch) {
      const metaContent = metaBlockMatch[1];
      const typeMatch = metaContent.match(/document_type:\s*(.+)/);
      const statusMatch = metaContent.match(/status:\s*(.+)/);
      const tagsMatch = metaContent.match(/tags:\s*\[(.+)\]/);

      metadata.document_type = typeMatch ? typeMatch[1].trim() : '';
      metadata.status = statusMatch ? statusMatch[1].trim() : '';
      metadata.tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')) : [];
    }

    return metadata;
  } catch (error) {
    console.error(`读取文档元数据失败: ${filePath}`, error.message);
    return { title: path.basename(filePath, '.md') };
  }
}

/**
 * 生成迭代摘要
 * @param {object} params - 参数对象
 * @param {array} files - 文档路径数组
 * @returns {string} 摘要内容
 */
function generateIterationSummary(params, files) {
  const date = new Date().toISOString().split('T')[0];
  const iterationName = params.name;
  const [year, month, ...nameParts] = iterationName.split('-');
  const featureName = nameParts.join('-');

  let summary = `# ${iterationName} - 迭代归档\n\n`;
  summary += `> **归档日期**: ${date}\n`;
  summary += `> **迭代名称**: ${featureName}\n`;
  summary += `> **归档文档数**: ${files.length}\n\n`;

  if (params.description) {
    summary += `## 迭代描述\n\n`;
    summary += `${params.description}\n\n`;
  }

  if (params.tags.length > 0) {
    summary += `## 标签\n\n`;
    params.tags.forEach(tag => {
      summary += `- ${tag}\n`;
    });
    summary += `\n`;
  }

  summary += `## 归档文档清单\n\n`;
  summary += `| 文档名称 | 类型 | 状态 | 标签 |\n`;
  summary += `|---------|------|------|------|\n`;

  files.forEach(file => {
    const metadata = readDocumentMetadata(file);
    const relativePath = path.relative(CONFIG.docsRoot, file);
    const type = metadata.document_type || '-';
    const status = metadata.status || '-';
    const tags = metadata.tags.length > 0 ? metadata.tags.join(', ') : '-';

    summary += `| [${metadata.title}](${relativePath}) | ${type} | ${status} | ${tags} |\n`;
  });

  summary += `\n`;

  // 统计信息
  const typeStats = {};
  const statusStats = {};

  files.forEach(file => {
    const metadata = readDocumentMetadata(file);
    const type = metadata.document_type || 'unknown';
    const status = metadata.status || 'unknown';

    typeStats[type] = (typeStats[type] || 0) + 1;
    statusStats[status] = (statusStats[status] || 0) + 1;
  });

  summary += `## 文档统计\n\n`;
  summary += `### 按类型分类\n\n`;
  Object.keys(typeStats).forEach(type => {
    summary += `- **${type}**: ${typeStats[type]}\n`;
  });
  summary += `\n`;

  summary += `### 按状态分类\n\n`;
  Object.keys(statusStats).forEach(status => {
    summary += `- **${status}**: ${statusStats[status]}\n`;
  });
  summary += `\n`;

  summary += `## 迭代成果\n\n`;
  summary += `- [ ] 核心功能完成\n`;
  summary += `- [ ] 测试通过\n`;
  summary += `- [ ] 文档完善\n`;
  summary += `- [ ] 代码审查完成\n`;
  summary += `- [ ] 部署上线\n\n`;

  summary += `## 备注\n\n`;
  summary += `(在此添加其他备注信息)\n`;

  return summary;
}

/**
 * 移动文件到归档目录
 * @param {array} files - 文件路径数组
 * @param {string} iterationName - 迭代名称
 * @returns {array} 移动后的文件路径数组
 */
function moveFilesToArchive(files, iterationName) {
  const archiveDir = path.join(CONFIG.archivedDir, iterationName);
  const movedFiles = [];

  // 创建归档目录
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  files.forEach(file => {
    try {
      const fileName = path.basename(file);
      const destPath = path.join(archiveDir, fileName);
      const relativePath = path.relative(CONFIG.docsRoot, file);

      if (CONFIG.dryRun) {
        console.log(`[DRY RUN] 将移动: ${relativePath} -> archived/iterations/${iterationName}/${fileName}`);
        movedFiles.push({ original: file, moved: destPath });
      } else {
        // 复制文件（保留原文件）
        fs.copyFileSync(file, destPath);
        console.log(`✓ 已复制: ${relativePath} -> archived/iterations/${iterationName}/${fileName}`);
        movedFiles.push({ original: file, moved: destPath });
      }
    } catch (error) {
      console.error(`移动文件失败: ${file}`, error.message);
    }
  });

  return movedFiles;
}

/**
 * 更新迭代索引
 * @param {object} params - 参数对象
 * @param {array} files - 文档路径数组
 */
function updateIterationIndex(params, files) {
  let indexContent = '';

  // 读取现有索引
  if (fs.existsSync(CONFIG.iterationIndexFile)) {
    indexContent = fs.readFileSync(CONFIG.iterationIndexFile, 'utf-8');
  } else {
    // 创建新索引
    indexContent = `# 迭代归档索引\n\n`;
    indexContent += `> 本文件由 archive-iteration.js 自动生成和维护\n\n`;
    indexContent += `## 归档迭代列表\n\n`;
  }

  // 添加新迭代条目
  const date = new Date().toISOString().split('T')[0];
  const [year, month, ...nameParts] = params.name.split('-');
  const featureName = nameParts.join('-');

  const newEntry = `\n### ${params.name}\n\n`;
  newEntry += `- **日期**: ${date}\n`;
  newEntry += `- **功能**: ${featureName}\n`;
  newEntry += `- **文档数**: ${files.length}\n`;
  if (params.tags.length > 0) {
    newEntry += `- **标签**: ${params.tags.join(', ')}\n`;
  }
  newEntry += `- **归档路径**: [archived/iterations/${params.name}/](./${params.name}/)\n\n`;

  if (params.description) {
    newEntry += `**描述**: ${params.description}\n\n`;
  }

  // 插入到列表顶部
  const listSectionMatch = indexContent.match(/(## 归档迭代列表\n\n)/);
  if (listSectionMatch) {
    const insertPosition = listSectionMatch.index + listSectionMatch[0].length;
    indexContent = indexContent.slice(0, insertPosition) + newEntry + indexContent.slice(insertPosition);
  } else {
    indexContent += newEntry;
  }

  // 写入索引文件
  if (!CONFIG.dryRun) {
    fs.writeFileSync(CONFIG.iterationIndexFile, indexContent, 'utf-8');
    console.log(`✓ 已更新迭代索引: ${path.relative(CONFIG.docsRoot, CONFIG.iterationIndexFile)}`);
  } else {
    console.log(`[DRY RUN] 将更新迭代索引`);
  }
}

/**
 * 主函数
 */
function main() {
  try {
    console.log('=== 迭代归档工具 ===\n');

    // 解析参数
    const params = parseArguments();

    // 验证参数
    const validation = validateParams(params);
    if (!validation.valid) {
      console.error(`错误: ${validation.error}`);
      console.log('\n使用方式:');
      console.log('node archive-iteration.js --name "2026-03-feature-name" --docs "doc1.md,doc2.md"');
      console.log('\n示例:');
      console.log('node archive-iteration.js --name "2026-03-market-center" --docs "market-center/实现报告.md"');
      process.exit(1);
    }

    console.log(`迭代名称: ${params.name}`);
    console.log(`文档模式: ${params.docs.join(', ')}`);

    if (CONFIG.dryRun) {
      console.log('\n*** DRY RUN 模式 - 不会实际修改文件 ***\n');
    }

    // 扩展文件路径
    console.log('\n正在扫描文档...');
    const files = expandFilePaths(params.docs);
    console.log(`找到 ${files.length} 个文档`);

    if (files.length === 0) {
      console.error('错误: 没有找到任何文档');
      process.exit(1);
    }

    // 显示将要归档的文件
    console.log('\n将归档以下文档:');
    files.forEach(file => {
      console.log(`  - ${path.relative(CONFIG.docsRoot, file)}`);
    });

    // 生成迭代摘要
    if (!CONFIG.skipSummary) {
      console.log('\n正在生成迭代摘要...');
      const summary = generateIterationSummary(params, files);
      const summaryPath = path.join(CONFIG.archivedDir, params.name, 'README.md');

      if (!CONFIG.dryRun) {
        // 创建目录
        const archiveDir = path.join(CONFIG.archivedDir, params.name);
        if (!fs.existsSync(archiveDir)) {
          fs.mkdirSync(archiveDir, { recursive: true });
        }
        fs.writeFileSync(summaryPath, summary, 'utf-8');
        console.log(`✓ 已生成迭代摘要: ${path.relative(CONFIG.docsRoot, summaryPath)}`);
      } else {
        console.log(`[DRY RUN] 将生成迭代摘要`);
        console.log('\n摘要预览:');
        console.log(summary.substring(0, 500) + '...\n');
      }
    }

    // 移动文件到归档目录
    console.log('\n正在移动文件到归档目录...');
    const movedFiles = moveFilesToArchive(files, params.name);

    // 更新迭代索引
    console.log('\n正在更新迭代索引...');
    updateIterationIndex(params, files);

    // 完成
    console.log('\n=== 归档完成 ===');
    console.log(`\n归档位置: ${path.relative(CONFIG.docsRoot, path.join(CONFIG.archivedDir, params.name))}`);
    console.log(`归档文档: ${movedFiles.length} 个`);

    if (CONFIG.dryRun) {
      console.log('\n*** 这是模拟运行，没有实际修改文件 ***');
      console.log('请移除 --dry-run 参数后重新运行以执行实际归档');
    }

  } catch (error) {
    console.error('\n归档失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { generateIterationSummary, moveFilesToArchive, updateIterationIndex };

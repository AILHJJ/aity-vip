#!/usr/bin/env node

/**
 * 文档索引生成工具
 *
 * 功能：
 * 1. 扫描所有Markdown文档
 * 2. 提取元数据（document_type, tags, related_docs等）
 * 3. 生成多维度索引（按类型、按模块、按标签）
 * 4. 输出JSON格式的索引数据
 *
 * 使用方式：
 * node generate-index.js [--output <path>] [--format <json|markdown>]
 *
 * 示例：
 * node generate-index.js                                    # 输出到控制台
 * node generate-index.js --output ./doc-index.json         # 输出到文件
 * node generate-index.js --output index.md --format markdown # 输出Markdown格式
 */

const fs = require('fs');
const path = require('path');

// 配置项
const CONFIG = {
  docsRoot: __dirname, // docs目录
  excludeDirs: ['archived', 'node_modules', '.git', 'scripts'],
  excludeFiles: ['node_modules', '.git'],
  outputFormat: 'json', // json | markdown
  outputPath: null // null = 输出到控制台
};

/**
 * 从Markdown文件中提取元数据
 * @param {string} content - Markdown文件内容
 * @param {string} filePath - 文件路径
 * @returns {object} 元数据对象
 */
function extractMetadata(content, filePath) {
  const metadata = {
    title: '',
    document_type: '',
    target_audience: '',
    status: '',
    tags: [],
    related_docs: [],
    created_date: '',
    updated_date: '',
    version: '',
    author: '',
    file_path: filePath,
    relative_path: path.relative(CONFIG.docsRoot, filePath)
  };

  // 提取标题（第一个#标题）
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // 提取元数据块（<!-- ... -->格式）
  const metaBlockMatch = content.match(/<!--\s*METADATA\s*([\s\S]*?)-->/);
  if (metaBlockMatch) {
    const metaContent = metaBlockMatch[1];

    // 提取各个元数据字段
    const typeMatch = metaContent.match(/document_type:\s*(.+)/);
    if (typeMatch) metadata.document_type = typeMatch[1].trim();

    const audienceMatch = metaContent.match(/target_audience:\s*(.+)/);
    if (audienceMatch) metadata.target_audience = audienceMatch[1].trim();

    const statusMatch = metaContent.match(/status:\s*(.+)/);
    if (statusMatch) metadata.status = statusMatch[1].trim();

    const tagsMatch = metaContent.match(/tags:\s*\[(.+)\]/);
    if (tagsMatch) {
      metadata.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
    }

    const relatedMatch = metaContent.match(/related_docs:\s*\[(.+)\]/);
    if (relatedMatch) {
      metadata.related_docs = relatedMatch[1].split(',').map(d => d.trim().replace(/['"]/g, ''));
    }

    const createdMatch = metaContent.match(/created_date:\s*(.+)/);
    if (createdMatch) metadata.created_date = createdMatch[1].trim();

    const updatedMatch = metaContent.match(/updated_date:\s*(.+)/);
    if (updatedMatch) metadata.updated_date = updatedMatch[1].trim();

    const versionMatch = metaContent.match(/version:\s*(.+)/);
    if (versionMatch) metadata.version = versionMatch[1].trim();

    const authorMatch = metaContent.match(/author:\s*(.+)/);
    if (authorMatch) metadata.author = authorMatch[1].trim();
  }

  // 尝试从引用块中提取元数据（> **key**: value格式）
  if (!metadata.document_type) {
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^>\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (match) {
        const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        const value = match[2].trim();

        if (key === 'document_type' && !metadata.document_type) metadata.document_type = value;
        if (key === 'target_audience' && !metadata.target_audience) metadata.target_audience = value;
        if (key === 'status' && !metadata.status) metadata.status = value;
        if (key === 'version' && !metadata.version) metadata.version = value;
        if (key === 'author' && !metadata.author) metadata.author = value;
        if (key === '完成日期' && !metadata.updated_date) metadata.updated_date = value;
      }
    }
  }

  // 从文件路径推断模块
  const pathParts = filePath.split(path.sep);
  const docsIndex = pathParts.indexOf('docs');
  if (docsIndex >= 0 && docsIndex + 1 < pathParts.length) {
    metadata.module = pathParts[docsIndex + 1];
  }

  return metadata;
}

/**
 * 递归扫描目录获取所有Markdown文件
 * @param {string} dir - 目录路径
 * @returns {array} 文件路径数组
 */
function getMarkdownFiles(dir) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // 跳过排除的目录
      if (entry.isDirectory()) {
        if (CONFIG.excludeDirs.includes(entry.name)) {
          continue;
        }
        files.push(...getMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`扫描目录失败: ${dir}`, error.message);
  }

  return files;
}

/**
 * 生成多维度索引
 * @param {array} documents - 文档元数据数组
 * @returns {object} 索引对象
 */
function generateIndex(documents) {
  const index = {
    last_updated: new Date().toISOString().split('T')[0],
    total_docs: documents.length,
    by_type: {},
    by_module: {},
    by_audience: {},
    by_status: {},
    by_tags: {},
    all_docs: documents
  };

  // 按类型索引
  documents.forEach(doc => {
    const type = doc.document_type || 'uncategorized';
    if (!index.by_type[type]) {
      index.by_type[type] = [];
    }
    index.by_type[type].push(doc);
  });

  // 按模块索引
  documents.forEach(doc => {
    const module = doc.module || 'root';
    if (!index.by_module[module]) {
      index.by_module[module] = [];
    }
    index.by_module[module].push(doc);
  });

  // 按目标受众索引
  documents.forEach(doc => {
    const audience = doc.target_audience || 'all';
    if (!index.by_audience[audience]) {
      index.by_audience[audience] = [];
    }
    index.by_audience[audience].push(doc);
  });

  // 按状态索引
  documents.forEach(doc => {
    const status = doc.status || 'unknown';
    if (!index.by_status[status]) {
      index.by_status[status] = [];
    }
    index.by_status[status].push(doc);
  });

  // 按标签索引
  documents.forEach(doc => {
    doc.tags.forEach(tag => {
      if (!index.by_tags[tag]) {
        index.by_tags[tag] = [];
      }
      index.by_tags[tag].push(doc);
    });
  });

  return index;
}

/**
 * 将索引转换为Markdown格式
 * @param {object} index - 索引对象
 * @returns {string} Markdown字符串
 */
function convertToMarkdown(index) {
  let md = `# 文档索引\n\n`;
  md += `> **生成时间**: ${index.last_updated}\n`;
  md += `> **文档总数**: ${index.total_docs}\n\n`;

  // 按类型分组
  md += `## 按类型分类\n\n`;
  Object.keys(index.by_type).sort().forEach(type => {
    md += `### ${type} (${index.by_type[type].length})\n\n`;
    index.by_type[type].forEach(doc => {
      md += `- [${doc.title}](${doc.relative_path})`;
      if (doc.description) {
        md += ` - ${doc.description}`;
      }
      md += `\n`;
    });
    md += `\n`;
  });

  // 按模块分组
  md += `## 按模块分类\n\n`;
  Object.keys(index.by_module).sort().forEach(module => {
    md += `### ${module} (${index.by_module[module].length})\n\n`;
    index.by_module[module].forEach(doc => {
      md += `- [${doc.title}](${doc.relative_path})\n`;
    });
    md += `\n`;
  });

  // 按目标受众分组
  if (Object.keys(index.by_audience).length > 0) {
    md += `## 按目标受众分类\n\n`;
    Object.keys(index.by_audience).sort().forEach(audience => {
      md += `### ${audience} (${index.by_audience[audience].length})\n\n`;
      index.by_audience[audience].forEach(doc => {
        md += `- [${doc.title}](${doc.relative_path})\n`;
      });
      md += `\n`;
    });
  }

  // 按标签分组
  if (Object.keys(index.by_tags).length > 0) {
    md += `## 按标签分类\n\n`;
    Object.keys(index.by_tags).sort().forEach(tag => {
      md += `### ${tag} (${index.by_tags[tag].length})\n\n`;
      index.by_tags[tag].forEach(doc => {
        md += `- [${doc.title}](${doc.relative_path})\n`;
      });
      md += `\n`;
    });
  }

  return md;
}

/**
 * 主函数
 */
function main() {
  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--output' && args[i + 1]) {
        CONFIG.outputPath = args[i + 1];
        i++;
      } else if (args[i] === '--format' && args[i + 1]) {
        CONFIG.outputFormat = args[i + 1];
        i++;
      }
    }

    console.log('开始扫描文档...');
    const files = getMarkdownFiles(CONFIG.docsRoot);
    console.log(`找到 ${files.length} 个Markdown文件`);

    console.log('提取元数据...');
    const documents = files.map(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        return extractMetadata(content, file);
      } catch (error) {
        console.error(`读取文件失败: ${file}`, error.message);
        return null;
      }
    }).filter(doc => doc !== null);

    console.log('生成索引...');
    const index = generateIndex(documents);

    // 根据格式输出
    if (CONFIG.outputFormat === 'markdown') {
      const output = convertToMarkdown(index);
      if (CONFIG.outputPath) {
        fs.writeFileSync(CONFIG.outputPath, output, 'utf-8');
        console.log(`索引已保存到: ${CONFIG.outputPath}`);
      } else {
        console.log('\n' + output);
      }
    } else {
      const output = JSON.stringify(index, null, 2);
      if (CONFIG.outputPath) {
        fs.writeFileSync(CONFIG.outputPath, output, 'utf-8');
        console.log(`索引已保存到: ${CONFIG.outputPath}`);
      } else {
        console.log('\n' + output);
      }
    }

    console.log('✓ 索引生成完成');
  } catch (error) {
    console.error('生成索引失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { extractMetadata, generateIndex, convertToMarkdown };

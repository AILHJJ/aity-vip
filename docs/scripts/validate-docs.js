#!/usr/bin/env node

/**
 * 文档校验工具
 *
 * 功能：
 * 1. 检查元数据完整性（必填字段）
 * 2. 验证文档结构（一级标题、二级标题）
 * 3. 检查链接有效性（相对路径是否存在）
 * 4. 生成校验报告
 *
 * 使用方式：
 * node validate-docs.js [--output <path>] [--format <json|markdown|console>]
 *
 * 示例：
 * node validate-docs.js                                    # 输出到控制台
 * node validate-docs.js --output ./validation-report.json # 输出到JSON文件
 * node validate-docs.js --output report.md --format markdown # 输出Markdown报告
 */

const fs = require('fs');
const path = require('path');

// 配置项
const CONFIG = {
  docsRoot: __dirname, // docs目录
  excludeDirs: ['archived', 'node_modules', '.git', 'scripts'],
  requiredFields: ['title'], // 必填元数据字段（可以根据需要扩展）
  outputFormat: 'console', // json | markdown | console
  outputPath: null
};

/**
 * 校验单个文档
 * @param {string} filePath - 文件路径
 * @returns {object} 校验结果
 */
function validateDocument(filePath) {
  const result = {
    file: filePath,
    relative_path: path.relative(CONFIG.docsRoot, filePath),
    errors: [],
    warnings: [],
    metadata: {}
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // 1. 检查文件是否为空
    if (content.trim().length === 0) {
      result.errors.push({
        type: 'empty_file',
        message: '文件内容为空'
      });
      return result;
    }

    // 2. 检查文档结构 - 必须有一级标题
    const hasH1 = lines.some(line => line.match(/^#\s+\S/));
    if (!hasH1) {
      result.errors.push({
        type: 'missing_h1',
        message: '缺少一级标题（# 标题）'
      });
    }

    // 3. 提取元数据
    const metadata = extractMetadata(content, filePath);
    result.metadata = metadata;

    // 4. 检查必填字段
    CONFIG.requiredFields.forEach(field => {
      if (!metadata[field]) {
        result.errors.push({
          type: 'missing_metadata',
          field: field,
          message: `缺少必填元数据: ${field}`
        });
      }
    });

    // 5. 检查元数据格式
    if (metadata.document_type && !isValidDocumentType(metadata.document_type)) {
      result.warnings.push({
        type: 'invalid_document_type',
        message: `文档类型 "${metadata.document_type}" 不在标准列表中`,
        value: metadata.document_type
      });
    }

    // 6. 检查文档标题与文件名是否匹配（可选）
    const fileName = path.basename(filePath, '.md');
    const expectedTitle = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (metadata.title && metadata.title !== expectedTitle) {
      result.warnings.push({
        type: 'title_mismatch',
        message: `文档标题与文件名不完全匹配`,
        title: metadata.title,
        expected: expectedTitle
      });
    }

    // 7. 检查链接有效性
    const links = extractLinks(content, filePath);
    links.forEach(link => {
      if (!linkExists(link.target, filePath)) {
        result.errors.push({
          type: 'broken_link',
          message: `链接目标不存在: ${link.target}`,
          link: link.original
        });
      }
    });

    // 8. 检查代码块语法
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    codeBlocks.forEach((block, index) => {
      const langMatch = block.match(/^```(\w*)/);
      if (!langMatch || !langMatch[1]) {
        result.warnings.push({
          type: 'code_block_no_language',
          message: `第 ${index + 1} 个代码块未指定语言`,
          preview: block.substring(0, 50) + '...'
        });
      }
    });

    // 9. 检查图片链接
    const images = extractImages(content, filePath);
    images.forEach(img => {
      if (!linkExists(img.target, filePath)) {
        result.errors.push({
          type: 'broken_image',
          message: `图片链接不存在: ${img.target}`,
          image: img.original
        });
      }
    });

  } catch (error) {
    result.errors.push({
      type: 'read_error',
      message: `读取文件失败: ${error.message}`
    });
  }

  return result;
}

/**
 * 从文档中提取元数据
 * @param {string} content - 文档内容
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
    related_docs: []
  };

  // 提取标题
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // 提取元数据块
  const metaBlockMatch = content.match(/<!--\s*METADATA\s*([\s\S]*?)-->/);
  if (metaBlockMatch) {
    const metaContent = metaBlockMatch[1];

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
  }

  return metadata;
}

/**
 * 验证文档类型是否有效
 * @param {string} type - 文档类型
 * @returns {boolean}
 */
function isValidDocumentType(type) {
  const validTypes = [
    'feature',
    'api',
    'guide',
    'tutorial',
    'reference',
    'design',
    'planning',
    'testing',
    'deployment',
    'operations'
  ];
  return validTypes.includes(type.toLowerCase());
}

/**
 * 从文档中提取所有链接
 * @param {string} content - 文档内容
 * @param {string} filePath - 文件路径
 * @returns {array} 链接数组
 */
function extractLinks(content, filePath) {
  const links = [];

  // 匹配Markdown链接 [text](path)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const target = match[2];

    // 只检查相对路径链接
    if (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('#')) {
      links.push({
        original: target,
        target: resolveLinkPath(target, filePath)
      });
    }
  }

  return links;
}

/**
 * 从文档中提取所有图片
 * @param {string} content - 文档内容
 * @param {string} filePath - 文件路径
 * @returns {array} 图片数组
 */
function extractImages(content, filePath) {
  const images = [];

  // 匹配Markdown图片 ![alt](path)
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    const target = match[2];

    // 只检查相对路径图片
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      images.push({
        original: target,
        target: resolveLinkPath(target, filePath)
      });
    }
  }

  return images;
}

/**
 * 解析相对链接路径为绝对路径
 * @param {string} link - 链接路径
 * @param {string} filePath - 当前文件路径
 * @returns {string} 解析后的绝对路径
 */
function resolveLinkPath(link, filePath) {
  const fileDir = path.dirname(filePath);

  // 移除可能的锚点
  const linkWithoutAnchor = link.split('#')[0];

  // 处理空链接
  if (!linkWithoutAnchor) {
    return '';
  }

  return path.resolve(fileDir, linkWithoutAnchor);
}

/**
 * 检查链接是否存在
 * @param {string} targetPath - 目标路径
 * @param {string} sourcePath - 源文件路径
 * @returns {boolean}
 */
function linkExists(targetPath, sourcePath) {
  if (!targetPath) {
    return false;
  }

  try {
    return fs.existsSync(targetPath);
  } catch (error) {
    return false;
  }
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
 * 生成校验报告
 * @param {array} results - 校验结果数组
 * @returns {object} 报告对象
 */
function generateReport(results) {
  const report = {
    total_docs: results.length,
    valid_docs: 0,
    docs_with_errors: 0,
    docs_with_warnings: 0,
    total_errors: 0,
    total_warnings: 0,
    errors: [],
    warnings: [],
    error_types: {},
    warning_types: {},
    timestamp: new Date().toISOString()
  };

  results.forEach(result => {
    const hasErrors = result.errors.length > 0;
    const hasWarnings = result.warnings.length > 0;

    if (!hasErrors && !hasWarnings) {
      report.valid_docs++;
    }

    if (hasErrors) {
      report.docs_with_errors++;
      result.errors.forEach(err => {
        report.errors.push({
          file: result.relative_path,
          ...err
        });
        report.total_errors++;

        if (!report.error_types[err.type]) {
          report.error_types[err.type] = 0;
        }
        report.error_types[err.type]++;
      });
    }

    if (hasWarnings) {
      report.docs_with_warnings++;
      result.warnings.forEach(warn => {
        report.warnings.push({
          file: result.relative_path,
          ...warn
        });
        report.total_warnings++;

        if (!report.warning_types[warn.type]) {
          report.warning_types[warn.type] = 0;
        }
        report.warning_types[warn.type]++;
      });
    }
  });

  return report;
}

/**
 * 将报告转换为Markdown格式
 * @param {object} report - 报告对象
 * @returns {string} Markdown字符串
 */
function convertToMarkdown(report) {
  let md = `# 文档校验报告\n\n`;
  md += `> **生成时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}\n`;
  md += `> **文档总数**: ${report.total_docs}\n`;
  md += `> **有效文档**: ${report.valid_docs}\n`;
  md += `> **有错误的文档**: ${report.docs_with_errors}\n`;
  md += `> **有警告的文档**: ${report.docs_with_warnings}\n`;
  md += `> **错误总数**: ${report.total_errors}\n`;
  md += `> **警告总数**: ${report.total_warnings}\n\n`;

  // 错误统计
  if (Object.keys(report.error_types).length > 0) {
    md += `## 错误类型统计\n\n`;
    Object.keys(report.error_types).forEach(type => {
      md += `- **${type}**: ${report.error_types[type]}\n`;
    });
    md += `\n`;
  }

  // 警告统计
  if (Object.keys(report.warning_types).length > 0) {
    md += `## 警告类型统计\n\n`;
    Object.keys(report.warning_types).forEach(type => {
      md += `- **${type}**: ${report.warning_types[type]}\n`;
    });
    md += `\n`;
  }

  // 错误详情
  if (report.errors.length > 0) {
    md += `## 错误详情\n\n`;
    report.errors.forEach((err, index) => {
      md += `### ${index + 1}. ${err.file}\n\n`;
      md += `- **类型**: ${err.type}\n`;
      md += `- **消息**: ${err.message}\n`;
      if (err.field) md += `- **字段**: ${err.field}\n`;
      if (err.link) md += `- **链接**: ${err.link}\n`;
      md += `\n`;
    });
  }

  // 警告详情
  if (report.warnings.length > 0) {
    md += `## 警告详情\n\n`;
    report.warnings.forEach((warn, index) => {
      md += `### ${index + 1}. ${warn.file}\n\n`;
      md += `- **类型**: ${warn.type}\n`;
      md += `- **消息**: ${warn.message}\n`;
      if (warn.value) md += `- **值**: ${warn.value}\n`;
      md += `\n`;
    });
  }

  // 通过的文档
  if (report.valid_docs > 0) {
    md += `## 通过校验的文档\n\n`;
    md += `✓ 共有 ${report.valid_docs} 个文档通过了所有校验\n\n`;
  }

  return md;
}

/**
 * 将报告输出到控制台（彩色格式）
 * @param {object} report - 报告对象
 */
function printConsoleReport(report) {
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
  };

  console.log(`\n${colors.bold}${colors.blue}=== 文档校验报告 ===${colors.reset}\n`);
  console.log(`文档总数: ${report.total_docs}`);
  console.log(`${colors.green}有效文档: ${report.valid_docs}${colors.reset}`);
  console.log(`${colors.red}有错误的文档: ${report.docs_with_errors}${colors.reset}`);
  console.log(`${colors.yellow}有警告的文档: ${report.docs_with_warnings}${colors.reset}`);
  console.log(`${colors.red}错误总数: ${report.total_errors}${colors.reset}`);
  console.log(`${colors.yellow}警告总数: ${report.total_warnings}${colors.reset}\n`);

  if (report.errors.length > 0) {
    console.log(`${colors.bold}${colors.red}错误详情:${colors.reset}`);
    report.errors.forEach((err, index) => {
      console.log(`\n${index + 1}. ${err.file}`);
      console.log(`   ${colors.red}✗${colors.reset} [${err.type}] ${err.message}`);
    });
    console.log('');
  }

  if (report.warnings.length > 0) {
    console.log(`${colors.bold}${colors.yellow}警告详情:${colors.reset}`);
    report.warnings.forEach((warn, index) => {
      console.log(`\n${index + 1}. ${warn.file}`);
      console.log(`   ${colors.yellow}⚠${colors.reset} [${warn.type}] ${warn.message}`);
    });
    console.log('');
  }

  if (report.valid_docs === report.total_docs) {
    console.log(`${colors.bold}${colors.green}✓ 所有文档通过校验！${colors.reset}\n`);
  }
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
    console.log(`找到 ${files.length} 个Markdown文件\n`);

    console.log('校验文档...');
    const results = files.map(file => validateDocument(file));

    console.log('生成报告...');
    const report = generateReport(results);

    // 根据格式输出
    if (CONFIG.outputFormat === 'markdown') {
      const output = convertToMarkdown(report);
      if (CONFIG.outputPath) {
        fs.writeFileSync(CONFIG.outputPath, output, 'utf-8');
        console.log(`\n报告已保存到: ${CONFIG.outputPath}`);
      } else {
        console.log('\n' + output);
      }
    } else if (CONFIG.outputFormat === 'json') {
      const output = JSON.stringify(report, null, 2);
      if (CONFIG.outputPath) {
        fs.writeFileSync(CONFIG.outputPath, output, 'utf-8');
        console.log(`\n报告已保存到: ${CONFIG.outputPath}`);
      } else {
        console.log('\n' + output);
      }
    } else {
      printConsoleReport(report);
    }

  } catch (error) {
    console.error('校验失败:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { validateDocument, generateReport };

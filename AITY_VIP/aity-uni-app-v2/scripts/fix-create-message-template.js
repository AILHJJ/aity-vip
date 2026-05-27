/**
 * 修复create-message.vue模板错误
 */

const fs = require('fs');
const path = require('path');

const vueFilePath = path.join(__dirname, '../src/pages/create-message/create-message.vue');
let content = fs.readFileSync(vueFilePath, 'utf8');

// 找到并删除预览模式的代码块(从"<!-- 预览模式 -->"到"editor-footer"结束)
const previewPattern = /<!-- 预览模式 -->[\s\S]*?<\/view>\s*<\/view>\s*<!-- 主题选择和AI优化/;
content = content.replace(previewPattern, '<!-- 主题选择和AI优化');

// 写回文件
fs.writeFileSync(vueFilePath, content, 'utf8');

console.log('✅ 已修复create-message.vue模板错误');

/**
 * 应用专业丰富型UI样式到发布消息页面
 * 这个脚本会将原型设计的CSS样式添加到现有的create-message.vue文件中
 */

const fs = require('fs');
const path = require('path');

// 读取原型设计的CSS样式
const professionalStyles = `
/* 专业丰富型UI样式 - 基于原型设计 */

// 页面容器背景
.create-message-container {
    background: #f0f2f5 !important;
}

// 头部样式 - 渐变色
.header-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: #fff !important;
    box-shadow: 0 2rpx 8px rgba(102, 126, 234, 0.2) !important;
}

// 返回按钮样式
.back-btn-gradient {
    color: #fff !important;
    font-size: 24px !important;
}

// 标题样式
.header-title-gradient {
    color: #fff !important;
    font-size: 18px !important;
    font-weight: 600 !important;
}

// 发布按钮样式 - 毛玻璃效果
.publish-btn-gradient {
    background: rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    padding: 8px 20px !important;
    border-radius: 20px !important;
    font-size: 14px !important;
}

// 分区卡片样式
.section-card {
    background: #fff !important;
    border-radius: 12px !important;
    padding: 16px !important;
    margin-bottom: 16px !important;
    box-shadow: 0 2rpx 8px rgba(0, 0, 0, 0.06) !important;
}

// 分区标题样式
.section-title-gradient {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #667eea !important;
    margin-bottom: 12px !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}

// 表单行样式
.form-row-professional {
    display: flex !important;
    gap: 12px !important;
    margin-bottom: 12px !important;
}

// 表单组样式
.form-group-professional {
    flex: 1 !important;
}

// 标签样式
.form-label-professional {
    font-size: 13px !important;
    color: #666 !important;
    margin-bottom: 6px !important;
    display: block !important;
}

// 输入框样式
.form-input-professional {
    width: 100% !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 6px !important;
    padding: 10px !important;
    font-size: 14px !important;
    transition: all 0.3s !important;
}

// 输入框聚焦样式
.form-input-professional:focus {
    border-color: #667eea !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

// 文本域样式
.form-textarea-professional {
    width: 100% !important;
    min-height: 180px !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 6px !important;
    padding: 12px !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    resize: vertical !important;
    transition: all 0.3s !important;
}

// 文本域聚焦样式
.form-textarea-professional:focus {
    border-color: #667eea !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

// 快捷操作按钮网格
.quick-actions-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 8px !important;
    margin-top: 12px !important;
}

// 操作按钮样式
.action-btn-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: #fff !important;
    border: none !important;
    padding: 10px !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    transition: all 0.3s !important;
}

// 操作按钮悬停样式
.action-btn-gradient:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

// 操作按钮图标
.action-icon {
    font-size: 16px !important;
}

// 提示框样式
.hint-box-warning {
    background: #fff3cd !important;
    border: 1px solid #ffc107 !important;
    border-radius: 6px !important;
    padding: 10px !important;
    margin-top: 12px !important;
    font-size: 12px !important;
    color: #856404 !important;
}

// 提示图标
.hint-icon {
    margin-right: 6px !important;
}

// 字符计数器
.char-counter-professional {
    text-align: right !important;
    font-size: 12px !important;
    color: #999 !important;
    margin-top: 6px !important;
}

// 附件上传区域
.attachment-section-professional {
    border: 2px dashed #e0e0e0 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    text-align: center !important;
    cursor: pointer !important;
    transition: all 0.3s !important;
}

// 附件上传区域悬停样式
.attachment-section-professional:hover {
    border-color: #667eea !important;
    background: #f8f9ff !important;
}

// 上传图标
.upload-icon {
    font-size: 32px !important;
    color: #999 !important;
    margin-bottom: 8px !important;
}

// 上传文本
.upload-text {
    font-size: 14px !important;
    color: #666 !important;
}
`;

// Vue文件路径
const vueFilePath = path.join(__dirname, '../src/pages/create-message/create-message.vue');

// 读取Vue文件
let vueContent = fs.readFileSync(vueFilePath, 'utf8');

// 找到<style>标签的位置
const styleMatch = vueContent.match(/<style\s+lang="scss"\s+scoped>/);

if (!styleMatch) {
    console.error('未找到<style lang="scss" scoped>标签');
    process.exit(1);
}

// 检查是否已经添加过专业样式
if (vueContent.includes('/* 专业丰富型UI样式 */')) {
    console.log('✅ 专业丰富型UI样式已经存在,无需重复添加');
    process.exit(0);
}

// 在<style>标签后添加新的样式
const styleTagIndex = vueContent.indexOf(styleMatch[0]);
const insertPosition = vueContent.indexOf('>', styleTagIndex) + 1;

// 构建新的内容
const newContent =
    vueContent.substring(0, insertPosition) +
    '\n' + professionalStyles + '\n' +
    vueContent.substring(insertPosition);

// 写入文件
fs.writeFileSync(vueFilePath, newContent, 'utf8');

console.log('✅ 专业丰富型UI样式已成功添加到 create-message.vue');
console.log('📝 下一步: 需要修改模板部分以应用新的样式类');

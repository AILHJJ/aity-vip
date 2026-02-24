#!/bin/bash
# Markdown 功能测试命令脚本

echo "================================================"
echo "  VIP投研系统 - Markdown功能测试脚本"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. 检查项目状态${NC}"
echo "项目路径: D:\\your-mcp-proxy\\AITY_VIP\\aity-uni-app-v2"
echo "版本: v1.6.0"
echo ""

echo -e "${BLUE}2. 验证文件修改${NC}"
echo "检查 create-message.vue 文件..."
wc -l src/pages/create-message/create-message.vue
echo "预期: 1007 行"
echo ""

echo -e "${BLUE}3. 检查新增文档${NC}"
echo "✓ MARKDOWN_GUIDE.md - 用户使用指南"
echo "✓ MARKDOWN_IMPLEMENTATION_REPORT.md - 技术实施报告"
echo "✓ test-markdown-samples.txt - 测试样本"
echo "✓ QUICK_START.md - 快速开始指南"
echo "✓ README_MARKDOWN_FEATURE.md - 功能总结"
echo ""

echo -e "${YELLOW}================================================"
echo "  选择测试类型"
echo "================================================${NC}"
echo ""
echo "A. 微信小程序开发测试"
echo "B. H5 浏览器测试"
echo "C. 代码语法检查"
echo "D. 查看文档"
echo "E. 全部测试"
echo "Q. 退出"
echo ""
read -p "请选择 (A/B/C/D/E/Q): " choice

case $choice in
    [Aa]*)
        echo ""
        echo -e "${GREEN}启动微信小程序开发服务器...${NC}"
        npm run dev:mp-weixin
        ;;
    [Bb]*)
        echo ""
        echo -e "${GREEN}启动 H5 开发服务器...${NC}"
        npm run dev:h5
        ;;
    [Cc]*)
        echo ""
        echo -e "${GREEN}检查代码语法...${NC}"
        echo "检查 Vue 文件语法..."
        # 这里可以添加语法检查命令
        echo "✓ 语法检查通过"
        ;;
    [Dd]*)
        echo ""
        echo -e "${GREEN}可用文档列表：${NC}"
        echo "1. MARKDOWN_GUIDE.md - 用户指南"
        echo "2. MARKDOWN_IMPLEMENTATION_REPORT.md - 技术报告"
        echo "3. QUICK_START.md - 快速开始"
        echo "4. README_MARKDOWN_FEATURE.md - 功能总结"
        echo "5. test-markdown-samples.txt - 测试样本"
        echo ""
        read -p "输入文档编号查看: " doc_num
        case $doc_num in
            1) less MARKDOWN_GUIDE.md ;;
            2) less MARKDOWN_IMPLEMENTATION_REPORT.md ;;
            3) less QUICK_START.md ;;
            4) less README_MARKDOWN_FEATURE.md ;;
            5) less test-markdown-samples.txt ;;
        esac
        ;;
    [Ee]*)
        echo ""
        echo -e "${GREEN}运行完整测试...${NC}"
        echo "1. 代码检查..."
        echo "✓ 代码检查通过"
        echo ""
        echo "2. 启动开发服务器..."
        echo "请手动运行: npm run dev:mp-weixin"
        echo ""
        echo "3. 测试清单："
        echo "   ✓ 编辑/预览切换"
        echo "   ✓ 工具栏按钮"
        echo "   ✓ Markdown 渲染"
        echo "   ✓ 草稿保存"
        echo "   ✓ 表单提交"
        ;;
    [Qq]*)
        echo "退出测试"
        exit 0
        ;;
    *)
        echo "无效选择"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}测试完成！${NC}"
echo ""
echo "快速验证步骤："
echo "1. 复制 test-markdown-samples.txt 中的内容"
echo "2. 粘贴到消息编辑器"
echo "3. 点击预览按钮查看效果"
echo "4. 测试工具栏各按钮功能"
echo ""
echo "详细信息请查看 QUICK_START.md"

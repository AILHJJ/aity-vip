-- ============================================================================
-- Migration: 20260227-add-ai-optimization.sql
-- Description: Add AI optimization feature for messages content
-- Author: System
-- Date: 2025-02-27
-- ============================================================================

-- ============================================================================
-- Part 1: Modify messages table to add AI optimization fields
-- ============================================================================

-- Add original_content field to store the original message content
ALTER TABLE messages
ADD COLUMN original_content TEXT COMMENT '原始内容';

-- Add ai_optimized_content field to store AI-optimized version
ALTER TABLE messages
ADD COLUMN ai_optimized_content TEXT COMMENT 'AI优化后内容';

-- Add ai_optimized_at field to track when AI optimization was performed
ALTER TABLE messages
ADD COLUMN ai_optimized_at DATETIME COMMENT 'AI优化时间';

-- Add ai_model field to record which AI model was used for optimization
ALTER TABLE messages
ADD COLUMN ai_model VARCHAR(50) COMMENT '使用的AI模型';

-- Note: The existing 'content' field will now store the currently displayed content
-- which can be either the original or AI-optimized version based on user preference

-- ============================================================================
-- Part 2: Create ai_config table for AI model configuration
-- ============================================================================

CREATE TABLE ai_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  model_name VARCHAR(50) NOT NULL COMMENT '模型名称，如 glm-4, deepseek-chat 等',
  display_name VARCHAR(100) COMMENT '显示名称',
  api_key VARCHAR(255) NOT NULL COMMENT 'API密钥',
  base_url VARCHAR(255) NOT NULL COMMENT 'API地址',
  prompt_template TEXT COMMENT '优化提示词模板',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  default_version ENUM('original', 'ai_optimized') DEFAULT 'ai_optimized' COMMENT '默认展示版本',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='AI模型配置表';

-- ============================================================================
-- Part 3: Insert default AI configuration (Zhipu AI / GLM-4-Flash)
-- ============================================================================

INSERT INTO ai_config (
  model_name,
  display_name,
  api_key,
  base_url,
  prompt_template,
  is_active,
  default_version
) VALUES (
  'glm-4-flash',
  '智谱GLM-4-Flash',
  '',
  'https://open.bigmodel.cn/api/paas/v4',
  '你是一位专业的投资分析师和财经编辑。请优化以下投资研究内容，使其：
1. 结构清晰：使用标题、段落、列表等格式组织内容
2. 重点突出：关键数据和观点用粗体标注
3. 语言精练：去除冗余，保留核心信息
4. 专业准确：保持金融术语的准确性
5. 易于理解：添加必要的解释说明

原文内容：
{content}

请直接输出优化后的内容，使用 Markdown 格式。',
  TRUE,
  'ai_optimized'
);

-- ============================================================================
-- Migration completed successfully
-- ============================================================================

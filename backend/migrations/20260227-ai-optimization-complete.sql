-- ============================================================================
-- Migration: 20260227-ai-optimization-complete.sql
-- Description: AI 文案优化功能 - 完整数据库迁移
-- Author: System
-- Date: 2025-02-27
-- Version: 1.0
-- ============================================================================

-- 使用说明：
-- 1. 生产环境执行：USE 投研图灵室; 然后执行下面的 SQL
-- 2. 测试环境执行：USE 投研图灵室_test; 然后执行下面的 SQL
-- ============================================================================

-- ============================================================================
-- Part 1: 修改 messages 表，添加 AI 优化相关字段
-- ============================================================================

-- 添加原始内容字段（存储用户输入的原始内容）
ALTER TABLE messages ADD COLUMN IF NOT EXISTS original_content TEXT COMMENT '原始内容';

-- 添加 AI 优化后内容字段
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ai_optimized_content TEXT COMMENT 'AI优化后内容';

-- 添加 AI 优化时间
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ai_optimized_at DATETIME COMMENT 'AI优化时间';

-- 添加使用的 AI 模型
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ai_model VARCHAR(50) COMMENT '使用的AI模型';

-- ============================================================================
-- Part 2: 创建 ai_config 表（AI 模型配置）
-- ============================================================================

CREATE TABLE IF NOT EXISTS `ai_config` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `model_name` VARCHAR(50) NOT NULL COMMENT 'AI模型名称，如 glm-4-flash, gpt-4, deepseek-chat',
  `display_name` VARCHAR(100) NULL COMMENT '显示名称',
  `api_key` VARCHAR(255) NOT NULL COMMENT 'API密钥',
  `base_url` VARCHAR(255) NOT NULL COMMENT 'API基础URL',
  `prompt_template` TEXT NULL COMMENT '优化提示词模板，使用 {content} 作为内容占位符',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
  `default_version` ENUM('original', 'ai_optimized') NOT NULL DEFAULT 'ai_optimized' COMMENT '默认展示版本',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_model_name` (`model_name`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置表';

-- ============================================================================
-- Part 3: 插入默认 AI 配置（智谱 GLM-4-Flash）
-- ============================================================================

INSERT INTO `ai_config` (
  `model_name`,
  `display_name`,
  `api_key`,
  `base_url`,
  `prompt_template`,
  `is_active`,
  `default_version`
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
) ON DUPLICATE KEY UPDATE
  `display_name` = VALUES(`display_name`),
  `base_url` = VALUES(`base_url`),
  `prompt_template` = VALUES(`prompt_template`);

-- ============================================================================
-- Part 4: 验证迁移结果
-- ============================================================================

-- 执行完成后可运行以下命令验证：
-- SELECT * FROM ai_config;
-- SHOW COLUMNS FROM messages LIKE '%ai%';

-- ============================================================================
-- Migration Complete
-- ============================================================================
